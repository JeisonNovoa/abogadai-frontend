import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import api from '../../services/api';

/**
 * AdminDashboard - Dashboard de administración con métricas
 *
 * Muestra:
 * - Distribución de niveles de usuarios
 * - Métricas de uso de sesiones
 * - Estadísticas de reembolsos
 * - Gráficos visuales simples
 *
 * @component
 */
export default function AdminDashboard() {
  const toast = useToast();
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMetricas();
  }, []);

  const cargarMetricas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/metricas');
      setMetricas(response.data);
    } catch (error) {
      console.error('Error cargando métricas:', error);
      toast.error('Error al cargar las métricas');
    } finally {
      setLoading(false);
    }
  };

  const calcularPorcentaje = (valor, total) => {
    if (total === 0) return 0;
    return Math.round((valor / total) * 100);
  };

  const formatearNumero = (numero) => {
    return new Intl.NumberFormat('es-CO').format(numero);
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid var(--neutral-300)',
              borderTop: '4px solid var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto var(--spacing-md)',
            }}
          />
          <p style={{ color: 'var(--neutral-600)' }}>Cargando métricas...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!metricas) {
    return (
      <AdminLayout title="Dashboard">
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'var(--neutral-600)' }}>No se pudieron cargar las métricas</p>
          <Button variant="primary" onClick={cargarMetricas} style={{ marginTop: 'var(--spacing-md)' }}>
            Reintentar
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {/* Header con actualización */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <p style={{ margin: 0, color: 'var(--neutral-600)', fontSize: 'var(--font-size-sm)' }}>
            Última actualización: {new Date().toLocaleTimeString('es-CO')}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={cargarMetricas}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </Button>
      </div>

      {/* Cards de resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-lg)',
            boxShadow: 'var(--shadow-sm)',
            borderLeft: '4px solid var(--color-primary)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', fontWeight: 'var(--font-weight-medium)' }}>
                Total Usuarios
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--neutral-800)' }}>
                {formatearNumero(metricas.usuarios.total)}
              </p>
            </div>
            <div style={{ fontSize: '2rem' }}>👥</div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-lg)',
            boxShadow: 'var(--shadow-sm)',
            borderLeft: '4px solid var(--color-success)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', fontWeight: 'var(--font-weight-medium)' }}>
                Sesiones Hoy
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--neutral-800)' }}>
                {formatearNumero(metricas.sesiones.hoy)}
              </p>
            </div>
            <div style={{ fontSize: '2rem' }}>📱</div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-lg)',
            boxShadow: 'var(--shadow-sm)',
            borderLeft: '4px solid var(--color-warning)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', fontWeight: 'var(--font-weight-medium)' }}>
                Reembolsos Pendientes
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--neutral-800)' }}>
                {formatearNumero(metricas.reembolsos.pendientes)}
              </p>
            </div>
            <div style={{ fontSize: '2rem' }}>⏳</div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-lg)',
            boxShadow: 'var(--shadow-sm)',
            borderLeft: '4px solid #fbbf24',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', fontWeight: 'var(--font-weight-medium)' }}>
                Documentos Pagados
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--neutral-800)' }}>
                {formatearNumero(metricas.documentos.pagados)}
              </p>
            </div>
            <div style={{ fontSize: '2rem' }}>💰</div>
          </div>
        </div>
      </div>

      {/* Distribución de niveles */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-lg)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 'var(--spacing-xl)',
        }}
      >
        <h2 style={{ margin: '0 0 var(--spacing-lg) 0', fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--neutral-800)' }}>
          Distribución de Niveles
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)' }}>
          {Object.entries(metricas.niveles).map(([nivel, cantidad]) => {
            const colores = {
              FREE: { bg: '#6b7280', light: '#f3f4f6' },
              BRONCE: { bg: '#cd7f32', light: '#fef3c7' },
              PLATA: { bg: '#c0c0c0', light: '#f3f4f6' },
              ORO: { bg: '#ffd700', light: '#fef9c3' },
            };

            const iconos = {
              FREE: '🆓',
              BRONCE: '🥉',
              PLATA: '🥈',
              ORO: '🥇',
            };

            const color = colores[nivel] || colores.FREE;
            const porcentaje = calcularPorcentaje(cantidad, metricas.usuarios.total);

            return (
              <div
                key={nivel}
                style={{
                  padding: 'var(--spacing-md)',
                  backgroundColor: color.light,
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${color.bg}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                  <span style={{ fontSize: '1.5rem' }}>{iconos[nivel]}</span>
                  <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--neutral-800)' }}>
                    {nivel}
                  </span>
                </div>
                <p style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: color.bg }}>
                  {formatearNumero(cantidad)}
                </p>
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)' }}>{porcentaje}% del total</p>

                {/* Barra de progreso simple */}
                <div
                  style={{
                    marginTop: 'var(--spacing-sm)',
                    height: '6px',
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${porcentaje}%`,
                      backgroundColor: color.bg,
                      transition: 'width 0.5s ease-out',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estadísticas de Reembolsos */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-lg)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 'var(--spacing-xl)',
        }}
      >
        <h2 style={{ margin: '0 0 var(--spacing-lg) 0', fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--neutral-800)' }}>
          Estadísticas de Reembolsos
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-md)' }}>
          <div style={{ textAlign: 'center', padding: 'var(--spacing-md)', backgroundColor: 'var(--neutral-100)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: 'var(--font-size-xs)', color: 'var(--neutral-600)', textTransform: 'uppercase', fontWeight: 'var(--font-weight-semibold)' }}>
              Total
            </p>
            <p style={{ margin: 0, fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--neutral-800)' }}>
              {formatearNumero(metricas.reembolsos.total)}
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: 'var(--spacing-md)', backgroundColor: '#fffbeb', borderRadius: 'var(--radius-md)' }}>
            <p style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-warning-dark)', textTransform: 'uppercase', fontWeight: 'var(--font-weight-semibold)' }}>
              Pendientes
            </p>
            <p style={{ margin: 0, fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-warning)' }}>
              {formatearNumero(metricas.reembolsos.pendientes)}
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: 'var(--spacing-md)', backgroundColor: 'var(--color-success-light)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-success-dark)', textTransform: 'uppercase', fontWeight: 'var(--font-weight-semibold)' }}>
              Aprobados
            </p>
            <p style={{ margin: 0, fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>
              {formatearNumero(metricas.reembolsos.aprobados)}
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: 'var(--spacing-md)', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-md)' }}>
            <p style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', textTransform: 'uppercase', fontWeight: 'var(--font-weight-semibold)' }}>
              Rechazados
            </p>
            <p style={{ margin: 0, fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-error)' }}>
              {formatearNumero(metricas.reembolsos.rechazados)}
            </p>
          </div>
        </div>

        {/* Tasa de aprobación */}
        {metricas.reembolsos.total > 0 && (
          <div style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', backgroundColor: 'var(--neutral-100)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: 'var(--font-size-sm)', color: 'var(--neutral-700)', fontWeight: 'var(--font-weight-medium)' }}>
              Tasa de Aprobación
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div
                style={{
                  flex: 1,
                  height: '24px',
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${calcularPorcentaje(metricas.reembolsos.aprobados, metricas.reembolsos.total)}%`,
                    backgroundColor: 'var(--color-success)',
                    transition: 'width 0.5s ease-out',
                  }}
                />
              </div>
              <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>
                {calcularPorcentaje(metricas.reembolsos.aprobados, metricas.reembolsos.total)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Uso de Sesiones */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h2 style={{ margin: '0 0 var(--spacing-lg) 0', fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--neutral-800)' }}>
          Uso de Sesiones
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)' }}>
          <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--neutral-100)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', fontWeight: 'var(--font-weight-medium)' }}>
              Sesiones Hoy
            </p>
            <p style={{ margin: 0, fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
              {formatearNumero(metricas.sesiones.hoy)}
            </p>
          </div>

          <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--neutral-100)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', fontWeight: 'var(--font-weight-medium)' }}>
              Promedio por Usuario
            </p>
            <p style={{ margin: 0, fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
              {metricas.sesiones.promedio_por_usuario?.toFixed(1) || '0.0'}
            </p>
          </div>

          <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--neutral-100)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', fontWeight: 'var(--font-weight-medium)' }}>
              Duración Promedio
            </p>
            <p style={{ margin: 0, fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
              {metricas.sesiones.duracion_promedio || '0'} min
            </p>
          </div>
        </div>
      </div>

      {/* Animación de spin */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </AdminLayout>
  );
}
