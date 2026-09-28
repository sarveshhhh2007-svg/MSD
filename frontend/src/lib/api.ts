/**
 * API Client for NExtclass Attendance Intelligence Platform
 */

const API_BASE = "http://127.0.0.1:8000/api";

export interface SubjectData {
  id: number;
  section_id: number;
  code: string;
  name: string;
  credit: string;
  slot_code?: string;
  attendance_unit: string;
  periods_per_week: number;
  faculty_name?: string;
  faculty_dept?: string;
  attended: number;
  conducted: number;
  remaining: number;
  current_pct: number | null;
  status: "SAFE" | "WATCH" | "CRITICAL" | "IRREVERSIBLE";
  safe_absences: number;
  required: number;
  min_future_to_maintain: number;
  max_possible: number;
  is_irreversible: boolean;
  badge_color: string;
  multi_targets?: Record<string, any>;
}

export interface SectionData {
  id: number;
  name: string;
  department: string;
  year: string;
  semester: string;
  academic_year: string;
  venue: string;
  active: boolean;
}

export interface DashboardSummary {
  overall_attendance: number;
  total_subjects: number;
  safe_count: number;
  watch_count: number;
  critical_count: number;
  irreversible_count: number;
  subjects: SubjectData[];
  reminders: Array<{
    type: string;
    subject: string;
    code: string;
    message: string;
    safe_absences: number;
  }>;
  priorities: Array<{
    subject_name: string;
    subject_code: string;
    priority_level: string;
    priority_score: number;
    status: string;
    current_pct: number;
    safe_absences: number;
    required_classes: number;
    remaining_classes: number;
    explanation: string;
  }>;
  semester_info: {
    academic_year: string;
    semester: string;
    section: string;
    last_updated: string;
  };
}

export async function fetchSections(): Promise<SectionData[]> {
  const res = await fetch(`${API_BASE}/sections`);
  if (!res.ok) throw new Error("Failed to fetch sections");
  return res.json();
}

export async function fetchDashboard(sectionId: number = 1, target: number = 0.75): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/dashboard/${sectionId}?target=${target}`);
  if (!res.ok) throw new Error("Failed to fetch dashboard summary");
  return res.json();
}

export async function fetchSubjects(sectionId: number = 1, target: number = 0.75): Promise<SubjectData[]> {
  const res = await fetch(`${API_BASE}/subjects/${sectionId}?target=${target}`);
  if (!res.ok) throw new Error("Failed to fetch subjects");
  return res.json();
}

export async function fetchTimetable(sectionId: number = 1) {
  const res = await fetch(`${API_BASE}/timetable/${sectionId}`);
  if (!res.ok) throw new Error("Failed to fetch timetable");
  return res.json();
}

export async function fetchOccurrences(sectionId: number = 1, startDate?: string, endDate?: string) {
  let url = `${API_BASE}/occurrences?section_id=${sectionId}`;
  if (startDate) url += `&start_date=${startDate}`;
  if (endDate) url += `&end_date=${endDate}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch occurrences");
  return res.json();
}

export async function fetchAnalytics(sectionId: number = 1, target: number = 0.75) {
  const res = await fetch(`${API_BASE}/analytics/${sectionId}?target=${target}`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

export async function parseAttendanceScreenshot(rawText?: string, file?: File, sectionId: number = 1) {
  const formData = new FormData();
  if (rawText) formData.append("raw_text", rawText);
  if (file) formData.append("file", file);
  formData.append("section_id", sectionId.toString());

  const res = await fetch(`${API_BASE}/attendance/parse`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to parse attendance screenshot");
  return res.json();
}

export async function confirmAttendanceImport(subjects: any[]) {
  const res = await fetch(`${API_BASE}/attendance/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subjects }),
  });
  if (!res.ok) throw new Error("Failed to confirm attendance");
  return res.json();
}

export async function updateManualAttendance(subjectId: number, attended: number, conducted: number) {
  const res = await fetch(`${API_BASE}/attendance/manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject_id: subjectId, attended, conducted }),
  });
  if (!res.ok) throw new Error("Failed to update attendance");
  return res.json();
}

export async function logDailyAttendance(subjectId: number, dateStr: string, status: string, occurrenceId?: number) {
  const res = await fetch(`${API_BASE}/attendance/daily`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subject_id: subjectId,
      record_date: dateStr,
      status,
      occurrence_id: occurrenceId,
    }),
  });
  if (!res.ok) throw new Error("Failed to record daily attendance");
  return res.json();
}

export async function simulateLeave(payload: {
  leave_type: string;
  start_date: string;
  end_date: string;
  policy_mode?: string;
  target_threshold?: number;
}) {
  const res = await fetch(`${API_BASE}/simulate/leave?section_id=1`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to simulate leave");
  return res.json();
}

export async function fetchPolicy() {
  const res = await fetch(`${API_BASE}/policy`);
  if (!res.ok) throw new Error("Failed to fetch policy");
  return res.json();
}

export async function updatePolicy(payload: any) {
  const res = await fetch(`${API_BASE}/policy`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update policy");
  return res.json();
}

export async function sendAdvisorChat(message: string, sectionId: number = 1, target: number = 0.75) {
  const res = await fetch(`${API_BASE}/advisor/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      context_section_id: sectionId,
      target_threshold: target,
    }),
  });
  if (!res.ok) throw new Error("Failed to send message to Attendance Advisor");
  return res.json();
}
