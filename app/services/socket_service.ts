import { Server } from 'socket.io'
import server from '@adonisjs/core/services/server'
import RaceEngineService from './race_engine_service.js'
import Flag from '#models/flag'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FlagColor = 'vert' | 'jaune' | 'rouge'
export type RaceStatus = 'stopped' | 'running'

export interface FlagState {
  color: FlagColor
  /** Secteurs concernés — uniquement pertinent pour 'jaune', vide sinon */
  sectors: string[]
}

export interface RaceState {
  status: RaceStatus
  startedAt: number | null
}

export interface CameraUpdatePayload {
  cameraId: number
  status: string
  sector: string
}

export interface LedUpdatePayload {
  ledId: number
  status: string
  sector: string
}

export interface LiveTimingChatMessage {
  id: string
  authorName: string
  authorInitials: string
  avatarPath?: string | null
  authorRole?: string | null
  text: string
  clientId: string
  createdAt: number
}

export interface ChatMessagePayload {
  authorName: string
  authorInitials: string
  avatarPath?: string | null
  authorRole?: string | null
  text: string
  clientId: string
}

export interface DeleteChatMessagePayload {
  messageId: string
  requesterRole: string
}

// ─── État drapeau par défaut ──────────────────────────────────────────────────

const DEFAULT_FLAG: FlagState = { color: 'vert', sectors: [] }
const DEFAULT_RACE: RaceState = { status: 'stopped', startedAt: null }

// ─── Logique de merge ─────────────────────────────────────────────────────────

/**
 * Calcule le nouvel état drapeau selon les règles métier :
 *
 * Existant \ Entrant | vert          | jaune                        | rouge
 * -------------------|---------------|------------------------------|------------------
 * rien / vert        | vert []       | jaune [+sector]              | rouge []
 * jaune              | retire sector | ajoute si absent, sinon rien | rouge []
 * rouge              | vert []       | jaune [+sector]              | rouge []
 */
function mergeFlag(current: FlagState, incomingColor: FlagColor, incomingSector: string): FlagState {
  // Normalise pour éviter les comparaisons ratées 'S1' vs 's1'
  const sector = incomingSector.toUpperCase()

  switch (current.color) {
    case 'vert': {
      if (incomingColor === 'vert') return { color: 'vert', sectors: [] }
      if (incomingColor === 'jaune') return { color: 'jaune', sectors: [sector] }
      if (incomingColor === 'rouge') return { color: 'rouge', sectors: [] }
      break
    }

    case 'jaune': {
      if (incomingColor === 'vert') {
        const next = current.sectors.filter((s) => s !== sector)
        return next.length > 0
          ? { color: 'jaune', sectors: next }
          : { color: 'vert', sectors: [] }
      }
      if (incomingColor === 'jaune') {
        if (current.sectors.includes(sector)) return current
        return { color: 'jaune', sectors: [...current.sectors, sector] }
      }
      if (incomingColor === 'rouge') return { color: 'rouge', sectors: [] }
      break
    }

    case 'rouge': {
      if (incomingColor === 'vert') return { color: 'vert', sectors: [] }
      if (incomingColor === 'jaune') return { color: 'jaune', sectors: [sector] }
      if (incomingColor === 'rouge') return { color: 'rouge', sectors: [] }
      break
    }
  }

  return current
}

// ─── Service ──────────────────────────────────────────────────────────────────

class SocketService {
  public io: Server | undefined

  /** État courant du drapeau, partagé entre toutes les connexions */
  private flagState: FlagState = { ...DEFAULT_FLAG }

  /** État courant de la course, partagé entre toutes les connexions */
  private raceState: RaceState = { ...DEFAULT_RACE }

  /** Derniers messages du chat live, partagés entre toutes les connexions */
  private chatMessages: LiveTimingChatMessage[] = []

  private chatSequence = 0

  public boot() {
    if (this.io) return

    this.io = new Server(server.getNodeServer(), {
      cors: { origin: '*' },
    })

    this.io.on('connection', async (socket) => {
      console.log('🏁 Nouveau spectateur connecté :', socket.id)

      // État initial de la course
      const currentState = RaceEngineService.getCurrentState()
      socket.emit('initial_state', {
        drivers: currentState,
        raceState: this.raceState,
        serverTime: Date.now(),
      })

      // Reconstruit l'état drapeau depuis le dernier enregistrement BDD
      // au cas où le serveur a redémarré sans FlagState en mémoire
      // APRÈS
      if (this.flagState.color === 'vert' && this.flagState.sectors.length === 0) {
        const allFlags = await Flag.query().orderBy('created_at', 'asc')
        this.flagState = allFlags.reduce<FlagState>(
          (state, flag) => mergeFlag(state, flag.color as FlagColor, flag.sector ?? ''),
          { ...DEFAULT_FLAG }
        )
      }

      // Envoie l'état courant au nouveau connecté
      socket.emit('flag_update', this.flagState)
      socket.emit('race_state_update', this.raceState)
      socket.emit('chat_history', this.chatMessages)

      socket.on('chat_message', (payload: ChatMessagePayload) => {
        const authorName = this.normalizeAuthorName(payload.authorName)
        const authorInitials = this.normalizeInitials(payload.authorInitials, authorName)
        const text = this.normalizeChatText(payload.text)

        if (!authorName || !text) return

        const message: LiveTimingChatMessage = {
          id: `${Date.now()}-${this.chatSequence++}`,
          authorName,
          authorInitials,
          avatarPath: payload.avatarPath ?? null,
          authorRole: payload.authorRole ?? null,
          text,
          clientId: payload.clientId || socket.id,
          createdAt: Date.now(),
        }

        this.chatMessages = [...this.chatMessages, message].slice(-50)
        this.io?.emit('chat_message', message)
      })

      socket.on('chat_delete_message', (payload: DeleteChatMessagePayload) => {
        if (payload.requesterRole !== 'admin') return

        this.chatMessages = this.chatMessages.filter((message) => message.id !== payload.messageId)
        this.io?.emit('chat_history', this.chatMessages)
      })

      socket.on('disconnect', () => {
        console.log('👋 Spectateur déconnecté')
      })
    })
  }

  private normalizeAuthorName(value: string): string {
    return String(value ?? '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 28)
  }

  private normalizeInitials(value: string, fallbackName: string): string {
    const normalized = String(value ?? '')
      .replace(/[^a-zA-ZÀ-ÿ0-9]/g, '')
      .trim()
      .slice(0, 3)
      .toUpperCase()
    if (normalized) return normalized

    return fallbackName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0] ?? '')
      .join('')
      .slice(0, 3)
      .toUpperCase()
  }

  private normalizeChatText(value: string): string {
    return String(value ?? '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160)
  }

  /**
   * Appelé depuis FlagsController après validation.
   * Applique la logique de merge puis broadcast le nouvel état.
   */
  public async updateFlag(incomingColor: FlagColor, incomingSector: string): Promise<FlagState> {
    this.flagState = mergeFlag(this.flagState, incomingColor, incomingSector)
    await RaceEngineService.setFlag(this.flagState)
    this.io?.emit('flag_update', this.flagState)
    return this.flagState
  }

  /**
   * Démarre la course
   */
  public async startRace(): Promise<RaceState> {
    this.raceState = {
      status: 'running',
      startedAt: Date.now(),
    }
    await RaceEngineService.startRace()
    this.io?.emit('race_state_update', this.raceState)
    return this.raceState
  }

  /**
   * Arrête la course et envoie toutes les voitures aux stands
   */
  public async stopRace(): Promise<RaceState> {
    this.raceState = {
      status: 'stopped',
      startedAt: null,
    }
    // Envoie les voitures aux stands via RaceEngineService
    await RaceEngineService.sendAllCarsToStandby()
    this.io?.emit('race_state_update', this.raceState)
    return this.raceState
  }

  public async refreshLiveTiming(): Promise<void> {
    await RaceEngineService.refreshFromConnectedObjects()
    this.io?.emit('race_update', {
      timestamp: Date.now(),
      drivers: RaceEngineService.getCurrentState(),
      raceState: this.raceState,
    })
  }

  /**
   * Diffuse un changement de statut caméra à tous les clients connectés.
   */
  public updateCamera(cameraId: number, status: string, sector: string): CameraUpdatePayload {
    const payload: CameraUpdatePayload = { cameraId, status, sector }
    this.io?.emit('camera_update', payload)
    return payload
  }

  /**
   * Diffuse un changement de statut LED à tous les clients connectés.
   */
  public updateLed(ledId: number, status: string, sector: string): LedUpdatePayload {
    const payload: LedUpdatePayload = { ledId, status, sector }
    this.io?.emit('led_update', payload)
    return payload
  }

  /** Accès direct à l'état courant (utile pour les tests / debug) */
  public getFlagState(): FlagState {
    return this.flagState
  }

  /** Accès direct à l'état courant de la course */
  public getRaceState(): RaceState {
    return this.raceState
  }
}

const socketService = new SocketService()
export default socketService