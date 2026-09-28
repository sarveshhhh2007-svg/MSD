"""
OD and Medical Leave Simulator
Simulates the impact of scheduled absences across real calendar occurrences
using configurable institutional attendance policies (Sections 30-32).
"""

from typing import List, Dict, Any, Optional
from datetime import date
from backend.app.math_engine import (
    calculate_current_attendance,
    calculate_safe_absences,
    calculate_required_classes,
    get_subject_status
)


def simulate_leave_impact(
    subjects: List[Dict[str, Any]],
    occurrences: List[Dict[str, Any]],
    leave_type: str,
    start_date: date,
    end_date: date,
    policy_mode: Optional[str] = "COUNTS_AS_ATTENDED",
    target_threshold: float = 0.75
) -> Dict[str, Any]:
    """
    Simulates leave impact across concrete calendar timetable occurrences.
    
    Supported policy modes:
    - COUNTS_AS_ATTENDED: Both attended and conducted increase by affected count
    - EXCLUDED_FROM_DENOMINATOR: Conducted does not include these sessions
    - COUNTS_AS_ABSENT: Conducted increases, but attended remains unchanged
    - NOT_CONFIGURED: Warning returned, simulation unverified
    """
    if not policy_mode or policy_mode == "NOT_CONFIGURED":
        return {
            "leave_type": leave_type,
            "policy_used": "UNCONFIGURED",
            "start_date": start_date,
            "end_date": end_date,
            "total_affected_classes": 0,
            "overall_attendance_before": 0.0,
            "overall_attendance_after": 0.0,
            "status_summary": {"SAFE": 0, "WATCH": 0, "CRITICAL": 0, "IRREVERSIBLE": 0},
            "subjects": [],
            "policy_warning": (
                "Your institution's attendance policy for this leave type has not been configured. "
                "The simulator cannot provide a verified percentage without an institutional rule."
            )
        }
        
    # Find all scheduled occurrences within the date window
    affected_counts = {}
    for occ in occurrences:
        occ_d = occ.get("date") or occ.get("occurrence_date")
        if start_date <= occ_d <= end_date:
            sub_id = occ.get("subject_id")
            if sub_id is not None:
                affected_counts[sub_id] = affected_counts.get(sub_id, 0) + 1
                
    total_affected = sum(affected_counts.values())
    
    simulated_subjects = []
    total_att_before = 0
    total_cond_before = 0
    total_att_after = 0
    total_cond_after = 0
    
    status_summary = {"SAFE": 0, "WATCH": 0, "CRITICAL": 0, "IRREVERSIBLE": 0}
    
    for sub in subjects:
        sub_id = sub["id"]
        att = sub.get("attended", 0)
        cond = sub.get("conducted", 0)
        rem = sub.get("remaining", 0)
        
        affected = affected_counts.get(sub_id, 0)
        
        total_att_before += att
        total_cond_before += cond
        
        # Calculate simulated counts according to verified policy
        if policy_mode == "COUNTS_AS_ATTENDED":
            # Student was granted OD / Medical attendance credit
            sim_att = att + affected
            sim_cond = cond + affected
            sim_rem = max(0, rem - affected)
            note = f"+{affected} classes credited as attended under OD/Medical policy."
        elif policy_mode == "EXCLUDED_FROM_DENOMINATOR":
            # Student is exempt; conducted denominator is reduced or remains unchanged
            sim_att = att
            sim_cond = max(att, cond) # Conducted not penalized
            sim_rem = max(0, rem - affected)
            note = f"{affected} classes excluded from denominator."
        elif policy_mode == "COUNTS_AS_ABSENT":
            # Institution treats leave as regular absence
            sim_att = att
            sim_cond = cond + affected
            sim_rem = max(0, rem - affected)
            note = f"{affected} classes counted as absences under strict attendance policy."
        else:
            sim_att = att
            sim_cond = cond
            sim_rem = rem
            note = "Policy mode not recognized."
            
        total_att_after += sim_att
        total_cond_after += sim_cond
        
        # Calculate stats before and after
        status_before = get_subject_status(att, cond, rem, target_threshold)
        status_after = get_subject_status(sim_att, sim_cond, sim_rem, target_threshold)
        
        status_summary[status_after["status"]] = status_summary.get(status_after["status"], 0) + 1
        
        simulated_pct = (sim_att / sim_cond * 100.0) if sim_cond > 0 else 100.0
        
        simulated_subjects.append({
            "subject_id": sub_id,
            "subject_code": sub["code"],
            "subject_name": sub["name"],
            "affected_classes": affected,
            "current_attended": att,
            "current_conducted": cond,
            "current_pct": status_before["current_pct"],
            "simulated_attended": sim_att,
            "simulated_conducted": sim_cond,
            "simulated_pct": round(simulated_pct, 2),
            "current_safe_absences": status_before["safe_absences"],
            "simulated_safe_absences": status_after["safe_absences"],
            "status_before": status_before["status"],
            "status_after": status_after["status"],
            "badge_color_after": status_after["badge_color"],
            "is_irreversible_after": status_after["is_irreversible"],
            "recovery_needed": status_after["required"],
            "note": note
        })
        
    overall_before = (total_att_before / total_cond_before * 100.0) if total_cond_before > 0 else 0.0
    overall_after = (total_att_after / total_cond_after * 100.0) if total_cond_after > 0 else 0.0
    
    return {
        "leave_type": leave_type,
        "policy_used": policy_mode,
        "start_date": start_date,
        "end_date": end_date,
        "total_affected_classes": total_affected,
        "overall_attendance_before": round(overall_before, 2),
        "overall_attendance_after": round(overall_after, 2),
        "status_summary": status_summary,
        "subjects": simulated_subjects,
        "policy_warning": None
    }
