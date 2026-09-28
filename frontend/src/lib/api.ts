/**
 * API Client for NExtclass Attendance Intelligence Platform
 */

const getApiBase = () => {
  // Support private API_BASE (server-side runtime) or public NEXT_PUBLIC_API_BASE
  if (typeof process !== "undefined") {
    if (process.env.API_BASE) {
      return process.env.API_BASE;
    }
    if (process.env.NEXT_PUBLIC_API_BASE) {
      return process.env.NEXT_PUBLIC_API_BASE;
    }
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "/api";
  }
  return "http://127.0.0.1:8000/api";
};

const API_BASE = getApiBase();

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

import { MOCK_SECTIONS, getMockDashboard } from "./mockData";

export async function fetchSections(): Promise<SectionData[]> {
  try {
    const res = await fetch(`${API_BASE}/sections`);
    if (!res.ok) throw new Error("Failed to fetch sections");
    return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using rich preloaded section dataset:", err);
    return MOCK_SECTIONS;
  }
}

export async function fetchDashboard(sectionId: number = 1, target: number = 0.75): Promise<DashboardSummary> {
  try {
    const res = await fetch(`${API_BASE}/dashboard/${sectionId}?target=${target}`);
    if (!res.ok) throw new Error("Failed to fetch dashboard summary");
    return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, serving instant deterministic mock dashboard:", err);
    return getMockDashboard(sectionId, target);
  }
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
}, sectionId: number = 1) {
  const res = await fetch(`${API_BASE}/simulate/leave?section_id=${sectionId}`, {
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

// ==================== CAMPUS INTELLIGENCE & ROOM FINDER (ROUND 2) ====================

export interface RoomData {
  id: number;
  room_number: string;
  building: string;
  floor: number;
  floor_name: string;
  capacity?: number | null;
  has_ac?: boolean | null;
  has_projector?: boolean | null;
  room_type: string;
  status: "AVAILABLE" | "OCCUPIED" | "ACTIVE";
  conflicts?: any[];
  current_class?: any;
  available_window?: string;
  note?: string;
}

export interface FloorData {
  floor_number: number;
  floor_name: string;
  rooms: RoomData[];
}

export interface FloorGridResponse {
  target_date: string;
  query_time: string;
  interval: string;
  last_updated: string;
  total_rooms: number;
  available_count: number;
  occupied_count: number;
  floors: FloorData[];
}

export interface AIRoomSearchResult {
  query: string;
  parsed_constraints: {
    date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    floor?: number | null;
    requires_ac?: boolean | null;
    minimum_capacity?: number | null;
    requires_lab?: boolean | null;
    proximity_room?: string | null;
    raw_query: string;
  };
  verified_matches: RoomData[];
  near_matches: RoomData[];
  explanation: string;
  timestamp: string;
}

export async function fetchFloorGrid(
  targetDate?: string,
  timeStr?: string,
  building?: string,
  floor?: number
): Promise<FloorGridResponse> {
  const params = new URLSearchParams();
  if (targetDate) params.append("target_date", targetDate);
  if (timeStr) params.append("time", timeStr);
  if (building && building !== "ALL") params.append("building", building);
  if (floor !== undefined && floor !== null) params.append("floor", floor.toString());

  const res = await fetch(`${API_BASE}/rooms/availability?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch floor grid availability");
  return res.json();
}

export async function aiSearchRooms(
  query: string,
  currentTime?: string,
  currentDate?: string
): Promise<AIRoomSearchResult> {
  const res = await fetch(`${API_BASE}/rooms/ai-search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      current_time: currentTime,
      current_date: currentDate,
    }),
  });
  if (!res.ok) throw new Error("Failed to search rooms with AI");
  return res.json();
}

export async function fetchFloors(): Promise<Array<{ floor: number; floor_name: string }>> {
  const res = await fetch(`${API_BASE}/floors`);
  if (!res.ok) throw new Error("Failed to fetch floors");
  return res.json();
}

