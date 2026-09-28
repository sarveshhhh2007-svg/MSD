"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Sparkles,
  Upload,
  Clock,
  Bell,
  Search,
  CheckCircle2
} from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const currentSection = sections.find((s) => s.id === selectedSectionId) || sections[0];

  const targetOptions = [
    { label: "75%", value: 0.75, tag: "Detention" },
    { label: "85%", value: 0.85, tag: "Scholarship" },
    { label: "90%", value: 0.90, tag: "Honors" },
  ];

  return (
    <header className="h-16 px-6 bg-[#0F1422] border-b border-[#252D42] flex items-center justify-between shrink-0 gap-4">
      {/* Left: Greeting & Current Status */}
      <div className="flex items-center gap-4 shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-[#F5F3EA] tracking-tight flex items-center gap-2">
            <span>Good morning, Sarvesh</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#35D07F]" />
          </h1>
          <p className="text-[11px] text-[#70788F] flex items-center gap-1.5 mt-0.5">
            <span>Attendance Intelligence Active</span>
            <span className="text-[#252D42]">•</span>
            <Clock className="w-3 h-3 text-[#70788F]" />
            <span>Updated Today</span>
          </p>
        </div>

        {/* Section Selector */}
        <div className="relative">
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(Number(e.target.value))}
            className="appearance-none bg-[#151B2B] text-xs font-semibold text-[#F5F3EA] border border-[#252D42] rounded-lg pl-3 pr-8 py-1.5 hover:border-[#7C5CFF]/50 transition-colors focus:outline-none focus:border-[#7C5CFF]"
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

      {/* Middle: Prominent Search Bar (from reference prompt) */}
      <div className="max-w-md w-full hidden md:block">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#70788F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects, rooms, faculty, or attendance records..."
            className="w-full bg-[#151B2B] text-xs text-[#F5F3EA] placeholder-[#70788F] border border-[#252D42] rounded-lg pl-8 pr-4 py-1.5 focus:border-[#7C5CFF] focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]/30 transition-all"
          />
        </div>
      </div>

      {/* Right: Target Selector Tabs & Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Target Tabs */}
        <div className="flex items-center bg-[#080B14] p-1 rounded-lg border border-[#252D42]">
          {targetOptions.map((opt) => {
            const isSelected = selectedTarget === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSelectedTarget(opt.value)}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
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
          <span className="hidden sm:inline">Import</span>
        </button>

        {/* Notifications Icon with Critical Alert Badge */}
        <div className="relative">
          <button
            className="p-2 rounded-lg bg-[#151B2B] text-[#A7AEC2] hover:text-[#F5F3EA] border border-[#252D42] hover:border-[#7C5CFF]/50 transition-all"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FF5C68] animate-pulse" />
            )}
          </button>
        </div>

        {/* AI Advisor Button */}
        <button
          onClick={onOpenAdvisor}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#7C5CFF] hover:bg-[#9278FF] text-[#F5F3EA] shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Advisor AI</span>
        </button>
      </div>
    </header>
  );
}
