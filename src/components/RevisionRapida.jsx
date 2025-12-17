import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import casoService from '../services/casoService';
import api from '../services/api';

/**
 * Componente de Revisión Rápida (Estado D según plan.md)
 *
 * Permite:
 * - Ver conversación como referencia
 * - Editar campos críticos manualmente (sin IA)
 * - Ver datos del solicitante en SOLO LECTURA (desde perfil)
 * - Validar campos bloqueantes antes de generar
 * - Generar documento desde la misma interfaz
 */
export default function RevisionRapida({ caso, conversacion = [], onCasoUpdated, onDocumentoGenerado }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [validacion, setValidacion] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [confirmacionVisible, setConfirmacionVisible] = useState(false);
  const autoGuardadoRef = useRef(null);

  // Inicializar formData con datos del caso
  useEffect(() => {
    if (caso) {
      setFormData({
        tipo_documento: caso.tipo_documento || 'tutela',
        actua_en_representacion: caso.actua_en_representacion || false,
        nombre_representado: caso.nombre_representado || '',
        identificacion_representado: caso.identificacion_representado || '',
        relacion_representado: caso.relacion_representado || '',
        tipo_representado: caso.tipo_representado || '',
        entidad_accionada: caso.entidad_accionada || '',
        direccion_entidad: caso.direccion_entidad || '',
        representante_legal: caso.representante_legal || '',
        hechos: caso.hechos || '',
        derechos_vulnerados: caso.derechos_vulnerados || '',
        pretensiones: caso.pretensiones || '',
        fundamentos_derecho: caso.fundamentos_derecho || '',
        pruebas: caso.pruebas || ''
      });

      // Cargar validación de campos críticos
      cargarValidacion();
    }
  }, [caso]);

  // Cargar validación de campos críticos
  const cargarValidacion = async () => {
    if (!caso?.id) return;

    try {
      const response = await api.get(`/casos/${caso.id}/campos-criticos`);
      setValidacion(response.data);
    } catch (error) {
      console.error('Error cargando validación:', error);
    }
  };

  // Manejar cambios en campos
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Auto-guardado cada 3 segundos
  useEffect(() => {
    if (autoGuardadoRef.current) {
      clearTimeout(autoGuardadoRef.current);
    }

    autoGuardadoRef.current = setTimeout(() => {
      if (caso?.id) {
        guardarCambios();
      }
    }, 3000);

    return () => {
      if (autoGuardadoRef.current) {
        clearTimeout(autoGuardadoRef.current);
      }
    };
  }, [formData]);

  // Guardar cambios
  const guardarCambios = async () => {
    if (!caso?.id) return;

    try {
      setGuardando(true);
      const casoActualizado = await casoService.actualizarCaso(caso.id, formData);
      onCasoUpdated?.(casoActualizado);
      await cargarValidacion(); // Recargar validación después de guardar
    } catch (error) {
      console.error('Error guardando cambios:', error);
    } finally {
      setGuardando(false);
    }
  };

  // Generar documento
  const handleGenerarDocumento = async () => {
    if (!validacion?.puede_generar) {
      alert('Por favor completa todos los campos obligatorios antes de generar el documento');
      return;
    }

    // Mostrar confirmación de datos sensibles
    setConfirmacionVisible(true);
  };

  // Confirmar y generar documento
  const confirmarYGenerar = async () => {
    setConfirmacionVisible(false);

    try {
      setGenerando(true);
      const casoActualizado = await casoService.generarDocumento(caso.id);
      onDocumentoGenerado?.(casoActualizado);

      // Descargar automáticamente PDF
      const pdfBlob = await casoService.descargarPDF(caso.id);
      const url = URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.tipo_documento}_${caso.nombre_solicitante || 'documento'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Documento generado y descargado exitosamente');
    } catch (error) {
      console.error('Error generando documento:', error);
      alert(error.response?.data?.detail?.message || 'Error al generar el documento');
    } finally {
      setGenerando(false);
    }
  };

  if (!caso) {
    return (
      <div className="text-center text-gray-400 py-8">
        No hay datos del caso para revisar
      </div>
    );
  }

  return (
    <div className="h-full flex gap-4 overflow-hidden">
      {/* Panel de conversación (30% izquierda) */}
      <div className="w-[30%] bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
        <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
          <h3 className="font-semibold text-white text-sm">Conversación de Referencia</h3>
          <p className="text-xs text-gray-400 mt-1">{conversacion.length} mensajes</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {conversacion.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              No hay conversación disponible
            </p>
          ) : (
            conversacion.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg text-sm ${
                  msg.remitente === 'usuario'
                    ? 'bg-blue-900 bg-opacity-40 text-blue-100'
                    : 'bg-gray-700 text-gray-200'
                }`}
              >
                <div className="font-semibold text-xs mb-1 opacity-75">
                  {msg.remitente === 'usuario' ? 'Tú' : 'Asistente'}
                </div>
                <div className="whitespace-pre-wrap">{msg.texto}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Panel de revisión (70% derecha) */}
      <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
        <div className="bg-gray-700 px-4 py-3 border-b border-gray-600 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-white">Revisión Rápida de Datos</h3>
            <p className="text-xs text-gray-400 mt-1">
              {guardando ? 'Guardando...' : 'Auto-guardado activado'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {validacion && (
              <span className={`text-xs px-3 py-1 rounded-full ${
                validacion.puede_generar
                  ? 'bg-green-900 text-green-200'
                  : 'bg-yellow-900 text-yellow-200'
              }`}>
                {validacion.puede_generar
                  ? '✓ Listo para generar'
                  : `${validacion.bloqueantes_faltantes.length} campos obligatorios faltantes`}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Datos del Solicitante (Solo Lectura) */}
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-white text-sm">Datos del Solicitante</h4>
              <button
                onClick={() => navigate('/app/perfil')}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
              >
                Ir a Perfil para editar
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label className="text-gray-400 text-xs">Nombre</label>
                <div className="text-gray-200 bg-gray-800 px-3 py-2 rounded mt-1">
                  {caso.nombre_solicitante || '-'}
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs">Identificación</label>
                <div className="text-gray-200 bg-gray-800 px-3 py-2 rounded mt-1">
                  {caso.identificacion_solicitante || '-'}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-gray-400 text-xs">Dirección</label>
                <div className="text-gray-200 bg-gray-800 px-3 py-2 rounded mt-1">
                  {caso.direccion_solicitante || '-'}
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs">Teléfono</label>
                <div className="text-gray-200 bg-gray-800 px-3 py-2 rounded mt-1">
                  {caso.telefono_solicitante || '-'}
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs">Email</label>
                <div className="text-gray-200 bg-gray-800 px-3 py-2 rounded mt-1">
                  {caso.email_solicitante || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Campos Críticos Editables */}
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <h4 className="font-semibold text-white text-sm mb-3">Campos Críticos</h4>

            {/* Entidad Accionada */}
            <div className="mb-3">
              <label className="text-gray-300 text-sm flex items-center gap-2">
                Entidad {formData.tipo_documento === 'tutela' ? 'Accionada' : 'Destinataria'} *
                {validacion?.bloqueantes_faltantes.includes('entidad_accionada') && (
                  <span className="text-red-400 text-xs">Obligatorio</span>
                )}
              </label>
              <input
                type="text"
                name="entidad_accionada"
                value={formData.entidad_accionada}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Ministerio de Salud"
              />
            </div>

            {/* Hechos */}
            <div className="mb-3">
              <label className="text-gray-300 text-sm flex items-center gap-2">
                Hechos *
                {validacion?.bloqueantes_faltantes.includes('hechos') && (
                  <span className="text-red-400 text-xs">Obligatorio</span>
                )}
              </label>
              <textarea
                name="hechos"
                value={formData.hechos}
                onChange={handleChange}
                rows={4}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe los hechos..."
              />
            </div>

            {/* Derechos Vulnerados (solo para tutela) */}
            {formData.tipo_documento === 'tutela' && (
              <div className="mb-3">
                <label className="text-gray-300 text-sm flex items-center gap-2">
                  Derechos Vulnerados *
                  {validacion?.bloqueantes_faltantes.includes('derechos_vulnerados') && (
                    <span className="text-red-400 text-xs">Obligatorio</span>
                  )}
                </label>
                <textarea
                  name="derechos_vulnerados"
                  value={formData.derechos_vulnerados}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Derecho a la Salud (Art. 49)"
                />
              </div>
            )}

            {/* Pretensiones */}
            <div className="mb-3">
              <label className="text-gray-300 text-sm flex items-center gap-2">
                {formData.tipo_documento === 'tutela' ? 'Pretensiones' : 'Peticiones'} *
                {validacion?.bloqueantes_faltantes.includes('pretensiones') && (
                  <span className="text-red-400 text-xs">Obligatorio</span>
                )}
              </label>
              <textarea
                name="pretensiones"
                value={formData.pretensiones}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Qué solicitas..."
              />
            </div>
          </div>

          {/* Campos Sensibles */}
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <h4 className="font-semibold text-white text-sm mb-3">Información Adicional (Recomendado)</h4>

            <div className="mb-3">
              <label className="text-gray-300 text-sm">Dirección de la Entidad</label>
              <input
                type="text"
                name="direccion_entidad"
                value={formData.direccion_entidad}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-3">
              <label className="text-gray-300 text-sm">Representante Legal</label>
              <input
                type="text"
                name="representante_legal"
                value={formData.representante_legal}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-3">
              <label className="text-gray-300 text-sm">Pruebas y Documentos Anexos</label>
              <textarea
                name="pruebas"
                value={formData.pruebas}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lista de documentos que anexarás..."
              />
            </div>
          </div>

          {/* Representación */}
          {formData.actua_en_representacion && (
            <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-700">
              <h4 className="font-semibold text-blue-200 text-sm mb-3">Datos del Representado</h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-blue-200 text-sm">Nombre del Representado</label>
                  <input
                    type="text"
                    name="nombre_representado"
                    value={formData.nombre_representado}
                    onChange={handleChange}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-blue-200 text-sm">Identificación</label>
                  <input
                    type="text"
                    name="identificacion_representado"
                    value={formData.identificacion_representado}
                    onChange={handleChange}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-blue-200 text-sm">Relación</label>
                  <select
                    name="relacion_representado"
                    value={formData.relacion_representado}
                    onChange={handleChange}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="madre">Madre</option>
                    <option value="padre">Padre</option>
                    <option value="hijo">Hijo/a</option>
                    <option value="cuidador">Cuidador/a</option>
                    <option value="apoderado">Apoderado/a</option>
                    <option value="tutor">Tutor/a legal</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con botón de generar */}
        <div className="bg-gray-700 px-4 py-3 border-t border-gray-600 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {validacion?.bloqueantes_faltantes.length > 0 ? (
              <span className="text-yellow-400">
                Completa {validacion.bloqueantes_faltantes.length} campo(s) obligatorio(s)
              </span>
            ) : (
              <span className="text-green-400">
                Todos los campos obligatorios completados
              </span>
            )}
          </div>
          <button
            onClick={handleGenerarDocumento}
            disabled={!validacion?.puede_generar || generando}
            className={`px-6 py-2 rounded font-semibold transition ${
              validacion?.puede_generar && !generando
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {generando ? 'Generando...' : 'Generar Documento'}
          </button>
        </div>
      </div>

      {/* Modal de confirmación de datos sensibles */}
      {confirmacionVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Confirmar Datos Sensibles</h3>

            <div className="space-y-3 mb-6 text-sm">
              <p className="text-gray-300">Por favor confirma que los siguientes datos son correctos:</p>

              <div className="bg-gray-700 rounded p-3">
                <div className="text-gray-400 text-xs mb-1">Identificación</div>
                <div className="text-white">{caso.identificacion_solicitante || 'No especificado'}</div>
              </div>

              <div className="bg-gray-700 rounded p-3">
                <div className="text-gray-400 text-xs mb-1">Dirección</div>
                <div className="text-white">{caso.direccion_solicitante || 'No especificado'}</div>
              </div>

              <div className="bg-gray-700 rounded p-3">
                <div className="text-gray-400 text-xs mb-1">Entidad</div>
                <div className="text-white">{formData.entidad_accionada || 'No especificado'}</div>
              </div>

              {formData.actua_en_representacion && (
                <div className="bg-blue-900 bg-opacity-30 rounded p-3 border border-blue-700">
                  <div className="text-blue-200 text-xs mb-1">Datos del Representado</div>
                  <div className="text-white">
                    {formData.nombre_representado} - {formData.identificacion_representado}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmacionVisible(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarYGenerar}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition font-semibold"
              >
                Confirmar y Generar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
