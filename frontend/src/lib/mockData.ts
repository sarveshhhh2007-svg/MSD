import { DashboardSummary, SectionData, SubjectData } from "./api";

export const MOCK_SECTIONS: SectionData[] = [
  { id: 1, name: "I ECE-A", department: "ECE", year: "I Year", semester: "I Semester", academic_year: "2026-2027", venue: "IST 602 / IST 710", active: true },
  { id: 2, name: "I ECE-B & EEE", department: "ECE / EEE", year: "I Year", semester: "I Semester", academic_year: "2026-2027", venue: "IST 602 / IST 710", active: true },
  { id: 3, name: "I ECE-DS", department: "ECE-DS", year: "I Year", semester: "I Semester", academic_year: "2026-2027", venue: "IST 710 / IST 502", active: true },
  { id: 4, name: "I Biotech-B & Biomedical Engineering", department: "Biotech / Biomedical", year: "I Year", semester: "I Semester", academic_year: "2026-2027", venue: "IST 520 / IST 702", active: true },
  { id: 5, name: "II BME", department: "BME", year: "II Year", semester: "III Semester", academic_year: "2026-2027", venue: "IST 602 / FN", active: true },
  { id: 6, name: "II ECE-DS A", department: "ECE-DS", year: "II Year", semester: "III Semester", academic_year: "2026-2027", venue: "IST 416 / FN", active: true },
  { id: 7, name: "II ECE-DS B", department: "ECE-DS", year: "II Year", semester: "III Semester", academic_year: "2026-2027", venue: "IST 411 / AN", active: true },
  { id: 8, name: "III BME", department: "BME", year: "III Year", semester: "V Semester", academic_year: "2026-2027", venue: "IST 211 / AN", active: true },
  { id: 9, name: "III ECE-A", department: "ECE", year: "III Year", semester: "V Semester", academic_year: "2026-2027", venue: "IST 518 / FN", active: true },
  { id: 10, name: "III ECE-B", department: "ECE", year: "III Year", semester: "V Semester", academic_year: "2026-2027", venue: "IST 518 / AN", active: true },
  { id: 11, name: "III ECE-DS", department: "ECE-DS", year: "III Year", semester: "V Semester", academic_year: "2026-2027", venue: "IST 519 / FN", active: true },
  { id: 12, name: "IV ECE-A", department: "ECE", year: "IV Year", semester: "VII Semester", academic_year: "2026-2027", venue: "IST 225", active: true },
  { id: 13, name: "IV ECE-B", department: "ECE", year: "IV Year", semester: "VII Semester", academic_year: "2026-2027", venue: "IST 227", active: true }
];

export function getMockDashboard(sectionId: number = 1, target: number = 0.75): DashboardSummary {
  const section = MOCK_SECTIONS.find(s => s.id === sectionId) || MOCK_SECTIONS[0];

  const subjects: SubjectData[] = [
    {
      id: 1,
      section_id: sectionId,
      code: "21ECC101J",
      name: "Digital Logic Design & Microprocessors",
      credit: "4",
      slot_code: "A",
      attendance_unit: "Hours",
      periods_per_week: 4,
      faculty_name: "Dr. P. Malarvizhi",
      faculty_dept: "ECE",
      attended: 34,
      conducted: 40,
      remaining: 20,
      current_pct: 85.0,
      status: "SAFE",
      safe_absences: 4,
      required: 0,
      min_future_to_maintain: 11,
      max_possible: 90.0,
      is_irreversible: false,
      badge_color: "green"
    },
    {
      id: 2,
      section_id: sectionId,
      code: "21ECC102J",
      name: "Electronic Circuits & Signal Conditioning",
      credit: "4",
      slot_code: "B",
      attendance_unit: "Hours",
      periods_per_week: 4,
      faculty_name: "Dr. K. Kalimuthu",
      faculty_dept: "ECE",
      attended: 28,
      conducted: 38,
      remaining: 22,
      current_pct: 73.7,
      status: "WATCH",
      safe_absences: 0,
      required: 2,
      min_future_to_maintain: 17,
      max_possible: 83.3,
      is_irreversible: false,
      badge_color: "amber"
    },
    {
      id: 3,
      section_id: sectionId,
      code: "21MAB102T",
      name: "Transforms & Boundary Value Problems",
      credit: "4",
      slot_code: "C",
      attendance_unit: "Hours",
      periods_per_week: 4,
      faculty_name: "Dr. S. Balamuralitharan",
      faculty_dept: "Mathematics",
      attended: 37,
      conducted: 40,
      remaining: 20,
      current_pct: 92.5,
      status: "SAFE",
      safe_absences: 7,
      required: 0,
      min_future_to_maintain: 8,
      max_possible: 95.0,
      is_irreversible: false,
      badge_color: "green"
    },
    {
      id: 4,
      section_id: sectionId,
      code: "21ECC103J",
      name: "Electromagnetic Fields & Waveguides",
      credit: "3",
      slot_code: "D",
      attendance_unit: "Hours",
      periods_per_week: 3,
      faculty_name: "Dr. V. Sarada",
      faculty_dept: "ECE",
      attended: 21,
      conducted: 35,
      remaining: 15,
      current_pct: 60.0,
      status: "CRITICAL",
      safe_absences: 0,
      required: 6,
      min_future_to_maintain: 15,
      max_possible: 72.0,
      is_irreversible: false,
      badge_color: "red"
    },
    {
      id: 5,
      section_id: sectionId,
      code: "21CSS101J",
      name: "Object Oriented Programming in C++",
      credit: "3",
      slot_code: "E",
      attendance_unit: "Hours",
      periods_per_week: 3,
      faculty_name: "Dr. R. Rajkumar",
      faculty_dept: "CSE",
      attended: 30,
      conducted: 33,
      remaining: 17,
      current_pct: 90.9,
      status: "SAFE",
      safe_absences: 5,
      required: 0,
      min_future_to_maintain: 8,
      max_possible: 94.0,
      is_irreversible: false,
      badge_color: "green"
    }
  ];

  const totalConducted = subjects.reduce((sum, s) => sum + s.conducted, 0);
  const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  const overall = Math.round((totalAttended / totalConducted) * 1000) / 10;

  return {
    overall_attendance: overall,
    total_subjects: subjects.length,
    critical_count: subjects.filter(s => s.status === "CRITICAL").length,
    watch_count: subjects.filter(s => s.status === "WATCH").length,
    safe_count: subjects.filter(s => s.status === "SAFE").length,
    irreversible_count: 0,
    subjects,
    reminders: [
      {
        type: "urgent",
        subject: "Electromagnetic Fields & Waveguides",
        code: "21ECC103J",
        message: "Attendance is at 60.0% — Attend the next 6 classes consecutively to cross 75% threshold.",
        safe_absences: 0
      },
      {
        type: "watch",
        subject: "Electronic Circuits & Signal Conditioning",
        code: "21ECC102J",
        message: "Attendance is at 73.7% — 2 consecutive attendances required to reach safety buffer.",
        safe_absences: 0
      }
    ],
    priorities: [
      {
        subject_name: "Electromagnetic Fields & Waveguides",
        subject_code: "21ECC103J",
        priority_level: "P1 - CRITICAL",
        priority_score: 95,
        status: "CRITICAL",
        current_pct: 60.0,
        safe_absences: 0,
        required_classes: 6,
        remaining_classes: 15,
        explanation: "Highest attendance deficit; mandatory attendance required this week."
      },
      {
        subject_name: "Electronic Circuits & Signal Conditioning",
        subject_code: "21ECC102J",
        priority_level: "P2 - HIGH WATCH",
        priority_score: 78,
        status: "WATCH",
        current_pct: 73.7,
        safe_absences: 0,
        required_classes: 2,
        remaining_classes: 22,
        explanation: "1 class away from safe zone; attend tomorrow morning lecture."
      }
    ],
    semester_info: {
      academic_year: "2026-2027",
      semester: section.semester,
      section: section.name,
      last_updated: "2026-09-28 11:48 AM"
    }
  };
}
