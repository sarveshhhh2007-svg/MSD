"use client";

import React, { useState, useEffect } from "react";
import Sidebar, { NavTab } from "../components/Sidebar";
import Header from "../components/Header";
import { Menu, X as CloseIcon, Sparkles } from "lucide-react";
import DashboardView from "../components/DashboardView";
import TimetableView from "../components/TimetableView";
import AttendanceImportView from "../components/AttendanceImportView";
import PlannerView from "../components/PlannerView";
import SimulatorView from "../components/SimulatorView";
import RequirementsView from "../components/RequirementsView";
import AnalyticsView from "../components/AnalyticsView";
import FloorGridView from "../components/FloorGridView";
import Campus3DView from "../components/Campus3DView";
import LoginView from "../components/LoginView";
import AdvisorChatModal from "../components/AdvisorChatModal";
import {
  fetchSections,
  fetchDashboard,
  SectionData,
  DashboardSummary,
} from "../lib/api";
import { getStoredAuthUser, saveAuthUser, DemoUser } from "../lib/auth";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [sections, setSections] = useState<SectionData[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<number>(1);
  const [selectedTarget, setSelectedTarget] = useState<number>(0.75);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState<boolean>(false);
  const [advisorPrompt, setAdvisorPrompt] = useState<string | null>(null);
  const [simulatorSubject, setSimulatorSubject] = useState<string | undefined>(undefined);

  // Synchronized Room State (Requirement 32)
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string | null>(null);

  // Mobile sidebar toggle (§40)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Initialize auth & theme from localStorage
  useEffect(() => {
    const user = getStoredAuthUser();
    setCurrentUser(user);
    if (user) {
      setSelectedSectionId(user.sectionId);
    }
    setAuthInitialized(true);

    const storedTheme = localStorage.getItem("nextclass_theme") as "light" | "dark" | null;
    if (storedTheme) {
      setTheme(storedTheme);
      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const handleToggleTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("nextclass_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogin = (user: DemoUser) => {
    setCurrentUser(user);
    saveAuthUser(user);
    setSelectedSectionId(user.sectionId);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveAuthUser(null);
  };

  // Load sections on mount
  useEffect(() => {
    async function loadSections() {
      try {
        const secs = await fetchSections();
        setSections(secs);
        if (currentUser && currentUser.sectionId) {
          setSelectedSectionId(currentUser.sectionId);
        }
      } catch (err) {
        console.error("Failed to load sections:", err);
      }
    }
    loadSections();
  }, [currentUser]);

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

  // Switch from Floor Grid to 3D Map
  const handleNavigateTo3D = (roomNum: string) => {
    setSelectedRoomNumber(roomNum);
    setActiveTab("campus3d");
  };

  // Switch from 3D Map to Floor Grid
  const handleNavigateToGrid = () => {
    setActiveTab("floorgrid");
  };

  if (!authInitialized) return null;

  // Render Login View if not authenticated
  if (!currentUser) {
    return <LoginView onLogin={handleLogin} theme={theme} onToggleTheme={handleToggleTheme} />;
  }

  // Section 9: NEVER silently default a section; show clear configuration error if section missing or invalid
  if (!currentUser.sectionId || (sections.length > 0 && !sections.some((s) => s.id === currentUser.sectionId))) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F7F4E8] dark:bg-[#080B14] p-6 text-[#171717] dark:text-[#F5F3EA]">
        <div className="max-w-md w-full p-8 rounded-[28px] bg-[#FFFDF8] dark:bg-[#0F1422] border border-[#FF5C68]/30 dark:border-[#FF5C68]/40 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FF5C68]/15 text-[#FF5C68] flex items-center justify-center mx-auto text-xl font-bold">
            ⚠️
          </div>
          <h2 className="text-base font-extrabold text-[#171717] dark:text-[#F5F3EA]">
            Academic Section Not Configured
          </h2>
          <p className="text-xs text-[#7A7A7A] dark:text-[#A7AEC2] leading-relaxed">
            Your academic section is not configured or timetable data is unavailable for student profile <strong>{currentUser.name}</strong> ({currentUser.studentId}). Please contact the administrator.
          </p>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl bg-[#171717] dark:bg-[#252D42] text-white text-xs font-bold hover:bg-black transition-all"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F4E8] dark:bg-[#080B14] text-[#171717] dark:text-[#F5F3EA] transition-colors duration-200">
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-xl bg-[#FFFDF8] dark:bg-[#0F1422] border border-[#E8E3D7] dark:border-[#252D42] shadow-lg text-[#171717] dark:text-[#F5F3EA]"
      >
        {mobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <div className={`${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 fixed md:relative z-40 h-full transition-transform duration-200 ease-in-out`}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === "advisor") {
              setIsAdvisorOpen(true);
            } else {
              setActiveTab(tab);
            }
            setMobileMenuOpen(false);
          }}
          criticalCount={summary?.critical_count}
          watchCount={summary?.watch_count}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </div>

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
          theme={theme}
          onToggleTheme={handleToggleTheme}
          currentUser={currentUser}
          onLogout={handleLogout}
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

          {activeTab === "floorgrid" && (
            <FloorGridView onNavigateTo3D={handleNavigateTo3D} />
          )}

          {activeTab === "campus3d" && (
            <Campus3DView
              selectedRoomNumber={selectedRoomNumber}
              onSelectRoom={setSelectedRoomNumber}
              onNavigateToGrid={handleNavigateToGrid}
              onFindFreeRoom={() => setActiveTab("floorgrid")}
            />
          )}

          {activeTab === "simulator" && (
            <SimulatorView
              selectedTarget={selectedTarget}
              initialSubjectCode={simulatorSubject}
              sectionId={selectedSectionId}
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

      {/* Floating Attendance Advisor AI Button */}
      <button
        onClick={() => setIsAdvisorOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-5 py-3 rounded-full bg-[#7A3DF0] hover:bg-[#6830D4] text-[#FFFDF8] border border-[#7A3DF0]/40 shadow-xl shadow-purple-500/25 flex items-center gap-2.5 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <span className="w-2 h-2 rounded-full bg-[#FFD81A] animate-pulse" />
        <Sparkles className="w-4 h-4 text-[#FFD81A]" />
        <span>✦ Attendance Advisor</span>
      </button>

      {/* Attendance Advisor Chat Drawer */}
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
