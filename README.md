# BuhPro Platform — Frontend

Next.js 14 frontend for the BuhPro marketplace platform.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A running instance of the BuhPro backend (`diploma-main/`)
- A Firebase project with Firestore and Authentication enabled

### Setup Steps

1. Clone the repository and navigate to `buh-pro-platform/`
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy the environment file:
   ```bash
   cp .env.example .env.local
   ```
4. Edit `.env.local` with your values:
   - `NEXT_PUBLIC_API_URL` — URL of the backend API (e.g. `http://localhost:8080`)
   - `NEXT_PUBLIC_FIREBASE_*` — Firebase Web SDK configuration values (see Firebase Console → Project Settings → General → Your apps)
5. Start the development server:
   ```bash
   pnpm dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Firebase Configuration

Get the Firebase Web SDK config values from the [Firebase Console](https://console.firebase.google.com):
1. Go to **Project Settings** → **General** → **Your apps** → **Web app**
2. Copy the config object values into your `.env.local`

Required variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Backend API (`backend/diploma`)

Point `NEXT_PUBLIC_API_URL` at the Go API (default `http://localhost:8080`). The frontend targets **`backend/diploma`**, not `diploma-main`.

- **Executor registration:** `POST /api/v1/leads/executor` (multipart + documents), then admin approves the lead.
- **Платежи отключены на сайте:** публикация заказов и отправка откликов выполняются сразу, без checkout.

### Build for Production

```bash
pnpm build
pnpm start
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React Context + SWR
- **Real-time**: Firebase Firestore (chat)
- **Notifications**: Polling via `useNotificationsPolling` hook
