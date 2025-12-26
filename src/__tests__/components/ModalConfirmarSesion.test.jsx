import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ModalConfirmarSesion from '../../components/ModalConfirmarSesion';
import api from '../../services/api';

// Mock del API
vi.mock('../../services/api');

describe('ModalConfirmarSesion Component', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el modal cuando isOpen es true', async () => {
    const mockData = {
      permitido: true,
      sesiones_usadas: 2,
      sesiones_disponibles: 5,
      minutos_usados: 18,
      minutos_disponibles: 50,
      duracion_maxima_sesion: 10,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(
      <ModalConfirmarSesion
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/Verificando/i)).toBeInTheDocument();
  });

  it('no debe renderizar cuando isOpen es false', () => {
    render(
      <ModalConfirmarSesion
        isOpen={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByText(/Verificando/i)).not.toBeInTheDocument();
  });

  it('debe mostrar datos cuando la sesión está permitida', async () => {
    const mockData = {
      permitido: true,
      sesiones_usadas: 2,
      sesiones_disponibles: 5,
      minutos_usados: 18,
      minutos_disponibles: 50,
      duracion_maxima_sesion: 10,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(
      <ModalConfirmarSesion
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/¡Todo listo!/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Puedes iniciar tu sesión de avatar/i)).toBeInTheDocument();
  });

  it('debe mostrar sesiones y minutos disponibles', async () => {
    const mockData = {
      permitido: true,
      sesiones_usadas: 2,
      sesiones_disponibles: 5,
      minutos_usados: 18,
      minutos_disponibles: 50,
      duracion_maxima_sesion: 10,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(
      <ModalConfirmarSesion
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // sesiones disponibles restantes
    });

    expect(screen.getByText(/32 min/i)).toBeInTheDocument(); // minutos disponibles restantes
  });

  it('debe mostrar botones de Iniciar y Cancelar cuando está permitido', async () => {
    const mockData = {
      permitido: true,
      sesiones_usadas: 2,
      sesiones_disponibles: 5,
      minutos_usados: 18,
      minutos_disponibles: 50,
      duracion_maxima_sesion: 10,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(
      <ModalConfirmarSesion
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    });

    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('debe llamar onConfirm al hacer clic en Iniciar Sesión', async () => {
    const mockData = {
      permitido: true,
      sesiones_usadas: 2,
      sesiones_disponibles: 5,
      minutos_usados: 18,
      minutos_disponibles: 50,
      duracion_maxima_sesion: 10,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(
      <ModalConfirmarSesion
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Iniciar Sesión'));

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('debe llamar onCancel al hacer clic en Cancelar', async () => {
    const mockData = {
      permitido: true,
      sesiones_usadas: 2,
      sesiones_disponibles: 5,
      minutos_usados: 18,
      minutos_disponibles: 50,
      duracion_maxima_sesion: 10,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(
      <ModalConfirmarSesion
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancelar'));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('debe mostrar error cuando límite alcanzado (HTTP 429)', async () => {
    const error = {
      response: {
        status: 429,
        data: {
          detail: 'Has alcanzado el límite de sesiones diarias',
          sesiones_usadas: 3,
          sesiones_maximas: 3,
        },
      },
    };

    api.get.mockRejectedValue(error);

    render(
      <ModalConfirmarSesion
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Límite Alcanzado/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Has alcanzado el límite de sesiones diarias/i)).toBeInTheDocument();
  });

  it('debe mostrar tip cuando hay límite alcanzado', async () => {
    const error = {
      response: {
        status: 429,
        data: {
          detail: 'Has alcanzado el límite de sesiones diarias',
        },
      },
    };

    api.get.mockRejectedValue(error);

    render(
      <ModalConfirmarSesion
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Paga un documento/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar advertencia cuando sesiones cercanas al límite', async () => {
    const mockData = {
      permitido: true,
      sesiones_usadas: 4,
      sesiones_disponibles: 5,
      minutos_usados: 18,
      minutos_disponibles: 50,
      duracion_maxima_sesion: 10,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(
      <ModalConfirmarSesion
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Quedan pocas sesiones/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar advertencia cuando minutos cercanos al límite', async () => {
    const mockData = {
      permitido: true,
      sesiones_usadas: 2,
      sesiones_disponibles: 5,
      minutos_usados: 45,
      minutos_disponibles: 50,
      duracion_maxima_sesion: 5,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(
      <ModalConfirmarSesion
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Quedan pocos minutos/i)).toBeInTheDocument();
    });
  });

  it('debe llamar a la API correcta al abrir', async () => {
    const mockData = {
      permitido: true,
      sesiones_usadas: 2,
      sesiones_disponibles: 5,
      minutos_usados: 18,
      minutos_disponibles: 50,
      duracion_maxima_sesion: 10,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(
      <ModalConfirmarSesion
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/sesiones/validar-limite');
    });
  });

  it('debe manejar error general de API', async () => {
    api.get.mockRejectedValue(new Error('Network error'));

    render(
      <ModalConfirmarSesion
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/No se pudo verificar el límite de sesiones/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar duración máxima de la sesión', async () => {
    const mockData = {
      permitido: true,
      sesiones_usadas: 2,
      sesiones_disponibles: 5,
      minutos_usados: 18,
      minutos_disponibles: 50,
      duracion_maxima_sesion: 10,
    };

    api.get.mockResolvedValue({ data: mockData });

    render(
      <ModalConfirmarSesion
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/10 minutos/i)).toBeInTheDocument();
    });
  });
});
