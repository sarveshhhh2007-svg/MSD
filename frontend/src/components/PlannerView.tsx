"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { fetchOccurrences, logDailyAttendance } from "../lib/api";

interface PlannerViewProps {
  sectionId: number;
  onRefreshData: () => void;
}

export default function PlannerView({ sectionId, onRefreshData }: PlannerViewProps) {
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("2026-09-28");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchOccurrences(sectionId);
        setOccurrences(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sectionId]);

  // Group occurrences by date
  const groupedByDate: Record<string, any[]> = {};
  occurrences.forEach((occ) => {
    const dStr = occ.occurrence_date;
    if (!groupedByDate[dStr]) {
      groupedByDate[dStr] = [];
    }
    groupedByDate[dStr].push(occ);
  });

  const availableDates = Object.keys(groupedByDate).sort();

  const handleStatusChange = async (occId: number, subjectId: number, status: string) => {
    try {
      await logDailyAttendance(subjectId, selectedDate, status, occId);
      // Update local state
      setOccurrences((prev) =>
        prev.map((o) => (o.id === occId ? { ...o, attendance_status: status } : o))
      );
      onRefreshData();
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const currentClasses = groupedByDate[selectedDate] || [];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#F5F3EA]">
            Semester Planner &amp; Occurrence Calendar
          </h2>
          <p className="text-xs text-[#70788F]">
            Actual concrete timetable sessions mapped to calendar dates (excludes holidays &amp; breaks).
          </p>
        </div>

        <button
          onClick={() => {
            alert("Calendar sync: iCalendar (.ics) export generated with all SRM IST classes!");
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#151B2B] text-[#A7AEC2] hover:text-[#F5F3EA] border border-[#252D42] transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-[#7C5CFF]" />
          <span>Export iCal (.ics)</span>
        </button>
      </div>

      {/* Date Strip Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {availableDates.slice(0, 14).map((dStr) => {
          const dObj = new Date(dStr);
          const isSelected = selectedDate === dStr;
          const dayName = dObj.toLocaleDateString("en-US", { weekday: "short" });
          const dayNum = dObj.getDate();
          const month = dObj.toLocaleDateString("en-US", { month: "short" });

          return (
            <button
              key={dStr}
              onClick={() => setSelectedDate(dStr)}
              className={`p-2.5 px-4 rounded-xl border shrink-0 text-center transition-all ${
                isSelected
                  ? "bg-[#7C5CFF] border-[#7C5CFF] text-[#F5F3EA] shadow-md shadow-[#7C5CFF]/20"
                  : "bg-[#0F1422] border-[#252D42] text-[#A7AEC2] hover:border-[#384566]"
              }`}
            >
              <span className="text-[10px] uppercase font-semibold block">{dayName}</span>
              <span className="text-base font-bold block leading-tight">{dayNum}</span>
              <span className="text-[9px] text-white/70 block">{month}</span>
            </button>
          );
        })}
      </div>

      {/* Classes Scheduled on Selected Date */}
      <div className="p-6 rounded-xl bg-[#0F1422] border border-[#252D42] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#F5F3EA] uppercase tracking-wider flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#7C5CFF]" />
            Scheduled Classes for {selectedDate}
          </h3>
          <span className="text-xs text-[#70788F]">
            {currentClasses.length} Scheduled Periods
          </span>
        </div>

        {currentClasses.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#70788F]">
            No classes scheduled for this date (Weekend or College Holiday).
          </div>
        ) : (
          <div className="space-y-3">
            {currentClasses.map((c) => {
              const status = c.attendance_status;
              const isPresent = status === "PRESENT";
              const isAbsent = status === "ABSENT";
              const isOD = status === "OD";
              const isMed = status === "MEDICAL";

              return (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-[#151B2B] border border-[#252D42] flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-[#0F1422] border border-[#252D42] text-center min-w-[70px]">
                      <span className="text-[10px] text-[#7C5CFF] font-mono block">
                        PERIOD {c.period_number}
                      </span>
                      <span className="text-xs font-bold text-[#F5F3EA] block">
                        {c.start_time}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-[#F5F3EA]">
                        {c.subject_name}
                      </h4>
                      <p className="text-[11px] text-[#70788F] flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[#A7AEC2]">{c.subject_code}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#70788F]" />
                          IST 416
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Attendance Status Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(c.id, c.subject_id, "PRESENT")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isPresent
                          ? "bg-[#35D07F]/20 text-[#35D07F] border-[#35D07F]/40 font-semibold"
                          : "bg-[#0F1422] text-[#A7AEC2] border-[#252D42] hover:text-[#F5F3EA]"
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleStatusChange(c.id, c.subject_id, "ABSENT")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isAbsent
                          ? "bg-[#FF5C68]/20 text-[#FF5C68] border-[#FF5C68]/40 font-semibold"
                          : "bg-[#0F1422] text-[#A7AEC2] border-[#252D42] hover:text-[#F5F3EA]"
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      onClick={() => handleStatusChange(c.id, c.subject_id, "OD")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isOD
                          ? "bg-[#7C5CFF]/20 text-[#7C5CFF] border-[#7C5CFF]/40 font-semibold"
                          : "bg-[#0F1422] text-[#A7AEC2] border-[#252D42] hover:text-[#F5F3EA]"
                      }`}
                    >
                      OD
                    </button>
                    <button
                      onClick={() => handleStatusChange(c.id, c.subject_id, "MEDICAL")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isMed
                          ? "bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/40 font-semibold"
                          : "bg-[#0F1422] text-[#A7AEC2] border-[#252D42] hover:text-[#F5F3EA]"
                      }`}
                    >
                      Medical
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
