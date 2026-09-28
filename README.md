# 🚀 NExtclass — AI-Powered Attendance Intelligence, Recovery & Semester Planning System

> **"Your attendance isn't just a percentage. It's a planning problem."**

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016%20%7C%20React%2019-7C5CFF?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-Python%20FastAPI-35D07F?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%20%7C%20Python-38BDF8?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-080B14?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Timetables](https://img.shields.io/badge/Official%20PDFs-10%20Files%20%E2%86%92%2013%20Sections-F5B942?style=for-the-badge)](#-official-timetable-inventory-10-pdfs--13-sections)
[![Math Verification](https://img.shields.io/badge/Math%20Engine-100%25%20Verified%20Rational-35D07F?style=for-the-badge)](#-deterministic-attendance-mathematics)

---

## 📌 Overview

**NExtclass** is a production-grade, AI-powered academic attendance intelligence, recovery planning, and semester forecasting platform. Designed with a **Linear × Vercel × Modern Fintech Dashboard** visual identity, it rejects arbitrary "health scores" and static spreadsheets in favor of **exact rational arithmetic, multi-section timetable parsing from official institutional PDFs, OCR screenshot validation, calendar occurrence tracking, and deterministic decision engines**.

### Core Architecture Philosophy
1. **AI Understands**: Vision OCR and LLM intent parsing translate unstructured student questions and portal screenshots into structured data.
2. **Validation Verifies**: Academic boundaries, duplicate checks, time overlaps, and integrity rules strictly enforce data soundness.
3. **Deterministic Backend Calculates**: Exact rational mathematics computes safe absence budgets, required recovery classes, and detention thresholds. **The LLM never calculates percentages manually.**
4. **AI Explains**: Grounded in verified backend metrics, the Attendance Advisor generates personalized, actionable advice for students.

---

## 🎨 Visual Identity — Dark Academic Intelligence

NExtclass follows a focused semantic design system where color communicates state, never mere decoration.

| Purpose | Semantic Role | Hex Value | Usage |
| :--- | :--- | :--- | :--- |
| **App Background** | Base Canvas | `#080B14` | Deep navy application canvas |
| **Main Surface** | Primary Cards | `#0F1422` | Card and panel backgrounds |
| **Elevated Surface** | Interactive Blocks | `#151B2B` | Hover states, active dropdowns, headers |
| **Border** | Structural Division | `#252D42` | Crisp, low-contrast component borders |
| **Primary Brand** | Brand Accent | `#7C5CFF` | Primary actions, navigation selection, tabs |
| **Primary Hover** | Interactive Focus | `#9278FF` | Hover states on primary buttons |
| **Main Text** | High Contrast | `#F5F3EA` | Warm white headers, primary metrics |
| **Secondary Text** | Medium Contrast | `#A7AEC2` | Slate labels, subtext, descriptions |
| **Muted Text** | Low Contrast | `#70788F` | Timings, footnotes, inactive states |
| **Safe State** | Healthy Buffer | `#35D07F` | Current attendance $\ge$ target with safe buffer |
| **Caution State** | Watch Threshold | `#F5B942` | Attendance near target or low safe absence budget |
| **Critical State** | Recovery Needed | `#FF5C68` | Below target; immediate attendance mandatory |
| **OD / Medical** | Institutional Leave | `#38BDF8` | Cyan markers for official duty & medical leaves |
| **AI Advisor** | Cognitive Assistant | `#A78BFA` | Attendance Advisor chatbot indicators |

---

## 📚 Official Timetable Inventory (10 PDFs → 13 Sections)

The platform ingests and serves all **10 official timetable PDF files** from SRM Institute of Science and Technology. Because `I year Time Table SEEE.pdf` contains 4 separate section schedules across 4 pages, NExtclass resolves exactly **13 full-fledged, selectable section timetables**:

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

### Timetable Validation Metrics:
- **Sections Loaded**: `13`
- **Official Subjects Mapped**: `123`
- **Weekly Timetable Entries**: `367`
- **Laboratory / Practical Sessions**: `28`
- **Slot Mapping**: Every slot letter (`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `LAB`) is deterministically mapped to subject codes, credits (L-T-P-C), and faculty members.

---

## 🧮 Deterministic Attendance Mathematics

Let:
- $A$ = Number of classes attended
- $C$ = Number of classes conducted so far
- $R$ = Number of remaining scheduled classes in the semester
- $T$ = Attendance target threshold ($0.75$, $0.85$, $0.90$, or custom)
- $x$ = Future classes attended ($0 \le x \le R$)

### 1. Current Attendance Percentage
$$P = \frac{A}{C} \times 100\% \quad (C > 0)$$

### 2. Maximum Possible Attendance
$$P_{\text{max}} = \frac{A + R}{C + R} \times 100\%$$

### 3. Required Classes to Reach Target
$$x_{\text{required}} = \max\left(0, \left\lceil T \cdot (C + R) - A \right\rceil\right)$$
- If $x_{\text{required}} > R$, recovery to target $T$ is mathematically **impossible** $\implies$ **`IRREVERSIBLE`**.
- If $x_{\text{required}} \le R$, recovery is **possible** $\implies$ **`RECOVERABLE`**.

### 4. Safe Absence Budget
The maximum number of future classes a student can safely miss ($m_{\text{max}}$) without dropping below target $T$:
$$m_{\text{max}} = \max\left(0, \left\lfloor A + R - T \cdot (C + R) \right\rfloor\right)$$
*Decision values are never rounded upwards; exact floor/ceiling rational operations prevent false security.*

### 5. Deterministic Risk Classifications
- **`SAFE`**: $P \ge T$ and $m_{\text{max}} \ge 3$ (Comfortable absence buffer).
- **`WATCH`**: $P \ge T$ but $m_{\text{max}} \le 2$ (Approaching threshold; class attendance critical).
- **`CRITICAL`**: $P < T$ but $P_{\text{max}} \ge T$ (Deficit present, but recovery is achievable).
- **`IRREVERSIBLE`**: $P_{\text{max}} < T$ (Detention unavoidable under standard attendance rules).

---

## ✨ Key Features & Modules

### 1. Dynamic 5-Level Academic Timetable Selector
- Interactive cascading selectors for **Academic Year (`2026–27`)**, **Year (`I` to `IV`)**, **Department (`ECE`, `ECE-DS`, `BME`, `Biotech`, `EEE`)**, **Section**, and **Semester**.
- Dynamically queries available combinations directly from the ingested database.
- Complete weekly grid display with exact periods, tea breaks (10:40–10:50, 03:00–03:10), lunch hour (12:30–01:20), and Cyan-highlighted laboratory blocks.

### 2. Attendance Screenshot OCR & Validation
- Students can upload screenshots of their college attendance portals (or paste raw portal text).
- **Matching Pipeline**: Extracts subject rows, matches subject codes and fuzzy aliases against official section catalogs.
- **Validation Gates**: Flags impossible metrics ($A > C$, negative counts, unknown codes).
- **Confidence Scoring**: High ($\ge 90\%$), Medium ($70-89\%$), or Low ($< 70\%$).
- **Review Confirmation**: Preview table with side-by-side edits prior to database commit.

### 3. OD / Medical Leave Simulator
- **Non-Destructive Simulation**: Test multi-day leaves without mutating active attendance records.
- **Occurrence Resolution**: Maps dates to actual future timetable occurrences, identifying exactly which subjects and periods are affected.
- **Institutional Policy Support**:
  - `COUNTS_AS_ATTENDED`: Class credited as attended.
  - `EXCLUDED_FROM_DENOMINATOR`: Conducted count reduced; numerator unaffected.
  - `COUNTS_AS_ABSENT`: Conducted increments; attended does not.
  - `NOT_CONFIGURED`: Displays an explicit disclaimer when university policy has not yet been codified.

### 4. Semester Occurrence Calendar & Planner
- Expands recurring timetables across the academic semester calendar (accounting for holidays, weekends, and exam periods).
- Daily attendance logging (Present / Absent / OD / Medical) with instant metric recalculation.

### 5. Multi-Target Requirement Tracking
- Switch simultaneously between **75% Detention threshold**, **85% Scholarship eligibility**, and **90% Honors maintenance**.
- View remaining classes needed and safe absence budgets across all subjects in real time.

### 6. Priority Ranking Engine
- Scores subjects by attendance deficit, recovery ratio ($\frac{x_{\text{required}}}{R}$), and remaining margin.
- Surfaced as high-priority alert cards to guide daily student decision-making.

### 7. 🏢 Floor Grid (Campus Space Occupancy Engine)
- Deterministic campus room availability organized floor-by-floor (Ground Floor to 6th Floor).
- Evaluates real-time overlaps across all 13 official section timetables and scheduled class occurrences.
- Status classification: 🟢 **`AVAILABLE`** (Zero scheduled periods during requested interval) vs 🔴 **`OCCUPIED`** (Scheduled class active with subject, faculty, and section details).
- Real-time refresh with timestamp and room detail modals.

### 8. ✦ AI Room Finder (Natural-Language Space Discovery)
- Smart natural-language search bar with AI Violet (`#A78BFA`) accents.
- Strict constraint parsing: Date, Start Time, Duration/End Time, Floor, AC Requirement, Minimum Capacity, and Lab preference.
- **Full-Duration Availability**: Enforces that rooms must be free for the entire requested window (e.g. 2:00 PM – 4:00 PM).
- **Connected Interaction**: Clicking any verified result card immediately scrolls to and highlights that room in the Floor Grid.
- **Grounded Explanations & Fallbacks**: Never hallucinates room numbers; provides clear alternative suggestions if no exact matches exist.

### 9. ✦ Attendance Advisor (AI Assistant)
- Floating assistant modal backed by Gemini / LLM intent extraction.
- **Tool-Call Grounded**: Queries deterministic functions (`get_current_attendance`, `calculate_safe_absences`, `simulate_leave`, `get_subject_risk`).
- Answers questions like:
  - *"If I take a 3-day sick leave starting tomorrow, will Digital Logic fall below 75%?"*
  - *"How many DBMS classes can I miss?"*
  - *"Can I still recover Mathematics to 85%?"*

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Dark Academic Custom Palette)
- **Icons**: Lucide React
- **Visualizations**: Recharts
- **Fonts**: Geist Sans & Geist Mono

### Backend
- **Framework**: Python 3.12 + FastAPI
- **Data Validation**: Pydantic v2
- **ORM & Database**: SQLAlchemy + SQLite (PostgreSQL compatible)
- **Server**: Uvicorn ASGI

---

## 📂 Repository Structure

```text
Vibecraft/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── advisor.py            # AI Attendance Advisor tool dispatcher & parser
│   │   ├── database.py           # Relational schema & 13-section database seed
│   │   ├── main.py               # FastAPI REST endpoints (Sections, Subjects, OCR, Sim)
│   │   ├── math_engine.py        # Deterministic rational mathematics engine
│   │   ├── models.py             # SQLAlchemy ORM models
│   │   ├── ocr_engine.py         # Screenshot OCR parser & fuzzy subject matcher
│   │   ├── schemas.py            # Pydantic validation schemas
│   │   ├── simulator.py          # OD & Medical Leave simulation engine
│   │   └── timetable_parser.py   # Calendar occurrence generator & validator
│   ├── tests/
│   │   └── test_math_engine.py   # Automated unit tests for Section 44 math specs
│   └── attendance.db             # Ingested SQLite database
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css       # Color tokens & dark theme utilities
│   │   │   ├── layout.tsx        # Root HTML layout & font configuration
│   │   │   └── page.tsx          # Master application router & state orchestrator
│   │   ├── components/
│   │   │   ├── AdvisorChatModal.tsx      # Attendance Advisor AI drawer
│   │   │   ├── AnalyticsView.tsx         # Recharts visual analytics
│   │   │   ├── AttendanceImportView.tsx  # Screenshot OCR upload & confirmation
│   │   │   ├── DashboardView.tsx         # Overview cards, priorities, reminders
│   │   │   ├── Header.tsx                # Top navigation & target toggles
│   │   │   ├── PlannerView.tsx           # Semester occurrence calendar
│   │   │   ├── RequirementsView.tsx      # Multi-target compliance manager
│   │   │   ├── Sidebar.tsx               # Left desktop navigation
│   │   │   ├── SimulatorView.tsx         # OD / Medical leave simulator
│   │   │   └── TimetableView.tsx         # 5-level selector & PDF timetable grid
│   │   └── lib/
│   │       └── api.ts            # Typed API client for FastAPI backend
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
├── I year Time Table SEEE.pdf    # Official Multi-Page Timetable (4 sections)
├── II BME.pdf                    # Official Timetable PDF
├── II ECE DS A.pdf               # Official Timetable PDF
├── II ECE DS B.pdf               # Official Timetable PDF
├── III BME.pdf                   # Official Timetable PDF
├── III ECE A.pdf                 # Official Timetable PDF
├── III ECE B.pdf                 # Official Timetable PDF
├── III ECE DS.pdf                # Official Timetable PDF
├── IV ECE A.pdf                  # Official Timetable PDF
├── IV ECE B.pdf                  # Official Timetable PDF
├── .gitignore
└── README.md
```

---

## ⚡ Quickstart & Installation

### 1. Prerequisites
- **Python**: 3.10+ installed
- **Node.js**: 18.0+ and npm installed
- **Git**

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/sarveshhhh2007-svg/MSD.git
cd MSD

# Install Python dependencies
pip install fastapi uvicorn sqlalchemy pydantic python-multipart requests

# Start the FastAPI server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
*The database automatically initializes and populates all 13 official sections, 123 subjects, and 367 timetable entries on startup.*

### 3. Frontend Setup
```bash
# In a new terminal window
cd frontend

# Install Node dependencies
npm install

# Start the Next.js development server
npm run dev -- -p 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Running Math Verification Tests
Run the deterministic rational math test suite:
```bash
python -m unittest backend.tests.test_math_engine
```
Output:
```text
Ran 7 tests in 0.001s
OK
```

---

## 🧪 Math Engine Edge-Case Verification Matrix

All test cases specified in the project engineering standard have been verified against the deterministic backend:

| Case | Attended ($A$) | Conducted ($C$) | Remaining ($R$) | Target ($T$) | Required ($x$) | Safe Misses ($m_{\text{max}}$) | Max Possible ($P_{\text{max}}$) | Status |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | 80 | 100 | 20 | 75% | **0** | **10** | 83.33% | `SAFE` |
| **2** | 70 | 100 | 30 | 75% | **28** | **2** | 76.92% | `WATCH` |
| **3** | 60 | 100 | 20 | 75% | **30 (Impossible)** | **0** | 66.67% | `IRREVERSIBLE` |
| **4** | 70 | 100 | 20 | 75% | **20** | **0** | 75.00% | `CRITICAL` |
| **5** | 80 | 100 | 20 | 90% | **28 (Impossible)** | **0** | 83.33% | `IRREVERSIBLE` |

---

## 👥 Hackathon Team & Credits

- **Product Name**: NExtclass
- **Institution**: SRM Institute of Science and Technology, Tiruchirappalli
- **Repository**: [https://github.com/sarveshhhh2007-svg/MSD](https://github.com/sarveshhhh2007-svg/MSD)
