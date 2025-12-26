import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import api from '../services/api';

/**
 * SolicitudReembolso - Componente para solicitar reembolso
 *
 * Formulario para que el usuario solicite reembolso de un documento pagado.
 * Incluye:
 * - Campo de motivo (textarea)
 * - Upload de evidencia (PDF/imagen)
 * - Explicación de la garantía de satisfacción
 * - Validación y envío
 * - Pre-carga de datos anteriores si es una re-solicitud
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {number|string} props.casoId - ID del caso
 * @param {Object} props.caso - Objeto del caso completo (para pre-cargar datos)
 * @param {Function} props.onSuccess - Callback al enviar exitosamente
 * @param {Function} props.onCancel - Callback al cancelar
 */
export default function SolicitudReembolso({ isOpen, casoId, caso, onSuccess, onCancel }) {
  // Pre-cargar motivo anterior si existe (re-solicitud)
  const [motivo, setMotivo] = useState(caso?.motivo_rechazo || '');
  const [archivo, setArchivo] = useState(null);
  const [archivoNombre, setArchivoNombre] = useState('');
  const [evidenciaPrevia, setEvidenciaPrevia] = useState(caso?.evidencia_rechazo_url || null);
  const [mantenerEvidenciaPrevia, setMantenerEvidenciaPrevia] = useState(!!caso?.evidencia_rechazo_url);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [errorMotivo, setErrorMotivo] = useState('');
  const [errorArchivo, setErrorArchivo] = useState('');
  const [esResolicitud, setEsResolicitud] = useState(!!caso?.fecha_reembolso);

  const resetForm = () => {
    setMotivo('');
    setArchivo(null);
    setArchivoNombre('');
    setEvidenciaPrevia(null);
    setMantenerEvidenciaPrevia(false);
    setError(null);
    setErrorMotivo('');
    setErrorArchivo('');
  };

  const validarFormulario = () => {
    let valido = true;

    // Validar motivo
    if (!motivo.trim()) {
      setErrorMotivo('El motivo es obligatorio');
      valido = false;
    } else if (motivo.trim().length < 20) {
      setErrorMotivo('El motivo debe tener al menos 20 caracteres');
      valido = false;
    } else {
      setErrorMotivo('');
    }

    // El archivo es opcional, pero si se sube, validar
    if (archivo) {
      const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      const tamanoMaximo = 5 * 1024 * 1024; // 5 MB

      if (!tiposPermitidos.includes(archivo.type)) {
        setErrorArchivo('Solo se permiten archivos PDF, JPG o PNG');
        valido = false;
      } else if (archivo.size > tamanoMaximo) {
        setErrorArchivo('El archivo no debe superar los 5 MB');
        valido = false;
      } else {
        setErrorArchivo('');
      }
    } else {
      setErrorArchivo('');
    }

    return valido;
  };

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file);
      setArchivoNombre(file.name);
      setMantenerEvidenciaPrevia(false); // Reemplazar evidencia anterior con nueva
      setErrorArchivo('');
    }
  };

  const handleRemoverArchivo = () => {
    setArchivo(null);
    setArchivoNombre('');
    setErrorArchivo('');
  };

  const handleRemoverEvidenciaPrevia = () => {
    setMantenerEvidenciaPrevia(false);
    setEvidenciaPrevia(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      setEnviando(true);
      setError(null);

      // Crear FormData para enviar archivo
      const formData = new FormData();
      formData.append('motivo', motivo.trim());
      if (archivo) {
        formData.append('evidencia', archivo);
      }

      const response = await api.post(`/casos/${casoId}/solicitar-reembolso`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Éxito
      resetForm();
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      console.error('Error al solicitar reembolso:', err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('No se pudo enviar la solicitud. Intenta nuevamente.');
      }
    } finally {
      setEnviando(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    if (onCancel) {
      onCancel();
    }
  };

  // Estilos
  const garantiaContainerStyles = {
    padding: 'var(--spacing-md)',
    backgroundColor: '#f0fdf4',
    border: '1px solid #86efac',
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--spacing-lg)',
  };

  const garantiaTituloStyles = {
    margin: 0,
    marginBottom: 'var(--spacing-sm)',
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-bold)',
    color: '#166534',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
  };

  const garantiaTextoStyles = {
    margin: 0,
    fontSize: 'var(--font-size-sm)',
    color: '#166534',
    lineHeight: '1.6',
  };

  const textareaContainerStyles = {
    marginBottom: 'var(--spacing-lg)',
  };

  const labelStyles = {
    display: 'block',
    marginBottom: 'var(--spacing-xs)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--neutral-700)',
  };

  const textareaStyles = {
    width: '100%',
    minHeight: '120px',
    padding: 'var(--spacing-sm) var(--spacing-md)',
    fontSize: 'var(--font-size-base)',
    border: `1px solid ${errorMotivo ? 'var(--color-error)' : 'var(--neutral-400)'}`,
    borderRadius: 'var(--radius-md)',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color var(--transition-base)',
  };

  const errorTextStyles = {
    marginTop: 'var(--spacing-xs)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-error)',
  };

  const caracteresStyles = {
    marginTop: 'var(--spacing-xs)',
    fontSize: 'var(--font-size-xs)',
    color: motivo.length < 20 ? 'var(--color-error)' : 'var(--neutral-600)',
    textAlign: 'right',
  };

  const uploadContainerStyles = {
    marginBottom: 'var(--spacing-lg)',
  };

  const uploadAreaStyles = {
    padding: 'var(--spacing-lg)',
    border: `2px dashed ${errorArchivo ? 'var(--color-error)' : 'var(--neutral-400)'}`,
    borderRadius: 'var(--radius-md)',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all var(--transition-base)',
    backgroundColor: 'var(--neutral-100)',
  };

  const uploadIconStyles = {
    fontSize: '3rem',
    marginBottom: 'var(--spacing-sm)',
  };

  const uploadTextoStyles = {
    margin: 0,
    fontSize: 'var(--font-size-base)',
    color: 'var(--neutral-700)',
    fontWeight: 'var(--font-weight-medium)',
  };

  const uploadSubtextoStyles = {
    margin: '0.25rem 0 0 0',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--neutral-600)',
  };

  const archivoSeleccionadoStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--spacing-md)',
    backgroundColor: 'var(--neutral-100)',
    border: '1px solid var(--neutral-300)',
    borderRadius: 'var(--radius-md)',
  };

  const archivoInfoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
  };

  const archivoIconoStyles = {
    fontSize: '1.5rem',
  };

  const archivoNombreStyles = {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--neutral-800)',
  };

  const errorAlertStyles = {
    padding: 'var(--spacing-md)',
    backgroundColor: '#fef2f2',
    border: '1px solid var(--color-error)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--spacing-md)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    color: 'var(--color-error)',
    fontSize: 'var(--font-size-sm)',
  };

  const footer = (
    <>
      <Button variant="neutral" onClick={handleCancel} disabled={enviando}>
        Cancelar
      </Button>
      <Button variant="primary" onClick={handleSubmit} loading={enviando} disabled={enviando}>
        {enviando ? 'Enviando...' : 'Enviar Solicitud'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Solicitar Reembolso"
      footer={footer}
      size="md"
      closeOnOverlayClick={false}
    >
      <form onSubmit={handleSubmit}>
        {/* Explicación de la garantía */}
        <div style={garantiaContainerStyles}>
          <h3 style={garantiaTituloStyles}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Garantía de Satisfacción
          </h3>
          <p style={garantiaTextoStyles}>
            En Abogadai nos comprometemos con tu satisfacción. Si el documento generado no cumple con tus expectativas,
            puedes solicitar un reembolso total. Revisaremos tu caso en un plazo de 2-3 días hábiles.
          </p>
        </div>

        {/* Error general */}
        {error && (
          <div style={errorAlertStyles}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Motivo */}
        <div style={textareaContainerStyles}>
          <label style={labelStyles}>
            Motivo de la solicitud <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Explica por qué deseas solicitar el reembolso..."
            style={textareaStyles}
            disabled={enviando}
            onFocus={(e) => {
              if (!errorMotivo) {
                e.target.style.borderColor = 'var(--color-primary)';
                e.target.style.boxShadow = '0 0 0 3px rgba(11, 109, 255, 0.1)';
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errorMotivo ? 'var(--color-error)' : 'var(--neutral-400)';
              e.target.style.boxShadow = 'none';
            }}
          />
          {errorMotivo && <p style={errorTextStyles}>{errorMotivo}</p>}
          <p style={caracteresStyles}>
            {motivo.length} caracteres (mínimo 20)
          </p>
        </div>

        {/* Upload de evidencia */}
        <div style={uploadContainerStyles}>
          <label style={labelStyles}>
            Evidencia (opcional)
          </label>
          <p style={{ ...uploadSubtextoStyles, marginBottom: 'var(--spacing-sm)' }}>
            Puedes adjuntar capturas de pantalla, emails u otros documentos que respalden tu solicitud.
          </p>

          {/* Mostrar evidencia previa (si existe y no se ha subido nuevo archivo) */}
          {mantenerEvidenciaPrevia && !archivo ? (
            <div style={{ ...archivoSeleccionadoStyles, backgroundColor: '#fffbeb', borderColor: '#fbbf24' }}>
              <div style={archivoInfoStyles}>
                <span style={archivoIconoStyles}>
                  {evidenciaPrevia?.includes('.pdf') ? '📄' : '🖼️'}
                </span>
                <div>
                  <p style={archivoNombreStyles}>Evidencia anterior</p>
                  <p style={uploadSubtextoStyles}>
                    {evidenciaPrevia ? evidenciaPrevia.split('/').pop() : 'Archivo previo'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoverEvidenciaPrevia}
                disabled={enviando}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: enviando ? 'not-allowed' : 'pointer',
                  padding: 'var(--spacing-xs)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#92400e',
                }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ) : !archivo ? (
            <div
              style={uploadAreaStyles}
              onClick={() => document.getElementById('evidencia-input').click()}
              onMouseEnter={(e) => {
                if (!errorArchivo) {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.backgroundColor = '#f0f9ff';
                }
              }}
              onMouseLeave={(e) => {
                if (!errorArchivo) {
                  e.currentTarget.style.borderColor = 'var(--neutral-400)';
                  e.currentTarget.style.backgroundColor = 'var(--neutral-100)';
                }
              }}
            >
              <div style={uploadIconStyles}>📎</div>
              <p style={uploadTextoStyles}>Haz clic para seleccionar un archivo</p>
              <p style={uploadSubtextoStyles}>PDF, JPG o PNG (máx. 5 MB)</p>
              <input
                id="evidencia-input"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleArchivoChange}
                style={{ display: 'none' }}
                disabled={enviando}
              />
            </div>
          ) : (
            <div style={archivoSeleccionadoStyles}>
              <div style={archivoInfoStyles}>
                <span style={archivoIconoStyles}>
                  {archivo.type.includes('pdf') ? '📄' : '🖼️'}
                </span>
                <div>
                  <p style={archivoNombreStyles}>{archivoNombre}</p>
                  <p style={uploadSubtextoStyles}>
                    {(archivo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoverArchivo}
                disabled={enviando}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: enviando ? 'not-allowed' : 'pointer',
                  padding: 'var(--spacing-xs)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--color-error)',
                }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
          {errorArchivo && <p style={errorTextStyles}>{errorArchivo}</p>}
        </div>

        {/* Nota informativa */}
        <div style={{ ...garantiaContainerStyles, backgroundColor: '#fffbeb', borderColor: '#fbbf24' }}>
          <p style={{ ...garantiaTextoStyles, color: '#92400e', margin: 0 }}>
            <strong>Nota:</strong> Una vez enviada la solicitud, nuestro equipo la revisará en 2-3 días hábiles.
            Recibirás una notificación por email con la decisión.
          </p>
        </div>
      </form>
    </Modal>
  );
}
