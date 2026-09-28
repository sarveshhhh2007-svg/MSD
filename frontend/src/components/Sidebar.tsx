"use client";

import React from "react";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Compass,
  Activity,
  Sliders,
  BarChart3,
  BotMessageSquare,
  ShieldCheck,
  GraduationCap,
  Building2,
  Sparkles
} from "lucide-react";

export type NavTab =
  | "dashboard"
  | "timetable"
  | "attendance"
  | "planner"
  | "floorgrid"
  | "simulator"
  | "requirements"
  | "analytics"
  | "advisor";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  criticalCount?: number;
  watchCount?: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  criticalCount = 0,
  watchCount = 0
}: SidebarProps) {
  const sections = [
    {
      group: "OVERVIEW",
      items: [
        {
          id: "dashboard" as NavTab,
          label: "Dashboard",
          icon: LayoutDashboard,
          badge: criticalCount > 0 ? `${criticalCount} crit` : undefined,
          badgeColor: "bg-[#FF5C68]/15 text-[#FF5C68] border border-[#FF5C68]/30",
        },
        {
          id: "timetable" as NavTab,
          label: "Timetable",
          icon: CalendarDays,
          badge: "13 SEC",
          badgeColor: "bg-[#7C5CFF]/15 text-[#9278FF] border border-[#7C5CFF]/30",
        },
        {
          id: "attendance" as NavTab,
          label: "Attendance",
          icon: CheckSquare,
        },
        {
          id: "planner" as NavTab,
          label: "Planner",
          icon: Compass,
        },
      ],
    },
    {
      group: "CAMPUS",
      items: [
        {
          id: "floorgrid" as NavTab,
          label: "Floor Grid",
          icon: Building2,
          badge: "LIVE",
          badgeColor: "bg-[#35D07F]/15 text-[#35D07F] border border-[#35D07F]/30",
        },
        {
          id: "floorgrid" as NavTab,
          label: "AI Room Finder",
          icon: Sparkles,
          badge: "AI",
          badgeColor: "bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30",
        },
      ],
    },
    {
      group: "TOOLS",
      items: [
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
          id: "analytics" as NavTab,
          label: "Analytics",
          icon: BarChart3,
        },
      ],
    },
    {
      group: "AI INTELLIGENCE",
      items: [
        {
          id: "advisor" as NavTab,
          label: "Attendance Advisor",
          icon: BotMessageSquare,
          badge: "AI",
          badgeColor: "bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30",
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#0F1422] border-r border-[#252D42] flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-[#252D42]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C5CFF] to-[#9278FF] flex items-center justify-center shadow-lg shadow-[#7C5CFF]/25">
            <ShieldCheck className="w-5 h-5 text-[#F5F3EA]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-[#F5F3EA]">
                NExtclass
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#7C5CFF]/15 text-[#9278FF] border border-[#7C5CFF]/30 font-semibold">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-[#70788F]">Attendance &amp; Campus Intelligence</p>
          </div>
        </div>

        {/* Grouped Navigation List */}
        <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#70788F]">
                {sec.group}
              </p>
              {sec.items.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id && (item.label !== "AI Room Finder" || activeTab === "floorgrid");
                return (
                  <button
                    key={`${sec.group}-${idx}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#151B2B] text-[#F5F3EA] border border-[#252D42] shadow-sm font-semibold"
                        : "text-[#A7AEC2] hover:text-[#F5F3EA] hover:bg-[#151B2B]/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? "text-[#7C5CFF]"
                            : item.label.includes("AI")
                            ? "text-[#A78BFA]"
                            : "text-[#70788F]"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#252D42]">
        <div className="p-3 rounded-lg bg-[#080B14] border border-[#252D42] flex items-center gap-2.5">
          <GraduationCap className="w-4 h-4 text-[#7C5CFF] shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#F5F3EA] truncate">SRM IST — Tiruchirappalli</p>
            <p className="text-[11px] text-[#70788F] truncate">Academic Intelligence System</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
