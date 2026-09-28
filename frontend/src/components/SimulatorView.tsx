"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Settings2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import { simulateLeave, fetchPolicy, updatePolicy } from "../lib/api";

interface SimulatorViewProps {
  selectedTarget: number;
  initialSubjectCode?: string;
}

export default function SimulatorView({
  selectedTarget,
  initialSubjectCode,
}: SimulatorViewProps) {
  const [leaveType, setLeaveType] = useState<string>("MEDICAL");
  const [startDate, setStartDate] = useState<string>("2026-09-29");
  const [endDate, setEndDate] = useState<string>("2026-10-01");
  const [policyMode, setPolicyMode] = useState<string>("COUNTS_AS_ABSENT");
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [policySettingsOpen, setPolicySettingsOpen] = useState<boolean>(false);
  const [instPolicy, setInstPolicy] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const pol = await fetchPolicy();
        setInstPolicy(pol);
        if (leaveType === "MEDICAL") {
          setPolicyMode(pol.medical_policy || "COUNTS_AS_ABSENT");
        } else {
          setPolicyMode(pol.od_policy || "COUNTS_AS_ATTENDED");
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [leaveType]);

  const handleSimulate = async () => {
    try {
      setLoading(true);
      const res = await simulateLeave({
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        policy_mode: policyMode,
        target_threshold: selectedTarget,
      });
      setSimulationResult(res);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    handleSimulate();
  }, [leaveType, policyMode]);

  const setPreset = (days: number, type: string) => {
    setLeaveType(type);
    const start = new Date("2026-09-29");
    const end = new Date(start);
    end.setDate(start.getDate() + days - 1);
    setStartDate("2026-09-29");
    setEndDate(end.toISOString().split("T")[0]);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#F7F4E8] text-[#171717]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#171717] tracking-tight">
              OD &amp; Medical Leave Impact Simulator
            </h2>
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#4C6EF5]/15 text-[#4C6EF5] border border-[#4C6EF5]/30 font-bold">
              POLICY SIMULATOR
            </span>
          </div>
          <p className="text-xs text-[#7A7A7A] mt-0.5">
            Forecast attendance risk across actual scheduled timetable occurrences using verified institutional policies.
          </p>
        </div>

        <button
          onClick={() => setPolicySettingsOpen(!policySettingsOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FFFDF8] text-[#171717] hover:bg-[#FAFAFC] border border-[#E8E3D7] shadow-sm transition-all active:scale-95 self-start sm:self-auto"
        >
          <Settings2 className="w-4 h-4 text-[#4C6EF5]" />
          <span>Configure Institutional Policy</span>
        </button>
      </div>

      {/* Institutional Policy Settings Drawer/Card */}
      {policySettingsOpen && (
        <div className="p-6 rounded-[28px] bg-[#FFFDF8] border border-[#4C6EF5]/30 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#4C6EF5]" />
              Institutional Leave Policy Rules (SRM IST Regulations)
            </h3>
            <span className="text-[10px] text-[#7A7A7A] font-mono">Academic Regulations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[#7A7A7A] font-semibold block mb-1.5">On-Duty (OD) Leave Rule</label>
              <select
                value={policyMode}
                onChange={(e) => setPolicyMode(e.target.value)}
                className="w-full bg-[#FAFAFC] text-xs text-[#171717] font-medium border border-[#E8E3D7] rounded-xl p-3 focus:border-[#4C6EF5] focus:outline-none transition-all shadow-sm"
              >
                <option value="COUNTS_AS_ATTENDED">COUNTS_AS_ATTENDED (Full Attendance Credit)</option>
                <option value="EXCLUDED_FROM_DENOMINATOR">EXCLUDED_FROM_DENOMINATOR (Excused from Total)</option>
                <option value="COUNTS_AS_ABSENT">COUNTS_AS_ABSENT (Treated as Absence)</option>
                <option value="NOT_CONFIGURED">NOT_CONFIGURED (Warn: Rule Not Defined)</option>
              </select>
            </div>

            <div>
              <label className="text-[#7A7A7A] font-semibold block mb-1.5">Medical Leave Rule</label>
              <select
                value={policyMode}
                onChange={(e) => setPolicyMode(e.target.value)}
                className="w-full bg-[#FAFAFC] text-xs text-[#171717] font-medium border border-[#E8E3D7] rounded-xl p-3 focus:border-[#4C6EF5] focus:outline-none transition-all shadow-sm"
              >
                <option value="EXCLUDED_FROM_DENOMINATOR">EXCLUDED_FROM_DENOMINATOR (Exempt from Denominator)</option>
                <option value="COUNTS_AS_ATTENDED">COUNTS_AS_ATTENDED (Added to Attended)</option>
                <option value="COUNTS_AS_ABSENT">COUNTS_AS_ABSENT (Treated as Regular Absence)</option>
                <option value="NOT_CONFIGURED">NOT_CONFIGURED (Warn: Rule Not Defined)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Inputs & Presets */}
      <div className="p-7 rounded-[28px] bg-[#FFFDF8] border border-[#E8E3D7] space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Leave Type Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#7A7A7A]">Leave Type:</span>
            <div className="flex items-center bg-[#FAFAFC] p-1 rounded-2xl border border-[#E8E3D7]">
              <button
                onClick={() => setLeaveType("MEDICAL")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  leaveType === "MEDICAL"
                    ? "bg-[#4C6EF5] text-white shadow-sm"
                    : "text-[#7A7A7A] hover:text-[#171717]"
                }`}
              >
                Medical Leave
              </button>
              <button
                onClick={() => setLeaveType("OD")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  leaveType === "OD"
                    ? "bg-[#4C6EF5] text-white shadow-sm"
                    : "text-[#7A7A7A] hover:text-[#171717]"
                }`}
              >
                On-Duty (OD)
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[#7A7A7A]">Quick Presets:</span>
            <button
              onClick={() => setPreset(3, "MEDICAL")}
              className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#FAFAFC] text-[#171717] hover:bg-[#F7F4E8] border border-[#E8E3D7] transition-all shadow-sm"
            >
              3-Day Sick Leave
            </button>
            <button
              onClick={() => setPreset(2, "OD")}
              className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#FAFAFC] text-[#171717] hover:bg-[#F7F4E8] border border-[#E8E3D7] transition-all shadow-sm"
            >
              2-Day Symposium OD
            </button>
            <button
              onClick={() => setPreset(5, "MEDICAL")}
              className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#FAFAFC] text-[#171717] hover:bg-[#F7F4E8] border border-[#E8E3D7] transition-all shadow-sm"
            >
              5-Day Medical Leave
            </button>
          </div>
        </div>

        {/* Date Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-[#7A7A7A] block mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#FAFAFC] text-xs text-[#171717] font-medium border border-[#E8E3D7] rounded-xl p-3 focus:border-[#4C6EF5] focus:outline-none transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#7A7A7A] block mb-1.5">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#FAFAFC] text-xs text-[#171717] font-medium border border-[#E8E3D7] rounded-xl p-3 focus:border-[#4C6EF5] focus:outline-none transition-all shadow-sm"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSimulate}
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs font-bold bg-[#FFD81A] hover:bg-[#FACC15] text-[#171717] shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#171717]" />
                  <span>Computing Timetable Impact...</span>
                </>
              ) : (
                <span>Simulate Impact Instantly</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Policy Warning if unconfigured */}
      {simulationResult?.policy_warning && (
        <div className="p-5 rounded-[24px] bg-[#FF8A3D]/10 border border-[#FF8A3D]/30 text-[#171717] text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[#FF8A3D] shrink-0" />
          <div>
            <span className="font-bold block text-[#FF8A3D]">Institutional Policy Not Configured</span>
            <span className="text-[#7A7A7A]">{simulationResult.policy_warning}</span>
          </div>
        </div>
      )}

      {/* Simulation Results Card */}
      {simulationResult && !simulationResult.policy_warning && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-6 rounded-[28px] bg-[#FFFDF8] border border-[#E8E3D7] shadow-sm hover:-translate-y-1 transition-all">
              <span className="text-xs font-semibold text-[#7A7A7A] block">Total Affected Classes</span>
              <span className="text-3xl font-extrabold text-[#171717] mt-1 block">
                {simulationResult.total_affected_classes}
              </span>
              <span className="text-[11px] font-medium text-[#7A7A7A] mt-1 block">Found across schedule</span>
            </div>

            <div className="p-6 rounded-[28px] bg-[#FFFDF8] border border-[#E8E3D7] shadow-sm hover:-translate-y-1 transition-all">
              <span className="text-xs font-semibold text-[#7A7A7A] block">Current Attendance</span>
              <span className="text-3xl font-extrabold text-[#171717] mt-1 block">
                {simulationResult.overall_attendance_before}%
              </span>
              <span className="text-[11px] font-medium text-[#45B36B] mt-1 block">Before simulated leave</span>
            </div>

            <div className="p-6 rounded-[28px] bg-[#FFFDF8] border border-[#E8E3D7] shadow-sm hover:-translate-y-1 transition-all">
              <span className="text-xs font-semibold text-[#7A7A7A] block">Simulated Attendance</span>
              <span className="text-3xl font-extrabold text-[#E74C3C] mt-1 block">
                {simulationResult.overall_attendance_after}%
              </span>
              <span className="text-[11px] font-medium text-[#E74C3C] mt-1 block">
                {simulationResult.overall_attendance_after < simulationResult.overall_attendance_before
                  ? `${(simulationResult.overall_attendance_before - simulationResult.overall_attendance_after).toFixed(1)}% drop`
                  : "Protected under policy"}
              </span>
            </div>

            <div className="p-6 rounded-[28px] bg-[#FFFDF8] border border-[#E8E3D7] shadow-sm hover:-translate-y-1 transition-all">
              <span className="text-xs font-semibold text-[#7A7A7A] block">Simulated Critical Count</span>
              <span className="text-3xl font-extrabold text-[#E74C3C] mt-1 block">
                {simulationResult.status_summary.CRITICAL}
              </span>
              <span className="text-[11px] font-medium text-[#7A7A7A] mt-1 block">
                {simulationResult.status_summary.WATCH} Watch subjects
              </span>
            </div>
          </div>

          {/* Subject by Subject Breakdown Table */}
          <div className="p-6 rounded-[28px] bg-[#FFFDF8] border border-[#E8E3D7] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                  Subject-by-Subject Impact Analysis
                </h3>
                <p className="text-[11px] text-[#7A7A7A] mt-0.5">
                  Target requirement: {Math.round(selectedTarget * 100)}% • Policy: {simulationResult.policy_used}
                </p>
              </div>

              <div className="px-3 py-1 rounded-full bg-[#FAFAFC] text-[10px] text-[#7A7A7A] font-mono border border-[#E8E3D7] font-semibold">
                SIMULATION ONLY • NO PERMANENT CHANGES
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8E3D7] text-[11px] text-[#7A7A7A] uppercase font-semibold">
                    <th className="pb-3">Subject</th>
                    <th className="pb-3 text-center">Affected Classes</th>
                    <th className="pb-3 text-center">Current %</th>
                    <th className="pb-3 text-center">Simulated %</th>
                    <th className="pb-3 text-center">Safe Absences</th>
                    <th className="pb-3 text-center">Simulated Status</th>
                    <th className="pb-3">Recovery Requirement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E3D7] text-[#171717]">
                  {simulationResult.subjects.map((sub: any) => {
                    const isCritical = sub.status_after === "CRITICAL";
                    const isWatch = sub.status_after === "WATCH";

                    return (
                      <tr key={sub.subject_id} className="hover:bg-[#FAFAFC]/60 transition-colors">
                        <td className="py-3">
                          <span className="font-bold text-[#171717] block">
                            {sub.subject_name}
                          </span>
                          <span className="text-[10px] text-[#7A7A7A] font-mono">
                            {sub.subject_code}
                          </span>
                        </td>

                        <td className="py-3 text-center">
                          <span
                            className={`font-mono font-extrabold ${
                              sub.affected_classes > 0 ? "text-[#4C6EF5]" : "text-[#7A7A7A]"
                            }`}
                          >
                            {sub.affected_classes}
                          </span>
                        </td>

                        <td className="py-3 text-center font-mono font-bold">
                          {sub.current_pct}%
                        </td>

                        <td className="py-3 text-center">
                          <span
                            className={`font-mono font-extrabold ${
                              sub.simulated_pct < (sub.current_pct || 0)
                                ? "text-[#E74C3C]"
                                : "text-[#45B36B]"
                            }`}
                          >
                            {sub.simulated_pct}%
                          </span>
                        </td>

                        <td className="py-3 text-center font-mono">
                          <span className="text-[#7A7A7A]">{sub.current_safe_absences}</span>
                          <span className="mx-1 text-[#E8E3D7] font-bold">&rarr;</span>
                          <span
                            className={`font-bold ${
                              sub.simulated_safe_absences === 0 ? "text-[#E74C3C]" : "text-[#45B36B]"
                            }`}
                          >
                            {sub.simulated_safe_absences}
                          </span>
                        </td>

                        <td className="py-3 text-center">
                          {isCritical ? (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E74C3C]/15 text-[#E74C3C] border border-[#E74C3C]/30 font-mono">
                              ● CRITICAL
                            </span>
                          ) : isWatch ? (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FF8A3D]/15 text-[#FF8A3D] border border-[#FF8A3D]/30 font-mono">
                              ● CAUTION
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#45B36B]/15 text-[#45B36B] border border-[#45B36B]/30 font-mono">
                              ● SAFE
                            </span>
                          )}
                        </td>

                        <td className="py-3 text-xs">
                          {sub.recovery_needed > 0 ? (
                            <span className="text-[#E74C3C] font-semibold">
                              Need to attend {sub.recovery_needed} classes to recover
                            </span>
                          ) : (
                            <span className="text-[#45B36B] font-medium">Safe above threshold</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
