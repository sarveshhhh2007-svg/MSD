"""
Deterministic Attendance Mathematical Engine
Authoritative source of truth for all attendance calculations, recovery requirements,
safe absence budgets, and irreversibility determinations.

AI understands. Validation verifies. Deterministic mathematics calculates. AI explains.
"""

from fractions import Fraction
import math
from typing import Dict, Any, Optional, Tuple, List


def to_fraction(target: float) -> Fraction:
    """
    Converts a decimal target (e.g. 0.75, 0.85, 0.90) to an exact Fraction
    to eliminate floating point precision errors.
    """
    if target <= 0:
        return Fraction(0, 1)
    if target >= 1:
        return Fraction(1, 1)
    
    # Common academic targets can be mapped to exact fractions
    target_round = round(target, 4)
    if abs(target_round - 0.75) < 1e-5:
        return Fraction(3, 4)
    if abs(target_round - 0.80) < 1e-5:
        return Fraction(4, 5)
    if abs(target_round - 0.85) < 1e-5:
        return Fraction(17, 20)
    if abs(target_round - 0.90) < 1e-5:
        return Fraction(9, 10)
    if abs(target_round - 0.65) < 1e-5:
        return Fraction(13, 20)
    
    return Fraction(str(round(target, 4))).limit_denominator(1000)


def calculate_current_attendance(attended: int, conducted: int) -> Optional[float]:
    """
    Calculates current attendance percentage P = A / C.
    If C == 0, attendance is mathematically undefined.
    Rule: Never display 0% when no classes have been conducted.
    """
    if conducted < 0 or attended < 0:
        raise ValueError("Attended and conducted counts must be non-negative integers.")
    if attended > conducted:
        raise ValueError("Attended classes cannot exceed conducted classes.")
    if conducted == 0:
        return None
    return (attended / conducted) * 100.0


def calculate_future_attendance(attended: int, conducted: int, remaining: int, future_attended: int) -> float:
    """
    P_future = (A + x) / (C + R)
    """
    if future_attended < 0 or future_attended > remaining:
        raise ValueError("Future attended classes must be between 0 and remaining classes.")
    total_conducted = conducted + remaining
    if total_conducted == 0:
        return 100.0
    return ((attended + future_attended) / total_conducted) * 100.0


def calculate_max_possible_attendance(attended: int, conducted: int, remaining: int) -> float:
    """
    Assuming student attends every remaining class:
    P_max = (A + R) / (C + R)
    """
    total = conducted + remaining
    if total == 0:
        return 100.0
    return ((attended + remaining) / total) * 100.0


def calculate_safe_absences(attended: int, conducted: int, remaining: int, target: float = 0.75) -> int:
    """
    Maximum number of future classes student can miss while still reaching/maintaining target T.
    m_max = floor(A + R - T(C + R))
    Using exact rational arithmetic:
    Let T = p/q:
    m_max = floor((q*(A + R) - p*(C + R)) / q)
    Never round upward. Clamped to minimum 0.
    """
    if conducted < 0 or attended < 0 or remaining < 0:
        raise ValueError("Parameters must be non-negative integers.")
    if attended > conducted:
        raise ValueError("Attended classes cannot exceed conducted classes.")
    
    total = conducted + remaining
    if total == 0:
        return remaining

    frac = to_fraction(target)
    p, q = frac.numerator, frac.denominator
    
    # numerator = q * (A + R) - p * (C + R)
    num = q * (attended + remaining) - p * total
    safe = num // q  # floor division
    
    # Safe absences cannot exceed remaining classes and cannot be negative
    return max(0, min(remaining, safe))


def calculate_required_classes(attended: int, conducted: int, remaining: int, target: float = 0.75) -> Dict[str, Any]:
    """
    Calculates classes required to reach/recover target attendance.
    
    If current attendance >= target:
    Student is already at or above target, so required classes to recover is 0.
    However, to finish the semester at >= target, student must attend:
    ceil(T*(C + R) - A) classes total from remaining classes.
    
    If current attendance < target:
    Recovery classes required = ceil(T*(C + R) - A).
    If required > remaining: target is mathematically impossible / irreversible.
    """
    if conducted < 0 or attended < 0 or remaining < 0:
        raise ValueError("Parameters must be non-negative integers.")
    if attended > conducted:
        raise ValueError("Attended classes cannot exceed conducted classes.")
    
    total = conducted + remaining
    if total == 0:
        return {
            "required": 0,
            "min_future_to_maintain": 0,
            "is_possible": True,
            "is_irreversible": False,
            "max_possible": 100.0
        }
    
    frac = to_fraction(target)
    p, q = frac.numerator, frac.denominator
    
    # ceil((p*(C + R) - q*A) / q)
    num = p * total - q * attended
    if num <= 0:
        needed = 0
    else:
        needed = math.ceil(num / q)
    
    max_possible = calculate_max_possible_attendance(attended, conducted, remaining)
    
    # Check if max possible < target (using rational comparison)
    is_irreversible = (attended + remaining) * q < p * total
    is_possible = not is_irreversible
    
    # Current attendance check
    is_currently_above = (conducted > 0 and attended * q >= p * conducted)
    
    # If student is currently safe/above target, required recovery classes is 0
    recovery_required = 0 if is_currently_above else needed
    
    return {
        "required": recovery_required,
        "min_future_to_maintain": needed,
        "is_possible": is_possible,
        "is_irreversible": is_irreversible,
        "max_possible": round(max_possible, 4)
    }


def get_subject_status(attended: int, conducted: int, remaining: int, target: float = 0.75) -> Dict[str, Any]:
    """
    Classifies attendance status deterministically:
    - SAFE: Current >= target with sufficient absence buffer (> 1 or safe_absences >= 2).
    - WATCH: Current >= target but safe absence budget is low (<= 1).
    - CRITICAL: Current < target but recovery is mathematically possible (max_possible >= target).
    - IRREVERSIBLE: Even attending every remaining class cannot reach target (max_possible < target).
    """
    current_pct = calculate_current_attendance(attended, conducted)
    safe_absences = calculate_safe_absences(attended, conducted, remaining, target)
    req_info = calculate_required_classes(attended, conducted, remaining, target)
    max_possible = req_info["max_possible"]
    is_irreversible = req_info["is_irreversible"]
    
    if conducted == 0:
        return {
            "status": "SAFE",
            "current_pct": None,
            "safe_absences": remaining,
            "required": 0,
            "max_possible": 100.0,
            "is_irreversible": False,
            "label": "NO CLASSES YET",
            "badge_color": "SAFE"
        }
    
    frac = to_fraction(target)
    p, q = frac.numerator, frac.denominator
    is_above_target = (attended * q >= p * conducted)
    
    if is_irreversible:
        status = "IRREVERSIBLE"
        badge_color = "CRITICAL"
        label = "IRREVERSIBLE"
    elif not is_above_target:
        status = "CRITICAL"
        badge_color = "CRITICAL"
        label = "CRITICAL"
    elif safe_absences <= 1:
        status = "WATCH"
        badge_color = "CAUTION"
        label = "WATCH"
    else:
        status = "SAFE"
        badge_color = "SAFE"
        label = "SAFE"
        
    return {
        "status": status,
        "current_pct": round(current_pct, 2) if current_pct is not None else None,
        "safe_absences": safe_absences,
        "required": req_info["required"],
        "min_future_to_maintain": req_info["min_future_to_maintain"],
        "max_possible": max_possible,
        "is_irreversible": is_irreversible,
        "label": label,
        "badge_color": badge_color
    }


def calculate_multi_target_analysis(attended: int, conducted: int, remaining: int, custom_target: Optional[float] = None) -> Dict[str, Any]:
    """
    Evaluates attendance requirements across standard institutional targets (75%, 85%, 90%)
    plus an optional custom target.
    """
    targets = [
        {"name": "Detention Threshold", "target": 0.75, "key": "75%"},
        {"name": "Scholarship Target", "target": 0.85, "key": "85%"},
        {"name": "Honors / Placement", "target": 0.90, "key": "90%"},
    ]
    if custom_target is not None and custom_target not in [0.75, 0.85, 0.90]:
        targets.append({"name": "Custom Target", "target": custom_target, "key": f"{int(custom_target*100)}%"})
    
    results = {}
    for item in targets:
        t = item["target"]
        req = calculate_required_classes(attended, conducted, remaining, t)
        safe = calculate_safe_absences(attended, conducted, remaining, t)
        status_info = get_subject_status(attended, conducted, remaining, t)
        results[item["key"]] = {
            "name": item["name"],
            "target_pct": int(t * 100),
            "target_float": t,
            "safe_absences": safe,
            "required": req["required"],
            "min_future_to_maintain": req["min_future_to_maintain"],
            "max_possible": req["max_possible"],
            "is_possible": req["is_possible"],
            "is_irreversible": req["is_irreversible"],
            "status": status_info["status"],
            "badge_color": status_info["badge_color"]
        }
    return results


def calculate_priority_score(subject: Dict[str, Any], default_target: float = 0.75) -> Dict[str, Any]:
    """
    Ranks subject attendance priority deterministically using transparent factors:
    - Current deficit (how far below target)
    - Safe absence budget (lower budget = higher priority)
    - Recovery ratio (required classes / remaining classes)
    - Requirement criticality
    
    Does NOT use unexplained AI scores.
    """
    attended = subject.get("attended", 0)
    conducted = subject.get("conducted", 0)
    remaining = subject.get("remaining", 0)
    name = subject.get("name", "Unknown Subject")
    code = subject.get("code", "")
    
    status_info = get_subject_status(attended, conducted, remaining, default_target)
    status = status_info["status"]
    safe = status_info["safe_absences"]
    req = status_info["required"]
    current_pct = status_info["current_pct"]
    
    if status == "IRREVERSIBLE":
        priority_level = "IRREVERSIBLE"
        score = 1000
        explanation = (
            f"{name} is mathematically irreversible for the {int(default_target*100)}% target. "
            f"Maximum reachable is {status_info['max_possible']}%. Department consultation required."
        )
    elif status == "CRITICAL":
        priority_level = "HIGH"
        # Higher score if more classes required out of remaining
        recovery_pressure = (req / remaining) if remaining > 0 else 1.0
        score = 800 + int(recovery_pressure * 100)
        explanation = (
            f"{name} is currently below {int(default_target*100)}% (current: {current_pct}%). "
            f"You must attend at least {req} of the {remaining} remaining classes to recover."
        )
    elif status == "WATCH":
        priority_level = "MEDIUM"
        score = 500 + (2 - safe) * 50
        explanation = (
            f"{name} is above {int(default_target*100)}% (current: {current_pct}%), but has only "
            f"{safe} safe absence remaining. One absence will trigger critical status."
        )
    else:
        priority_level = "LOW"
        score = 100 - min(safe * 5, 90)
        explanation = (
            f"{name} is safe (current: {current_pct}%). You have a comfortable buffer of {safe} safe absences."
        )
        
    return {
        "subject_name": name,
        "subject_code": code,
        "priority_level": priority_level,
        "priority_score": score,
        "status": status,
        "current_pct": current_pct,
        "safe_absences": safe,
        "required_classes": req,
        "remaining_classes": remaining,
        "explanation": explanation
    }
