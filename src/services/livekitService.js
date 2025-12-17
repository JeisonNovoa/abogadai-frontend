import api from './api';

export const livekitService = {
  /**
   * NUEVO: Iniciar sesión (crea caso sin conectar a LiveKit)
   */
  async iniciarSesion() {
    try {
      const response = await api.post('/sesiones/iniciar');
      return response.data;
    } catch (error) {
      console.error('Error iniciando sesión:', error);
      throw error;
    }
  },

  /**
   * NUEVO: Conectar a LiveKit (genera token para caso existente)
   */
  async conectarSesion(casoId) {
    try {
      const response = await api.post(`/sesiones/${casoId}/conectar`);
      return response.data;
    } catch (error) {
      console.error('Error conectando a sesión:', error);
      throw error;
    }
  },

  /**
   * Finalizar sesión
   */
  async finalizarSesion(casoId) {
    try {
      const response = await api.put(`/sesiones/${casoId}/finalizar`);
      return response.data;
    } catch (error) {
      console.error('Error finalizando sesión:', error);
      throw error;
    }
  },

  /**
   * LEGACY: Método antiguo (mantener por compatibilidad)
   * @deprecated Usar iniciarSesion() + conectarSesion() en su lugar
   */
  async getToken() {
    try {
      const response = await api.post('/livekit/token');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo token de LiveKit:', error);
      throw error;
    }
  },
};

export default livekitService;
