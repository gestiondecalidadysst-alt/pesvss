# pesvss

Plataforma PESV (Resolución 40595 de 2022). Software para diseñar, operar y
auditar el Plan Estratégico de Seguridad Vial, con relación entre pasos
(entradas/salidas), estado derivado y trazabilidad auditable.

## Estructura

- `pesv-api/` — backend (Node + TypeScript + Express + Prisma + PostgreSQL). Fase 1.
- `pesv-web/` — frontend (React + Tailwind). Próximamente.

Cada proyecto es independiente y se comunica solo por la API. Ver
`pesv-api/README.md` para correr el backend.
