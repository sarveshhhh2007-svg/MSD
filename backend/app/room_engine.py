"""
Room Occupancy Engine & AI Room Finder Service
Deterministic campus room availability and natural-language constraint matching.
"""

from datetime import datetime, date, time, timedelta
import re
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.models import Room, TimetableEntry, ClassOccurrence, Subject, Section


# Pre-defined Room Metadata extracted from Timetable PDFs
OFFICIAL_ROOMS_CATALOG = [
    # GROUND FLOOR (Floor 0)
    {"room_number": "IST 101", "building": "IST Building", "floor": 0, "floor_name": "GROUND FLOOR", "capacity": 60, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "IST 102", "building": "IST Building", "floor": 0, "floor_name": "GROUND FLOOR", "capacity": 50, "has_ac": False, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "IST 103", "building": "IST Building", "floor": 0, "floor_name": "GROUND FLOOR", "capacity": 40, "has_ac": None, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "IST 104", "building": "IST Building", "floor": 0, "floor_name": "GROUND FLOOR", "capacity": 45, "has_ac": True, "has_projector": False, "room_type": "CLASSROOM"},
    {"room_number": "IST 106", "building": "IST Building", "floor": 0, "floor_name": "GROUND FLOOR", "capacity": 60, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "IST 108", "building": "IST Building", "floor": 0, "floor_name": "GROUND FLOOR", "capacity": 45, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "TB-106", "building": "Tech Block", "floor": 0, "floor_name": "GROUND FLOOR", "capacity": 60, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "MPMC LAB-107", "building": "IST Building", "floor": 0, "floor_name": "GROUND FLOOR", "capacity": 35, "has_ac": True, "has_projector": True, "room_type": "LAB"},
    {"room_number": "LAB -309/107", "building": "IST Building", "floor": 0, "floor_name": "GROUND FLOOR", "capacity": 30, "has_ac": None, "has_projector": True, "room_type": "LAB"},
    {"room_number": "Workshop", "building": "Mechanical Workshop", "floor": 0, "floor_name": "GROUND FLOOR", "capacity": 50, "has_ac": False, "has_projector": False, "room_type": "LAB"},

    # FIRST FLOOR (Floor 1)
    {"room_number": "IST 201", "building": "IST Building", "floor": 1, "floor_name": "FIRST FLOOR", "capacity": 60, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "IST 211", "building": "IST Building", "floor": 1, "floor_name": "FIRST FLOOR", "capacity": 55, "has_ac": None, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "IST 225", "building": "IST Building", "floor": 1, "floor_name": "FIRST FLOOR", "capacity": 60, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "IST 227", "building": "IST Building", "floor": 1, "floor_name": "FIRST FLOOR", "capacity": 50, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "Che Lab", "building": "IST Building", "floor": 1, "floor_name": "FIRST FLOOR", "capacity": 40, "has_ac": False, "has_projector": True, "room_type": "LAB"},
    {"room_number": "PPS Lab", "building": "IST Building", "floor": 1, "floor_name": "FIRST FLOOR", "capacity": 40, "has_ac": True, "has_projector": True, "room_type": "LAB"},
    {"room_number": "DLMS Lab", "building": "IST Building", "floor": 1, "floor_name": "FIRST FLOOR", "capacity": 35, "has_ac": True, "has_projector": True, "room_type": "LAB"},

    # SECOND FLOOR (Floor 2)
    {"room_number": "IST 301", "building": "IST Building", "floor": 2, "floor_name": "SECOND FLOOR", "capacity": 60, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "IST 305", "building": "IST Building", "floor": 2, "floor_name": "SECOND FLOOR", "capacity": 50, "has_ac": False, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "IST 309", "building": "IST Building", "floor": 2, "floor_name": "SECOND FLOOR", "capacity": 35, "has_ac": True, "has_projector": True, "room_type": "LAB"},
    {"room_number": "PCB Lab", "building": "IST Building", "floor": 2, "floor_name": "SECOND FLOOR", "capacity": 30, "has_ac": True, "has_projector": True, "room_type": "LAB"},
    {"room_number": "BIO DSP LAB", "building": "IST Building", "floor": 2, "floor_name": "SECOND FLOOR", "capacity": 30, "has_ac": True, "has_projector": True, "room_type": "LAB"},

    # THIRD FLOOR (Floor 3)
    {"room_number": "IST 401", "building": "IST Building", "floor": 3, "floor_name": "THIRD FLOOR", "capacity": 60, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "IST 411", "building": "IST Building", "floor": 3, "floor_name": "THIRD FLOOR", "capacity": 55, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "IST 416", "building": "IST Building", "floor": 3, "floor_name": "THIRD FLOOR", "capacity": 65, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},

    # FOURTH FLOOR (Floor 4)
    {"room_number": "IST 502", "building": "IST Building", "floor": 4, "floor_name": "FOURTH FLOOR", "capacity": 60, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "IST 510", "building": "IST Building", "floor": 4, "floor_name": "FOURTH FLOOR", "capacity": 55, "has_ac": None, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "IST 518", "building": "IST Building", "floor": 4, "floor_name": "FOURTH FLOOR", "capacity": 60, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "IST 519", "building": "IST Building", "floor": 4, "floor_name": "FOURTH FLOOR", "capacity": 50, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "IST 520", "building": "IST Building", "floor": 4, "floor_name": "FOURTH FLOOR", "capacity": 60, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},

    # FIFTH FLOOR (Floor 5)
    {"room_number": "IST 602", "building": "IST Building", "floor": 5, "floor_name": "FIFTH FLOOR", "capacity": 60, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "IST 609", "building": "IST Building", "floor": 5, "floor_name": "FIFTH FLOOR", "capacity": 50, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "IST 625", "building": "IST Building", "floor": 5, "floor_name": "FIFTH FLOOR", "capacity": 55, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "IST 626", "building": "IST Building", "floor": 5, "floor_name": "FIFTH FLOOR", "capacity": 60, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},

    # SIXTH FLOOR (Floor 6)
    {"room_number": "IST 702", "building": "IST Building", "floor": 6, "floor_name": "SIXTH FLOOR", "capacity": 65, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},
    {"room_number": "IST 710", "building": "IST Building", "floor": 6, "floor_name": "SIXTH FLOOR", "capacity": 60, "has_ac": True, "has_projector": True, "room_type": "CLASSROOM"},
]


def seed_rooms_if_empty(db: Session):
    """Initializes the rooms table if empty."""
    if db.query(Room).count() == 0:
        for r_data in OFFICIAL_ROOMS_CATALOG:
            room = Room(
                room_number=r_data["room_number"],
                building=r_data["building"],
                floor=r_data["floor"],
                floor_name=r_data["floor_name"],
                capacity=r_data["capacity"],
                has_ac=r_data["has_ac"],
                has_projector=r_data["has_projector"],
                room_type=r_data["room_type"],
                status="ACTIVE",
            )
            db.add(room)
        db.commit()


def time_to_minutes(time_str: str) -> int:
    """Converts '09:00' or '14:30' to minutes from midnight."""
    clean = time_str.strip().upper()
    # Check 12-hour format e.g. '2:00 PM'
    match_12 = re.match(r"^(\d{1,2}):(\d{2})\s*(AM|PM)?$", clean)
    if match_12:
        hour = int(match_12.group(1))
        minute = int(match_12.group(2))
        meridiem = match_12.group(3)
        if meridiem == "PM" and hour < 12:
            hour += 12
        elif meridiem == "AM" and hour == 12:
            hour = 0
        return hour * 60 + minute

    # Fallback to simple split
    parts = clean.split(":")
    return int(parts[0]) * 60 + int(parts[1])


def minutes_to_time_str(minutes: int) -> str:
    """Converts minutes from midnight to HH:MM format."""
    h = minutes // 60
    m = minutes % 60
    return f"{h:02d}:{m:02d}"


def intervals_overlap(start1: str, end1: str, start2: str, end2: str) -> bool:
    """Returns True if [start1, end1] overlaps with [start2, end2]."""
    s1, e1 = time_to_minutes(start1), time_to_minutes(end1)
    s2, e2 = time_to_minutes(start2), time_to_minutes(end2)
    return max(s1, s2) < min(e1, e2)


def normalize_room_name(name: str) -> str:
    """Normalizes room names for consistent matching (e.g. G-602 -> IST 602)."""
    n = name.strip()
    if n.startswith("G-"):
        return f"IST {n[2:]}"
    if n.startswith("IST") and not n.startswith("IST "):
        return f"IST {n[3:]}"
    return n


def check_room_occupancy_at_interval(
    db: Session,
    room_number: str,
    target_date: date,
    start_time: str,
    end_time: str
) -> Dict[str, Any]:
    """
    Deterministic room occupancy engine.
    Checks all timetable entries and class occurrences.
    If ANY scheduled class overlaps [start_time, end_time], returns OCCUPIED.
    Full-duration validation: Must be free for the ENTIRE interval.
    """
    day_name = target_date.strftime("%A")
    norm_room = normalize_room_name(room_number)

    # 1. Query Timetable entries matching this room on this day of week
    entries = db.query(TimetableEntry).filter(
        or_(
            TimetableEntry.room == room_number,
            TimetableEntry.room == norm_room,
            TimetableEntry.room.ilike(f"%{norm_room}%")
        ),
        TimetableEntry.day_of_week == day_name
    ).all()

    conflicting_entries = []
    for e in entries:
        if intervals_overlap(start_time, end_time, e.start_time, e.end_time):
            # Check if this occurrence was cancelled for the target date
            cancelled = db.query(ClassOccurrence).filter(
                ClassOccurrence.subject_id == e.subject_id,
                ClassOccurrence.occurrence_date == target_date,
                ClassOccurrence.period_number == e.period_number,
                ClassOccurrence.status == "CANCELLED"
            ).first()
            if not cancelled:
                subj = db.query(Subject).filter(Subject.id == e.subject_id).first()
                sec = db.query(Section).filter(Section.id == e.section_id).first()
                conflicting_entries.append({
                    "period_number": e.period_number,
                    "start_time": e.start_time,
                    "end_time": e.end_time,
                    "subject_name": subj.name if subj else "Academic Class",
                    "subject_code": subj.code if subj else "",
                    "section_name": sec.name if sec else "",
                    "class_type": e.class_type
                })

    is_occupied = len(conflicting_entries) > 0
    return {
        "room_number": room_number,
        "date": target_date.isoformat(),
        "day_of_week": day_name,
        "queried_interval": f"{start_time} - {end_time}",
        "status": "OCCUPIED" if is_occupied else "AVAILABLE",
        "conflicts": conflicting_entries,
        "is_available": not is_occupied
    }


def get_floor_grid_status(
    db: Session,
    target_date: Optional[date] = None,
    current_time_str: Optional[str] = None,
    building: Optional[str] = None,
    floor: Optional[int] = None
) -> Dict[str, Any]:
    """
    Returns floor-by-floor room availability at a specific instant or interval.
    If no time is provided, defaults to 50-minute current window or next period.
    """
    seed_rooms_if_empty(db)

    if not target_date:
        target_date = date(2026, 9, 28)

    if not current_time_str:
        current_time_str = "10:42"

    # Evaluate for 1 hour duration or standard period length
    start_minutes = time_to_minutes(current_time_str)
    end_minutes = start_minutes + 50
    start_time = minutes_to_time_str(start_minutes)
    end_time = minutes_to_time_str(end_minutes)

    q = db.query(Room).filter(Room.status == "ACTIVE")
    if building and building != "ALL":
        q = q.filter(Room.building.ilike(f"%{building}%"))
    if floor is not None:
        q = q.filter(Room.floor == floor)

    rooms = q.order_by(Room.floor.asc(), Room.room_number.asc()).all()

    floors_map: Dict[int, Dict[str, Any]] = {}
    total_rooms = 0
    available_rooms_count = 0
    occupied_rooms_count = 0

    for r in rooms:
        total_rooms += 1
        occ = check_room_occupancy_at_interval(db, r.room_number, target_date, start_time, end_time)
        status = occ["status"]
        if status == "AVAILABLE":
            available_rooms_count += 1
        else:
            occupied_rooms_count += 1

        room_card = {
            "id": r.id,
            "room_number": r.room_number,
            "building": r.building,
            "floor": r.floor,
            "floor_name": r.floor_name,
            "capacity": r.capacity,
            "has_ac": r.has_ac,
            "has_projector": r.has_projector,
            "room_type": r.room_type,
            "status": status,  # "AVAILABLE" or "OCCUPIED"
            "conflicts": occ["conflicts"],
            "current_class": occ["conflicts"][0] if occ["conflicts"] else None
        }

        if r.floor not in floors_map:
            floors_map[r.floor] = {
                "floor_number": r.floor,
                "floor_name": r.floor_name,
                "rooms": []
            }
        floors_map[r.floor]["rooms"].append(room_card)

    return {
        "target_date": target_date.isoformat(),
        "query_time": current_time_str,
        "interval": f"{start_time} - {end_time}",
        "last_updated": datetime.now().strftime("%I:%M:%S %p"),
        "total_rooms": total_rooms,
        "available_count": available_rooms_count,
        "occupied_count": occupied_rooms_count,
        "floors": sorted(list(floors_map.values()), key=lambda x: x["floor_number"])
    }


def deterministic_room_search(
    db: Session,
    target_date: date,
    start_time: str,
    end_time: str,
    floor: Optional[int] = None,
    building: Optional[str] = None,
    requires_ac: Optional[bool] = None,
    minimum_capacity: Optional[int] = None,
    requires_lab: Optional[bool] = None,
    room_type: Optional[str] = None,
    proximity_room: Optional[str] = None
) -> Dict[str, Any]:
    """
    Deterministic room search with strict full-duration availability checking.
    """
    seed_rooms_if_empty(db)

    # 1. Base query with metadata filtering
    q = db.query(Room).filter(Room.status == "ACTIVE")

    if building and building != "ALL":
        q = q.filter(Room.building.ilike(f"%{building}%"))

    if floor is not None:
        q = q.filter(Room.floor == floor)

    if requires_ac is True:
        q = q.filter(Room.has_ac == True)

    if minimum_capacity is not None:
        q = q.filter(Room.capacity >= minimum_capacity)

    if requires_lab is True:
        q = q.filter(Room.room_type == "LAB")
    elif room_type:
        q = q.filter(Room.room_type == room_type.upper())

    candidate_rooms = q.all()

    # If proximity room is requested, sort candidates by proximity to that room's floor
    if proximity_room:
        prox_r = db.query(Room).filter(Room.room_number.ilike(f"%{proximity_room}%")).first()
        if prox_r:
            candidate_rooms.sort(key=lambda r: abs(r.floor - prox_r.floor))

    exact_matches = []
    near_matches = []

    for r in candidate_rooms:
        occ = check_room_occupancy_at_interval(db, r.room_number, target_date, start_time, end_time)
        if occ["status"] == "AVAILABLE":
            exact_matches.append({
                "id": r.id,
                "room_number": r.room_number,
                "building": r.building,
                "floor": r.floor,
                "floor_name": r.floor_name,
                "capacity": r.capacity,
                "has_ac": r.has_ac,
                "has_projector": r.has_projector,
                "room_type": r.room_type,
                "status": "AVAILABLE",
                "available_window": f"{start_time} - {end_time}"
            })

    # If no exact matches, find near matches with relaxed constraints (e.g. relaxing AC or floor)
    if not exact_matches:
        relaxed_candidates = db.query(Room).filter(Room.status == "ACTIVE").all()
        for r in relaxed_candidates:
            occ = check_room_occupancy_at_interval(db, r.room_number, target_date, start_time, end_time)
            if occ["status"] == "AVAILABLE":
                reasons = []
                if floor is not None and r.floor != floor:
                    reasons.append(f"On {r.floor_name} instead of Floor {floor}")
                if requires_ac is True and r.has_ac is not True:
                    reasons.append("Non-AC room")
                if minimum_capacity is not None and (r.capacity or 0) < minimum_capacity:
                    reasons.append(f"Capacity {r.capacity} < requested {minimum_capacity}")
                near_matches.append({
                    "id": r.id,
                    "room_number": r.room_number,
                    "building": r.building,
                    "floor": r.floor,
                    "floor_name": r.floor_name,
                    "capacity": r.capacity,
                    "has_ac": r.has_ac,
                    "has_projector": r.has_projector,
                    "room_type": r.room_type,
                    "status": "AVAILABLE",
                    "note": ", ".join(reasons) if reasons else "Alternative Option"
                })
        near_matches = near_matches[:4]

    return {
        "date": target_date.isoformat(),
        "start_time": start_time,
        "end_time": end_time,
        "matches_count": len(exact_matches),
        "matches": exact_matches,
        "near_matches": near_matches
    }


def parse_natural_language_room_query(
    query: str,
    base_date: Optional[date] = None,
    base_time: Optional[str] = None
) -> Dict[str, Any]:
    """
    AI Intent & Constraint Parser.
    Extracts structured constraints from natural student requests without hallucinating.
    """
    if not base_date:
        base_date = date(2026, 9, 28)
    if not base_time:
        base_time = "14:00"

    q_lower = query.lower()

    # 1. Floor parsing
    floor = None
    if "ground floor" in q_lower or "ground" in q_lower or "floor 0" in q_lower:
        floor = 0
    elif "1st floor" in q_lower or "first floor" in q_lower:
        floor = 1
    elif "2nd floor" in q_lower or "second floor" in q_lower:
        floor = 2
    elif "3rd floor" in q_lower or "third floor" in q_lower:
        floor = 3
    elif "4th floor" in q_lower or "fourth floor" in q_lower:
        floor = 4
    elif "5th floor" in q_lower or "fifth floor" in q_lower:
        floor = 5
    elif "6th floor" in q_lower or "sixth floor" in q_lower:
        floor = 6

    # 2. AC parsing
    requires_ac = None
    if "ac" in q_lower or "air condition" in q_lower or "air-condition" in q_lower:
        requires_ac = True

    # 3. Lab parsing
    requires_lab = None
    if "lab" in q_lower or "laboratory" in q_lower:
        requires_lab = True

    # 4. Capacity parsing
    capacity = None
    cap_match = re.search(r"(\d+)\s*(people|students|members|seats|person)", q_lower)
    if cap_match:
        capacity = int(cap_match.group(1))
    elif "team" in q_lower:
        capacity = 10  # default team minimum

    # 5. Proximity room parsing
    proximity_room = None
    prox_match = re.search(r"(near|close to|around)\s*(ist\s*\d+|tb-\d+|g-\d+)", q_lower)
    if prox_match:
        proximity_room = prox_match.group(2).upper()

    # 6. Time and Duration parsing
    start_time = base_time
    duration_minutes = 60  # Default 1 hour

    # Check "for the next 2 hours", "next 3 hours", "next hour"
    dur_match = re.search(r"next\s*(\d+)?\s*(hour|hours|hr|hrs)", q_lower)
    if dur_match:
        hours_num = int(dur_match.group(1)) if dur_match.group(1) else 1
        duration_minutes = hours_num * 60
    elif "for 2 hours" in q_lower or "for 2 hr" in q_lower:
        duration_minutes = 120
    elif "for 3 hours" in q_lower:
        duration_minutes = 180

    # Check explicit time interval e.g. "from 2 pm to 4 pm", "2 to 4", "10 to 12"
    range_match = re.search(r"(?:from\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:to|-)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?", q_lower)
    if range_match:
        h1 = int(range_match.group(1))
        m1 = int(range_match.group(2) or 0)
        p1 = range_match.group(3)
        h2 = int(range_match.group(4))
        m2 = int(range_match.group(5) or 0)
        p2 = range_match.group(6)

        if p2 == "pm" and h2 < 12:
            h2 += 12
        if p1 == "pm" and h1 < 12:
            h1 += 12
        elif p2 == "pm" and not p1 and h1 < h2 and h1 <= 12:
            # If "from 2 to 4 pm", then 2 is also PM
            if h1 < 12:
                h1 += 12

        # If user asks e.g. "10 to 12", morning hours
        start_time = f"{h1:02d}:{m1:02d}"
        end_time = f"{h2:02d}:{m2:02d}"
    else:
        # Compute end_time from start_time + duration_minutes
        s_min = time_to_minutes(start_time)
        e_min = s_min + duration_minutes
        end_time = minutes_to_time_str(e_min)

    return {
        "date": base_date.isoformat(),
        "start_time": start_time,
        "end_time": end_time,
        "duration_minutes": duration_minutes,
        "floor": floor,
        "requires_ac": requires_ac,
        "minimum_capacity": capacity,
        "requires_lab": requires_lab,
        "proximity_room": proximity_room,
        "raw_query": query
    }


def execute_ai_room_search(
    db: Session,
    query: str,
    current_time: Optional[str] = None,
    current_date: Optional[date] = None
) -> Dict[str, Any]:
    """
    Executes the full AI Room Finder Pipeline:
    Natural Language -> Intent Parser -> Deterministic Engine -> Verified Results -> Grounded Explanation.
    """
    if not current_date:
        current_date = date(2026, 9, 28)
    if not current_time:
        current_time = "14:00"

    # Step 1: Constraint parsing
    parsed = parse_natural_language_room_query(query, current_date, current_time)

    # Step 2: Deterministic verification
    search_res = deterministic_room_search(
        db=db,
        target_date=current_date,
        start_time=parsed["start_time"],
        end_time=parsed["end_time"],
        floor=parsed["floor"],
        requires_ac=parsed["requires_ac"],
        minimum_capacity=parsed["minimum_capacity"],
        requires_lab=parsed["requires_lab"],
        proximity_room=parsed["proximity_room"]
    )

    matches = search_res["matches"]
    near_matches = search_res["near_matches"]

    # Step 3: Grounded AI Explanation (Section 24)
    if matches:
        fl_str = f"on the {matches[0]['floor_name']}" if parsed["floor"] is not None else "across campus"
        ac_str = "with verified AC availability" if parsed["requires_ac"] else "meeting your setup"
        time_str = f"{parsed['start_time']} – {parsed['end_time']}"

        lines = [f"I found {len(matches)} suitable room{'s' if len(matches) > 1 else ''} {fl_str} {ac_str}, fully free for the complete period ({time_str}):"]
        for m in matches[:4]:
            cap_info = f" — {m['capacity']} seats" if m['capacity'] else ""
            ac_tag = " [AC Available]" if m['has_ac'] else ""
            lines.append(f"• **{m['room_number']}** ({m['floor_name']}){cap_info}{ac_tag}")

        explanation = "\n".join(lines)
    else:
        explanation = (
            f"No room matches all your requirements for the requested window ({parsed['start_time']} – {parsed['end_time']}).\n\n"
            "You can try:\n"
            "• Selecting a different floor\n"
            "• A shorter duration\n"
            "• Removing the AC requirement\n"
            "• Adjusting the target time"
        )

    return {
        "query": query,
        "parsed_constraints": parsed,
        "verified_matches": matches,
        "near_matches": near_matches,
        "explanation": explanation,
        "timestamp": datetime.now().strftime("%I:%M:%S %p")
    }
