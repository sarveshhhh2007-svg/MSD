"""
Pydantic Schemas for API Requests and Responses
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import date, datetime


class SubjectBase(BaseModel):
    code: str
    name: str
    credit: str
    slot_code: Optional[str] = None
    attendance_unit: str = "PERIOD"
    periods_per_week: int = 3
    faculty_name: Optional[str] = None
    faculty_dept: Optional[str] = None


class SubjectOut(SubjectBase):
    id: int
    section_id: int
    attended: int = 0
    conducted: int = 0
    remaining: int = 0
    current_pct: Optional[float] = None
    status: str = "SAFE"
    safe_absences: int = 0
    required: int = 0
    min_future_to_maintain: int = 0
    max_possible: float = 100.0
    is_irreversible: bool = False
    badge_color: str = "SAFE"
    multi_targets: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class SectionOut(BaseModel):
    id: int
    name: str
    department: str
    year: str
    semester: str
    academic_year: str
    venue: str
    active: bool

    class Config:
        from_attributes = True


class TimetableEntryOut(BaseModel):
    id: int
    day_of_week: str
    period_number: int
    start_time: str
    end_time: str
    slot_code: Optional[str] = None
    room: str
    class_type: str
    subject_code: Optional[str] = None
    subject_name: Optional[str] = None

    class Config:
        from_attributes = True


class ClassOccurrenceOut(BaseModel):
    id: int
    subject_id: int
    subject_code: str
    subject_name: str
    occurrence_date: date
    period_number: int
    start_time: str
    end_time: str
    status: str
    notes: Optional[str] = None
    attendance_status: Optional[str] = None

    class Config:
        from_attributes = True


class DailyAttendanceUpdate(BaseModel):
    subject_id: int
    record_date: date
    status: str  # PRESENT, ABSENT, OD, MEDICAL, CANCELLED
    notes: Optional[str] = None
    occurrence_id: Optional[int] = None


class ManualAttendanceUpdate(BaseModel):
    subject_id: int
    attended: int
    conducted: int


class OCRSubjectPreview(BaseModel):
    raw_subject: str
    matched_subject_id: Optional[int] = None
    matched_subject_code: Optional[str] = None
    matched_subject_name: Optional[str] = None
    attended: int
    conducted: int
    confidence: float
    confidence_tier: str  # HIGH (>=90%), MEDIUM (70-89%), LOW (<70%)
    status: str           # VALID, REVIEW_REQUIRED, INVALID
    validation_error: Optional[str] = None


class OCRPreviewResponse(BaseModel):
    filename: str
    subjects: List[OCRSubjectPreview]
    overall_confidence: float
    requires_review: bool


class OCRConfirmRequest(BaseModel):
    subjects: List[OCRSubjectPreview]


class LeaveSimulationRequest(BaseModel):
    leave_type: str  # "OD" or "MEDICAL"
    start_date: date
    end_date: date
    policy_mode: Optional[str] = None  # COUNTS_AS_ATTENDED, EXCLUDED_FROM_DENOMINATOR, COUNTS_AS_ABSENT
    target_threshold: float = 0.75


class SimulatedSubjectImpact(BaseModel):
    subject_id: int
    subject_code: str
    subject_name: str
    affected_classes: int
    current_attended: int
    current_conducted: int
    current_pct: Optional[float]
    simulated_attended: int
    simulated_conducted: int
    simulated_pct: float
    current_safe_absences: int
    simulated_safe_absences: int
    status_before: str
    status_after: str
    badge_color_after: str
    is_irreversible_after: bool
    recovery_needed: int
    note: str


class LeaveSimulationResponse(BaseModel):
    leave_type: str
    policy_used: str
    start_date: date
    end_date: date
    total_affected_classes: int
    overall_attendance_before: float
    overall_attendance_after: float
    status_summary: Dict[str, int]
    subjects: List[SimulatedSubjectImpact]
    policy_warning: Optional[str] = None


class InstitutionalPolicyUpdate(BaseModel):
    od_policy: str
    medical_policy: str
    default_target: float = 0.75
    is_configured: bool = True


class ChatMessageRequest(BaseModel):
    message: str
    context_section_id: Optional[int] = None
    target_threshold: float = 0.75


class ChatToolExecution(BaseModel):
    tool_name: str
    input_args: Dict[str, Any]
    output_result: Dict[str, Any]


class ChatMessageResponse(BaseModel):
    user_query: str
    detected_intent: str
    tool_calls: List[ChatToolExecution]
    ai_response: str
    structured_data: Optional[Dict[str, Any]] = None


# ==================== ROOM OCCUPANCY & AI ROOM FINDER SCHEMAS ====================

class RoomOut(BaseModel):
    id: int
    room_number: str
    building: str
    floor: int
    floor_name: str
    capacity: Optional[int] = None
    has_ac: Optional[bool] = None
    has_projector: Optional[bool] = None
    room_type: str = "CLASSROOM"
    status: str = "ACTIVE"

    class Config:
        from_attributes = True


class RoomAvailabilityOut(BaseModel):
    id: int
    room_number: str
    building: str
    floor: int
    floor_name: str
    capacity: Optional[int] = None
    has_ac: Optional[bool] = None
    has_projector: Optional[bool] = None
    room_type: str = "CLASSROOM"
    status: str  # "AVAILABLE" or "OCCUPIED"
    conflicts: List[Dict[str, Any]] = []
    current_class: Optional[Dict[str, Any]] = None


class FloorRoomsOut(BaseModel):
    floor_number: int
    floor_name: str
    rooms: List[RoomAvailabilityOut]


class FloorGridResponse(BaseModel):
    target_date: str
    query_time: str
    interval: str
    last_updated: str
    total_rooms: int
    available_count: int
    occupied_count: int
    floors: List[FloorRoomsOut]


class RoomSearchQuery(BaseModel):
    date: Optional[date] = None
    start_time: str = "14:00"
    end_time: str = "16:00"
    floor: Optional[int] = None
    building: Optional[str] = None
    requires_ac: Optional[bool] = None
    minimum_capacity: Optional[int] = None
    requires_lab: Optional[bool] = None
    room_type: Optional[str] = None
    proximity_room: Optional[str] = None


class AIRoomSearchRequest(BaseModel):
    query: str
    current_time: Optional[str] = None
    current_date: Optional[date] = None


class AIRoomSearchResponse(BaseModel):
    query: str
    parsed_constraints: Dict[str, Any]
    verified_matches: List[Dict[str, Any]]
    near_matches: List[Dict[str, Any]]
    explanation: str
    timestamp: str

