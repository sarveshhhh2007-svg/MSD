"use client";

import React, { useState, useEffect } from "react";
import Sidebar, { NavTab } from "../components/Sidebar";
import Header from "../components/Header";
import DashboardView from "../components/DashboardView";
import TimetableView from "../components/TimetableView";
import AttendanceImportView from "../components/AttendanceImportView";
import PlannerView from "../components/PlannerView";
import SimulatorView from "../components/SimulatorView";
import RequirementsView from "../components/RequirementsView";
import AnalyticsView from "../components/AnalyticsView";
import AdvisorChatModal from "../components/AdvisorChatModal";
import {
  fetchSections,
  fetchDashboard,
  SectionData,
  DashboardSummary,
} from "../lib/api";
import { Sparkles } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [sections, setSections] = useState<SectionData[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<number>(1);
  const [selectedTarget, setSelectedTarget] = useState<number>(0.75);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState<boolean>(false);
  const [advisorPrompt, setAdvisorPrompt] = useState<string | null>(null);
  const [simulatorSubject, setSimulatorSubject] = useState<string | undefined>(undefined);

  // Load sections on mount
  useEffect(() => {
    async function loadSections() {
      try {
        const secs = await fetchSections();
        setSections(secs);
        if (secs.length > 0) {
          setSelectedSectionId(secs[0].id);
        }
      } catch (err) {
        console.error("Failed to load sections:", err);
      }
    }
    loadSections();
  }, []);

  // Reload dashboard summary when section or target changes
  const loadDashboardData = async () => {
    try {
      const data = await fetchDashboard(selectedSectionId, selectedTarget);
      setSummary(data);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedSectionId, selectedTarget]);

  const handleOpenAdvisorWithPrompt = (prompt: string) => {
    setAdvisorPrompt(prompt);
    setIsAdvisorOpen(true);
  };

  const handleSimulateSubject = (subjectCode: string) => {
    setSimulatorSubject(subjectCode);
    setActiveTab("simulator");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080B14] text-[#F5F3EA]">
      {/* Desktop Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === "advisor") {
            setIsAdvisorOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        criticalCount={summary?.critical_count}
        watchCount={summary?.watch_count}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          sections={sections}
          selectedSectionId={selectedSectionId}
          setSelectedSectionId={setSelectedSectionId}
          selectedTarget={selectedTarget}
          setSelectedTarget={setSelectedTarget}
          onOpenUpload={() => setActiveTab("attendance")}
          onOpenAdvisor={() => setIsAdvisorOpen(true)}
          criticalCount={summary?.critical_count}
        />

        {/* Dynamic View Router */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {activeTab === "dashboard" && (
            <DashboardView
              summary={summary}
              selectedTarget={selectedTarget}
              onRefresh={loadDashboardData}
              onOpenAdvisorWithPrompt={handleOpenAdvisorWithPrompt}
              onSimulateSubject={handleSimulateSubject}
            />
          )}

          {activeTab === "timetable" && (
            <TimetableView
              sectionId={selectedSectionId}
              sections={sections}
              onSelectSection={setSelectedSectionId}
            />
          )}

          {activeTab === "attendance" && (
            <AttendanceImportView
              sectionId={selectedSectionId}
              onRefreshData={loadDashboardData}
            />
          )}

          {activeTab === "planner" && (
            <PlannerView
              sectionId={selectedSectionId}
              onRefreshData={loadDashboardData}
            />
          )}

          {activeTab === "simulator" && (
            <SimulatorView
              selectedTarget={selectedTarget}
              initialSubjectCode={simulatorSubject}
            />
          )}

          {activeTab === "requirements" && (
            <RequirementsView
              summary={summary}
              selectedTarget={selectedTarget}
              setSelectedTarget={setSelectedTarget}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsView
              sectionId={selectedSectionId}
              selectedTarget={selectedTarget}
            />
          )}
        </main>
      </div>

      {/* Floating Attendance Advisor AI Button (Section 37) */}
      <button
        onClick={() => setIsAdvisorOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-full bg-[#151B2B] hover:bg-[#1A2236] border border-[#A78BFA]/40 shadow-xl shadow-purple-950/30 flex items-center gap-2.5 text-xs font-semibold text-[#A78BFA] transition-all hover:scale-105 active:scale-95"
      >
        <span className="w-2 h-2 rounded-full bg-[#A78BFA] animate-pulse" />
        <Sparkles className="w-4 h-4 text-[#A78BFA]" />
        <span>✦ Attendance Advisor</span>
      </button>

      {/* Attendance Advisor Chat Drawer (Sections 38-43) */}
      <AdvisorChatModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        sectionId={selectedSectionId}
        selectedTarget={selectedTarget}
        initialPrompt={advisorPrompt}
        onClearInitialPrompt={() => setAdvisorPrompt(null)}
      />
    </div>
  );
}
