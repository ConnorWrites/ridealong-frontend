# RideAlong — Frontend

The frontend client for **RideAlong**, a full-stack ridesharing application. Handles the user interface, live map routing, and communication with the backend API.

🔗 Backend repo: [ridealong-backend](https://github.com/ConnorWrites/ridealong-backend)

## Features

- 🔐 Login/signup flows (cookie-based session, no token handling in JS)
- 🚗 Ride creation and management UI
- 🤝 Ride request flow (rider ↔ driver)
- 🗺️ Live map rendering and routing (MapTiler + OSRM)

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Framework  | React, Vite |
| UI Library | Material UI v6 |
| Mapping    | MapTiler (tiles/rendering), OSRM (routing, via backend) |

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- The [backend](https://github.com/ConnorWrites/ridealong-backend) running locally or a deployed backend URL

### Installation

```bash
git clone [frontend](https://github.com/ConnorWrites/ridealong-frontend)
cd ridealong-frontend

npm install

cp .env.example .env
# Fill in VITE_API_BASE_URL, VITE_MAPTILER_API_KEY

npm run dev
```

### Environment Variables

```
VITE_API_BASE_URL=http://localhost:3000
VITE_MAPTILER_API_KEY=your-maptiler-key
```

## Project Structure

```
ridealong-frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── ...
├── vite.config.ts
└── README.md
```

## Architecture Notes

- **API communication**: All requests go to `VITE_API_BASE_URL` and rely on the backend's HTTP-only auth cookie — no tokens are stored or handled client-side.
- **Map layer**: MapTiler renders the base map; route lines/ETAs come from the backend, which proxies OSRM.
- **MUI v6**: Component usage follows v6's updated API — watch for breaking changes if referencing older MUI v5 examples/docs.

## Known Issues Solved

- MUI v6 migration (breaking changes from v5)
- Cross-origin cookie/auth handling with the backend
- TypeScript config alignment

## Roadmap

- [ ] Deploy live instance (Vercel/Netlify)
- [ ] Loading/error states polish
- [ ] Mobile responsiveness pass

## License
??? Still don't know what to put here...
