import { useEffect } from 'react';
import Button from './Button';

/**
 * Modal Component - Abogadai Design System
 *
 * Características:
 * - Overlay con blur
 * - Animaciones de entrada/salida
 * - Cerrar con ESC o click fuera
 * - Header, body, footer customizables
 * - Tamaños (sm, md, lg, xl, full)
 */

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
}) {
  useEffect(() => {
    if (!isOpen) return;

    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';

    // Cerrar con ESC
    const handleEsc = (e) => {
      if (closeOnEsc && e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose, closeOnEsc]);

  if (!isOpen) return null;

  const sizes = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '600px' },
    lg: { maxWidth: '800px' },
    xl: { maxWidth: '1000px' },
    full: { maxWidth: '95vw', maxHeight: '95vh' },
  };

  const sizeConfig = sizes[size] || sizes.md;

  const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(4, 14, 23, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-lg)',
    zIndex: 'var(--z-modal-backdrop)',
    animation: 'fadeIn var(--transition-base)',
  };

  const modalStyles = {
    backgroundColor: 'white',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-xl)',
    width: '100%',
    ...sizeConfig,
    maxHeight: size === 'full' ? sizeConfig.maxHeight : '90vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 'var(--z-modal)',
    animation: 'slideUp var(--transition-slow)',
  };

  const headerStyles = {
    padding: 'var(--spacing-lg)',
    borderBottom: '1px solid var(--neutral-300)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const bodyStyles = {
    padding: 'var(--spacing-lg)',
    overflowY: 'auto',
    flex: 1,
  };

  const footerStyles = {
    padding: 'var(--spacing-lg)',
    borderTop: '1px solid var(--neutral-300)',
    display: 'flex',
    gap: 'var(--spacing-md)',
    justifyContent: 'flex-end',
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div style={overlayStyles} onClick={handleOverlayClick}>
        <div style={modalStyles}>
          {/* Header */}
          {(title || showCloseButton) && (
            <div style={headerStyles}>
              {title && (
                <h2
                  style={{
                    margin: 0,
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--neutral-800)',
                  }}
                >
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 'var(--spacing-xs)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--neutral-500)',
                    transition: 'all var(--transition-base)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--neutral-200)';
                    e.currentTarget.style.color = 'var(--neutral-700)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--neutral-500)';
                  }}
                  aria-label="Cerrar modal"
                >
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div style={bodyStyles} className="custom-scrollbar">
            {children}
          </div>

          {/* Footer */}
          {footer && <div style={footerStyles}>{footer}</div>}
        </div>
      </div>

      {/* Animaciones */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
