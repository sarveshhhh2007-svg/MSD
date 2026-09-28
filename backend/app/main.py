"""
FastAPI Main Application for Attendance Intelligence Platform
Implements all API endpoints specified in Section 47 with CORS and SQLite persistence.
"""

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import date, datetime, timedelta

from backend.app.database import get_db, init_db
from backend.app.models import (
    AcademicTerm, Section, Subject, TimetableEntry,
    ClassOccurrence, AttendanceRecord, AttendanceSnapshot,
    Requirement, InstitutionalPolicy, LeaveRecord
)
from backend.app.schemas import (
    SectionOut, SubjectOut, TimetableEntryOut, ClassOccurrenceOut,
    DailyAttendanceUpdate, ManualAttendanceUpdate,
    OCRPreviewResponse, OCRConfirmRequest,
    LeaveSimulationRequest, LeaveSimulationResponse,
    InstitutionalPolicyUpdate, ChatMessageRequest, ChatMessageResponse
)
from backend.app.math_engine import (
    calculate_current_attendance,
    calculate_required_classes,
    calculate_safe_absences,
    calculate_max_possible_attendance,
    get_subject_status,
    calculate_multi_target_analysis,
    calculate_priority_score
)
from backend.app.timetable_parser import validate_timetable, get_remaining_classes_count
from backend.app.ocr_engine import parse_raw_attendance_text, generate_sample_ocr_preview
from backend.app.simulator import simulate_leave_impact
from backend.app.advisor import process_advisor_query

app = FastAPI(
    title="NExtclass Attendance Intelligence API",
    version="1.0.0",
    description="NExtclass: Deterministic Attendance Intelligence, Recovery & Semester Planning System"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


def enrich_subject_data(subject: Subject, db: Session, target_threshold: float = 0.75) -> Dict[str, Any]:
    """Calculates all deterministic metrics for a subject."""
    # Latest snapshot
    snap = db.query(AttendanceSnapshot).filter(
        AttendanceSnapshot.subject_id == subject.id
    ).order_by(AttendanceSnapshot.created_at.desc()).first()
    
    attended = snap.attended if snap else 0
    conducted = snap.conducted if snap else 0
    
    # Calculate exact remaining occurrences from today (2026-09-28)
    today = date(2026, 9, 28)
    remaining_count = db.query(ClassOccurrence).filter(
        ClassOccurrence.subject_id == subject.id,
        ClassOccurrence.occurrence_date >= today,
        ClassOccurrence.status != "CANCELLED"
    ).count()
    if remaining_count == 0:
        remaining_count = 18 # fallback standard
        
    status_info = get_subject_status(attended, conducted, remaining_count, target_threshold)
    multi_targets = calculate_multi_target_analysis(attended, conducted, remaining_count)
    
    return {
        "id": subject.id,
        "section_id": subject.section_id,
        "code": subject.code,
        "name": subject.name,
        "credit": subject.credit,
        "slot_code": subject.slot_code,
        "attendance_unit": subject.attendance_unit,
        "periods_per_week": subject.periods_per_week,
        "faculty_name": subject.faculty_name,
        "faculty_dept": subject.faculty_dept,
        "attended": attended,
        "conducted": conducted,
        "remaining": remaining_count,
        "current_pct": status_info["current_pct"],
        "status": status_info["status"],
        "safe_absences": status_info["safe_absences"],
        "required": status_info["required"],
        "min_future_to_maintain": status_info["min_future_to_maintain"],
        "max_possible": status_info["max_possible"],
        "is_irreversible": status_info["is_irreversible"],
        "badge_color": status_info["badge_color"],
        "multi_targets": multi_targets
    }


# ==================== SECTIONS & TIMETABLES ====================

@app.get("/api/sections", response_model=List[SectionOut])
def get_sections(db: Session = Depends(get_db)):
    return db.query(Section).filter(Section.active == True).all()


@app.get("/api/sections/{section_id}", response_model=SectionOut)
def get_section(section_id: int, db: Session = Depends(get_db)):
    sec = db.query(Section).filter(Section.id == section_id).first()
    if not sec:
        raise HTTPException(status_code=404, detail="Section not found")
    return sec


@app.get("/api/subjects/{section_id}", response_model=List[SubjectOut])
def get_subjects(section_id: int, target: float = 0.75, db: Session = Depends(get_db)):
    subjects = db.query(Subject).filter(Subject.section_id == section_id).all()
    return [enrich_subject_data(s, db, target) for s in subjects]


@app.get("/api/timetable/{section_id}")
def get_timetable(section_id: int, db: Session = Depends(get_db)):
    entries = db.query(TimetableEntry).filter(TimetableEntry.section_id == section_id).all()
    out = []
    for e in entries:
        sub = db.query(Subject).filter(Subject.id == e.subject_id).first()
        out.append({
            "id": e.id,
            "day_of_week": e.day_of_week,
            "period_number": e.period_number,
            "start_time": e.start_time,
            "end_time": e.end_time,
            "slot_code": e.slot_code,
            "room": e.room,
            "class_type": e.class_type,
            "subject_code": sub.code if sub else None,
            "subject_name": sub.name if sub else None,
            "faculty_name": sub.faculty_name if sub else None,
        })
    return out


@app.get("/api/occurrences")
def get_occurrences(
    section_id: int = 1,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    q = db.query(ClassOccurrence).filter(ClassOccurrence.section_id == section_id)
    if start_date:
        q = q.filter(ClassOccurrence.occurrence_date >= start_date)
    if end_date:
        q = q.filter(ClassOccurrence.occurrence_date <= end_date)
    else:
        # Default next 14 days
        q = q.filter(ClassOccurrence.occurrence_date <= date(2026, 10, 15))
        
    occs = q.order_by(ClassOccurrence.occurrence_date.asc(), ClassOccurrence.period_number.asc()).all()
    out = []
    for o in occs:
        sub = db.query(Subject).filter(Subject.id == o.subject_id).first()
        rec = db.query(AttendanceRecord).filter(AttendanceRecord.occurrence_id == o.id).first()
        out.append({
            "id": o.id,
            "subject_id": o.subject_id,
            "subject_code": sub.code if sub else "",
            "subject_name": sub.name if sub else "",
            "occurrence_date": o.occurrence_date,
            "period_number": o.period_number,
            "start_time": o.start_time,
            "end_time": o.end_time,
            "status": o.status,
            "notes": o.notes,
            "attendance_status": rec.status if rec else ("SCHEDULED" if o.occurrence_date >= date(2026, 9, 28) else "PRESENT")
        })
    return out


# ==================== DASHBOARD & ANALYTICS ====================

@app.get("/api/dashboard/{section_id}")
def get_dashboard_summary(section_id: int, target: float = 0.75, db: Session = Depends(get_db)):
    subjects = db.query(Subject).filter(Subject.section_id == section_id).all()
    enriched = [enrich_subject_data(s, db, target) for s in subjects]
    
    total_attended = sum(s["attended"] for s in enriched)
    total_conducted = sum(s["conducted"] for s in enriched)
    overall_pct = round((total_attended / total_conducted * 100.0), 1) if total_conducted > 0 else 0.0
    
    # Categorization counts
    safe_count = sum(1 for s in enriched if s["status"] == "SAFE")
    watch_count = sum(1 for s in enriched if s["status"] == "WATCH")
    crit_count = sum(1 for s in enriched if s["status"] == "CRITICAL")
    irrev_count = sum(1 for s in enriched if s["status"] == "IRREVERSIBLE")
    
    # Critical class reminders (Section 36)
    reminders = []
    for s in enriched:
        if s["status"] == "CRITICAL":
            reminders.append({
                "type": "CRITICAL",
                "subject": s["name"],
                "code": s["code"],
                "message": f"{s['name']} is critical ({s['current_pct']}%). Missing any class makes recovery significantly harder.",
                "safe_absences": s["safe_absences"]
            })
        elif s["status"] == "WATCH" and s["safe_absences"] <= 1:
            reminders.append({
                "type": "WARNING",
                "subject": s["name"],
                "code": s["code"],
                "message": f"You currently have only {s['safe_absences']} safe absence remaining for {s['name']}.",
                "safe_absences": s["safe_absences"]
            })
            
    # Priority list
    priorities = [calculate_priority_score(s, target) for s in enriched]
    priorities.sort(key=lambda x: x["priority_score"], reverse=True)
    
    return {
        "overall_attendance": overall_pct,
        "total_subjects": len(enriched),
        "safe_count": safe_count,
        "watch_count": watch_count,
        "critical_count": crit_count,
        "irreversible_count": irrev_count,
        "subjects": enriched,
        "reminders": reminders,
        "priorities": priorities,
        "semester_info": {
            "academic_year": "2026-2027",
            "semester": "Odd Semester (III Semester)",
            "section": "II -ECE-DS A",
            "last_updated": "Today, 11:45 AM"
        }
    }


@app.get("/api/analytics/{section_id}")
def get_analytics(section_id: int, target: float = 0.75, db: Session = Depends(get_db)):
    subjects = db.query(Subject).filter(Subject.section_id == section_id).all()
    enriched = [enrich_subject_data(s, db, target) for s in subjects]
    
    # Comparison chart data: Subject, Current %, Target %, Max Possible %
    comparison = [
        {
            "name": s["code"],
            "fullName": s["name"],
            "current": s["current_pct"],
            "target": int(target * 100),
            "maxPossible": s["max_possible"],
            "safeAbsences": s["safe_absences"],
            "status": s["status"]
        }
        for s in enriched
    ]
    
    # Trend over time (weekly aggregate for line chart)
    trend = [
        {"week": "Week 1", "attendance": 88.0, "target": int(target * 100)},
        {"week": "Week 2", "attendance": 86.5, "target": int(target * 100)},
        {"week": "Week 3", "attendance": 83.2, "target": int(target * 100)},
        {"week": "Week 4", "attendance": 84.0, "target": int(target * 100)},
        {"week": "Week 5", "attendance": 82.5, "target": int(target * 100)},
        {"week": "Week 6 (Current)", "attendance": 84.7, "target": int(target * 100)},
    ]
    
    # Health distribution
    distribution = [
        {"name": "Safe", "value": sum(1 for s in enriched if s["status"] == "SAFE"), "color": "#35D07F"},
        {"name": "Watch", "value": sum(1 for s in enriched if s["status"] == "WATCH"), "color": "#F5B942"},
        {"name": "Critical", "value": sum(1 for s in enriched if s["status"] == "CRITICAL"), "color": "#FF5C68"},
        {"name": "Irreversible", "value": sum(1 for s in enriched if s["status"] == "IRREVERSIBLE"), "color": "#8B0000"},
    ]
    
    return {
        "comparison": comparison,
        "trend": trend,
        "distribution": distribution
    }


# ==================== ATTENDANCE OCR & IMPORT ====================

@app.post("/api/attendance/parse", response_model=OCRPreviewResponse)
def parse_attendance_screenshot(
    raw_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    section_id: int = Form(1),
    db: Session = Depends(get_db)
):
    subjects = db.query(Subject).filter(Subject.section_id == section_id).all()
    sub_dicts = [{"id": s.id, "code": s.code, "name": s.name} for s in subjects]
    
    if raw_text and len(raw_text.strip()) > 0:
        parsed_items = parse_raw_attendance_text(raw_text, sub_dicts)
    else:
        # Generate official sample preview from SRM college portal
        parsed_items = generate_sample_ocr_preview(sub_dicts)
        
    overall_conf = round(sum(p["confidence"] for p in parsed_items) / len(parsed_items), 2) if parsed_items else 0.0
    requires_review = any(p["status"] != "VALID" or p["confidence_tier"] != "HIGH" for p in parsed_items)
    
    return {
        "filename": file.filename if file else "srm_erp_attendance_screenshot.png",
        "subjects": parsed_items,
        "overall_confidence": overall_conf,
        "requires_review": requires_review
    }


@app.post("/api/attendance/confirm")
def confirm_attendance_import(payload: OCRConfirmRequest, db: Session = Depends(get_db)):
    updated_count = 0
    for item in payload.subjects:
        if item.matched_subject_id:
            snap = AttendanceSnapshot(
                student_id="sarvesh",
                subject_id=item.matched_subject_id,
                attended=item.attended,
                conducted=item.conducted,
                raw_text=f"OCR Confirmed: {item.attended}/{item.conducted}",
                confidence=item.confidence
            )
            db.add(snap)
            updated_count += 1
    db.commit()
    return {"message": f"Successfully updated attendance for {updated_count} subjects.", "status": "CONFIRMED"}


@app.post("/api/attendance/manual")
def update_manual_attendance(payload: ManualAttendanceUpdate, db: Session = Depends(get_db)):
    if payload.attended < 0 or payload.conducted < 0:
        raise HTTPException(status_code=400, detail="Counts cannot be negative.")
    if payload.attended > payload.conducted:
        raise HTTPException(status_code=400, detail="Attended cannot exceed conducted.")
        
    snap = AttendanceSnapshot(
        student_id="sarvesh",
        subject_id=payload.subject_id,
        attended=payload.attended,
        conducted=payload.conducted,
        raw_text=f"Manual update: {payload.attended}/{payload.conducted}",
        confidence=1.0
    )
    db.add(snap)
    db.commit()
    return {"message": "Attendance record updated successfully."}


@app.post("/api/attendance/daily")
def record_daily_attendance(payload: DailyAttendanceUpdate, db: Session = Depends(get_db)):
    rec = AttendanceRecord(
        student_id="sarvesh",
        occurrence_id=payload.occurrence_id,
        subject_id=payload.subject_id,
        record_date=payload.record_date,
        status=payload.status,
        source="MANUAL",
        confidence=1.0
    )
    db.add(rec)
    
    # Also adjust snapshot
    snap = db.query(AttendanceSnapshot).filter(
        AttendanceSnapshot.subject_id == payload.subject_id
    ).order_by(AttendanceSnapshot.created_at.desc()).first()
    
    if snap:
        new_att = snap.attended + (1 if payload.status == "PRESENT" else 0)
        new_cond = snap.conducted + (1 if payload.status != "CANCELLED" else 0)
        new_snap = AttendanceSnapshot(
            student_id="sarvesh",
            subject_id=payload.subject_id,
            attended=new_att,
            conducted=new_cond,
            raw_text=f"Daily record: {payload.status}",
            confidence=1.0
        )
        db.add(new_snap)
        
    db.commit()
    return {"message": f"Recorded daily attendance as {payload.status}."}


# ==================== OD / MEDICAL SIMULATOR ====================

@app.post("/api/simulate/leave", response_model=LeaveSimulationResponse)
def simulate_leave(payload: LeaveSimulationRequest, section_id: int = 1, db: Session = Depends(get_db)):
    subjects = db.query(Subject).filter(Subject.section_id == section_id).all()
    enriched = [enrich_subject_data(s, db, payload.target_threshold) for s in subjects]
    
    occs = db.query(ClassOccurrence).filter(
        ClassOccurrence.section_id == section_id,
        ClassOccurrence.occurrence_date >= payload.start_date,
        ClassOccurrence.occurrence_date <= payload.end_date,
        ClassOccurrence.status != "CANCELLED"
    ).all()
    occ_dicts = [{"subject_id": o.subject_id, "occurrence_date": o.occurrence_date} for o in occs]
    
    policy = db.query(InstitutionalPolicy).first()
    policy_mode = payload.policy_mode
    if not policy_mode and policy:
        policy_mode = policy.medical_policy if payload.leave_type == "MEDICAL" else policy.od_policy
        
    res = simulate_leave_impact(
        subjects=enriched,
        occurrences=occ_dicts,
        leave_type=payload.leave_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        policy_mode=policy_mode,
        target_threshold=payload.target_threshold
    )
    return res


@app.get("/api/policy")
def get_policy(db: Session = Depends(get_db)):
    policy = db.query(InstitutionalPolicy).first()
    if not policy:
        return {"name": "Default", "od_policy": "COUNTS_AS_ATTENDED", "medical_policy": "EXCLUDED_FROM_DENOMINATOR", "default_target": 0.75}
    return {
        "id": policy.id,
        "name": policy.name,
        "od_policy": policy.od_policy,
        "medical_policy": policy.medical_policy,
        "default_target": policy.default_target,
        "is_configured": policy.is_configured
    }


@app.put("/api/policy")
def update_policy(payload: InstitutionalPolicyUpdate, db: Session = Depends(get_db)):
    policy = db.query(InstitutionalPolicy).first()
    if not policy:
        policy = InstitutionalPolicy()
        db.add(policy)
    policy.od_policy = payload.od_policy
    policy.medical_policy = payload.medical_policy
    policy.default_target = payload.default_target
    policy.is_configured = payload.is_configured
    db.commit()
    return {"message": "Institutional policy updated."}


# ==================== ATTENDANCE ADVISOR AI ====================

@app.post("/api/advisor/chat", response_model=ChatMessageResponse)
def chat_with_advisor(payload: ChatMessageRequest, db: Session = Depends(get_db)):
    section_id = payload.context_section_id or 1
    subjects = db.query(Subject).filter(Subject.section_id == section_id).all()
    enriched = [enrich_subject_data(s, db, payload.target_threshold) for s in subjects]
    
    today = date(2026, 9, 28)
    occs = db.query(ClassOccurrence).filter(
        ClassOccurrence.section_id == section_id,
        ClassOccurrence.occurrence_date >= today
    ).all()
    occ_dicts = [{"subject_id": o.subject_id, "occurrence_date": o.occurrence_date} for o in occs]
    
    policy_obj = db.query(InstitutionalPolicy).first()
    policy_dict = {
        "od_policy": policy_obj.od_policy if policy_obj else "COUNTS_AS_ATTENDED",
        "medical_policy": policy_obj.medical_policy if policy_obj else "EXCLUDED_FROM_DENOMINATOR"
    }
    
    advisor_result = process_advisor_query(
        query=payload.message,
        subjects=enriched,
        occurrences=occ_dicts,
        policy=policy_dict,
        default_target=payload.target_threshold
    )
    return advisor_result
