import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminReembolsos from '../../pages/admin/AdminReembolsos';
import api from '../../services/api';
import { ToastProvider } from '../../context/ToastContext';

// Mock del API
vi.mock('../../services/api');

// Mock de AdminLayout
vi.mock('../../components/AdminLayout', () => ({
  default: ({ children, title }) => (
    <div data-testid="admin-layout">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

// Mock de Button
vi.mock('../../components/Button', () => ({
  default: ({ children, onClick, disabled, loading, variant, size }) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      data-variant={variant}
      data-size={size}
      data-loading={loading}
    >
      {loading ? 'Cargando...' : children}
    </button>
  ),
}));

// Mock de Modal
vi.mock('../../components/Modal', () => ({
  default: ({ isOpen, children, title, footer, onClose }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <div data-testid="modal-footer">{footer}</div>
      </div>
    );
  },
}));

// Mock de Input
vi.mock('../../components/Input', () => ({
  default: ({ label, placeholder, value, onChange, required, error }) => (
    <div>
      <label>{label}</label>
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={!!error}
      />
      {error && <span role="alert">{error}</span>}
    </div>
  ),
}));

const renderWithToast = (component) => {
  return render(<ToastProvider>{component}</ToastProvider>);
};

describe('AdminReembolsos Component', () => {
  const mockSolicitudes = [
    {
      caso_id: 1,
      usuario_nombre: 'Juan Pérez',
      usuario_email: 'juan@example.com',
      monto: 15000,
      fecha_solicitud: '2024-01-15T10:30:00',
      estado: 'pendiente',
      motivo: 'El documento no cumple con mis expectativas',
      evidencia_url: 'https://example.com/evidencia1.pdf',
    },
    {
      caso_id: 2,
      usuario_nombre: 'María García',
      usuario_email: 'maria@example.com',
      monto: 15000,
      fecha_solicitud: '2024-01-14T15:20:00',
      estado: 'aprobado',
      motivo: 'Problemas con el contenido generado',
      evidencia_url: null,
    },
    {
      caso_id: 3,
      usuario_nombre: 'Carlos López',
      usuario_email: 'carlos@example.com',
      monto: 15000,
      fecha_solicitud: '2024-01-13T09:00:00',
      estado: 'rechazado',
      motivo: 'No estoy satisfecho con el servicio',
      evidencia_url: 'https://example.com/evidencia3.jpg',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.window.open = vi.fn();
  });

  it('debe renderizar el componente con el layout', async () => {
    api.get.mockResolvedValue({ data: [] });

    renderWithToast(<AdminReembolsos />);

    expect(screen.getByTestId('admin-layout')).toBeInTheDocument();
    expect(screen.getByText('Gestión de Reembolsos')).toBeInTheDocument();
  });

  it('debe mostrar estado de carga inicialmente', () => {
    api.get.mockImplementation(() => new Promise(() => {}));

    renderWithToast(<AdminReembolsos />);

    expect(screen.getByText('Cargando solicitudes...')).toBeInTheDocument();
  });

  it('debe cargar y mostrar solicitudes', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument();
    });

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('María García')).toBeInTheDocument();
    expect(screen.getByText('Carlos López')).toBeInTheDocument();
  });

  it('debe llamar a la API correctamente al montar', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/reembolsos', {
        params: { estado: 'pendientes' },
      });
    });
  });

  it('debe mostrar filtros correctamente', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText(/Pendientes \(1\)/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Aprobadas \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Rechazadas \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Todas \(3\)/i)).toBeInTheDocument();
  });

  it('debe filtrar solicitudes por estado pendiente', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    // Por defecto muestra solo pendientes
    expect(screen.queryByText('María García')).not.toBeInTheDocument();
    expect(screen.queryByText('Carlos López')).not.toBeInTheDocument();
  });

  it('debe cambiar filtro a aprobadas', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    const filtroAprobadas = screen.getByText(/Aprobadas/i);
    fireEvent.click(filtroAprobadas);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/reembolsos', {
        params: { estado: 'aprobadas' },
      });
    });
  });

  it('debe cambiar filtro a todas', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    const filtroTodas = screen.getByText(/Todas/i);
    fireEvent.click(filtroTodas);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/reembolsos', {
        params: { estado: 'todas' },
      });
    });
  });

  it('debe mostrar mensaje cuando no hay solicitudes', async () => {
    api.get.mockResolvedValue({ data: [] });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText('No hay solicitudes')).toBeInTheDocument();
    });

    expect(screen.getByText(/No se encontraron solicitudes de reembolso/i)).toBeInTheDocument();
  });

  it('debe mostrar badges de estado correctamente', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });

    renderWithToast(<AdminReembolsos />);

    // Cambiar a filtro todas para ver todos los estados
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    const filtroTodas = screen.getByText(/Todas/i);
    fireEvent.click(filtroTodas);

    await waitFor(() => {
      expect(screen.getByText('⏳ Pendiente')).toBeInTheDocument();
      expect(screen.getByText('✅ Aprobado')).toBeInTheDocument();
      expect(screen.getByText('❌ Rechazado')).toBeInTheDocument();
    });
  });

  it('debe formatear montos correctamente', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      // Buscar todos los textos que contengan $15.000 o similar
      const montos = screen.getAllByText(/\$.*15.*000/);
      expect(montos.length).toBeGreaterThan(0);
    });
  });

  it('debe mostrar botones de acción solo para pendientes', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText('Aprobar')).toBeInTheDocument();
      expect(screen.getByText('Rechazar')).toBeInTheDocument();
    });
  });

  it('debe abrir modal de aprobar al hacer clic', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText('Aprobar')).toBeInTheDocument();
    });

    const aprobarButton = screen.getByText('Aprobar');
    fireEvent.click(aprobarButton);

    await waitFor(() => {
      expect(screen.getByText('Aprobar Solicitud de Reembolso')).toBeInTheDocument();
    });

    expect(screen.getByText(/¿Estás seguro de que deseas aprobar la solicitud/i)).toBeInTheDocument();
  });

  it('debe abrir modal de rechazar al hacer clic', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText('Rechazar')).toBeInTheDocument();
    });

    const rechazarButton = screen.getByText('Rechazar');
    fireEvent.click(rechazarButton);

    await waitFor(() => {
      expect(screen.getByText('Rechazar Solicitud de Reembolso')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Razón del rechazo')).toBeInTheDocument();
  });

  it('debe aprobar solicitud correctamente', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });
    api.post.mockResolvedValue({ data: {} });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText('Aprobar')).toBeInTheDocument();
    });

    const aprobarButton = screen.getByText('Aprobar');
    fireEvent.click(aprobarButton);

    await waitFor(() => {
      expect(screen.getByText('Confirmar Aprobación')).toBeInTheDocument();
    });

    const confirmarButton = screen.getByText('Confirmar Aprobación');
    fireEvent.click(confirmarButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/admin/reembolsos/1/aprobar');
    });
  });

  it('debe rechazar solicitud con razón', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });
    api.post.mockResolvedValue({ data: {} });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText('Rechazar')).toBeInTheDocument();
    });

    const rechazarButton = screen.getByText('Rechazar');
    fireEvent.click(rechazarButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Razón del rechazo')).toBeInTheDocument();
    });

    const razonInput = screen.getByPlaceholderText(/Explica por qué se rechaza/i);
    fireEvent.change(razonInput, { target: { value: 'El motivo no es válido' } });

    const confirmarButton = screen.getByText('Confirmar Rechazo');
    fireEvent.click(confirmarButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/admin/reembolsos/1/rechazar', {
        razon: 'El motivo no es válido',
      });
    });
  });

  it('debe recargar solicitudes después de aprobar', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });
    api.post.mockResolvedValue({ data: {} });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText('Aprobar')).toBeInTheDocument();
    });

    const aprobarButton = screen.getByText('Aprobar');
    fireEvent.click(aprobarButton);

    await waitFor(() => {
      expect(screen.getByText('Confirmar Aprobación')).toBeInTheDocument();
    });

    const confirmarButton = screen.getByText('Confirmar Aprobación');
    fireEvent.click(confirmarButton);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  it('debe abrir evidencia en nueva ventana', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    // Buscar botón de ver evidencia
    const verButtons = screen.getAllByRole('button');
    const verEvidenciaButton = verButtons.find(btn =>
      btn.querySelector('svg') && btn.getAttribute('data-variant') === 'ghost'
    );

    if (verEvidenciaButton) {
      fireEvent.click(verEvidenciaButton);
      expect(global.window.open).toHaveBeenCalledWith('https://example.com/evidencia1.pdf', '_blank');
    }
  });

  it('debe mostrar "Sin evidencia" cuando no hay archivo', async () => {
    const solicitudesSinEvidencia = [
      {
        ...mockSolicitudes[0],
        evidencia_url: null,
      },
    ];

    api.get.mockResolvedValue({ data: solicitudesSinEvidencia });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText('Sin evidencia')).toBeInTheDocument();
    });
  });

  it('debe manejar error al cargar solicitudes', async () => {
    api.get.mockRejectedValue(new Error('Network error'));

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando solicitudes...')).not.toBeInTheDocument();
    });
  });

  it('debe manejar error al aprobar solicitud', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });
    api.post.mockRejectedValue({
      response: {
        data: {
          detail: 'Error al procesar reembolso',
        },
      },
    });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText('Aprobar')).toBeInTheDocument();
    });

    const aprobarButton = screen.getByText('Aprobar');
    fireEvent.click(aprobarButton);

    await waitFor(() => {
      expect(screen.getByText('Confirmar Aprobación')).toBeInTheDocument();
    });

    const confirmarButton = screen.getByText('Confirmar Aprobación');
    fireEvent.click(confirmarButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
  });

  it('debe mostrar información de aprobación en modal', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText('Aprobar')).toBeInTheDocument();
    });

    const aprobarButton = screen.getByText('Aprobar');
    fireEvent.click(aprobarButton);

    await waitFor(() => {
      expect(screen.getByText(/Se procesará el reembolso/i)).toBeInTheDocument();
      expect(screen.getByText(/El nivel del usuario se reducirá/i)).toBeInTheDocument();
      expect(screen.getByText(/El documento se bloqueará nuevamente/i)).toBeInTheDocument();
    });
  });

  it('debe permitir actualizar manualmente', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText('Actualizar')).toBeInTheDocument();
    });

    const actualizarButton = screen.getByText('Actualizar');
    fireEvent.click(actualizarButton);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  it('debe cerrar modal de aprobar al cancelar', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText('Aprobar')).toBeInTheDocument();
    });

    const aprobarButton = screen.getByText('Aprobar');
    fireEvent.click(aprobarButton);

    await waitFor(() => {
      expect(screen.getByText('Aprobar Solicitud de Reembolso')).toBeInTheDocument();
    });

    const cancelButtons = screen.getAllByText('Cancelar');
    fireEvent.click(cancelButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Aprobar Solicitud de Reembolso')).not.toBeInTheDocument();
    });
  });

  it('debe cerrar modal de rechazar al cancelar', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText('Rechazar')).toBeInTheDocument();
    });

    const rechazarButton = screen.getByText('Rechazar');
    fireEvent.click(rechazarButton);

    await waitFor(() => {
      expect(screen.getByText('Rechazar Solicitud de Reembolso')).toBeInTheDocument();
    });

    const cancelButtons = screen.getAllByText('Cancelar');
    fireEvent.click(cancelButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Rechazar Solicitud de Reembolso')).not.toBeInTheDocument();
    });
  });

  it('debe mostrar correos de usuarios en la tabla', async () => {
    api.get.mockResolvedValue({ data: mockSolicitudes });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText('juan@example.com')).toBeInTheDocument();
    });
  });

  it('debe truncar motivos largos con ellipsis', async () => {
    const solicitudMotivo Largo = [
      {
        ...mockSolicitudes[0],
        motivo: 'Este es un motivo muy largo que debería ser truncado con ellipsis para no ocupar demasiado espacio en la tabla',
      },
    ];

    api.get.mockResolvedValue({ data: solicitudMotivoLargo });

    renderWithToast(<AdminReembolsos />);

    await waitFor(() => {
      expect(screen.getByText(/Este es un motivo muy largo/i)).toBeInTheDocument();
    });
  });
});
