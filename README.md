# 🚀 NExtclass — AI-Powered Attendance Intelligence, Academic Planning & Campus Space Intelligence

> **"NExtclass helps students understand what they must attend, what they can safely skip, how they can recover their attendance, and where they can use their free time on campus."**

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016%20%7C%20React%2019-7C5CFF?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/3D%20Engine-Three.js%20WebGL-FFD81A?style=for-the-badge&logo=three.js&logoColor=black)](https://threejs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-Python%20FastAPI-35D07F?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%20%7C%20Python-38BDF8?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Timetables](https://img.shields.io/badge/Official%20PDFs-10%20Files%20%E2%86%92%2013%20Sections-F5B942?style=for-the-badge)](#-official-timetable-inventory-10-pdfs--13-sections)
[![Math Verification](https://img.shields.io/badge/Math%20Engine-100%25%20Verified%20Rational-35D07F?style=for-the-badge)](#-deterministic-attendance-mathematics)

---

## 🔑 Demo Access Credentials (All 13 Official Sections)

NExtclass features synthetic demo authentication for all 13 official academic timetable configurations. 

You can either:
1. **1-Click Launch**: Choose any section from the interactive demo persona selector on the login screen.
2. **Direct Sign-In**: Use any of the credentials below with the default password: **`academic2026`**.

| # | Student Name | Student ID / Username | Email | Section | Department | Scenario |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Sarvesh Kumar** *(Primary Demo)* | `RA2311004010042` | `sarvesh@srmist.edu.in` | **II ECE-DS A** | ECE-DS (IV Sem) | ⚠️ Borderline (DLD 72.5% critical) |
| **2** | **Ananya Sharma** | `RA2311004010088` | `ananya.s@srmist.edu.in` | **II ECE-DS B** | ECE-DS (IV Sem) | 🟢 Safe (88.4% with 8 safe skips) |
| **3** | **Rohan Mukherjee** | `RA2411004010012` | `rohan.m@srmist.edu.in` | **I ECE-A** | ECE (II Sem) | 🟢 Safe (86.2% foundation) |
| **4** | **Pooja Varma** | `RA2411004010055` | `pooja.v@srmist.edu.in` | **I ECE-B & EEE** | ECE / EEE (II Sem) | ⚠️ Borderline (76.0% buffer) |
| **5** | **Aditya Nair** | `RA2411004010102` | `aditya.n@srmist.edu.in` | **I ECE-DS** | ECE-DS (II Sem) | 🏆 High Honors (91.5% record) |
| **6** | **Divya Krishnan** | `RA2411004010150` | `divya.k@srmist.edu.in` | **I Biotech-B & BME** | Biotech / BME (II Sem) | 🟢 Safe (83.0% average) |
| **7** | **Karthik Reddy** | `RA2311004010201` | `karthik.r@srmist.edu.in` | **II BME** | Biomedical (IV Sem) | 🔴 Critical (Med Devices 69.0%) |
| **8** | **Meera Sundaram** | `RA2211004010034` | `meera.s@srmist.edu.in` | **III BME** | Biomedical (VI Sem) | 🟢 Safe (85.5% aggregate) |
| **9** | **Vikram Sengupta** | `RA2211004010076` | `vikram.s@srmist.edu.in` | **III ECE-A** | ECE (VI Sem) | ⚠️ Borderline (VLSI Design 77%) |
| **10** | **Sneha Iyer** | `RA2211004010118` | `sneha.i@srmist.edu.in` | **III ECE-B** | ECE (VI Sem) | 🟢 Safe (87.0% aggregate) |
| **11** | **Abhinav Patel** | `RA2211004010165` | `abhinav.p@srmist.edu.in` | **III ECE-DS** | ECE-DS (VI Sem) | 🏆 High Honors (92.0% placement) |
| **12** | **Tanvi Deshmukh** | `RA2111004010022` | `tanvi.d@srmist.edu.in` | **IV ECE-A** | ECE (VIII Sem) | 🟢 Safe (Capstone / Internship) |
| **13** | **Arjun Srinivasan** | `RA2111004010091` | `arjun.s@srmist.edu.in` | **IV ECE-B** | ECE (VIII Sem) | 🟢 Safe (84.8% final semester) |

> **Default Password for All Accounts**: `academic2026`

---

## 🎨 Dual Theme System (Skyflow × Linear Aesthetic)

NExtclass features a complete dual-theme design system with instant switching and `localStorage` persistence:

### 1. Default Light Theme — Warm Ivory & Signature Gold
- **Canvas Background**: Warm Ivory (`#F7F4E8`)
- **Sidebar**: Soft Off-White (`#FAFAFC`)
- **Cards**: Warm White (`#FFFDF8`) with subtle borders (`#E8E3D7`) and 24px–28px rounded geometry
- **Text**: Bold Black (`#171717`) and Secondary Slate (`#7A7A7A`)
- **Primary Visual Accent**: Signature Gold (`#FFD81A`) for primary metric hero card, active indicators, and high-priority progress

### 2. Night Theme — Deep Academic Intelligence
- **Canvas Background**: Deep Navy (`#080B14`)
- **Sidebar & Surface**: Dark Navy (`#0F1422`)
- **Elevated Surfaces**: Deep Slate (`#151B2B`) with border `#252D42`
- **Text**: Warm White (`#F5F3EA`)
- **Brand Accents**: Electric Violet (`#7C5CFF`) & Gold (`#FFD81A`)

### Semantic State Colors Across All Views:
- 🟢 **SAFE**: `#45B36B` / `#35D07F` (attendance at/above target with safe buffer)
- 🟠 **CAUTION / WATCH**: `#FF8A3D` / `#F5B942` (near target or low safe skips remaining)
- 🔴 **CRITICAL**: `#E74C3C` / `#FF5C68` (below threshold, recovery mandatory)
- 🟣 **AI INTELLIGENCE**: `#7A3DF0` / `#A78BFA` (Attendance Advisor, AI Room Finder)
- 🔵 **INFORMATIONAL / OD / MEDICAL**: `#4C6EF5` / `#38BDF8` (Official Duty and Medical Leave simulation)

---

## 🏢 Phase 2: Interactive 3D Campus Explorer (`Campus3DView`)

Built using **Three.js WebGL**, the 3D Campus Explorer visualizes the SRM IST academic building in real-time 3D perspective:

1. **Multi-Floor Building Geometry**: Rendered with floor slabs, double-loaded corridors, and room blocks (Ground Floor to 6th Floor).
2. **Real-Time Room States**:
   - 🟢 `AVAILABLE` (Green)
   - 🟠 `EXPIRING` (Orange)
   - 🔴 `OCCUPIED` (Red)
3. **Interactive Orbit Controls**: Rotate, zoom, pan, and isolate specific floors (All Floors vs. F0, F1, F2, F3, F4, F5, F6).
4. **Live Timestamp Countdown**: Dynamic `HH:MM:SS` timer computed from `nextScheduledClassStartTimestamp - currentTimestamp` that ticks down second-by-second.
5. **Session-Level Room Claim**: Click **[ Claim for My Session ]** to claim space with a live status indicator and **[ Release Room ]** action.
6. **Call the Squad (WhatsApp Dynamic Link)**: Generates pre-filled WhatsApp invitations with room number, floor, and available window:
   > *"📍 Heading to IST 509 — Floor 5. It's free until 2:30 PM (00:41:28 left). Come fast!"*
7. **Grid $\leftrightarrow$ 3D Synchronization**: Shared `selectedRoomNumber` state connects Floor Grid and 3D Map seamlessly.
8. **Free Time Detector**: Identifies gaps between timetable periods (*"Free Window Detected: 1h 42m Free"*) with one-click **[ Find a Room ]** pre-population.

---

## 📚 Official Timetable Inventory (10 PDFs → 13 Sections)

The platform deterministically ingests all **10 official timetable PDF files** from SRM Institute of Science and Technology:

1. **`I ECE-A`** — *I year Time Table SEEE.pdf (Page 0)*
2. **`I ECE-B & EEE`** — *I year Time Table SEEE.pdf (Page 1)*
3. **`I ECE-DS`** — *I year Time Table SEEE.pdf (Page 2)*
4. **`I Biotech-B & Biomedical Engineering`** — *I year Time Table SEEE.pdf (Page 3)*
5. **`II BME`** — *II BME.pdf*
6. **`II ECE-DS A`** — *II ECE DS A.pdf*
7. **`II ECE-DS B`** — *II ECE DS B.pdf*
8. **`III BME`** — *III BME.pdf*
9. **`III ECE-A`** — *III ECE A.pdf*
10. **`III ECE-B`** — *III ECE B.pdf*
11. **`III ECE-DS`** — *III ECE DS.pdf*
12. **`IV ECE-A`** — *IV ECE A.pdf*
13. **`IV ECE-B`** — *IV ECE B.pdf*

---

## 🧮 Deterministic Attendance Mathematics

Let:
- $A$ = Number of classes attended
- $C$ = Number of classes conducted so far
- $R$ = Number of remaining scheduled classes in the semester
- $T$ = Attendance target threshold ($0.75$, $0.85$, $0.90$, or custom)

### 1. Current Attendance Percentage
$$P = \frac{A}{C} \times 100\%$$

### 2. Maximum Possible Attendance
$$P_{\text{max}} = \frac{A + R}{C + R} \times 100\%$$

### 3. Required Classes to Reach Target
$$x_{\text{required}} = \max\left(0, \left\lceil T \cdot (C + R) - A \right\rceil\right)$$
- If $x_{\text{required}} > R \implies$ **`IRREVERSIBLE DETENTION`** ($P_{\text{max}} < T$).

### 4. Safe Absence Budget
$$m_{\text{max}} = \max\left(0, \left\lfloor A + R - T \cdot (C + R) \right\rfloor\right)$$

---

## ⚡ Quickstart & How to Run

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/sarveshhhh2007-svg/MSD.git
cd MSD

# Install Python dependencies
pip install fastapi uvicorn sqlalchemy pydantic python-multipart requests

# Start the FastAPI server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup
```bash
# In a new terminal window
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev -- -p 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Run Math Test Suite
```bash
python -m unittest backend.tests.test_math_engine
```
All unit tests pass with `OK`.

---

## 👥 Hackathon Team & Project Info

- **Product Name**: NExtclass
- **Institution**: SRM Institute of Science and Technology
- **Repository**: [https://github.com/sarveshhhh2007-svg/MSD](https://github.com/sarveshhhh2007-svg/MSD)
