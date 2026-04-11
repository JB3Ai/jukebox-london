## 🏗️ Architecture: Node.js + Express
This app is designed for cPanel/Passenger environments.

### 1. Backend Logic (`server.js`)
- **Engine:** Google Lyria 3 (via Gemini Pro API).
- **Endpoint:** `POST /api/conduct`
- **Logic:** Receives "Phase" and "Atmosphere" data, returns a generative audio buffer.
- **Passenger Hook:** `module.exports = app;` is required for cPanel deployment.

### 2. Frontend Design (`public/`)
- **UI System:** "Liquid Glass" (High-refraction blurs + Neon accents).
- **Typography:** - `Druk Wide` (Hero)
  - `SF Pro Rounded` (Interface)
- **State Management:** Simple Vanilla JS or React to handle "Phase" toggling.

### 3. Environment Variables
Ensure the following are set in the cPanel Node.js Selector:
- `NODE_ENV`: production
- `GEMINI_API_KEY`: [Stored in JB3Ai vault]
- `PORT`: (Managed by Passenger)

## 🧪 Deployment Workflow
1. Commit changes to `main` branch.
2. Pull updates in cPanel Git Version Control.
3. Restart Node.js application in cPanel dashboard.