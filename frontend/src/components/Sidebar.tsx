"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Compass,
  Activity,
  Sliders,
  BarChart3,
  BotMessageSquare,
  Building2,
  Sparkles,
  Search,
  Sun,
  Moon,
  GraduationCap,
  CalendarRange,
  BookOpen,
  Box,
  LogOut
} from "lucide-react";
import { DemoUser } from "../lib/auth";

export type NavTab =
  | "dashboard"
  | "timetable"
  | "attendance"
  | "planner"
  | "floorgrid"
  | "campus3d"
  | "simulator"
  | "requirements"
  | "analytics"
  | "advisor";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  criticalCount?: number;
  watchCount?: number;
  theme?: "light" | "dark";
  onToggleTheme?: (theme: "light" | "dark") => void;
  currentUser?: DemoUser | null;
  onLogout?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  criticalCount = 0,
  watchCount = 0,
  theme = "light",
  onToggleTheme,
  currentUser,
  onLogout,
}: SidebarProps) {
  const [searchFilter, setSearchFilter] = useState("");

  const navItems = [
    {
      id: "dashboard" as NavTab,
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: criticalCount > 0 ? `${criticalCount} alert` : undefined,
      badgeColor: "bg-[#E74C3C]/12 text-[#C0392B] border border-[#E74C3C]/25 dark:text-[#FF5C68]",
    },
    {
      id: "planner" as NavTab,
      label: "Attendance Planner",
      icon: Compass,
    },
    {
      id: "timetable" as NavTab,
      label: "Timetable",
      icon: CalendarDays,
      badge: "13 SEC",
      badgeColor: "bg-[#FFD81A]/20 text-[#8F7500] border border-[#FFD81A]/40 dark:text-[#FFD81A]",
    },
    {
      id: "attendance" as NavTab,
      label: "Subjects & OCR",
      icon: CheckSquare,
    },
    {
      id: "planner" as NavTab,
      label: "Safe Skip Calendar",
      icon: CalendarRange,
    },
    {
      id: "floorgrid" as NavTab,
      label: "Floor Grid",
      icon: Building2,
      badge: "LIVE",
      badgeColor: "bg-[#45B36B]/15 text-[#2F8A4F] border border-[#45B36B]/30 dark:text-[#35D07F]",
    },
    {
      id: "campus3d" as NavTab,
      label: "3D Campus Map",
      icon: Box,
      badge: "PHASE 2",
      badgeColor: "bg-[#7A3DF0]/15 text-[#7A3DF0] border border-[#7A3DF0]/30 dark:text-[#A78BFA] font-bold",
    },
    {
      id: "floorgrid" as NavTab,
      label: "AI Room Finder",
      icon: Sparkles,
      badge: "AI",
      badgeColor: "bg-[#7A3DF0]/12 text-[#7A3DF0] border border-[#7A3DF0]/25 dark:text-[#A78BFA]",
    },
    {
      id: "analytics" as NavTab,
      label: "Analytics",
      icon: BarChart3,
    },
    {
      id: "simulator" as NavTab,
      label: "OD / Medical",
      icon: Activity,
    },
    {
      id: "requirements" as NavTab,
      label: "Requirements",
      icon: Sliders,
    },
    {
      id: "advisor" as NavTab,
      label: "Attendance Advisor",
      icon: BotMessageSquare,
      badge: "AI",
      badgeColor: "bg-[#7A3DF0]/12 text-[#7A3DF0] border border-[#7A3DF0]/25 dark:text-[#A78BFA]",
    },
  ];

  const filteredItems = navItems.filter((i) =>
    i.label.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <aside className="w-68 bg-[#FAFAFC] dark:bg-[#0F1422] border-r border-[#E8E3D7] dark:border-[#252D42] flex flex-col justify-between shrink-0 select-none py-5 px-4 z-20 transition-colors duration-200">
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-[#FFD81A] dark:bg-[#7C5CFF] shadow-md shadow-[#FFD81A]/35 dark:shadow-purple-950/40 flex items-center justify-center font-extrabold text-[#171717] dark:text-[#F5F3EA] text-lg border border-[#F0C800] dark:border-[#7C5CFF]">
            N
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-tight text-[#171717] dark:text-[#F5F3EA]">
                NExtclass
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#171717] dark:bg-[#252D42] text-[#FFFDF8] dark:text-[#F5F3EA]">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-[#7A7A7A] dark:text-[#A7AEC2] font-medium leading-none mt-0.5">
              Attendance Intelligence
            </p>
          </div>
        </div>

        {/* Compact Rounded Search Bar */}
        <div className="relative pt-1 px-1">
          <Search className="w-3.5 h-3.5 text-[#7A7A7A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Quick jump..."
            className="w-full bg-[#FFFDF8] dark:bg-[#151B2B] border border-[#E8E3D7] dark:border-[#252D42] rounded-full pl-9 pr-3 py-1.5 text-xs text-[#171717] dark:text-[#F5F3EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FFD81A] dark:focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#FFD81A]/30 transition-all shadow-sm"
          />
        </div>

        {/* Navigation Items */}
        <div className="space-y-1 pt-1 overflow-y-auto max-h-[calc(100vh-21rem)] scrollbar-none">
          {filteredItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id &&
              (item.label !== "Safe Skip Calendar" || activeTab === "planner") &&
              (item.label !== "AI Room Finder" || activeTab === "floorgrid");

            return (
              <button
                key={`${item.id}-${idx}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-[#FFF8D6] dark:bg-[#7C5CFF]/20 text-[#171717] dark:text-[#F5F3EA] shadow-sm border border-[#FFD81A]/50 dark:border-[#7C5CFF]/50"
                    : "text-[#7A7A7A] dark:text-[#A7AEC2] hover:text-[#171717] dark:hover:text-[#F5F3EA] hover:bg-[#FFFDF8] dark:hover:bg-[#151B2B]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-[#FFD81A] dark:bg-[#7C5CFF] text-[#171717] dark:text-[#F5F3EA] shadow-sm shadow-[#FFD81A]/30"
                        : "text-[#7A7A7A] dark:text-[#70788F] group-hover:text-[#171717] dark:group-hover:text-[#F5F3EA] group-hover:bg-[#F2EFE4] dark:group-hover:bg-[#252D42]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="tracking-tight">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer Controls */}
      <div className="space-y-3 pt-3 border-t border-[#E8E3D7] dark:border-[#252D42] px-1">
        {/* User Profile Card */}
        {currentUser && (
          <div className="p-3 rounded-2xl bg-[#FFFDF8] dark:bg-[#151B2B] border border-[#E8E3D7] dark:border-[#252D42] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-[#E8E3D7] dark:border-[#252D42] shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#171717] dark:text-[#F5F3EA] truncate">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-[#7A7A7A] dark:text-[#70788F] truncate font-mono">
                  {currentUser.sectionName}
                </p>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Log Out"
                className="p-1.5 rounded-xl text-[#7A7A7A] hover:text-[#E74C3C] dark:hover:text-[#FF5C68] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Theme Toggle Button (Light/Dark pill) */}
        <div className="flex items-center justify-between p-1.5 rounded-full bg-[#EFECE0] dark:bg-[#151B2B] border border-[#E8E3D7] dark:border-[#252D42]">
          <button
            onClick={() => onToggleTheme && onToggleTheme("light")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-full text-[11px] font-bold transition-all ${
              theme === "light"
                ? "bg-[#FFFDF8] text-[#171717] shadow-sm"
                : "text-[#7A7A7A] dark:text-[#70788F] hover:text-[#171717] dark:hover:text-[#F5F3EA]"
            }`}
          >
            <Sun className="w-3 h-3 text-[#FF8A3D]" />
            <span>Warm Ivory</span>
          </button>
          <button
            onClick={() => onToggleTheme && onToggleTheme("dark")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-full text-[11px] font-bold transition-all ${
              theme === "dark"
                ? "bg-[#080B14] text-[#F5F3EA] shadow-sm"
                : "text-[#7A7A7A] dark:text-[#70788F] hover:text-[#171717] dark:hover:text-[#F5F3EA]"
            }`}
          >
            <Moon className="w-3 h-3 text-[#7C5CFF]" />
            <span>Night</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
