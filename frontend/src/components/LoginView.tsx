"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  BookOpen,
  Calendar,
  Layers
} from "lucide-react";
import { DEMO_USERS, DemoUser } from "../lib/auth";

interface LoginViewProps {
  onLogin: (user: DemoUser) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [selectedUser, setSelectedUser] = useState<DemoUser>(DEMO_USERS[0]);
  const [studentId, setStudentId] = useState<string>("RA2311004010042");
  const [password, setPassword] = useState<string>("academic2026");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"demo" | "credentials">("demo");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !password.trim()) {
      setErrorMessage("Please enter both your Student ID / Email and password.");
      return;
    }
    // Match against any demo user or default to primary
    const matched = DEMO_USERS.find(
      (u) =>
        u.studentId.toLowerCase() === studentId.trim().toLowerCase() ||
        u.email.toLowerCase() === studentId.trim().toLowerCase()
    );
    if (matched) {
      onLogin(matched);
    } else {
      // Allow custom student ID mapped to primary section
      onLogin({
        ...DEMO_USERS[0],
        studentId: studentId.trim(),
        name: studentId.split("@")[0] || "Enrolled Student"
      });
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#F7F4E8] dark:bg-[#080B14] text-[#171717] dark:text-[#F5F3EA] flex flex-col justify-center items-center p-6 relative overflow-hidden transition-colors duration-200">
      {/* Decorative ambient background accents */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#FFD81A]/20 dark:bg-[#7C5CFF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#7A3DF0]/10 dark:bg-[#38BDF8]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-2xl bg-[#FFFDF8] dark:bg-[#0F1422] border border-[#E8E3D7] dark:border-[#252D42] rounded-[32px] p-8 md:p-10 shadow-xl shadow-black/5 dark:shadow-2xl relative z-10 space-y-8">
        {/* Brand & Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD81A]/20 dark:bg-[#7C5CFF]/20 border border-[#FFD81A]/40 dark:border-[#7C5CFF]/40 text-[#171717] dark:text-[#9278FF] text-[11px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD81A] dark:text-[#A78BFA]" />
            Official Academic Session
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#171717] dark:text-[#F5F3EA]">
            NExtclass
          </h1>
          <p className="text-xs md:text-sm text-[#7A7A7A] dark:text-[#A7AEC2] max-w-md mx-auto">
            AI-Powered Attendance Intelligence, Academic Recovery &amp; Campus Space Planning
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-[#FAFAFC] dark:bg-[#151B2B] p-1.5 rounded-2xl border border-[#E8E3D7] dark:border-[#252D42]">
          <button
            onClick={() => setActiveTab("demo")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "demo"
                ? "bg-[#FFD81A] dark:bg-[#7C5CFF] text-[#171717] dark:text-[#F5F3EA] shadow-sm"
                : "text-[#7A7A7A] dark:text-[#70788F] hover:text-[#171717] dark:hover:text-[#F5F3EA]"
            }`}
          >
            1-Click Demo Accounts (All 13 Sections)
          </button>
          <button
            onClick={() => setActiveTab("credentials")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "credentials"
                ? "bg-[#FFD81A] dark:bg-[#7C5CFF] text-[#171717] dark:text-[#F5F3EA] shadow-sm"
                : "text-[#7A7A7A] dark:text-[#70788F] hover:text-[#171717] dark:hover:text-[#F5F3EA]"
            }`}
          >
            Student ID Credentials
          </button>
        </div>

        {/* Tab 1: 1-Click Demo Section Access */}
        {activeTab === "demo" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[#7A7A7A] dark:text-[#A7AEC2]">
              <span className="font-semibold">Select your enrolled section persona:</span>
              <span className="font-mono text-[11px] text-[#45B36B] dark:text-[#35D07F] font-bold">
                13 Official Timetables
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
              {DEMO_USERS.map((user) => {
                const isSelected = selectedUser.id === user.id;
                const scenarioColor =
                  user.attendanceScenario === "critical"
                    ? "text-[#E74C3C] dark:text-[#FF5C68] border-[#E74C3C]/30 bg-[#E74C3C]/10"
                    : user.attendanceScenario === "borderline"
                    ? "text-[#FF8A3D] dark:text-[#F5B942] border-[#FF8A3D]/30 bg-[#FF8A3D]/10"
                    : "text-[#45B36B] dark:text-[#35D07F] border-[#45B36B]/30 bg-[#45B36B]/10";

                return (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 shadow-sm ${
                      isSelected
                        ? "bg-[#FAFAFC] dark:bg-[#151B2B] border-[#FFD81A] dark:border-[#7C5CFF] ring-2 ring-[#FFD81A]/40 dark:ring-[#7C5CFF]/40 scale-[1.01]"
                        : "bg-[#FFFDF8] dark:bg-[#0F1422] border-[#E8E3D7] dark:border-[#252D42] hover:border-[#171717]/40 dark:hover:border-[#7C5CFF]/50"
                    }`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#E8E3D7] dark:border-[#252D42] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#171717] dark:text-[#F5F3EA] truncate">
                          {user.name}
                        </h4>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full border uppercase font-bold ${scenarioColor}`}>
                          {user.attendanceScenario}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-[#7A7A7A] dark:text-[#70788F]">
                        {user.sectionName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected user preview card & Sign-In button */}
            <div className="p-4 rounded-2xl bg-[#FAFAFC] dark:bg-[#151B2B] border border-[#E8E3D7] dark:border-[#252D42] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[#171717] dark:text-[#F5F3EA]">
                  Selected: {selectedUser.name} ({selectedUser.studentId})
                </p>
                <p className="text-[11px] text-[#7A7A7A] dark:text-[#A7AEC2] mt-0.5">
                  {selectedUser.sectionName} • {selectedUser.note}
                </p>
              </div>
              <button
                onClick={() => onLogin(selectedUser)}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-bold bg-[#FFD81A] hover:bg-[#FACC15] dark:bg-[#7C5CFF] dark:hover:bg-[#9278FF] text-[#171717] dark:text-[#F5F3EA] shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Custom Credentials Login */}
        {activeTab === "credentials" && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#E74C3C]/10 border border-[#E74C3C]/30 text-[#E74C3C] text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#7A7A7A] dark:text-[#A7AEC2] mb-1.5">
                SRM Student ID / Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7A7A7A] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. RA2311004010042 or student@srmist.edu.in"
                  className="w-full bg-[#FAFAFC] dark:bg-[#151B2B] text-xs text-[#171717] dark:text-[#F5F3EA] pl-11 pr-4 py-3 rounded-2xl border border-[#E8E3D7] dark:border-[#252D42] focus:border-[#FFD81A] dark:focus:border-[#7C5CFF] focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7A7A7A] dark:text-[#A7AEC2] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7A7A7A] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#FAFAFC] dark:bg-[#151B2B] text-xs text-[#171717] dark:text-[#F5F3EA] pl-11 pr-11 py-3 rounded-2xl border border-[#E8E3D7] dark:border-[#252D42] focus:border-[#FFD81A] dark:focus:border-[#7C5CFF] focus:outline-none transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7A7A7A] hover:text-[#171717] dark:hover:text-[#F5F3EA]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl text-xs font-bold bg-[#FFD81A] hover:bg-[#FACC15] dark:bg-[#7C5CFF] dark:hover:bg-[#9278FF] text-[#171717] dark:text-[#F5F3EA] shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Sign In to NExtclass</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Feature Badges Footer */}
        <div className="pt-4 border-t border-[#E8E3D7] dark:border-[#252D42] flex flex-wrap items-center justify-center gap-6 text-[11px] text-[#7A7A7A] dark:text-[#70788F]">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#45B36B] dark:text-[#35D07F]" />
            10 Official PDF Files
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#45B36B] dark:text-[#35D07F]" />
            Deterministic Rational Math
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#45B36B] dark:text-[#35D07F]" />
            Interactive 3D Campus Explorer
          </span>
        </div>
      </div>
    </div>
  );
}
