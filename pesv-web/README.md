# pesv-web — Frontend PESV (Fase 1)

Interfaz de la plataforma PESV. Consume la API de `pesv-api`. No tiene lógica
de negocio: muestra datos y captura formularios.

## Stack

- React + Vite + TypeScript
- Tailwind CSS (tema: teal petróleo + IBM Plex Sans/Mono)
- React Router

## Pantallas de la Fase 1

- Clasificación de nivel (`/`): calcula básico/estándar/avanzado y crea la empresa.
- Tablero de cumplimiento (`/tablero/:orgId`): nivel, porcentaje y estado por dominio.

## Puesta en marcha

```bash
npm install
cp .env.example .env     # ajusta VITE_API_URL (por defecto http://localhost:3000)
npm run dev              # http://localhost:5173
```

Requiere el backend `pesv-api` corriendo.
