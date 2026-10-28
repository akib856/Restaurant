# 🍽️ Verdant Table — Restaurant Website with Online Ordering

A complete restaurant website: customers browse the menu and place orders for **home delivery** or **pickup**,
and staff manage everything from an **admin dashboard**.

- **Frontend:** React 18 + Vite + Tailwind CSS 4 (customer site and admin dashboard)
- **Backend:** Node.js + Express REST API
- **Database:** MongoDB (local or MongoDB Atlas)

> The restaurant name, contact details, fees and opening hours can be changed in **Admin → Settings**. No code change is needed.

---

## 📑 Contents
1. [Features](#-features)
2. [Requirements](#-requirements)
3. [First-time setup](#-first-time-setup)
4. [Starting the project every day](#-starting-the-project-every-day)
5. [Logins and important addresses](#-logins-and-important-addresses)
6. [Viewing the database (MongoDB Compass)](#-viewing-the-database-mongodb-compass)
7. [Project structure](#-project-structure)
8. [Commands](#-commands)
9. [Settings (.env files)](#-settings-env-files)
10. [Troubleshooting](#-troubleshooting)
11. [Testing](#-testing)
12. [Not finished yet](#-not-finished-yet)
13. [Going live (deployment)](#-going-live-deployment)

---

## ✨ Features

### For customers
- Homepage, menu with search / filter / sort, and dish pages with sizes and add-ons
- A cart that is kept after closing the browser
- Checkout as a guest or with an account · home delivery or pickup · cash on delivery
- Accounts: register, log in / out, profile with a saved address, order history, cancel an order while it is pending
- Cookie consent banner (Accept all / Reject / Customize), Cookie policy page, and "Cookie settings" in the footer.
  Choice is saved in the `vt_consent` cookie; gate any future analytics/marketing script on `useConsent.getState().choice?.analytics`

### For admin and staff
- Dashboard with live stats and a sales chart
- Order queue with filters; order status can only move in allowed steps (e.g. *Confirmed → Preparing*)
- "Mark cash collected" for cash-on-delivery orders
- Menu management: add / edit dishes, **upload dish photos from your computer**, mark dishes available / featured / popular
- Customers, coupons, restaurant settings and an audit log of admin actions

### Safety built in
- Prices, coupons, delivery fee, VAT and minimum order are always calculated **on the server** (prices sent by the browser are ignored)
- An order cannot be created twice by double-clicking
- Passwords hashed with bcrypt, login cookies are httpOnly, protection against CSRF, rate limiting and NoSQL injection
- Uploaded images are checked to be real JPG / PNG / WebP files (max 5 MB)

---

## 🧰 Requirements

Install these once (Windows):

| Software | Why | Check it works |
|---|---|---|
| [Node.js 20 LTS or newer](https://nodejs.org) | Runs the website and API | `node -v` |
| [MongoDB Community Server](https://www.mongodb.com/try/download/community) — tick **"Install as a Service"** | The database | `Get-Service MongoDB` |
| [MongoDB Compass](https://www.mongodb.com/try/download/compass) *(optional)* | Look at the database | — |
| [VS Code](https://code.visualstudio.com) | Edit code and run the terminal | — |

---

## 🚀 First-time setup

> ⚠️ **Important:** the project folder is inside another folder with the same name.
> Always work in the **inner** folder, the one that contains `package.json`:
> `C:\Users\<you>\Desktop\restaurant-website\restaurant-website`
>
> Easiest: in VS Code use **File → Open Folder** and pick that inner folder. Every new terminal then starts in the right place.
> Check with `Test-Path .\package.json` — it must print `True`.

Open a terminal in VS Code (**Ctrl + `**) and run:

```powershell
# 1. Install all packages (frontend + backend)
npm install

# 2. Create your settings files from the examples
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
```

3. Open `server\.env` and change `JWT_SECRET` to a long random string (this protects logins).

4. Make sure MongoDB is running:
   ```powershell
   Get-Service MongoDB        # should say "Running"
   Start-Service MongoDB      # only if it was stopped (run PowerShell as admin)
   ```

5. Fill the database with sample menu items and an admin account:
   ```powershell
   npm run seed
   ```
   It prints the admin login (see [Logins](#-logins-and-important-addresses)).

> 💡 Lines like `MONGODB_URI=...` are **settings that go inside the `.env` file**, not commands to type in the terminal.

---

## ▶️ Starting the project every day

You need **two terminals** (click the **+** in the VS Code terminal panel to open a second one). Run both from the inner project folder.

**Terminal 1 — the API (backend):**
```powershell
npm run dev:server
```

**Terminal 2 — the website (frontend):**
```powershell
npm run dev:client
```

Then open **http://localhost:5173** in your browser.

> If port 5173 is busy, Vite picks another one (5174, 5175…). Always open the exact address shown on the **`Local:`** line in terminal 2.

**To stop:** click a terminal and press **Ctrl + C**.

---

## 🔑 Logins and important addresses

| What | Address / value |
|---|---|
| Website | http://localhost:5173 |
| Admin dashboard | Log in on the website with the admin account below |
| API health check | http://localhost:5000/api/v1/health |
| Admin email | `admin@restaurant.local` |
| Admin password | `ChangeMe123!` — **change it after your first login** |

> Use `localhost`, not `127.0.0.1`, in the browser — otherwise login cookies won't work and you'll be logged out immediately.

---

## 🧭 Viewing the database (MongoDB Compass)

1. Open **MongoDB Compass**.
2. Connection string: `mongodb://127.0.0.1:27017` → **Connect**.
3. Open the **`restaurant`** database (the name comes from `MONGODB_URI` in `server\.env`).

| Collection | Contains |
|---|---|
| `users` | Customer, staff and admin accounts |
| `categories` | Menu sections (Burgers, Drinks, …) |
| `menuitems` | Dishes, prices, options, images |
| `orders` | Customer orders |
| `payments` | Payment records |
| `coupons` | Discount codes |
| `settings` | Restaurant name, hours, fees |
| `auditlogs` | Record of admin actions |

> ⚠️ Edits in Compass go live on the site immediately. Don't change passwords there — they are hashed; use the website instead.

---

## 📁 Project structure

```
restaurant-website/
├── package.json            ← root: runs client + server together (npm workspaces)
├── README.md               ← this file
├── .gitignore
│
├── client/                 ← FRONTEND (React website + admin dashboard)
│   ├── index.html
│   ├── vite.config.js      ← dev server on port 5173, forwards /api to the backend
│   ├── .env.example
│   └── src/
│       ├── main.jsx        ← entry point
│       ├── index.css       ← Tailwind theme: colours, fonts, buttons, cards
│       ├── app/App.jsx     ← all page routes (URLs)
│       ├── pages/          ← customer pages
│       │   ├── Home.jsx, Menu.jsx, FoodDetail.jsx
│       │   ├── Cart.jsx, Checkout.jsx, OrderSuccess.jsx
│       │   ├── Auth.jsx (login/register), Account.jsx
│       │   └── Static.jsx (about, privacy, terms)
│       ├── admin/Admin.jsx ← whole admin dashboard (stats, orders, menu, image upload, …)
│       ├── components/     ← shared pieces: Layout (header/footer), FoodCard, ui (spinner, errors)
│       ├── services/api.js ← all calls to the backend + image upload
│       ├── store/cart.js   ← shopping cart (saved in the browser)
│       ├── hooks/          ← data-loading helpers
│       ├── schemas/        ← checkout form validation
│       └── utils/          ← money / status formatting
│
├── server/                 ← BACKEND (Express API)
│   ├── .env.example
│   ├── uploads/            ← uploaded dish photos (created automatically, not in git)
│   ├── src/
│   │   ├── server.js       ← starts the API
│   │   ├── app.js          ← middleware, routes, serves /api/v1/uploads
│   │   ├── config/         ← env settings, database connection
│   │   ├── models/         ← MongoDB schemas (User, MenuItem, Order, …)
│   │   ├── routes/         ← auth, menu, orders, admin (incl. image upload)
│   │   ├── middleware/     ← login/role checks, validation, error handling
│   │   ├── services/       ← business logic: pricing, orders, order status, payments
│   │   ├── validators/     ← request validation rules (zod)
│   │   └── utils/          ← audit log, slugs
│   └── tests/              ← automated tests (pricing, status, API)
│
├── scripts/seed.js         ← fills the database with sample data + admin
└── docs/
    ├── API.md              ← list of all API endpoints
    └── MANUAL_TESTS.md     ← checklist for testing by hand
```

### Where do I change…?
| I want to change… | Go to |
|---|---|
| Restaurant name, phone, hours, fees | **Admin → Settings** on the website |
| Dishes, prices, photos | **Admin → Menu** on the website |
| Colours, fonts, button styles | `client/src/index.css` |
| Homepage layout / text | `client/src/pages/Home.jsx` |
| Header / footer | `client/src/components/Layout.jsx` |
| Price / VAT / delivery calculations | `server/src/services/pricing.js` |
| Sample data | `scripts/seed.js` |

---

## ⌨️ Commands

Run all of these from the **inner project folder**.

| Command | What it does |
|---|---|
| `npm install` | Install all packages |
| `npm run seed` | Load sample data + admin account into the database |
| `npm run dev:server` | Start the API on port 5000 (restarts automatically when you edit code) |
| `npm run dev:client` | Start the website on port 5173 (updates instantly when you edit code) |
| `npm test` | Run the automated tests |
| `npm run build` | Build the website for going live (output in `client/dist`) |

---

## ⚙️ Settings (.env files)

**`server\.env`**

| Setting | Meaning |
|---|---|
| `PORT` | API port (default `5000`) |
| `NODE_ENV` | `development` on your PC, `production` when live |
| `MONGODB_URI` | Database address, e.g. `mongodb://127.0.0.1:27017/restaurant` or an Atlas connection string |
| `CLIENT_ORIGIN` | Website address allowed to use the API (`http://localhost:5173`) |
| `JWT_SECRET` | Long random secret that protects logins — **must** be changed |
| `PAYMENT_*` | Online payment settings — leave empty for now |

**`client\.env`**

| Setting | Meaning |
|---|---|
| `VITE_API_URL` | Leave empty on your PC (the dev server forwards `/api` to the backend) |

> 🔒 Never share or commit `.env` files — they contain secrets.

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---|---|
| `Test-Path .\package.json` prints `False` / `npm` can't find scripts | You're in the outer folder: `cd .\restaurant-website` |
| `MONGODB_URI=... is not recognized` | That line belongs **in `server\.env`**, not the terminal |
| `ECONNREFUSED 127.0.0.1:27017` | MongoDB isn't running: `Start-Service MongoDB` (PowerShell as admin) |
| Browser shows `ERR_CONNECTION_REFUSED` | The website isn't running, or it's on another port — check the `Local:` line in terminal 2 |
| `EADDRINUSE :5000` | Port in use: change `PORT` in `server\.env` and the proxy in `client\vite.config.js` |
| `npm` not recognised | Reopen VS Code after installing Node.js |
| "Scripts disabled" in PowerShell | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Logged out right after logging in | Use `http://localhost:5173`, not `127.0.0.1` |
| "CSRF check failed" in Postman | Add header `X-Requested-With: XMLHttpRequest` |
| Red Tailwind error "Cannot apply unknown utility class" | Custom classes used inside `@apply` must be declared with `@utility` in `index.css` |
| Image upload fails | Only JPG / PNG / WebP up to 5 MB, and you must be logged in as admin |

---

## 🧪 Testing

```powershell
npm test
```
Runs Vitest + Supertest. API tests use a temporary **in-memory MongoDB** (downloaded once), so they never touch your real data.

- Manual test checklist: [`docs/MANUAL_TESTS.md`](docs/MANUAL_TESTS.md)
- API reference: [`docs/API.md`](docs/API.md)

---

## 🚧 Not finished yet

- **Online payments** — the slot exists (`server/src/services/payments.js`) but no payment gateway is connected,
  so "Pay online" stays disabled. Nothing ever fakes a successful payment. Next step: get **SSLCommerz**
  (bKash, Nagad, cards) or **bKash PGW** sandbox credentials and implement payment start + a verified webhook.
- **Image storage when live** — photos are saved in `server/uploads` on the API machine. That works on your PC or a VPS,
  but hosts like Render/Railway delete files on restart; there, switch to cloud storage (e.g. Cloudinary).
- **Categories** — API routes exist, but no admin form to create/edit categories yet.
- **Reports** — only the dashboard sales chart for now.
- **Privacy / terms pages** — placeholder text; have them reviewed for your business.

---

## 🌍 Going live (deployment)

1. **Database:** create a MongoDB Atlas cluster, enable backups, restrict network access, copy the connection string.
2. **API:** deploy to a VPS / Render / Railway with Node 20+. Set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`,
   `CLIENT_ORIGIN=https://yourdomain.com` and payment keys. Start command: `npm start -w server`.
3. **Website:** `npm run build` → deploy `client/dist` to Netlify / Vercel / Cloudflare Pages with SPA fallback.
   Best: serve the API on the same domain (e.g. `/api` reverse proxy) so cookies keep working. Otherwise set
   `VITE_API_URL` and change the cookie `sameSite` to `'none'` (HTTPS required).
4. Add a custom domain + HTTPS and error monitoring (e.g. Sentry). Never commit `.env`.
5. Switch payments from sandbox to live only after testing with small real transactions.

> ⚠️ **Not production-ready until** payments are integrated and tested, legal pages are final,
> the admin password is changed, and the live setup has had a security review.
