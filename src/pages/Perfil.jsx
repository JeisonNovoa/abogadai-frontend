import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';

export default function Perfil() {
  const { user, updateUserProfile } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState({});
  const [showCambiarPassword, setShowCambiarPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    identificacion: '',
    direccion: '',
    telefono: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        identificacion: user.identificacion || '',
        direccion: user.direccion || '',
        telefono: user.telefono || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (erroresValidacion[name]) {
      setErroresValidacion(prev => {
        const nuevos = { ...prev };
        delete nuevos[name];
        return nuevos;
      });
    }
  };

  const validarCampo = async (campo, valor) => {
    if (!valor || valor.trim() === '') return null;

    try {
      if (campo === 'identificacion') {
        const cedulaRes = await api.get(`/api/referencias/validar/cedula/${valor}`);
        if (cedulaRes.data.es_valida) {
          return { tipo: 'success', mensaje: `Cédula válida: ${cedulaRes.data.cedula_formateada}` };
        }

        const nitRes = await api.get(`/api/referencias/validar/nit/${valor}`);
        if (nitRes.data.es_valido) {
          return { tipo: 'success', mensaje: `NIT válido: ${nitRes.data.nit_formateado}` };
        }

        return { tipo: 'error', mensaje: 'Identificación inválida' };
      }

      if (campo === 'telefono') {
        const telRes = await api.get(`/api/referencias/validar/telefono/${valor}`);
        if (telRes.data.es_valido) {
          return { tipo: 'success', mensaje: `Teléfono válido: ${telRes.data.telefono_formateado}` };
        }
        return { tipo: 'error', mensaje: telRes.data.razon || 'Teléfono inválido' };
      }
    } catch (error) {
      console.error('Error validando:', error);
    }
    return null;
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    const resultado = await validarCampo(name, value);
    if (resultado) {
      setErroresValidacion(prev => ({ ...prev, [name]: resultado }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserProfile(formData);
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      toast.error(error.response?.data?.detail || 'Error actualizando perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/cambiar-password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });
      toast.success('Contraseña actualizada exitosamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowCambiarPassword(false);
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      toast.error(error.response?.data?.detail || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  // Obtener iniciales del usuario
  const getUserInitials = () => {
    const nombre = formData.nombre || user?.nombre || '';
    const apellido = formData.apellido || user?.apellido || '';
    if (nombre && apellido) {
      return `${nombre[0]}${apellido[0]}`.toUpperCase();
    }
    return nombre ? nombre.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: 'var(--neutral-200)' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header con avatar */}
        <div
          className="shadow-sm rounded-lg p-6 mb-6 flex items-center gap-6"
          style={{ backgroundColor: 'white' }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-3xl flex-shrink-0"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              boxShadow: '0 8px 16px rgba(11, 109, 255, 0.3)',
            }}
          >
            {getUserInitials()}
          </div>
          <div className="flex-1">
            <h1
              className="text-3xl font-bold"
              style={{ color: 'var(--neutral-800)' }}
            >
              Mi Perfil
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: 'var(--neutral-600)' }}
            >
              {user?.email}
            </p>
          </div>
        </div>

        {/* Formulario de datos personales */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="shadow rounded-lg p-6"
            style={{ backgroundColor: 'white' }}
          >
            <h2
              className="text-xl font-semibold mb-6"
              style={{ color: 'var(--neutral-800)' }}
            >
              Datos Personales
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />

              <Input
                label="Apellido"
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
              />

              <Input
                label="Cédula / NIT"
                type="text"
                name="identificacion"
                value={formData.identificacion}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="12345678"
                success={erroresValidacion.identificacion?.tipo === 'success' ? erroresValidacion.identificacion.mensaje : undefined}
                error={erroresValidacion.identificacion?.tipo === 'error' ? erroresValidacion.identificacion.mensaje : undefined}
              />

              <Input
                label="Teléfono"
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="3001234567"
                success={erroresValidacion.telefono?.tipo === 'success' ? erroresValidacion.telefono.mensaje : undefined}
                error={erroresValidacion.telefono?.tipo === 'error' ? erroresValidacion.telefono.mensaje : undefined}
              />

              <div className="md:col-span-2">
                <Input
                  label="Dirección Completa"
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  required
                  placeholder="Calle 123 # 45-67, Bogotá"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        </form>

        {/* Seguridad */}
        <div
          className="shadow rounded-lg p-6 mt-6"
          style={{ backgroundColor: 'white' }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: 'var(--neutral-800)' }}
            >
              Seguridad
            </h2>
            {!showCambiarPassword && (
              <Button
                variant="neutral"
                size="sm"
                onClick={() => setShowCambiarPassword(true)}
              >
                Cambiar Contraseña
              </Button>
            )}
          </div>

          {showCambiarPassword && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Contraseña Actual"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
                placeholder="••••••••"
              />

              <Input
                label="Nueva Contraseña"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                placeholder="••••••••"
                helpText="Mínimo 6 caracteres"
              />

              <Input
                label="Confirmar Nueva Contraseña"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                placeholder="••••••••"
                success={passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword ? 'Las contraseñas coinciden' : undefined}
                error={passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword ? 'Las contraseñas no coinciden' : undefined}
              />

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="neutral"
                  onClick={() => {
                    setShowCambiarPassword(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                >
                  Actualizar Contraseña
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Info */}
        <div
          className="mt-6 p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--color-info-light)',
            border: `1px solid var(--color-primary)`,
          }}
        >
          <h3
            className="font-semibold mb-2"
            style={{ color: 'var(--color-primary-dark)' }}
          >
            ¿Por qué necesitamos estos datos?
          </h3>
          <p
            className="text-sm"
            style={{ color: 'var(--neutral-700)' }}
          >
            Estos datos se utilizarán automáticamente en todos tus casos nuevos para evitar que
            tengas que ingresarlos cada vez. Puedes modificarlos temporalmente en cada caso si lo necesitas.
          </p>
        </div>
      </div>
    </div>
  );
}
