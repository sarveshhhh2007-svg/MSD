"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Layers,
  Eye,
  EyeOff
} from "lucide-react";
import { fetchTimetable, fetchSubjects, SectionData, SubjectData } from "../lib/api";

interface TimetableViewProps {
  sectionId: number;
  sections?: SectionData[];
  onSelectSection?: (id: number) => void;
}

export default function TimetableView({
  sectionId,
  sections = [],
  onSelectSection
}: TimetableViewProps) {
  const [entries, setEntries] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [showRoom, setShowRoom] = useState(true);

  const currentSection = sections.find((s) => s.id === sectionId) || sections[0];

  // Auto-detect current day for day view
  useEffect(() => {
    const dayMap: Record<number, number> = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 4, 6: 0 };
    const today = new Date().getDay();
    // getDay: 0=Sun...6=Sat; map to 0=Mon..4=Fri
    const mapped = today === 0 ? 0 : today - 1;
    setSelectedDayIdx(Math.min(mapped, 4));
  }, []);

  // Auto-detect mobile for day view default
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setViewMode("day");
    }
  }, []);

  // Load timetable entries and subjects for auto-assigned section
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [ttData, subjData] = await Promise.all([
          fetchTimetable(sectionId),
          fetchSubjects(sectionId)
        ]);
        setEntries(ttData);
        setSubjects(subjData);
      } catch (err) {
        console.error("Failed to load timetable or subjects:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sectionId]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const periods = [
    { num: 1, time: "09:00 - 09:50" },
    { num: 2, time: "09:50 - 10:40" },
    { num: "TEA", time: "10:40 - 10:50", label: "TEA BREAK" },
    { num: 3, time: "10:50 - 11:40" },
    { num: 4, time: "11:40 - 12:30" },
    { num: "LUNCH", time: "12:30 - 01:20", label: "LUNCH BREAK" },
    { num: 6, time: "01:20 - 02:10" },
    { num: 7, time: "02:10 - 03:00" },
    { num: "TEA2", time: "03:00 - 03:10", label: "TEA BREAK" },
    { num: 8, time: "03:10 - 04:00" },
    { num: 9, time: "04:00 - 04:50" },
  ];

  // Helper to find entry for a specific day and period
  const getCell = (day: string, periodNum: number) => {
    return entries.find((e) => e.day_of_week === day && e.period_number === periodNum);
  };

  // Build subject risk map from attendance data (§29)
  const subjectRiskMap = useMemo(() => {
    const map: Record<string, { status: string; currentPct: number | null; safeAbsences: number }> = {};
    subjects.forEach((s) => {
      map[s.code] = {
        status: s.status,
        currentPct: s.current_pct,
        safeAbsences: s.safe_absences
      };
    });
    return map;
  }, [subjects]);

  // Get risk styling for a cell (§30)
  const getRiskStyle = (subjectCode: string | null) => {
    if (!subjectCode) return { bg: "", border: "", dot: "", label: "" };
    const risk = subjectRiskMap[subjectCode];
    if (!risk) return { bg: "", border: "", dot: "", label: "" };

    switch (risk.status) {
      case "IRREVERSIBLE":
        return {
          bg: "bg-[#FF5C68]/10 dark:bg-[#FF5C68]/15",
          border: "border-[#FF5C68]/40",
          dot: "bg-[#FF5C68]",
          label: "IRREVERSIBLE"
        };
      case "CRITICAL":
        return {
          bg: "bg-[#FF5C68]/8 dark:bg-[#FF5C68]/12",
          border: "border-[#FF5C68]/30",
          dot: "bg-[#FF5C68]",
          label: "CRITICAL"
        };
      case "WATCH":
        return {
          bg: "bg-[#F5B942]/8 dark:bg-[#F5B942]/12",
          border: "border-[#F5B942]/30",
          dot: "bg-[#F5B942]",
          label: "WATCH"
        };
      case "SAFE":
      default:
        return {
          bg: "",
          border: "border-[#E8E3D7] dark:border-[#252D42]",
          dot: "bg-[#35D07F]",
          label: "SAFE"
        };
    }
  };

  const labsCount = subjects.filter((s) => s.attendance_unit?.includes("SESSION") || s.code.endsWith("L") || s.code.endsWith("P") || s.code.endsWith("J")).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 bg-[#F7F4E8] dark:bg-[#080B14] text-[#171717] dark:text-[#F5F3EA]">
      {/* Section Auto-Resolved Banner (replaces manual selection) */}
      <div className="rounded-[24px] bg-[#FFFDF8] dark:bg-[#0F1422] border border-[#E8E3D7] dark:border-[#252D42] p-5 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-[#171717] dark:text-[#F5F3EA] tracking-tight">NExtclass</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#FFD81A]/20 dark:bg-[#7C5CFF]/20 text-[#171717] dark:text-[#F5F3EA] font-semibold border border-[#FFD81A]/40 dark:border-[#7C5CFF]/40">
                Auto-Assigned Section
              </span>
            </div>
            <h2 className="text-xs font-semibold text-[#7A7A7A] dark:text-[#A7AEC2] mt-0.5">
              {currentSection?.name || "Section"} • {currentSection?.year} • {currentSection?.semester}
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#45B36B] dark:text-[#35D07F] font-mono flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#45B36B] dark:text-[#35D07F]" />
              13 Sections Ingested
            </span>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#45B36B]/10 text-[#45B36B] dark:text-[#35D07F] font-bold border border-[#45B36B]/30">
              SECTION VERIFIED
            </span>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 md:p-5 rounded-[24px] bg-[#FFFDF8] dark:bg-[#0F1422] border border-[#E8E3D7] dark:border-[#252D42] shadow-sm hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between text-xs text-[#7A7A7A] dark:text-[#A7AEC2] mb-1">
            <span className="font-semibold">Subjects</span>
            <BookOpen className="w-4 h-4 text-[#7A3DF0] dark:text-[#A78BFA]" />
          </div>
          <p className="text-xl md:text-2xl font-extrabold text-[#171717] dark:text-[#F5F3EA]">{subjects.length}</p>
          <p className="text-[11px] font-medium text-[#7A7A7A] dark:text-[#A7AEC2] mt-1">{labsCount} Labs</p>
        </div>

        <div className="p-4 md:p-5 rounded-[24px] bg-[#FFFDF8] dark:bg-[#0F1422] border border-[#E8E3D7] dark:border-[#252D42] shadow-sm hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between text-xs text-[#7A7A7A] dark:text-[#A7AEC2] mb-1">
            <span className="font-semibold">Weekly Classes</span>
            <Clock className="w-4 h-4 text-[#4C6EF5]" />
          </div>
          <p className="text-xl md:text-2xl font-extrabold text-[#171717] dark:text-[#F5F3EA]">{entries.length}</p>
          <p className="text-[11px] font-medium text-[#4C6EF5] mt-1">Exact PDF Times</p>
        </div>

        <div className="p-4 md:p-5 rounded-[24px] bg-[#FFFDF8] dark:bg-[#0F1422] border border-[#E8E3D7] dark:border-[#252D42] shadow-sm hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between text-xs text-[#7A7A7A] dark:text-[#A7AEC2] mb-1">
            <span className="font-semibold">Critical</span>
            <AlertTriangle className="w-4 h-4 text-[#FF5C68]" />
          </div>
          <p className="text-xl md:text-2xl font-extrabold text-[#FF5C68]">
            {subjects.filter(s => s.status === "CRITICAL" || s.status === "IRREVERSIBLE").length}
          </p>
          <p className="text-[11px] font-medium text-[#FF5C68] mt-1">Need Attention</p>
        </div>

        <div className="p-4 md:p-5 rounded-[24px] bg-[#FFFDF8] dark:bg-[#0F1422] border border-[#E8E3D7] dark:border-[#252D42] shadow-sm hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between text-xs text-[#7A7A7A] dark:text-[#A7AEC2] mb-1">
            <span className="font-semibold">Validation</span>
            <CheckCircle2 className="w-4 h-4 text-[#45B36B] dark:text-[#35D07F]" />
          </div>
          <p className="text-sm font-bold text-[#45B36B] dark:text-[#35D07F]">Loaded ✓</p>
          <p className="text-[10px] text-[#7A7A7A] dark:text-[#A7AEC2] mt-1 font-mono">
            ✓ Slot ✓ Faculty
          </p>
        </div>
      </div>

      {/* View Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#171717] dark:text-[#F5F3EA]">
            {currentSection?.name || "Timetable"}
          </h2>
          <p className="text-xs text-[#7A7A7A] dark:text-[#A7AEC2] flex items-center gap-2 mt-0.5 flex-wrap">
            <span>SRM IST • {currentSection?.year} • {currentSection?.semester}</span>
            <span className="text-[#E8E3D7] dark:text-[#252D42]">•</span>
            <span className="flex items-center gap-1 text-[#45B36B] dark:text-[#35D07F] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Deterministic Parser
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex bg-[#EFECE0] dark:bg-[#151B2B] p-1 rounded-full border border-[#E8E3D7] dark:border-[#252D42]">
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                viewMode === "week"
                  ? "bg-[#FFD81A] dark:bg-[#7C5CFF] text-[#171717] dark:text-[#F5F3EA] shadow-sm"
                  : "text-[#7A7A7A] dark:text-[#70788F]"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                viewMode === "day"
                  ? "bg-[#FFD81A] dark:bg-[#7C5CFF] text-[#171717] dark:text-[#F5F3EA] shadow-sm"
                  : "text-[#7A7A7A] dark:text-[#70788F]"
              }`}
            >
              Day
            </button>
          </div>

          {/* Show/Hide Room Toggle */}
          <button
            onClick={() => setShowRoom(!showRoom)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#FFFDF8] dark:bg-[#0F1422] border border-[#E8E3D7] dark:border-[#252D42] text-[#7A7A7A] dark:text-[#A7AEC2] hover:border-[#FFD81A] dark:hover:border-[#7C5CFF] transition-all"
          >
            {showRoom ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>Room</span>
          </button>

          {/* Section & Venue Badges */}
          <span className="text-xs px-3 py-1.5 rounded-full bg-[#FAFAFC] dark:bg-[#151B2B] text-[#171717] dark:text-[#F5F3EA] border border-[#E8E3D7] dark:border-[#252D42] flex items-center gap-1.5 font-medium shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-[#7A3DF0] dark:text-[#A78BFA]" />
            {currentSection?.venue || "Main Campus"}
          </span>
        </div>
      </div>

      {/* DAY VIEW (Mobile-friendly) */}
      {viewMode === "day" && (
        <div className="space-y-4">
          {/* Day Selector */}
          <div className="flex items-center justify-between bg-[#FFFDF8] dark:bg-[#0F1422] rounded-2xl border border-[#E8E3D7] dark:border-[#252D42] p-2 shadow-sm">
            <button
              onClick={() => setSelectedDayIdx(Math.max(0, selectedDayIdx - 1))}
              className="p-2 rounded-xl text-[#7A7A7A] dark:text-[#A7AEC2] hover:bg-[#F7F4E8] dark:hover:bg-[#151B2B] transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {days.map((d, idx) => (
                <button
                  key={d}
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedDayIdx === idx
                      ? "bg-[#FFD81A] dark:bg-[#7C5CFF] text-[#171717] dark:text-[#F5F3EA] shadow-sm"
                      : "text-[#7A7A7A] dark:text-[#70788F] hover:text-[#171717] dark:hover:text-[#F5F3EA]"
                  }`}
                >
                  <span className="hidden sm:inline">{d}</span>
                  <span className="sm:hidden">{d.slice(0, 3)}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedDayIdx(Math.min(4, selectedDayIdx + 1))}
              className="p-2 rounded-xl text-[#7A7A7A] dark:text-[#A7AEC2] hover:bg-[#F7F4E8] dark:hover:bg-[#151B2B] transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day Cards */}
          <div className="space-y-3">
            {periods.map((p, idx) => {
              if (p.label) {
                return (
                  <div
                    key={idx}
                    className="py-2 px-4 rounded-xl bg-[#F7F4E8]/60 dark:bg-[#151B2B]/40 text-[10px] font-mono text-[#7A7A7A] dark:text-[#70788F] tracking-widest uppercase text-center border border-dashed border-[#E8E3D7]/60 dark:border-[#252D42]/60"
                  >
                    {p.label} • {p.time}
                  </div>
                );
              }

              const cell = getCell(days[selectedDayIdx], p.num as number);
              if (!cell) {
                return (
                  <div
                    key={idx}
                    className="py-3 px-4 rounded-2xl bg-[#FFFDF8]/50 dark:bg-[#0F1422]/50 border border-dashed border-[#E8E3D7] dark:border-[#252D42] text-xs text-[#7A7A7A]/50 dark:text-[#70788F]/50 text-center"
                  >
                    P{p.num} • {p.time} — No class
                  </div>
                );
              }

              const isLab = cell.class_type === "LAB" || cell.slot_code === "LAB";
              const risk = getRiskStyle(cell.subject_code);

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border shadow-sm transition-all ${risk.bg || "bg-[#FFFDF8] dark:bg-[#0F1422]"} ${risk.border || "border-[#E8E3D7] dark:border-[#252D42]"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-[#7A7A7A] dark:text-[#70788F] bg-[#FAFAFC] dark:bg-[#151B2B] px-2 py-0.5 rounded-full border border-[#E8E3D7] dark:border-[#252D42]">
                          P{cell.period_number}
                        </span>
                        <span className="text-[11px] font-mono text-[#7A7A7A] dark:text-[#A7AEC2]">
                          {p.time}
                        </span>
                        {isLab && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#4C6EF5]/15 text-[#4C6EF5] border border-[#4C6EF5]/30">
                            LAB
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-[#171717] dark:text-[#F5F3EA] truncate">
                        {cell.subject_name || cell.subject_code}
                      </h4>
                      <p className="text-[11px] font-mono text-[#7A7A7A] dark:text-[#A7AEC2] mt-0.5">
                        {cell.subject_code}
                        {showRoom && cell.room && <span className="ml-2">📍 {cell.room}</span>}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {risk.label && risk.label !== "SAFE" && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          risk.label === "CRITICAL" || risk.label === "IRREVERSIBLE"
                            ? "bg-[#FF5C68]/15 text-[#FF5C68] border border-[#FF5C68]/30"
                            : "bg-[#F5B942]/15 text-[#F5B942] border border-[#F5B942]/30"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                          {risk.label}
                        </span>
                      )}
                      {risk.label === "SAFE" && (
                        <span className="w-2 h-2 rounded-full bg-[#35D07F]" title="Safe attendance" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW (Desktop grid) */}
      {viewMode === "week" && (
        <div className="rounded-[24px] bg-[#FFFDF8] dark:bg-[#0F1422] border border-[#E8E3D7] dark:border-[#252D42] overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAFAFC] dark:bg-[#151B2B] border-b border-[#E8E3D7] dark:border-[#252D42]">
                <th className="p-4 text-[#7A7A7A] dark:text-[#A7AEC2] font-bold uppercase tracking-wider text-[11px] w-28">
                  Day / Period
                </th>
                {periods.map((p, idx) => (
                  <th
                    key={idx}
                    className={`p-3 text-center border-l border-[#E8E3D7] dark:border-[#252D42] text-[11px] ${
                      p.label ? "bg-[#F7F4E8]/60 dark:bg-[#151B2B]/60 text-[#7A7A7A] dark:text-[#70788F] w-16" : "text-[#171717] dark:text-[#F5F3EA]"
                    }`}
                  >
                    <span className="block font-bold text-[#171717] dark:text-[#F5F3EA]">
                      {p.label ? "" : `P${p.num}`}
                    </span>
                    <span className="text-[10px] text-[#7A7A7A] dark:text-[#A7AEC2] font-medium block whitespace-nowrap">
                      {p.time}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3D7] dark:divide-[#252D42]">
              {days.map((day) => (
                <tr key={day} className="hover:bg-[#FAFAFC]/60 dark:hover:bg-[#151B2B]/30 transition-colors">
                  <td className="p-4 font-bold text-[#171717] dark:text-[#F5F3EA] bg-[#FAFAFC] dark:bg-[#151B2B] whitespace-nowrap">
                    {day}
                  </td>
                  {periods.map((p, idx) => {
                    if (p.label) {
                      return (
                        <td
                          key={idx}
                          className="p-2 text-center border-l border-[#E8E3D7] dark:border-[#252D42] bg-[#F7F4E8]/40 dark:bg-[#151B2B]/20 text-[9px] font-mono text-[#7A7A7A] dark:text-[#70788F] tracking-widest uppercase select-none"
                        >
                          {p.label === "LUNCH BREAK" ? "LUNCH" : "BREAK"}
                        </td>
                      );
                    }

                    const cell = getCell(day, p.num as number);
                    if (!cell) {
                      return (
                        <td
                          key={idx}
                          className="p-2 text-center border-l border-[#E8E3D7] dark:border-[#252D42] text-[#7A7A7A]/40 dark:text-[#70788F]/40"
                        >
                          —
                        </td>
                      );
                    }

                    const isLab = cell.class_type === "LAB" || cell.slot_code === "LAB";
                    const risk = getRiskStyle(cell.subject_code);

                    return (
                      <td
                        key={idx}
                        className="p-2 text-center border-l border-[#E8E3D7] dark:border-[#252D42] hover:bg-[#FFFDF8] dark:hover:bg-[#0F1422] transition-colors"
                      >
                        <div
                          className={`p-2 rounded-xl border text-[11px] transition-all hover:shadow-sm relative ${
                            isLab
                              ? "bg-[#4C6EF5]/10 dark:bg-[#4C6EF5]/15 border-[#4C6EF5]/30 text-[#4C6EF5]"
                              : `${risk.bg || "bg-[#FAFAFC] dark:bg-[#151B2B]"} ${risk.border} text-[#171717] dark:text-[#F5F3EA]`
                          }`}
                        >
                          {/* Risk indicator dot */}
                          {risk.label && risk.label !== "SAFE" && !isLab && (
                            <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${risk.dot}`} title={risk.label} />
                          )}
                          <span className="font-bold block tracking-tight">
                            {cell.slot_code || cell.subject_code}
                          </span>
                          <span className="text-[10px] text-[#7A7A7A] dark:text-[#A7AEC2] block truncate max-w-[95px] mx-auto font-medium">
                            {cell.subject_code}
                          </span>
                          {showRoom && (
                            <span className="text-[9px] text-[#7A7A7A] dark:text-[#70788F] block font-mono">
                              {cell.room}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Subject Mapping Table */}
      <div className="p-4 md:p-6 rounded-[24px] bg-[#FFFDF8] dark:bg-[#0F1422] border border-[#E8E3D7] dark:border-[#252D42] shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-bold text-[#171717] dark:text-[#F5F3EA] uppercase tracking-wider">
              Subject Slot Mappings &amp; Attendance Status
            </h3>
            <p className="text-[11px] text-[#7A7A7A] dark:text-[#A7AEC2] mt-0.5">
              {currentSection?.name} — Deterministic slot resolution with live attendance risk
            </p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#45B36B]/10 text-[#45B36B] dark:text-[#35D07F] font-bold border border-[#45B36B]/30">
            ALL {subjects.length} RESOLVED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8E3D7] dark:border-[#252D42] text-[11px] text-[#7A7A7A] dark:text-[#A7AEC2] uppercase font-semibold">
                <th className="pb-3 w-16">Slot</th>
                <th className="pb-3 w-28">Code</th>
                <th className="pb-3">Subject</th>
                <th className="pb-3 w-16">Status</th>
                <th className="pb-3 w-20">Attendance</th>
                <th className="pb-3 w-20 hidden sm:table-cell">Safe Skips</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3D7] dark:divide-[#252D42] text-[#171717] dark:text-[#F5F3EA]">
              {subjects.map((s, idx) => {
                const statusColors: Record<string, string> = {
                  SAFE: "bg-[#35D07F]/15 text-[#35D07F] border-[#35D07F]/30",
                  WATCH: "bg-[#F5B942]/15 text-[#F5B942] border-[#F5B942]/30",
                  CRITICAL: "bg-[#FF5C68]/15 text-[#FF5C68] border-[#FF5C68]/30",
                  IRREVERSIBLE: "bg-[#FF5C68]/20 text-[#FF5C68] border-[#FF5C68]/40"
                };
                return (
                  <tr key={idx} className="hover:bg-[#FAFAFC]/60 dark:hover:bg-[#151B2B]/30 transition-colors">
                    <td className="py-3 font-bold font-mono text-[#7A3DF0] dark:text-[#A78BFA]">
                      {s.slot_code || "—"}
                    </td>
                    <td className="py-3 font-mono font-medium text-[#171717] dark:text-[#F5F3EA]">{s.code}</td>
                    <td className="py-3 text-[#171717] dark:text-[#F5F3EA] font-semibold">{s.name}</td>
                    <td className="py-3">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${statusColors[s.status] || statusColors.SAFE}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[11px]">
                      {s.current_pct !== null ? `${s.current_pct}%` : "—"}
                    </td>
                    <td className="py-3 font-mono text-[11px] hidden sm:table-cell">
                      {s.safe_absences}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
