# Deploy Full Project & Get Your Link

Follow these steps once. After you finish, you will have a **link to access your project**.

---

## Part 1: MongoDB (free, ~2 min)

1. Go to **https://www.mongodb.com/cloud/atlas** → Sign up (free).
2. Create a **free cluster** (M0).
3. **Database Access** → Add Database User → set username & password → **Create**.
4. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0) → **Confirm**.
5. **Database** → **Connect** → **Drivers** → copy the connection string.  
   Example: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/`
6. Add your database name: change the URL to end with `/attendance_db`  
   Example: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/attendance_db`  
   Replace `pass` with your real password (if it has special chars, URL-encode them).
7. **Save this URL** — you will paste it in Render as `MONGODB_URI`.

---

## Part 2: Deploy Backend on Render (~3 min)

1. Go to **https://render.com** → Sign in (e.g. with GitHub).
2. **New +** → **Web Service**.
3. Connect your GitHub repo: **Employee-Attendance-System-by-TharunPV** (or your repo name).
4. Use these settings exactly:

   | Field | Value |
   |-------|--------|
   | **Name** | `attendance-backend` (or any name) |
   | **Region** | Oregon (or nearest) |
   | **Root Directory** | `backend` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |

5. **Environment** → Add:

   | Key | Value |
   |-----|--------|
   | `MONGODB_URI` | The MongoDB URL from Part 1 |
   | `JWT_SECRET` | Any long random string (e.g. `mySecretKey123XYZ`) |
   | `JWT_EXPIRE` | `7d` (optional) |

6. Click **Create Web Service**. Wait until the deploy turns **green** (Live).
7. At the top you’ll see your backend URL, e.g.  
   **`https://attendance-backend-xxxx.onrender.com`**  
   **Copy this URL** — you need it for the frontend.

---

## Part 3: Deploy Frontend on Render (~2 min)

1. On Render: **New +** → **Static Site**.
2. Connect the **same GitHub repo** again.
3. Use these settings:

   | Field | Value |
   |-------|--------|
   | **Name** | `attendance-frontend` (or any name) |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm install && npm run build` |
   | **Publish Directory** | `dist` |

4. **Environment** → Add **one** variable:

   | Key | Value |
   |-----|--------|
   | `VITE_API_URL` | Your **backend URL** from Part 2 (e.g. `https://attendance-backend-xxxx.onrender.com`) — **no** `/api` at the end |

5. Click **Create Static Site**. Wait until the deploy is **Live**.
6. Render will show your frontend URL, e.g.  
   **`https://attendance-frontend-xxxx.onrender.com`**

---

## Your link to access the project

Use this URL in your browser:

**https://[your-frontend-name].onrender.com**

Example: **https://attendance-frontend-abc1.onrender.com**

That is your **full project link**. Open it, register or log in, and use the app.

---

## Test accounts (after first deploy)

Run the seed script **once** so you have sample users. Options:

- **Option A:** Locally: in `backend` run `npm run seed` (with `MONGODB_URI` in `.env` pointing to the same Atlas database you use on Render).  
- **Option B:** Use **Render Shell** (if available): open the backend service → **Shell** → `node src/scripts/tharunSeedData.js` (ensure env vars are set).

Then you can log in as:

- **Manager:** `manager@company.com` / `manager123`
- **Employee:** `john@company.com` / `employee123`

---

## If something fails

- **Backend not starting:** Check Root Directory is `backend` and Start Command is `npm start`. Check `MONGODB_URI` and that Atlas allows 0.0.0.0/0.
- **Frontend blank or API errors:** Check `VITE_API_URL` is exactly your backend URL with no trailing slash and no `/api`.
- **CORS errors:** The backend already uses `cors()`; if you still see CORS errors, say which URL you use and we can adjust.

After you complete Parts 1–3, **the link to access your project is the frontend URL from Part 3.**
