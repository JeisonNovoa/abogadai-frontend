import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import api, { API_URL } from '../../services/api';

/**
 * AdminReembolsos - Página de gestión de solicitudes de reembolso
 *
 * Funcionalidades:
 * - Ver todas las solicitudes de reembolso pendientes
 * - Ver evidencia adjunta
 * - Aprobar solicitudes (con confirmación)
 * - Rechazar solicitudes (con razón)
 * - Filtrar por estado
 *
 * @component
 */
export default function AdminReembolsos() {
  const toast = useToast();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('pendientes'); // pendientes, aprobadas, rechazadas, todas

  // Estados para modales
  const [showModalAprobar, setShowModalAprobar] = useState(false);
  const [showModalRechazar, setShowModalRechazar] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [razonRechazo, setRazonRechazo] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      // Siempre cargar TODAS las solicitudes para los contadores
      const response = await api.get('/admin/reembolsos', {
        params: { estado: 'todas' },
      });
      setSolicitudes(response.data);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      toast.error('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModalAprobar = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setShowModalAprobar(true);
  };

  const handleAbrirModalRechazar = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setRazonRechazo('');
    setShowModalRechazar(true);
  };

  const handleAprobar = async () => {
    if (!solicitudSeleccionada) return;

    try {
      setProcesando(true);
      await api.post(`/admin/reembolsos/${solicitudSeleccionada.caso_id}/aprobar`);
      toast.success('Solicitud aprobada exitosamente');
      setShowModalAprobar(false);
      setSolicitudSeleccionada(null);
      cargarSolicitudes();
    } catch (error) {
      console.error('Error aprobando solicitud:', error);
      toast.error(error.response?.data?.detail || 'Error al aprobar la solicitud');
    } finally {
      setProcesando(false);
    }
  };

  const handleRechazar = async () => {
    if (!solicitudSeleccionada) return;

    if (!razonRechazo.trim()) {
      toast.error('Debes proporcionar una razón para el rechazo');
      return;
    }

    try {
      setProcesando(true);
      await api.post(`/admin/reembolsos/${solicitudSeleccionada.caso_id}/rechazar`, {
        razon: razonRechazo.trim(),
      });
      toast.success('Solicitud rechazada');
      setShowModalRechazar(false);
      setSolicitudSeleccionada(null);
      setRazonRechazo('');
      cargarSolicitudes();
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
      toast.error(error.response?.data?.detail || 'Error al rechazar la solicitud');
    } finally {
      setProcesando(false);
    }
  };

  const handleVerEvidencia = (url) => {
    if (!url) {
      toast.info('No hay evidencia adjunta');
      return;
    }

    // Si la URL es relativa, construir la URL completa con el backend
    let urlCompleta = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      urlCompleta = `${API_URL}${url.startsWith('/') ? url : '/' + url}`;
    }

    window.open(urlCompleta, '_blank', 'noopener,noreferrer');
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(monto);
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: {
        bg: 'var(--color-warning-light)',
        color: 'var(--color-warning-dark)',
        text: '⏳ Pendiente',
      },
      aprobado: {
        bg: 'var(--color-success-light)',
        color: 'var(--color-success-dark)',
        text: '✅ Aprobado',
      },
      rechazado: {
        bg: '#fef2f2',
        color: 'var(--color-error)',
        text: '❌ Rechazado',
      },
    };

    const badge = badges[estado] || badges.pendiente;

    return (
      <span
        style={{
          padding: 'var(--spacing-xs) var(--spacing-md)',
          backgroundColor: badge.bg,
          color: badge.color,
          borderRadius: 'var(--radius-full)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-semibold)',
        }}
      >
        {badge.text}
      </span>
    );
  };

  const solicitudesFiltradas = solicitudes.filter((sol) => {
    if (filtro === 'todas') return true;
    if (filtro === 'pendientes') return sol.estado === 'pendiente';
    if (filtro === 'aprobadas') return sol.estado === 'aprobado';
    if (filtro === 'rechazadas') return sol.estado === 'rechazado';
    return true;
  });

  if (loading) {
    return (
      <AdminLayout title="Gestión de Reembolsos">
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
          <p style={{ color: 'var(--neutral-600)' }}>Cargando solicitudes...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestión de Reembolsos">
      {/* Filtros */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--neutral-800)' }}>
            Filtros
          </h3>
          <Button variant="ghost" size="sm" onClick={cargarSolicitudes}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </Button>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <button
            onClick={() => setFiltro('pendientes')}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              backgroundColor: filtro === 'pendientes' ? 'var(--color-warning)' : 'var(--neutral-200)',
              color: filtro === 'pendientes' ? 'white' : 'var(--neutral-700)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: 'var(--font-weight-medium)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            Pendientes ({solicitudes.filter((s) => s.estado === 'pendiente').length})
          </button>
          <button
            onClick={() => setFiltro('aprobadas')}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              backgroundColor: filtro === 'aprobadas' ? 'var(--color-success)' : 'var(--neutral-200)',
              color: filtro === 'aprobadas' ? 'white' : 'var(--neutral-700)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: 'var(--font-weight-medium)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            Aprobadas ({solicitudes.filter((s) => s.estado === 'aprobado').length})
          </button>
          <button
            onClick={() => setFiltro('rechazadas')}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              backgroundColor: filtro === 'rechazadas' ? 'var(--color-error)' : 'var(--neutral-200)',
              color: filtro === 'rechazadas' ? 'white' : 'var(--neutral-700)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: 'var(--font-weight-medium)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            Rechazadas ({solicitudes.filter((s) => s.estado === 'rechazado').length})
          </button>
          <button
            onClick={() => setFiltro('todas')}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              backgroundColor: filtro === 'todas' ? 'var(--color-primary)' : 'var(--neutral-200)',
              color: filtro === 'todas' ? 'white' : 'var(--neutral-700)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: 'var(--font-weight-medium)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            Todas ({solicitudes.length})
          </button>
        </div>
      </div>

      {/* Tabla de solicitudes */}
      {solicitudesFiltradas.length === 0 ? (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>📭</div>
          <h3 style={{ margin: 0, marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-xl)', color: 'var(--neutral-800)' }}>
            No hay solicitudes
          </h3>
          <p style={{ margin: 0, color: 'var(--neutral-600)' }}>No se encontraron solicitudes de reembolso con los filtros aplicados</p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--neutral-100)', borderBottom: '2px solid var(--neutral-300)' }}>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--neutral-700)' }}>Caso ID</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--neutral-700)' }}>Usuario</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--neutral-700)' }}>Monto</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--neutral-700)' }}>Fecha</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--neutral-700)' }}>Estado</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--neutral-700)' }}>Motivo</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--neutral-700)' }}>Evidencia</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'right', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--neutral-700)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudesFiltradas.map((solicitud) => (
                  <tr key={solicitud.caso_id} style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                    <td style={{ padding: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--neutral-800)', fontWeight: 'var(--font-weight-medium)' }}>
                      #{solicitud.caso_id}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--neutral-800)' }}>
                      <div>
                        <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{solicitud.usuario?.nombre || 'Desconocido'}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--neutral-600)' }}>{solicitud.usuario?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--neutral-800)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {formatearMonto(solicitud.monto)}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)' }}>
                      {formatearFecha(solicitud.fecha_solicitud)}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)' }}>{getEstadoBadge(solicitud.estado)}</td>
                    <td style={{ padding: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--neutral-700)', maxWidth: '250px' }}>
                      <div
                        style={{
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          wordBreak: 'break-word'
                        }}
                        title={solicitud.motivo}
                      >
                        {solicitud.motivo}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                      {solicitud.evidencia_url ? (
                        <Button variant="ghost" size="sm" onClick={() => handleVerEvidencia(solicitud.evidencia_url)}>
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Button>
                      ) : (
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--neutral-500)' }}>Sin evidencia</span>
                      )}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>
                      {solicitud.estado === 'pendiente' && (
                        <div style={{ display: 'flex', gap: 'var(--spacing-xs)', justifyContent: 'flex-end' }}>
                          <Button variant="success" size="sm" onClick={() => handleAbrirModalAprobar(solicitud)}>
                            Aprobar
                          </Button>
                          <Button variant="error" size="sm" onClick={() => handleAbrirModalRechazar(solicitud)}>
                            Rechazar
                          </Button>
                        </div>
                      )}
                      {solicitud.estado !== 'pendiente' && (
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--neutral-500)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de aprobar */}
      <Modal
        isOpen={showModalAprobar}
        onClose={() => setShowModalAprobar(false)}
        title="Aprobar Solicitud de Reembolso"
        size="sm"
        footer={
          <>
            <Button variant="neutral" onClick={() => setShowModalAprobar(false)} disabled={procesando}>
              Cancelar
            </Button>
            <Button variant="success" onClick={handleAprobar} loading={procesando} disabled={procesando}>
              Confirmar Aprobación
            </Button>
          </>
        }
      >
        <div>
          <p style={{ marginBottom: 'var(--spacing-md)', color: 'var(--neutral-700)' }}>
            ¿Estás seguro de que deseas aprobar la solicitud de reembolso para el caso{' '}
            <strong>#{solicitudSeleccionada?.caso_id}</strong>?
          </p>
          <div
            style={{
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--color-warning-light)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-md)',
            }}
          >
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-warning-dark)' }}>
              <strong>⚠️ Importante:</strong> Esta acción realizará lo siguiente:
            </p>
            <ul style={{ margin: 'var(--spacing-sm) 0 0 0', paddingLeft: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)', color: 'var(--color-warning-dark)' }}>
              <li>Se procesará el reembolso de {solicitudSeleccionada && formatearMonto(solicitudSeleccionada.monto)}</li>
              <li>El nivel del usuario se reducirá en 1 pago</li>
              <li>El documento se bloqueará nuevamente</li>
              <li>Se enviará un email de confirmación al usuario</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Modal de rechazar */}
      <Modal
        isOpen={showModalRechazar}
        onClose={() => setShowModalRechazar(false)}
        title="Rechazar Solicitud de Reembolso"
        size="md"
        footer={
          <>
            <Button variant="neutral" onClick={() => setShowModalRechazar(false)} disabled={procesando}>
              Cancelar
            </Button>
            <Button variant="error" onClick={handleRechazar} loading={procesando} disabled={procesando}>
              Confirmar Rechazo
            </Button>
          </>
        }
      >
        <div>
          <p style={{ marginBottom: 'var(--spacing-md)', color: 'var(--neutral-700)' }}>
            ¿Estás seguro de que deseas rechazar la solicitud de reembolso para el caso{' '}
            <strong>#{solicitudSeleccionada?.caso_id}</strong>?
          </p>

          <Input
            label="Razón del rechazo"
            placeholder="Explica por qué se rechaza la solicitud..."
            value={razonRechazo}
            onChange={(e) => setRazonRechazo(e.target.value)}
            required
            error={!razonRechazo.trim() ? 'La razón es obligatoria' : ''}
          />

          <div
            style={{
              padding: 'var(--spacing-md)',
              backgroundColor: '#fef2f2',
              borderRadius: 'var(--radius-md)',
              marginTop: 'var(--spacing-md)',
            }}
          >
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-error)' }}>
              <strong>ℹ️ Nota:</strong> Se enviará un email al usuario con la razón del rechazo.
            </p>
          </div>
        </div>
      </Modal>

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
