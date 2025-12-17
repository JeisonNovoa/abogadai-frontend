/**
 * Button Component - Abogadai Design System
 *
 * Variantes:
 * - primary: Botón principal (azul #0b6dff)
 * - cta: Call to Action (negro #1b1b1b)
 * - success: Acciones exitosas (verde)
 * - error: Acciones destructivas (rojo)
 * - warning: Advertencias (amarillo)
 * - neutral: Neutral/secundario (gris)
 * - ghost: Sin fondo, solo borde
 * - link: Estilo de enlace
 *
 * Tamaños:
 * - sm: Pequeño
 * - md: Mediano (default)
 * - lg: Grande
 */

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
  ariaLabel,
  ...props
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-sm)',
    fontWeight: 'var(--font-weight-medium)',
    borderRadius: 'var(--radius-lg)',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-base)',
    fontFamily: 'inherit',
    outline: 'none',
    textDecoration: 'none',
    position: 'relative',
  };

  const sizes = {
    sm: {
      padding: 'var(--spacing-xs) var(--spacing-md)',
      fontSize: 'var(--font-size-sm)',
    },
    md: {
      padding: 'var(--spacing-sm) var(--spacing-lg)',
      fontSize: 'var(--font-size-base)',
    },
    lg: {
      padding: 'var(--spacing-md) var(--spacing-xl)',
      fontSize: 'var(--font-size-lg)',
    },
  };

  const variants = {
    primary: {
      backgroundColor: disabled ? 'var(--neutral-400)' : 'var(--color-primary)',
      color: 'white',
      hoverBg: 'var(--color-primary-hover)',
      activeBg: 'var(--color-primary-dark)',
    },
    cta: {
      backgroundColor: disabled ? 'var(--neutral-400)' : 'var(--color-cta)',
      color: 'white',
      hoverBg: 'var(--color-cta-hover)',
      activeBg: 'var(--neutral-700)',
    },
    success: {
      backgroundColor: disabled ? 'var(--neutral-400)' : 'var(--color-success)',
      color: 'white',
      hoverBg: 'var(--color-success-dark)',
      activeBg: 'var(--color-success-dark)',
    },
    error: {
      backgroundColor: disabled ? 'var(--neutral-400)' : 'var(--color-error)',
      color: 'white',
      hoverBg: 'var(--color-error-dark)',
      activeBg: 'var(--color-error-dark)',
    },
    warning: {
      backgroundColor: disabled ? 'var(--neutral-400)' : 'var(--color-warning)',
      color: 'white',
      hoverBg: 'var(--color-warning-dark)',
      activeBg: 'var(--color-warning-dark)',
    },
    neutral: {
      backgroundColor: disabled ? 'var(--neutral-300)' : 'var(--neutral-200)',
      color: disabled ? 'var(--neutral-400)' : 'var(--neutral-700)',
      hoverBg: 'var(--neutral-300)',
      activeBg: 'var(--neutral-400)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: disabled ? 'var(--neutral-400)' : 'var(--color-primary)',
      hoverBg: 'var(--neutral-200)',
      activeBg: 'var(--neutral-300)',
      border: `1px solid ${disabled ? 'var(--neutral-400)' : 'var(--color-primary)'}`,
    },
    link: {
      backgroundColor: 'transparent',
      color: disabled ? 'var(--neutral-400)' : 'var(--color-primary)',
      hoverBg: 'transparent',
      activeBg: 'transparent',
      textDecoration: 'underline',
    },
  };

  const variantConfig = variants[variant] || variants.primary;
  const sizeConfig = sizes[size] || sizes.md;

  const combinedStyles = {
    ...baseStyles,
    ...sizeConfig,
    backgroundColor: variantConfig.backgroundColor,
    color: variantConfig.color,
    border: variantConfig.border || baseStyles.border,
    textDecoration: variantConfig.textDecoration || baseStyles.textDecoration,
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled || loading ? 0.6 : 1,
  };

  const handleMouseEnter = (e) => {
    if (!disabled && !loading) {
      e.currentTarget.style.backgroundColor = variantConfig.hoverBg;
      e.currentTarget.style.transform = 'translateY(-1px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      if (variant === 'link') {
        e.currentTarget.style.opacity = '0.8';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled && !loading) {
      e.currentTarget.style.backgroundColor = variantConfig.backgroundColor;
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
      if (variant === 'link') {
        e.currentTarget.style.opacity = '1';
      }
    }
  };

  const handleMouseDown = (e) => {
    if (!disabled && !loading) {
      e.currentTarget.style.backgroundColor = variantConfig.activeBg;
      e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
    }
  };

  const handleMouseUp = (e) => {
    if (!disabled && !loading) {
      e.currentTarget.style.backgroundColor = variantConfig.hoverBg;
      e.currentTarget.style.transform = 'translateY(-1px) scale(1)';
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={combinedStyles}
      className={className}
      aria-label={ariaLabel || (loading ? 'Cargando...' : undefined)}
      aria-busy={loading}
      aria-disabled={disabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin"
          style={{ width: '1em', height: '1em' }}
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && leftIcon && <span style={{ display: 'flex', alignItems: 'center' }} aria-hidden="true">{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span style={{ display: 'flex', alignItems: 'center' }} aria-hidden="true">{rightIcon}</span>}
    </button>
  );
}
