"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  ArrowUpRight,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Lock,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flame,
  Award,
  Zap,
  RotateCcw,
  Sliders,
  MapPin
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell
} from "recharts";
import { DashboardSummary, SubjectData, logDailyAttendance } from "../lib/api";

interface DashboardViewProps {
  summary: DashboardSummary | null;
  selectedTarget: number;
  onRefresh: () => void;
  onOpenAdvisorWithPrompt: (prompt: string) => void;
  onSimulateSubject: (subjectCode: string) => void;
}

export default function DashboardView({
  summary,
  selectedTarget,
  onRefresh,
  onOpenAdvisorWithPrompt,
  onSimulateSubject,
}: DashboardViewProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Interactive Calculator State (Section 20 & 21)
  const [calcSubjectId, setCalcSubjectId] = useState<number>(1);
  const [calcTarget, setCalcTarget] = useState<number>(selectedTarget);

  // Safe Skip Calendar selected date
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<number>(28);

  if (!summary) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-[#FFD81A] border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-[#7A7A7A]">Loading attendance intelligence...</p>
        </div>
      </div>
    );
  }

  const handleQuickLog = async (subjectId: number, status: string) => {
    try {
      setUpdatingId(subjectId);
      const todayStr = "2026-09-28";
      await logDailyAttendance(subjectId, todayStr, status);
      onRefresh();
    } catch (err) {
      console.error("Error logging attendance:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Aggregated Hero Metrics
  const totalConducted = summary.subjects.reduce((acc, s) => acc + s.conducted, 0);
  const totalAttended = summary.subjects.reduce((acc, s) => acc + s.attended, 0);
  const totalRemaining = summary.subjects.reduce((acc, s) => acc + s.remaining, 0);
  const totalSafeSkips = summary.subjects.reduce((acc, s) => acc + (s.safe_absences || 0), 0);

  // Irreversible Detention check (Section 28)
  const irreversibleSubjects = summary.subjects.filter((s) => s.is_irreversible);

  // Chart data: 6 historical weeks + 2 projected future weeks
  const analyticsChartData = [
    { week: "W1", attended: 88, conducted: 100, pct: 88, isCurrent: false },
    { week: "W2", attended: 82, conducted: 100, pct: 82, isCurrent: false },
    { week: "W3", attended: 85, conducted: 100, pct: 85, isCurrent: false },
    { week: "W4", attended: 79, conducted: 100, pct: 79, isCurrent: false },
    { week: "W5", attended: 84, conducted: 100, pct: 84, isCurrent: false },
    { week: "W6 (Current)", attended: 87, conducted: 100, pct: summary.overall_attendance, isCurrent: true },
    { week: "W7 (Pred.)", attended: 89, conducted: 100, pct: Math.min(100, Math.round(summary.overall_attendance + 2.5)), isFuture: true },
    { week: "W8 (Final)", attended: 91, conducted: 100, pct: Math.min(100, Math.round(summary.overall_attendance + 4.2)), isFuture: true },
  ];

  // Active Subject for Calculator
  const activeCalcSubject = summary.subjects.find((s) => s.id === calcSubjectId) || summary.subjects[0];
  const calcA = activeCalcSubject ? activeCalcSubject.attended : 30;
  const calcC = activeCalcSubject ? activeCalcSubject.conducted : 36;
  const calcR = activeCalcSubject ? activeCalcSubject.remaining : 18;
  const calcReq = Math.max(0, Math.ceil(calcTarget * (calcC + calcR) - calcA));
  const calcSafe = Math.max(0, Math.floor(calcA + calcR - calcTarget * (calcC + calcR)));
  const calcMax = Math.round(((calcA + calcR) / (calcC + calcR)) * 1000) / 10;

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 bg-[#F7F4E8]">
      {/* 1. HERO SECTION (Section 14) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8F7500] px-2.5 py-0.5 rounded-full bg-[#FFF8D6] border border-[#FFD81A]/40">
              Semester Planning Active
            </span>
            <span className="text-xs text-[#7A7A7A]">•</span>
            <span className="text-xs text-[#7A7A7A] flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5" /> Updated Today, 11:48 AM
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#171717] tracking-tight mt-1.5">
            Good morning, Sarvesh
          </h1>
          <p className="text-sm font-medium text-[#7A7A7A] mt-0.5">
            Here&apos;s your attendance intelligence, recovery forecast and campus room availability for today.
          </p>
        </div>

        {/* Current Context Pill */}
        <div className="flex items-center gap-3 bg-[#FFFDF8] border border-[#E8E3D7] rounded-full px-4 py-2 shadow-sm shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#45B36B]" />
          <div className="text-xs font-semibold text-[#171717]">
            <span>SRM IST • </span>
            <span className="font-bold text-[#8F7500]">{summary.semester_info.section}</span>
          </div>
        </div>
      </div>

      {/* 2. HERO STATISTICS ROW (4 Cards) (Section 15 & 16) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* CARD 1 — CURRENT ATTENDANCE (GOLD HIGHLIGHTED CARD) */}
        <div className="card-hero-gold p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#171717]/80">
                Current Attendance
              </span>
              <div className="w-8 h-8 rounded-full bg-[#171717]/10 flex items-center justify-center">
                <RotateCcw className="w-4 h-4 text-[#171717]" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-4xl font-extrabold tracking-tight text-[#171717]">
                {summary.overall_attendance}%
              </span>
              <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full bg-[#171717] text-[#FFD81A]">
                ↑ 2.1%
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#171717]/15 flex items-center justify-between text-xs font-semibold text-[#171717]/90">
            <span>Target: {Math.round(selectedTarget * 100)}%</span>
            <span>+9.7% Buffer</span>
          </div>
        </div>

        {/* CARD 2 — REMAINING CLASSES */}
        <div className="card-premium p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-[#7A7A7A]">
                Remaining Classes
              </span>
              <div className="w-8 h-8 rounded-full bg-[#EFECE0] flex items-center justify-center">
                <Calendar className="w-4 h-4 text-[#171717]" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-[#171717]">
                {totalRemaining}
              </span>
              <span className="text-xs font-semibold text-[#7A7A7A]">Scheduled</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E8E3D7] flex items-center justify-between text-xs font-medium text-[#7A7A7A]">
            <span>Conducted So Far</span>
            <span className="font-bold text-[#171717]">{totalConducted} classes</span>
          </div>
        </div>

        {/* CARD 3 — SAFE SKIPS */}
        <div className="card-premium p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-[#7A7A7A]">
                Safe Skips Left
              </span>
              <div className="w-8 h-8 rounded-full bg-[#45B36B]/15 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-[#45B36B]" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-[#45B36B]">
                {totalSafeSkips}
              </span>
              <span className="text-xs font-bold text-[#45B36B]">Classes buffer</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E8E3D7] flex items-center justify-between text-xs font-medium text-[#7A7A7A]">
            <span>Detention Margin</span>
            <span className="font-bold text-[#45B36B]">Healthy</span>
          </div>
        </div>

        {/* CARD 4 — CLASSES NEEDED FOR 90% */}
        <div className="card-premium p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-[#7A7A7A]">
                Needed for 90%
              </span>
              <div className="w-8 h-8 rounded-full bg-[#7A3DF0]/12 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#7A3DF0]" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-[#171717]">
                12
              </span>
              <span className="text-xs font-semibold text-[#7A7A7A]">Honors Target</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E8E3D7] flex items-center justify-between text-xs font-medium text-[#7A7A7A]">
            <span>Required Attendance</span>
            <span className="font-bold text-[#7A3DF0]">Achievable</span>
          </div>
        </div>
      </div>

      {/* 3. IRREVERSIBLE DETENTION ALERT (Section 28) */}
      {irreversibleSubjects.length > 0 && (
        <div className="p-5 rounded-3xl bg-[#FFFDF8] border-2 border-[#E74C3C] shadow-lg shadow-red-500/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E74C3C]/15 border border-[#E74C3C]/30 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-[#E74C3C]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#E74C3C] uppercase tracking-wide">
                🔒 IRREVERSIBLE DETENTION DETECTED
              </h3>
              <p className="text-xs font-medium text-[#171717] mt-0.5">
                Even with 100% attendance in all remaining classes, {irreversibleSubjects.map(s => s.name).join(", ")} cannot reach the {Math.round(selectedTarget * 100)}% threshold under standard rules.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSimulateSubject(irreversibleSubjects[0].code)}
            className="px-4 py-2 rounded-full text-xs font-bold bg-[#E74C3C] text-white hover:bg-[#C0392B] transition-all shadow-sm shrink-0"
          >
            Apply OD / Medical Appeal
          </button>
        </div>
      )}

      {/* 4. MAIN DASHBOARD GRID (Spacious 3-Column Skyflow Composition) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT / CENTER REGION (2 COLUMNS) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Attendance Analytics & Trend (Section 17 & 18) */}
          <div className="card-premium p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7A7A7A]">
                  Analytics Telemetry
                </span>
                <h3 className="text-lg font-extrabold text-[#171717] tracking-tight mt-0.5">
                  Weekly Attendance Growth &amp; Trajectory
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-[#171717]">
                  <span className="w-3 h-3 rounded-md bg-[#FFD81A]" /> Current Period
                </span>
                <span className="flex items-center gap-1.5 text-[#7A7A7A]">
                  <span className="w-3 h-3 rounded-md bg-[#EFECE0]" /> Historical
                </span>
                <span className="flex items-center gap-1.5 text-[#45B36B]">
                  <span className="w-2.5 h-0.5 bg-[#45B36B]" /> Target ({Math.round(selectedTarget * 100)}%)
                </span>
              </div>
            </div>

            {/* Recharts Activity Graph */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analyticsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E3D7" vertical={false} />
                  <XAxis dataKey="week" stroke="#9E9E9E" tick={{ fill: "#7A7A7A", fontSize: 11, fontWeight: 600 }} />
                  <YAxis domain={[60, 100]} stroke="#9E9E9E" tick={{ fill: "#7A7A7A", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFDF8",
                      borderColor: "#E8E3D7",
                      borderRadius: "16px",
                      color: "#171717",
                      fontSize: "12px",
                      fontWeight: 600,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                    }}
                    formatter={(val: any) => [`${val}%`, "Attendance"]}
                  />
                  <ReferenceLine y={Math.round(selectedTarget * 100)} stroke="#45B36B" strokeDasharray="4 4" strokeWidth={2} />
                  <Bar dataKey="pct" radius={[8, 8, 0, 0]}>
                    {analyticsChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isCurrent ? "#FFD81A" : entry.isFuture ? "#FFF8D6" : "#E8E3D7"}
                      />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="pct" stroke="#171717" strokeWidth={2.5} dot={{ fill: "#FFD81A", stroke: "#171717", strokeWidth: 2, r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* 4 Bottom Telemetry Submetrics */}
            <div className="pt-4 border-t border-[#E8E3D7] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <span className="text-[11px] text-[#7A7A7A] block font-medium">Weekly Growth</span>
                <span className="text-base font-extrabold text-[#45B36B]">+2.1%</span>
              </div>
              <div>
                <span className="text-[11px] text-[#7A7A7A] block font-medium">Predicted Final</span>
                <span className="text-base font-extrabold text-[#171717]">91.4%</span>
              </div>
              <div>
                <span className="text-[11px] text-[#7A7A7A] block font-medium">Current Status</span>
                <span className="text-base font-extrabold text-[#45B36B]">SAFE ZONE</span>
              </div>
              <div>
                <span className="text-[11px] text-[#7A7A7A] block font-medium">Target Threshold</span>
                <span className="text-base font-extrabold text-[#8F7500]">{Math.round(selectedTarget * 100)}% Target</span>
              </div>
            </div>
          </div>

          {/* Interactive Attendance Calculator (Section 20 & 21) */}
          <div className="card-premium p-7 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7A7A7A]">
                  Instant Planner
                </span>
                <h3 className="text-base font-extrabold text-[#171717] tracking-tight">
                  Interactive Attendance Recovery &amp; Skip Calculator
                </h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFF8D6] text-[#8F7500] border border-[#FFD81A]/40 font-mono">
                RATIONAL ARITHMETIC
              </span>
            </div>

            {/* Calculator Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#7A7A7A] mb-1.5">
                  Select Subject
                </label>
                <select
                  value={calcSubjectId}
                  onChange={(e) => setCalcSubjectId(Number(e.target.value))}
                  className="w-full bg-[#FAFAFC] border border-[#E8E3D7] rounded-2xl px-3 py-2 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#FFD81A]"
                >
                  {summary.subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7A7A7A] mb-1.5">
                  Target Threshold ({Math.round(calcTarget * 100)}%)
                </label>
                <div className="flex items-center gap-1 bg-[#FAFAFC] p-1 rounded-2xl border border-[#E8E3D7]">
                  {[0.75, 0.85, 0.90].map((t) => (
                    <button
                      key={t}
                      onClick={() => setCalcTarget(t)}
                      className={`flex-1 py-1 text-xs font-bold rounded-xl transition-all ${
                        calcTarget === t
                          ? "bg-[#FFD81A] text-[#171717] shadow-sm"
                          : "text-[#7A7A7A] hover:text-[#171717]"
                      }`}
                    >
                      {Math.round(t * 100)}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7A7A7A] mb-1.5">
                  Quick Action
                </label>
                <button
                  onClick={() => onOpenAdvisorWithPrompt(`Can I safely miss 2 classes of ${activeCalcSubject?.name}?`)}
                  className="w-full py-2 px-3 rounded-2xl bg-[#FFF8D6] text-xs font-bold text-[#8F7500] hover:bg-[#FFD81A] hover:text-[#171717] transition-all border border-[#FFD81A]/40 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Ask Advisor AI
                </button>
              </div>
            </div>

            {/* Calculator Outputs Display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7] text-center">
                <span className="text-[10px] uppercase font-bold text-[#7A7A7A] block">Remaining</span>
                <span className="text-xl font-extrabold text-[#171717]">{calcR} classes</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7] text-center">
                <span className="text-[10px] uppercase font-bold text-[#7A7A7A] block">You Can Skip</span>
                <span className="text-xl font-extrabold text-[#45B36B]">{calcSafe} classes</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7] text-center">
                <span className="text-[10px] uppercase font-bold text-[#7A7A7A] block">Must Attend</span>
                <span className={`text-xl font-extrabold ${calcReq > 0 ? "text-[#E74C3C]" : "text-[#45B36B]"}`}>
                  {calcReq} classes
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7] text-center">
                <span className="text-[10px] uppercase font-bold text-[#7A7A7A] block">Max Reachable</span>
                <span className="text-xl font-extrabold text-[#171717]">{calcMax}%</span>
              </div>
            </div>
          </div>

          {/* Subject Performance Grid (Section 22 & 23) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7A7A7A]">
                  Course Registry
                </span>
                <h3 className="text-base font-extrabold text-[#171717] tracking-tight">
                  Subject Performance &amp; Attendance Health
                </h3>
              </div>
              <span className="text-xs font-bold text-[#7A7A7A]">
                {summary.subjects.length} Enrolled Courses
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.subjects.map((sub) => {
                const isCritical = sub.status === "CRITICAL";
                const isWatch = sub.status === "WATCH";
                const isSafe = sub.status === "SAFE";

                const statusColor = isCritical ? "#E74C3C" : isWatch ? "#FF8A3D" : "#45B36B";
                const badgeClass = isCritical
                  ? "badge-semantic-critical"
                  : isWatch
                  ? "badge-semantic-caution"
                  : "badge-semantic-safe";

                return (
                  <div
                    key={sub.id}
                    className="card-premium p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Name, Slot & Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-[#171717] truncate" title={sub.name}>
                            {sub.name}
                          </h4>
                          <p className="text-xs font-medium text-[#7A7A7A] mt-0.5">
                            {sub.code} • {sub.slot_code ? `Slot ${sub.slot_code}` : "Lab"}
                          </p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase shrink-0 ${badgeClass}`}>
                          ● {sub.status}
                        </span>
                      </div>

                      {/* Middle Row: Large Percentage & Target */}
                      <div className="mt-4 flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold text-[#171717] tracking-tight">
                            {sub.current_pct !== null ? `${sub.current_pct}%` : "N/A"}
                          </span>
                          <span className="text-xs font-medium text-[#7A7A7A]">
                            Target {Math.round(selectedTarget * 100)}%
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#7A7A7A]">
                          Max: {sub.max_possible}%
                        </span>
                      </div>

                      {/* Rounded Progress Bar */}
                      <div className="mt-3 relative w-full h-2 bg-[#EFECE0] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, sub.current_pct || 0)}%`,
                            backgroundColor: statusColor,
                          }}
                        />
                      </div>

                      {/* Data Stats Row */}
                      <div className="mt-4 pt-3 border-t border-[#E8E3D7] grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-[#FAFAFC] border border-[#E8E3D7]/60">
                          <span className="text-[10px] text-[#7A7A7A] block font-medium">Attended</span>
                          <span className="font-extrabold text-[#171717]">{sub.attended}/{sub.conducted}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-[#FAFAFC] border border-[#E8E3D7]/60">
                          <span className="text-[10px] text-[#7A7A7A] block font-medium">Remaining</span>
                          <span className="font-extrabold text-[#171717]">{sub.remaining}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-[#FAFAFC] border border-[#E8E3D7]/60">
                          <span className="text-[10px] text-[#7A7A7A] block font-medium">Safe Skips</span>
                          <span className="font-extrabold text-[#45B36B]">{sub.safe_absences}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Attendance Actions */}
                    <div className="mt-4 pt-3 border-t border-[#E8E3D7] flex items-center gap-2">
                      <button
                        disabled={updatingId === sub.id}
                        onClick={() => handleQuickLog(sub.id, "PRESENT")}
                        className="flex-1 py-1.5 rounded-full text-xs font-bold bg-[#FAFAFC] hover:bg-[#45B36B]/15 hover:text-[#2F8A4F] text-[#171717] border border-[#E8E3D7] transition-all"
                      >
                        + Present
                      </button>
                      <button
                        disabled={updatingId === sub.id}
                        onClick={() => handleQuickLog(sub.id, "ABSENT")}
                        className="flex-1 py-1.5 rounded-full text-xs font-bold bg-[#FAFAFC] hover:bg-[#E74C3C]/15 hover:text-[#C0392B] text-[#171717] border border-[#E8E3D7] transition-all"
                      >
                        - Absent
                      </button>
                      <button
                        onClick={() => onSimulateSubject(sub.code)}
                        className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#FFF8D6] text-[#8F7500] hover:bg-[#FFD81A] hover:text-[#171717] border border-[#FFD81A]/40 transition-all"
                      >
                        Simulate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PLANNING PANEL (1 COLUMN) (Sections 19, 24–27) */}
        <div className="space-y-6">
          {/* Mission Card (Subtle Gamification: Apple Fitness style) (Section 27) */}
          <div className="card-premium p-6 relative overflow-hidden bg-gradient-to-br from-[#FFFDF8] to-[#FFF8D6] border-[#FFD81A]/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFD81A] flex items-center justify-center text-[#171717] font-bold shadow-sm">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8F7500]">
                    Academic Streak
                  </span>
                  <h4 className="text-xs font-bold text-[#171717]">Level 4 Scholar</h4>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[#171717]">820 / 1000 XP</span>
            </div>

            {/* XP Bar */}
            <div className="w-full h-2 rounded-full bg-[#EFECE0] overflow-hidden">
              <div className="w-[82%] h-full bg-[#FFD81A] rounded-full" />
            </div>

            <div className="p-3 rounded-2xl bg-[#FFFDF8] border border-[#E8E3D7] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#FF8A3D]" />
                <span className="font-bold text-[#171717]">Today&apos;s Mission:</span>
              </div>
              <span className="font-semibold text-[#7A7A7A]">Attend 3 scheduled classes</span>
            </div>
          </div>

          {/* Upcoming Classes Widget (Section 19) */}
          <div className="card-premium p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7A7A]">
                Upcoming Classes
              </h4>
              <span className="text-xs font-bold text-[#8F7500]">Next Up</span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#45B36B]" />
                  <div>
                    <h5 className="text-xs font-extrabold text-[#171717]">DBMS &amp; Architecture</h5>
                    <p className="text-[11px] text-[#7A7A7A] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> 01:20 PM • IST 416
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#45B36B]/15 text-[#2F8A4F]">
                  SAFE
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A3D]" />
                  <div>
                    <h5 className="text-xs font-extrabold text-[#171717]">Transforms &amp; Boundary</h5>
                    <p className="text-[11px] text-[#7A7A7A] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> Tomorrow, 09:00 AM • IST 416
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF8A3D]/15 text-[#D36315]">
                  WATCH
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E74C3C]" />
                  <div>
                    <h5 className="text-xs font-extrabold text-[#171717]">Digital Logic Design</h5>
                    <p className="text-[11px] text-[#7A7A7A] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> Friday, 10:50 AM • TB-106
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E74C3C]/15 text-[#C0392B]">
                  CRITICAL
                </span>
              </div>
            </div>
          </div>

          {/* Attendance Risk Meter (5 Circular Metrics) (Section 26) */}
          <div className="card-premium p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7A7A]">
                Attendance Risk Meter
              </h4>
              <span className="text-[10px] font-bold font-mono text-[#8F7500]">VERIFIED</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7]">
                <div className="w-10 h-10 mx-auto rounded-full border-3 border-[#FFD81A] flex items-center justify-center font-extrabold text-xs text-[#171717]">
                  5d
                </div>
                <span className="text-[10px] text-[#7A7A7A] font-bold block mt-1.5">Streak</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7]">
                <div className="w-10 h-10 mx-auto rounded-full border-3 border-[#45B36B] flex items-center justify-center font-extrabold text-xs text-[#45B36B]">
                  85%
                </div>
                <span className="text-[10px] text-[#7A7A7A] font-bold block mt-1.5">Safe Zone</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7]">
                <div className="w-10 h-10 mx-auto rounded-full border-3 border-[#7A3DF0] flex items-center justify-center font-extrabold text-xs text-[#7A3DF0]">
                  92%
                </div>
                <span className="text-[10px] text-[#7A7A7A] font-bold block mt-1.5">Weekly Goal</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7]">
                <div className="w-10 h-10 mx-auto rounded-full border-3 border-[#4C6EF5] flex items-center justify-center font-extrabold text-xs text-[#4C6EF5]">
                  89%
                </div>
                <span className="text-[10px] text-[#7A7A7A] font-bold block mt-1.5">Semester Health</span>
              </div>
            </div>
          </div>

          {/* Safe Skip Calendar Widget (Section 24 & 25) */}
          <div className="card-premium p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7A7A]">
                Safe Skip Calendar
              </h4>
              <span className="text-xs font-bold text-[#171717]">Sept 2026</span>
            </div>

            {/* Mini Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} className="text-[10px] font-bold text-[#7A7A7A] py-1">
                  {d}
                </span>
              ))}

              {[21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 1, 2, 3, 4].map((dayNum, i) => {
                const isSelected = calendarSelectedDate === dayNum;
                const isGreen = dayNum === 23 || dayNum === 25 || dayNum === 29;
                const isRed = dayNum === 24 || dayNum === 30;

                return (
                  <button
                    key={i}
                    onClick={() => setCalendarSelectedDate(dayNum)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-[#FFD81A] text-[#171717] shadow-sm font-extrabold scale-105"
                        : isGreen
                        ? "bg-[#45B36B]/15 text-[#2F8A4F] hover:bg-[#45B36B]/25"
                        : isRed
                        ? "bg-[#E74C3C]/12 text-[#C0392B] hover:bg-[#E74C3C]/20"
                        : "text-[#171717] hover:bg-[#EFECE0]"
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Calendar Intelligence Explanation (Section 25) */}
            <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7] text-xs space-y-1">
              <p className="font-extrabold text-[#171717]">Sept {calendarSelectedDate}, 2026</p>
              <p className="text-[11px] text-[#7A7A7A]">
                {calendarSelectedDate === 28
                  ? "3 classes scheduled. Safe to attend; skipping DLD today would drop you into critical recovery."
                  : calendarSelectedDate === 29
                  ? "Safe Skip Day: Skipping Chemistry will keep attendance comfortably at 82.5%."
                  : "Regular academic day. 4 periods active."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
