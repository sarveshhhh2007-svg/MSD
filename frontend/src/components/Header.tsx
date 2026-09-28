"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Sparkles,
  Upload,
  Clock,
  Bell,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  User,
  LogOut,
  Sun,
  Moon
} from "lucide-react";
import { SectionData } from "../lib/api";
import { DemoUser } from "../lib/auth";

interface HeaderProps {
  sections: SectionData[];
  selectedSectionId: number;
  setSelectedSectionId?: (id: number) => void;
  selectedTarget: number;
  setSelectedTarget: (target: number) => void;
  onOpenUpload: () => void;
  onOpenAdvisor: () => void;
  criticalCount?: number;
  theme?: "light" | "dark";
  onToggleTheme?: (theme: "light" | "dark") => void;
  currentUser?: DemoUser | null;
  onLogout?: () => void;
}

export default function Header({
  sections,
  selectedSectionId,
  setSelectedSectionId,
  selectedTarget,
  setSelectedTarget,
  onOpenUpload,
  onOpenAdvisor,
  criticalCount = 0,
  theme = "light",
  onToggleTheme,
  currentUser,
  onLogout,
}: HeaderProps) {
  const [searchVal, setSearchVal] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const currentSection = sections.find((s) => s.id === selectedSectionId) || sections[0];

  const targetOptions = [
    { label: "75%", value: 0.75, tag: "Detention" },
    { label: "85%", value: 0.85, tag: "Scholarship" },
    { label: "90%", value: 0.90, tag: "Honors" },
  ];

  return (
    <header className="h-20 px-8 bg-[#F7F4E8] dark:bg-[#080B14] flex items-center justify-between shrink-0 gap-4 z-10 transition-colors duration-200 border-b border-[#E8E3D7]/60 dark:border-[#252D42]">
      {/* Left: Verified Section Badge (Section Auto-Assigned) & Status Capsule */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FFFDF8] dark:bg-[#0F1422] border border-[#E8E3D7] dark:border-[#252D42] text-xs font-bold text-[#171717] dark:text-[#F5F3EA] shadow-sm select-none">
          <span className="w-2 h-2 rounded-full bg-[#FFD81A] dark:bg-[#7C5CFF]" />
          <span>{currentUser?.sectionName || currentSection?.name || "Assigned Section"}</span>
          <span className="text-[10px] text-[#7A7A7A] dark:text-[#70788F] font-mono font-medium">
            ({currentSection?.venue || "Main Building"})
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFDF8] dark:bg-[#0F1422] border border-[#E8E3D7] dark:border-[#252D42] text-xs font-semibold text-[#171717] dark:text-[#F5F3EA] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#45B36B] dark:bg-[#35D07F] animate-pulse" />
          <span>Section Auto-Resolved</span>
        </div>
      </div>

      {/* Middle: Floating Rounded Search Input */}
      <div className="max-w-md w-full hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-[#7A7A7A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search subjects, attendance records, classrooms..."
            className="w-full bg-[#FFFDF8] dark:bg-[#0F1422] text-xs font-medium text-[#171717] dark:text-[#F5F3EA] placeholder-[#7A7A7A] dark:placeholder-[#70788F] border border-[#E8E3D7] dark:border-[#252D42] rounded-full pl-11 pr-4 py-2.5 focus:border-[#FFD81A] dark:focus:border-[#7C5CFF] focus:outline-none focus:ring-2 focus:ring-[#FFD81A]/30 shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Right: Target Segmented Pills, Actions & Avatar */}
      <div className="flex items-center gap-3">
        {/* Target Tabs */}
        <div className="flex items-center bg-[#EFECE0] dark:bg-[#151B2B] p-1 rounded-full border border-[#E8E3D7] dark:border-[#252D42] shadow-inner">
          {targetOptions.map((opt) => {
            const isSelected = selectedTarget === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSelectedTarget(opt.value)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                  isSelected
                    ? "bg-[#FFD81A] dark:bg-[#7C5CFF] text-[#171717] dark:text-[#F5F3EA] shadow-sm shadow-[#FFD81A]/30"
                    : "text-[#7A7A7A] dark:text-[#70788F] hover:text-[#171717] dark:hover:text-[#F5F3EA]"
                }`}
              >
                <span>{opt.label}</span>
                <span className="ml-1 text-[9px] opacity-75 font-normal">({opt.tag})</span>
              </button>
            );
          })}
        </div>

        {/* Import Attendance Screenshot */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#FFFDF8] dark:bg-[#0F1422] text-[#171717] dark:text-[#F5F3EA] border border-[#E8E3D7] dark:border-[#252D42] hover:border-[#FFD81A] hover:bg-[#FFF8D6] dark:hover:bg-[#151B2B] transition-all shadow-sm"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Import Screenshot</span>
        </button>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            className="p-2.5 rounded-full bg-[#FFFDF8] dark:bg-[#0F1422] text-[#171717] dark:text-[#F5F3EA] border border-[#E8E3D7] dark:border-[#252D42] hover:border-[#FFD81A] transition-all shadow-sm"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {criticalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#E74C3C] border-2 border-[#FFFDF8]" />
            )}
          </button>
        </div>

        {/* Attendance Advisor AI Trigger */}
        <button
          onClick={onOpenAdvisor}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#7A3DF0] hover:bg-[#6830D4] text-[#FFFDF8] shadow-md shadow-[#7A3DF0]/25 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FFD81A]" />
          <span>Advisor AI</span>
        </button>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-2 border-l border-[#E8E3D7] dark:border-[#252D42] focus:outline-none"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-[#FFFDF8] dark:border-[#0F1422] shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FFD81A] to-[#FF8A3D] flex items-center justify-center font-bold text-xs text-[#171717] border-2 border-[#FFFDF8] shadow-sm">
                S
              </div>
            )}
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-64 p-4 rounded-2xl bg-[#FFFDF8] dark:bg-[#0F1422] border border-[#E8E3D7] dark:border-[#252D42] shadow-2xl z-50 space-y-3 animate-in fade-in duration-150">
              <div className="pb-3 border-b border-[#E8E3D7] dark:border-[#252D42]">
                <p className="text-xs font-bold text-[#171717] dark:text-[#F5F3EA]">
                  {currentUser?.name || "Sarvesh Kumar"}
                </p>
                <p className="text-[11px] font-mono text-[#7A7A7A] dark:text-[#A7AEC2]">
                  {currentUser?.studentId || "RA2311004010042"}
                </p>
                <p className="text-[10px] text-[#45B36B] dark:text-[#35D07F] font-semibold mt-0.5">
                  {currentUser?.sectionName || currentSection?.name}
                </p>
              </div>

              {/* Theme Switcher in Profile */}
              {onToggleTheme && (
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-[#7A7A7A] dark:text-[#A7AEC2] font-medium">Theme Mode</span>
                  <button
                    onClick={() => onToggleTheme(theme === "light" ? "dark" : "light")}
                    className="p-1.5 rounded-lg bg-[#FAFAFC] dark:bg-[#151B2B] text-[#171717] dark:text-[#F5F3EA] border border-[#E8E3D7] dark:border-[#252D42] flex items-center gap-1 text-[11px] font-bold"
                  >
                    {theme === "light" ? (
                      <>
                        <Moon className="w-3 h-3 text-[#7C5CFF]" />
                        <span>Night</span>
                      </>
                    ) : (
                      <>
                        <Sun className="w-3 h-3 text-[#FF8A3D]" />
                        <span>Ivory</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Sign Out Action */}
              {onLogout && (
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold text-[#E74C3C] dark:text-[#FF5C68] hover:bg-[#E74C3C]/10 transition-colors flex items-center gap-2 justify-center"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out of NExtclass</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
