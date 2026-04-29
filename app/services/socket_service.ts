// app/services/socket_service.ts
import { Server } from 'socket.io'
import server from '@adonisjs/core/services/server'
import RaceEngineService from './race_engine_service.js'


// import { createAdapter } from '@socket.io/redis-adapter' // <-- LAISSE ÇA COMMENTÉ

class SocketService {
  public io: Server | undefined

  public boot() {
    if (this.io) return

    // On initialise le serveur sans l'adapter Redis
    this.io = new Server(server.getNodeServer(), {
      cors: { origin: '*' },
    })
    
    // // --- C'est ICI que ça se passe ---
    // this.io.on('connection', (socket) => {
    //   console.log('🏁 Nouveau spectateur connecté :', socket.id)

    //   // On envoie l'état actuel de la course immédiatement
    //   // pour que le client n'ait pas un circuit vide au chargement
    //   const currentState = RaceEngineService.getCurrentState()
      
    //   socket.emit('initial_state', {
    //     drivers: currentState,
    //     serverTime: Date.now()
    //   })

    //   socket.on('disconnect', () => {
    //     console.log('👋 Spectateur déconnecté')
    //   })
    // })

  }
}

const socketService = new SocketService()
export default socketService
