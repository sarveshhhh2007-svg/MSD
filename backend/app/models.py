"""
SQLAlchemy Relational Database Models
Implements schema specified in Section 44 of the Master Build Prompt.
"""

from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class AcademicTerm(Base):
    __tablename__ = "academic_terms"
    
    id = Column(Integer, primary_key=True, index=True)
    academic_year = Column(String(50), nullable=False)  # e.g., "2026-2027"
    semester = Column(String(50), nullable=False)       # e.g., "Odd Semester (III Semester)"
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(20), default="ACTIVE")       # ACTIVE, COMPLETED, ARCHIVED

    sections = relationship("Section", back_populates="academic_term")


class Section(Base):
    __tablename__ = "sections"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)          # e.g. "II -ECE-DS A"
    department = Column(String(100), nullable=False)    # e.g. "ECE-DS"
    year = Column(String(50), nullable=False)           # e.g. "II Year"
    semester = Column(String(50), nullable=False)       # e.g. "III Semester"
    academic_year = Column(String(50), nullable=False)  # e.g. "2026-2027"
    venue = Column(String(100), default="IST 416 / FN")
    active = Column(Boolean, default=True)
    academic_term_id = Column(Integer, ForeignKey("academic_terms.id"), nullable=True)

    academic_term = relationship("AcademicTerm", back_populates="sections")
    subjects = relationship("Subject", back_populates="section", cascade="all, delete-orphan")
    timetable_entries = relationship("TimetableEntry", back_populates="section", cascade="all, delete-orphan")
    occurrences = relationship("ClassOccurrence", back_populates="section", cascade="all, delete-orphan")


class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    code = Column(String(50), nullable=False)           # e.g., "21ECC203T"
    name = Column(String(200), nullable=False)          # e.g., "Digital Logic Design"
    credit = Column(String(50), default="3-0-0-3")
    slot_code = Column(String(20), nullable=True)       # e.g. "D" or "LAB"
    attendance_unit = Column(String(20), default="PERIOD")  # "PERIOD" or "SESSION"
    periods_per_week = Column(Integer, default=3)
    faculty_name = Column(String(150), default="TBD")
    faculty_dept = Column(String(150), default="ECE")
    
    section = relationship("Section", back_populates="subjects")
    timetable_entries = relationship("TimetableEntry", back_populates="subject")
    occurrences = relationship("ClassOccurrence", back_populates="subject")
    attendance_records = relationship("AttendanceRecord", back_populates="subject")
    attendance_snapshots = relationship("AttendanceSnapshot", back_populates="subject")


class TimetableEntry(Base):
    __tablename__ = "timetable_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True)
    day_of_week = Column(String(20), nullable=False)    # "Monday", "Tuesday", etc.
    period_number = Column(Integer, nullable=False)     # 1 to 9
    start_time = Column(String(20), nullable=False)     # "09:00"
    end_time = Column(String(20), nullable=False)       # "09:50"
    slot_code = Column(String(20), nullable=True)
    room = Column(String(50), default="IST 416")
    class_type = Column(String(50), default="THEORY")   # "THEORY", "LAB", "TUTORIAL", "BREAK"

    section = relationship("Section", back_populates="timetable_entries")
    subject = relationship("Subject", back_populates="timetable_entries")


class ClassOccurrence(Base):
    __tablename__ = "class_occurrences"
    
    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    occurrence_date = Column(Date, nullable=False)
    period_number = Column(Integer, nullable=False)
    start_time = Column(String(20), nullable=False)
    end_time = Column(String(20), nullable=False)
    status = Column(String(50), default="SCHEDULED")    # SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED, EXTRA
    notes = Column(String(255), nullable=True)

    section = relationship("Section", back_populates="occurrences")
    subject = relationship("Subject", back_populates="occurrences")
    attendance_record = relationship("AttendanceRecord", back_populates="occurrence", uselist=False)


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), default="sarvesh", nullable=False)
    occurrence_id = Column(Integer, ForeignKey("class_occurrences.id"), nullable=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    record_date = Column(Date, nullable=False)
    status = Column(String(50), default="PRESENT")       # PRESENT, ABSENT, OD, MEDICAL, CANCELLED
    source = Column(String(50), default="MANUAL")        # OCR, MANUAL, IMPORT, SYSTEM
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    subject = relationship("Subject", back_populates="attendance_records")
    occurrence = relationship("ClassOccurrence", back_populates="attendance_record")


class AttendanceSnapshot(Base):
    __tablename__ = "attendance_snapshots"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), default="sarvesh", nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    attended = Column(Integer, nullable=False, default=0)
    conducted = Column(Integer, nullable=False, default=0)
    raw_text = Column(String(255), nullable=True)
    confidence = Column(Float, default=1.0)
    source_image = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    subject = relationship("Subject", back_populates="attendance_snapshots")


class Requirement(Base):
    __tablename__ = "requirements"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), default="sarvesh", nullable=False)
    name = Column(String(100), nullable=False)          # e.g., "Detention Threshold", "Scholarship"
    threshold = Column(Float, nullable=False)           # e.g., 0.75, 0.85, 0.90
    inclusive = Column(Boolean, default=True)
    priority = Column(Integer, default=1)               # 1 = Highest


class LeaveRecord(Base):
    __tablename__ = "leave_records"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), default="sarvesh", nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True) # None = all subjects
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    leave_type = Column(String(50), nullable=False)     # "OD", "MEDICAL"
    policy_mode = Column(String(50), default="COUNTS_AS_ATTENDED")  # COUNTS_AS_ATTENDED, EXCLUDED_FROM_DENOMINATOR, COUNTS_AS_ABSENT
    status = Column(String(50), default="APPROVED")     # PENDING, APPROVED, REJECTED, SIMULATED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class InstitutionalPolicy(Base):
    __tablename__ = "institutional_policies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), default="Default College Policy")
    od_policy = Column(String(50), default="COUNTS_AS_ATTENDED")       # COUNTS_AS_ATTENDED, EXCLUDED_FROM_DENOMINATOR, COUNTS_AS_ABSENT, NOT_CONFIGURED
    medical_policy = Column(String(50), default="EXCLUDED_FROM_DENOMINATOR") # COUNTS_AS_ATTENDED, EXCLUDED_FROM_DENOMINATOR, COUNTS_AS_ABSENT, NOT_CONFIGURED
    default_target = Column(Float, default=0.75)
    is_configured = Column(Boolean, default=True)


class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. "IST 106", "IST 416"
    building = Column(String(50), default="IST Building", nullable=False)      # "IST Building", "Tech Block"
    floor = Column(Integer, default=0, nullable=False)                         # 0 = Ground, 1 = First, 2 = Second, etc.
    floor_name = Column(String(50), default="GROUND FLOOR", nullable=False)    # "GROUND FLOOR", "FIRST FLOOR", etc.
    capacity = Column(Integer, nullable=True)                                  # e.g. 60, 45, or None (Unknown)
    has_ac = Column(Boolean, nullable=True)                                    # True, False, or None (Unknown)
    has_projector = Column(Boolean, nullable=True)                             # True, False, or None (Unknown)
    room_type = Column(String(50), default="CLASSROOM", nullable=False)        # "CLASSROOM", "LAB", "SEMINAR_HALL"
    status = Column(String(50), default="ACTIVE", nullable=False)              # "ACTIVE", "MAINTENANCE"

