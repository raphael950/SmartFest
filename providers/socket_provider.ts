import RaceEngineService from '#services/race_engine_service'
import socketService from '#services/socket_service'
import type { ApplicationService } from '@adonisjs/core/types'

export default class SocketProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {}

  /**
   * The container bindings have booted
   */
  async boot() {}

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {
    // On n'initialise le socket que si on est en mode "web" 
    // (on évite de le lancer pendant les migrations ou les tests)
    if (this.app.getEnvironment() === 'web') {
      
      // 1. On démarre Socket.io
      socketService.boot()
      console.log('🚀 Socket.io server started')

      // 2. On lance le moteur de simulation
      await RaceEngineService.start()
      console.log('🏎️ Race Engine is running')
    }
  }

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {
    socketService.io?.close()
  }
}