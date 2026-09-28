"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Building2,
  Search,
  Sparkles,
  Clock,
  Calendar,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wind,
  Tv,
  Users,
  Layers,
  ArrowRight,
  Info,
  MapPin,
  X
} from "lucide-react";
import {
  fetchFloorGrid,
  aiSearchRooms,
  FloorGridResponse,
  RoomData,
  AIRoomSearchResult
} from "../lib/api";

interface FloorGridViewProps {
  onNavigateTo3D?: (roomNumber: string) => void;
}

export default function FloorGridView({ onNavigateTo3D }: FloorGridViewProps = {}) {
  const [gridData, setGridData] = useState<FloorGridResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>("2026-09-28");
  const [selectedTime, setSelectedTime] = useState<string>("10:42");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("ALL");
  const [selectedFloor, setSelectedFloor] = useState<string>("ALL");

  // AI Room Finder State
  const [aiQuery, setAiQuery] = useState<string>("");
  const [aiSearching, setAiSearching] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AIRoomSearchResult | null>(null);
  const [highlightedRoom, setHighlightedRoom] = useState<string | null>(null);

  // Room Detail Modal State
  const [inspectingRoom, setInspectingRoom] = useState<RoomData | null>(null);

  const roomRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const loadGrid = async () => {
    try {
      setLoading(true);
      const floorNum = selectedFloor === "ALL" ? undefined : parseInt(selectedFloor);
      const data = await fetchFloorGrid(selectedDate, selectedTime, selectedBuilding, floorNum);
      setGridData(data);
    } catch (err) {
      console.error("Failed to load floor grid:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrid();
  }, [selectedDate, selectedTime, selectedBuilding, selectedFloor]);

  const handleAiSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = customQuery || aiQuery;
    if (!q.trim()) return;

    try {
      setAiSearching(true);
      const res = await aiSearchRooms(q, selectedTime, selectedDate);
      setAiResult(res);
    } catch (err) {
      console.error("Failed AI room search:", err);
    } finally {
      setAiSearching(false);
    }
  };

  const handleHighlightRoom = (roomNumber: string) => {
    setHighlightedRoom(roomNumber);
    const el = roomRefs.current[roomNumber];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const quickPrompts = [
    "I need an AC room on the ground floor for me and my team for the next 2 hours.",
    "Find me a free room for the next hour.",
    "I need a room for 30 people from 2 PM to 4 PM.",
    "Is there any empty room near IST 518 right now?",
    "Find me an available lab for the next 2 hours."
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#F7F4E8] dark:bg-[#080B14] text-[#171717] dark:text-[#F5F3EA] transition-colors duration-200">
      {/* Free Time Alert Banner (Requirement 33) */}
      <div className="p-4 px-6 rounded-[24px] bg-[#FFFDF8] dark:bg-[#0F1422] border border-[#E8E3D7] dark:border-[#252D42] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#45B36B]/15 text-[#45B36B] dark:text-[#35D07F] flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#171717] dark:text-[#F5F3EA]">
              Free Window Detected: 1h 42m Free
            </h4>
            <p className="text-[11px] text-[#7A7A7A] dark:text-[#A7AEC2]">
              Between Period 4 (Transforms) and Period 6 (Computer Org). Tap below to find open space.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateTo3D && (
            <button
              onClick={() => onNavigateTo3D("IST 509")}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FAFAFC] dark:bg-[#151B2B] text-[#171717] dark:text-[#F5F3EA] border border-[#E8E3D7] dark:border-[#252D42] hover:bg-[#F7F4E8] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Layers className="w-3.5 h-3.5 text-[#7A3DF0]" />
              <span>Explore in 3D</span>
            </button>
          )}
          <button
            onClick={() => {
              setAiQuery("Find me a free room for the next 2 hours");
              handleAiSearch(undefined, "Find me a free room for the next 2 hours");
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FFD81A] hover:bg-[#FACC15] dark:bg-[#7C5CFF] text-[#171717] dark:text-[#F5F3EA] shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#171717] dark:text-[#F5F3EA]" />
            <span>Find Room Now</span>
          </button>
        </div>
      </div>

      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold tracking-tight text-[#171717] dark:text-[#F5F3EA]">
              Floor Grid &amp; Campus Space Intelligence
            </h2>
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#7A3DF0]/10 text-[#7A3DF0] dark:text-[#A78BFA] border border-[#7A3DF0]/30 font-bold">
              CAMPUS INTELLIGENCE
            </span>
          </div>
          <p className="text-xs text-[#7A7A7A] dark:text-[#A7AEC2] flex items-center gap-2 mt-1">
            <span>SRM IST Main Campus • All 10 Timetable PDFs Ingested</span>
            <span className="text-[#E8E3D7] dark:text-[#252D42]">•</span>
            <span className="text-[#45B36B] dark:text-[#35D07F] font-mono font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#45B36B] dark:text-[#35D07F]" />
              Deterministic Occupancy Engine
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-[#7A7A7A] dark:text-[#70788F] block font-medium">Last updated</span>
            <span className="text-xs font-mono font-bold text-[#171717] dark:text-[#F5F3EA]">
              {gridData?.last_updated || "10:42:00 AM"}
            </span>
          </div>
          <button
            onClick={loadGrid}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FFFDF8] dark:bg-[#151B2B] text-[#171717] dark:text-[#F5F3EA] border border-[#E8E3D7] dark:border-[#252D42] hover:border-[#171717] shadow-sm transition-all active:scale-95"
            title="Refresh Room Occupancy"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#7A3DF0] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* AI ROOM FINDER */}
      <div className="rounded-[28px] bg-[#FFFDF8] border border-[#E8E3D7] p-6 shadow-sm relative overflow-hidden">
        {/* Subtle AI Violet Ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#7A3DF0]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#7A3DF0]/10 flex items-center justify-center border border-[#7A3DF0]/20">
              <Sparkles className="w-4 h-4 text-[#7A3DF0]" />
            </div>
            <h3 className="text-sm font-bold text-[#171717] tracking-tight">
              ✦ AI Room Finder
            </h3>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#7A3DF0]/10 text-[#7A3DF0] border border-[#7A3DF0]/25 font-bold">
              Natural Language Space Discovery
            </span>
          </div>
          <span className="text-[11px] text-[#7A7A7A]">
            Full-duration verified • Deterministic availability
          </span>
        </div>

        {/* Search Bar Input */}
        <form onSubmit={(e) => handleAiSearch(e)} className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#7A3DF0] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="I need an AC room on the ground floor for me and my team for the next 2 hours..."
              className="w-full bg-[#FAFAFC] text-xs text-[#171717] placeholder-[#7A7A7A] pl-11 pr-4 py-3 rounded-2xl border border-[#E8E3D7] focus:border-[#FFD81A] focus:outline-none focus:ring-2 focus:ring-[#FFD81A]/40 transition-all shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={aiSearching || !aiQuery.trim()}
            className="px-5 py-3 rounded-2xl text-xs font-bold bg-[#FFD81A] hover:bg-[#FACC15] text-[#171717] shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 whitespace-nowrap"
          >
            {aiSearching ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#171717]" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#171717]" />
            )}
            <span>Find Rooms</span>
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-[11px] font-medium text-[#7A7A7A]">Try:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAiQuery(prompt);
                handleAiSearch(undefined, prompt);
              }}
              className="text-[11px] px-3 py-1.5 rounded-full bg-[#FAFAFC] hover:bg-[#F7F4E8] text-[#171717] border border-[#E8E3D7] hover:border-[#171717] transition-all truncate max-w-[280px] font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* AI Room Search Results Panel */}
        {aiResult && (
          <div className="mt-5 pt-4 border-t border-[#E8E3D7] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#45B36B]" />
                <span className="text-xs font-bold text-[#171717]">
                  Verified Query Results ({aiResult.verified_matches.length} exact matches)
                </span>
                <span className="text-[10px] text-[#7A7A7A] font-mono">
                  Window: {aiResult.parsed_constraints.start_time} – {aiResult.parsed_constraints.end_time}
                </span>
              </div>
              <button
                onClick={() => setAiResult(null)}
                className="text-[11px] font-medium text-[#7A7A7A] hover:text-[#171717]"
              >
                Clear
              </button>
            </div>

            {/* AI Explanation Banner */}
            <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7] text-xs text-[#171717] whitespace-pre-line leading-relaxed">
              {aiResult.explanation}
            </div>

            {/* Verified Room Cards Grid */}
            {aiResult.verified_matches.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                {aiResult.verified_matches.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => handleHighlightRoom(room.room_number)}
                    className="p-4 rounded-2xl bg-[#FFFDF8] hover:bg-[#FAFAFC] border border-[#45B36B]/50 cursor-pointer transition-all hover:-translate-y-1 shadow-sm group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-sm font-mono text-[#171717] group-hover:text-[#45B36B] transition-colors">
                        {room.room_number}
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#45B36B]/15 text-[#45B36B] border border-[#45B36B]/30 font-bold">
                        AVAILABLE
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7A7A7A] font-medium">{room.floor_name}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-[#171717]">
                      {room.has_ac === true && (
                        <span className="flex items-center gap-0.5 text-[#4C6EF5] font-semibold">
                          <Wind className="w-3 h-3" /> AC ✓
                        </span>
                      )}
                      {room.capacity && (
                        <span className="flex items-center gap-0.5 text-[#7A7A7A]">
                          <Users className="w-3 h-3" /> {room.capacity} seats
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#45B36B] mt-2.5 flex items-center gap-1 font-mono font-semibold">
                      <span>Jump to Floor Grid</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Near Matches if Exact is Empty */}
            {aiResult.verified_matches.length === 0 && aiResult.near_matches.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-bold text-[#FF8A3D] mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Closest Alternative Matches (without strict constraints):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {aiResult.near_matches.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => handleHighlightRoom(room.room_number)}
                      className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#FF8A3D]/40 cursor-pointer hover:bg-[#FAFAFC] transition-all hover:-translate-y-1 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm font-mono text-[#171717]">
                          {room.room_number}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#FF8A3D]/15 text-[#FF8A3D] border border-[#FF8A3D]/30 font-bold">
                          ALTERNATIVE
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7A7A7A]">{room.floor_name}</p>
                      <p className="text-[10px] text-[#FF8A3D] mt-2 font-medium italic">{room.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FILTER & OCCUPANCY ENGINE CONTROLS */}
      <div className="rounded-[28px] bg-[#FFFDF8] border border-[#E8E3D7] p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Target Date */}
          <div>
            <label className="block text-[11px] font-semibold text-[#7A7A7A] mb-1">
              Inspection Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-[#FAFAFC] text-xs text-[#171717] font-medium border border-[#E8E3D7] rounded-xl px-3 py-2 focus:border-[#FFD81A] focus:outline-none transition-all shadow-sm"
            />
          </div>

          {/* Target Time */}
          <div>
            <label className="block text-[11px] font-semibold text-[#7A7A7A] mb-1">
              Time (Instant / Window)
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full bg-[#FAFAFC] text-xs text-[#171717] font-medium border border-[#E8E3D7] rounded-xl px-3 py-2 focus:border-[#FFD81A] focus:outline-none transition-all shadow-sm"
            />
          </div>

          {/* Building Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#7A7A7A] mb-1">
              Building Filter
            </label>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full bg-[#FAFAFC] text-xs text-[#171717] font-medium border border-[#E8E3D7] rounded-xl px-3 py-2 focus:border-[#FFD81A] focus:outline-none transition-all shadow-sm"
            >
              <option value="ALL">All Buildings (Campus-wide)</option>
              <option value="IST Building">IST Building</option>
              <option value="Tech Block">Tech Block</option>
              <option value="Mechanical Workshop">Mechanical Workshop</option>
            </select>
          </div>

          {/* Floor Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#7A7A7A] mb-1">
              Floor Filter
            </label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full bg-[#FAFAFC] text-xs text-[#171717] font-medium border border-[#E8E3D7] rounded-xl px-3 py-2 focus:border-[#FFD81A] focus:outline-none transition-all shadow-sm"
            >
              <option value="ALL">All Floors (0 to 6)</option>
              <option value="0">Ground Floor (Floor 0)</option>
              <option value="1">First Floor (Floor 1)</option>
              <option value="2">Second Floor (Floor 2)</option>
              <option value="3">Third Floor (Floor 3)</option>
              <option value="4">Fourth Floor (Floor 4)</option>
              <option value="5">Fifth Floor (Floor 5)</option>
              <option value="6">Sixth Floor (Floor 6)</option>
            </select>
          </div>
        </div>

        {/* Occupancy Status Summary Bar */}
        <div className="mt-4 pt-4 border-t border-[#E8E3D7] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#45B36B] font-mono font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#45B36B]" />
              {gridData?.available_count ?? 0} Available
            </span>
            <span className="flex items-center gap-1.5 text-[#E74C3C] font-mono font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E74C3C]" />
              {gridData?.occupied_count ?? 0} Occupied
            </span>
            <span className="text-[#7A7A7A] font-medium font-mono">
              Total {gridData?.total_rooms ?? 0} Rooms Monitored
            </span>
          </div>

          <div className="text-[11px] text-[#7A7A7A] flex items-center gap-2">
            <span>Interval Checked:</span>
            <span className="font-mono font-bold text-[#171717] px-2.5 py-0.5 rounded-full bg-[#FAFAFC] border border-[#E8E3D7]">
              {gridData?.interval || "10:42 - 11:32"}
            </span>
          </div>
        </div>
      </div>

      {/* FLOOR-BY-FLOOR ROOM VISUALIZATION GRID */}
      <div className="space-y-6">
        {gridData?.floors.map((floor) => (
          <div
            key={floor.floor_number}
            className="rounded-[28px] bg-[#FFFDF8] border border-[#E8E3D7] p-6 space-y-4 shadow-sm"
          >
            {/* Floor Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3D7]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FAFAFC] border border-[#E8E3D7] flex items-center justify-center font-mono font-bold text-xs text-[#171717] shadow-sm">
                  {floor.floor_number}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#171717] tracking-wider uppercase">
                    {floor.floor_name}
                  </h3>
                  <p className="text-[11px] text-[#7A7A7A] font-medium">
                    {floor.rooms.length} Rooms • {floor.rooms.filter((r) => r.status === "AVAILABLE").length} Available Right Now
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#45B36B]/10 text-[#45B36B] border border-[#45B36B]/25 font-bold">
                  {floor.rooms.filter((r) => r.status === "AVAILABLE").length} FREE
                </span>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#E74C3C]/10 text-[#E74C3C] border border-[#E74C3C]/25 font-bold">
                  {floor.rooms.filter((r) => r.status === "OCCUPIED").length} IN USE
                </span>
              </div>
            </div>

            {/* Room Cards Grid for This Floor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {floor.rooms.map((room) => {
                const isAvailable = room.status === "AVAILABLE";
                const isHighlighted = highlightedRoom === room.room_number;

                return (
                  <div
                    key={room.id}
                    ref={(el) => {
                      roomRefs.current[room.room_number] = el;
                    }}
                    onClick={() => setInspectingRoom(room)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative shadow-sm hover:-translate-y-1 ${
                      isHighlighted
                        ? "bg-[#7A3DF0]/10 border-[#7A3DF0] ring-2 ring-[#7A3DF0]/40 scale-[1.02]"
                        : isAvailable
                        ? "bg-[#FFFDF8] border-[#E8E3D7] hover:border-[#45B36B]/60 hover:bg-[#FAFAFC]"
                        : "bg-[#FFFDF8]/80 border-[#E8E3D7] hover:border-[#E74C3C]/60"
                    }`}
                  >
                    {/* Top Row: Room Number & Status Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm font-mono text-[#171717]">
                          {room.room_number}
                        </span>
                        {room.room_type === "LAB" && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#4C6EF5]/15 text-[#4C6EF5] border border-[#4C6EF5]/30 font-bold font-mono">
                            LAB
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          isAvailable
                            ? "bg-[#45B36B]/15 text-[#45B36B] border border-[#45B36B]/30"
                            : "bg-[#E74C3C]/15 text-[#E74C3C] border border-[#E74C3C]/30"
                        }`}
                      >
                        ● {room.status}
                      </span>
                    </div>

                    {/* Middle Info: Building & Metadata */}
                    <div className="space-y-1 text-[11px] text-[#7A7A7A]">
                      <p className="truncate text-[#171717] font-medium">{room.building}</p>
                      <div className="flex items-center gap-2 pt-0.5 text-[10px]">
                        <span>Cap: {room.capacity ? `${room.capacity} seats` : "Unknown"}</span>
                        <span>•</span>
                        <span>
                          AC: {room.has_ac === true ? "Yes" : room.has_ac === false ? "No" : "Unknown"}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Status / Conflict Indicator */}
                    <div className="mt-3 pt-2.5 border-t border-[#E8E3D7] dark:border-[#252D42]">
                      {isAvailable ? (
                        <p className="text-[10px] text-[#45B36B] dark:text-[#35D07F] flex items-center gap-1 font-mono font-medium">
                          <CheckCircle2 className="w-3 h-3 text-[#45B36B] dark:text-[#35D07F]" />
                          <span>Free during queried interval</span>
                        </p>
                      ) : (
                        <div className="text-[10px] text-[#E74C3C] dark:text-[#FF5C68] flex items-start gap-1">
                          <XCircle className="w-3 h-3 shrink-0 mt-0.5 text-[#E74C3C] dark:text-[#FF5C68]" />
                          <div className="truncate">
                            <span className="font-semibold block truncate text-[#E74C3C] dark:text-[#FF5C68]">
                              {room.current_class?.subject_name || "Academic Class"}
                            </span>
                            <span className="font-mono text-[9px] text-[#7A7A7A] dark:text-[#70788F]">
                              {room.current_class?.start_time} - {room.current_class?.end_time} ({room.current_class?.section_name})
                            </span>
                          </div>
                        </div>
                      )}

                      {onNavigateTo3D && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateTo3D(room.room_number);
                          }}
                          className="mt-2 text-[10px] text-[#7A3DF0] dark:text-[#A78BFA] hover:underline flex items-center gap-1 font-mono font-bold"
                        >
                          <span>View in 3D Map</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ROOM DETAIL MODAL */}
      {inspectingRoom && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-[#FFFDF8] border border-[#E8E3D7] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3D7]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold font-mono text-[#171717]">
                    {inspectingRoom.room_number}
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                      inspectingRoom.status === "AVAILABLE"
                        ? "bg-[#45B36B]/15 text-[#45B36B] border border-[#45B36B]/30"
                        : "bg-[#E74C3C]/15 text-[#E74C3C] border border-[#E74C3C]/30"
                    }`}
                  >
                    ● {inspectingRoom.status}
                  </span>
                </div>
                <p className="text-xs text-[#7A7A7A] mt-0.5">
                  {inspectingRoom.building} • {inspectingRoom.floor_name}
                </p>
              </div>
              <button
                onClick={() => setInspectingRoom(null)}
                className="p-1.5 rounded-xl text-[#7A7A7A] hover:text-[#171717] hover:bg-[#FAFAFC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Room Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7]">
                <span className="text-[10px] text-[#7A7A7A] block font-medium">Seating Capacity</span>
                <span className="text-sm font-extrabold font-mono text-[#171717]">
                  {inspectingRoom.capacity ? `${inspectingRoom.capacity} seats` : "Unknown"}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7]">
                <span className="text-[10px] text-[#7A7A7A] block font-medium">Air Conditioning</span>
                <span className="text-sm font-extrabold font-mono text-[#171717]">
                  {inspectingRoom.has_ac === true ? "Verified (Yes)" : inspectingRoom.has_ac === false ? "No" : "Unknown"}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7]">
                <span className="text-[10px] text-[#7A7A7A] block font-medium">Projector / AV</span>
                <span className="text-sm font-extrabold font-mono text-[#171717]">
                  {inspectingRoom.has_projector === true ? "Installed (Yes)" : inspectingRoom.has_projector === false ? "None" : "Unknown"}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7]">
                <span className="text-[10px] text-[#7A7A7A] block font-medium">Space Category</span>
                <span className="text-sm font-extrabold font-mono text-[#171717]">
                  {inspectingRoom.room_type}
                </span>
              </div>
            </div>

            {/* Scheduled Conflicts or Occupancy for Selected Date */}
            <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7] space-y-2">
              <h4 className="text-xs font-bold text-[#171717]">
                Occupancy Breakdown for {selectedDate} ({gridData?.interval})
              </h4>
              {inspectingRoom.conflicts && inspectingRoom.conflicts.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {inspectingRoom.conflicts.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#FFFDF8] border border-[#E74C3C]/30 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-[#171717]">{c.subject_name}</p>
                        <p className="text-[10px] text-[#7A7A7A] font-mono">
                          Period {c.period_number} • {c.section_name} • {c.class_type}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-[#E74C3C] font-bold">
                        {c.start_time} - {c.end_time}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#45B36B] font-mono flex items-center gap-1.5 pt-1 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#45B36B]" />
                  <span>No timetable classes scheduled in this room during the queried interval.</span>
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectingRoom(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FFD81A] hover:bg-[#FACC15] text-[#171717] shadow-sm transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
