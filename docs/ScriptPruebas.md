TC-001	Autenticación y Autorización	Registro de nuevo usuario	Permite registrar un usuario nuevo con credenciales válidas y almacenarlo en Keycloak.
TC-002	Autenticación y Autorización	Inicio de sesión válido	Retorna token JWT válido y acceso a recursos según rol.
TC-003	Autenticación y Autorización	Inicio de sesión inválido	Muestra error 401 sin revelar información sensible.
TC-004	Autenticación y Autorización	Validación de roles y permisos	Deniega el acceso a rutas no autorizadas según el rol asignado.
TC-010	Gestión de Usuarios	Edición de perfil	Actualiza correctamente los datos personales del usuario.
TC-011	Gestión de Usuarios	Visualización de historial	Muestra las reservas, pagos y servicios asociados al usuario.
TC-012	Gestión de Usuarios	Auditoría de acciones	Registra cada acción del usuario en el sistema de logs.
TC-020	Gestión de Eventos	Creación de evento	Permite al organizador crear un evento con todos los campos requeridos.
TC-021	Gestión de Eventos	Modificación y eliminación	Actualiza o elimina eventos correctamente y refleja los cambios en la base de datos.
TC-022	Gestión de Eventos	Subida de archivos	Guarda archivos en Blob Storage y los asocia al evento.
TC-030	Escenarios y Asientos	Configuración de escenario	Crea escenarios con asientos numerados y aforo definido.
TC-031	Escenarios y Asientos	Reserva simultánea	Evita la doble reserva del mismo asiento.
TC-032	Escenarios y Asientos	Liberación automática	Libera asientos no pagados mediante job en background.
TC-040	Reservas	Creación de reserva válida	Crea reservas asociadas a un usuario y evento correctamente.
TC-041	Reservas	Cancelación de reserva	Permite cancelar la reserva antes del evento y actualiza el estado.
TC-042	Reservas	Expiración automática	Cancela reservas vencidas y libera recursos automáticamente.
TC-043	Reservas	Publicación de eventos en RabbitMQ	Envía mensajes a la cola cuando se crea o cancela una reserva.
TC-050	Pagos y Facturación	Pago exitoso	Procesa pagos correctamente y genera comprobante de factura.
TC-051	Pagos y Facturación	Pago fallido	Registra error controlado y programa reintento automático.
TC-052	Pagos y Facturación	Conciliación financiera	Ejecuta job de conciliación con resultados consistentes.
TC-060	Servicios Complementarios	Contratación de servicio	Permite al usuario contratar transporte o catering asociado al evento.
TC-061	Servicios Complementarios	Integración vía RabbitMQ	Envía solicitudes a la cola y recibe confirmaciones correctamente.
TC-062	Servicios Complementarios	Confirmación y notificación	Actualiza el estado del servicio y notifica al usuario en tiempo real.
TC-070	Notificaciones	Correos críticos	Envía mensajes vía SignalR al confirmar reservas o pagos.
TC-071	Notificaciones		Envía correos cuando las notificaciones en tiempo real fallan.
TC-080	Reportes y Analítica	Reporte de ventas	Genera reportes diarios con métricas de ventas y asistencia.
TC-081	Reportes y Analítica	Dashboard administrativo	Muestra métricas actualizadas en tiempo real al administrador.
TC-090	Panel de Control	Supervisión del sistema	Permite visualizar estado de colas, jobs y logs desde el panel.
TC-100	Auditoría y Logs	Registro de operaciones	Registra en MongoDB o ElasticSearch cada acción crítica del sistema.
TC-110	Recomendaciones	Sugerencias personalizadas	Genera recomendaciones basadas en historial y preferencias del usuario.
TC-120	Integración Externa	Sincronización con proveedores	Consume APIs externas simuladas y actualiza disponibilidad vía RabbitMQ.
TC-130	Archivos y Multimedia	Gestión de archivos	Permite subir, consultar y restringir archivos asociados a eventos.
TC-140	Localización	Cambio de idioma	Adapta la interfaz y formatos a la configuración regional del usuario.
TC-150	Marketing y Promociones	Códigos de descuento	Aplica descuentos válidos durante el proceso de pago.
TC-160	Encuestas	Encuestas post-evento	Envía encuestas de satisfacción y guarda respuestas para análisis.
TC-170	Streaming	Acceso a transmisión	Genera enlace único de acceso al streaming de un evento confirmado.
TC-180	Comunidad y Foros	Publicación en foro	Permite publicar mensajes en foros asociados a eventos y moderarlos.