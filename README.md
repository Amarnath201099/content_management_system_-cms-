# 🚀 DevForge: Headless Content Management System (CMS) & Modular Page Builder

Welcome to the documentation guide. This document outlines the architecture, setup instructions, and technical specifications of the platform.

---

# 🏗️ What We Built

DevForge is an enterprise-grade **Headless Content Management System (CMS)** paired with a visual, no-code **Modular Page Builder**.

In a traditional monolithic CMS like WordPress, the database and the website templates are tightly coupled. This architecture decouples the two layers entirely.

---

## 🛠️ The Backend & CMS

Content editors use the visual **Admin Dashboard** to build dynamic web pages by stacking **7 standardized atomic blocks**:

- 📝 Rich Text
- 🖼️ Banners
- 📊 Spreadsheets
- ➗ Math Formulas
- 📢 Callouts
- 📂 File Downloads
- 🎯 CTA Buttons

These blocks are saved as structured JSON data in **MongoDB**.

---

## 🌐 The Frontend

The **Next.js** application acts as a clean, high-performance presentation layer.

Instead of creating physical `.js` files for every new webpage, the frontend dynamically fetches the JSON slice data from the API and renders it into a corporate website using a custom component library.

---

# 🔗 Live Demo & Quick Links

The live deployed environments are accessible via the following links:

- 🌍 **Public Frontend (Next.js on Vercel)**  
  → [Insert Vercel Link Here]

- ⚙️ **Admin Backend API (Express on Render)**  
  → [Insert Render API Link Here]

---

# 👤 Test Accounts (Sample Credentials)

The database seeding script automatically provisions two distinct **Role-Based Access Control (RBAC)** accounts for testing permission boundaries.

| 👥 Role             | 📧 Email Address  | 🔑 Password   | 🛡️ Permissions & Scope                                                                                                              |
| :------------------ | :---------------- | :------------ | :---------------------------------------------------------------------------------------------------------------------------------- |
| **🧑‍💼 System Admin** | `admin@test.com`  | `password123` | Full access: Create/delete pages, publish directly to live production, reorder navbar hierarchy, and provision new editor accounts. |
| **✍️ Lead Editor**  | `editor@test.com` | `password123` | Scoped access: Can only author and modify documents explicitly assigned by an Admin. Cannot publish directly to production.         |

> **💡 Tip:** Use these accounts to verify Role-Based Access Control (RBAC) functionality and permission boundaries during testing.

---

# 🛠️ Tech Stack & Why It Was Chosen

A modern **MERN-based** stack was selected to optimize rendering speeds, SEO performance, and long-term enterprise scalability.

---

## ⚛️ Frontend Framework (Next.js - Pages Router)

Provides fast client-side routing, built-in **Search Engine Optimization (SEO)**, and dynamic catch-all URL parameter handling.

---

## 🎨 Styling & UI (Tailwind CSS)

Utility-first styling keeps the design system consistent across complex modular slices without bloated CSS stylesheets.

---

## 🗂️ Global State (Redux Toolkit)

Manages the hierarchical navigation tree and authentication session state across the application with minimal boilerplate.

---

## ✨ Animations (Framer Motion)

Powers scroll-triggered entrance animations inside the **SectionRenderer** and smooth popover menus.

---

## ⚙️ Backend API (Node.js & Express)

A lightweight, stateless REST API architecture handling:

- 🔐 JWT authentication
- 🛡️ RBAC authorization
- ✅ Data validation

---

## 🍃 Database (MongoDB & Mongoose)

NoSQL document storage matches the requirements of a **Headless CMS**.

Mongoose flexible schemas allow varying JSON block structures (from complex spreadsheets to KaTeX math strings) to be stored inside a single unified **Content** collection.

---

## 🖥️ Global UI Context

A custom React Context provides:

- 🔔 Top-right floating toast stacks
- 🌙 Dark-mode confirmation modals

This completely eliminates native browser `alert()` and `confirm()` dialogs.

---

# 🏛️ Architecture Overview

Data flows from the MongoDB database to the end-user's screen according to the following architecture:

```text
+-------------------+       +-----------------------+       +--------------------------------+       +--------------------------+
|  MongoDB Database | <---> |  Express.js REST API  | <---> | Next.js [...slug] Catch-All    | <---> | Animated SectionRenderer |
|  (JSON Slices)    |       |  (JWT & RBAC Scoped)  |       | (Dynamic URL Resolution)       |       | (Framer Motion UI Slices)|
+-------------------+       +-----------------------+       +--------------------------------+       +--------------------------+
```

---

# 🛣️ Catch-All Routing (`[...slug].js`)

In a standard website, generating a URL like `/solutions/page-builder` requires creating a folder called `solutions` and placing a file named `page-builder.js` inside it. In this Headless CMS, users generate endless nested parent-child pages dynamically.

To support this without breaking the frontend, a **Next.js Catch-All Route** (`pages/[...slug].js`) is utilized. When a user visits any URL path that does not match a static file:

1. 📥 **Next.js** captures the full URL path as an array (e.g., `['solutions', 'page-builder']`) and joins it into a clean string (`solutions/page-builder`).

2. 🔄 The **Redux action** queries the backend:

   ```http
   GET /api/v1/content/solutions/page-builder
   ```

3. 🎨 If the page exists and is published, the **SectionRenderer** loops through the document's `sections` array and dynamically renders the corresponding Figma-compliant React components.

---

# 💻 Local Setup Instructions (Step-by-Step)

The full-stack suite is set up locally by following these steps.

---

## 📋 Prerequisites

The following tools must be installed:

- 🟢 **Node.js:** Version **18.0.0** or higher.
- 🍃 **MongoDB:** A locally running instance of MongoDB Server, or a free MongoDB Atlas cloud connection string.

---

# ⚙️ Backend Setup & Database Seeding

Open a terminal and navigate to the backend workspace:

```bash
cd backend
npm install
```

Create a new file named **`.env`** in the root of the `/backend` directory and paste this template:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/devforge_cms
JWT_SECRET=super_secret_development_jwt_key_998877
NODE_ENV=development
```

Next, populate the database with the commercial SaaS marketing website seed data:

```bash
node seed.js
```

> ✅ A success console message confirms that **3 published web pages** and **2 user accounts** were created.

Boot up the backend development server:

```bash
npm run dev
```

The REST API is now listening on:

```text
http://localhost:5000
```

> 💡 Leave this terminal tab running.

---

# 🌐 Frontend Setup

Open a new, separate terminal tab and navigate to the frontend workspace:

```bash
cd frontend
npm install
```

Create a new file named **`.env.local`** in the root of the `/frontend` directory and add the backend API routing environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Start the Next.js development server:

```bash
npm run dev
```

---

# 🚀 Explore the Local Application

Open a web browser and navigate to:

### 🌍 Public Landing Page

```text
http://localhost:3000/overview
```

_Modular slices render with smooth Framer Motion scroll effects._

---

### 🔐 CMS Mission Control (Admin Login)

```text
http://localhost:3000/admin/login
```

Log in using:

- 📧 **Email:** `admin@test.com`
- 🔑 **Password:** `password123`

---

# 🔑 Key Assumptions

During architectural design, several intentional, practical trade-offs were made to keep the user experience professional and performant.

---

## 🧭 Strict Navigation Capping

To prevent horizontal navbar overflow and UI breaking on smaller desktop screens, top-level navigation items are strictly capped at **5 visible links**.

Any additional top-level pages automatically group into a clickable **"Others ▾"** dropdown menu with intelligent collision detection.

---

## 🧹 Metadata Scrubbing

While the database tracks author names, creation timestamps, and editor assignment logs for internal auditing, the public catch-all route (`[...slug].js`) scrubs administrative metadata from the UI to maintain a clean, corporate web layout.

---

## 🔒 Unpublished Draft Isolation

Public visitors and unauthenticated API requests can strictly only retrieve documents where `isPublished: true`.

Draft documents remain entirely invisible to the public routing engine until an Administrator explicitly toggles them live.

---

# 🚀 Future Enhancements

Future iterations of the platform roadmap include the following features.

---

## 📈 Real-Time Analytics Integration

Upgrading the Mission Control welcome hub from simulated telemetry to real third-party marketing integrations (**Google Analytics 4 Data API** and **Meta Conversion Pixels**).

---

## 🖥️ Split-Screen Visual Preview

Adding a live, interactive preview toggle inside the `/admin/editor` workspace to display exact frontend component styling during editing.

---

## 🕒 Version History & Rollbacks

Implementing Mongoose document archiving to track historical slice snapshots, allowing editors to revert published pages to previous states with a single click.

---
