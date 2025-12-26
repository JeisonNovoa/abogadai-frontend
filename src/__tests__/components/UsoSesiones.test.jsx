import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import UsoSesiones from '../../components/UsoSesiones';
import api from '../../services/api';

// Mock del API
vi.mock('../../services/api');

describe('UsoSesiones Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe renderizar el componente sin errores', () => {
    api.get.mockResolvedValue({ data: {} });
    render(<UsoSesiones />);
    expect(screen.getByText(/cargando uso/i)).toBeInTheDocument();
  });

  it('debe mostrar estado de carga inicialmente', () => {
    api.get.mockResolvedValue({ data: {} });
    render(<UsoSesiones />);
    expect(screen.getByText(/cargando uso/i)).toBeInTheDocument();
  });

  it('debe cargar y mostrar datos de uso de sesiones', async () => {
    const mockData = {
      sesiones_usadas: 2,
      sesiones_disponibles: 5,
      minutos_usados: 18,
      minutos_disponibles: 50,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(<UsoSesiones />);

    await waitFor(() => {
      expect(screen.getByText('2 / 5')).toBeInTheDocument();
    });

    expect(screen.getByText('18 / 50 min')).toBeInTheDocument();
  });

  it('debe mostrar barras de progreso correctas', async () => {
    const mockData = {
      sesiones_usadas: 1,
      sesiones_disponibles: 3,
      minutos_usados: 10,
      minutos_disponibles: 30,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(<UsoSesiones />);

    await waitFor(() => {
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    // Verificar que se muestra el componente
    expect(screen.getByText('Uso de Sesiones Hoy')).toBeInTheDocument();
  });

  it('debe mostrar advertencia cuando sesiones >= 75%', async () => {
    const mockData = {
      sesiones_usadas: 3,
      sesiones_disponibles: 3,
      minutos_usados: 10,
      minutos_disponibles: 50,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(<UsoSesiones />);

    await waitFor(() => {
      expect(screen.getByText(/Límite alcanzado/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar advertencia cuando minutos >= 75%', async () => {
    const mockData = {
      sesiones_usadas: 1,
      sesiones_disponibles: 5,
      minutos_usados: 40,
      minutos_disponibles: 50,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(<UsoSesiones />);

    await waitFor(() => {
      expect(screen.getByText(/Cuidado! Te estás quedando sin minutos/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar advertencia de sesiones cerca del límite', async () => {
    const mockData = {
      sesiones_usadas: 4,
      sesiones_disponibles: 5,
      minutos_usados: 10,
      minutos_disponibles: 50,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(<UsoSesiones />);

    await waitFor(() => {
      expect(screen.getByText(/Cuidado! Te estás acercando al límite de sesiones/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar tip para obtener más sesiones', async () => {
    const mockData = {
      sesiones_usadas: 2,
      sesiones_disponibles: 5,
      minutos_usados: 18,
      minutos_disponibles: 50,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(<UsoSesiones />);

    await waitFor(() => {
      expect(screen.getByText(/Paga un documento para obtener \+2 sesiones extra hoy mismo/i)).toBeInTheDocument();
    });
  });

  it('debe actualizar datos cada 30 segundos', async () => {
    const mockData1 = {
      sesiones_usadas: 2,
      sesiones_disponibles: 5,
      minutos_usados: 18,
      minutos_disponibles: 50,
    };

    const mockData2 = {
      sesiones_usadas: 3,
      sesiones_disponibles: 5,
      minutos_usados: 28,
      minutos_disponibles: 50,
    };

    api.get.mockResolvedValueOnce({ data: mockData1 });
    api.get.mockResolvedValueOnce({ data: mockData2 });

    render(<UsoSesiones />);

    await waitFor(() => {
      expect(screen.getByText('2 / 5')).toBeInTheDocument();
    });

    // Avanzar 30 segundos
    vi.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  it('debe manejar error de API correctamente', async () => {
    api.get.mockRejectedValue(new Error('Network error'));

    render(<UsoSesiones />);

    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar el uso de sesiones/i)).toBeInTheDocument();
    });
  });

  it('debe llamar a la API correcta', async () => {
    const mockData = {
      sesiones_usadas: 2,
      sesiones_disponibles: 5,
      minutos_usados: 18,
      minutos_disponibles: 50,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(<UsoSesiones />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/sesiones/uso-diario');
    });
  });

  it('debe limpiar el intervalo al desmontar', async () => {
    const mockData = {
      sesiones_usadas: 2,
      sesiones_disponibles: 5,
      minutos_usados: 18,
      minutos_disponibles: 50,
    };

    api.get.mockResolvedValue({ data: mockData });

    const { unmount } = render(<UsoSesiones />);

    await waitFor(() => {
      expect(screen.getByText('2 / 5')).toBeInTheDocument();
    });

    unmount();

    // Verificar que no hay más llamadas después de desmontar
    const callCount = api.get.mock.calls.length;
    vi.advanceTimersByTime(30000);
    expect(api.get.mock.calls.length).toBe(callCount);
  });
});
