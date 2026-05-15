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

Requiere Node `>=22.13` y pnpm `11.1.1`.

```bash
pnpm install
cp .env.example .env
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
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
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_WHATSAPP_NUMBER="51999999999"
NEXT_PUBLIC_INSTAGRAM_URL="https://instagram.com/danatto"
NEXT_PUBLIC_META_PIXEL_ID=""
NEXT_PUBLIC_TIKTOK_PIXEL_ID=""
MERCADO_PAGO_ACCESS_TOKEN=""
MERCADO_PAGO_PUBLIC_KEY=""
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

## Pagos

Mercado Pago esta preparado en `src/lib/payments.ts`. Si `MERCADO_PAGO_ACCESS_TOKEN` existe, el checkout intenta crear una preferencia real. Si no existe, devuelve una respuesta de modo `not_configured`.

Culqi y Yape/Plin quedan como proveedores preparados para conectar con SDK/API real en una siguiente fase.

## Imagenes

El admin permite agregar varias imagenes por URL y tambien subir varias imagenes si configuras Cloudinary con `CLOUDINARY_CLOUD_NAME` y `CLOUDINARY_UPLOAD_PRESET`. No incluyas claves privadas de Cloudinary en el cliente.

## Pixeles

`NEXT_PUBLIC_META_PIXEL_ID` y `NEXT_PUBLIC_TIKTOK_PIXEL_ID` estan listos para activar inicializacion desde `PixelBoot`. El codigo no inyecta scripts reales hasta que se definan IDs y se complete la politica de consentimiento.

## Marca y assets

Los logos procesados estan en:

- `public/brand/danatto-wordmark-dark.png`
- `public/brand/danatto-wordmark-light.png`

El logo oscuro se usa en header y admin; el logo claro se usa en footer.

## Verificacion local

```bash
pnpm exec tsc --noEmit
pnpm build
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
pnpm db:deploy
pnpm db:seed
pnpm build
```

## Notas de personalizacion

- Cambiar imagenes demo por URLs propias o Cloudinary.
- Ajustar colores en `tailwind.config.ts`.
- Editar textos en las rutas de `src/app`.
- Conectar pasarela real antes de produccion.
- Revisar politicas legales con asesoria local antes de publicar.
