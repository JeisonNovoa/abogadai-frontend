import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Inicio',
      path: '/app/avatar',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Mis Casos',
      path: '/app/casos',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      name: 'Mi Perfil',
      path: '/app/perfil',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  // Obtener iniciales del usuario
  const getUserInitials = () => {
    if (!user?.nombre) return 'U';
    const names = user.nombre.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.nombre.substring(0, 2).toUpperCase();
  };

  return (
    <aside
      className="flex flex-col h-screen transition-all duration-300 ease-in-out animate-fadeIn"
      style={{
        width: isExpanded ? '16rem' : '5rem',
        backgroundColor: 'var(--neutral-900)',
        borderRight: '1px solid var(--neutral-700)',
      }}
      role="navigation"
      aria-label="Navegación principal"
    >
      {/* Header - Logo */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-neutral-700">
        {isExpanded && (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              A
            </div>
            <h1 className="text-xl font-bold text-white">Abogadai</h1>
          </div>
        )}
        {!isExpanded && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white mx-auto"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            A
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-md hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          title={isExpanded ? 'Contraer menú' : 'Expandir menú'}
          aria-label={isExpanded ? 'Contraer menú' : 'Expandir menú'}
          aria-expanded={isExpanded}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {isExpanded ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
            })}
          >
            <div className="flex-shrink-0">{item.icon}</div>
            {isExpanded && (
              <span className="font-medium text-sm">{item.name}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-neutral-700 p-4">
        {isExpanded ? (
          <div className="space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3 px-2 py-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.nombre || 'Usuario'}
                </p>
                <p className="text-xs text-neutral-400 truncate">
                  {user?.email || ''}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all duration-200"
              aria-label="Cerrar sesión"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium">Cerrar sesión</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {/* User Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
              title={user?.nombre || 'Usuario'}
            >
              {getUserInitials()}
            </div>

            {/* Logout Icon */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all duration-200"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
