import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Componente UsoSesiones - Uso de Sesiones Diarias
 *
 * Muestra el uso de sesiones del día actual:
 * - Sesiones usadas / disponibles
 * - Minutos usados / disponibles
 * - Barras de progreso con colores indicativos
 * - Advertencias cuando se acerca al límite
 *
 * @component
 * @param {Object} props
 * @param {string} props.variant - "full" (default) o "sidebar" para versión compacta
 */
export default function UsoSesiones({ variant = 'full' }) {
  const [datosUso, setDatosUso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatosUso();

    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      cargarDatosUso();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const cargarDatosUso = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sesiones/uso-diario');
      setDatosUso(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar uso de sesiones:', err);
      setError('No se pudo cargar el uso de sesiones');
    } finally {
      setLoading(false);
    }
  };

  const calcularPorcentaje = (usado, total) => {
    if (total === 0) return 0;
    return Math.min((usado / total) * 100, 100);
  };

  const obtenerColorBarra = (porcentaje) => {
    if (porcentaje >= 90) return '#ef4444'; // Rojo
    if (porcentaje >= 75) return '#f59e0b'; // Amarillo/Naranja
    if (porcentaje >= 50) return '#3b82f6'; // Azul
    return '#10b981'; // Verde
  };

  const obtenerColorFondo = (porcentaje) => {
    if (porcentaje >= 90) return '#fef2f2'; // Rojo claro
    if (porcentaje >= 75) return '#fffbeb'; // Amarillo claro
    return '#f0f9ff'; // Azul claro
  };

  // Simplificado: Solo mostramos sesiones, cada sesión dura máx 10 min
  const DURACION_MAXIMA_SESION = 10; // minutos

  // Estilos base que se usan en estados de loading/error
  const containerStyles = {
    backgroundColor: 'white',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--spacing-lg)',
    boxShadow: 'var(--shadow-md)',
    marginBottom: 'var(--spacing-lg)',
  };

  const loadingStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-md)',
    padding: 'var(--spacing-xl)',
    color: 'var(--neutral-600)',
  };

  const spinnerStyles = {
    width: '40px',
    height: '40px',
    border: '4px solid var(--neutral-300)',
    borderTop: '4px solid var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const errorStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    padding: 'var(--spacing-xl)',
    color: 'var(--color-error)',
  };

  if (loading && !datosUso) {
    return (
      <div style={containerStyles}>
        <div style={loadingStyles}>
          <div style={spinnerStyles} />
          <p>Cargando uso...</p>
        </div>
      </div>
    );
  }

  if (error || !datosUso) {
    return (
      <div style={containerStyles}>
        <div style={errorStyles}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>{error || 'Error al cargar el uso'}</p>
        </div>
      </div>
    );
  }

  const porcentajeSesiones = calcularPorcentaje(datosUso.sesiones_usadas, datosUso.sesiones_disponibles);
  const colorBarraSesiones = obtenerColorBarra(porcentajeSesiones);
  const colorFondoSesiones = obtenerColorFondo(porcentajeSesiones);
  const mostrarAdvertenciaSesiones = porcentajeSesiones >= 75;

  const headerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--spacing-lg)',
  };

  const tituloStyles = {
    margin: 0,
    fontSize: 'var(--font-size-xl)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--neutral-800)',
  };

  const subtituloStyles = {
    margin: '0.25rem 0 0 0',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--neutral-600)',
  };

  const actualizadoStyles = {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--neutral-500)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
  };

  const usoBloqueStyles = {
    marginBottom: 'var(--spacing-lg)',
    padding: 'var(--spacing-md)',
    backgroundColor: colorFondoSesiones,
    borderRadius: 'var(--radius-lg)',
    border: mostrarAdvertenciaSesiones ? `2px solid ${colorBarraSesiones}` : 'none',
  };

  const usoHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--spacing-sm)',
  };

  const usoTituloStyles = {
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--neutral-800)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
  };

  const usoValorStyles = {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 'var(--font-weight-bold)',
    color: colorBarraSesiones,
  };

  const barraFondoStyles = {
    width: '100%',
    height: '16px',
    backgroundColor: 'white',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  };

  const barraProgresoStyles = (porcentaje, color) => ({
    height: '100%',
    width: `${porcentaje}%`,
    backgroundColor: color,
    borderRadius: 'var(--radius-full)',
    transition: 'width 0.5s ease-out, background-color 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  });

  const advertenciaStyles = {
    marginTop: 'var(--spacing-sm)',
    padding: 'var(--spacing-sm)',
    backgroundColor: 'white',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    fontSize: 'var(--font-size-sm)',
    color: colorBarraSesiones,
  };

  const iconoStyles = {
    fontSize: '1.25rem',
  };

  const infoAdicionalStyles = {
    marginTop: 'var(--spacing-md)',
    padding: 'var(--spacing-md)',
    backgroundColor: 'var(--neutral-100)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--neutral-700)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
  };

  // VARIANTE SIDEBAR (compacto)
  if (variant === 'sidebar') {
    const porcentajeSesiones = calcularPorcentaje(datosUso?.sesiones_usadas || 0, datosUso?.sesiones_disponibles || 1);
    const colorBarra = obtenerColorBarra(porcentajeSesiones);
    const colorFondo = obtenerColorFondo(porcentajeSesiones);
    const mostrarAdvertencia = porcentajeSesiones >= 75;

    return (
      <div
        style={{
          padding: '0.5rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: colorFondo,
          border: mostrarAdvertencia ? `2px solid ${colorBarra}` : 'none',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.125rem' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--neutral-700)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>📱</span>
            <span>Sesiones Hoy</span>
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)', color: colorBarra }}>
            {datosUso?.sesiones_usadas || 0}/{datosUso?.sesiones_disponibles || 0}
          </span>
        </div>

        {/* Nota explicativa */}
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--neutral-500)', marginBottom: '0.25rem' }}>
          Base + extras del día
        </div>

        {/* Barra de progreso */}
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'white',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.06)',
        }}>
          <div style={{
            height: '100%',
            width: `${porcentajeSesiones}%`,
            backgroundColor: colorBarra,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.5s ease-out',
          }} />
        </div>

        {/* Advertencia si está cerca del límite */}
        {mostrarAdvertencia && (
          <div style={{
            marginTop: '0.25rem',
            fontSize: '0.625rem',
            color: colorBarra,
            fontWeight: 'var(--font-weight-semibold)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.125rem',
          }}>
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{porcentajeSesiones >= 100 ? 'Límite' : 'Cerca límite'}</span>
          </div>
        )}
      </div>
    );
  }

  // VARIANTE FULL (original)
  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <div>
          <h2 style={tituloStyles}>Uso de Sesiones Hoy</h2>
          <p style={subtituloStyles}>Monitorea tu consumo diario</p>
        </div>
        <div style={actualizadoStyles}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Actualizado</span>
        </div>
      </div>

      {/* Uso de Sesiones */}
      <div style={{ ...usoBloqueStyles, backgroundColor: colorFondoSesiones, border: mostrarAdvertenciaSesiones ? `2px solid ${colorBarraSesiones}` : 'none' }}>
        <div style={usoHeaderStyles}>
          <div style={usoTituloStyles}>
            <span style={iconoStyles}>📱</span>
            <span>Sesiones</span>
          </div>
          <div style={{ ...usoValorStyles, color: colorBarraSesiones }}>
            {datosUso.sesiones_usadas} / {datosUso.sesiones_disponibles}
          </div>
        </div>

        <div style={barraFondoStyles}>
          <div style={barraProgresoStyles(porcentajeSesiones, colorBarraSesiones)}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'shimmer 2s infinite',
            }} />
          </div>
        </div>

        {mostrarAdvertenciaSesiones && (
          <div style={{ ...advertenciaStyles, color: colorBarraSesiones }}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>
              {porcentajeSesiones >= 100
                ? '¡Límite alcanzado! No puedes iniciar más sesiones hoy.'
                : '¡Cuidado! Te estás acercando al límite de sesiones.'}
            </span>
          </div>
        )}
      </div>

      {/* Información adicional sobre duración */}
      <div style={{
        padding: 'var(--spacing-md)',
        backgroundColor: '#eff6ff',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-size-sm)',
        color: '#1e40af',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-md)',
      }}>
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <span>
          ⏱️ Cada sesión dura máximo {DURACION_MAXIMA_SESION} minutos
        </span>
      </div>

      {/* Info adicional */}
      <div style={infoAdicionalStyles}>
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span>
          💡 <strong>Tip:</strong> Paga un documento para obtener +2 sesiones extra hoy mismo
        </span>
      </div>

      {/* Animaciones CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
