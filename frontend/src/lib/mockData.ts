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

export function getMockFloorGrid(building: string = "ALL", floorNum?: number) {
  const roomsRaw = [
    // Floor 2
    { room_number: "IST 211", floor: 2, floor_name: "2nd Floor", room_type: "Classroom", capacity: 65, has_ac: true, has_projector: true, status: "AVAILABLE" as const, available_window: "Free until 1:30 PM" },
    { room_number: "IST 225", floor: 2, floor_name: "2nd Floor", room_type: "Classroom", capacity: 60, has_ac: true, has_projector: true, status: "OCCUPIED" as const, available_window: "Occupied by IV ECE-A" },
    { room_number: "IST 227", floor: 2, floor_name: "2nd Floor", room_type: "Seminar Hall", capacity: 80, has_ac: true, has_projector: true, status: "AVAILABLE" as const, available_window: "Free until 3:00 PM" },
    // Floor 4
    { room_number: "IST 411", floor: 4, floor_name: "4th Floor", room_type: "Hardware Lab", capacity: 55, has_ac: true, has_projector: true, status: "AVAILABLE" as const, available_window: "Free until 12:45 PM" },
    { room_number: "IST 416", floor: 4, floor_name: "4th Floor", room_type: "Embedded Lab", capacity: 50, has_ac: true, has_projector: true, status: "OCCUPIED" as const, available_window: "Occupied by II ECE-DS A" },
    // Floor 5
    { room_number: "IST 502", floor: 5, floor_name: "5th Floor", room_type: "Classroom", capacity: 70, has_ac: true, has_projector: true, status: "AVAILABLE" as const, available_window: "Free until 2:15 PM" },
    { room_number: "IST 518", floor: 5, floor_name: "5th Floor", room_type: "DSP Lab", capacity: 60, has_ac: true, has_projector: true, status: "AVAILABLE" as const, available_window: "Free until 4:00 PM" },
    { room_number: "IST 519", floor: 5, floor_name: "5th Floor", room_type: "IoT Lab", capacity: 55, has_ac: true, has_projector: true, status: "OCCUPIED" as const, available_window: "Occupied by III ECE-DS" },
    { room_number: "IST 520", floor: 5, floor_name: "5th Floor", room_type: "Biotech Lab", capacity: 45, has_ac: false, has_projector: true, status: "AVAILABLE" as const, available_window: "Free until 1:15 PM" },
    // Floor 6
    { room_number: "IST 602", floor: 6, floor_name: "6th Floor", room_type: "Smart Classroom", capacity: 75, has_ac: true, has_projector: true, status: "AVAILABLE" as const, available_window: "Free until 2:30 PM" },
    { room_number: "IST 608", floor: 6, floor_name: "6th Floor", room_type: "VLSI Lab", capacity: 40, has_ac: true, has_projector: true, status: "OCCUPIED" as const, available_window: "Occupied until 12:30 PM" },
    // Floor 7
    { room_number: "IST 702", floor: 7, floor_name: "7th Floor", room_type: "Biomedical Lab", capacity: 48, has_ac: true, has_projector: true, status: "AVAILABLE" as const, available_window: "Free until 3:30 PM" },
    { room_number: "IST 710", floor: 7, floor_name: "7th Floor", room_type: "Lecture Hall", capacity: 90, has_ac: true, has_projector: true, status: "AVAILABLE" as const, available_window: "Free until 1:00 PM" }
  ];

  let filteredRooms = roomsRaw;
  if (floorNum !== undefined && floorNum !== null) {
    filteredRooms = roomsRaw.filter(r => r.floor === floorNum);
  }

  const floorsMap: { [fl: number]: any } = {};
  filteredRooms.forEach(r => {
    if (!floorsMap[r.floor]) {
      floorsMap[r.floor] = {
        floor_number: r.floor,
        floor_name: r.floor_name,
        rooms: []
      };
    }
    floorsMap[r.floor].rooms.push({
      id: parseInt(r.room_number.replace(/\D/g, "") || "101"),
      room_number: r.room_number,
      building: "Main Tech Park (TP)",
      floor: r.floor,
      floor_name: r.floor_name,
      capacity: r.capacity,
      has_ac: r.has_ac,
      has_projector: r.has_projector,
      room_type: r.room_type,
      status: r.status,
      available_window: r.available_window,
      note: "Live verified slot status"
    });
  });

  const floors = Object.values(floorsMap).sort((a: any, b: any) => a.floor_number - b.floor_number);
  const total = filteredRooms.length;
  const avail = filteredRooms.filter(r => r.status === "AVAILABLE").length;

  return {
    target_date: "2026-09-28",
    query_time: "10:42",
    interval: "10:40 - 11:30",
    last_updated: "2026-09-28 10:42:00",
    total_rooms: total,
    available_count: avail,
    occupied_count: total - avail,
    floors
  };
}

export function getMockTimetable(sectionId: number = 1) {
  return [
    { day: "Monday", slot: "1", time: "08:00 - 08:50", subject: "21ECC101J - Digital Logic Design", room: "IST 602", faculty: "Dr. P. Malarvizhi" },
    { day: "Monday", slot: "2", time: "08:50 - 09:40", subject: "21MAB102T - Transforms & PDE", room: "IST 602", faculty: "Dr. S. Balamuralitharan" },
    { day: "Monday", slot: "3", time: "09:50 - 10:40", subject: "21ECC102J - Electronic Circuits", room: "IST 411", faculty: "Dr. K. Kalimuthu" },
    { day: "Monday", slot: "4", time: "10:40 - 11:30", subject: "21CSS101J - Object Oriented C++", room: "IST 710", faculty: "Dr. R. Rajkumar" },
    { day: "Tuesday", slot: "1", time: "08:00 - 08:50", subject: "21ECC103J - Electromagnetic Fields", room: "IST 502", faculty: "Dr. V. Sarada" },
    { day: "Tuesday", slot: "2", time: "08:50 - 09:40", subject: "21ECC101J - Digital Logic Lab", room: "IST 411", faculty: "Dr. P. Malarvizhi" },
    { day: "Wednesday", slot: "1", time: "08:00 - 08:50", subject: "21MAB102T - Transforms & PDE", room: "IST 602", faculty: "Dr. S. Balamuralitharan" },
    { day: "Wednesday", slot: "2", time: "08:50 - 09:40", subject: "21ECC102J - Electronic Circuits", room: "IST 602", faculty: "Dr. K. Kalimuthu" },
    { day: "Thursday", slot: "1", time: "08:00 - 08:50", subject: "21CSS101J - Object Oriented C++", room: "IST 710", faculty: "Dr. R. Rajkumar" },
    { day: "Thursday", slot: "2", time: "08:50 - 09:40", subject: "21ECC103J - Electromagnetic Fields", room: "IST 502", faculty: "Dr. V. Sarada" },
    { day: "Friday", slot: "1", time: "08:00 - 08:50", subject: "21ECC101J - Digital Logic Design", room: "IST 602", faculty: "Dr. P. Malarvizhi" },
    { day: "Friday", slot: "2", time: "08:50 - 09:40", subject: "21MAB102T - Transforms & PDE", room: "IST 602", faculty: "Dr. S. Balamuralitharan" }
  ];
}

