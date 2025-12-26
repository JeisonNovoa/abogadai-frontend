import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedAdminRoute - Componente para proteger rutas de administración
 *
 * Verifica que:
 * 1. El usuario esté autenticado
 * 2. El usuario tenga rol de administrador
 *
 * Si no cumple, redirige a la página correspondiente
 *
 * @component
 */
export default function ProtectedAdminRoute({ children }) {
  const { user, loading } = useAuth();

  // DEBUG: Mostrar en consola el estado actual
  console.log('ProtectedAdminRoute - Estado:', { user, loading, is_admin: user?.is_admin });

  if (loading) {
    // Mostrar loading mientras se verifica la autenticación
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--neutral-200)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
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
          <p style={{ color: 'var(--neutral-600)' }}>Verificando permisos...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!user) {
    console.log('ProtectedAdminRoute - No hay usuario, redirigiendo a login');
    // Guardar la URL actual para redirigir después del login
    const currentPath = window.location.pathname;
    sessionStorage.setItem('redirectAfterLogin', currentPath);
    console.log('ProtectedAdminRoute - URL guardada para después del login:', currentPath);
    return <Navigate to="/login" replace />;
  }

  // Si no es admin, redirigir a la app principal
  // Verificar si el usuario tiene el rol de admin
  const isAdmin = user.es_admin || user.rol === 'admin' || user.is_admin;

  console.log('ProtectedAdminRoute - isAdmin:', isAdmin, 'user.is_admin:', user.is_admin);

  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--neutral-200)',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--spacing-xl)',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>🚫</div>
          <h2
            style={{
              margin: 0,
              marginBottom: 'var(--spacing-sm)',
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--neutral-800)',
            }}
          >
            Acceso Denegado
          </h2>
          <p style={{ color: 'var(--neutral-600)', marginBottom: 'var(--spacing-lg)' }}>
            No tienes permisos de administrador para acceder a esta página.
          </p>
          <a
            href="/app/avatar"
            style={{
              display: 'inline-block',
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              borderRadius: 'var(--radius-lg)',
              textDecoration: 'none',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            Volver a la Aplicación
          </a>
        </div>
      </div>
    );
  }

  // Si es admin, renderizar el contenido
  return children;
}
