import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SolicitudReembolso from '../../components/SolicitudReembolso';
import api from '../../services/api';

// Mock del API
vi.mock('../../services/api');

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

// Mock de Button
vi.mock('../../components/Button', () => ({
  default: ({ children, onClick, disabled, loading, variant }) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      data-variant={variant}
      data-loading={loading}
    >
      {loading ? 'Enviando...' : children}
    </button>
  ),
}));

describe('SolicitudReembolso Component', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();
  const casoId = 123;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el modal cuando isOpen es true', () => {
    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Solicitar Reembolso')).toBeInTheDocument();
  });

  it('no debe renderizar cuando isOpen es false', () => {
    render(
      <SolicitudReembolso
        isOpen={false}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('debe mostrar la garantía de satisfacción', () => {
    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Garantía de Satisfacción')).toBeInTheDocument();
    expect(screen.getByText(/En Abogadai nos comprometemos con tu satisfacción/i)).toBeInTheDocument();
  });

  it('debe mostrar el campo de motivo con textarea', () => {
    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/Motivo de la solicitud/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Explica por qué deseas solicitar el reembolso/i)).toBeInTheDocument();
  });

  it('debe mostrar contador de caracteres del motivo', () => {
    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/0 caracteres \(mínimo 20\)/i)).toBeInTheDocument();
  });

  it('debe actualizar contador al escribir en textarea', () => {
    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText(/Explica por qué deseas solicitar el reembolso/i);
    fireEvent.change(textarea, { target: { value: 'Motivo de prueba' } });

    expect(screen.getByText(/17 caracteres \(mínimo 20\)/i)).toBeInTheDocument();
  });

  it('debe mostrar error si motivo está vacío al enviar', async () => {
    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Enviar Solicitud');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El motivo es obligatorio')).toBeInTheDocument();
    });

    expect(api.post).not.toHaveBeenCalled();
  });

  it('debe mostrar error si motivo tiene menos de 20 caracteres', async () => {
    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText(/Explica por qué deseas solicitar el reembolso/i);
    fireEvent.change(textarea, { target: { value: 'Corto' } });

    const submitButton = screen.getByText('Enviar Solicitud');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El motivo debe tener al menos 20 caracteres')).toBeInTheDocument();
    });

    expect(api.post).not.toHaveBeenCalled();
  });

  it('debe mostrar área de upload de archivo', () => {
    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/Evidencia \(opcional\)/i)).toBeInTheDocument();
    expect(screen.getByText('Haz clic para seleccionar un archivo')).toBeInTheDocument();
    expect(screen.getByText(/PDF, JPG o PNG \(máx\. 5 MB\)/i)).toBeInTheDocument();
  });

  it('debe permitir seleccionar un archivo', () => {
    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const file = new File(['contenido'], 'evidencia.pdf', { type: 'application/pdf' });
    const input = document.getElementById('evidencia-input');

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('evidencia.pdf')).toBeInTheDocument();
  });

  it('debe mostrar tamaño del archivo seleccionado', () => {
    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const file = new File(['a'.repeat(1024 * 100)], 'test.pdf', { type: 'application/pdf' });
    const input = document.getElementById('evidencia-input');

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/0\.\d+ MB/)).toBeInTheDocument();
  });

  it('debe permitir remover archivo seleccionado', () => {
    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const file = new File(['contenido'], 'evidencia.pdf', { type: 'application/pdf' });
    const input = document.getElementById('evidencia-input');

    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByText('evidencia.pdf')).toBeInTheDocument();

    const removeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(removeButton);

    expect(screen.queryByText('evidencia.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('Haz clic para seleccionar un archivo')).toBeInTheDocument();
  });

  it('debe enviar formulario con motivo válido sin archivo', async () => {
    api.post.mockResolvedValue({ data: { mensaje: 'Solicitud enviada' } });

    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText(/Explica por qué deseas solicitar el reembolso/i);
    fireEvent.change(textarea, {
      target: { value: 'Este es un motivo válido con más de 20 caracteres' },
    });

    const submitButton = screen.getByText('Enviar Solicitud');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        `/casos/${casoId}/solicitar-reembolso`,
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );
    });

    expect(mockOnSuccess).toHaveBeenCalledWith({ mensaje: 'Solicitud enviada' });
  });

  it('debe enviar formulario con motivo y archivo', async () => {
    api.post.mockResolvedValue({ data: { mensaje: 'Solicitud enviada' } });

    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText(/Explica por qué deseas solicitar el reembolso/i);
    fireEvent.change(textarea, {
      target: { value: 'Este es un motivo válido con más de 20 caracteres' },
    });

    const file = new File(['contenido'], 'evidencia.pdf', { type: 'application/pdf' });
    const input = document.getElementById('evidencia-input');
    fireEvent.change(input, { target: { files: [file] } });

    const submitButton = screen.getByText('Enviar Solicitud');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });

    expect(mockOnSuccess).toHaveBeenCalledWith({ mensaje: 'Solicitud enviada' });
  });

  it('debe mostrar estado de carga al enviar', async () => {
    api.post.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 100))
    );

    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText(/Explica por qué deseas solicitar el reembolso/i);
    fireEvent.change(textarea, {
      target: { value: 'Este es un motivo válido con más de 20 caracteres' },
    });

    const submitButton = screen.getByText('Enviar Solicitud');
    fireEvent.click(submitButton);

    expect(screen.getByText('Enviando...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('debe deshabilitar botones mientras envía', async () => {
    api.post.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 100))
    );

    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText(/Explica por qué deseas solicitar el reembolso/i);
    fireEvent.change(textarea, {
      target: { value: 'Este es un motivo válido con más de 20 caracteres' },
    });

    const submitButton = screen.getByText('Enviar Solicitud');
    fireEvent.click(submitButton);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('debe mostrar error de API con detail', async () => {
    const errorDetail = 'Ya existe una solicitud de reembolso para este caso';
    api.post.mockRejectedValue({
      response: {
        data: {
          detail: errorDetail,
        },
      },
    });

    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText(/Explica por qué deseas solicitar el reembolso/i);
    fireEvent.change(textarea, {
      target: { value: 'Este es un motivo válido con más de 20 caracteres' },
    });

    const submitButton = screen.getByText('Enviar Solicitud');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorDetail)).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('debe mostrar error genérico si API falla sin detail', async () => {
    api.post.mockRejectedValue(new Error('Network error'));

    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText(/Explica por qué deseas solicitar el reembolso/i);
    fireEvent.change(textarea, {
      target: { value: 'Este es un motivo válido con más de 20 caracteres' },
    });

    const submitButton = screen.getByText('Enviar Solicitud');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('No se pudo enviar la solicitud. Intenta nuevamente.')).toBeInTheDocument();
    });
  });

  it('debe validar tipo de archivo incorrecto', async () => {
    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText(/Explica por qué deseas solicitar el reembolso/i);
    fireEvent.change(textarea, {
      target: { value: 'Este es un motivo válido con más de 20 caracteres' },
    });

    const file = new File(['contenido'], 'documento.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const input = document.getElementById('evidencia-input');
    fireEvent.change(input, { target: { files: [file] } });

    const submitButton = screen.getByText('Enviar Solicitud');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Solo se permiten archivos PDF, JPG o PNG')).toBeInTheDocument();
    });

    expect(api.post).not.toHaveBeenCalled();
  });

  it('debe validar tamaño de archivo mayor a 5MB', async () => {
    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText(/Explica por qué deseas solicitar el reembolso/i);
    fireEvent.change(textarea, {
      target: { value: 'Este es un motivo válido con más de 20 caracteres' },
    });

    // Crear archivo de 6MB
    const largeFile = new File(['a'.repeat(6 * 1024 * 1024)], 'grande.pdf', { type: 'application/pdf' });
    Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 });

    const input = document.getElementById('evidencia-input');
    fireEvent.change(input, { target: { files: [largeFile] } });

    const submitButton = screen.getByText('Enviar Solicitud');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El archivo no debe superar los 5 MB')).toBeInTheDocument();
    });

    expect(api.post).not.toHaveBeenCalled();
  });

  it('debe llamar onCancel al hacer clic en Cancelar', () => {
    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('debe resetear formulario al cancelar', () => {
    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText(/Explica por qué deseas solicitar el reembolso/i);
    fireEvent.change(textarea, { target: { value: 'Motivo de prueba largo para testing' } });

    const file = new File(['contenido'], 'evidencia.pdf', { type: 'application/pdf' });
    const input = document.getElementById('evidencia-input');
    fireEvent.change(input, { target: { files: [file] } });

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(textarea.value).toBe('');
    expect(screen.queryByText('evidencia.pdf')).not.toBeInTheDocument();
  });

  it('debe mostrar nota informativa sobre el proceso', () => {
    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/Una vez enviada la solicitud, nuestro equipo la revisará en 2-3 días hábiles/i)).toBeInTheDocument();
  });

  it('debe aceptar archivos JPG', () => {
    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const file = new File(['contenido'], 'imagen.jpg', { type: 'image/jpeg' });
    const input = document.getElementById('evidencia-input');

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('imagen.jpg')).toBeInTheDocument();
    expect(screen.queryByText('Solo se permiten archivos PDF, JPG o PNG')).not.toBeInTheDocument();
  });

  it('debe aceptar archivos PNG', () => {
    render(
      <SolicitudReembolso
        isOpen={true}
        casoId={casoId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const file = new File(['contenido'], 'captura.png', { type: 'image/png' });
    const input = document.getElementById('evidencia-input');

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('captura.png')).toBeInTheDocument();
    expect(screen.queryByText('Solo se permiten archivos PDF, JPG o PNG')).not.toBeInTheDocument();
  });
});
