# Deployment Guide — ATM Cash Counter

This guide outlines how to deploy the ATM Cash Counter application to **Vercel** and connect it to a free **MongoDB Atlas** database.

---

## Deliverables Checklist
- [x] **GitHub Repository**: [https://github.com/Diksha1810/ATM-cash-counter.git](https://github.com/Diksha1810/ATM-cash-counter.git)
- [ ] **Live Application URL**: Generated after importing into Vercel (e.g., `https://atm-cash-counter.vercel.app`)
- [x] **CI/CD Pipeline**: Automated checks running on GitHub Actions (`.github/workflows/ci.yml`)

---

## Step 1: Set Up MongoDB Atlas (Cloud Database)

Because Vercel runs in the cloud, localhost MongoDB (`mongodb://127.0.0.1:27017`) cannot be reached. You need a free cloud MongoDB instance:

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database) and sign in.
2. Create a free **M0 Cluster**.
3. Under **Security → Database Access**:
   - Add a new database user (e.g. `atm_admin` and set a secure password).
4. Under **Security → Network Access**:
   - Click **Add IP Address** → choose **Allow Access from Anywhere (`0.0.0.0/0`)** (required for Vercel serverless functions).
5. Click **Connect** → **Drivers** (Node.js) and copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/atm_cash_counter?retryWrites=true&w=majority
   ```
   *(Replace `<username>` and `<password>` with your database user credentials).*

---

## Step 2: Seed the ATM Denominations into MongoDB Atlas

Before first use, populate the ATM cash inventory into MongoDB Atlas:

1. In your local terminal:
   ```bash
   cd backend
   ```
2. Run the seed script pointing to your Atlas connection string:
   ```bash
   MONGO_URI="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/atm_cash_counter?retryWrites=true&w=majority" npm run seed
   ```
   You should see: `ATM seeded successfully`.

---

## Step 3: Deploy to Vercel

### Option A: 1-Click Monorepo Deployment (Recommended)
1. Go to [vercel.com](https://vercel.com/) and click **Add New Project**.
2. Select your repository: **`Diksha1810/ATM-cash-counter`**.
3. Keep the **Root Directory** as `./` (the root directory).
4. Expand **Environment Variables** and add:
   | Key | Value |
   | --- | --- |
   | `MONGO_URI` | Your MongoDB Atlas connection string from Step 1 |
   | `SESSION_SECRET` | Any long random string (e.g. `prod_secret_atm_cash_counter_987654321`) |
   | `NODE_ENV` | `production` |
5. Click **Deploy**.
6. Vercel will build both frontend and backend serverless endpoints on the **same domain**.
   - Your frontend will be live at `https://your-project.vercel.app/`
   - Your API will be live at `https://your-project.vercel.app/api`
   - Session cookies work seamlessly without third-party cookie restrictions!

---

## Step 4: Verify Live Application

1. Open your live Vercel URL.
2. Register a new user account (e.g., test user).
3. Log in and navigate to the ATM Cash Counter dashboard.
4. Try a withdrawal (e.g., ₹1,000 or ₹500):
   - Confirm breakdown of notes is displayed.
   - Confirm balance and note inventory update.
5. Click **Transactions** to review your transaction history.
6. Test offline capability (open DevTools → Network tab → toggle **Offline**):
   - The status badge will indicate offline mode.
   - Reconnect to test auto-synchronization.

---

## CI/CD Pipeline Details
- **Trigger**: Every `git push` or `pull request` to `main`.
- **Workflow file**: `.github/workflows/ci.yml`
- **Actions executed**:
  - Validates backend code syntax and serverless entrypoint.
  - Installs frontend packages and creates a production Vite build.
  - Vercel automatically deploys successful builds to production.
