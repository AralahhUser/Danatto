# Danatto Store

Tienda online premium para ropa americana seleccionada de segunda mano. Incluye experiencia publica, carrito, checkout preparado para Peru, panel admin protegido, Prisma y PostgreSQL.

## Stack

- Next.js App Router + React
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Auth admin con cookie JWT
- Pagos reales con Mercado Pago Checkout Pro
- Imagenes optimizadas con `next/image`
- Hosting pensado para Vercel

## Rutas publicas

- `/`
- `/shop`
- `/shop?sort=recent`
- `/product/[slug]`
- `/cart`
- `/checkout`
- `/about`
- `/contact`
- `/complaints`
- `/policies/shipping`
- `/policies/returns`
- `/policies/product-condition`
- `/policies/terms`
- `/policies/privacy`

## Rutas admin

- `/admin/login`
- `/admin/dashboard`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/[id]/edit`
- `/admin/orders`
- `/admin/customers`
- `/admin/brands`
- `/admin/categories`
- `/admin/banners`
- `/admin/coupons`
- `/admin/complaints`

## Instalacion

Requiere Node `>=22.13`.

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

El seed solo crea o actualiza el usuario admin si defines `ADMIN_PASSWORD` en el entorno:

```text
admin@danatto.com
<valor de ADMIN_PASSWORD>
```

## Variables de entorno

Copia `.env.example` a `.env` y configura:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/danatto?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
ADMIN_EMAIL="admin@danatto.com"
ADMIN_PASSWORD="change-this-before-production"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_INSTAGRAM_URL="https://www.instagram.com/danatto.store/"
NEXT_PUBLIC_WHATSAPP_NUMBER="51912354180"
NEXT_PUBLIC_META_PIXEL_ID=""
NEXT_PUBLIC_TIKTOK_PIXEL_ID=""
MERCADO_PAGO_ENVIRONMENT="sandbox"
MERCADO_PAGO_ACCESS_TOKEN=""
MERCADO_PAGO_PUBLIC_KEY=""
MERCADO_PAGO_WEBHOOK_SECRET=""
MERCADO_PAGO_NOTIFICATION_URL=""
MERCADO_PAGO_STATEMENT_DESCRIPTOR="DANATTO"
BLOB_READ_WRITE_TOKEN=""
ORDER_RESERVATION_MINUTES="30"
CRON_SECRET=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_UPLOAD_PRESET=""
WHATSAPP_CLOUD_API_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""
DANATTO_WHATSAPP_NOTIFY_TO="51912354180"
WHATSAPP_API_VERSION="v22.0"
```

No coloques claves reales en el repositorio.

## Prisma

El esquema esta en `prisma/schema.prisma` e incluye:

- `UserAdmin`
- `Product`
- `Brand`
- `Category`
- `Customer`
- `Order`
- `OrderItem`
- `Coupon`
- `Banner`
- `Complaint`

Cuando un pedido se registra en `/api/checkout`, el sistema valida stock y crea una ventana temporal de pago sin descontar stock ni ocultar la prenda. Si Mercado Pago confirma el pago, el producto queda como `vendido` y deja de mostrarse; si el pago falla o la ventana vence, solo se actualiza el estado del pedido.

## Checkout con Shalom

El checkout solicita nombres completos, telefono, DNI, departamento, provincia y distrito cuando corresponde. En provincias con pocas sedes, el distrito es opcional y se muestran directamente las agencias disponibles. Con esos datos consulta `/api/shalom/agencies`, muestra agencias Shalom cercanas y, si hay geocodificacion disponible, las ordena por distancia aproximada.

La base filtrada de agencias publicas esta en `src/lib/shalom-agencies.ts` y se genero desde la data publica de Shalom. Si actualizas la red de agencias, vuelve a regenerar ese archivo antes de desplegar.

## Mercado Pago

La integracion usa Checkout Pro. El backend crea una preferencia de pago en `src/lib/payments.ts`, redirige al cliente a Mercado Pago y recibe confirmaciones en:

```text
/api/payments/mercado-pago/webhook
```

Variables necesarias:

```env
NEXT_PUBLIC_SITE_URL="https://danatto.com"
MERCADO_PAGO_ENVIRONMENT="production"
MERCADO_PAGO_ACCESS_TOKEN="APP_USR-..."
MERCADO_PAGO_PUBLIC_KEY="APP_USR-..."
MERCADO_PAGO_WEBHOOK_SECRET="..."
MERCADO_PAGO_NOTIFICATION_URL="https://danatto.com/api/payments/mercado-pago/webhook"
MERCADO_PAGO_STATEMENT_DESCRIPTOR="DANATTO"
```

Para produccion cambia `MERCADO_PAGO_ENVIRONMENT` a `production` y usa las credenciales productivas. No coloques claves reales en el repositorio; configuralas en `.env.local` para pruebas privadas o en Environment Variables de Vercel.

En Mercado Pago Developers configura el webhook de la aplicacion con evento `Pagos` apuntando a:

```text
https://danatto.com/api/payments/mercado-pago/webhook
```

Si `MERCADO_PAGO_ACCESS_TOKEN` no existe, el checkout no permite generar cobros y marca el pedido como fallido. Si el webhook recibe un pago aprobado, actualiza el pedido a `pagado`, marca la prenda como `vendido` y dispara la notificacion de venta; si llega rechazado o cancelado, marca el pedido como `fallido`; si llega reembolsado, lo marca como `reembolsado`.

La tarea programada `/api/cron/release-reservations` cierra pedidos pendientes vencidos. En Vercel se ejecuta cada 15 minutos desde `vercel.json`; configura `CRON_SECRET` para protegerla.

## WhatsApp operativo

Despues de un pago aprobado, el webhook intenta enviar a WhatsApp los datos del cliente, agencia Shalom, pedido y la imagen publica de cada prenda comprada. La integracion usa WhatsApp Cloud API y requiere estas variables en Vercel:

```env
WHATSAPP_CLOUD_API_TOKEN="EAAG..."
WHATSAPP_PHONE_NUMBER_ID="123456789"
DANATTO_WHATSAPP_NOTIFY_TO="51912354180"
WHATSAPP_API_VERSION="v22.0"
```

El numero destino debe poder recibir mensajes desde tu cuenta de WhatsApp Business/Cloud API. Las imagenes deben tener URL publica para que WhatsApp pueda adjuntarlas.

## Imagenes

El admin permite agregar varias imagenes por URL y tambien subir archivos desde el equipo. La subida usa Vercel Blob con `BLOB_READ_WRITE_TOKEN`; Cloudinary queda como respaldo si configuras `CLOUDINARY_CLOUD_NAME` y `CLOUDINARY_UPLOAD_PRESET`. No incluyas claves privadas en el cliente.

## Pixeles

`NEXT_PUBLIC_META_PIXEL_ID` y `NEXT_PUBLIC_TIKTOK_PIXEL_ID` estan listos para activar inicializacion desde `PixelBoot`. El codigo no inyecta scripts reales hasta que se definan IDs y se complete la politica de consentimiento.

## Libro de reclamaciones

La ruta publica `/complaints` permite registrar reclamos o quejas. El admin puede revisarlos y cambiar estado desde `/admin/complaints`.

## Marca y assets

Los logos procesados estan en:

- `public/brand/danatto-wordmark-dark.png`
- `public/brand/danatto-wordmark-light.png`

El logo oscuro se usa en header y admin; el logo claro se usa en footer.

## Verificacion local

```bash
npm exec tsc --noEmit
npm run build
```

Tambien se recomienda revisar manualmente:

- `/`
- `/shop`
- `/product/camisa-oxford-ralph-lauren`
- `/checkout`
- `/complaints`
- `/admin/login`

## Despliegue completo

Para usar el 100% de la funcionalidad, despliega la app como proyecto Next.js desde Git en Vercel u otro hosting compatible con rutas server, middleware, API routes y cron jobs. Configura PostgreSQL real en `DATABASE_URL`, define `JWT_SECRET`, `CRON_SECRET`, Vercel Blob y Mercado Pago antes de operar la tienda.

Comandos recomendados para produccion:

```bash
npm run db:push
npm run db:seed
npm run build
```

## Notas de personalizacion

- Cambiar imagenes iniciales por fotos propias desde el admin.
- Ajustar colores en `tailwind.config.ts`.
- Editar textos en las rutas de `src/app`.
- Revisar politicas legales con asesoria local antes de publicar.
