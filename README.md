# TrailBliss — Travel Website

Full-stack travel booking app. React frontend + Node/Express backend with MongoDB.

## Live Demo

- **Frontend (Vercel):** https://travel-website-topaz-delta.vercel.app
- **Backend (Render):** https://travel-backend-qtfn.onrender.com
- **Database:** MongoDB Atlas

## Project Structure

```
travelwebsite/
├── package.json        # root orchestrator (concurrently)
├── client/             # React frontend (Create React App)
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── styles/
│       └── utils/
└── server/             # Node/Express backend
    ├── package.json
    ├── index.js        # entry (port 5000)
    ├── data/
    ├── models/
    ├── modules/        # routers: bookings, cars, destinations, rentals, reviews
    ├── utils/
    └── seed.js
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB running locally on `mongodb://localhost:27017/travelDB`

## Install

From the project root (`travelwebsite/`):

```bash
npm install                      # installs root devDeps (concurrently)
npm --prefix client install      # installs frontend deps
npm --prefix server install      # installs backend deps
```

Or in one shot:

```bash
npm run install:all
```

## Run

### Both together (recommended)

From the project root:

```bash
npm run dev
```

Starts:
- **Frontend** → http://localhost:3000
- **Backend**  → http://localhost:5000

### Individually

```bash
npm run client                   # frontend only (port 3000)
npm run server                   # backend only  (port 5000)
```

Or from inside each folder:

```bash
cd client && npm start
cd server && npm start
```

## Root Scripts

| Script              | What it does                                   |
|---------------------|------------------------------------------------|
| `npm run dev`       | Runs client + server concurrently              |
| `npm run client`    | Starts only the React frontend                 |
| `npm run server`    | Starts only the Express backend                |
| `npm run build`     | Builds the frontend for production             |
| `npm run seed`      | Seeds the database (runs `server/seed.js`)     |
| `npm run install:all` | Installs deps in root, client, and server    |

## Backend API

Base URL: `http://localhost:5000`

| Method | Route                                          | Purpose            |
|--------|------------------------------------------------|--------------------|
| POST   | `/signup`                                      | Create account     |
| POST   | `/login`                                       | Login              |
| GET    | `/api/favorites/:username`                     | List favorites     |
| POST   | `/api/favorites`                               | Add favorite       |
| DELETE | `/api/favorites/:username/:destination_name`   | Remove favorite    |
| GET    | `/reviews`                                     | List reviews       |
| POST   | `/reviews`                                     | Add review         |
| *      | `/api/v1/bookings`, `/rentals`, `/destinations`, `/reviews` | Modular routers |
| *      | `/api/cars`                                    | Cars router        |
| GET    | `/api/v1/health`                               | Health check       |

## Frontend

- Create React App (react-scripts 5)
- React Router v7
- API calls hit `http://localhost:5000/...` directly (no proxy configured)

## Ports

| Service  | Port |
|----------|------|
| Frontend | 3000 |
| Backend  | 5000 |
| MongoDB  | 27017 |

## Troubleshooting

- **`npm run dev` errors inside `client/` or `server/`** — the `dev` script lives at the **root**. Inside each folder use `npm start`.
- **`ECONNREFUSED` on frontend API calls** — backend isn't running. Start it with `npm run server`.
- **Mongoose connection error** — MongoDB isn't running locally. Start it (`mongod`) or update the URI in `server/index.js`.

## Tech Stack

- **Frontend**: React 19, React Router 7, Axios, CRA (react-scripts 5)
- **Backend**: Express 5, Mongoose 9, bcrypt, cors, pg
- **DB**: MongoDB
