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
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#F5F3EA]">
            OD &amp; Medical Leave Impact Simulator
          </h2>
          <p className="text-xs text-[#70788F]">
            Forecast attendance risk across actual scheduled timetable occurrences using verified institutional policies.
          </p>
        </div>

        <button
          onClick={() => setPolicySettingsOpen(!policySettingsOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#151B2B] text-[#A7AEC2] hover:text-[#F5F3EA] border border-[#252D42] transition-colors"
        >
          <Settings2 className="w-3.5 h-3.5 text-[#7C5CFF]" />
          <span>Configure Institutional Policy</span>
        </button>
      </div>

      {/* Institutional Policy Settings Drawer/Card */}
      {policySettingsOpen && (
        <div className="p-5 rounded-xl bg-[#0F1422] border border-[#7C5CFF]/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#F5F3EA] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#7C5CFF]" />
              Institutional Leave Policy Rules (Section 31)
            </h3>
            <span className="text-[10px] text-[#70788F]">SRM IST Academic Regulations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[#A7AEC2] block mb-1">On-Duty (OD) Leave Rule</label>
              <select
                value={policyMode}
                onChange={(e) => setPolicyMode(e.target.value)}
                className="w-full bg-[#151B2B] text-xs text-[#F5F3EA] border border-[#252D42] rounded-lg p-2 focus:border-[#7C5CFF] focus:outline-none"
              >
                <option value="COUNTS_AS_ATTENDED">COUNTS_AS_ATTENDED (Full Attendance Credit)</option>
                <option value="EXCLUDED_FROM_DENOMINATOR">EXCLUDED_FROM_DENOMINATOR (Excused from Total)</option>
                <option value="COUNTS_AS_ABSENT">COUNTS_AS_ABSENT (Treated as Absence)</option>
                <option value="NOT_CONFIGURED">NOT_CONFIGURED (Warn: Rule Not Defined)</option>
              </select>
            </div>

            <div>
              <label className="text-[#A7AEC2] block mb-1">Medical Leave Rule</label>
              <select
                value={policyMode}
                onChange={(e) => setPolicyMode(e.target.value)}
                className="w-full bg-[#151B2B] text-xs text-[#F5F3EA] border border-[#252D42] rounded-lg p-2 focus:border-[#7C5CFF] focus:outline-none"
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
      <div className="p-6 rounded-xl bg-[#0F1422] border border-[#252D42] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Leave Type Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#70788F]">Leave Type:</span>
            <div className="flex items-center bg-[#151B2B] p-1 rounded-lg border border-[#252D42]">
              <button
                onClick={() => setLeaveType("MEDICAL")}
                className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                  leaveType === "MEDICAL"
                    ? "bg-[#38BDF8] text-black shadow-sm"
                    : "text-[#A7AEC2] hover:text-[#F5F3EA]"
                }`}
              >
                Medical Leave
              </button>
              <button
                onClick={() => setLeaveType("OD")}
                className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                  leaveType === "OD"
                    ? "bg-[#7C5CFF] text-[#F5F3EA] shadow-sm"
                    : "text-[#A7AEC2] hover:text-[#F5F3EA]"
                }`}
              >
                On-Duty (OD)
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#70788F]">Quick Presets:</span>
            <button
              onClick={() => setPreset(3, "MEDICAL")}
              className="px-2.5 py-1 text-xs rounded bg-[#151B2B] text-[#A7AEC2] hover:text-[#F5F3EA] border border-[#252D42] transition-colors"
            >
              3-Day Sick Leave
            </button>
            <button
              onClick={() => setPreset(2, "OD")}
              className="px-2.5 py-1 text-xs rounded bg-[#151B2B] text-[#A7AEC2] hover:text-[#F5F3EA] border border-[#252D42] transition-colors"
            >
              2-Day Symposium OD
            </button>
            <button
              onClick={() => setPreset(5, "MEDICAL")}
              className="px-2.5 py-1 text-xs rounded bg-[#151B2B] text-[#A7AEC2] hover:text-[#F5F3EA] border border-[#252D42] transition-colors"
            >
              5-Day Medical Leave
            </button>
          </div>
        </div>

        {/* Date Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="text-xs font-medium text-[#A7AEC2] block mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#151B2B] text-xs text-[#F5F3EA] border border-[#252D42] rounded-lg p-2.5 focus:border-[#7C5CFF] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#A7AEC2] block mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#151B2B] text-xs text-[#F5F3EA] border border-[#252D42] rounded-lg p-2.5 focus:border-[#7C5CFF] focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSimulate}
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[#7C5CFF] hover:bg-[#9278FF] text-[#F5F3EA] shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing Timetable Impact...</span>
                </>
              ) : (
                <span>Simulate Impact Instantly</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Policy Warning if unconfigured (Rule 5) */}
      {simulationResult?.policy_warning && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[#F5B942] shrink-0" />
          <div>
            <span className="font-bold block">Institutional Policy Not Configured</span>
            <span>{simulationResult.policy_warning}</span>
          </div>
        </div>
      )}

      {/* Simulation Results Card */}
      {simulationResult && !simulationResult.policy_warning && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0F1422] border border-[#252D42]">
              <span className="text-xs text-[#70788F] block">Total Affected Classes</span>
              <span className="text-2xl font-bold text-[#F5F3EA] mt-1 block">
                {simulationResult.total_affected_classes} classes
              </span>
              <span className="text-[11px] text-[#A7AEC2]">Found across calendar schedule</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0F1422] border border-[#252D42]">
              <span className="text-xs text-[#70788F] block">Current Attendance</span>
              <span className="text-2xl font-bold text-[#F5F3EA] mt-1 block">
                {simulationResult.overall_attendance_before}%
              </span>
              <span className="text-[11px] text-[#35D07F]">Before simulated leave</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0F1422] border border-[#252D42]">
              <span className="text-xs text-[#70788F] block">Simulated Attendance</span>
              <span className="text-2xl font-bold text-[#FF5C68] mt-1 block">
                {simulationResult.overall_attendance_after}%
              </span>
              <span className="text-[11px] text-[#FF5C68]">
                {simulationResult.overall_attendance_after < simulationResult.overall_attendance_before
                  ? `${(simulationResult.overall_attendance_before - simulationResult.overall_attendance_after).toFixed(1)}% drop`
                  : "Protected under policy"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0F1422] border border-[#252D42]">
              <span className="text-xs text-[#70788F] block">Simulated Critical Count</span>
              <span className="text-2xl font-bold text-[#FF5C68] mt-1 block">
                {simulationResult.status_summary.CRITICAL} Critical
              </span>
              <span className="text-[11px] text-[#70788F]">
                {simulationResult.status_summary.WATCH} Watch subjects
              </span>
            </div>
          </div>

          {/* Subject by Subject Breakdown Table */}
          <div className="p-5 rounded-xl bg-[#0F1422] border border-[#252D42]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-[#F5F3EA] uppercase tracking-wider">
                  Subject-by-Subject Impact Analysis
                </h3>
                <p className="text-[11px] text-[#70788F]">
                  Target requirement: {Math.round(selectedTarget * 100)}% • Policy: {simulationResult.policy_used}
                </p>
              </div>

              <div className="p-1 px-2.5 rounded bg-[#151B2B] text-[10px] text-[#70788F] font-mono border border-[#252D42]">
                SIMULATION ONLY • NO PERMANENT CHANGES
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#252D42] text-[11px] text-[#70788F]">
                    <th className="pb-2 font-medium">Subject</th>
                    <th className="pb-2 font-medium text-center">Affected Classes</th>
                    <th className="pb-2 font-medium text-center">Current %</th>
                    <th className="pb-2 font-medium text-center">Simulated %</th>
                    <th className="pb-2 font-medium text-center">Safe Absences</th>
                    <th className="pb-2 font-medium text-center">Simulated Status</th>
                    <th className="pb-2 font-medium">Recovery Requirement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252D42]/60 text-[#A7AEC2]">
                  {simulationResult.subjects.map((sub: any) => {
                    const isCritical = sub.status_after === "CRITICAL";
                    const isWatch = sub.status_after === "WATCH";

                    return (
                      <tr key={sub.subject_id} className="hover:bg-[#151B2B]/40 transition-colors">
                        <td className="py-3">
                          <span className="font-semibold text-[#F5F3EA] block">
                            {sub.subject_name}
                          </span>
                          <span className="text-[10px] text-[#70788F] font-mono">
                            {sub.subject_code}
                          </span>
                        </td>

                        <td className="py-3 text-center">
                          <span
                            className={`font-mono font-bold ${
                              sub.affected_classes > 0 ? "text-[#7C5CFF]" : "text-[#70788F]"
                            }`}
                          >
                            {sub.affected_classes}
                          </span>
                        </td>

                        <td className="py-3 text-center font-mono">
                          {sub.current_pct}%
                        </td>

                        <td className="py-3 text-center">
                          <span
                            className={`font-mono font-bold ${
                              sub.simulated_pct < (sub.current_pct || 0)
                                ? "text-[#FF5C68]"
                                : "text-[#35D07F]"
                            }`}
                          >
                            {sub.simulated_pct}%
                          </span>
                        </td>

                        <td className="py-3 text-center font-mono">
                          <span className="text-[#A7AEC2]">{sub.current_safe_absences}</span>
                          <span className="mx-1 text-[#70788F]">&rarr;</span>
                          <span
                            className={`font-bold ${
                              sub.simulated_safe_absences === 0 ? "text-[#FF5C68]" : "text-[#35D07F]"
                            }`}
                          >
                            {sub.simulated_safe_absences}
                          </span>
                        </td>

                        <td className="py-3 text-center">
                          {isCritical ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded badge-critical">
                              CRITICAL
                            </span>
                          ) : isWatch ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded badge-caution">
                              WATCH
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded badge-safe">
                              SAFE
                            </span>
                          )}
                        </td>

                        <td className="py-3 text-xs">
                          {sub.recovery_needed > 0 ? (
                            <span className="text-[#FF5C68] font-medium">
                              Need to attend {sub.recovery_needed} classes to recover
                            </span>
                          ) : (
                            <span className="text-[#35D07F]">Safe above threshold</span>
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
