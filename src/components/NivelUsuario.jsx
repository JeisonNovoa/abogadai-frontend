import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Componente NivelUsuario - Sistema de Niveles Abogadai
 *
 * Muestra el nivel actual del usuario, progreso y beneficios
 * Niveles: FREE, BRONCE, PLATA, ORO
 *
 * @component
 * @param {Object} props
 * @param {string} props.variant - "full" (default) o "sidebar" para versión compacta
 */
export default function NivelUsuario({ variant = 'full' }) {
  const [datosNivel, setDatosNivel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatosNivel();

    // Actualizar cada 10 segundos
    const interval = setInterval(() => {
      cargarDatosNivel();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const cargarDatosNivel = async () => {
    try {
      setLoading(true);
      const response = await api.get('/usuarios/mi-nivel');
      setDatosNivel(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar nivel:', err);
      setError('No se pudo cargar el nivel del usuario');
    } finally {
      setLoading(false);
    }
  };

  const configuracionNiveles = {
    FREE: {
      color: '#6b7280',
      gradiente: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
      icono: '🆓',
      nombre: 'Free',
    },
    BRONCE: {
      color: '#cd7f32',
      gradiente: 'linear-gradient(135deg, #cd7f32 0%, #e8a87c 100%)',
      icono: '🥉',
      nombre: 'Bronce',
    },
    PLATA: {
      color: '#c0c0c0',
      gradiente: 'linear-gradient(135deg, #c0c0c0 0%, #e5e5e5 100%)',
      icono: '🥈',
      nombre: 'Plata',
    },
    ORO: {
      color: '#ffd700',
      gradiente: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
      icono: '🥇',
      nombre: 'Oro',
    },
  };

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

  if (loading) {
    return (
      <div style={containerStyles}>
        <div style={loadingStyles}>
          <div style={spinnerStyles} />
          <p>Cargando nivel...</p>
        </div>
      </div>
    );
  }

  if (error || !datosNivel) {
    return (
      <div style={containerStyles}>
        <div style={errorStyles}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>{error || 'Error al cargar el nivel'}</p>
        </div>
      </div>
    );
  }

  const config = configuracionNiveles[datosNivel.nivel_actual] || configuracionNiveles.FREE;
  const progreso = datosNivel.pagos_hasta_siguiente > 0
    ? (datosNivel.pagos_en_nivel / datosNivel.pagos_hasta_siguiente) * 100
    : 100;

  const headerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--spacing-md)',
  };

  const badgeStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    padding: 'var(--spacing-sm) var(--spacing-lg)',
    background: config.gradiente,
    borderRadius: 'var(--radius-full)',
    color: datosNivel.nivel_actual === 'FREE' ? 'white' : '#1b1b1b',
    fontSize: 'var(--font-size-lg)',
    fontWeight: 'var(--font-weight-bold)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    animation: 'badgePulse 2s ease-in-out infinite',
  };

  const progresoContainerStyles = {
    marginBottom: 'var(--spacing-lg)',
  };

  const progresoBarraFondoStyles = {
    width: '100%',
    height: '12px',
    backgroundColor: 'var(--neutral-200)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
    position: 'relative',
  };

  const progresoBarraStyles = {
    height: '100%',
    background: config.gradiente,
    borderRadius: 'var(--radius-full)',
    width: `${Math.min(progreso, 100)}%`,
    transition: 'width 0.5s ease-out',
    position: 'relative',
    overflow: 'hidden',
  };

  const progresoTextoStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'var(--spacing-xs)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--neutral-600)',
  };

  const beneficiosStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--spacing-md)',
    marginTop: 'var(--spacing-md)',
  };

  const beneficioItemStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    padding: 'var(--spacing-sm)',
    backgroundColor: 'var(--neutral-100)',
    borderRadius: 'var(--radius-md)',
  };

  const beneficioIconoStyles = {
    fontSize: '1.5rem',
  };

  const beneficioTextoStyles = {
    flex: 1,
  };

  const beneficioTituloStyles = {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--neutral-700)',
    marginBottom: '0.125rem',
  };

  const beneficioValorStyles = {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-primary)',
  };

  const tituloSeccionStyles = {
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--neutral-700)',
    marginBottom: 'var(--spacing-sm)',
    marginTop: 'var(--spacing-md)',
  };

  // VARIANTE SIDEBAR (compacto)
  if (variant === 'sidebar') {
    const config = configuracionNiveles[datosNivel?.nivel_actual] || configuracionNiveles.FREE;
    const progreso = datosNivel?.pagos_hasta_siguiente > 0
      ? (datosNivel.pagos_en_nivel / datosNivel.pagos_hasta_siguiente) * 100
      : 100;

    return (
      <div
        style={{
          padding: '0.5rem',
          marginBottom: '0.5rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--neutral-100)',
        }}
      >
        {/* Header compacto */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--neutral-700)' }}>
            Tu Nivel
          </span>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.125rem 0.375rem',
              background: config.gradiente,
              borderRadius: 'var(--radius-full)',
              color: datosNivel?.nivel_actual === 'FREE' ? 'white' : '#1b1b1b',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-bold)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <span style={{ fontSize: '0.875rem' }}>{config.icono}</span>
            <span>{config.nombre}</span>
          </div>
        </div>

        {/* Barra de progreso */}
        {datosNivel?.siguiente_nivel && (
          <div style={{ marginTop: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.125rem' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--neutral-600)' }}>
                {datosNivel.pagos_en_nivel}/{datosNivel.pagos_hasta_siguiente}
              </span>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: config.color }}>
                {Math.round(progreso)}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: 'white',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                background: config.gradiente,
                width: `${Math.min(progreso, 100)}%`,
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.5s ease-out',
              }} />
            </div>
          </div>
        )}

        {/* Stats compactos - Solo sesiones */}
        <div style={{
          marginTop: '0.375rem',
          fontSize: 'var(--font-size-xs)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.125rem' }}>
            <span>📱</span>
            <span style={{ color: 'var(--neutral-700)' }}>{datosNivel?.sesiones_maximas} sesiones base/día</span>
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--neutral-500)', paddingLeft: '1.25rem' }}>
            + 2 extras por cada pago
          </div>
        </div>
      </div>
    );
  }

  // VARIANTE FULL (original)
  return (
    <div style={containerStyles}>
      {/* Header con badge de nivel */}
      <div style={headerStyles}>
        <div>
          <h2 style={{ margin: 0, fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--neutral-800)' }}>
            Tu Nivel
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)' }}>
            Nivel actual de tu cuenta
          </p>
        </div>
        <div style={badgeStyles}>
          <span style={beneficioIconoStyles}>{config.icono}</span>
          <span>{config.nombre}</span>
        </div>
      </div>

      {/* Barra de progreso hacia siguiente nivel */}
      {datosNivel.siguiente_nivel && (
        <div style={progresoContainerStyles}>
          <p style={tituloSeccionStyles}>
            Progreso hacia {configuracionNiveles[datosNivel.siguiente_nivel]?.nombre || datosNivel.siguiente_nivel}
          </p>
          <div style={progresoBarraFondoStyles}>
            <div style={progresoBarraStyles}>
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
          <div style={progresoTextoStyles}>
            <span>
              {datosNivel.pagos_en_nivel} de {datosNivel.pagos_hasta_siguiente} pagos
            </span>
            <span style={{ fontWeight: 'var(--font-weight-semibold)', color: config.color }}>
              {Math.round(progreso)}%
            </span>
          </div>
        </div>
      )}

      {/* Beneficios del nivel actual */}
      <div>
        <p style={tituloSeccionStyles}>Beneficios de tu nivel</p>
        <div style={beneficiosStyles}>
          <div style={beneficioItemStyles}>
            <span style={beneficioIconoStyles}>📱</span>
            <div style={beneficioTextoStyles}>
              <div style={beneficioTituloStyles}>Sesiones diarias</div>
              <div style={beneficioValorStyles}>{datosNivel.sesiones_maximas}</div>
            </div>
          </div>

          <div style={beneficioItemStyles}>
            <span style={beneficioIconoStyles}>⏱️</span>
            <div style={beneficioTextoStyles}>
              <div style={beneficioTituloStyles}>Minutos por sesión</div>
              <div style={beneficioValorStyles}>{datosNivel.minutos_maximos}</div>
            </div>
          </div>

          <div style={beneficioItemStyles}>
            <span style={beneficioIconoStyles}>📄</span>
            <div style={beneficioTextoStyles}>
              <div style={beneficioTituloStyles}>Docs sin pagar</div>
              <div style={beneficioValorStyles}>{datosNivel.max_docs_sin_pagar}</div>
            </div>
          </div>

          <div style={beneficioItemStyles}>
            <span style={beneficioIconoStyles}>💰</span>
            <div style={beneficioTextoStyles}>
              <div style={beneficioTituloStyles}>Precio por doc</div>
              <div style={beneficioValorStyles}>${datosNivel.precio_documento}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Animaciones CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
