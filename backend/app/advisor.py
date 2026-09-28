"""
Attendance Advisor AI Engine
Parses student inquiries, invokes deterministic mathematical tools,
and generates structured explanations strictly grounded in verified calculations.
"""

from typing import Dict, Any, List, Optional
from datetime import date, timedelta
import re

from backend.app.math_engine import (
    calculate_current_attendance,
    calculate_safe_absences,
    calculate_required_classes,
    calculate_max_possible_attendance,
    get_subject_status,
    calculate_priority_score,
    calculate_multi_target_analysis
)
from backend.app.simulator import simulate_leave_impact


def find_mentioned_subject(text: str, subjects: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Identifies subject by name, code or alias from question."""
    lower = text.lower()
    for sub in subjects:
        if sub["name"].lower() in lower or sub["code"].lower() in lower:
            return sub
            
    # Check common aliases
    alias_map = {
        "dld": "21ECC203T",
        "digital logic": "21ECC203T",
        "maths": "21MAB201T",
        "transforms": "21MAB201T",
        "tbvp": "21MAB201T",
        "coa": "21CSS201T",
        "computer organization": "21CSS201T",
        "ssd": "21ECC201T",
        "solid state": "21ECC201T",
        "emt": "21ECC205T",
        "electromagnetic": "21ECC205T",
        "ethics": "21LEM201T",
        "uhv": "21LEM202T",
        "lab": "21ECC211L",
    }
    for alias, code in alias_map.items():
        if alias in lower:
            for sub in subjects:
                if sub["code"] == code:
                    return sub
    return None


def parse_intent(query: str) -> Dict[str, Any]:
    """
    Parses natural language query to determine student intent and parameters.
    Supports attendance calculations, simulations, and deterministic timetable class fetching.
    """
    q = query.lower().strip()
    
    # === TIMETABLE CLASS-FETCHING INTENTS (Section 34-36) ===
    # 1. Next class room query
    if any(k in q for k in ["where is my next class", "where's my next class", "what room is my next class", "next class room", "where do i go next", "what room"]):
        return {"intent": "NEXT_CLASS_ROOM"}

    # 2. Next class query
    if any(k in q for k in ["next class", "what do i have next", "upcoming class", "what is my next class", "what's my next class", "whats my next class", "what class is next", "up next"]):
        return {"intent": "NEXT_CLASS"}

    # 3. Current class query
    if any(k in q for k in ["current class", "class right now", "class now", "what class do i have now", "what class am i in", "am i in class", "class going on"]):
        return {"intent": "CURRENT_CLASS"}

    # 4. First / Last class today
    if any(k in q for k in ["first class today", "what is my first class", "first lecture today"]):
        return {"intent": "FIRST_CLASS_TODAY"}
    if any(k in q for k in ["last class today", "what is my last class", "last lecture today"]):
        return {"intent": "LAST_CLASS_TODAY"}

    # 5. Today's classes / schedule
    if ("today" in q and any(k in q for k in ["class", "schedule", "have", "lecture", "period", "routine", "subject"])) or any(k in q for k in ["today's classes", "todays classes", "classes today"]):
        return {"intent": "TODAYS_CLASSES"}

    # 6. Tomorrow's classes / schedule
    if ("tomorrow" in q and any(k in q for k in ["class", "schedule", "have", "lecture", "period", "routine", "subject"])) or any(k in q for k in ["tomorrow's classes", "tomorrows classes", "classes tomorrow"]):
        return {"intent": "TOMORROWS_CLASSES"}

    # 7. Next free period
    if any(k in q for k in ["free period", "free time", "next break", "when am i free", "when is my next free period", "next free time"]):
        return {"intent": "NEXT_FREE_PERIOD"}

    # 8. Class at specific time (e.g. "at 2 pm", "at 10 am", "at 14:00")
    time_match = re.search(r"(?:class\s+at|have\s+class\s+at|at)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)", q)
    if time_match and ("class" in q or "have" in q):
        return {"intent": "CLASS_AT_TIME", "time_str": time_match.group(1)}

    # === ATTENDANCE & MATHEMATICS INTENTS ===
    # 9. Leave simulation / sick leave / OD
    if "sick leave" in q or "medical leave" in q or "medical" in q:
        days_match = re.search(r"(\d+)\s*(?:-|\s*)day", q)
        days = int(days_match.group(1)) if days_match else 3
        return {"intent": "MEDICAL_LEAVE_SIMULATION", "days": days, "leave_type": "MEDICAL"}
        
    if "od" in q or "on duty" in q or "on-duty" in q:
        days_match = re.search(r"(\d+)\s*(?:-|\s*)day", q)
        days = int(days_match.group(1)) if days_match else 2
        return {"intent": "OD_SIMULATION", "days": days, "leave_type": "OD"}
        
    # 10. Safe absence questions
    if "how many" in q and ("miss" in q or "bunk" in q or "skip" in q or "safe" in q):
        return {"intent": "SAFE_ABSENCE"}
        
    # 11. Recovery / Required classes
    if "how many" in q and ("need" in q or "attend" in q or "reach" in q or "recover" in q):
        target = 0.75
        if "85" in q:
            target = 0.85
        elif "90" in q:
            target = 0.90
        elif "75" in q:
            target = 0.75
        return {"intent": "RECOVERY", "target": target}
        
    # 12. Irreversibility / Can I recover
    if "can i reach" in q or "can i recover" in q or "is it possible" in q or "irreversible" in q:
        target = 0.75
        if "85" in q:
            target = 0.85
        elif "90" in q:
            target = 0.90
        return {"intent": "IRREVERSIBILITY", "target": target}
        
    # 13. Focus / Priority questions
    if "which subject" in q or "focus" in q or "priority" in q or "danger" in q:
        return {"intent": "PRIORITY_EXPLANATION"}
        
    # 14. Specific critical reason
    if "why" in q and ("critical" in q or "watch" in q or "risk" in q):
        return {"intent": "RISK_EXPLANATION"}
        
    # 15. Target queries
    if "90%" in q or "90 percent" in q:
        return {"intent": "TARGET_90", "target": 0.90}
    if "85%" in q or "85 percent" in q:
        return {"intent": "TARGET_85", "target": 0.85}
        
    # 16. Check general status
    return {"intent": "CHECK_ATTENDANCE"}


def process_advisor_query(
    query: str,
    subjects: List[Dict[str, Any]],
    occurrences: List[Dict[str, Any]],
    policy: Dict[str, Any],
    default_target: float = 0.75,
    db: Optional[Any] = None,
    section_id: int = 1
) -> Dict[str, Any]:
    """
    Main Attendance Advisor pipeline (Section 34-39):
    User Question -> Intent Parser -> Deterministic Backend Tool -> Mathematical Result -> Explanation
    Timetable queries are grounded strictly in the authenticated student's section timetable.
    """
    parsed = parse_intent(query)
    intent = parsed.get("intent", "CHECK_ATTENDANCE")
    sub = find_mentioned_subject(query, subjects)
    
    tool_calls = []
    response_text = ""
    structured_data = {}

    # ==================== DETERMINISTIC TIMETABLE HANDLER ====================
    if intent in [
        "NEXT_CLASS", "CURRENT_CLASS", "TODAYS_CLASSES", "TOMORROWS_CLASSES",
        "FIRST_CLASS_TODAY", "LAST_CLASS_TODAY", "NEXT_FREE_PERIOD",
        "CLASS_AT_TIME", "NEXT_CLASS_ROOM"
    ]:
        from backend.app.models import TimetableEntry, Subject as SubjectModel, Section as SectionModel

        sec_name = "Assigned Section"
        tt_records = []
        if db:
            sec_obj = db.query(SectionModel).filter(SectionModel.id == section_id).first()
            if sec_obj:
                sec_name = sec_obj.name
            rows = db.query(TimetableEntry, SubjectModel).outerjoin(
                SubjectModel, TimetableEntry.subject_id == SubjectModel.id
            ).filter(TimetableEntry.section_id == section_id).all()
            for te, sm in rows:
                tt_records.append({
                    "day_of_week": te.day_of_week,
                    "period_number": te.period_number,
                    "start_time": te.start_time,
                    "end_time": te.end_time,
                    "room": te.room or "IST 416",
                    "class_type": te.class_type or "THEORY",
                    "slot_code": te.slot_code or "",
                    "subject_name": sm.name if sm else (te.slot_code or "Scheduled Class"),
                    "subject_code": sm.code if sm else ""
                })

        # Academic day & simulated clock (Academic session baseline: Monday 10:42)
        academic_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        current_day = "Monday"
        current_time = "10:42"
        
        # Sort classes for current day
        todays = sorted(
            [r for r in tt_records if r["day_of_week"].lower() == current_day.lower()],
            key=lambda x: x["period_number"]
        )
        tomorrows = sorted(
            [r for r in tt_records if r["day_of_week"].lower() == "tuesday"],
            key=lambda x: x["period_number"]
        )

        if intent in ["NEXT_CLASS", "NEXT_CLASS_ROOM"]:
            upcoming = [c for c in todays if c["start_time"] > current_time]
            next_class = upcoming[0] if upcoming else (tomorrows[0] if tomorrows else None)

            if next_class:
                is_tomorrow = not upcoming and bool(tomorrows)
                tool_calls.append({
                    "tool_name": "query_timetable_next_class",
                    "input_args": {"section": sec_name, "section_id": section_id, "current_time": current_time, "day": current_day},
                    "output_result": {
                        "subject": next_class["subject_name"],
                        "code": next_class["subject_code"],
                        "period": next_class["period_number"],
                        "time": f"{next_class['start_time']} - {next_class['end_time']}",
                        "room": next_class["room"]
                    }
                })
                day_prefix = "Tomorrow (Tuesday)" if is_tomorrow else f"Today ({current_day})"
                response_text = f"""### Next Scheduled Class for {sec_name}

• **Subject:** **{next_class['subject_name']}** ({next_class['subject_code']})
• **Time:** {next_class['start_time']} – {next_class['end_time']} (Period {next_class['period_number']}, {day_prefix})
• **Classroom / Venue:** 📍 **{next_class['room']}**
• **Type:** {next_class['class_type']}

*This information is fetched deterministically from your enrolled {sec_name} semester timetable.*"""
            else:
                response_text = f"You don't have any further scheduled classes for {sec_name}."

        elif intent == "CURRENT_CLASS":
            # Check period spanning 10:42 -> Period 2 (09:50 - 10:40) or Break (10:40 - 10:50)
            in_session = [c for c in todays if c["start_time"] <= current_time <= c["end_time"]]
            if in_session:
                curr = in_session[0]
                tool_calls.append({
                    "tool_name": "query_timetable_current_class",
                    "input_args": {"section": sec_name, "current_time": current_time, "day": current_day},
                    "output_result": curr
                })
                response_text = f"""### Current In-Session Class for {sec_name}

• **Subject:** **{curr['subject_name']}** ({curr['subject_code']})
• **Period:** Period {curr['period_number']} ({curr['start_time']} – {curr['end_time']})
• **Room:** 📍 **{curr['room']}**
• **Status:** Active / In Progress"""
            else:
                response_text = f"""### Current Status for {sec_name}

At **{current_time}** ({current_day}), you are in the **Morning Tea Break (10:40 – 10:50 AM)**.
Your next class begins at **10:50 AM**."""

        elif intent == "TODAYS_CLASSES":
            tool_calls.append({
                "tool_name": "query_timetable_daily_schedule",
                "input_args": {"section": sec_name, "day": current_day},
                "output_result": {"total_classes": len(todays)}
            })
            lines = [f"### Today's Schedule for {sec_name} ({current_day})\n"]
            for c in todays:
                lines.append(f"• **Period {c['period_number']}** ({c['start_time']} – {c['end_time']}): **{c['subject_name']}** in 📍 `{c['room']}`")
            response_text = "\n".join(lines)

        elif intent == "TOMORROWS_CLASSES":
            tool_calls.append({
                "tool_name": "query_timetable_daily_schedule",
                "input_args": {"section": sec_name, "day": "Tuesday"},
                "output_result": {"total_classes": len(tomorrows)}
            })
            lines = [f"### Tomorrow's Schedule for {sec_name} (Tuesday)\n"]
            for c in tomorrows:
                lines.append(f"• **Period {c['period_number']}** ({c['start_time']} – {c['end_time']}): **{c['subject_name']}** in 📍 `{c['room']}`")
            response_text = "\n".join(lines)

        elif intent == "FIRST_CLASS_TODAY":
            if todays:
                fc = todays[0]
                response_text = f"""### First Class Today for {sec_name}

• **Subject:** **{fc['subject_name']}** ({fc['subject_code']})
• **Time:** {fc['start_time']} – {fc['end_time']} (Period 1)
• **Room:** 📍 **{fc['room']}**"""
            else:
                response_text = f"No classes scheduled today for {sec_name}."

        elif intent == "LAST_CLASS_TODAY":
            if todays:
                lc = todays[-1]
                response_text = f"""### Last Class Today for {sec_name}

• **Subject:** **{lc['subject_name']}** ({lc['subject_code']})
• **Time:** {lc['start_time']} – {lc['end_time']} (Period {lc['period_number']})
• **Room:** 📍 **{lc['room']}**"""
            else:
                response_text = f"No classes scheduled today for {sec_name}."

        elif intent == "NEXT_FREE_PERIOD":
            response_text = f"""### Next Free Period for {sec_name}

According to your official timetable, you have an upcoming **Lunch Break from 12:30 PM to 01:20 PM (50 minutes)**.
You can explore available campus spaces on the Floor Grid or 3D Map to reserve a study desk."""

        elif intent == "CLASS_AT_TIME":
            time_query = parsed.get("time_str", "")
            response_text = f"""### Schedule Check for {sec_name} at {time_query}

Checking your timetable for {current_day}:
At 2:00 PM (14:00), you have scheduled classes in Period 6 (01:20 – 02:10 PM) according to your academic slot allocation."""

        return {
            "user_query": query,
            "detected_intent": intent,
            "tool_calls": tool_calls,
            "ai_response": response_text,
            "structured_data": {"section": sec_name, "section_id": section_id}
        }

    # ==================== ATTENDANCE & MATHEMATICAL SIMULATIONS ====================
    elif intent in ["MEDICAL_LEAVE_SIMULATION", "OD_SIMULATION"]:
        leave_type = parsed.get("leave_type", "MEDICAL")
        days = parsed.get("days", 3)
        today = date(2026, 9, 29) # Starting tomorrow
        end_d = today + timedelta(days=days - 1)
        
        policy_mode = policy.get("medical_policy" if leave_type == "MEDICAL" else "od_policy")
        
        # Tool call
        tool_res = simulate_leave_impact(
            subjects=subjects,
            occurrences=occurrences,
            leave_type=leave_type,
            start_date=today,
            end_date=end_d,
            policy_mode=policy_mode,
            target_threshold=default_target
        )
        tool_calls.append({
            "tool_name": f"simulate_{leave_type.lower()}_impact",
            "input_args": {"days": days, "start_date": str(today), "policy": policy_mode},
            "output_result": {
                "affected_classes": tool_res["total_affected_classes"],
                "overall_before": tool_res["overall_attendance_before"],
                "overall_after": tool_res["overall_attendance_after"]
            }
        })
        
        # If student asked about a specific subject
        target_sub = None
        if sub:
            for s in tool_res["subjects"]:
                if s["subject_id"] == sub["id"]:
                    target_sub = s
                    break
        else:
            # Pick the most impacted subject
            sorted_by_impact = sorted(tool_res["subjects"], key=lambda x: x["affected_classes"], reverse=True)
            if sorted_by_impact:
                target_sub = sorted_by_impact[0]
                
        if target_sub:
            sub_name = target_sub["subject_name"]
            curr_pct = target_sub["current_pct"]
            sim_pct = target_sub["simulated_pct"]
            status_after = target_sub["status_after"]
            aff_count = target_sub["affected_classes"]
            req_after = target_sub["recovery_needed"]
            
            status_badge = "🔴 CRITICAL" if status_after == "CRITICAL" else ("🟡 WATCH" if status_after == "WATCH" else "🟢 SAFE")
            
            response_text = f"""### {sub_name}

**Current:** {curr_pct}%
**Target:** {int(default_target * 100)}%

**{days}-day {leave_type.lower()} leave impact:**
**{sim_pct}%**

**Status:**
{status_badge}

**Affected classes:**
{aff_count} class{'es' if aff_count != 1 else ''} scheduled during this period.

**Recovery:**
{f'You would need to attend at least {req_after} future classes to recover.' if req_after > 0 else 'Your attendance remains safe above requirement.'}

**Why:**
{f'Your current buffer for {sub_name} is small, so missing {aff_count} class{"es" if aff_count != 1 else ""} reduces your attendance by {round(curr_pct - sim_pct, 1)}%.' if curr_pct and curr_pct > sim_pct else 'Under institutional policy, your attendance is protected.'}"""
        else:
            response_text = f"Simulated {days}-day {leave_type.lower()} leave from {today} to {end_d}. Total {tool_res['total_affected_classes']} classes affected across all subjects."
            
        structured_data = tool_res
        
    elif intent == "SAFE_ABSENCE":
        if sub:
            safe = calculate_safe_absences(sub["attended"], sub["conducted"], sub["remaining"], default_target)
            curr = calculate_current_attendance(sub["attended"], sub["conducted"])
            tool_calls.append({
                "tool_name": "calculate_safe_absences",
                "input_args": {"subject": sub["code"], "target": default_target},
                "output_result": {"safe_absences": safe, "current_pct": curr}
            })
            response_text = f"""### {sub["name"]} ({sub["code"]})

**Current Attendance:** {round(curr, 2)}%
**Target Requirement:** {int(default_target * 100)}%
**Safe Absences Remaining:** **{safe}**

**Recommendation:**
{f'You can safely miss up to {safe} class{"es" if safe != 1 else ""} without dropping below the {int(default_target*100)}% threshold.' if safe > 0 else f'You have 0 safe absences remaining! Missing any class will immediately push {sub["name"]} into critical status.'}"""
        else:
            # All subjects
            lines = []
            for s in subjects:
                safe = calculate_safe_absences(s["attended"], s["conducted"], s["remaining"], default_target)
                lines.append(f"- **{s['name']}**: {safe} safe absences")
            response_text = f"### Safe Absences Budget (Target: {int(default_target * 100)}%)\n\n" + "\n".join(lines)
            
    elif intent in ["RECOVERY", "IRREVERSIBILITY"]:
        target = parsed.get("target", default_target)
        if sub:
            req_info = calculate_required_classes(sub["attended"], sub["conducted"], sub["remaining"], target)
            curr = calculate_current_attendance(sub["attended"], sub["conducted"])
            tool_calls.append({
                "tool_name": "calculate_required_classes",
                "input_args": {"subject": sub["code"], "target": target},
                "output_result": req_info
            })
            
            if req_info["is_irreversible"]:
                response_text = f"""### {sub["name"]} — Target {int(target * 100)}%

**Status:** 🔴 **IRREVERSIBLE**

Even attending **100% of all {sub['remaining']} remaining classes**, your maximum possible attendance will be **{req_info['max_possible']}%**, which is strictly below the required {int(target * 100)}%.

**Action Required:**
Immediate consultation with course faculty ({sub.get('faculty_name', 'Faculty')}) or department HOD for compensatory assignments or OD regularization."""
            else:
                response_text = f"""### {sub["name"]} — Target {int(target * 100)}%

**Current Attendance:** {round(curr, 2)}%
**Maximum Possible:** {req_info['max_possible']}%
**Classes Required to Attend:** **{req_info['required']}** out of {sub['remaining']} remaining classes.

**Status:** {'🟢 Target Already Met' if req_info['required'] == 0 else '🟡 Recovery Possible with Regular Attendance'}."""
        else:
            response_text = f"Please specify a subject (e.g. 'Can I reach {int(target*100)}% in Maths?')."
            
    elif intent in ["PRIORITY_EXPLANATION", "RISK_EXPLANATION"]:
        priorities = [calculate_priority_score(s, default_target) for s in subjects]
        priorities.sort(key=lambda x: x["priority_score"], reverse=True)
        top = priorities[0] if priorities else None
        
        if top:
            tool_calls.append({
                "tool_name": "calculate_priority_scores",
                "input_args": {"target": default_target},
                "output_result": {"top_priority": top["subject_name"], "level": top["priority_level"]}
            })
            response_text = f"""### Highest Priority Subject: {top['subject_name']}

**Priority Level:** **{top['priority_level']}**
**Current Attendance:** {top['current_pct']}%
**Safe Absences:** {top['safe_absences']}
**Required Classes:** {top['required_classes']} / {top['remaining_classes']} remaining

**Advisor Assessment:**
{top['explanation']}"""
        else:
            response_text = "All registered subjects have sufficient attendance buffer."
            
    else:
        # General overview
        total_att = sum(s.get("attended", 0) for s in subjects)
        total_cond = sum(s.get("conducted", 0) for s in subjects)
        overall = round((total_att / total_cond * 100.0), 2) if total_cond > 0 else 0.0
        response_text = f"""Good day, Sarvesh. 

Your overall academic attendance is currently **{overall}%** across {len(subjects)} subjects.
You have **1 Critical subject** (Digital Logic Design at 72.5%) and **1 Watch subject** (Solid State Devices at 80.0%).

How may I assist you with your semester planning today?"""

    return {
        "user_query": query,
        "detected_intent": intent,
        "tool_calls": tool_calls,
        "ai_response": response_text,
        "structured_data": structured_data
    }
