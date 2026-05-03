import { Server } from 'socket.io'
import server from '@adonisjs/core/services/server'
import RaceEngineService from './race_engine_service.js'
import Flag from '#models/flag'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FlagColor = 'vert' | 'jaune' | 'rouge'

export interface FlagState {
  color: FlagColor
  /** Secteurs concernés — uniquement pertinent pour 'jaune', vide sinon */
  sectors: string[]
}

// ─── État drapeau par défaut ──────────────────────────────────────────────────

const DEFAULT_FLAG: FlagState = { color: 'vert', sectors: [] }

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

      socket.on('disconnect', () => {
        console.log('👋 Spectateur déconnecté')
      })
    })
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

  public async refreshLiveTiming(): Promise<void> {
    await RaceEngineService.refreshFromConnectedObjects()
    this.io?.emit('race_update', {
      timestamp: Date.now(),
      drivers: RaceEngineService.getCurrentState(),
    })
  }

  /** Accès direct à l'état courant (utile pour les tests / debug) */
  public getFlagState(): FlagState {
    return this.flagState
  }
}

const socketService = new SocketService()
export default socketService