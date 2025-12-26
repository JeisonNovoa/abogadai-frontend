import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NivelUsuario from '../../components/NivelUsuario';
import api from '../../services/api';

// Mock del API
vi.mock('../../services/api');

describe('NivelUsuario Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el componente sin errores', () => {
    api.get.mockResolvedValue({ data: {} });
    render(<NivelUsuario />);
    expect(screen.getByText(/cargando nivel/i)).toBeInTheDocument();
  });

  it('debe mostrar estado de carga inicialmente', () => {
    api.get.mockResolvedValue({ data: {} });
    render(<NivelUsuario />);
    expect(screen.getByText(/cargando nivel/i)).toBeInTheDocument();
  });

  it('debe cargar y mostrar datos del nivel FREE', async () => {
    const mockData = {
      nivel_actual: 'FREE',
      siguiente_nivel: 'BRONCE',
      pagos_en_nivel: 0,
      pagos_hasta_siguiente: 3,
      sesiones_maximas: 3,
      minutos_maximos: 10,
      max_docs_sin_pagar: 3,
      precio_documento: 15000,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(<NivelUsuario />);

    await waitFor(() => {
      expect(screen.getByText('Free')).toBeInTheDocument();
    });

    expect(screen.getByText('3')).toBeInTheDocument(); // sesiones_maximas
    expect(screen.getByText('10')).toBeInTheDocument(); // minutos_maximos
    expect(screen.getByText('$15000')).toBeInTheDocument(); // precio
  });

  it('debe mostrar progreso hacia el siguiente nivel', async () => {
    const mockData = {
      nivel_actual: 'FREE',
      siguiente_nivel: 'BRONCE',
      pagos_en_nivel: 1,
      pagos_hasta_siguiente: 3,
      sesiones_maximas: 3,
      minutos_maximos: 10,
      max_docs_sin_pagar: 3,
      precio_documento: 15000,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(<NivelUsuario />);

    await waitFor(() => {
      expect(screen.getByText(/Progreso hacia Bronce/i)).toBeInTheDocument();
    });

    expect(screen.getByText('1 de 3 pagos')).toBeInTheDocument();
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('debe mostrar nivel BRONCE correctamente', async () => {
    const mockData = {
      nivel_actual: 'BRONCE',
      siguiente_nivel: 'PLATA',
      pagos_en_nivel: 2,
      pagos_hasta_siguiente: 5,
      sesiones_maximas: 5,
      minutos_maximos: 12,
      max_docs_sin_pagar: 5,
      precio_documento: 14000,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(<NivelUsuario />);

    await waitFor(() => {
      expect(screen.getByText('Bronce')).toBeInTheDocument();
    });

    expect(screen.getByText('🥉')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // sesiones
  });

  it('debe mostrar nivel PLATA correctamente', async () => {
    const mockData = {
      nivel_actual: 'PLATA',
      siguiente_nivel: 'ORO',
      pagos_en_nivel: 3,
      pagos_hasta_siguiente: 10,
      sesiones_maximas: 7,
      minutos_maximos: 15,
      max_docs_sin_pagar: 7,
      precio_documento: 13000,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(<NivelUsuario />);

    await waitFor(() => {
      expect(screen.getByText('Plata')).toBeInTheDocument();
    });

    expect(screen.getByText('🥈')).toBeInTheDocument();
  });

  it('debe mostrar nivel ORO correctamente', async () => {
    const mockData = {
      nivel_actual: 'ORO',
      siguiente_nivel: null,
      pagos_en_nivel: 15,
      pagos_hasta_siguiente: 0,
      sesiones_maximas: 10,
      minutos_maximos: 20,
      max_docs_sin_pagar: 10,
      precio_documento: 12000,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(<NivelUsuario />);

    await waitFor(() => {
      expect(screen.getByText('Oro')).toBeInTheDocument();
    });

    expect(screen.getByText('🥇')).toBeInTheDocument();
  });

  it('debe mostrar error cuando la API falla', async () => {
    api.get.mockRejectedValue(new Error('Network error'));

    render(<NivelUsuario />);

    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar el nivel del usuario/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar todos los beneficios del nivel', async () => {
    const mockData = {
      nivel_actual: 'FREE',
      siguiente_nivel: 'BRONCE',
      pagos_en_nivel: 0,
      pagos_hasta_siguiente: 3,
      sesiones_maximas: 3,
      minutos_maximos: 10,
      max_docs_sin_pagar: 3,
      precio_documento: 15000,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(<NivelUsuario />);

    await waitFor(() => {
      expect(screen.getByText('Beneficios de tu nivel')).toBeInTheDocument();
    });

    expect(screen.getByText('Sesiones diarias')).toBeInTheDocument();
    expect(screen.getByText('Minutos por sesión')).toBeInTheDocument();
    expect(screen.getByText('Docs sin pagar')).toBeInTheDocument();
    expect(screen.getByText('Precio por doc')).toBeInTheDocument();
  });

  it('debe llamar a la API correcta al montar', async () => {
    const mockData = {
      nivel_actual: 'FREE',
      siguiente_nivel: 'BRONCE',
      pagos_en_nivel: 0,
      pagos_hasta_siguiente: 3,
      sesiones_maximas: 3,
      minutos_maximos: 10,
      max_docs_sin_pagar: 3,
      precio_documento: 15000,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(<NivelUsuario />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/usuarios/mi-nivel');
    });
  });
});
