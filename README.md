# Invitación boda Saúl y Narda

[Ver la vista previa desplegada](https://94williams.github.io/invitacion-boda-saul-y-narda/)

La vista de GitHub Pages permite revisar la invitación, el sobre animado y sus secciones. Es una vista previa de diseño: no recoge confirmaciones ni ofrece acceso al panel. El proyecto completo, incluido el backend de confirmaciones, está en este repositorio. Las respuestas no se envían ni se guardan desde GitHub Pages.

Para actualizar la vista de GitHub Pages, ejecutar `pnpm build:preview` y subir la carpeta `docs/`. GitHub Pages se configura sobre `main` y `/docs`. Los secretos, las bases locales y los archivos privados quedan excluidos.

Invitación de boda en blanco cálido y marfil, con acentos champaña. Conserva el recorrido de la invitación de Aldo: apertura, bienvenida, historia, fecha, agradecimiento a padrinos, itinerario con ceremonia civil, ceremonia religiosa y recepción, ubicación, interludio, galería, detalles, regalos, confirmación y cierre con contacto de WhatsApp.

La apertura ofrece una secuencia de 3,2 segundos: una aproximación suave al sobre, desprendimiento del sello, apertura de la solapa, salida pausada de la tarjeta y fundido hacia la invitación. La sección inicial presenta la fotografía de la pareja con un desenfoque suave y una capa clara para mantener el texto legible. Flores vectoriales crema, champaña y oliva enmarcan la papelería desde arriba y abajo; la luz y las sombras acompañan la apertura sin movimientos continuos. Los nombres y títulos se revelan por letras; los elementos de cada sección aparecen una vez al entrar en pantalla. Ocho ilustraciones de papelería acompañan el contenido. El pie permite volver a ver la apertura. Se respetan las preferencias de movimiento reducido con entrada inmediata, se limita el foco al diálogo inicial y se devuelve al título al entrar. El contenido sigue visible si las animaciones no están disponibles.

La galería contiene las seis fotografías de la pareja, retocadas con IA para equilibrar luz, color y encuadre. Las cuatro verticales se agrupan en dos columnas; la lancha y el camello comparten una fila con anchos proporcionales a su formato. En móvil se presentan en una columna. Los marcos marfil de doble línea champaña y el paspartú conservan cada fotografía completa, sin recortar ni estirar. Los archivos JPEG se mantienen en `public/images/couple/` y se copian a `docs/images/couple/` al compilar el preview.

## Datos del evento

- Fecha: 31 de octubre de 2026; año asumido del contexto actual.
- Boda civil: 15:00; ceremonia religiosa: 16:00; recepción: por confirmar.
- Lugar: Casa de los Padrinos.
- Mapa: https://www.google.com/maps?q=19.291965,-98.853241
- Vestimenta: blanco o colores claros.
- La historia de la pareja celebra cinco años juntos y su decisión de casarse.
- Una mesa de regalos y un presente en sobre conviven como opciones voluntarias. El enlace de la mesa está pendiente.

## Mesas de regalos y portada para compartir

En GitHub Pages, los únicos datos que hay que sustituir están en `app/gift-registry-config.ts`: nombre y enlace de la mesa. Pegar un enlace HTTPS, compilar `pnpm build:preview` y subir `docs/`. El botón se activa al tener un enlace válido y abre la mesa en otra pestaña. Mientras falta el destino, muestra «Próximamente» y queda deshabilitado.

La portada `public/images/portada-boda.png` (1200 × 630) y su original SVG incluyen monograma, nombres y fecha. Los metadatos del preview y de la aplicación la utilizan al compartir el enlace. La invitación muestra un único aviso de horarios pendientes y, en la vista pública sin backend, una tarjeta de confirmaciones por abrir sin campos editables.

## Panel de anfitriones

En `/admin`, con clave privada, pueden consultar respuestas, buscar nombres, filtrar asistencia, contar invitaciones confirmadas y personas, eliminar registros y exportar CSV para Excel. En Ajustes pueden editar fecha, hora de boda civil, hora de ceremonia religiosa, recepción, lugar, mapa, nombre y enlace de la mesa de regalos. La invitación incluye una canción predeterminada que intenta reproducirse cuando el invitado pulsa «Abrir invitación». La carga de audio personalizado no está habilitada para evitar almacenamiento adicional.

Al abrir la invitación, la música comienza cuando el invitado pulsa «Abrir invitación». Si vuelve a cargar la página en la misma pestaña después de abrirla, la invitación intenta iniciar la música automáticamente. El navegador puede bloquear el sonido; en ese caso, se puede iniciar desde el botón flotante de música.

La clave se configura mediante el secreto de ejecución `ADMIN_KEY` (mínimo 16 caracteres); no debe incluirse en el repositorio. Para desarrollo, usar `.dev.vars`, que está ignorado por Git. El archivo de acceso entregado al propietario está fuera de este proyecto.

## Confirmaciones

Las respuestas se guardan en D1. El audio predeterminado forma parte de los archivos estáticos; la carga de audio personalizado está desactivada y no requiere R2. Los invitados no pueden consultar la lista. La sesión del panel usa una cookie firmada, HttpOnly y SameSite Strict. Las mutaciones validan el origen, los campos y los límites de tamaño; la exportación protege contra fórmulas en Excel.

El formulario es abierto y acepta de 1 a 8 personas. Actualiza una respuesta mediante un token de navegador, no mediante el nombre. En otro dispositivo puede generarse un duplicado. Si se bloquea el almacenamiento, el token se conserva solo durante la visita.

Para un control por familia se recomienda un padrón base, pases asignados y enlaces únicos. Sin padrón base, el panel registra respuestas recibidas pero no puede saber quién aún no responde. Definir también fecha límite de confirmación y reglas para menores.

## Despliegue funcional en Cloudflare

GitHub Pages sirve únicamente la vista previa estática; no recibe ni almacena RSVP. Para publicar la invitación funcional, conectar este repositorio a Cloudflare Workers & Pages con el comando de compilación `pnpm run build` y el comando de despliegue `pnpm run deploy:cloudflare`.

Antes del primer despliegue, crear una base D1 llamada `narda-saul-rsvp`. En los ajustes de compilación del proyecto Cloudflare, configurar `WEDDING_D1_DATABASE_ID` con el ID real de esa base. El ID se incluye en la configuración generada del Worker; no es una contraseña. Configurar `ADMIN_KEY` como secreto de ejecución del Worker, nunca como variable de compilación ni en Git. No se necesita suscripción R2 para RSVP. El comando de despliegue valida que exista el ID D1 real, aplica las migraciones remotas pendientes de `drizzle/` y solo entonces publica.

La URL pública `workers.dev` sirve la invitación y las API desde el mismo origen. El panel de anfitriones está en `/admin` y debe protegerse con el secreto `ADMIN_KEY`. Aplicar las migraciones y configurar el secreto antes de habilitar el sitio para invitados.

## Desarrollo y verificación

Node >=22.13 y pnpm11.25.0. Ejecutar `pnpm install`, `pnpm dev` y `pnpm build`. Aplicar las migraciones de `drizzle/` al entorno local siguiendo el flujo Sites. El proyecto conserva la integración oficial Vinext/Sites.

`node scripts/verify-rsvp.mjs --base http://127.0.0.1:5173` verifica autorización, validación, confirmaciones, conteos y CSV contra el entorno local. También verifica que la carga de audio personalizado permanece deshabilitada sin R2. La prueba crea y elimina únicamente sus registros de prueba; configura los datos reales del evento y requiere `.dev.vars`. Rechaza destinos de producción.

Las bases local y publicada son independientes. Las migraciones son solo de esquema. Los datos iniciales del evento se guardan mediante el panel/API administrativa tras publicar. El sitio nuevo conserva acceso privado del propietario hasta que este pida habilitar acceso a invitados.

La migración `0002_second_gift_registry.sql` añade la segunda mesa sin modificar los datos existentes de la primera. Debe aplicarse junto con las migraciones anteriores antes de publicar esta versión del backend.

La migración `0003_aberrant_xorn.sql` añade la hora de boda civil. Para los ajustes ya publicados, conserva las 15:00 como hora civil y cambia la hora religiosa previamente guardada a las 16:00.

## Pendientes de contenido

Canción, enlace de la mesa de regalos y horario de recepción. Las ilustraciones florales decorativas acompañan a las fotografías reales de la galería.
