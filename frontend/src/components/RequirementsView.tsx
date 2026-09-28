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
      desc: "Failure to maintain 75% results in semester exam detention unless condoned.",
      badge: "CRITICAL REGULATION",
      badgeColor: "bg-[#FF5C68]/20 text-[#FF5C68] border border-[#FF5C68]/30",
    },
    {
      name: "Merit Scholarship",
      threshold: 0.85,
      type: "Scholarship & Fee Waiver",
      desc: "Mandatory 85% aggregate attendance required to retain institutional merit grant.",
      badge: "SCHOLARSHIP",
      badgeColor: "bg-[#F5B942]/20 text-[#F5B942] border border-[#F5B942]/30",
    },
    {
      name: "Placement & Honors",
      threshold: 0.90,
      type: "Placement Eligibility",
      desc: "Top tier campus recruitment drives require a minimum 90% attendance record.",
      badge: "HONORS",
      badgeColor: "bg-[#7C5CFF]/20 text-[#9278FF] border border-[#7C5CFF]/30",
    },
  ];

  if (!summary) return null;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#F5F3EA]">
            Requirement Policies &amp; Multi-Target Analysis
          </h2>
          <p className="text-xs text-[#70788F]">
            Simultaneously evaluate attendance recovery and safe absence budgets across competing targets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#70788F]">Active Primary Target:</span>
          <span className="px-2.5 py-1 rounded bg-[#7C5CFF] text-[#F5F3EA] text-xs font-bold font-mono">
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
              className={`p-5 rounded-xl bg-[#0F1422] border transition-all flex flex-col justify-between ${
                isActive
                  ? "border-[#7C5CFF] shadow-lg shadow-[#7C5CFF]/10"
                  : "border-[#252D42] hover:border-[#384566]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tgt.badgeColor}`}>
                    {tgt.badge}
                  </span>
                  <span className="text-2xl font-extrabold text-[#F5F3EA]">
                    {Math.round(tgt.threshold * 100)}%
                  </span>
                </div>

                <h3 className="text-xs font-bold text-[#F5F3EA]">{tgt.name}</h3>
                <p className="text-[11px] text-[#70788F] font-mono mt-0.5">{tgt.type}</p>
                <p className="text-xs text-[#A7AEC2] mt-3 leading-relaxed">{tgt.desc}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#252D42]">
                <button
                  onClick={() => setSelectedTarget(tgt.threshold)}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#7C5CFF] text-[#F5F3EA] shadow-sm"
                      : "bg-[#151B2B] text-[#A7AEC2] hover:text-[#F5F3EA] border border-[#252D42]"
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
      <div className="p-5 rounded-xl bg-[#0F1422] border border-[#252D42] flex items-center justify-between gap-6">
        <div>
          <h3 className="text-xs font-bold text-[#F5F3EA] uppercase tracking-wider">
            Custom Attendance Target
          </h3>
          <p className="text-[11px] text-[#70788F]">
            Set a tailored personal goal to test buffer thresholds.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min={60}
            max={95}
            value={customThreshold}
            onChange={(e) => setCustomThreshold(Number(e.target.value))}
            className="w-48 accent-[#7C5CFF]"
          />
          <span className="text-lg font-bold font-mono text-[#7C5CFF] w-12 text-center">
            {customThreshold}%
          </span>
          <button
            onClick={() => setSelectedTarget(customThreshold / 100)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#151B2B] hover:bg-[#7C5CFF] hover:text-[#F5F3EA] text-[#F5F3EA] border border-[#252D42] transition-colors"
          >
            Apply Custom Target
          </button>
        </div>
      </div>

      {/* Multi-Target Subject Analysis Table (Section 28) */}
      <div className="p-5 rounded-xl bg-[#0F1422] border border-[#252D42] space-y-4">
        <div>
          <h3 className="text-xs font-bold text-[#F5F3EA] uppercase tracking-wider">
            Multi-Target Subject Analysis Matrix
          </h3>
          <p className="text-[11px] text-[#70788F]">
            Safe absences and recovery requirements calculated concurrently for 75%, 85%, and 90% thresholds.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#252D42] text-[11px] text-[#70788F]">
                <th className="pb-2 font-medium">Subject</th>
                <th className="pb-2 font-medium text-center">Current</th>
                <th className="pb-2 font-medium text-center">75% Target Safe Absences</th>
                <th className="pb-2 font-medium text-center">85% Target Safe Absences</th>
                <th className="pb-2 font-medium text-center">90% Target Status</th>
                <th className="pb-2 font-medium text-right">Max Reachable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252D42]/60 text-[#A7AEC2]">
              {summary.subjects.map((sub) => {
                const mt = sub.multi_targets || {};
                const t75 = mt["75%"];
                const t85 = mt["85%"];
                const t90 = mt["90%"];

                return (
                  <tr key={sub.id} className="hover:bg-[#151B2B]/40 transition-colors">
                    <td className="py-3">
                      <span className="font-semibold text-[#F5F3EA] block">{sub.name}</span>
                      <span className="text-[10px] text-[#70788F] font-mono">{sub.code}</span>
                    </td>

                    <td className="py-3 text-center font-bold text-[#F5F3EA]">
                      {sub.current_pct}%
                    </td>

                    {/* 75% Target */}
                    <td className="py-3 text-center">
                      {t75 ? (
                        <span
                          className={`font-mono font-bold ${
                            t75.safe_absences === 0 ? "text-[#FF5C68]" : "text-[#35D07F]"
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
                          <span className="text-[10px] font-bold text-red-400">IMPOSSIBLE</span>
                        ) : (
                          <span
                            className={`font-mono font-bold ${
                              t85.safe_absences === 0 ? "text-[#FF5C68]" : "text-[#35D07F]"
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
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800">
                            IMPOSSIBLE (Max {t90.max_possible}%)
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#35D07F]">
                            Recoverable ({t90.required} required)
                          </span>
                        )
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="py-3 text-right font-mono text-[#F5F3EA]">
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
