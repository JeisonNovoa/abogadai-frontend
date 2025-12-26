# Casos de Prueba Manual - Sistema de Niveles y Límites

Este documento contiene los casos de prueba manual para validar el funcionamiento completo del sistema de niveles, límites de sesiones y reembolsos implementado en las Fases 5, 6 y 7.

## Índice

1. [Sistema de Niveles](#sistema-de-niveles)
2. [Límites de Sesiones](#límites-de-sesiones)
3. [Sistema de Reembolsos](#sistema-de-reembolsos)
4. [Panel de Administración](#panel-de-administración)
5. [Integración Completa](#integración-completa)

---

## Sistema de Niveles

### CP-NIV-001: Visualización del nivel FREE
**Objetivo**: Verificar que un usuario FREE ve correctamente su nivel y beneficios

**Precondiciones**:
- Usuario autenticado con nivel FREE
- 0 pagos realizados

**Pasos**:
1. Iniciar sesión
2. Navegar a `/app/avatar`
3. Observar el componente NivelUsuario

**Resultado Esperado**:
- ✅ Badge "Free" visible con gradiente gris
- ✅ Icono 🆓 visible
- ✅ Muestra "Progreso hacia Bronce"
- ✅ Barra de progreso en 0%
- ✅ Texto "0 de 3 pagos"
- ✅ Beneficios: 3 sesiones, 10 minutos, 3 docs, $15.000

---

### CP-NIV-002: Progreso hacia el siguiente nivel
**Objetivo**: Verificar que se muestra correctamente el progreso al realizar pagos

**Precondiciones**:
- Usuario con nivel FREE
- 1 pago realizado

**Pasos**:
1. Navegar a `/app/avatar`
2. Observar barra de progreso

**Resultado Esperado**:
- ✅ Texto "1 de 3 pagos"
- ✅ Barra de progreso al 33%
- ✅ Color de la barra coherente con el nivel

---

### CP-NIV-003: Actualización a nivel BRONCE
**Objetivo**: Verificar la actualización de nivel tras completar pagos

**Precondiciones**:
- Usuario con nivel FREE
- 3 pagos realizados

**Pasos**:
1. Realizar el tercer pago
2. Esperar actualización del sistema
3. Recargar página `/app/avatar`

**Resultado Esperado**:
- ✅ Badge "Bronce" con gradiente dorado/café
- ✅ Icono 🥉
- ✅ Nuevos beneficios: 5 sesiones, 12 minutos, 5 docs, $14.000
- ✅ Progreso hacia PLATA iniciado

---

### CP-NIV-004: Nivel PLATA
**Objetivo**: Verificar visualización del nivel PLATA

**Precondiciones**:
- Usuario con nivel PLATA activo

**Pasos**:
1. Navegar a `/app/avatar`
2. Observar componente NivelUsuario

**Resultado Esperado**:
- ✅ Badge "Plata" con gradiente plateado
- ✅ Icono 🥈
- ✅ Beneficios: 7 sesiones, 15 minutos, 7 docs, $13.000

---

### CP-NIV-005: Nivel ORO (máximo)
**Objetivo**: Verificar nivel máximo alcanzado

**Precondiciones**:
- Usuario con nivel ORO

**Pasos**:
1. Navegar a `/app/avatar`
2. Observar componente NivelUsuario

**Resultado Esperado**:
- ✅ Badge "Oro" con gradiente dorado brillante
- ✅ Icono 🥇
- ✅ Beneficios: 10 sesiones, 20 minutos, 10 docs, $12.000
- ✅ No muestra progreso hacia siguiente nivel
- ✅ Mensaje indicando nivel máximo

---

## Límites de Sesiones

### CP-LIM-001: Visualización de uso diario
**Objetivo**: Verificar que se muestra correctamente el uso de sesiones y minutos

**Precondiciones**:
- Usuario autenticado
- 2 sesiones usadas de 5 disponibles
- 18 minutos usados de 50 disponibles

**Pasos**:
1. Navegar a `/app/avatar`
2. Observar componente UsoSesiones

**Resultado Esperado**:
- ✅ Título "Uso de Sesiones Hoy"
- ✅ Texto "2 / 5" en sesiones
- ✅ Texto "18 / 50 min" en minutos
- ✅ Barras de progreso al 40% (sesiones) y 36% (minutos)
- ✅ Colores verde/azul (uso normal)
- ✅ Tip de obtener más sesiones

---

### CP-LIM-002: Advertencia de sesiones cercanas al límite
**Objetivo**: Verificar advertencia cuando se acerca al límite de sesiones

**Precondiciones**:
- Usuario con 4 sesiones usadas de 5 disponibles (80%)

**Pasos**:
1. Navegar a `/app/avatar`
2. Observar UsoSesiones

**Resultado Esperado**:
- ✅ Barra de sesiones en color naranja
- ✅ Mensaje de advertencia: "Cuidado! Te estás acercando al límite de sesiones"
- ✅ Icono ⚠️ visible

---

### CP-LIM-003: Advertencia de minutos cercanos al límite
**Objetivo**: Verificar advertencia de minutos

**Precondiciones**:
- Usuario con 40 minutos usados de 50 disponibles (80%)

**Pasos**:
1. Navegar a `/app/avatar`
2. Observar UsoSesiones

**Resultado Esperado**:
- ✅ Barra de minutos en color naranja
- ✅ Mensaje: "Cuidado! Te estás quedando sin minutos"

---

### CP-LIM-004: Límite de sesiones alcanzado (100%)
**Objetivo**: Verificar comportamiento al alcanzar límite

**Precondiciones**:
- Usuario con todas las sesiones usadas

**Pasos**:
1. Navegar a `/app/avatar`
2. Observar UsoSesiones

**Resultado Esperado**:
- ✅ Barra de sesiones en color rojo
- ✅ Mensaje: "Límite alcanzado"
- ✅ Icono 🚫

---

### CP-LIM-005: Modal de confirmación de sesión - permitida
**Objetivo**: Verificar modal cuando se puede iniciar sesión

**Precondiciones**:
- Usuario con cupo disponible
- 2 sesiones de 5 usadas
- 20 minutos de 50 usados

**Pasos**:
1. Navegar a `/app/avatar`
2. Hacer clic en "Iniciar Nueva Sesión"
3. Esperar carga del modal

**Resultado Esperado**:
- ✅ Modal abierto con título "Confirmar Inicio de Sesión"
- ✅ Mensaje "¡Todo listo! Puedes iniciar tu sesión de avatar"
- ✅ Muestra "3 sesiones disponibles" (5 - 2)
- ✅ Muestra "30 min disponibles" (50 - 20)
- ✅ Duración máxima de sesión: 10 minutos
- ✅ Botones "Iniciar Sesión" y "Cancelar" habilitados

---

### CP-LIM-006: Modal de confirmación - límite alcanzado HTTP 429
**Objetivo**: Verificar modal cuando no se puede iniciar sesión

**Precondiciones**:
- Usuario con todas las sesiones usadas (límite alcanzado)

**Pasos**:
1. Navegar a `/app/avatar`
2. Hacer clic en "Iniciar Nueva Sesión"
3. Esperar respuesta del servidor

**Resultado Esperado**:
- ✅ Modal muestra "Límite Alcanzado"
- ✅ Mensaje de error del servidor
- ✅ Icono 🚫
- ✅ Tip: "Paga un documento para obtener +2 sesiones extra hoy mismo"
- ✅ Solo botón "Cerrar" disponible
- ✅ No se muestra botón "Iniciar Sesión"

---

### CP-LIM-007: Auto-actualización de uso cada 30 segundos
**Objetivo**: Verificar actualización automática del uso

**Precondiciones**:
- Usuario en página `/app/avatar`

**Pasos**:
1. Observar el componente UsoSesiones
2. Anotar valores actuales
3. Esperar 30 segundos
4. Observar si hay nueva llamada a la API

**Resultado Esperado**:
- ✅ Componente se actualiza cada 30 segundos
- ✅ Valores reflejan uso actual del backend
- ✅ No hay parpadeos molestos durante la actualización

---

## Sistema de Reembolsos

### CP-REEM-001: Solicitar reembolso con motivo válido
**Objetivo**: Verificar solicitud de reembolso exitosa

**Precondiciones**:
- Usuario con al menos 1 documento pagado
- Caso no tiene reembolso solicitado

**Pasos**:
1. Navegar a `/app/casos`
2. Localizar caso con documento pagado
3. Hacer clic en "Solicitar Reembolso"
4. Ingresar motivo válido (>20 caracteres): "El documento no cumple con mis expectativas porque..."
5. Hacer clic en "Enviar Solicitud"

**Resultado Esperado**:
- ✅ Modal se abre correctamente
- ✅ Muestra "Garantía de Satisfacción"
- ✅ Contador de caracteres funciona
- ✅ Se envía la solicitud exitosamente
- ✅ Toast de confirmación
- ✅ Modal se cierra
- ✅ Estado del caso actualizado

---

### CP-REEM-002: Validación de motivo vacío
**Objetivo**: Verificar validación de campo obligatorio

**Precondiciones**:
- Modal de reembolso abierto

**Pasos**:
1. Dejar campo de motivo vacío
2. Hacer clic en "Enviar Solicitud"

**Resultado Esperado**:
- ✅ Mensaje de error: "El motivo es obligatorio"
- ✅ No se envía la solicitud
- ✅ Borde del textarea en rojo

---

### CP-REEM-003: Validación de motivo corto (<20 caracteres)
**Objetivo**: Verificar longitud mínima del motivo

**Precondiciones**:
- Modal de reembolso abierto

**Pasos**:
1. Ingresar motivo de 10 caracteres: "Muy corto"
2. Hacer clic en "Enviar Solicitud"

**Resultado Esperado**:
- ✅ Error: "El motivo debe tener al menos 20 caracteres"
- ✅ Contador muestra caracteres actuales en rojo
- ✅ No se envía la solicitud

---

### CP-REEM-004: Upload de evidencia PDF válido
**Objetivo**: Verificar carga de archivo PDF

**Precondiciones**:
- Modal de reembolso abierto
- Archivo PDF de prueba (<5MB)

**Pasos**:
1. Hacer clic en área de upload
2. Seleccionar archivo PDF válido
3. Verificar preview del archivo

**Resultado Esperado**:
- ✅ Nombre del archivo mostrado
- ✅ Icono 📄 para PDF
- ✅ Tamaño del archivo en MB
- ✅ Botón de remover archivo visible
- ✅ No hay mensajes de error

---

### CP-REEM-005: Upload de evidencia imagen válida
**Objetivo**: Verificar carga de imagen JPG/PNG

**Precondiciones**:
- Modal de reembolso abierto
- Imagen JPG o PNG (<5MB)

**Pasos**:
1. Hacer clic en área de upload
2. Seleccionar imagen válida
3. Verificar preview

**Resultado Esperado**:
- ✅ Nombre del archivo mostrado
- ✅ Icono 🖼️ para imagen
- ✅ Tamaño en MB
- ✅ Sin errores

---

### CP-REEM-006: Validación de tipo de archivo incorrecto
**Objetivo**: Verificar rechazo de archivos no permitidos

**Precondiciones**:
- Modal de reembolso abierto

**Pasos**:
1. Intentar cargar archivo .docx o .txt
2. Hacer clic en "Enviar Solicitud"

**Resultado Esperado**:
- ✅ Error: "Solo se permiten archivos PDF, JPG o PNG"
- ✅ No se envía la solicitud
- ✅ Borde del área de upload en rojo

---

### CP-REEM-007: Validación de tamaño de archivo (>5MB)
**Objetivo**: Verificar límite de tamaño

**Precondiciones**:
- Modal de reembolso abierto
- Archivo PDF > 5MB

**Pasos**:
1. Intentar cargar archivo grande
2. Hacer clic en "Enviar Solicitud"

**Resultado Esperado**:
- ✅ Error: "El archivo no debe superar los 5 MB"
- ✅ No se envía la solicitud

---

### CP-REEM-008: Remover archivo adjunto
**Objetivo**: Verificar eliminación de archivo seleccionado

**Precondiciones**:
- Modal de reembolso abierto
- Archivo ya seleccionado

**Pasos**:
1. Hacer clic en botón de eliminar (icono basura)
2. Observar cambios

**Resultado Esperado**:
- ✅ Archivo removido
- ✅ Vuelve a mostrar área de upload
- ✅ Mensaje "Haz clic para seleccionar un archivo"

---

### CP-REEM-009: Solicitud sin evidencia (opcional)
**Objetivo**: Verificar que evidencia es opcional

**Precondiciones**:
- Modal de reembolso abierto

**Pasos**:
1. Ingresar motivo válido (>20 caracteres)
2. NO cargar archivo
3. Hacer clic en "Enviar Solicitud"

**Resultado Esperado**:
- ✅ Solicitud enviada exitosamente
- ✅ FormData solo contiene motivo
- ✅ Toast de confirmación

---

### CP-REEM-010: Cancelar solicitud de reembolso
**Objetivo**: Verificar cancelación y reset del formulario

**Precondiciones**:
- Modal de reembolso abierto
- Datos ingresados

**Pasos**:
1. Ingresar motivo
2. Cargar archivo
3. Hacer clic en "Cancelar"

**Resultado Esperado**:
- ✅ Modal se cierra
- ✅ Formulario se resetea
- ✅ Al abrir nuevamente, campos están vacíos

---

## Panel de Administración

### CP-ADM-001: Acceso al panel de administración
**Objetivo**: Verificar protección de rutas admin

**Precondiciones**:
- Usuario con rol admin

**Pasos**:
1. Iniciar sesión como admin
2. Navegar a `/admin/dashboard`

**Resultado Esperado**:
- ✅ Acceso permitido
- ✅ Layout de admin visible
- ✅ Sidebar con navegación

---

### CP-ADM-002: Acceso denegado para usuarios no admin
**Objetivo**: Verificar que usuarios normales no acceden

**Precondiciones**:
- Usuario sin rol admin

**Pasos**:
1. Iniciar sesión como usuario normal
2. Intentar navegar a `/admin/dashboard`

**Resultado Esperado**:
- ✅ Pantalla "Acceso Denegado"
- ✅ Mensaje de falta de permisos
- ✅ Botón para volver al inicio

---

### CP-ADM-003: Dashboard - Métricas generales
**Objetivo**: Verificar visualización de métricas

**Precondiciones**:
- Usuario admin autenticado
- Sistema con datos de prueba

**Pasos**:
1. Navegar a `/admin/dashboard`
2. Observar cards de resumen

**Resultado Esperado**:
- ✅ Card "Total Usuarios" con número
- ✅ Card "Sesiones Hoy" con número
- ✅ Card "Reembolsos Pendientes" con número
- ✅ Card "Documentos Pagados" con número
- ✅ Iconos correspondientes (👥📱⏳💰)

---

### CP-ADM-004: Dashboard - Distribución de niveles
**Objetivo**: Verificar gráficos de niveles

**Precondiciones**:
- Dashboard cargado

**Pasos**:
1. Observar sección "Distribución de Niveles"
2. Verificar cada nivel

**Resultado Esperado**:
- ✅ 4 cards: FREE, BRONCE, PLATA, ORO
- ✅ Iconos correctos (🆓🥉🥈🥇)
- ✅ Cantidad de usuarios por nivel
- ✅ Porcentaje del total
- ✅ Barra de progreso visual

---

### CP-ADM-005: Dashboard - Estadísticas de reembolsos
**Objetivo**: Verificar métricas de reembolsos

**Precondiciones**:
- Dashboard cargado
- Existen solicitudes de reembolso

**Pasos**:
1. Observar sección "Estadísticas de Reembolsos"
2. Verificar números

**Resultado Esperado**:
- ✅ Total de reembolsos
- ✅ Pendientes (fondo amarillo)
- ✅ Aprobados (fondo verde)
- ✅ Rechazados (fondo rojo)
- ✅ Tasa de Aprobación con porcentaje
- ✅ Barra de progreso de aprobación

---

### CP-ADM-006: Dashboard - Uso de sesiones
**Objetivo**: Verificar métricas de sesiones

**Precondiciones**:
- Dashboard cargado

**Pasos**:
1. Observar sección "Uso de Sesiones"

**Resultado Esperado**:
- ✅ Sesiones Hoy con número
- ✅ Promedio por Usuario (decimal con 1 decimal)
- ✅ Duración Promedio en minutos

---

### CP-ADM-007: Dashboard - Botón actualizar
**Objetivo**: Verificar recarga manual de métricas

**Precondiciones**:
- Dashboard cargado

**Pasos**:
1. Hacer clic en botón "Actualizar"
2. Observar indicadores de carga

**Resultado Esperado**:
- ✅ Nueva llamada a API
- ✅ Métricas actualizadas
- ✅ Hora de última actualización cambia

---

### CP-ADM-008: Gestión de Reembolsos - Listado con filtro pendientes
**Objetivo**: Verificar vista de solicitudes pendientes

**Precondiciones**:
- Usuario admin
- Existen solicitudes pendientes

**Pasos**:
1. Navegar a `/admin/reembolsos`
2. Por defecto, filtro "Pendientes" activo

**Resultado Esperado**:
- ✅ Tabla con solicitudes pendientes
- ✅ Columnas: Caso ID, Usuario, Monto, Fecha, Estado, Motivo, Evidencia, Acciones
- ✅ Badge "⏳ Pendiente" visible
- ✅ Botones "Aprobar" y "Rechazar" habilitados
- ✅ Filtro "Pendientes" resaltado

---

### CP-ADM-009: Filtrar solicitudes aprobadas
**Objetivo**: Verificar filtro de aprobadas

**Precondiciones**:
- Usuario admin en `/admin/reembolsos`

**Pasos**:
1. Hacer clic en filtro "Aprobadas"
2. Observar tabla

**Resultado Esperado**:
- ✅ Solo muestra solicitudes con estado "aprobado"
- ✅ Badge "✅ Aprobado" visible
- ✅ Sin botones de acción (ya procesadas)
- ✅ Texto "—" en columna de acciones

---

### CP-ADM-010: Filtrar solicitudes rechazadas
**Objetivo**: Verificar filtro de rechazadas

**Precondiciones**:
- Usuario admin en `/admin/reembolsos`

**Pasos**:
1. Hacer clic en filtro "Rechazadas"

**Resultado Esperado**:
- ✅ Solo muestra rechazadas
- ✅ Badge "❌ Rechazado" visible
- ✅ Sin botones de acción

---

### CP-ADM-011: Ver todas las solicitudes
**Objetivo**: Verificar filtro "Todas"

**Precondiciones**:
- Usuario admin en `/admin/reembolsos`

**Pasos**:
1. Hacer clic en filtro "Todas"

**Resultado Esperado**:
- ✅ Muestra todas las solicitudes sin importar estado
- ✅ Badges de diferentes colores visibles
- ✅ Botones solo en pendientes

---

### CP-ADM-012: Ver evidencia adjunta
**Objetivo**: Verificar apertura de evidencia en nueva ventana

**Precondiciones**:
- Solicitud con evidencia_url presente

**Pasos**:
1. Localizar solicitud con evidencia
2. Hacer clic en botón de ojo (ver evidencia)

**Resultado Esperado**:
- ✅ Se abre nueva ventana/pestaña
- ✅ URL apunta al archivo de evidencia
- ✅ Archivo PDF o imagen se visualiza

---

### CP-ADM-013: Solicitud sin evidencia
**Objetivo**: Verificar indicador cuando no hay archivo

**Precondiciones**:
- Solicitud sin evidencia_url

**Pasos**:
1. Localizar solicitud sin evidencia
2. Observar columna de evidencia

**Resultado Esperado**:
- ✅ Texto "Sin evidencia" visible
- ✅ No hay botón de ver evidencia

---

### CP-ADM-014: Aprobar solicitud de reembolso
**Objetivo**: Verificar flujo completo de aprobación

**Precondiciones**:
- Solicitud pendiente disponible

**Pasos**:
1. Hacer clic en "Aprobar"
2. Leer modal de confirmación
3. Verificar información mostrada
4. Hacer clic en "Confirmar Aprobación"
5. Esperar respuesta

**Resultado Esperado**:
- ✅ Modal se abre con título "Aprobar Solicitud de Reembolso"
- ✅ Muestra caso ID
- ✅ Advertencia con consecuencias:
  - Se procesará el reembolso
  - Nivel del usuario se reduce en 1 pago
  - Documento se bloquea
  - Email de confirmación
- ✅ Solicitud se aprueba
- ✅ Toast de éxito
- ✅ Modal se cierra
- ✅ Tabla se recarga
- ✅ Solicitud ya no aparece en pendientes

---

### CP-ADM-015: Cancelar aprobación
**Objetivo**: Verificar cancelación del modal de aprobar

**Precondiciones**:
- Modal de aprobar abierto

**Pasos**:
1. Hacer clic en "Cancelar"

**Resultado Esperado**:
- ✅ Modal se cierra
- ✅ No se realiza ninguna acción
- ✅ Solicitud sigue pendiente

---

### CP-ADM-016: Rechazar solicitud con razón
**Objetivo**: Verificar flujo de rechazo con razón

**Precondiciones**:
- Solicitud pendiente disponible

**Pasos**:
1. Hacer clic en "Rechazar"
2. Ingresar razón: "El motivo proporcionado no justifica el reembolso"
3. Hacer clic en "Confirmar Rechazo"

**Resultado Esperado**:
- ✅ Modal se abre con título "Rechazar Solicitud de Reembolso"
- ✅ Campo de razón obligatorio
- ✅ Nota sobre envío de email
- ✅ Solicitud se rechaza
- ✅ Toast de éxito
- ✅ Modal se cierra
- ✅ Tabla se recarga

---

### CP-ADM-017: Rechazar sin razón (validación)
**Objetivo**: Verificar que razón es obligatoria

**Precondiciones**:
- Modal de rechazar abierto

**Pasos**:
1. Dejar campo de razón vacío
2. Hacer clic en "Confirmar Rechazo"

**Resultado Esperado**:
- ✅ Toast de error: "Debes proporcionar una razón para el rechazo"
- ✅ No se envía la solicitud
- ✅ Modal permanece abierto

---

### CP-ADM-018: Actualizar lista de solicitudes
**Objetivo**: Verificar botón de actualizar

**Precondiciones**:
- Usuario en `/admin/reembolsos`

**Pasos**:
1. Hacer clic en botón "Actualizar"

**Resultado Esperado**:
- ✅ Nueva llamada a API
- ✅ Tabla se recarga
- ✅ Contadores de filtros se actualizan

---

## Integración Completa

### CP-INT-001: Flujo completo de nuevo usuario
**Objetivo**: Validar experiencia de usuario desde registro hasta primer pago

**Pasos**:
1. Registrarse como nuevo usuario
2. Iniciar sesión
3. Navegar a `/app/avatar`
4. Verificar nivel FREE
5. Verificar 0 sesiones usadas
6. Iniciar una sesión de avatar
7. Completar sesión
8. Pagar un documento
9. Verificar progreso hacia BRONCE
10. Verificar +2 sesiones extra

**Resultado Esperado**:
- ✅ Nivel FREE al inicio
- ✅ Progreso actualizado después del pago
- ✅ Sesiones extra otorgadas
- ✅ Todo funciona sin errores

---

### CP-INT-002: Alcanzar límite diario y solicitar reembolso
**Objetivo**: Verificar flujo cuando usuario alcanza límite y pide reembolso

**Pasos**:
1. Usuario con 3 sesiones usadas (límite FREE)
2. Intentar iniciar nueva sesión
3. Recibir mensaje de límite alcanzado
4. Navegar a `/app/casos`
5. Solicitar reembolso de documento pagado
6. Admin procesa y aprueba reembolso
7. Verificar reducción de nivel
8. Verificar documento bloqueado nuevamente

**Resultado Esperado**:
- ✅ Modal muestra límite alcanzado (HTTP 429)
- ✅ Solicitud de reembolso enviada
- ✅ Admin aprueba sin problemas
- ✅ Nivel del usuario se reduce
- ✅ Documento vuelve a estado bloqueado

---

### CP-INT-003: Escalado de niveles FREE → BRONCE → PLATA → ORO
**Objetivo**: Verificar escalado completo de niveles

**Pasos**:
1. Usuario inicia en FREE
2. Realizar 3 pagos → BRONCE
3. Realizar 5 pagos más → PLATA
4. Realizar 10 pagos más → ORO
5. Verificar beneficios en cada nivel

**Resultado Esperado**:
- ✅ FREE: 3 sesiones, 10 min
- ✅ BRONCE: 5 sesiones, 12 min
- ✅ PLATA: 7 sesiones, 15 min
- ✅ ORO: 10 sesiones, 20 min
- ✅ Precios reducen progresivamente

---

### CP-INT-004: Uso diario con múltiples sesiones
**Objetivo**: Verificar comportamiento durante el día con varias sesiones

**Pasos**:
1. Usuario FREE (3 sesiones diarias)
2. Iniciar sesión 1 (8 minutos)
3. Finalizar sesión 1
4. Verificar uso: 1/3 sesiones, 8 minutos usados
5. Iniciar sesión 2 (5 minutos)
6. Finalizar sesión 2
7. Verificar uso: 2/3 sesiones, 13 minutos usados
8. Iniciar sesión 3 (10 minutos)
9. Verificar advertencia de última sesión
10. Finalizar sesión 3
11. Intentar sesión 4

**Resultado Esperado**:
- ✅ Uso se actualiza correctamente después de cada sesión
- ✅ Advertencias aparecen al acercarse al límite
- ✅ Sesión 4 bloqueada con HTTP 429
- ✅ Mensaje de límite alcanzado

---

### CP-INT-005: Admin monitorea y gestiona sistema
**Objetivo**: Verificar capacidades completas del admin

**Pasos**:
1. Admin ingresa a `/admin/dashboard`
2. Revisar métricas generales
3. Verificar distribución de niveles
4. Navegar a `/admin/reembolsos`
5. Procesar solicitudes pendientes:
   - Aprobar 2 solicitudes
   - Rechazar 1 solicitud con razón
6. Regresar a dashboard
7. Verificar actualización de estadísticas

**Resultado Esperado**:
- ✅ Dashboard muestra métricas en tiempo real
- ✅ Procesamiento de reembolsos exitoso
- ✅ Estadísticas se actualizan tras procesar
- ✅ Tasa de aprobación se recalcula

---

### CP-INT-006: Pago exitoso y beneficios inmediatos
**Objetivo**: Verificar que beneficios se otorgan inmediatamente después del pago

**Pasos**:
1. Usuario con 2 sesiones usadas de 3 (1 disponible)
2. Pagar un documento
3. Verificar inmediatamente en `/app/avatar`

**Resultado Esperado**:
- ✅ +2 sesiones extra otorgadas (ahora 3 disponibles)
- ✅ Progreso hacia siguiente nivel actualizado
- ✅ Mensaje en página de pago exitoso muestra beneficios
- ✅ Redirección a `/app/pago-exitoso`

---

### CP-INT-007: Reseteo diario de límites
**Objetivo**: Verificar que límites se resetean a medianoche

**Precondiciones**:
- Usuario con límite alcanzado el día anterior

**Pasos**:
1. Esperar hasta después de medianoche
2. Iniciar sesión
3. Navegar a `/app/avatar`
4. Verificar UsoSesiones

**Resultado Esperado**:
- ✅ Sesiones usadas: 0 / X
- ✅ Minutos usados: 0 / Y
- ✅ Barras de progreso en 0%
- ✅ Puede iniciar nueva sesión

---

## Checklist de Testing Manual

### Antes de Liberar a Producción

- [ ] Todos los casos de prueba ejecutados sin errores
- [ ] Tests automatizados pasando al 100%
- [ ] Responsividad validada en:
  - [ ] Desktop (1920x1080)
  - [ ] Tablet (768x1024)
  - [ ] Mobile (375x667)
- [ ] Navegadores validados:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Validación de accesibilidad:
  - [ ] Navegación con teclado funciona
  - [ ] Lectores de pantalla compatibles
  - [ ] Contraste de colores adecuado
- [ ] Performance:
  - [ ] Tiempos de carga < 3 segundos
  - [ ] No hay memory leaks
  - [ ] Auto-actualizaciones no causan lag
- [ ] Seguridad:
  - [ ] Rutas protegidas funcionan
  - [ ] Tokens JWT validados
  - [ ] XSS y SQL Injection mitigados
  - [ ] Upload de archivos sanitizado

---

## Reporte de Bugs

Si encuentras algún error durante las pruebas manuales, reportarlo con el siguiente formato:

```
**ID**: BUG-XXX
**Título**: Descripción corta del bug
**Severidad**: Crítica | Alta | Media | Baja
**Caso de Prueba**: CP-XXX-XXX
**Pasos para Reproducir**:
1. Paso 1
2. Paso 2
3. Paso 3

**Resultado Esperado**: Lo que debería pasar
**Resultado Actual**: Lo que realmente pasa
**Capturas de Pantalla**: [adjuntar si aplica]
**Navegador/OS**: Chrome 120 / Windows 11
```

---

## Notas Finales

- Estos casos de prueba deben ejecutarse en un entorno de staging antes de producción
- Se recomienda tener datos de prueba variados (usuarios en diferentes niveles, con y sin pagos, etc.)
- Documentar cualquier comportamiento inesperado aunque no sea un error
- Validar que todos los mensajes de error son claros y útiles para el usuario
