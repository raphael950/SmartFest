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
  switch (current.color) {

    // ── Pas de drapeau / vert ──────────────────────────────────────────
    case 'vert': {
      if (incomingColor === 'vert')  return { color: 'vert',  sectors: [] }
      if (incomingColor === 'jaune') return { color: 'jaune', sectors: [incomingSector] }
      if (incomingColor === 'rouge') return { color: 'rouge', sectors: [] }
      break
    }

    // ── Jaune en cours ─────────────────────────────────────────────────
    case 'jaune': {
      if (incomingColor === 'vert') {
        // Retire le secteur si présent ; si plus aucun secteur → repasse vert
        const next = current.sectors.filter((s) => s !== incomingSector)
        return next.length > 0
          ? { color: 'jaune', sectors: next }
          : { color: 'vert',  sectors: [] }
      }

      if (incomingColor === 'jaune') {
        // Ajoute le secteur s'il n'est pas déjà dans la liste
        if (current.sectors.includes(incomingSector)) return current
        return { color: 'jaune', sectors: [...current.sectors, incomingSector] }
      }

      if (incomingColor === 'rouge') return { color: 'rouge', sectors: [] }
      break
    }

    // ── Rouge en cours ─────────────────────────────────────────────────
    case 'rouge': {
      if (incomingColor === 'vert')  return { color: 'vert',  sectors: [] }
      if (incomingColor === 'jaune') return { color: 'jaune', sectors: [incomingSector] }
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
      if (this.flagState.color === 'vert' && this.flagState.sectors.length === 0) {
        const latestFlag = await Flag.query().orderBy('created_at', 'desc').first()
        if (latestFlag) {
          this.flagState = {
            color: latestFlag.color as FlagColor,
            sectors: latestFlag.sector && latestFlag.sector !== 'tous'
              ? [latestFlag.sector]
              : [],
          }
        }
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
  public updateFlag(incomingColor: FlagColor, incomingSector: string): FlagState {
    this.flagState = mergeFlag(this.flagState, incomingColor, incomingSector)
    this.io?.emit('flag_update', this.flagState)
    return this.flagState
  }

  /** Accès direct à l'état courant (utile pour les tests / debug) */
  public getFlagState(): FlagState {
    return this.flagState
  }
}

const socketService = new SocketService()
export default socketService