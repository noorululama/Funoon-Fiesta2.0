## Nusa Arts Fest Management

Full-stack Next.js 14 application for managing college arts festival teams, students, programs, assignments, and scoring. The public site shows live standings, while secure admin & jury portals provide CRUD workflows and result pipelines.

### Tech Stack

- Next.js 14 App Router + Server Actions
- TypeScript + Tailwind + shadcn-ui
- MongoDB (local) via Mongoose, seed data provided automatically

### Local Setup

1. **Install dependencies**

```bash
npm install
```

2. **Run MongoDB locally**

- Start a local MongoDB instance (default connection: `mongodb://127.0.0.1:27017/fest_app`)
- You can inspect/modify collections with MongoDB Compass

3. **Configure environment (optional)**

Create `.env.local` if you need a custom connection:

```
MONGODB_URI=mongodb://127.0.0.1:27017/fest_app
MONGODB_DB=fest_app
```

4. **Start the dev server**

```bash
npm run dev
```

Visit `http://localhost:3000`.

### Default Credentials

- **Admin:** `admin / admin123`
- **Sample juries:** see Mongo collection `juries` (e.g., `jury-anika / anika@jury`)

### Data Model

Collections managed in MongoDB:

- `teams`, `students`, `programs`, `juries`
- `assignedprograms`
- `results_pending`, `results_approved`
- `livescores`

The app seeds starter data on first run; edit records directly in Compass or via the admin UI for a fully dynamic experience.
