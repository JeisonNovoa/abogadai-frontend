import api from './api';

export const casoService = {
  async crearCaso(casoData) {
    try {
      const response = await api.post('/casos/', casoData);
      return response.data;
    } catch (error) {
      console.error('Error creando caso:', error);
      throw error;
    }
  },

  async listarCasos() {
    try {
      const response = await api.get('/casos/');
      return response.data;
    } catch (error) {
      console.error('Error listando casos:', error);
      throw error;
    }
  },

  async obtenerCaso(casoId) {
    try {
      const response = await api.get(`/casos/${casoId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo caso:', error);
      throw error;
    }
  },

  async actualizarCaso(casoId, casoData) {
    try {
      const response = await api.put(`/casos/${casoId}`, casoData);
      return response.data;
    } catch (error) {
      console.error('Error actualizando caso:', error);
      throw error;
    }
  },

  async eliminarCaso(casoId) {
    try {
      await api.delete(`/casos/${casoId}`);
    } catch (error) {
      console.error('Error eliminando caso:', error);
      throw error;
    }
  },

  async procesarTranscripcion(casoId) {
    try {
      const response = await api.post(`/casos/${casoId}/procesar-transcripcion`);
      const caso = response.data;

      // 📊 IMPRIMIR TODOS LOS CAMPOS DEL CASO EN CONSOLA
      console.log('═══════════════════════════════════════════════════════');
      console.log('📊 CAMPOS EXTRAÍDOS Y AUTO-LLENADOS POR LA IA');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');

      console.log('🎯 TIPO DE DOCUMENTO:');
      console.log(`   tipo_documento: "${caso.tipo_documento || ''}"`);
      console.log('');

      console.log('👤 DATOS DEL SOLICITANTE (desde perfil):');
      console.log(`   nombre_solicitante: "${caso.nombre_solicitante || ''}"`);
      console.log(`   identificacion_solicitante: "${caso.identificacion_solicitante || ''}"`);
      console.log(`   direccion_solicitante: "${caso.direccion_solicitante || ''}"`);
      console.log(`   telefono_solicitante: "${caso.telefono_solicitante || ''}"`);
      console.log(`   email_solicitante: "${caso.email_solicitante || ''}"`);
      console.log('');

      console.log('🤝 REPRESENTACIÓN:');
      console.log(`   actua_en_representacion: ${caso.actua_en_representacion || false}`);
      console.log(`   nombre_representado: "${caso.nombre_representado || ''}"`);
      console.log(`   identificacion_representado: "${caso.identificacion_representado || ''}"`);
      console.log(`   relacion_representado: "${caso.relacion_representado || ''}"`);
      console.log(`   tipo_representado: "${caso.tipo_representado || ''}"`);
      console.log('');

      console.log('🏢 ENTIDAD ACCIONADA:');
      console.log(`   entidad_accionada: "${caso.entidad_accionada || ''}"`);
      console.log(`   direccion_entidad: "${caso.direccion_entidad || ''}"`);
      console.log('');

      console.log('📝 HECHOS Y CONTEXTO:');
      console.log(`   hechos: "${caso.hechos ? (caso.hechos.substring(0, 100) + '...') : ''}"`);
      console.log(`   ciudad_de_los_hechos: "${caso.ciudad_de_los_hechos || ''}"`);
      console.log('');

      console.log('⚖️ DERECHOS Y FUNDAMENTOS:');
      console.log(`   derechos_vulnerados: "${caso.derechos_vulnerados ? (caso.derechos_vulnerados.substring(0, 100) + '...') : ''}"`);
      console.log(`   fundamentos_derecho: "${caso.fundamentos_derecho ? (caso.fundamentos_derecho.substring(0, 100) + '...') : ''}"`);
      console.log('');

      console.log('🎯 PRETENSIONES:');
      console.log(`   pretensiones: "${caso.pretensiones ? (caso.pretensiones.substring(0, 100) + '...') : ''}"`);
      console.log('');

      console.log('📄 PRUEBAS:');
      console.log(`   pruebas: "${caso.pruebas ? (caso.pruebas.substring(0, 100) + '...') : ''}"`);
      console.log('');

      console.log('⚖️ SUBSIDIARIEDAD:');
      console.log(`   hubo_derecho_peticion_previo: ${caso.hubo_derecho_peticion_previo || false}`);
      console.log(`   detalle_derecho_peticion_previo: "${caso.detalle_derecho_peticion_previo || ''}"`);
      console.log(`   tiene_perjuicio_irremediable: ${caso.tiene_perjuicio_irremediable || false}`);
      console.log(`   es_procedente_tutela: ${caso.es_procedente_tutela !== null ? caso.es_procedente_tutela : 'null'}`);
      console.log(`   razon_improcedencia: "${caso.razon_improcedencia || ''}"`);
      console.log('');

      console.log('═══════════════════════════════════════════════════════');
      console.log('');

      return caso;
    } catch (error) {
      console.error('Error procesando transcripción:', error);
      throw error;
    }
  },

  async validarCaso(casoId) {
    try {
      const response = await api.post(`/casos/${casoId}/validar`);
      return response.data;
    } catch (error) {
      console.error('Error validando caso:', error);
      throw error;
    }
  },

  async generarDocumento(casoId) {
    try {
      const response = await api.post(`/casos/${casoId}/generar`);
      return response.data;
    } catch (error) {
      console.error('Error generando documento:', error);
      throw error;
    }
  },

  async descargarPDF(casoId) {
    try {
      const response = await api.get(`/casos/${casoId}/descargar/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error descargando PDF:', error);
      throw error;
    }
  },

  /**
   * NUEVO: Obtener mensajes de la conversación del caso
   */
  async obtenerMensajes(casoId) {
    try {
      const response = await api.get(`/mensajes/caso/${casoId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo mensajes:', error);
      throw error;
    }
  },

  /**
   * Obtener documento con preview/full según estado de pago
   */
  async obtenerDocumento(casoId) {
    try {
      const response = await api.get(`/casos/${casoId}/documento`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo documento:', error);
      throw error;
    }
  },

  /**
   * Simular pago y desbloquear documento
   */
  async simularPago(casoId) {
    try {
      const response = await api.post(`/casos/${casoId}/simular-pago`);
      return response.data;
    } catch (error) {
      console.error('Error simulando pago:', error);
      throw error;
    }
  },

  /**
   * 🔔 Verificar si hay casos con novedades sin ver
   */
  async tieneNovedades() {
    try {
      const response = await api.get('/casos/tiene-novedades');
      return response.data;
    } catch (error) {
      console.error('Error verificando novedades:', error);
      throw error;
    }
  },

  /**
   * ✅ Marcar todos los casos como vistos
   */
  async marcarCasosVistos() {
    try {
      const response = await api.post('/casos/marcar-vistos');
      return response.data;
    } catch (error) {
      console.error('Error marcando casos como vistos:', error);
      throw error;
    }
  },
};

export default casoService;
