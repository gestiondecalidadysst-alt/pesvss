# pesv-api — Backend PESV (Fase 1)

Backend de la plataforma PESV (Resolución 40595 de 2022). Esta es la Fase 1
(MVP): clasificación de nivel, catálogo de los 24 requisitos con sus
entradas/salidas, estado derivado, evidencias con huella y auditoría
encadenada. El frontend (`pesv-web`) es un proyecto aparte que consume esta API.

## Stack

- Node.js + TypeScript
- Express (API REST)
- Prisma + PostgreSQL
- SHA-256 para huella de evidencias y cadena de auditoría

## Estructura

```
pesv-api/
  prisma/
    schema.prisma      modelo de datos
    seed.ts            catálogo de los 24 requisitos + grafo de dependencias
  src/
    server.ts          punto de entrada
    db.ts              cliente Prisma
    engine/
      clasificacion.ts cálculo del nivel (básico/estándar/avanzado)
      estado.ts        estado derivado de cada requisito
    common/
      audit.ts         auditoría encadenada por hash
    modules/
      organizacion/    crear org, clasificar y ajustar nivel, resumen
      requisitos/      catálogo y detalle con entradas/salidas
      evidencias/      carga de evidencia con huella SHA-256
```

## Puesta en marcha

```bash
npm install
cp .env.example .env            # ajusta DATABASE_URL
npm run prisma:generate
npm run prisma:migrate          # crea las tablas
npm run seed                    # carga los 24 requisitos y sus dependencias
npm run dev                     # API en http://localhost:3000
```

## Endpoints principales

| Método | Ruta | Qué hace |
| --- | --- | --- |
| POST | `/organizaciones` | Crea la empresa y clasifica su nivel automáticamente |
| PUT | `/organizaciones/:id/flota` | Recalcula el nivel al cambiar flota/conductores |
| PUT | `/organizaciones/:id/nivel-manual` | Ajusta a un nivel superior (no inferior al mínimo legal) |
| GET | `/organizaciones/:id/resumen` | Nivel, porcentaje y estado de cada paso (tablero) |
| GET | `/requisitos` | Catálogo con el grafo de entradas/salidas |
| GET | `/requisitos/:paso/org/:orgId` | Detalle de un paso con su estado y evidencias |
| POST | `/evidencias` | Carga una evidencia (multipart: `archivo`) con su huella |
| GET | `/auditoria/:orgId/verificar` | Comprueba que la cadena de auditoría no fue alterada |

## Qué sigue

- Fase 2: datos maestros (flota, colaboradores, conductores) e inspecciones.
- Motor de no conformidades: generar plan de acción cuando una meta no se cumple.
- Autenticación (JWT + RBAC) y almacenamiento real de archivos en S3/MinIO.
- Los umbrales de clasificación de nivel (`src/engine/clasificacion.ts`) están
  marcados como pendientes de validar contra el texto oficial de la norma.
