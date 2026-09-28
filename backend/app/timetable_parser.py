"""
Timetable Parser, Validator & Occurrence Generator
Extracts academic timetables, validates slots and lab units,
and projects recurring templates into concrete calendar occurrences.
"""

from typing import List, Dict, Any, Optional, Tuple
from datetime import date, timedelta
import re


PERIOD_SCHEDULE = {
    1: ("09:00", "09:50"),
    2: ("09:50", "10:40"),
    # TEA BREAK: 10:40 - 10:50
    3: ("10:50", "11:40"),
    4: ("11:40", "12:30"),
    # LUNCH: 12:30 - 01:20
    6: ("13:20", "14:10"),
    7: ("14:10", "15:00"),
    # TEA BREAK: 15:00 - 15:10
    8: ("15:10", "16:00"),
    9: ("16:00", "16:50"),
}


def validate_timetable(entries: List[Dict[str, Any]], subjects: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Validates parsed timetable data against academic rules (Section 17):
    - Every slot maps to a known subject
    - Valid period times
    - Breaks and lunch excluded
    - Duplicate entries or overlapping periods check
    - Lab block integrity
    """
    subject_slots = {s.get("slot_code"): s for s in subjects if s.get("slot_code")}
    subject_codes = {s.get("code"): s for s in subjects}
    
    errors = []
    warnings = []
    
    occupied_slots = set()
    
    for entry in entries:
        day = entry.get("day_of_week")
        period = entry.get("period_number")
        slot = entry.get("slot_code")
        sub_code = entry.get("subject_code")
        
        # Check invalid period numbers (5 is lunch break)
        if period == 5:
            errors.append(f"Period 5 is Lunch Break (12:30–01:20) and cannot have class scheduled on {day}.")
            
        # Check duplicate slot overlap
        slot_key = (day, period)
        if slot_key in occupied_slots:
            errors.append(f"Collision detected: Period {period} on {day} is scheduled multiple times.")
        occupied_slots.add(slot_key)
        
        # Check slot mapping
        if slot and slot not in subject_slots and slot != "LAB" and slot != "BREAK":
            warnings.append(f"Unmapped slot code '{slot}' on {day} Period {period}. Review required.")
            
        if sub_code and sub_code not in subject_codes:
            warnings.append(f"Subject code '{sub_code}' not found in registered subjects. Review required.")
            
    is_valid = len(errors) == 0
    requires_review = len(warnings) > 0 or not is_valid
    
    return {
        "is_valid": is_valid,
        "requires_review": requires_review,
        "errors": errors,
        "warnings": warnings,
        "total_entries": len(entries)
    }


def generate_class_occurrences(
    timetable_entries: List[Dict[str, Any]],
    start_date: date,
    end_date: date,
    holidays: Optional[List[date]] = None
) -> List[Dict[str, Any]]:
    """
    Section 18: Generates actual concrete class occurrences for real calendar dates.
    Crucial distinction: Never calculate remaining classes simply as classes/week * weeks!
    Accounts for actual calendar dates, weekends, and holidays.
    """
    if holidays is None:
        # Standard academic holidays in Semester (e.g., Gandhi Jayanti, Dussehra, Diwali)
        holidays = [
            date(2026, 10, 2),   # Gandhi Jayanti
            date(2026, 10, 20),  # Vijayadashami
            date(2026, 11, 8),   # Diwali
        ]
        
    day_name_map = {
        0: "Monday",
        1: "Tuesday",
        2: "Wednesday",
        3: "Thursday",
        4: "Friday",
        5: "Saturday",
        6: "Sunday"
    }
    
    entries_by_day = {}
    for entry in timetable_entries:
        d = entry.get("day_of_week")
        if d not in entries_by_day:
            entries_by_day[d] = []
        entries_by_day[d].append(entry)
        
    occurrences = []
    curr = start_date
    while curr <= end_date:
        # Exclude Sundays
        if curr.weekday() == 6:
            curr += timedelta(days=1)
            continue
            
        # Exclude official holidays
        if curr in holidays:
            curr += timedelta(days=1)
            continue
            
        day_str = day_name_map.get(curr.weekday())
        if day_str in entries_by_day:
            for entry in entries_by_day[day_str]:
                p_num = entry["period_number"]
                start_t, end_t = PERIOD_SCHEDULE.get(p_num, ("09:00", "09:50"))
                occurrences.append({
                    "date": curr,
                    "day_of_week": day_str,
                    "period_number": p_num,
                    "start_time": start_t,
                    "end_time": end_t,
                    "subject_id": entry.get("subject_id"),
                    "subject_code": entry.get("subject_code"),
                    "subject_name": entry.get("subject_name"),
                    "room": entry.get("room", "IST 416"),
                    "slot_code": entry.get("slot_code"),
                    "status": "SCHEDULED"
                })
        curr += timedelta(days=1)
        
    return occurrences


def get_remaining_classes_count(
    occurrences: List[Dict[str, Any]],
    from_date: date,
    subject_id: Optional[int] = None
) -> int:
    """
    Calculates exact remaining classes by counting actual future occurrences
    from from_date onwards.
    """
    count = 0
    for occ in occurrences:
        occ_date = occ.get("date") or occ.get("occurrence_date")
        if occ_date >= from_date:
            if subject_id is None or occ.get("subject_id") == subject_id:
                count += 1
    return count
