# Danatto Store

Tienda online premium para ropa americana seleccionada de segunda mano. Incluye experiencia publica, carrito, checkout preparado para Peru, panel admin protegido, Prisma y PostgreSQL.

## Stack

- Next.js App Router + React
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Auth admin con cookie JWT
- Pagos preparados para Mercado Pago, Culqi y Yape/Plin manual
- Imagenes optimizadas con `next/image`
- Hosting pensado para Vercel

## Rutas publicas

- `/`
- `/shop`
- `/shop?brand=ralph-lauren`
- `/shop?category=camisas`
- `/product/[slug]`
- `/cart`
- `/checkout`
- `/about`
- `/contact`
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

Usuario admin de prueba creado por seed:

```text
admin@danatto.com
danatto123
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
CULQI_PUBLIC_KEY=""
CULQI_PRIVATE_KEY=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_UPLOAD_PRESET=""
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

Cuando un pedido se registra en `/api/checkout`, el sistema valida stock y marca el producto como `vendido` si la unidad se agota.

## Checkout con Shalom

El checkout solicita nombres completos, telefono, DNI, provincia y distrito. Con esos datos consulta `/api/shalom/agencies`, muestra agencias Shalom del mismo distrito o, si no hay coincidencia exacta, ordena agencias de la misma provincia por distancia aproximada usando geocodificacion publica.

La base filtrada de agencias publicas esta en `src/lib/shalom-agencies.ts` y se genero desde la data publica de Shalom. Si actualizas la red de agencias, vuelve a regenerar ese archivo antes de desplegar.

## Mercado Pago

La integracion usa Checkout Pro. El backend crea una preferencia de pago en `src/lib/payments.ts`, redirige al cliente a Mercado Pago y recibe confirmaciones en:

```text
/api/payments/mercado-pago/webhook
```

Variables necesarias:

```env
NEXT_PUBLIC_SITE_URL="https://danatto.vercel.app"
MERCADO_PAGO_ENVIRONMENT="sandbox"
MERCADO_PAGO_ACCESS_TOKEN="TEST-..."
MERCADO_PAGO_PUBLIC_KEY="TEST-..."
MERCADO_PAGO_WEBHOOK_SECRET="..."
MERCADO_PAGO_NOTIFICATION_URL="https://danatto.vercel.app/api/payments/mercado-pago/webhook"
MERCADO_PAGO_STATEMENT_DESCRIPTOR="DANATTO"
```

Para produccion cambia `MERCADO_PAGO_ENVIRONMENT` a `production` y usa las credenciales productivas. No coloques claves reales en el repositorio; configuralas en `.env.local` para pruebas privadas o en Environment Variables de Vercel.

En Mercado Pago Developers configura el webhook de la aplicacion con evento `Pagos` apuntando a:

```text
https://danatto.vercel.app/api/payments/mercado-pago/webhook
```

Si `MERCADO_PAGO_ACCESS_TOKEN` no existe, el checkout devuelve modo `not_configured` para que la tienda siga siendo navegable sin cobrar. Si el webhook recibe un pago aprobado, actualiza el pedido a `pagado`; si llega rechazado o cancelado, lo marca como `fallido`; si llega reembolsado, lo marca como `reembolsado`.

Culqi y Yape/Plin quedan como proveedores preparados para conectar con SDK/API real en una siguiente fase.

## Imagenes

El admin permite agregar varias imagenes por URL y tambien subir archivos desde el equipo. La subida usa Vercel Blob con `BLOB_READ_WRITE_TOKEN`; Cloudinary queda como respaldo si configuras `CLOUDINARY_CLOUD_NAME` y `CLOUDINARY_UPLOAD_PRESET`. No incluyas claves privadas en el cliente.

## Pixeles

`NEXT_PUBLIC_META_PIXEL_ID` y `NEXT_PUBLIC_TIKTOK_PIXEL_ID` estan listos para activar inicializacion desde `PixelBoot`. El codigo no inyecta scripts reales hasta que se definan IDs y se complete la politica de consentimiento.

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
- `/admin/login`

## Despliegue completo

Para usar el 100% de la funcionalidad, despliega la app como proyecto Next.js desde Git en Vercel u otro hosting compatible con rutas server, middleware y API routes. Configura PostgreSQL real en `DATABASE_URL`, define `JWT_SECRET` y ejecuta las migraciones antes de operar la tienda.

Comandos recomendados para produccion:

```bash
npm run db:push
npm run db:seed
npm run build
```

## Notas de personalizacion

- Cambiar imagenes demo por URLs propias o Cloudinary.
- Ajustar colores en `tailwind.config.ts`.
- Editar textos en las rutas de `src/app`.
- Conectar pasarela real antes de produccion.
- Revisar politicas legales con asesoria local antes de publicar.
