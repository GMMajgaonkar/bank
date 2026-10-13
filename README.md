# Geocrete Arch Group - Construction Site Admin Dashboard

A responsive, production-ready Full-Stack Construction Site Admin Dashboard built with React.js (Vite), Node.js, Express.js, Tailwind CSS, and MongoDB with Mongoose.

---

## 🏗 Architecture & Features Overview

### 1. Dashboard Overview (`/`)
- **Bank Accounts Summary**: 4 active account cards showing account identifier (`ACCOUNT #01` to `#04`), bank name, code badge (`B1`, `B2`, `B3`, `B4`), balance, and credit loaded from MongoDB.
- **Daily Expense Entry Form**:
  - Live calculations: **Expense Amount = Quantity × Rate Per Unit**.
  - Dynamic dropdown for construction sites fetched from MongoDB.
  - Inputs for Date, Supplier, Material, Quantity, Unit, Rate per unit, Payment Method, Remark.
  - Validations for positive quantity and rates, prevents empty submissions.
  - Loading indicators, success & error alerts, form resets only on successful creation.
- **Recent Expense Entries Table**:
  - Real-time updates immediately upon adding a new expense.
  - Shows Date, Description, Site, Category, Amount, Paid, Pending.
  - Site dropdown filter and date reference.
- **Site Overview Cards**:
  - Displays project health, Site Owner / Client Name, Total Budget, Total Spent, Remaining Budget.
  - Color-coded progress indicators and budget threshold alerts.
  - **View Site →** action links directly to the selected Site Details page.

### 2. Sites Listing Page (`/sites`)
- **Summary Statistics**:
  - Total Sites
  - Sites In Progress (% of all projects)
  - Completed
  - On Hold
- **Search & Filtering**:
  - Search by site name, location, or client name.
  - Filter by project status (`All Status`, `In Progress`, `Completed`, `On Hold`).
  - Sort by `Newest First`, `Oldest First`, `Budget: High to Low`, `Budget: Low to High`.
- **All Sites Table**:
  - Displays Date, Site Name, Client Name (Particular's), Project Budget, Total Spent, Remaining Budget, Status Badge.
  - Interactive table with row navigation to `/sites/:id`.
  - Pagination controls (rows per page: 5, 10, 25, 50, page navigation).
- **Full Site CRUD Operations**:
  - **Create Site**: Modal dialog with input validation.
  - **Read Site**: Dynamic fetch and display.
  - **Update Site**: Prefilled edit modal.
  - **Delete Site**: Safe deletion with confirmation modal and cascade expense cleanup.

### 3. Site Details Page (`/sites/:id`)
- **Budget Summary (5 Key Metrics)**:
  - Project Budget (Total contract value in Cr / L)
  - Total Spent (% utilized)
  - Remaining Budget (Available to spend: **Budget − Total Spent**)
  - Client Received (% collected)
  - Balance Receivable
- **Tabs Navigation**:
  - **Overview**: Expense breakdown by category with animated progress bars + Recent Site Transactions list.
  - **Expenses**: Full tabular list of all expenses recorded for this specific site.
  - **Materials**: Filtered materials breakdown.
  - **Labour**: Filtered labour breakdown.
  - **Client Payments**: Contract remittance status.
  - **Suppliers**: Supplier logs.
- **Site Actions**:
  - **← Back to all sites** navigation.
  - **+ Add Expenses** button pre-linked to the current site.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM, Axios, Lucide React
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, Dotenv, Cors, Morgan
- **Database**: MongoDB (Local or MongoDB Atlas)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017` (or MongoDB Atlas URI)

### 1. Backend Setup
```bash
cd backend
npm install
```

Configure `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/construction_admin
NODE_ENV=development
```

Seed the initial database:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
# or: npm start
```
*Backend runs on `http://localhost:5000`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 📡 REST API Documentation

### Sites API
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/sites` | Get all sites (supports `search`, `status`, `sort`) |
| `GET` | `/api/sites/:id` | Get site by ID with aggregated financial metrics |
| `POST` | `/api/sites` | Create a new site |
| `PUT` | `/api/sites/:id` | Update an existing site |
| `DELETE` | `/api/sites/:id` | Delete site and associated expenses |

### Expenses API
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/expenses` | Get expenses (optional `siteId`, `category`, `limit`) |
| `GET` | `/api/expenses/:id` | Get expense by ID |
| `POST` | `/api/expenses` | Record an expense (`Amount = Qty × Rate`) |
| `PUT` | `/api/expenses/:id` | Update an expense |
| `DELETE` | `/api/expenses/:id` | Delete an expense and recalculate metrics |

### Dashboard API
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Get dashboard summary cards & site health |
| `GET` | `/api/dashboard/bank-accounts`| Get bank accounts list |
| `GET` | `/api/dashboard/recent-expenses` | Get recent expenses with site info |

---

## 🧪 Verification & Testing

An automated verification test script is included in the root directory:
```bash
node verify_system.js
```
Runs 12 automated integration tests verifying backend health, all CRUD operations, mathematical formulas, and Vite frontend status.
