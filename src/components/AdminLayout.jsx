import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

/**
 * AdminLayout - Layout para páginas de administración
 *
 * Incluye:
 * - Sidebar con navegación
 * - Header con info de admin
 * - Área de contenido principal
 * - Diseño responsivo
 *
 * @component
 */
export default function AdminLayout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      path: '/admin/reembolsos',
      label: 'Reembolsos',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      ),
    },
    {
      path: '/app/avatar',
      label: 'Volver a la App',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      ),
      divider: true,
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const containerStyles = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--neutral-200)',
  };

  const sidebarStyles = {
    width: sidebarOpen ? '16rem' : '5rem',
    backgroundColor: 'white',
    borderRight: '1px solid var(--neutral-300)',
    transition: 'width 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    zIndex: 100,
  };

  const mainContentStyles = {
    flex: 1,
    marginLeft: sidebarOpen ? '16rem' : '5rem',
    transition: 'margin-left 0.3s ease',
  };

  const headerStyles = {
    backgroundColor: 'white',
    borderBottom: '1px solid var(--neutral-300)',
    padding: 'var(--spacing-lg) var(--spacing-xl)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const contentStyles = {
    padding: 'var(--spacing-xl)',
  };

  const sidebarHeaderStyles = {
    padding: 'var(--spacing-lg)',
    borderBottom: '1px solid var(--neutral-300)',
  };

  const menuItemStyles = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    padding: 'var(--spacing-md) var(--spacing-lg)',
    margin: '0 var(--spacing-sm)',
    color: active ? 'white' : 'var(--neutral-600)',
    backgroundColor: active ? 'var(--color-primary)' : 'transparent',
    cursor: 'pointer',
    transition: 'all var(--transition-base)',
    textDecoration: 'none',
    borderRadius: 'var(--radius-lg)',
    border: 'none',
  });

  const dividerStyles = {
    height: '1px',
    backgroundColor: 'var(--neutral-300)',
    margin: 'var(--spacing-md) 0',
  };

  return (
    <div style={containerStyles}>
      {/* Sidebar */}
      <aside style={sidebarStyles}>
        {/* Header del sidebar */}
        <div style={sidebarHeaderStyles}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {sidebarOpen && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <img
                  src="/assets/logo.png"
                  alt="Abogadai Logo"
                  style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                />
                <h1 style={{ margin: 0, fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', letterSpacing: '-0.5px' }}>
                  <span style={{ color: '#1a1a1a' }}>Abogad</span>
                  <span style={{ color: '#0b6dff' }}>ai</span>
                </h1>
              </div>
            )}
            {!sidebarOpen && (
              <img
                src="/assets/logo.png"
                alt="Abogadai Logo"
                style={{ width: '36px', height: '36px', objectFit: 'contain', margin: '0 auto' }}
              />
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: 'var(--spacing-xs)',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: 'var(--neutral-500)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--neutral-200)';
                e.currentTarget.style.color = 'var(--neutral-800)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--neutral-500)';
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu items */}
        <nav style={{ flex: 1, padding: 'var(--spacing-md) 0' }}>
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.divider && <div style={dividerStyles} />}
              <Link
                to={item.path}
                style={menuItemStyles(isActive(item.path))}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = 'var(--neutral-200)';
                    e.currentTarget.style.color = 'var(--neutral-800)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--neutral-600)';
                  }
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                {sidebarOpen && (
                  <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    {item.label}
                  </span>
                )}
              </Link>
            </div>
          ))}
        </nav>

        {/* User info */}
        <div
          style={{
            padding: 'var(--spacing-lg)',
            borderTop: '1px solid var(--neutral-300)',
          }}
        >
          {sidebarOpen ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <button
                onClick={() => navigate('/app/perfil')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  padding: 'var(--spacing-sm)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--neutral-200)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'white',
                  }}
                >
                  {user?.nombre?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--neutral-800)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user?.nombre || 'Administrador'}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--neutral-500)',
                    }}
                  >
                    {user?.email || ''}
                  </p>
                </div>
              </button>

              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--neutral-600)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--neutral-200)';
                  e.currentTarget.style.color = 'var(--neutral-800)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--neutral-600)';
                }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Cerrar sesión</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <button
                onClick={() => navigate('/app/perfil')}
                style={{
                  padding: 0,
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.15)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(11, 109, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'white',
                  }}
                >
                  {user?.nombre?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              </button>

              <button
                onClick={handleLogout}
                style={{
                  padding: 'var(--spacing-sm)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--neutral-600)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--neutral-200)';
                  e.currentTarget.style.color = 'var(--neutral-800)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--neutral-600)';
                }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main style={mainContentStyles}>
        {/* Header */}
        <header style={headerStyles}>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--neutral-800)',
              }}
            >
              {title}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div
              style={{
                padding: 'var(--spacing-xs) var(--spacing-md)',
                backgroundColor: 'var(--color-success-light)',
                color: 'var(--color-success-dark)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              🛡️ Admin
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={contentStyles}>{children}</div>
      </main>
    </div>
  );
}
