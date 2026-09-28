"use client";

import React, { useState } from "react";
import { Sliders, CheckCircle2, AlertTriangle, ShieldCheck, Plus, Sparkles } from "lucide-react";
import { DashboardSummary } from "../lib/api";

interface RequirementsViewProps {
  summary: DashboardSummary | null;
  selectedTarget: number;
  setSelectedTarget: (target: number) => void;
}

export default function RequirementsView({
  summary,
  selectedTarget,
  setSelectedTarget,
}: RequirementsViewProps) {
  const [customThreshold, setCustomThreshold] = useState<number>(80);

  const targets = [
    {
      name: "Detention Requirement",
      threshold: 0.75,
      type: "Mandatory College Regulation",
      desc: "Failure to maintain 75% results in semester exam detention unless condoned by Dean.",
      badge: "CRITICAL REGULATION",
      badgeColor: "bg-[#E74C3C]/15 text-[#E74C3C] border border-[#E74C3C]/30",
    },
    {
      name: "Merit Scholarship",
      threshold: 0.85,
      type: "Scholarship & Fee Waiver",
      desc: "Mandatory 85% aggregate attendance required to retain institutional merit grant.",
      badge: "SCHOLARSHIP",
      badgeColor: "bg-[#FF8A3D]/15 text-[#FF8A3D] border border-[#FF8A3D]/30",
    },
    {
      name: "Placement & Honors",
      threshold: 0.90,
      type: "Placement Eligibility",
      desc: "Top tier campus recruitment drives require a minimum 90% attendance record.",
      badge: "HONORS",
      badgeColor: "bg-[#7A3DF0]/15 text-[#7A3DF0] border border-[#7A3DF0]/30",
    },
  ];

  if (!summary) return null;

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#F7F4E8] text-[#171717]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#171717] tracking-tight">
            Requirement Policies &amp; Multi-Target Analysis
          </h2>
          <p className="text-xs text-[#7A7A7A] mt-0.5">
            Simultaneously evaluate attendance recovery and safe absence budgets across competing targets.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-[#7A7A7A]">Active Primary Target:</span>
          <span className="px-3 py-1 rounded-full bg-[#FFD81A] text-[#171717] text-xs font-extrabold font-mono shadow-sm">
            {Math.round(selectedTarget * 100)}%
          </span>
        </div>
      </div>

      {/* Target Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {targets.map((tgt, idx) => {
          const isActive = selectedTarget === tgt.threshold;
          return (
            <div
              key={idx}
              className={`p-6 rounded-[28px] bg-[#FFFDF8] border transition-all flex flex-col justify-between shadow-sm hover:-translate-y-1 ${
                isActive
                  ? "border-[#FFD81A] ring-2 ring-[#FFD81A]/40"
                  : "border-[#E8E3D7] hover:border-[#171717]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono ${tgt.badgeColor}`}>
                    {tgt.badge}
                  </span>
                  <span className="text-3xl font-extrabold text-[#171717]">
                    {Math.round(tgt.threshold * 100)}%
                  </span>
                </div>

                <h3 className="text-xs font-extrabold text-[#171717]">{tgt.name}</h3>
                <p className="text-[11px] text-[#7A7A7A] font-mono mt-0.5">{tgt.type}</p>
                <p className="text-xs text-[#7A7A7A] mt-3 leading-relaxed">{tgt.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E8E3D7]">
                <button
                  onClick={() => setSelectedTarget(tgt.threshold)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm ${
                    isActive
                      ? "bg-[#FFD81A] text-[#171717]"
                      : "bg-[#FAFAFC] text-[#171717] hover:bg-[#F7F4E8] border border-[#E8E3D7]"
                  }`}
                >
                  {isActive ? "Active Dashboard Target" : "Set as Target"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Target Slider Card */}
      <div className="p-6 rounded-[28px] bg-[#FFFDF8] border border-[#E8E3D7] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
            Custom Attendance Target
          </h3>
          <p className="text-[11px] text-[#7A7A7A] mt-0.5">
            Set a tailored personal goal to test buffer thresholds.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <input
            type="range"
            min={60}
            max={95}
            value={customThreshold}
            onChange={(e) => setCustomThreshold(Number(e.target.value))}
            className="w-48 accent-[#FFD81A]"
          />
          <span className="text-xl font-extrabold font-mono text-[#171717] w-14 text-center">
            {customThreshold}%
          </span>
          <button
            onClick={() => setSelectedTarget(customThreshold / 100)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FFD81A] hover:bg-[#FACC15] text-[#171717] shadow-sm transition-all active:scale-95 whitespace-nowrap"
          >
            Apply Custom Target
          </button>
        </div>
      </div>

      {/* Multi-Target Subject Analysis Table */}
      <div className="p-6 rounded-[28px] bg-[#FFFDF8] border border-[#E8E3D7] space-y-4 shadow-sm">
        <div>
          <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
            Multi-Target Subject Analysis Matrix
          </h3>
          <p className="text-[11px] text-[#7A7A7A] mt-0.5">
            Safe absences and recovery requirements calculated concurrently for 75%, 85%, and 90% thresholds.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8E3D7] text-[11px] text-[#7A7A7A] uppercase font-semibold">
                <th className="pb-3">Subject</th>
                <th className="pb-3 text-center">Current</th>
                <th className="pb-3 text-center">75% Target Safe Absences</th>
                <th className="pb-3 text-center">85% Target Safe Absences</th>
                <th className="pb-3 text-center">90% Target Status</th>
                <th className="pb-3 text-right">Max Reachable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3D7] text-[#171717]">
              {summary.subjects.map((sub) => {
                const mt = sub.multi_targets || {};
                const t75 = mt["75%"];
                const t85 = mt["85%"];
                const t90 = mt["90%"];

                return (
                  <tr key={sub.id} className="hover:bg-[#FAFAFC]/60 transition-colors">
                    <td className="py-3">
                      <span className="font-bold text-[#171717] block">{sub.name}</span>
                      <span className="text-[10px] text-[#7A7A7A] font-mono">{sub.code}</span>
                    </td>

                    <td className="py-3 text-center font-extrabold text-[#171717]">
                      {sub.current_pct}%
                    </td>

                    {/* 75% Target */}
                    <td className="py-3 text-center">
                      {t75 ? (
                        <span
                          className={`font-mono font-bold ${
                            t75.safe_absences === 0 ? "text-[#E74C3C]" : "text-[#45B36B]"
                          }`}
                        >
                          {t75.safe_absences} safe absences
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* 85% Target */}
                    <td className="py-3 text-center">
                      {t85 ? (
                        t85.is_irreversible ? (
                          <span className="text-[10px] font-bold text-[#E74C3C] font-mono">IMPOSSIBLE</span>
                        ) : (
                          <span
                            className={`font-mono font-bold ${
                              t85.safe_absences === 0 ? "text-[#E74C3C]" : "text-[#45B36B]"
                            }`}
                          >
                            {t85.safe_absences} safe absences
                          </span>
                        )
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* 90% Target */}
                    <td className="py-3 text-center">
                      {t90 ? (
                        t90.is_irreversible ? (
                          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#E74C3C]/15 text-[#E74C3C] border border-[#E74C3C]/30 font-bold">
                            IMPOSSIBLE (Max {t90.max_possible}%)
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#45B36B] font-bold">
                            Recoverable ({t90.required} required)
                          </span>
                        )
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="py-3 text-right font-mono font-bold text-[#171717]">
                      {sub.max_possible}%
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
