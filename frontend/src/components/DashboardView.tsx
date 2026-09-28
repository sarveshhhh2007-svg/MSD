"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  Info,
  Clock,
  Plus,
  Minus,
  Sparkles,
  ChevronRight
} from "lucide-react";
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

  if (!summary) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin" />
          <p className="text-xs text-[#70788F]">Loading academic intelligence...</p>
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

  const getStatusBadge = (status: string, safeAbsences: number) => {
    switch (status) {
      case "SAFE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold badge-safe">
            <span className="w-1.5 h-1.5 rounded-full bg-[#35D07F]" />
            SAFE
          </span>
        );
      case "WATCH":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold badge-caution">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5B942]" />
            WATCH ({safeAbsences} left)
          </span>
        );
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold badge-critical">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C68]" />
            CRITICAL
          </span>
        );
      case "IRREVERSIBLE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FF5C68]/15 text-[#FF5C68] border border-[#FF5C68]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C68]" />
            IRREVERSIBLE
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Top Section: Overall Attendance & Semester Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Large Primary Card: Overall Attendance */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-[#0F1422] border border-[#252D42] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-medium text-[#70788F]">
                Overall Attendance
              </p>
              <div className="flex items-baseline gap-3 mt-1.5">
                <span className="text-4xl font-extrabold tracking-tight text-[#F5F3EA]">
                  {summary.overall_attendance}%
                </span>
                <span className="flex items-center text-xs font-semibold text-[#35D07F]">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  +2.1% from previous period
                </span>
              </div>
            </div>

            {/* Target indicator */}
            <div className="text-right">
              <span className="text-[11px] text-[#70788F]">Target Threshold</span>
              <p className="text-sm font-semibold text-[#F5F3EA]">
                {Math.round(selectedTarget * 100)}%
              </p>
            </div>
          </div>

          {/* Transparent Metric Breakdown (Section 8) */}
          <div className="mt-6 pt-5 border-t border-[#252D42] grid grid-cols-5 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-[#151B2B] border border-[#252D42]">
              <span className="text-xs text-[#70788F] block">Subjects</span>
              <span className="text-base font-bold text-[#F5F3EA]">
                {summary.total_subjects}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#151B2B] border border-[#252D42]">
              <span className="text-xs text-[#35D07F] block">Safe</span>
              <span className="text-base font-bold text-[#35D07F]">
                {summary.safe_count}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#151B2B] border border-[#252D42]">
              <span className="text-xs text-[#F5B942] block">Watch</span>
              <span className="text-base font-bold text-[#F5F3EA]">
                {summary.watch_count}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#151B2B] border border-[#252D42]">
              <span className="text-xs text-[#FF5C68] block">Critical</span>
              <span className="text-base font-bold text-[#FF5C68]">
                {summary.critical_count}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#151B2B] border border-[#252D42]">
              <span className="text-xs text-[#70788F] block">Irreversible</span>
              <span className="text-base font-bold text-[#F5F3EA]">
                {summary.irreversible_count}
              </span>
            </div>
          </div>
        </div>

        {/* Semester Planning & Decision Card */}
        <div className="p-6 rounded-xl bg-[#0F1422] border border-[#252D42] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#A7AEC2] uppercase tracking-wider">
                Planning Intelligence
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#7C5CFF]/15 text-[#9278FF] border border-[#7C5CFF]/30 font-medium">
                DETERMINISTIC
              </span>
            </div>
            <p className="text-xs text-[#A7AEC2] leading-relaxed">
              Your attendance isn&apos;t just a percentage. It&apos;s an exact planning problem solved with rational integer arithmetic.
            </p>

            <div className="mt-4 space-y-2">
              <button
                onClick={() =>
                  onOpenAdvisorWithPrompt(
                    "If I take a 3-day sick leave starting tomorrow, will Digital Logic drop below 75%?"
                  )
                }
                className="w-full text-left p-2.5 rounded-lg bg-[#151B2B] hover:bg-[#151B2B]/80 border border-[#252D42] transition-colors group flex items-center justify-between"
              >
                <span className="text-xs text-[#F5F3EA] truncate">
                  &ldquo;Will a 3-day sick leave drop DLD?&rdquo;
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#7C5CFF] shrink-0" />
              </button>

              <button
                onClick={() =>
                  onOpenAdvisorWithPrompt("How many classes can I safely miss in Maths?")
                }
                className="w-full text-left p-2.5 rounded-lg bg-[#151B2B] hover:bg-[#151B2B]/80 border border-[#252D42] transition-colors group flex items-center justify-between"
              >
                <span className="text-xs text-[#F5F3EA] truncate">
                  &ldquo;How many classes can I safely miss in Maths?&rdquo;
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#7C5CFF] shrink-0" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#252D42] flex items-center justify-between text-[11px] text-[#70788F]">
            <span>Next class occurrence</span>
            <span className="text-[#F5F3EA] font-medium">01:20 PM • DBMS Lab</span>
          </div>
        </div>
      </div>

      {/* Critical Class Reminders (Section 36) */}
      {summary.reminders && summary.reminders.length > 0 && (
        <div className="space-y-2">
          {summary.reminders.map((rem, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                rem.type === "CRITICAL"
                  ? "bg-[#FF5C68]/10 border-[#FF5C68]/30 text-[#FF5C68]"
                  : "bg-[#F5B942]/10 border-[#F5B942]/30 text-[#F5B942]"
              }`}
            >
              <div className="flex items-center gap-3">
                {rem.type === "CRITICAL" ? (
                  <AlertCircle className="w-5 h-5 shrink-0 text-[#FF5C68]" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0 text-[#F5B942]" />
                )}
                <div>
                  <span className="font-bold text-xs uppercase tracking-wide mr-2">
                    {rem.type} ALERT:
                  </span>
                  <span className="text-xs text-[#F5F3EA]">{rem.message}</span>
                </div>
              </div>
              <button
                onClick={() => onSimulateSubject(rem.code)}
                className="px-2.5 py-1 rounded bg-[#0F1422] text-xs font-medium text-[#F5F3EA] border border-[#252D42] hover:border-[#7C5CFF] transition-colors shrink-0 ml-4"
              >
                Simulate Recovery
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Subject Attendance Cards Grid (Section 9) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[#F5F3EA]">
              Subject Attendance &amp; Recovery Engine
            </h2>
            <p className="text-xs text-[#70788F]">
              Real-time calculation against {Math.round(selectedTarget * 100)}% target requirement
            </p>
          </div>
          <span className="text-xs text-[#70788F]">
            {summary.subjects.length} Enrolled Courses
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {summary.subjects.map((sub) => {
            const isCritical = sub.status === "CRITICAL";
            const isWatch = sub.status === "WATCH";
            const isSafe = sub.status === "SAFE";
            const isIrrev = sub.status === "IRREVERSIBLE";

            const borderHighlight = isCritical
              ? "border-[#FF5C68]/40 hover:border-[#FF5C68]"
              : isWatch
              ? "border-[#F5B942]/40 hover:border-[#F5B942]"
              : "border-[#252D42] hover:border-[#384566]";

            return (
              <div
                key={sub.id}
                className={`p-5 rounded-xl bg-[#0F1422] border ${borderHighlight} transition-all flex flex-col justify-between`}
              >
                <div>
                  {/* Card Header: Subject Name & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-[#F5F3EA] truncate" title={sub.name}>
                        {sub.name}
                      </h3>
                      <p className="text-[11px] font-mono text-[#70788F]">
                        {sub.code} • {sub.slot_code ? `Slot ${sub.slot_code}` : "Lab"}
                      </p>
                    </div>
                    {getStatusBadge(sub.status, sub.safe_absences)}
                  </div>

                  {/* Primary Attendance Percentage Display */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-extrabold text-[#F5F3EA] tracking-tight">
                        {sub.current_pct !== null ? `${sub.current_pct}%` : "N/A"}
                      </span>
                      <span className="text-[11px] text-[#70788F] ml-1.5">
                        Target {Math.round(selectedTarget * 100)}%
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase text-[#70788F] block">Max Reachable</span>
                      <span className="text-xs font-semibold text-[#A7AEC2]">
                        {sub.max_possible}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar with Target Marker */}
                  <div className="mt-3 relative w-full h-1.5 bg-[#151B2B] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical
                          ? "bg-[#FF5C68]"
                          : isWatch
                          ? "bg-[#F5B942]"
                          : "bg-[#35D07F]"
                      }`}
                      style={{ width: `${Math.min(100, sub.current_pct || 0)}%` }}
                    />
                  </div>

                  {/* Deterministic Data Table (Section 9) */}
                  <div className="mt-4 pt-3 border-t border-[#252D42] grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-1.5 rounded bg-[#151B2B]">
                      <span className="text-[10px] text-[#70788F] block">Conducted</span>
                      <span className="font-semibold text-[#F5F3EA]">{sub.conducted}</span>
                    </div>
                    <div className="p-1.5 rounded bg-[#151B2B]">
                      <span className="text-[10px] text-[#70788F] block">Attended</span>
                      <span className="font-semibold text-[#F5F3EA]">{sub.attended}</span>
                    </div>
                    <div className="p-1.5 rounded bg-[#151B2B]">
                      <span className="text-[10px] text-[#70788F] block">Remaining</span>
                      <span className="font-semibold text-[#F5F3EA]">{sub.remaining}</span>
                    </div>
                  </div>

                  {/* Safe Absences & Required to Recover */}
                  <div className="mt-2.5 p-2 rounded-lg bg-[#151B2B] border border-[#252D42] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-[#70788F] block">Required Classes</span>
                      <span
                        className={`font-bold ${
                          sub.required > 0 ? "text-[#FF5C68]" : "text-[#35D07F]"
                        }`}
                      >
                        {sub.required} to recover
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#70788F] block">Safe Absences</span>
                      <span
                        className={`font-bold ${
                          sub.safe_absences === 0 ? "text-[#FF5C68]" : "text-[#35D07F]"
                        }`}
                      >
                        {sub.safe_absences} classes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Attendance Daily Update */}
                <div className="mt-4 pt-3 border-t border-[#252D42] flex items-center justify-between gap-1.5">
                  <button
                    disabled={updatingId === sub.id}
                    onClick={() => handleQuickLog(sub.id, "PRESENT")}
                    className="flex-1 py-1 px-2 rounded text-[11px] font-medium bg-[#151B2B] hover:bg-[#35D07F]/20 hover:text-[#35D07F] text-[#A7AEC2] border border-[#252D42] transition-colors"
                  >
                    + Present
                  </button>
                  <button
                    disabled={updatingId === sub.id}
                    onClick={() => handleQuickLog(sub.id, "ABSENT")}
                    className="flex-1 py-1 px-2 rounded text-[11px] font-medium bg-[#151B2B] hover:bg-[#FF5C68]/20 hover:text-[#FF5C68] text-[#A7AEC2] border border-[#252D42] transition-colors"
                  >
                    - Absent
                  </button>
                  <button
                    onClick={() => onSimulateSubject(sub.code)}
                    className="p-1 px-2 rounded text-[11px] font-medium bg-[#7C5CFF]/15 text-[#9278FF] hover:bg-[#7C5CFF]/30 transition-colors"
                    title="Simulate leave or absence"
                  >
                    Simulate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Engine Panel (Section 29) */}
      <div className="p-6 rounded-xl bg-[#0F1422] border border-[#252D42]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[#F5F3EA]">
              Attendance Priority Ranking Engine
            </h2>
            <p className="text-xs text-[#70788F]">
              Deterministic prioritization based on safe absences, current deficit, and recovery pressure.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#7C5CFF]">
            NO BLACKBOX AI SCORES
          </span>
        </div>

        <div className="space-y-2.5">
          {summary.priorities.map((item, idx) => {
            const isHigh = item.priority_level === "HIGH" || item.priority_level === "IRREVERSIBLE";
            const isMed = item.priority_level === "MEDIUM";
            return (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#151B2B] border border-[#252D42] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isHigh
                        ? "bg-[#FF5C68]/20 text-[#FF5C68] border border-[#FF5C68]/30"
                        : isMed
                        ? "bg-[#F5B942]/20 text-[#F5B942] border border-[#F5B942]/30"
                        : "bg-[#35D07F]/20 text-[#35D07F] border border-[#35D07F]/30"
                    }`}
                  >
                    {item.priority_level}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#F5F3EA] truncate">
                      {item.subject_name} ({item.subject_code})
                    </p>
                    <p className="text-[11px] text-[#A7AEC2] leading-tight mt-0.5">
                      {item.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div>
                    <span className="text-[10px] text-[#70788F] block">Required Classes</span>
                    <span className="text-xs font-bold text-[#F5F3EA]">
                      {item.required_classes} / {item.remaining_classes}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#70788F] block">Safe Absences</span>
                    <span
                      className={`text-xs font-bold ${
                        item.safe_absences === 0 ? "text-[#FF5C68]" : "text-[#35D07F]"
                      }`}
                    >
                      {item.safe_absences}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
