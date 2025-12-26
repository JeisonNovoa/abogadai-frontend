import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from '../../pages/admin/AdminDashboard';
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
  default: ({ children, onClick, disabled, loading, variant, size, style }) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      data-variant={variant}
      data-size={size}
      data-loading={loading}
      style={style}
    >
      {loading ? 'Cargando...' : children}
    </button>
  ),
}));

const renderWithToast = (component) => {
  return render(<ToastProvider>{component}</ToastProvider>);
};

describe('AdminDashboard Component', () => {
  const mockMetricas = {
    usuarios: {
      total: 150,
    },
    sesiones: {
      hoy: 45,
      promedio_por_usuario: 2.3,
      duracion_promedio: 8,
    },
    reembolsos: {
      total: 20,
      pendientes: 5,
      aprobados: 12,
      rechazados: 3,
    },
    documentos: {
      pagados: 85,
    },
    niveles: {
      FREE: 80,
      BRONCE: 40,
      PLATA: 20,
      ORO: 10,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el componente con el layout', async () => {
    api.get.mockResolvedValue({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    expect(screen.getByTestId('admin-layout')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('debe mostrar estado de carga inicialmente', () => {
    api.get.mockImplementation(() => new Promise(() => {}));

    renderWithToast(<AdminDashboard />);

    expect(screen.getByText('Cargando métricas...')).toBeInTheDocument();
  });

  it('debe llamar a la API al montar', async () => {
    api.get.mockResolvedValue({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/metricas');
    });
  });

  it('debe mostrar card de total usuarios', async () => {
    api.get.mockResolvedValue({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Usuarios')).toBeInTheDocument();
    });

    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('👥')).toBeInTheDocument();
  });

  it('debe mostrar card de sesiones hoy', async () => {
    api.get.mockResolvedValue({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Sesiones Hoy')).toBeInTheDocument();
    });

    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('📱')).toBeInTheDocument();
  });

  it('debe mostrar card de reembolsos pendientes', async () => {
    api.get.mockResolvedValue({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Reembolsos Pendientes')).toBeInTheDocument();
    });

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('⏳')).toBeInTheDocument();
  });

  it('debe mostrar card de documentos pagados', async () => {
    api.get.mockResolvedValue({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Documentos Pagados')).toBeInTheDocument();
    });

    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('💰')).toBeInTheDocument();
  });

  it('debe mostrar distribución de niveles', async () => {
    api.get.mockResolvedValue({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Distribución de Niveles')).toBeInTheDocument();
    });

    expect(screen.getByText('FREE')).toBeInTheDocument();
    expect(screen.getByText('BRONCE')).toBeInTheDocument();
    expect(screen.getByText('PLATA')).toBeInTheDocument();
    expect(screen.getByText('ORO')).toBeInTheDocument();
  });

  it('debe mostrar cantidades de cada nivel', async () => {
    api.get.mockResolvedValue({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('80')).toBeInTheDocument(); // FREE
    });

    expect(screen.getByText('40')).toBeInTheDocument(); // BRONCE
    expect(screen.getByText('20')).toBeInTheDocument(); // PLATA
    expect(screen.getByText('10')).toBeInTheDocument(); // ORO
  });

  it('debe calcular porcentajes correctamente', async () => {
    api.get.mockResolvedValue({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('53% del total')).toBeInTheDocument(); // 80/150 = 53%
    });

    expect(screen.getByText('27% del total')).toBeInTheDocument(); // 40/150 = 27%
    expect(screen.getByText('13% del total')).toBeInTheDocument(); // 20/150 = 13%
    expect(screen.getByText('7% del total')).toBeInTheDocument(); // 10/150 = 7%
  });

  it('debe mostrar iconos de niveles', async () => {
    api.get.mockResolvedValue({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('🆓')).toBeInTheDocument(); // FREE
    });

    expect(screen.getByText('🥉')).toBeInTheDocument(); // BRONCE
    expect(screen.getByText('🥈')).toBeInTheDocument(); // PLATA
    expect(screen.getByText('🥇')).toBeInTheDocument(); // ORO
  });

  it('debe mostrar estadísticas de reembolsos', async () => {
    api.get.mockResolvedValue({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Estadísticas de Reembolsos')).toBeInTheDocument();
    });

    // Verificar que hay múltiples apariciones de los números (en cards y en estadísticas)
    const totalReembolsos = screen.getAllByText('20');
    expect(totalReembolsos.length).toBeGreaterThan(0);

    const pendientes = screen.getAllByText('5');
    expect(pendientes.length).toBeGreaterThan(0);

    expect(screen.getByText('12')).toBeInTheDocument(); // aprobados
    expect(screen.getByText('3')).toBeInTheDocument(); // rechazados
  });

  it('debe calcular tasa de aprobación correctamente', async () => {
    api.get.mockResolvedValue({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Tasa de Aprobación')).toBeInTheDocument();
    });

    // 12 aprobados de 20 total = 60%
    const porcentajes = screen.getAllByText('60%');
    expect(porcentajes.length).toBeGreaterThan(0);
  });

  it('debe mostrar uso de sesiones', async () => {
    api.get.mockResolvedValue({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Uso de Sesiones')).toBeInTheDocument();
    });
  });

  it('debe mostrar promedio por usuario', async () => {
    api.get.mockResolvedValue({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Promedio por Usuario')).toBeInTheDocument();
    });

    expect(screen.getByText('2.3')).toBeInTheDocument();
  });

  it('debe mostrar duración promedio', async () => {
    api.get.mockResolvedValue({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Duración Promedio')).toBeInTheDocument();
    });

    expect(screen.getByText('8 min')).toBeInTheDocument();
  });

  it('debe formatear números con separadores', async () => {
    const metricasGrandes = {
      ...mockMetricas,
      usuarios: { total: 1500 },
      documentos: { pagados: 2350 },
    };

    api.get.mockResolvedValue({ data: metricasGrandes });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      // Verificar que se formatean con punto como separador de miles
      const formateados = screen.getAllByText(/1\.500|2\.350/);
      expect(formateados.length).toBeGreaterThan(0);
    });
  });

  it('debe mostrar botón de actualizar', async () => {
    api.get.mockResolvedValue({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Actualizar')).toBeInTheDocument();
    });
  });

  it('debe recargar métricas al hacer clic en actualizar', async () => {
    api.get.mockResolvedValue({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Actualizar')).toBeInTheDocument();
    });

    const actualizarButton = screen.getByText('Actualizar');
    fireEvent.click(actualizarButton);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  it('debe mostrar pantalla de error cuando no se cargan las métricas', async () => {
    api.get.mockRejectedValue(new Error('Network error'));

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No se pudieron cargar las métricas')).toBeInTheDocument();
    });

    expect(screen.getByText('Reintentar')).toBeInTheDocument();
  });

  it('debe reintentar carga al hacer clic en Reintentar', async () => {
    api.get.mockRejectedValueOnce(new Error('Network error'));
    api.get.mockResolvedValueOnce({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });

    const reintentarButton = screen.getByText('Reintentar');
    fireEvent.click(reintentarButton);

    await waitFor(() => {
      expect(screen.getByText('Total Usuarios')).toBeInTheDocument();
    });
  });

  it('debe mostrar última actualización', async () => {
    api.get.mockResolvedValue({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Última actualización:/i)).toBeInTheDocument();
    });
  });

  it('debe manejar métricas con valores en cero', async () => {
    const metricasCero = {
      usuarios: { total: 0 },
      sesiones: { hoy: 0, promedio_por_usuario: 0, duracion_promedio: 0 },
      reembolsos: { total: 0, pendientes: 0, aprobados: 0, rechazados: 0 },
      documentos: { pagados: 0 },
      niveles: { FREE: 0, BRONCE: 0, PLATA: 0, ORO: 0 },
    };

    api.get.mockResolvedValue({ data: metricasCero });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Usuarios')).toBeInTheDocument();
    });

    // Verificar que muestra 0% cuando total es 0
    const porcentajes = screen.getAllByText('0% del total');
    expect(porcentajes.length).toBe(4); // Para cada nivel
  });

  it('debe calcular porcentaje como 0 cuando total es 0', async () => {
    const metricasSinTotal = {
      ...mockMetricas,
      usuarios: { total: 0 },
    };

    api.get.mockResolvedValue({ data: metricasSinTotal });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Distribución de Niveles')).toBeInTheDocument();
    });

    const porcentajes = screen.getAllByText('0% del total');
    expect(porcentajes.length).toBeGreaterThan(0);
  });

  it('no debe mostrar tasa de aprobación si no hay reembolsos', async () => {
    const metricasSinReembolsos = {
      ...mockMetricas,
      reembolsos: {
        total: 0,
        pendientes: 0,
        aprobados: 0,
        rechazados: 0,
      },
    };

    api.get.mockResolvedValue({ data: metricasSinReembolsos });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Estadísticas de Reembolsos')).toBeInTheDocument();
    });

    expect(screen.queryByText('Tasa de Aprobación')).not.toBeInTheDocument();
  });

  it('debe mostrar 0.0 como promedio por usuario si es undefined', async () => {
    const metricasSinPromedio = {
      ...mockMetricas,
      sesiones: {
        ...mockMetricas.sesiones,
        promedio_por_usuario: undefined,
      },
    };

    api.get.mockResolvedValue({ data: metricasSinPromedio });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Promedio por Usuario')).toBeInTheDocument();
    });

    expect(screen.getByText('0.0')).toBeInTheDocument();
  });

  it('debe mostrar 0 min como duración promedio si no está definida', async () => {
    const metricasSinDuracion = {
      ...mockMetricas,
      sesiones: {
        ...mockMetricas.sesiones,
        duracion_promedio: null,
      },
    };

    api.get.mockResolvedValue({ data: metricasSinDuracion });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Duración Promedio')).toBeInTheDocument();
    });

    expect(screen.getByText('0 min')).toBeInTheDocument();
  });

  it('debe redondear promedio por usuario a 1 decimal', async () => {
    const metricasConDecimal = {
      ...mockMetricas,
      sesiones: {
        ...mockMetricas.sesiones,
        promedio_por_usuario: 2.456789,
      },
    };

    api.get.mockResolvedValue({ data: metricasConDecimal });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('2.5')).toBeInTheDocument();
    });
  });

  it('debe mostrar labels de reembolsos en mayúsculas', async () => {
    api.get.mockResolvedValue({ data: mockMetricas });

    renderWithToast(<AdminDashboard />);

    await waitFor(() => {
      const labels = screen.getAllByText(/TOTAL|PENDIENTES|APROBADOS|RECHAZADOS/);
      expect(labels.length).toBeGreaterThan(0);
    });
  });
});
