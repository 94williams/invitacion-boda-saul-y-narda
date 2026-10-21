# Invitación boda Saúl y Narda

[Ver la vista previa desplegada](https://94williams.github.io/invitacion-boda-saul-y-narda/)

La vista de GitHub Pages permite revisar la invitación, el sobre animado y sus secciones. Es una vista previa de diseño: no recoge confirmaciones ni ofrece acceso al panel. El proyecto completo, incluido el backend de confirmaciones y audio, está en este repositorio. El despliegue del backend sigue pendiente por un bloqueo de aprobación del publicador; no se muestra una confirmación falsa ni se envían datos desde la vista previa.

Para actualizar la vista de GitHub Pages, ejecutar `pnpm build:preview` y subir la carpeta `docs/`. GitHub Pages se configura sobre `main` y `/docs`. Los secretos, las bases locales y los archivos privados quedan excluidos.

Invitación de boda en blanco cálido y marfil, con acentos champaña. Conserva el recorrido de la invitación de Aldo: apertura, bienvenida, historia, fecha, itinerario, ubicación, interludio, galería, detalles, regalos, confirmación y cierre.

La apertura anima el sello, la solapa y la tarjeta del sobre en una secuencia breve. Los nombres y títulos se revelan por letras; los elementos de cada sección aparecen una vez al entrar en pantalla. Siete ilustraciones de papelería acompañan el contenido. El pie permite volver a ver la apertura. Se respetan las preferencias de movimiento reducido, se limita el foco al diálogo inicial y se devuelve al título al entrar. El contenido sigue visible si las animaciones no están disponibles.

La galería contiene las seis fotografías de la pareja, retocadas con IA para equilibrar luz, color y encuadre. Se muestran completas, con proporciones originales y carga diferida, en tres, dos o una columna según la pantalla. Los archivos JPEG optimizados están en `public/images/couple/` y se copian a `docs/images/couple/` al compilar el preview.

## Datos del evento

- Fecha: 31 de octubre de 2026; año asumido del contexto actual.
- Hora de inicio, ceremonia y recepción: por confirmar.
- Lugar: Casa de los Padrinos.
- Mapa: https://www.google.com/maps?q=19.291965,-98.853241
- Mesa de regalos y presente en sobre conviven como opciones voluntarias. El enlace de la mesa está pendiente.

## Panel de anfitriones

En `/admin`, con clave privada, pueden consultar respuestas, buscar nombres, filtrar asistencia, contar invitaciones confirmadas y personas, eliminar registros y exportar CSV para Excel. En Ajustes pueden editar fecha, horarios, lugar, mapa, mesa de regalos y subir audio MP3, M4A, WAV u OGG de hasta 12 MB.

La clave se configura mediante el secreto de ejecución `ADMIN_KEY` (mínimo 16 caracteres); no debe incluirse en el repositorio. Para desarrollo, usar `.dev.vars`, que está ignorado por Git. El archivo de acceso entregado al propietario está fuera de este proyecto.

## Confirmaciones

Las respuestas se guardan en D1; el audio en R2. Los invitados no pueden consultar la lista. La sesión del panel usa una cookie firmada, HttpOnly y SameSite Strict. Las mutaciones validan el origen, los campos y los límites de tamaño; la exportación protege contra fórmulas en Excel.

El formulario es abierto y acepta de 1 a 8 personas. Actualiza una respuesta mediante un token de navegador, no mediante el nombre. En otro dispositivo puede generarse un duplicado. Si se bloquea el almacenamiento, el token se conserva solo durante la visita.

Para un control por familia se recomienda un padrón base, pases asignados y enlaces únicos. Sin padrón base, el panel registra respuestas recibidas pero no puede saber quién aún no responde. Definir también fecha límite de confirmación y reglas para menores.

## Desarrollo y verificación

Node >=22.13 y pnpm11.25.0. Ejecutar `pnpm install`, `pnpm dev` y `pnpm build`. Aplicar las migraciones de `drizzle/` al entorno local siguiendo el flujo Sites. El proyecto conserva la integración oficial Vinext/Sites.

`node scripts/verify-rsvp.mjs --base http://127.0.0.1:5173` verifica autorización, validación, confirmaciones, conteos, CSV y audio contra el entorno local. La prueba crea y elimina únicamente sus registros de prueba; configura los datos reales del evento y requiere `.dev.vars`. Rechaza destinos de producción.

Las bases local y publicada son independientes. Las migraciones son solo de esquema. Los datos iniciales del evento se guardan mediante el panel/API administrativa tras publicar. El sitio nuevo conserva acceso privado del propietario hasta que este pida habilitar acceso a invitados.

## Pendientes de contenido

Canción, enlace de mesa de regalos, código de vestimenta y horarios. Las ilustraciones florales decorativas acompañan a las fotografías reales de la galería.
