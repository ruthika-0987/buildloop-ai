# BuildLoop AI: From Recovered Material to Feasible Reuse

> **"AI suggests, the engine decides, people confirm."**

An evidence-based reuse engine with buyer protection for construction and demolition (C&D) materials in Hyderabad, India.

---

## 1. Quick Start on VS Code (Mac / Linux / Windows)

1. **Verify Node.js version** (Node 20 or newer is required):
   ```bash
   node -v
   # Should output v20.x.x or higher
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```
   Open `.env` in VS Code and set your `GEMINI_API_KEY` (or leave as fallback for manual entry).

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser to: **`http://localhost:3000`**

5. **First Account Setup**:
   - Go to `#/signup`.
   - The very first account registered automatically becomes the **Administrator**.

---

## 2. Setting Up Gemini AI Key

1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key** → **Create API key**.
3. Copy your key and paste it into `.env`:
   ```bash
   GEMINI_API_KEY="AIzaSy..."
   ```
4. **Security Notice**: Never commit `.env` or share your secret key. If accidentally exposed, revoke it immediately in Google AI Studio.

---

## 3. Setting Up Neon PostgreSQL Database

BuildLoop includes embedded local persistent storage (`data/buildloop.json`) that works immediately without any external database.

To connect to cloud PostgreSQL:
1. Sign up at [Neon.tech](https://neon.tech/) (Free tier).
2. Create a new project: `buildloop-db`.
3. Copy the connection string:
   ```text
   postgres://username:password@ep-sample-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Paste into `.env`:
   ```bash
   DATABASE_URL="postgres://username:password@ep-sample-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   ```

---

## 4. Push to GitHub

1. Initialize git and check status:
   ```bash
   git status
   ```
   (Ensure `.env` and `data/` are ignored).

2. Commit and push:
   ```bash
   git add .
   git commit -m "feat: complete BuildLoop AI master build"
   git remote add origin https://github.com/YOUR_USERNAME/buildloop-ai.git
   git branch -M main
   git push -u origin main
   ```

---

## 5. Deploy to Render (Node Web Service)

1. Sign in to [Render.com](https://render.com/).
2. Click **New +** → **Blueprint** (or **Web Service**).
3. Connect your `buildloop-ai` repository.
4. Render will read `render.yaml` automatically:
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Start Command**: `npm start`
   - **Health Check**: `/health`
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google AI Studio key
   - `SESSION_SECRET`: Any random 32+ character string
   - `NODE_ENV`: `production`
6. Click **Deploy**.
7. Open the live URL on your phone and laptop!

*Note on Render free tier: The service sleeps after 15 minutes of inactivity and takes ~30 seconds to wake up on the first request.*

---

## 6. Troubleshooting Table

| Issue | Cause | Fix Hint |
|---|---|---|
| `ERESOLVE unable to resolve dependency tree` | npm peer dependency strictness | Run `npm install --legacy-peer-deps` |
| `Gemini Vision API: MANUAL FALLBACK` | No valid `GEMINI_API_KEY` in environment | Add your key to `.env` or continue with manual listing entry. |
| Blank white page | Client bundle failed or cache issue | Run `npm run clean && npm run build` and hard-refresh browser (`Ctrl+Shift+R`). |
| 401 Unauthorized error | Session cookie expired or cleared | Go to `#/signin` and log in with your credentials. |
| Slow initial request on Render | Free tier service cold start | Wait 30 seconds for the instance to wake up; subsequent requests are instant. |
| Leaflet map gray / broken tiles | Missing Leaflet CSS | Ensure `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">` is present in `index.html`. |

---

## 7. Engine Verification & Proof

- Run the full unit test suite:
  ```bash
  npm test
  ```
- Run TypeScript lint verification:
  ```bash
  npm run lint
  ```
- Visit live browser proof at `#/validation` to observe calibration score = **87/100**, Wilson 95% bound, and ledger stock calculations.
