import { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import api from '../services/api';

/**
 * ModalConfirmarSesion - Modal de Confirmación de Sesión
 *
 * Se muestra ANTES de iniciar una sesión de avatar.
 * Muestra:
 * - Sesiones disponibles hoy
 * - Minutos disponibles hoy
 * - Duración máxima de la sesión
 * - Tips para obtener más sesiones
 * - Advertencias si está cerca del límite
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onConfirm - Callback al confirmar
 * @param {Function} props.onCancel - Callback al cancelar
 */
export default function ModalConfirmarSesion({ isOpen, onConfirm, onCancel }) {
  const [validacion, setValidacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      validarLimite();
    }
  }, [isOpen]);

  const validarLimite = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/sesiones/validar-limite');
      setValidacion(response.data);
    } catch (err) {
      console.error('Error al validar límite:', err);

      // Manejar diferentes tipos de errores
      if (err.response?.status === 429) {
        setError({
          tipo: 'limite',
          mensaje: err.response.data.detail || 'Has alcanzado el límite de sesiones diarias',
          detalles: err.response.data,
        });
      } else {
        setError({
          tipo: 'general',
          mensaje: 'No se pudo verificar el límite de sesiones',
        });
      }
      setValidacion({ permitido: false });
    } finally {
      setLoading(false);
    }
  };

  const calcularPorcentaje = (usado, total) => {
    if (total === 0) return 0;
    return Math.min((usado / total) * 100, 100);
  };

  const obtenerColorAdvertencia = (porcentaje) => {
    if (porcentaje >= 90) return '#ef4444';
    if (porcentaje >= 75) return '#f59e0b';
    return '#10b981';
  };

  const modalBody = () => {
    if (loading) {
      return (
        <div style={loadingContainerStyles}>
          <div style={spinnerStyles} />
          <p style={loadingTextStyles}>Verificando disponibilidad...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={errorContainerStyles}>
          <div style={errorIconContainerStyles}>
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 style={errorTituloStyles}>
            {error.tipo === 'limite' ? 'Límite Alcanzado' : 'Error'}
          </h3>
          <p style={errorMensajeStyles}>{error.mensaje}</p>

          {error.detalles && (
            <div style={detallesErrorStyles}>
              {error.detalles.sesiones_usadas !== undefined && (
                <p>Sesiones usadas: {error.detalles.sesiones_usadas} / {error.detalles.sesiones_maximas}</p>
              )}
            </div>
          )}

          <div style={tipContainerStyles}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <p style={tipTextoStyles}>
              💡 <strong>Paga un documento</strong> para obtener <strong>+2 sesiones extra</strong> hoy mismo
            </p>
          </div>
        </div>
      );
    }

    if (!validacion || !validacion.permitido) {
      return (
        <div style={errorContainerStyles}>
          <div style={errorIconContainerStyles}>
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h3 style={errorTituloStyles}>No Disponible</h3>
          <p style={errorMensajeStyles}>No puedes iniciar una sesión en este momento</p>
        </div>
      );
    }

    const porcentajeSesiones = calcularPorcentaje(
      validacion.sesiones_usadas,
      validacion.sesiones_disponibles
    );
    const porcentajeMinutos = calcularPorcentaje(
      validacion.minutos_usados,
      validacion.minutos_disponibles
    );

    const colorSesiones = obtenerColorAdvertencia(porcentajeSesiones);
    const colorMinutos = obtenerColorAdvertencia(porcentajeMinutos);

    return (
      <div>
        {/* Header de éxito */}
        <div style={exitoHeaderStyles}>
          <div style={exitoIconContainerStyles}>
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 style={exitoTituloStyles}>¡Todo listo!</h3>
          <p style={exitoSubtituloStyles}>Puedes iniciar tu sesión de avatar</p>
        </div>

        {/* Información de disponibilidad */}
        <div style={infoGridStyles}>
          {/* Sesiones */}
          <div style={infoCardStyles}>
            <div style={infoCardHeaderStyles}>
              <span style={infoIconoStyles}>📱</span>
              <span style={infoTituloStyles}>Sesiones Disponibles</span>
            </div>
            <div style={infoValorStyles}>
              <span style={{ color: colorSesiones }}>
                {validacion.sesiones_disponibles - validacion.sesiones_usadas}
              </span>
              <span style={infoValorSecundarioStyles}>
                ({validacion.sesiones_usadas} usadas de {validacion.sesiones_disponibles})
              </span>
            </div>
            {porcentajeSesiones >= 75 && (
              <div style={{ ...advertenciaStyles, borderColor: colorSesiones, color: colorSesiones }}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Quedan pocas sesiones</span>
              </div>
            )}
          </div>

          {/* Minutos */}
          <div style={infoCardStyles}>
            <div style={infoCardHeaderStyles}>
              <span style={infoIconoStyles}>⏱️</span>
              <span style={infoTituloStyles}>Minutos Disponibles</span>
            </div>
            <div style={infoValorStyles}>
              <span style={{ color: colorMinutos }}>
                {validacion.minutos_disponibles - validacion.minutos_usados} min
              </span>
              <span style={infoValorSecundarioStyles}>
                ({validacion.minutos_usados} usados de {validacion.minutos_disponibles})
              </span>
            </div>
            {porcentajeMinutos >= 75 && (
              <div style={{ ...advertenciaStyles, borderColor: colorMinutos, color: colorMinutos }}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Quedan pocos minutos</span>
              </div>
            )}
          </div>
        </div>

        {/* Duración máxima */}
        <div style={duracionMaximaStyles}>
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <div>
            <strong>Duración máxima de esta sesión:</strong> {validacion.duracion_maxima_sesion} minutos
          </div>
        </div>

        {/* Tip */}
        <div style={tipContainerStyles}>
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <p style={tipTextoStyles}>
            💡 Al pagar un documento obtienes <strong>+2 sesiones extra</strong> para usar hoy
          </p>
        </div>
      </div>
    );
  };

  const footer = !loading && !error && validacion?.permitido ? (
    <>
      <Button variant="neutral" onClick={onCancel}>
        Cancelar
      </Button>
      <Button variant="primary" onClick={onConfirm}>
        Iniciar Sesión
      </Button>
    </>
  ) : !loading ? (
    <Button variant="primary" onClick={onCancel} fullWidth>
      Entendido
    </Button>
  ) : null;

  // Estilos
  const loadingContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-md)',
    padding: 'var(--spacing-xl)',
  };

  const spinnerStyles = {
    width: '48px',
    height: '48px',
    border: '4px solid var(--neutral-300)',
    borderTop: '4px solid var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const loadingTextStyles = {
    margin: 0,
    color: 'var(--neutral-600)',
    fontSize: 'var(--font-size-base)',
  };

  const errorContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 'var(--spacing-lg)',
  };

  const errorIconContainerStyles = {
    color: 'var(--color-error)',
    marginBottom: 'var(--spacing-md)',
  };

  const errorTituloStyles = {
    margin: 0,
    marginBottom: 'var(--spacing-sm)',
    fontSize: 'var(--font-size-xl)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--neutral-800)',
  };

  const errorMensajeStyles = {
    margin: 0,
    marginBottom: 'var(--spacing-md)',
    fontSize: 'var(--font-size-base)',
    color: 'var(--neutral-600)',
    textAlign: 'center',
  };

  const detallesErrorStyles = {
    width: '100%',
    padding: 'var(--spacing-md)',
    backgroundColor: 'var(--neutral-100)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--spacing-md)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--neutral-700)',
  };

  const exitoHeaderStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 'var(--spacing-lg)',
  };

  const exitoIconContainerStyles = {
    color: 'var(--color-success)',
    marginBottom: 'var(--spacing-md)',
  };

  const exitoTituloStyles = {
    margin: 0,
    marginBottom: 'var(--spacing-xs)',
    fontSize: 'var(--font-size-xl)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--neutral-800)',
  };

  const exitoSubtituloStyles = {
    margin: 0,
    fontSize: 'var(--font-size-base)',
    color: 'var(--neutral-600)',
  };

  const infoGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-lg)',
  };

  const infoCardStyles = {
    padding: 'var(--spacing-md)',
    backgroundColor: 'var(--neutral-100)',
    borderRadius: 'var(--radius-lg)',
  };

  const infoCardHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    marginBottom: 'var(--spacing-sm)',
  };

  const infoIconoStyles = {
    fontSize: '1.5rem',
  };

  const infoTituloStyles = {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--neutral-700)',
  };

  const infoValorStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 'var(--font-weight-bold)',
  };

  const infoValorSecundarioStyles = {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--neutral-600)',
    fontWeight: 'var(--font-weight-normal)',
  };

  const advertenciaStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
    marginTop: 'var(--spacing-sm)',
    padding: 'var(--spacing-xs) var(--spacing-sm)',
    borderLeft: '3px solid',
    backgroundColor: 'white',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 'var(--font-weight-medium)',
  };

  const duracionMaximaStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    padding: 'var(--spacing-md)',
    backgroundColor: 'var(--neutral-100)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--spacing-md)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--neutral-700)',
  };

  const tipContainerStyles = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-sm)',
    padding: 'var(--spacing-md)',
    backgroundColor: '#fffbeb',
    border: '1px solid #fbbf24',
    borderRadius: 'var(--radius-md)',
    color: '#92400e',
  };

  const tipTextoStyles = {
    margin: 0,
    fontSize: 'var(--font-size-sm)',
    lineHeight: '1.5',
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onCancel}
        title={loading ? 'Verificando...' : error || !validacion?.permitido ? 'Sesión No Disponible' : 'Confirmar Inicio de Sesión'}
        footer={footer}
        size="md"
      >
        {modalBody()}
      </Modal>

      {/* Animaciones CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
