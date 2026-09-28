"""
Attendance Screenshot OCR, Subject Matching & Validation Pipeline
Implements Section 20-25 with strict deterministic validation.
"""

import re
from typing import List, Dict, Any, Optional, Tuple
from difflib import SequenceMatcher

KNOWN_ALIASES = {
    "DLD": ("21ECC203T", "Digital Logic Design"),
    "DIGITAL LOGIC": ("21ECC203T", "Digital Logic Design"),
    "DIGITAL LOGIC DESIGN": ("21ECC203T", "Digital Logic Design"),
    "COA": ("21CSS201T", "Computer Organization and Architecture"),
    "COMP ORG": ("21CSS201T", "Computer Organization and Architecture"),
    "COMPUTER ARCHITECTURE": ("21CSS201T", "Computer Organization and Architecture"),
    "MATHS": ("21MAB201T", "Transforms and Boundary Value Problems"),
    "TBVP": ("21MAB201T", "Transforms and Boundary Value Problems"),
    "TRANSFORMS": ("21MAB201T", "Transforms and Boundary Value Problems"),
    "SSD": ("21ECC201T", "Solid State Devices"),
    "SOLID STATE": ("21ECC201T", "Solid State Devices"),
    "EMT": ("21ECC205T", "Electromagnetic Theory and Interference"),
    "ELECTROMAGNETIC": ("21ECC205T", "Electromagnetic Theory and Interference"),
    "EM THEORY": ("21ECC205T", "Electromagnetic Theory and Interference"),
    "PE": ("21LEM201T", "Professional Ethics"),
    "ETHICS": ("21LEM201T", "Professional Ethics"),
    "UHV": ("21LEM202T", "Universal Human Values-II"),
    "HUMAN VALUES": ("21LEM202T", "Universal Human Values-II"),
    "LAB": ("21ECC211L", "Devices and Digital IC Laboratory"),
    "IC LAB": ("21ECC211L", "Devices and Digital IC Laboratory"),
    "DIGITAL LAB": ("21ECC211L", "Devices and Digital IC Laboratory"),
}


def normalize_text(text: str) -> str:
    return re.sub(r"[^A-Za-z0-9]", "", text).upper()


def match_subject(raw_text: str, available_subjects: List[Dict[str, Any]]) -> Tuple[Optional[Dict[str, Any]], float, str]:
    """
    Subject matching priority (Section 24):
    1. Exact subject code
    2. Exact normalized subject name
    3. Known alias
    4. Fuzzy matching
    Returns: (matched_subject, confidence, match_type)
    """
    cleaned = raw_text.strip()
    norm_raw = normalize_text(cleaned)
    
    # 1. Exact subject code
    for sub in available_subjects:
        if normalize_text(sub["code"]) == norm_raw:
            return sub, 0.99, "EXACT_CODE"
        if sub["code"].lower() in cleaned.lower():
            return sub, 0.97, "CODE_IN_TEXT"
            
    # 2. Exact normalized name
    for sub in available_subjects:
        if normalize_text(sub["name"]) == norm_raw:
            return sub, 0.98, "EXACT_NAME"
            
    # 3. Known alias
    upper_raw = cleaned.upper()
    for alias, (code, _) in KNOWN_ALIASES.items():
        if alias == upper_raw or f" {alias} " in f" {upper_raw} ":
            for sub in available_subjects:
                if sub["code"] == code:
                    return sub, 0.92, f"ALIAS_{alias}"
                    
    # 4. Fuzzy matching
    best_match = None
    best_score = 0.0
    for sub in available_subjects:
        score_name = SequenceMatcher(None, sub["name"].lower(), cleaned.lower()).ratio()
        score_code = SequenceMatcher(None, sub["code"].lower(), cleaned.lower()).ratio()
        highest = max(score_name, score_code)
        if highest > best_score:
            best_score = highest
            best_match = sub
            
    if best_match and best_score >= 0.70:
        return best_match, round(best_score * 0.9, 2), "FUZZY_MATCH"
        
    return None, 0.40, "UNRESOLVED"


def parse_raw_attendance_text(text: str, available_subjects: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Extracts structured attendance records from raw OCR text lines or tables.
    Supports formats:
    - "DBMS 34 40 85%"
    - "Digital Logic Design: 29 / 40"
    - "21ECC203T | Attended: 29 | Conducted: 40"
    """
    results = []
    lines = text.strip().split("\n")
    
    pattern = re.compile(
        r"(?P<subject>[A-Za-z0-9\s\-&]+?)\s*[:\|\t,]?\s*(?P<attended>\d+)\s*[/\|\t,\s]+\s*(?P<conducted>\d+)"
    )
    
    seen_subjects = set()
    
    for line in lines:
        line = line.strip()
        if not line or len(line) < 3:
            continue
            
        m = pattern.search(line)
        if m:
            raw_sub = m.group("subject").strip()
            try:
                attended = int(m.group("attended"))
                conducted = int(m.group("conducted"))
            except ValueError:
                continue
                
            # Perform subject matching
            matched_sub, match_conf, match_type = match_subject(raw_sub, available_subjects)
            
            # Validation (Section 23)
            validation_error = None
            status = "VALID"
            confidence = match_conf
            
            if attended < 0 or conducted < 0:
                validation_error = "Attended or conducted count is negative."
                status = "INVALID"
                confidence = 0.1
            elif attended > conducted:
                validation_error = f"Attended ({attended}) exceeds conducted ({conducted}). Impossible."
                status = "INVALID"
                confidence = 0.1
            elif not matched_sub:
                validation_error = f"Could not unambiguously map subject '{raw_sub}'."
                status = "REVIEW_REQUIRED"
                confidence = min(confidence, 0.65)
            elif matched_sub["code"] in seen_subjects:
                validation_error = f"Duplicate subject detected for '{matched_sub['code']}'."
                status = "REVIEW_REQUIRED"
                confidence = min(confidence, 0.70)
            else:
                seen_subjects.add(matched_sub["code"])
                
            # Confidence tier (Section 22)
            if confidence >= 0.90:
                conf_tier = "HIGH"
            elif confidence >= 0.70:
                conf_tier = "MEDIUM"
                if status == "VALID":
                    status = "REVIEW_REQUIRED"
            else:
                conf_tier = "LOW"
                status = "REVIEW_REQUIRED" if status != "INVALID" else "INVALID"
                
            results.append({
                "raw_subject": raw_sub,
                "matched_subject_id": matched_sub["id"] if matched_sub else None,
                "matched_subject_code": matched_sub["code"] if matched_sub else None,
                "matched_subject_name": matched_sub["name"] if matched_sub else None,
                "attended": attended,
                "conducted": conducted,
                "confidence": round(confidence, 2),
                "confidence_tier": conf_tier,
                "status": status,
                "validation_error": validation_error
            })
            
    return results


def generate_sample_ocr_preview(available_subjects: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Generates structured review table for the college portal screenshot
    matching the demo flow in Section 25:
    - DBMS / COA: 34 / 40 -> 98% High
    - DLD: 29 / 40 -> 76% Review (ambiguous abbreviation)
    - Maths: 42 / 45 -> 95% High
    - Solid State: 32 / 40 -> 94% High
    """
    sample_text = """
    21CSS201T Computer Organization and Architecture 34 / 40
    DLD 29 / 40
    Maths 42 / 45
    Solid State Devices 32 / 40
    21ECC205T Electromagnetic Theory 33 / 40
    Professional Ethics 12 / 14
    Universal Human Values-II 28 / 30
    21ECC211L Devices and Digital IC Laboratory 16 / 18
    """
    return parse_raw_attendance_text(sample_text, available_subjects)
