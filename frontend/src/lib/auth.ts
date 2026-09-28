export interface DemoUser {
  id: string;
  name: string;
  studentId: string;
  email: string;
  avatar: string;
  sectionId: number;
  sectionName: string;
  department: string;
  year: string;
  semester: string;
  attendanceScenario: "safe" | "borderline" | "critical" | "high";
  note: string;
}

export const DEMO_USERS: DemoUser[] = [
  // 1. II ECE-DS A (Primary demo account)
  {
    id: "user-1",
    name: "Sarvesh Kumar",
    studentId: "RA2311004010042",
    email: "sarvesh@srmist.edu.in",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    sectionId: 1,
    sectionName: "II ECE-DS A",
    department: "ECE-DS",
    year: "II Year",
    semester: "IV Semester",
    attendanceScenario: "borderline",
    note: "Digital Logic Design is critical (72.5%), needs 3 classes to recover to 75%."
  },
  // 2. II ECE-DS B
  {
    id: "user-2",
    name: "Ananya Sharma",
    studentId: "RA2311004010088",
    email: "ananya.s@srmist.edu.in",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    sectionId: 2,
    sectionName: "II ECE-DS B",
    department: "ECE-DS",
    year: "II Year",
    semester: "IV Semester",
    attendanceScenario: "safe",
    note: "High 88.4% attendance with 8 safe skips left across subjects."
  },
  // 3. I ECE-A
  {
    id: "user-3",
    name: "Rohan Mukherjee",
    studentId: "RA2411004010012",
    email: "rohan.m@srmist.edu.in",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    sectionId: 3,
    sectionName: "I ECE-A",
    department: "ECE",
    year: "I Year",
    semester: "II Semester",
    attendanceScenario: "safe",
    note: "First year engineering foundation, 86.2% overall."
  },
  // 4. I ECE-B & EEE
  {
    id: "user-4",
    name: "Pooja Varma",
    studentId: "RA2411004010055",
    email: "pooja.v@srmist.edu.in",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    sectionId: 4,
    sectionName: "I ECE-B & EEE",
    department: "ECE",
    year: "I Year",
    semester: "II Semester",
    attendanceScenario: "borderline",
    note: "Borderline in Circuit Analysis, 76.0% buffer."
  },
  // 5. I ECE-DS
  {
    id: "user-5",
    name: "Aditya Nair",
    studentId: "RA2411004010102",
    email: "aditya.n@srmist.edu.in",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    sectionId: 5,
    sectionName: "I ECE-DS",
    department: "ECE-DS",
    year: "I Year",
    semester: "II Semester",
    attendanceScenario: "high",
    note: "Honors track aspirant maintaining 91.5% attendance."
  },
  // 6. I Biotech-B & Biomedical Engineering
  {
    id: "user-6",
    name: "Divya Krishnan",
    studentId: "RA2411004010150",
    email: "divya.k@srmist.edu.in",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    sectionId: 6,
    sectionName: "I Biotech-B & Biomedical Engineering",
    department: "Biomedical",
    year: "I Year",
    semester: "II Semester",
    attendanceScenario: "safe",
    note: "Combined Biotech/BME cohort with 83.0% average."
  },
  // 7. II BME
  {
    id: "user-7",
    name: "Karthik Reddy",
    studentId: "RA2311004010201",
    email: "karthik.r@srmist.edu.in",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    sectionId: 7,
    sectionName: "II BME",
    department: "Biomedical",
    year: "II Year",
    semester: "IV Semester",
    attendanceScenario: "critical",
    note: "Medical Device Instrumentation is at 69.0% (detention warning)."
  },
  // 8. III BME
  {
    id: "user-8",
    name: "Meera Sundaram",
    studentId: "RA2211004010034",
    email: "meera.s@srmist.edu.in",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    sectionId: 8,
    sectionName: "III BME",
    department: "Biomedical",
    year: "III Year",
    semester: "VI Semester",
    attendanceScenario: "safe",
    note: "Clinical engineering semester, 85.5% aggregate."
  },
  // 9. III ECE-A
  {
    id: "user-9",
    name: "Vikram Sengupta",
    studentId: "RA2211004010076",
    email: "vikram.s@srmist.edu.in",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    sectionId: 9,
    sectionName: "III ECE-A",
    department: "ECE",
    year: "III Year",
    semester: "VI Semester",
    attendanceScenario: "borderline",
    note: "VLSI Design is near 77%, 2 skips remaining."
  },
  // 10. III ECE-B
  {
    id: "user-10",
    name: "Sneha Iyer",
    studentId: "RA2211004010118",
    email: "sneha.i@srmist.edu.in",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    sectionId: 10,
    sectionName: "III ECE-B",
    department: "ECE",
    year: "III Year",
    semester: "VI Semester",
    attendanceScenario: "safe",
    note: "Elective heavy semester, 87.0% aggregate."
  },
  // 11. III ECE-DS
  {
    id: "user-11",
    name: "Abhinav Patel",
    studentId: "RA2211004010165",
    email: "abhinav.p@srmist.edu.in",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    sectionId: 11,
    sectionName: "III ECE-DS",
    department: "ECE-DS",
    year: "III Year",
    semester: "VI Semester",
    attendanceScenario: "high",
    note: "Data Science core with 92.0% placement clearance."
  },
  // 12. IV ECE-A
  {
    id: "user-12",
    name: "Tanvi Deshmukh",
    studentId: "RA2111004010022",
    email: "tanvi.d@srmist.edu.in",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    sectionId: 12,
    sectionName: "IV ECE-A",
    department: "ECE",
    year: "IV Year",
    semester: "VIII Semester",
    attendanceScenario: "safe",
    note: "Final year capstone project & internship semester."
  },
  // 13. IV ECE-B
  {
    id: "user-13",
    name: "Arjun Srinivasan",
    studentId: "RA2111004010091",
    email: "arjun.s@srmist.edu.in",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    sectionId: 13,
    sectionName: "IV ECE-B",
    department: "ECE",
    year: "IV Year",
    semester: "VIII Semester",
    attendanceScenario: "safe",
    note: "Final year 8th semester, 84.8% aggregate."
  }
];

export function getStoredAuthUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("nextclass_auth_user");
    if (!raw) return DEMO_USERS[0]; // Default to Sarvesh Kumar for immediate interactive inspection
    return JSON.parse(raw);
  } catch {
    return DEMO_USERS[0];
  }
}

export function saveAuthUser(user: DemoUser | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem("nextclass_auth_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("nextclass_auth_user");
  }
}
