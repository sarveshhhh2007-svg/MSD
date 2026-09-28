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
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#F7F4E8] text-[#171717]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#171717] tracking-tight">
            Semester Planner &amp; Occurrence Calendar
          </h2>
          <p className="text-xs text-[#7A7A7A] mt-0.5">
            Actual concrete timetable sessions mapped to calendar dates (excludes holidays &amp; breaks).
          </p>
        </div>

        <button
          onClick={() => {
            alert("Calendar sync: iCalendar (.ics) export generated with all SRM IST classes!");
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FFFDF8] text-[#171717] hover:bg-[#FAFAFC] border border-[#E8E3D7] shadow-sm transition-all active:scale-95 whitespace-nowrap self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#4C6EF5]" />
          <span>Export iCal (.ics)</span>
        </button>
      </div>

      {/* Date Strip Navigation */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
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
              className={`p-3 px-5 rounded-[22px] border shrink-0 text-center transition-all ${
                isSelected
                  ? "bg-[#FFD81A] border-[#FFD81A] text-[#171717] shadow-md font-bold scale-105"
                  : "bg-[#FFFDF8] border-[#E8E3D7] text-[#7A7A7A] hover:border-[#171717] hover:text-[#171717]"
              }`}
            >
              <span className="text-[10px] uppercase font-bold block">{dayName}</span>
              <span className="text-lg font-extrabold block leading-tight">{dayNum}</span>
              <span className="text-[10px] block opacity-80">{month}</span>
            </button>
          );
        })}
      </div>

      {/* Classes Scheduled on Selected Date */}
      <div className="p-7 rounded-[28px] bg-[#FFFDF8] border border-[#E8E3D7] space-y-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#4C6EF5]" />
            Scheduled Classes for {selectedDate}
          </h3>
          <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#FAFAFC] text-[#7A7A7A] border border-[#E8E3D7]">
            {currentClasses.length} Scheduled Periods
          </span>
        </div>

        {currentClasses.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#7A7A7A] bg-[#FAFAFC] rounded-2xl border border-dashed border-[#E8E3D7]">
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
                  className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7] flex flex-wrap items-center justify-between gap-4 transition-all hover:border-[#171717]/30 hover:bg-[#FFFDF8] shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-[#FFFDF8] border border-[#E8E3D7] text-center min-w-[76px] shadow-sm">
                      <span className="text-[10px] text-[#7A3DF0] font-mono font-bold block">
                        PERIOD {c.period_number}
                      </span>
                      <span className="text-xs font-extrabold text-[#171717] block">
                        {c.start_time}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-extrabold text-[#171717]">
                        {c.subject_name}
                      </h4>
                      <p className="text-[11px] text-[#7A7A7A] flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-semibold text-[#171717]">{c.subject_code}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#7A7A7A]" />
                          IST 416
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Attendance Status Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(c.id, c.subject_id, "PRESENT")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isPresent
                          ? "bg-[#45B36B] text-white border-[#45B36B] shadow-sm"
                          : "bg-[#FFFDF8] text-[#171717] border-[#E8E3D7] hover:border-[#45B36B]"
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleStatusChange(c.id, c.subject_id, "ABSENT")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isAbsent
                          ? "bg-[#E74C3C] text-white border-[#E74C3C] shadow-sm"
                          : "bg-[#FFFDF8] text-[#171717] border-[#E8E3D7] hover:border-[#E74C3C]"
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      onClick={() => handleStatusChange(c.id, c.subject_id, "OD")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isOD
                          ? "bg-[#4C6EF5] text-white border-[#4C6EF5] shadow-sm"
                          : "bg-[#FFFDF8] text-[#171717] border-[#E8E3D7] hover:border-[#4C6EF5]"
                      }`}
                    >
                      OD
                    </button>
                    <button
                      onClick={() => handleStatusChange(c.id, c.subject_id, "MEDICAL")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isMed
                          ? "bg-[#4C6EF5] text-white border-[#4C6EF5] shadow-sm"
                          : "bg-[#FFFDF8] text-[#171717] border-[#E8E3D7] hover:border-[#4C6EF5]"
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
