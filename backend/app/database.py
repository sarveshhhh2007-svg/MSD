"""
Database Configuration and Complete 13-Timetable Ground-Truth Dataset for NExtclass
Extracted from official PDF files in the repository:
1. I year Time Table SEEE.pdf (Page 0: I ECE-A, Page 1: I ECE-B & EEE, Page 2: I ECE-DS, Page 3: I Biotech-B & Biomedical)
2. II BME.pdf (II BME)
3. II ECE DS A.pdf (II ECE-DS A)
4. II ECE DS B.pdf (II ECE-DS B)
5. III BME.pdf (III BME)
6. III ECE A.pdf (III ECE-A)
7. III ECE B.pdf (III ECE-B)
8. III ECE DS.pdf (III ECE-DS)
9. IV ECE A.pdf (IV ECE-A)
10. IV ECE B.pdf (IV ECE-B)
"""

import os
from datetime import date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from backend.app.models import (
    Base, AcademicTerm, Section, Subject, TimetableEntry,
    ClassOccurrence, AttendanceRecord, AttendanceSnapshot,
    Requirement, InstitutionalPolicy, LeaveRecord
)

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "attendance.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if already seeded with all 13 sections
        if db.query(Section).count() < 13:
            # Recreate cleanly to ensure all 13 official timetables are seeded
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)
            seed_all_13_timetables(db)
    finally:
        db.close()


def seed_all_13_timetables(db: Session):
    print("Seeding NExtclass with all 13 official timetables from repository PDFs...")

    # 1. Academic Term
    term = AcademicTerm(
        academic_year="2026-2027",
        semester="Odd Semester (2026-2027)",
        start_date=date(2026, 7, 15),
        end_date=date(2026, 11, 30),
        status="ACTIVE"
    )
    db.add(term)
    db.flush()

    # 2. Institutional Policy
    policy = InstitutionalPolicy(
        name="SRM IST Academic Regulations 2026",
        od_policy="COUNTS_AS_ATTENDED",
        medical_policy="EXCLUDED_FROM_DENOMINATOR",
        default_target=0.75,
        is_configured=True
    )
    db.add(policy)

    # 3. Create all 13 Sections with exact names from PDFs
    sections_defs = [
        # I YEAR (from 'I year Time Table SEEE.pdf')
        {
            "key": "I_ECE_A",
            "name": "I ECE-A",
            "department": "ECE",
            "year": "I Year",
            "semester": "I Semester",
            "academic_year": "2026-2027",
            "venue": "IST 602 / IST 710",
        },
        {
            "key": "I_ECE_B_EEE",
            "name": "I ECE-B & EEE",
            "department": "ECE / EEE",
            "year": "I Year",
            "semester": "I Semester",
            "academic_year": "2026-2027",
            "venue": "IST 602 / IST 710",
        },
        {
            "key": "I_ECE_DS",
            "name": "I ECE-DS",
            "department": "ECE-DS",
            "year": "I Year",
            "semester": "I Semester",
            "academic_year": "2026-2027",
            "venue": "IST 710 / IST 502",
        },
        {
            "key": "I_BIOTECH_B_BME",
            "name": "I Biotech-B & Biomedical Engineering",
            "department": "Biotech / Biomedical",
            "year": "I Year",
            "semester": "I Semester",
            "academic_year": "2026-2027",
            "venue": "IST 520 / IST 702",
        },
        # II YEAR
        {
            "key": "II_BME",
            "name": "II BME",
            "department": "BME",
            "year": "II Year",
            "semester": "III Semester",
            "academic_year": "2026-2027",
            "venue": "IST 602 / FN",
        },
        {
            "key": "II_ECE_DS_A",
            "name": "II ECE-DS A",
            "department": "ECE-DS",
            "year": "II Year",
            "semester": "III Semester",
            "academic_year": "2026-2027",
            "venue": "IST 416 / FN",
        },
        {
            "key": "II_ECE_DS_B",
            "name": "II ECE-DS B",
            "department": "ECE-DS",
            "year": "II Year",
            "semester": "III Semester",
            "academic_year": "2026-2027",
            "venue": "IST 411 / AN",
        },
        # III YEAR
        {
            "key": "III_BME",
            "name": "III BME",
            "department": "BME",
            "year": "III Year",
            "semester": "V Semester",
            "academic_year": "2026-2027",
            "venue": "IST 211 / AN",
        },
        {
            "key": "III_ECE_A",
            "name": "III ECE-A",
            "department": "ECE",
            "year": "III Year",
            "semester": "V Semester",
            "academic_year": "2026-2027",
            "venue": "IST 518 / FN",
        },
        {
            "key": "III_ECE_B",
            "name": "III ECE-B",
            "department": "ECE",
            "year": "III Year",
            "semester": "V Semester",
            "academic_year": "2026-2027",
            "venue": "IST 518 / AN",
        },
        {
            "key": "III_ECE_DS",
            "name": "III ECE-DS",
            "department": "ECE-DS",
            "year": "III Year",
            "semester": "V Semester",
            "academic_year": "2026-2027",
            "venue": "IST 519 / FN",
        },
        # IV YEAR
        {
            "key": "IV_ECE_A",
            "name": "IV ECE-A",
            "department": "ECE",
            "year": "IV Year",
            "semester": "VII Semester",
            "academic_year": "2026-2027",
            "venue": "IST 225",
        },
        {
            "key": "IV_ECE_B",
            "name": "IV ECE-B",
            "department": "ECE",
            "year": "IV Year",
            "semester": "VII Semester",
            "academic_year": "2026-2027",
            "venue": "IST 227",
        },
    ]

    section_map = {}
    for s_def in sections_defs:
        sec = Section(
            name=s_def["name"],
            department=s_def["department"],
            year=s_def["year"],
            semester=s_def["semester"],
            academic_year=s_def["academic_year"],
            venue=s_def["venue"],
            active=True,
            academic_term_id=term.id
        )
        db.add(sec)
        db.flush()
        section_map[s_def["key"]] = sec

    # Helper period schedule
    period_timings = {
        1: ("09:00", "09:50"),
        2: ("09:50", "10:40"),
        3: ("10:50", "11:40"),
        4: ("11:40", "12:30"),
        6: ("13:20", "14:10"),
        7: ("14:10", "15:00"),
        8: ("15:10", "16:00"),
        9: ("16:00", "16:50"),
    }

    # 4. SUBJECTS & SCHEDULE DATA PER TIMETABLE (Direct from Source PDFs)
    timetables_data = {
        # =========================================================================
        # 1. I ECE-A (I year Time Table SEEE.pdf Page 0)
        # =========================================================================
        "I_ECE_A": {
            "subjects": [
                ("21MAB102T", "Advanced Calculus and Complex Analysis", "3-1-0-4", "A", "PERIOD", 4, "Dr. R. Ragul", "AP / Maths", 38, 42, 20),
                ("21CYB101J", "Chemistry", "3-1-2-5", "B", "PERIOD", 6, "Dr. P. Pachamuthu", "AP / Che", 36, 40, 20),
                ("21BTB102J", "Electronic System and PCB Design", "2-0-0-2", "C", "PERIOD", 2, "Dr. U. Shajith Ali", "Asso.Prof / EEE", 18, 20, 10),
                ("21CSS101J", "Programming for Problem Solving", "3-0-2-4", "D", "PERIOD", 5, "Dr. A. Rama Prasath", "Asso.Prof / CA", 32, 40, 20),
                ("21GNH101J", "Philosophy of Engineering", "1-0-2-2", "E", "PERIOD", 3, "Dr. R. Aarthi", "AP / Phy", 24, 28, 14),
                ("21BTB103T", "Biology", "2-0-0-2", "F", "PERIOD", 2, "Dr. M. Jaya Priya", "AP / Biotech", 16, 18, 10),
                ("21LEH104T", "German", "2-1-0-3", "GER", "PERIOD", 3, "Mr. Selva", "German", 25, 28, 12),
                ("21MES101L", "Basic Civil and Mechanical Workshop", "0-0-4-2", "LAB", "SESSION", 4, "Dr. N.S. Balaji / Dr. M. Kumaran", "Asst.Prof / Mech", 18, 20, 10),
                ("21PDM102L", "General Aptitude", "0-0-2-0", "CDC", "PERIOD", 2, "Mr. Sivanandhan", "CDC", 18, 20, 8),
                ("21GNM102L", "NSS", "0-0-2-0", "NSS", "PERIOD", 2, "Dr. R. Manickam", "Physical Director", 16, 18, 8),
            ],
            "grid": [
                ("Monday", 1, "21GNH101J", "E", "IST602"),
                ("Monday", 2, "21GNH101J", "E", "IST602"),
                ("Monday", 3, "21CYB101J", "B", "IST602"),
                ("Monday", 4, "21MAB102T", "A", "IST602"),
                ("Monday", 6, "21CYB101J", "LAB", "Che Lab"),
                ("Monday", 7, "21CYB101J", "LAB", "Che Lab"),
                ("Monday", 8, "21BTB103T", "F", "IST710"),
                ("Monday", 9, "21PDM102L", "CDC", "IST710"),
                ("Tuesday", 1, "21BTB102J", "C", "IST602"),
                ("Tuesday", 2, "21CYB101J", "B", "IST602"),
                ("Tuesday", 3, "21MAB102T", "A", "IST602"),
                ("Tuesday", 4, "21CSS101J", "D", "IST602"),
                ("Tuesday", 6, "21MES101L", "LAB", "Workshop"),
                ("Tuesday", 7, "21MES101L", "LAB", "Workshop"),
                ("Wednesday", 1, "21CYB101J", "B", "IST602"),
                ("Wednesday", 2, "21GNH101J", "E", "IST602"),
                ("Wednesday", 3, "21CSS101J", "D", "IST602"),
                ("Wednesday", 6, "21CSS101J", "LAB", "PPS Lab"),
                ("Wednesday", 7, "21CSS101J", "LAB", "PPS Lab"),
                ("Wednesday", 8, "21BTB102J", "LAB", "PCB Lab"),
                ("Wednesday", 9, "21BTB102J", "LAB", "PCB Lab"),
                ("Thursday", 1, "21LEH104T", "GER", "IST602"),
                ("Thursday", 2, "21LEH104T", "GER", "IST602"),
                ("Thursday", 4, "21MAB102T", "A", "IST602"),
                ("Thursday", 6, "21PDM102L", "CDC", "IST510"),
                ("Thursday", 7, "21PDM102L", "CDC", "IST510"),
                ("Thursday", 8, "21GNM102L", "NSS", "IST201"),
                ("Thursday", 9, "21GNM102L", "NSS", "IST201"),
                ("Friday", 1, "21CSS101J", "D", "IST602"),
                ("Friday", 2, "21MAB102T", "A", "IST602"),
                ("Friday", 3, "21BTB102J", "C", "IST602"),
                ("Friday", 4, "21CYB101J", "B", "IST602"),
                ("Friday", 6, "21BTB103T", "F", "IST602"),
                ("Friday", 8, "21LEH104T", "GER", "IST626"),
            ]
        },

        # =========================================================================
        # 2. I ECE-B & EEE (I year Time Table SEEE.pdf Page 1)
        # =========================================================================
        "I_ECE_B_EEE": {
            "subjects": [
                ("21MAB102T", "Advanced Calculus and Complex Analysis", "3-1-0-4", "A", "PERIOD", 4, "Dr. M. Deepa", "AP / Maths", 37, 42, 20),
                ("21CYB101J", "Chemistry", "3-1-2-5", "B", "PERIOD", 6, "Dr. N. Prabhu", "AP / Che", 35, 40, 20),
                ("21BTB102J", "Electronic System and PCB Design (ECE)", "2-0-0-2", "F", "PERIOD", 2, "Dr. U. Shajith Ali", "Asso.Prof / EEE", 18, 20, 10),
                ("21CSS101J", "Programming for Problem Solving", "3-0-2-4", "D", "PERIOD", 5, "Dr. A. Rama Prasath", "Asso.Prof / CA", 34, 40, 20),
                ("21GNH101J", "Philosophy of Engineering", "1-0-2-2", "E", "PERIOD", 3, "Dr. R. Aarthi", "AP / Phy", 25, 28, 14),
                ("21BTB103T", "Biology", "2-0-0-2", "C", "PERIOD", 2, "Dr. M. Jaya Priya", "AP / Biotech", 17, 18, 10),
                ("21EEC101J", "Electrical Circuits (EEE)", "2-0-0-2", "G", "PERIOD", 2, "Dr. Dheepanchakkravarthy", "Asso.Prof / EEE", 17, 18, 10),
                ("21LEH104T", "German", "2-1-0-3", "GER", "PERIOD", 3, "Mr. Selva", "German", 25, 28, 12),
                ("21MES101L", "Basic Civil and Mechanical Workshop", "0-0-4-2", "LAB", "SESSION", 4, "Dr. Modasir MD Khan / Mr. M. Karthikeyan", "AP / Mech", 18, 20, 10),
                ("21PDM102L", "General Aptitude", "0-0-2-0", "CDC", "PERIOD", 2, "Mrs. Thenmozhi", "CDC", 18, 20, 8),
                ("21GNM102L", "NSS", "0-0-2-0", "NSS", "PERIOD", 2, "Dr. R. Manickam", "Physical Director", 16, 18, 8),
            ],
            "grid": [
                ("Monday", 1, "21PDM102L", "CDC", "IST609"),
                ("Monday", 2, "21BTB102J", "F", "IST710"),
                ("Monday", 3, "21CYB101J", "LAB", "Che Lab"),
                ("Monday", 4, "21CYB101J", "LAB", "Che Lab"),
                ("Monday", 6, "21GNH101J", "E", "IST602"),
                ("Monday", 7, "21GNH101J", "E", "IST602"),
                ("Monday", 8, "21CYB101J", "B", "IST602"),
                ("Monday", 9, "21MAB102T", "A", "IST602"),
                ("Tuesday", 2, "21MES101L", "LAB", "Workshop"),
                ("Tuesday", 3, "21MES101L", "LAB", "Workshop"),
                ("Tuesday", 6, "21BTB103T", "C", "IST602"),
                ("Tuesday", 7, "21CYB101J", "B", "IST602"),
                ("Tuesday", 8, "21MAB102T", "A", "IST602"),
                ("Tuesday", 9, "21CSS101J", "D", "IST602"),
                ("Wednesday", 1, "21BTB102J", "F", "IST710"),
                ("Wednesday", 2, "21CSS101J", "LAB", "PPS Lab"),
                ("Wednesday", 3, "21PDM102L", "CDC", "IST510"),
                ("Wednesday", 4, "21PDM102L", "CDC", "IST510"),
                ("Wednesday", 6, "21CSS101J", "LAB", "PPS Lab"),
                ("Wednesday", 7, "21CYB101J", "B", "IST602"),
                ("Wednesday", 8, "21GNH101J", "E", "IST602"),
                ("Wednesday", 9, "21CSS101J", "D", "IST602"),
                ("Thursday", 1, "21GNM102L", "NSS", "IST201"),
                ("Thursday", 2, "21GNM102L", "NSS", "IST201"),
                ("Thursday", 3, "21BTB103T", "C", "IST626"),
                ("Thursday", 4, "21MAB102T", "A", "IST710"),
                ("Thursday", 6, "21CSS101J", "D", "IST602"),
                ("Thursday", 8, "21LEH104T", "GER", "IST602"),
                ("Thursday", 9, "21LEH104T", "GER", "IST602"),
                ("Friday", 1, "21BTB102J", "LAB", "PCB Lab"),
                ("Friday", 2, "21BTB102J", "LAB", "PCB Lab"),
                ("Friday", 6, "21LEH104T", "GER", "IST626"),
                ("Friday", 8, "21CYB101J", "B", "IST602"),
                ("Friday", 9, "21MAB102T", "A", "IST602"),
            ]
        },

        # =========================================================================
        # 3. I ECE-DS (I year Time Table SEEE.pdf Page 2)
        # =========================================================================
        "I_ECE_DS": {
            "subjects": [
                ("21MAB102T", "Advanced Calculus and Complex Analysis", "3-1-0-4", "A", "PERIOD", 4, "Dr. Pandiyarajan", "AP / Maths", 36, 42, 20),
                ("21CYB101J", "Chemistry", "3-1-2-5", "B", "PERIOD", 6, "Dr. Ujjwala", "AP / Che", 34, 40, 20),
                ("21BTB102J", "Electronic System and PCB Design", "2-0-0-2", "C", "PERIOD", 2, "Dr. V.N. Senthil Kumaran", "Asso.Prof / ECE", 17, 20, 10),
                ("21CSS101J", "Programming for Problem Solving", "3-0-2-4", "D", "PERIOD", 5, "Mrs. R. Sharanya", "AP / CSE", 33, 40, 20),
                ("21GNH101J", "Philosophy of Engineering", "1-0-2-2", "E", "PERIOD", 3, "Dr. R. Ramesh", "Asso.Prof / Mech", 24, 28, 14),
                ("21BTB103T", "Biology", "2-0-0-2", "F", "PERIOD", 2, "Dr. M. Maria Leena", "AP / Biotech", 16, 18, 10),
                ("21LEH104T", "German", "2-1-0-3", "GER", "PERIOD", 3, "Mr. Selva", "German", 25, 28, 12),
                ("21MES101L", "Basic Civil and Mechanical Workshop", "0-0-4-2", "LAB", "SESSION", 4, "Dr. Sakthibalan / Dr. MD Modasir Khan", "AP / Mech", 18, 20, 10),
                ("21PDM102L", "General Aptitude", "0-0-2-0", "CDC", "PERIOD", 2, "Mr. Sivanandhan", "CDC", 18, 20, 8),
                ("21GNM102L", "NSS", "0-0-2-0", "NSS", "PERIOD", 2, "Dr. R. Manickam", "Physical Director", 16, 18, 8),
            ],
            "grid": [
                ("Monday", 1, "21BTB103T", "F", "IST710"),
                ("Monday", 2, "21PDM102L", "CDC", "IST710"),
                ("Monday", 3, "21BTB102J", "LAB", "PCB Lab"),
                ("Monday", 4, "21BTB102J", "LAB", "PCB Lab"),
                ("Monday", 6, "21GNH101J", "E", "IST502"),
                ("Monday", 7, "21GNH101J", "E", "IST502"),
                ("Monday", 8, "21CYB101J", "B", "IST502"),
                ("Monday", 9, "21MAB102T", "A", "IST502"),
                ("Tuesday", 1, "21CYB101J", "LAB", "Che Lab"),
                ("Tuesday", 2, "21CYB101J", "LAB", "Che Lab"),
                ("Tuesday", 3, "21GNM102L", "NSS", "IST201"),
                ("Tuesday", 4, "21GNM102L", "NSS", "IST201"),
                ("Tuesday", 6, "21BTB102J", "C", "IST502"),
                ("Tuesday", 7, "21CYB101J", "B", "IST502"),
                ("Tuesday", 8, "21MAB102T", "A", "IST502"),
                ("Tuesday", 9, "21CSS101J", "D", "IST502"),
                ("Wednesday", 1, "21PDM102L", "CDC", "IST510"),
                ("Wednesday", 2, "21PDM102L", "CDC", "IST510"),
                ("Wednesday", 3, "21MAB102T", "A", "IST710"),
                ("Wednesday", 6, "21CSS101J", "LAB", "PPS Lab"),
                ("Wednesday", 7, "21CYB101J", "B", "IST502"),
                ("Wednesday", 8, "21GNH101J", "E", "IST502"),
                ("Wednesday", 9, "21CSS101J", "D", "IST502"),
                ("Thursday", 1, "21BTB103T", "F", "IST710"),
                ("Thursday", 2, "21MAB102T", "A", "IST510"),
                ("Thursday", 3, "21CSS101J", "D", "IST710"),
                ("Thursday", 5, "21LEH104T", "GER", "IST502"),
                ("Thursday", 6, "21LEH104T", "GER", "IST502"),
                ("Thursday", 8, "21BTB102J", "C", "IST502"),
                ("Thursday", 9, "21CYB101J", "B", "IST502"),
                ("Friday", 1, "21LEH104T", "GER", "IST626"),
                ("Friday", 2, "21LEH104T", "GER", "IST626"),
                ("Friday", 3, "21CSS101J", "LAB", "PPS Lab"),
                ("Friday", 4, "21CSS101J", "LAB", "PPS Lab"),
                ("Friday", 6, "21MES101L", "LAB", "Workshop"),
                ("Friday", 7, "21MES101L", "LAB", "Workshop"),
            ]
        },

        # =========================================================================
        # 4. I Biotech-B & Biomedical Engineering (I year Time Table SEEE.pdf Page 3)
        # =========================================================================
        "I_BIOTECH_B_BME": {
            "subjects": [
                ("21MAB102T", "Advanced Calculus and Complex Analysis", "3-1-0-4", "A", "PERIOD", 4, "Dr. R. Suresh", "AP / Maths", 37, 42, 20),
                ("21CYB101J", "Chemistry", "3-1-2-5", "B", "PERIOD", 6, "Dr. R. Logudurai", "AP / Che", 35, 40, 20),
                ("21BTC105T", "Cell Biology (for Biotech)", "2-0-0-2", "C", "PERIOD", 2, "Dr. Daniel Paul", "AP / Biotech", 18, 20, 10),
                ("21CSS101J", "Programming for Problem Solving", "3-0-2-4", "D", "PERIOD", 5, "Dr. B. Chitradevi", "AP / CSE", 34, 40, 20),
                ("21GNH101J", "Philosophy of Engineering", "1-0-2-2", "E", "PERIOD", 3, "Dr. J. Ramya Parkavi", "AP / Phy", 25, 28, 14),
                ("21BTC101T", "Biochemistry (for Biotech)", "3-0-0-3", "F", "PERIOD", 3, "Dr. M. Jaya Priya", "AP / Biotech", 26, 30, 15),
                ("21BTB104T", "Biology: Human Physiology and Anatomy", "2-0-0-2", "G", "PERIOD", 2, "Faculty / BME", "AP / BME", 17, 18, 10),
                ("21LEH105T", "Japanese", "2-1-0-3", "JAP", "PERIOD", 3, "Mr. Nadeem", "Japanese", 25, 28, 12),
                ("21MES101L", "Basic Civil and Mechanical Workshop", "0-0-4-2", "LAB", "SESSION", 4, "Dr. R. Manimaran / Dr. R. Ramesh", "AP / Mech", 18, 20, 10),
                ("21PDM102L", "General Aptitude", "0-0-2-0", "CDC", "PERIOD", 2, "Mr. Sivanandhan", "CDC", 18, 20, 8),
                ("21GNM101L", "Physical and Mental Health using Yoga", "0-0-2-0", "YOGA", "PERIOD", 2, "Ms. Balasivapriya", "Yoga Instructor", 18, 20, 8),
            ],
            "grid": [
                ("Monday", 1, "21BTC105T", "C", "IST520"),
                ("Monday", 2, "21GNM101L", "YOGA", "IST520"),
                ("Monday", 3, "21GNM101L", "YOGA", "IST520"),
                ("Monday", 4, "21BTC101T", "F", "IST710"),
                ("Monday", 6, "21GNH101J", "E", "IST702"),
                ("Monday", 7, "21GNH101J", "E", "IST702"),
                ("Monday", 8, "21MAB102T", "A", "IST702"),
                ("Monday", 9, "21CYB101J", "B", "IST702"),
                ("Tuesday", 1, "21PDM102L", "CDC", "IST710"),
                ("Tuesday", 2, "21PDM102L", "CDC", "IST710"),
                ("Tuesday", 3, "21BTC105T", "C", "IST520"),
                ("Tuesday", 4, "21BTC101T", "F", "IST710"),
                ("Tuesday", 7, "21CYB101J", "B", "IST702"),
                ("Tuesday", 8, "21MAB102T", "A", "IST702"),
                ("Tuesday", 9, "21CSS101J", "D", "IST702"),
                ("Wednesday", 2, "21MES101L", "LAB", "Workshop"),
                ("Wednesday", 3, "21MES101L", "LAB", "Workshop"),
                ("Wednesday", 6, "21CSS101J", "D", "IST702"),
                ("Wednesday", 7, "21CYB101J", "B", "IST702"),
                ("Wednesday", 8, "21GNH101J", "E", "IST702"),
                ("Wednesday", 9, "21CSS101J", "D", "IST702"),
                ("Thursday", 1, "21CYB101J", "LAB", "Che Lab"),
                ("Thursday", 2, "21CYB101J", "LAB", "Che Lab"),
                ("Thursday", 3, "21MAB102T", "A", "IST710"),
                ("Thursday", 4, "21BTC105T", "C", "IST510"),
                ("Thursday", 6, "21CYB101J", "B", "IST702"),
                ("Thursday", 8, "21LEH105T", "JAP", "IST702"),
                ("Friday", 1, "21BTC101T", "F", "IST702"),
                ("Friday", 2, "21PDM102L", "CDC", "IST702"),
                ("Friday", 3, "21MAB102T", "A", "IST702"),
                ("Friday", 5, "21LEH105T", "JAP", "IST702"),
                ("Friday", 8, "21CSS101J", "LAB", "PPS Lab"),
                ("Friday", 9, "21CSS101J", "LAB", "PPS Lab"),
            ]
        },

        # =========================================================================
        # 5. II BME (II BME.pdf)
        # =========================================================================
        "II_BME": {
            "subjects": [
                ("21MAB201T", "Transforms and Boundary Value Problems", "3-1-0-4", "A", "PERIOD", 4, "Dr. A. Manickam", "ASP / MAT", 41, 45, 20),
                ("21BMC202T", "Biomedical Signals and Systems", "3-0-0-3", "B", "PERIOD", 3, "Dr. Senthil Kumaran V N", "ASP & HOD / ECE", 34, 40, 20),
                ("21BMC203J", "Electric and Electronic Circuits", "3-0-2-4", "C", "PERIOD", 5, "Dr. Prabin Kumar Bera", "AP / ECE", 35, 40, 20),
                ("21BMC204J", "Digital Logic for Medical Systems", "2-0-2-3", "D", "PERIOD", 4, "Dr. G. Gifta", "AP / BME", 32, 40, 20),
                ("21PYS202T", "Medical Physics", "3-0-0-3", "E", "PERIOD", 3, "Dr. D. Rajeswari", "ASP / PHY", 36, 40, 18),
                ("21LEM201T", "Professional Ethics", "1-0-0-0", "F", "PERIOD", 1, "Dr. H. SriBhuvaneshwari", "AP / ECE", 13, 14, 6),
                ("21LEM202T", "Universal Human Values-II", "2-1-0-3", "G", "PERIOD", 3, "Mrs. N. Suganthi", "RS - ECE", 28, 30, 14),
                ("21PDM201L", "Verbal Reasoning", "0-0-2-0", "H", "PERIOD", 2, "CDC Faculty", "CDC", 18, 20, 8),
                ("21PDH201T", "Social Engineering", "2-0-0-2", "I", "PERIOD", 2, "Mrs. Francis Arockiya Mary", "RS - EEE", 18, 20, 8),
                ("21BMC211L", "DLMS / EEC Laboratory", "0-0-4-2", "LAB", "SESSION", 4, "Dr. Prabin Kumar Bera / Dr. G. Gifta", "AP / BME", 17, 18, 8),
            ],
            "grid": [
                ("Monday", 1, "21PYS202T", "E", "IST 602"),
                ("Monday", 2, "21BMC203J", "C", "IST 602"),
                ("Monday", 3, "21PDH201T", "I", "IST 602"),
                ("Monday", 4, "21PDH201T", "I", "IST 602"),
                ("Monday", 6, "21BMC211L", "LAB", "DLMS Lab"),
                ("Monday", 7, "21BMC211L", "LAB", "DLMS Lab"),
                ("Tuesday", 1, "21BMC203J", "C", "IST 602"),
                ("Tuesday", 2, "21PYS202T", "E", "IST 602"),
                ("Tuesday", 3, "21BMC202T", "B", "IST 602"),
                ("Tuesday", 4, "21MAB201T", "A", "IST 602"),
                ("Tuesday", 6, "21PDM201L", "H", "H-TB-106"),
                ("Wednesday", 1, "21BMC202T", "B", "IST 602"),
                ("Wednesday", 2, "21BMC204J", "D", "IST 602"),
                ("Wednesday", 3, "21MAB201T", "A", "IST 602"),
                ("Wednesday", 6, "21PDM201L", "H", "H-TB-106"),
                ("Wednesday", 7, "21LEM202T", "G", "G-602"),
                ("Thursday", 1, "21MAB201T", "A", "IST 602"),
                ("Thursday", 2, "21PYS202T", "E", "IST 602"),
                ("Thursday", 3, "21BMC202T", "B", "IST 602"),
                ("Thursday", 4, "21BMC204J", "D", "IST 602"),
                ("Thursday", 8, "21BMC211L", "LAB", "DLMS Lab"),
                ("Thursday", 9, "21BMC211L", "LAB", "DLMS Lab"),
                ("Friday", 1, "21LEM201T", "F", "IST 602"),
                ("Friday", 2, "21MAB201T", "A", "IST 602"),
                ("Friday", 3, "21BMC203J", "C", "IST 602"),
                ("Friday", 4, "21BMC204J", "D", "IST 602"),
                ("Friday", 8, "21LEM202T", "G", "G-602"),
            ]
        },

        # =========================================================================
        # 6. II ECE-DS A (II ECE DS A.pdf)
        # =========================================================================
        "II_ECE_DS_A": {
            "subjects": [
                ("21MAB201T", "Transforms and Boundary Value Problems", "3-1-0-4", "A", "PERIOD", 4, "Dr. C. Arun Kumar", "AP / Maths", 42, 45, 20),
                ("21ECC201T", "Solid State Devices", "3-0-0-3", "B", "PERIOD", 3, "Dr. Jeevanantham S", "AP / ECE-DS", 32, 40, 20),
                ("21CSS201T", "Computer Organization and Architecture", "3-1-0-4", "C", "PERIOD", 4, "Dr. P. Murugapandiyan", "Prof. / ECE", 34, 40, 20),
                ("21ECC203T", "Digital Logic Design", "3-0-0-3", "D", "PERIOD", 3, "Dr. S. Krishnakumar", "AP / ECE-DS", 29, 40, 18),
                ("21ECC205T", "Electromagnetic Theory and Interference", "3-0-0-3", "E", "PERIOD", 3, "Dr. V. Bharathi", "AP / ECE", 33, 40, 18),
                ("21LEM201T", "Professional Ethics", "1-0-0-0", "F", "PERIOD", 1, "Dr. Jothi M", "AP / ECE", 12, 14, 6),
                ("21LEM202T", "Universal Human Values-II", "2-1-0-3", "G", "PERIOD", 3, "Mrs. N. Suganthi", "RS - ECE", 28, 30, 14),
                ("21PDM201L", "Verbal Reasoning", "0-0-2-0", "H", "PERIOD", 2, "CDC Faculty", "CDC - TB-106", 18, 20, 8),
                ("21PDH209T", "Social Engineering", "2-0-0-2", "I", "PERIOD", 2, "Mrs. D. Lavanya", "RS - ECE", 18, 20, 8),
                ("21ECC211L", "Devices and Digital IC Laboratory", "0-0-4-2", "LAB", "SESSION", 4, "Dr. Jeevanantham S / Dr. V. Bharathi", "AP / ECE-DS", 16, 18, 8),
            ],
            "grid": [
                ("Monday", 1, "21ECC205T", "E", "IST 416"),
                ("Monday", 2, "21MAB201T", "A", "IST 416"),
                ("Monday", 3, "21PDH209T", "I", "IST 416"),
                ("Monday", 4, "21PDH209T", "I", "IST 416"),
                ("Monday", 6, "21LEM202T", "G", "G-602"),
                ("Monday", 7, "21LEM202T", "G", "G-602"),
                ("Monday", 8, "21ECC211L", "LAB", "LAB -309/107"),
                ("Monday", 9, "21ECC211L", "LAB", "LAB -309/107"),
                ("Tuesday", 1, "21CSS201T", "C", "IST 416"),
                ("Tuesday", 2, "21MAB201T", "A", "IST 416"),
                ("Tuesday", 3, "21ECC205T", "E", "IST 416"),
                ("Tuesday", 4, "21ECC203T", "D", "IST 416"),
                ("Tuesday", 6, "21LEM202T", "G", "G-602"),
                ("Tuesday", 8, "21PDM201L", "H", "H-TB-106"),
                ("Tuesday", 9, "21PDM201L", "H", "H-TB-106"),
                ("Wednesday", 1, "21MAB201T", "A", "IST 416"),
                ("Wednesday", 2, "21ECC201T", "B", "IST 416"),
                ("Wednesday", 3, "21CSS201T", "C", "IST 416"),
                ("Wednesday", 4, "21ECC203T", "D", "IST 416"),
                ("Wednesday", 7, "21PDM201L", "H", "H-TB-106"),
                ("Thursday", 1, "21ECC201T", "B", "IST 416"),
                ("Thursday", 2, "21CSS201T", "C", "IST 416"),
                ("Thursday", 3, "21MAB201T", "A", "IST 416"),
                ("Thursday", 4, "21LEM201T", "F", "IST 416"),
                ("Thursday", 6, "21ECC211L", "LAB", "LAB -309/107"),
                ("Thursday", 7, "21ECC211L", "LAB", "LAB -309/107"),
                ("Friday", 1, "21ECC203T", "D", "IST 416"),
                ("Friday", 2, "21ECC201T", "B", "IST 416"),
                ("Friday", 3, "21ECC205T", "E", "IST 416"),
                ("Friday", 4, "21CSS201T", "C", "IST 416"),
            ]
        },

        # =========================================================================
        # 7. II ECE-DS B (II ECE DS B.pdf)
        # =========================================================================
        "II_ECE_DS_B": {
            "subjects": [
                ("21MAB201T", "Transforms and Boundary Value Problems", "3-1-0-4", "A", "PERIOD", 4, "NEW FACULTY 3", "AP / MAT", 40, 45, 20),
                ("21ECC201T", "Solid State Devices", "3-0-0-3", "B", "PERIOD", 3, "Dr. Jeevanantham S", "AP / ECE-DS", 35, 40, 20),
                ("21CSS201T", "Computer Organization and Architecture", "3-1-0-4", "C", "PERIOD", 4, "Dr. P. Murugapandiyan", "Prof. / ECE", 36, 40, 20),
                ("21ECC203T", "Digital Logic Design", "3-0-0-3", "D", "PERIOD", 3, "Dr. S. Krishnakumar", "AP / ECE-DS", 34, 40, 18),
                ("21ECC205T", "Electromagnetic Theory and Interference", "3-0-0-3", "E", "PERIOD", 3, "Dr. V. Bharathi", "AP / ECE", 33, 40, 18),
                ("21LEM201T", "Professional Ethics", "1-0-0-0", "F", "PERIOD", 1, "Dr. K. Vigneshwaran", "AP / ECE", 13, 14, 6),
                ("21LEM202T", "Universal Human Values-II", "2-1-0-3", "G", "PERIOD", 3, "Mrs. D. Lavanya", "RS - ECE", 27, 30, 14),
                ("21PDM201L", "Verbal Reasoning", "0-0-2-0", "H", "PERIOD", 2, "CDC Faculty", "CDC-TB-106", 18, 20, 8),
                ("21PDH209T", "Social Engineering", "2-0-0-2", "I", "PERIOD", 2, "Mrs. D. Lavanya", "RS - ECE", 18, 20, 8),
                ("21ECC211L", "Devices and Digital IC Laboratory", "0-0-4-2", "LAB", "SESSION", 4, "Dr. S. Krishnakumar", "AP / ECE-DS", 17, 18, 8),
            ],
            "grid": [
                ("Monday", 3, "21ECC211L", "LAB", "LAB -309/107"),
                ("Monday", 4, "21ECC211L", "LAB", "LAB -309/107"),
                ("Monday", 6, "21ECC203T", "D", "IST 411"),
                ("Monday", 7, "21ECC201T", "B", "IST 411"),
                ("Monday", 8, "21CSS201T", "C", "IST 411"),
                ("Monday", 9, "21PDH209T", "I", "IST 411"),
                ("Tuesday", 1, "21ECC211L", "LAB", "LAB -309/107"),
                ("Tuesday", 2, "21ECC211L", "LAB", "LAB -309/107"),
                ("Tuesday", 6, "21CSS201T", "C", "IST 411"),
                ("Tuesday", 7, "21ECC203T", "D", "IST 411"),
                ("Tuesday", 8, "21ECC205T", "E", "IST 411"),
                ("Tuesday", 9, "21MAB201T", "A", "IST 411"),
                ("Wednesday", 1, "21LEM202T", "G", "G-401"),
                ("Wednesday", 6, "21PDH209T", "I", "IST 411"),
                ("Wednesday", 7, "21ECC205T", "E", "IST 411"),
                ("Wednesday", 8, "21MAB201T", "A", "IST 411"),
                ("Wednesday", 9, "21ECC203T", "D", "IST 411"),
                ("Thursday", 2, "21LEM202T", "G", "G-401"),
                ("Thursday", 3, "21PDM201L", "H", "H-TB-106"),
                ("Thursday", 4, "21PDM201L", "H", "H-TB-106"),
                ("Thursday", 6, "21MAB201T", "A", "IST 411"),
                ("Thursday", 7, "21CSS201T", "C", "IST 411"),
                ("Thursday", 8, "21ECC201T", "B", "IST 411"),
                ("Thursday", 9, "21ECC205T", "E", "IST 411"),
                ("Friday", 1, "21PDM201L", "H", "H-TB-106"),
                ("Friday", 6, "21LEM201T", "F", "IST 411"),
                ("Friday", 7, "21MAB201T", "A", "IST 411"),
                ("Friday", 8, "21ECC201T", "B", "IST 411"),
                ("Friday", 9, "21CSS201T", "C", "IST 411"),
            ]
        },

        # =========================================================================
        # 8. III BME (III BME.pdf)
        # =========================================================================
        "III_BME": {
            "subjects": [
                ("21MAB301T", "Probability and Statistics", "3-1-0-4", "A", "PERIOD", 4, "Dr. K. M. Karuppusamy", "AP / Maths", 39, 45, 20),
                ("21BMC302J", "Microcontrollers and Its Application in Medicine", "3-0-2-4", "B", "PERIOD", 5, "Dr. K. Vigneshwaran", "ASP / ECE", 35, 40, 20),
                ("21BMC301J", "Biomedical Signal Processing", "3-0-2-4", "C", "PERIOD", 5, "Dr. V.N. Senthilkumaran", "ASP & HOD / ECE", 36, 40, 20),
                ("21BME266T", "Biometrics", "3-0-0-3", "D", "PERIOD", 3, "Dr. G. Gifta", "AP / BME", 34, 40, 18),
                ("21ECO103T", "Modern Wireless Communication System", "3-0-0-3", "E", "PERIOD", 3, "Dr. Vaishnavi", "AP / ECE", 33, 40, 18),
                ("21BMC303T", "Principles of Medical Imaging", "3-0-0-3", "F", "PERIOD", 3, "Dr. N. Prasana Venkatesh", "AP / BME", 28, 30, 15),
                ("21PDM301L", "Analytical and Logical Thinking Skills", "0-0-2-0", "G", "PERIOD", 2, "CDC Faculty", "CDC-625", 18, 20, 8),
                ("21LEM301T", "Indian Art Form", "1-0-0-0", "H", "PERIOD", 1, "Dr. G. Gifta", "AP / BME", 13, 14, 6),
                ("21GNP301L", "Community Connect", "0-0-2-1", "I", "PERIOD", 2, "Dr. J. Jencia / Dr. N. Prasanna Venkatesh", "AP / BME", 18, 20, 8),
                ("21BMC311L", "MPMC Lab / Bio DSP Lab", "0-0-4-2", "LAB", "SESSION", 4, "Dr. K. Vigneshwaran / Dr. V.N. Senthilkumaran", "ASP / ECE", 17, 18, 8),
            ],
            "grid": [
                ("Monday", 2, "21PDM301L", "G", "G-625"),
                ("Monday", 3, "21BMC311L", "LAB", "MPMC LAB-107"),
                ("Monday", 4, "21BMC311L", "LAB", "MPMC LAB-107"),
                ("Monday", 6, "21ECO103T", "E", "IST 211"),
                ("Monday", 7, "21BMC302J", "B", "IST 211"),
                ("Monday", 8, "21BMC303T", "F", "IST 211"),
                ("Monday", 9, "21LEM301T", "H", "IST 211"),
                ("Tuesday", 1, "21BMC311L", "LAB", "BIO DSP LAB"),
                ("Tuesday", 2, "21BMC311L", "LAB", "BIO DSP LAB"),
                ("Tuesday", 3, "21PDM301L", "G", "G-625"),
                ("Tuesday", 6, "21BMC301J", "C", "IST 211"),
                ("Tuesday", 7, "21BME266T", "D", "IST 211"),
                ("Tuesday", 8, "21MAB301T", "A", "IST 211"),
                ("Tuesday", 9, "21BMC302J", "B", "IST 211"),
                ("Wednesday", 6, "21BMC301J", "C", "IST 211"),
                ("Wednesday", 7, "21MAB301T", "A", "IST 211"),
                ("Wednesday", 8, "21BMC303T", "F", "IST 211"),
                ("Wednesday", 9, "21BME266T", "D", "IST 211"),
                ("Thursday", 4, "21GNP301L", "I", "I-108"),
                ("Thursday", 6, "21MAB301T", "A", "IST 211"),
                ("Thursday", 7, "21BMC301J", "C", "IST 211"),
                ("Thursday", 8, "21ECO103T", "E", "IST 211"),
                ("Thursday", 9, "21BMC302J", "B", "IST 211"),
                ("Friday", 1, "21GNP301L", "I", "I-108"),
                ("Friday", 6, "21BMC303T", "F", "IST 211"),
                ("Friday", 7, "21MAB301T", "A", "IST 211"),
                ("Friday", 8, "21BME266T", "D", "IST 211"),
                ("Friday", 9, "21ECO103T", "E", "IST 211"),
            ]
        },

        # =========================================================================
        # 9. III ECE-A (III ECE A.pdf)
        # =========================================================================
        "III_ECE_A": {
            "subjects": [
                ("21MAB302T", "Discrete Mathematics", "3-1-0-4", "A", "PERIOD", 4, "New Faculty 3", "AP / Maths", 38, 45, 20),
                ("21ECC301P", "Microprocessor, Microcontroller, and Interfacing Techniques", "3-1-0-4", "B", "PERIOD", 4, "Dr. M. Manikandan", "AP / ECE", 36, 42, 20),
                ("21ECC303T", "VLSI Design and Technology", "3-0-0-3", "C", "PERIOD", 3, "Dr. M. Jothi", "AP / ECE", 34, 40, 18),
                ("21ECE468T", "System and Network on Chip", "3-0-0-3", "D", "PERIOD", 3, "Dr. V. Manikandan", "AP / ECE-DS", 33, 40, 18),
                ("21CSO355T", "Machine Learning for All", "3-0-0-3", "E", "PERIOD", 3, "Dr. J. Jencia", "AP / BME", 35, 40, 18),
                ("21GNP301L", "Community Connect", "0-0-2-1", "F", "PERIOD", 2, "Dr. V. Rajesh / Dr. V. Bharathi", "AP / ECE", 18, 20, 8),
                ("21PDM301L", "Analytical and Logical Thinking Skills", "0-0-2-0", "G", "PERIOD", 2, "CDC Faculty", "CDC / 625", 18, 20, 8),
                ("21LEM301T", "Indian Art Form", "1-0-0-0", "H", "PERIOD", 1, "Dr. K. Vigneshwaran", "AP / ECE", 13, 14, 6),
                ("21ECC311L", "VLSI Design / Microprocessor Laboratory", "0-0-4-2", "LAB", "SESSION", 4, "Dr. M. Jothi / Dr. P. Murugapandiyan", "Prof. / ECE", 17, 18, 8),
            ],
            "grid": [
                ("Monday", 1, "21CSO355T", "E", "IST 518"),
                ("Monday", 2, "21ECC301P", "B", "IST 518"),
                ("Monday", 3, "21ECC301P", "B", "IST 518"),
                ("Monday", 4, "21MAB302T", "A", "IST 518"),
                ("Monday", 6, "21PDM301L", "G", "G-625"),
                ("Tuesday", 1, "21LEM301T", "H", "IST 518"),
                ("Tuesday", 2, "21ECE468T", "D", "IST 518"),
                ("Tuesday", 3, "21ECC301P", "B", "IST 518"),
                ("Tuesday", 4, "21ECC301P", "B", "IST 518"),
                ("Tuesday", 7, "21PDM301L", "G", "G-625"),
                ("Wednesday", 1, "21ECC303T", "C", "IST 518"),
                ("Wednesday", 2, "21MAB302T", "A", "IST 518"),
                ("Wednesday", 3, "21ECE468T", "D", "IST 518"),
                ("Wednesday", 4, "21GNP301L", "F", "IST 518"),
                ("Wednesday", 8, "21ECC311L", "LAB", "LAB-108/309"),
                ("Wednesday", 9, "21ECC311L", "LAB", "LAB-108/309"),
                ("Thursday", 1, "21MAB302T", "A", "IST 518"),
                ("Thursday", 2, "21CSO355T", "E", "IST 518"),
                ("Thursday", 3, "21ECC303T", "C", "IST 518"),
                ("Thursday", 4, "21GNP301L", "F", "IST 518"),
                ("Friday", 1, "21ECE468T", "D", "IST 518"),
                ("Friday", 2, "21MAB302T", "A", "IST 518"),
                ("Friday", 3, "21CSO355T", "E", "IST 518"),
                ("Friday", 4, "21ECC303T", "C", "IST 518"),
                ("Friday", 6, "21ECC311L", "LAB", "LAB-108/309"),
                ("Friday", 7, "21ECC311L", "LAB", "LAB-108/309"),
            ]
        },

        # =========================================================================
        # 10. III ECE-B (III ECE B.pdf)
        # =========================================================================
        "III_ECE_B": {
            "subjects": [
                ("21MAB302T", "Discrete Mathematics", "3-1-0-4", "A", "PERIOD", 4, "Dr. M. Thanga Rejini", "AP / Maths", 39, 45, 20),
                ("21ECC301P", "Microprocessor, Microcontroller, and Interfacing Techniques", "3-1-0-4", "B", "PERIOD", 4, "Mrs. B. Abirami", "EO / SRMIST", 36, 42, 20),
                ("21ECC303T", "VLSI Design and Technology", "3-0-0-3", "C", "PERIOD", 3, "Dr. R. Vinoth Raj", "AP / ECE-DS", 34, 40, 18),
                ("21ECE468T", "System and Network on Chip", "3-0-0-3", "D", "PERIOD", 3, "Dr. V. Manikandan", "AP / ECE-DS", 33, 40, 18),
                ("21CSO355T", "Machine Learning for All", "3-0-0-3", "E", "PERIOD", 3, "Dr. J. Jencia", "AP / BME", 35, 40, 18),
                ("21GNP301L", "Community Connect", "0-0-2-1", "F", "PERIOD", 2, "Dr. H. Sudharsan / Ms. T. Swetha", "AP / ECE", 18, 20, 8),
                ("21PDM301L", "Analytical and Logical Thinking Skills", "0-0-2-0", "G", "PERIOD", 2, "CDC Faculty", "CDC - 625", 18, 20, 8),
                ("21LEM301T", "Indian Art Form", "1-0-0-0", "H", "PERIOD", 1, "Dr. A. Anand", "AP / ECE", 13, 14, 6),
                ("21ECC311L", "VLSI Design / Microprocessor Laboratory", "0-0-4-2", "LAB", "SESSION", 4, "Dr. Sreenivasa Ijada Rao / Dr. B. DeviSri", "Prof. / ECE", 17, 18, 8),
            ],
            "grid": [
                ("Monday", 1, "21ECC311L", "LAB", "LAB-108/309"),
                ("Monday", 2, "21ECC311L", "LAB", "LAB-108/309"),
                ("Monday", 6, "21CSO355T", "E", "IST 518"),
                ("Monday", 7, "21ECC301P", "B", "IST 518"),
                ("Monday", 8, "21MAB302T", "A", "IST 518"),
                ("Monday", 9, "21ECE468T", "D", "IST 518"),
                ("Tuesday", 2, "21PDM301L", "G", "G-625"),
                ("Tuesday", 6, "21GNP301L", "F", "IST 518"),
                ("Tuesday", 7, "21ECC301P", "B", "IST 518"),
                ("Tuesday", 8, "21ECE468T", "D", "IST 518"),
                ("Tuesday", 9, "21ECC303T", "C", "IST 518"),
                ("Wednesday", 1, "21PDM301L", "G", "G-625"),
                ("Wednesday", 6, "21ECC301P", "B", "IST 518"),
                ("Wednesday", 7, "21ECC301P", "B", "IST 518"),
                ("Wednesday", 8, "21MAB302T", "A", "IST 518"),
                ("Wednesday", 9, "21LEM301T", "H", "IST 518"),
                ("Thursday", 1, "21ECC311L", "LAB", "LAB-108/309"),
                ("Thursday", 2, "21ECC311L", "LAB", "LAB-108/309"),
                ("Thursday", 6, "21MAB302T", "A", "IST 518"),
                ("Thursday", 7, "21ECC303T", "C", "IST 518"),
                ("Thursday", 8, "21CSO355T", "E", "IST 518"),
                ("Thursday", 9, "21GNP301L", "F", "IST 518"),
                ("Friday", 6, "21ECC303T", "C", "IST 518"),
                ("Friday", 7, "21MAB302T", "A", "IST 518"),
                ("Friday", 8, "21CSO355T", "E", "IST 518"),
                ("Friday", 9, "21ECE468T", "D", "IST 518"),
            ]
        },

        # =========================================================================
        # 11. III ECE-DS (III ECE DS.pdf)
        # =========================================================================
        "III_ECE_DS": {
            "subjects": [
                ("21MAB302T", "Discrete Mathematics", "3-1-0-4", "A", "PERIOD", 4, "New Faculty 2", "AP / Maths", 39, 45, 20),
                ("21ECC301P", "Microprocessor, Microcontroller, and Interfacing Techniques", "3-1-0-4", "B", "PERIOD", 4, "Mrs. B. Abirami", "EO / SRMIST", 36, 42, 20),
                ("21ECC303T", "VLSI Design and Technology", "3-0-0-3", "C", "PERIOD", 3, "Dr. R. Vinoth Raj", "AP / ECE-DS", 34, 40, 18),
                ("21CSO355T", "Machine Learning for All", "3-0-0-3", "D", "PERIOD", 3, "Dr. Chitra Devi", "ASP / SoC", 35, 40, 18),
                ("21ECE371T", "Database Design and Management", "3-0-0-3", "E", "PERIOD", 3, "Dr. S. Saraswathi", "AP / SoC", 33, 40, 18),
                ("21GNP301L", "Community Connect", "0-0-2-1", "F", "PERIOD", 2, "Dr. S. Jeevanantham / Dr. V. Manikandan", "AP / ECE-DS", 18, 20, 8),
                ("21PDM301L", "Analytical and Logical Thinking Skills", "0-0-2-0", "G", "PERIOD", 2, "CDC Faculty", "CDC-625", 18, 20, 8),
                ("21LEM301T", "Indian Art Form", "1-0-0-0", "H", "PERIOD", 1, "Dr. Prabin Kumar Bera", "AP / ECE", 13, 14, 6),
                ("21ECC311L", "VLSI Design / Microprocessor Laboratory", "0-0-4-2", "LAB", "SESSION", 4, "Dr. R. Vinothraj / Dr. H. Sri Bhuvaneshwari", "AP / ECE-DS", 17, 18, 8),
            ],
            "grid": [
                ("Monday", 1, "21ECE371T", "E", "IST 519"),
                ("Monday", 2, "21ECC301P", "B", "IST 519"),
                ("Monday", 3, "21ECC303T", "C", "IST 519"),
                ("Monday", 4, "21MAB302T", "A", "IST 519"),
                ("Tuesday", 1, "21ECC303T", "C", "IST 519"),
                ("Tuesday", 2, "21ECC301P", "B", "IST 519"),
                ("Tuesday", 3, "21CSO355T", "D", "IST 519"),
                ("Tuesday", 4, "21GNP301L", "F", "IST 519"),
                ("Tuesday", 6, "21ECC311L", "LAB", "LAB-108/107"),
                ("Tuesday", 7, "21ECC311L", "LAB", "LAB-108/107"),
                ("Wednesday", 1, "21LEM301T", "H", "IST 519"),
                ("Wednesday", 2, "21ECC301P", "B", "IST 519"),
                ("Wednesday", 3, "21MAB302T", "A", "IST 519"),
                ("Wednesday", 4, "21ECC303T", "C", "IST 519"),
                ("Wednesday", 8, "21PDM301L", "G", "G-625"),
                ("Thursday", 1, "21MAB302T", "A", "IST 519"),
                ("Thursday", 2, "21CSO355T", "D", "IST 519"),
                ("Thursday", 3, "21ECE371T", "E", "IST 519"),
                ("Thursday", 4, "21GNP301L", "F", "IST 519"),
                ("Friday", 1, "21CSO355T", "D", "IST 519"),
                ("Friday", 2, "21MAB302T", "A", "IST 519"),
                ("Friday", 3, "21ECE371T", "E", "IST 519"),
                ("Friday", 4, "21ECC301P", "B", "IST 519"),
                ("Friday", 6, "21PDM301L", "G", "G-625"),
                ("Friday", 8, "21ECC311L", "LAB", "LAB-108/107"),
                ("Friday", 9, "21ECC311L", "LAB", "LAB-108/107"),
            ]
        },

        # =========================================================================
        # 12. IV ECE-A (IV ECE A.pdf)
        # =========================================================================
        "IV_ECE_A": {
            "subjects": [
                ("21GNH401T", "Behavioural Psychology", "2-1-0-3", "A", "PERIOD", 3, "Dr. A. Anand", "AP / ECE", 26, 30, 15),
                ("21ECC401T", "Wireless Communication and Antenna Systems", "3-0-0-3", "B", "PERIOD", 3, "Dr. K. Vigneshwaran", "AP / ECE", 34, 40, 18),
                ("21ECC402P", "Computer Communication and Network Security", "2-1-0-3", "C", "PERIOD", 3, "Dr. S. Jeevanantham", "AP / ECE-DS", 35, 40, 18),
                ("21ECE461T", "Semiconductor Memory Design", "3-0-0-3", "D", "PERIOD", 3, "Dr. H. SriBhuvaneshwari", "AP / ECE", 32, 40, 18),
                ("21ECE463T", "Scripting Language for Electronic Design Automation", "3-0-0-3", "E", "PERIOD", 3, "Dr. Sreenivasa Rao Ijada", "Prof. / ECE", 35, 40, 18),
                ("21CSO355T", "Machine Learning for All", "3-0-0-3", "F", "PERIOD", 3, "Dr. N. Prasanna Venkatesh", "AP / BME", 34, 40, 18),
                ("21ECC412L", "Computer Communication and Network Security Lab", "2-1-0-3", "LAB", "SESSION", 2, "Mrs. T. Swetha", "AP / ECE", 17, 18, 8),
            ],
            "grid": [
                ("Monday", 1, "21ECC402P", "C", "IST 225"),
                ("Monday", 3, "21GNH401T", "A", "IST 225"),
                ("Monday", 4, "21ECE461T", "D", "IST 225"),
                ("Tuesday", 1, "21ECC402P", "C", "IST 225"),
                ("Tuesday", 2, "21ECE461T", "D", "IST 225"),
                ("Tuesday", 3, "21ECC401T", "B", "IST 225"),
                ("Tuesday", 4, "21CSO355T", "F", "IST 225"),
                ("Wednesday", 1, "21ECC401T", "B", "IST 225"),
                ("Wednesday", 2, "21ECC412L", "LAB", "IST 108"),
                ("Wednesday", 3, "21ECE463T", "E", "IST 225"),
                ("Wednesday", 4, "21CSO355T", "F", "IST 225"),
                ("Thursday", 1, "21CSO355T", "F", "IST 225"),
                ("Thursday", 2, "21GNH401T", "A", "IST 225"),
                ("Thursday", 3, "21ECE463T", "E", "IST 225"),
                ("Thursday", 4, "21ECC401T", "B", "IST 225"),
                ("Friday", 1, "21ECC402P", "C", "IST 225"),
                ("Friday", 2, "21GNH401T", "A", "IST 225"),
                ("Friday", 3, "21ECE461T", "D", "IST 225"),
                ("Friday", 4, "21ECE463T", "E", "IST 225"),
            ]
        },

        # =========================================================================
        # 13. IV ECE-B (IV ECE B.pdf)
        # =========================================================================
        "IV_ECE_B": {
            "subjects": [
                ("21GNH401T", "Behavioural Psychology", "2-1-0-3", "A", "PERIOD", 3, "Dr. A. Annand", "AP / ECE", 26, 30, 15),
                ("21ECC401T", "Wireless Communication and Antenna Systems", "3-0-0-3", "B", "PERIOD", 3, "Dr. K. Vigneshwaran", "AP / ECE", 34, 40, 18),
                ("21ECC402P", "Computer Communication and Network Security", "2-1-0-3", "C", "PERIOD", 3, "Dr. R. Rajasekar", "ASP & HOD / ECE-DS", 35, 40, 18),
                ("21ECE461T", "Semiconductor Memory Design", "3-0-0-3", "D", "PERIOD", 3, "Dr. H. SriBhuvaneshwari", "AP / ECE", 32, 40, 18),
                ("21ECE463T", "Scripting Language for Electronic Design Automation", "3-0-0-3", "E", "PERIOD", 3, "Dr. Sreenivasa Rao Ijada", "Prof. / ECE", 35, 40, 18),
                ("21CSO355T", "Machine Learning for All", "3-0-0-3", "F", "PERIOD", 3, "Dr. N. Prasanna Venkatesh", "AP / BME", 34, 40, 18),
                ("21ECC412L", "Computer Communication and Network Security Lab", "2-1-0-3", "LAB", "SESSION", 2, "Ms. T. Swetha", "AP / ECE", 17, 18, 8),
            ],
            "grid": [
                ("Monday", 1, "21ECC402P", "C", "IST 227"),
                ("Monday", 2, "21GNH401T", "A", "IST 227"),
                ("Monday", 3, "21ECE463T", "E", "IST 227"),
                ("Monday", 4, "21CSO355T", "F", "IST 227"),
                ("Tuesday", 1, "21ECC402P", "C", "IST 227"),
                ("Tuesday", 2, "21ECE463T", "E", "IST 227"),
                ("Tuesday", 3, "21CSO355T", "F", "IST 227"),
                ("Tuesday", 4, "21ECC401T", "B", "IST 227"),
                ("Wednesday", 1, "21ECC402P", "C", "IST 227"),
                ("Wednesday", 2, "21ECE461T", "D", "IST 227"),
                ("Wednesday", 3, "21GNH401T", "A", "IST 227"),
                ("Wednesday", 4, "21ECC401T", "B", "IST 227"),
                ("Thursday", 1, "21ECE461T", "D", "IST 227"),
                ("Thursday", 2, "21ECC401T", "B", "IST 227"),
                ("Thursday", 3, "21ECC412L", "LAB", "IST 108"),
                ("Thursday", 4, "21GNH401T", "A", "IST 227"),
                ("Friday", 1, "21ECE463T", "E", "IST 227"),
                ("Friday", 2, "21ECE461T", "D", "IST 227"),
                ("Friday", 3, "21CSO355T", "F", "IST 227"),
            ]
        }
    }

    current_date = date(2026, 9, 28)
    day_map = {0: "Monday", 1: "Tuesday", 2: "Wednesday", 3: "Thursday", 4: "Friday"}

    # Loop through each section and persist its complete timetable
    total_subjects = 0
    total_entries = 0

    for sec_key, t_data in timetables_data.items():
        sec_obj = section_map[sec_key]
        created_subs = {}

        for code, name, credit, slot, unit, pw, faculty, dept, att, cond, rem in t_data["subjects"]:
            sub = Subject(
                section_id=sec_obj.id,
                code=code,
                name=name,
                credit=credit,
                slot_code=slot,
                attendance_unit=unit,
                periods_per_week=pw,
                faculty_name=faculty,
                faculty_dept=dept
            )
            db.add(sub)
            db.flush()
            created_subs[code] = sub
            total_subjects += 1

            snap = AttendanceSnapshot(
                student_id="sarvesh",
                subject_id=sub.id,
                attended=att,
                conducted=cond,
                raw_text=f"{code} {name} {att}/{cond}",
                confidence=0.98
            )
            db.add(snap)

        # Timetable entries
        for day, p_num, sub_code, slot, room in t_data["grid"]:
            sub_obj = created_subs.get(sub_code)
            if sub_obj:
                t_start, t_end = period_timings.get(p_num, ("09:00", "09:50"))
                tt_entry = TimetableEntry(
                    section_id=sec_obj.id,
                    subject_id=sub_obj.id,
                    day_of_week=day,
                    period_number=p_num,
                    start_time=t_start,
                    end_time=t_end,
                    slot_code=slot,
                    room=room,
                    class_type="LAB" if slot == "LAB" else "THEORY"
                )
                db.add(tt_entry)
                total_entries += 1

        # Generate future class occurrences (next 6 weeks)
        for day_offset in range(42):
            occ_date = current_date + timedelta(days=day_offset)
            weekday = occ_date.weekday()
            if weekday in day_map:
                day_name = day_map[weekday]
                for day, p_num, sub_code, slot, room in t_data["grid"]:
                    if day == day_name:
                        sub_obj = created_subs.get(sub_code)
                        if sub_obj:
                            t_start, t_end = period_timings.get(p_num, ("09:00", "09:50"))
                            occ = ClassOccurrence(
                                section_id=sec_obj.id,
                                subject_id=sub_obj.id,
                                occurrence_date=occ_date,
                                period_number=p_num,
                                start_time=t_start,
                                end_time=t_end,
                                status="SCHEDULED" if occ_date >= current_date else "COMPLETED"
                            )
                            db.add(occ)

    # Requirements
    req1 = Requirement(student_id="sarvesh", name="Detention Threshold", threshold=0.75, inclusive=True, priority=1)
    req2 = Requirement(student_id="sarvesh", name="Scholarship Target", threshold=0.85, inclusive=True, priority=2)
    req3 = Requirement(student_id="sarvesh", name="Honors / Placement", threshold=0.90, inclusive=True, priority=3)
    db.add_all([req1, req2, req3])

    db.commit()
    print(f"NExtclass Database initialized successfully! Sections: {len(section_map)}, Subjects: {total_subjects}, Timetable Entries: {total_entries}.")
