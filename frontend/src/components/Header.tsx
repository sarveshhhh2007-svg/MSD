"use client";

import React from "react";
import { ChevronDown, Sparkles, Upload, Clock, Bell } from "lucide-react";
import { SectionData } from "../lib/api";

interface HeaderProps {
  sections: SectionData[];
  selectedSectionId: number;
  setSelectedSectionId: (id: number) => void;
  selectedTarget: number;
  setSelectedTarget: (target: number) => void;
  onOpenUpload: () => void;
  onOpenAdvisor: () => void;
  criticalCount?: number;
}

export default function Header({
  sections,
  selectedSectionId,
  setSelectedSectionId,
  selectedTarget,
  setSelectedTarget,
  onOpenUpload,
  onOpenAdvisor,
  criticalCount = 0
}: HeaderProps) {
  const currentSection = sections.find((s) => s.id === selectedSectionId) || sections[0];

  const targetOptions = [
    { label: "75% Target", value: 0.75, tag: "Detention" },
    { label: "85% Target", value: 0.85, tag: "Scholarship" },
    { label: "90% Target", value: 0.90, tag: "Honors" },
  ];

  return (
    <header className="h-16 px-6 bg-[#0F1422] border-b border-[#252D42] flex items-center justify-between shrink-0">
      {/* Left: Greeting & Current Status */}
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-sm font-semibold text-[#F5F3EA] tracking-tight">
            Good morning, Sarvesh
          </h1>
          <p className="text-xs text-[#70788F] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#35D07F]" />
            Attendance Intelligence Active
            <span className="text-[#252D42]">•</span>
            <Clock className="w-3 h-3 text-[#70788F]" />
            <span>Updated Today, 11:48 AM</span>
          </p>
        </div>

        {/* Section Selector */}
        <div className="relative">
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(Number(e.target.value))}
            className="appearance-none bg-[#151B2B] text-xs font-medium text-[#F5F3EA] border border-[#252D42] rounded-lg pl-3 pr-8 py-1.5 hover:border-[#7C5CFF]/50 transition-colors focus:outline-none focus:border-[#7C5CFF]"
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#0F1422] text-[#F5F3EA]">
                {s.name} ({s.venue})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#70788F] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Right: Target Selector Tabs & Actions */}
      <div className="flex items-center gap-3">
        {/* Target Tabs */}
        <div className="flex items-center bg-[#080B14] p-1 rounded-lg border border-[#252D42]">
          {targetOptions.map((opt) => {
            const isSelected = selectedTarget === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSelectedTarget(opt.value)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                  isSelected
                    ? "bg-[#7C5CFF] text-[#F5F3EA] shadow-sm"
                    : "text-[#A7AEC2] hover:text-[#F5F3EA]"
                }`}
              >
                <span>{opt.label}</span>
                <span className="ml-1 text-[10px] opacity-75 font-mono">({opt.tag})</span>
              </button>
            );
          })}
        </div>

        {/* Upload Screenshot Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#151B2B] text-[#F5F3EA] border border-[#252D42] hover:border-[#7C5CFF]/50 hover:bg-[#151B2B]/80 transition-all"
        >
          <Upload className="w-3.5 h-3.5 text-[#7C5CFF]" />
          <span>Import Screenshot</span>
        </button>

        {/* AI Advisor Button */}
        <button
          onClick={onOpenAdvisor}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#7C5CFF] hover:bg-[#9278FF] text-white shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Advisor AI</span>
        </button>
      </div>
    </header>
  );
}
