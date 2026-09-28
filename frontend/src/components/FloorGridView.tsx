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

export default function FloorGridView() {
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
    // Find floor and change floor filter if needed
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
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#080B14] text-[#F5F3EA]">
      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-[#F5F3EA]">
              Floor Grid &amp; Campus Space Intelligence
            </h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#7C5CFF]/15 text-[#9278FF] border border-[#7C5CFF]/30 font-semibold">
              ROUND 2 CORE
            </span>
          </div>
          <p className="text-xs text-[#70788F] flex items-center gap-2 mt-1">
            <span>SRM IST Main Campus • All 10 Timetable PDFs Ingested</span>
            <span className="text-[#252D42]">•</span>
            <span className="text-[#35D07F] font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Deterministic Occupancy Engine
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-[#70788F] block">Last updated</span>
            <span className="text-xs font-mono text-[#A7AEC2]">
              {gridData?.last_updated || "10:42:00 AM"}
            </span>
          </div>
          <button
            onClick={loadGrid}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#151B2B] text-[#F5F3EA] border border-[#252D42] hover:border-[#7C5CFF]/50 transition-all"
            title="Refresh Room Occupancy"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#7C5CFF] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* AI ROOM FINDER (ROUND 2 REQUIREMENT 3) */}
      <div className="rounded-xl bg-[#0F1422] border border-[#A78BFA]/30 p-5 shadow-lg shadow-purple-950/20 relative overflow-hidden">
        {/* Subtle Violet Accent Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#A78BFA]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#A78BFA]/20 flex items-center justify-center border border-[#A78BFA]/40">
              <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
            </div>
            <h3 className="text-sm font-bold text-[#F5F3EA] tracking-tight">
              ✦ AI Room Finder
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/25">
              Natural Language Space Discovery
            </span>
          </div>
          <span className="text-[11px] text-[#70788F]">
            Full-duration verified • No hallucinations
          </span>
        </div>

        {/* Search Bar Input */}
        <form onSubmit={(e) => handleAiSearch(e)} className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A78BFA] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="I need an AC room on the ground floor for me and my team for the next 2 hours..."
              className="w-full bg-[#151B2B] text-xs text-[#F5F3EA] placeholder-[#70788F] pl-10 pr-4 py-2.5 rounded-lg border border-[#252D42] focus:border-[#A78BFA] focus:outline-none focus:ring-1 focus:ring-[#A78BFA]/50 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={aiSearching || !aiQuery.trim()}
            className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#7C5CFF] hover:bg-[#9278FF] text-[#F5F3EA] shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {aiSearching ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#F5F3EA]" />
            )}
            <span>Find Rooms</span>
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-[11px] text-[#70788F]">Try:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAiQuery(prompt);
                handleAiSearch(undefined, prompt);
              }}
              className="text-[11px] px-2.5 py-1 rounded bg-[#151B2B] hover:bg-[#1A2236] text-[#A7AEC2] hover:text-[#F5F3EA] border border-[#252D42] transition-colors truncate max-w-[280px]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* AI Room Search Results Panel */}
        {aiResult && (
          <div className="mt-4 pt-4 border-t border-[#252D42]/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#35D07F]" />
                <span className="text-xs font-semibold text-[#F5F3EA]">
                  Verified Query Results ({aiResult.verified_matches.length} exact matches)
                </span>
                <span className="text-[10px] text-[#70788F] font-mono">
                  Window: {aiResult.parsed_constraints.start_time} – {aiResult.parsed_constraints.end_time}
                </span>
              </div>
              <button
                onClick={() => setAiResult(null)}
                className="text-[11px] text-[#70788F] hover:text-[#F5F3EA]"
              >
                Clear
              </button>
            </div>

            {/* AI Explanation Banner */}
            <div className="p-3 rounded-lg bg-[#151B2B] border border-[#252D42] text-xs text-[#A7AEC2] whitespace-pre-line leading-relaxed">
              {aiResult.explanation}
            </div>

            {/* Verified Room Cards Grid */}
            {aiResult.verified_matches.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                {aiResult.verified_matches.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => handleHighlightRoom(room.room_number)}
                    className="p-3 rounded-lg bg-[#151B2B] hover:bg-[#1A2236] border border-[#35D07F]/40 cursor-pointer transition-all hover:scale-[1.02] group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs font-mono text-[#F5F3EA] group-hover:text-[#35D07F] transition-colors">
                        {room.room_number}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#35D07F]/15 text-[#35D07F] border border-[#35D07F]/30 font-semibold">
                        AVAILABLE
                      </span>
                    </div>
                    <p className="text-[11px] text-[#70788F]">{room.floor_name}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-[#A7AEC2]">
                      {room.has_ac === true && (
                        <span className="flex items-center gap-0.5 text-[#38BDF8]">
                          <Wind className="w-3 h-3" /> AC ✓
                        </span>
                      )}
                      {room.capacity && (
                        <span className="flex items-center gap-0.5">
                          <Users className="w-3 h-3" /> {room.capacity} seats
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#35D07F] mt-2 flex items-center gap-1 font-mono">
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
                <p className="text-xs font-semibold text-[#F5B942] mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Closest Alternative Matches (without strict constraints):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {aiResult.near_matches.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => handleHighlightRoom(room.room_number)}
                      className="p-3 rounded-lg bg-[#151B2B] border border-[#F5B942]/30 cursor-pointer hover:bg-[#1A2236] transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs font-mono text-[#F5F3EA]">
                          {room.room_number}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#F5B942]/15 text-[#F5B942] border border-[#F5B942]/30 font-semibold">
                          ALTERNATIVE
                        </span>
                      </div>
                      <p className="text-[11px] text-[#70788F]">{room.floor_name}</p>
                      <p className="text-[10px] text-[#F5B942] mt-1.5 italic">{room.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FILTER & OCCUPANCY ENGINE CONTROLS */}
      <div className="rounded-xl bg-[#0F1422] border border-[#252D42] p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Target Date */}
          <div>
            <label className="block text-[11px] font-medium text-[#70788F] mb-1">
              Inspection Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#151B2B] text-xs text-[#F5F3EA] border border-[#252D42] rounded-lg px-2.5 py-1.5 focus:border-[#7C5CFF] focus:outline-none"
              />
            </div>
          </div>

          {/* Target Time */}
          <div>
            <label className="block text-[11px] font-medium text-[#70788F] mb-1">
              Time (Instant / Window)
            </label>
            <div className="relative">
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full bg-[#151B2B] text-xs text-[#F5F3EA] border border-[#252D42] rounded-lg px-2.5 py-1.5 focus:border-[#7C5CFF] focus:outline-none"
              />
            </div>
          </div>

          {/* Building Filter */}
          <div>
            <label className="block text-[11px] font-medium text-[#70788F] mb-1">
              Building Filter
            </label>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full bg-[#151B2B] text-xs text-[#F5F3EA] border border-[#252D42] rounded-lg px-2.5 py-1.5 focus:border-[#7C5CFF] focus:outline-none"
            >
              <option value="ALL">All Buildings (Campus-wide)</option>
              <option value="IST Building">IST Building</option>
              <option value="Tech Block">Tech Block</option>
              <option value="Mechanical Workshop">Mechanical Workshop</option>
            </select>
          </div>

          {/* Floor Filter */}
          <div>
            <label className="block text-[11px] font-medium text-[#70788F] mb-1">
              Floor Filter
            </label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full bg-[#151B2B] text-xs text-[#F5F3EA] border border-[#252D42] rounded-lg px-2.5 py-1.5 focus:border-[#7C5CFF] focus:outline-none"
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
        <div className="mt-4 pt-3 border-t border-[#252D42]/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#35D07F] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#35D07F]" />
              {gridData?.available_count ?? 0} Available
            </span>
            <span className="flex items-center gap-1.5 text-[#FF5C68] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#FF5C68]" />
              {gridData?.occupied_count ?? 0} Occupied
            </span>
            <span className="text-[#70788F] font-mono">
              Total {gridData?.total_rooms ?? 0} Rooms Monitored
            </span>
          </div>

          <div className="text-[11px] text-[#70788F] flex items-center gap-2">
            <span>Interval Checked:</span>
            <span className="font-mono text-[#F5F3EA] px-2 py-0.5 rounded bg-[#151B2B] border border-[#252D42]">
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
            className="rounded-xl bg-[#0F1422] border border-[#252D42] p-5 space-y-4"
          >
            {/* Floor Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#252D42]/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#151B2B] border border-[#252D42] flex items-center justify-center font-mono font-bold text-xs text-[#7C5CFF]">
                  {floor.floor_number}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#F5F3EA] tracking-wider uppercase">
                    {floor.floor_name}
                  </h3>
                  <p className="text-[10px] text-[#70788F]">
                    {floor.rooms.length} Rooms • {floor.rooms.filter((r) => r.status === "AVAILABLE").length} Available Right Now
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/25">
                  {floor.rooms.filter((r) => r.status === "AVAILABLE").length} FREE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FF5C68]/10 text-[#FF5C68] border border-[#FF5C68]/25">
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
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                      isHighlighted
                        ? "bg-[#A78BFA]/10 border-[#A78BFA] ring-2 ring-[#A78BFA]/40 scale-[1.02]"
                        : isAvailable
                        ? "bg-[#151B2B] border-[#252D42] hover:border-[#35D07F]/50 hover:bg-[#1A2236]"
                        : "bg-[#151B2B]/70 border-[#252D42]/80 hover:border-[#FF5C68]/50"
                    }`}
                  >
                    {/* Top Row: Room Number & Status Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm font-mono text-[#F5F3EA]">
                          {room.room_number}
                        </span>
                        {room.room_type === "LAB" && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 font-mono">
                            LAB
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          isAvailable
                            ? "bg-[#35D07F]/15 text-[#35D07F] border border-[#35D07F]/30"
                            : "bg-[#FF5C68]/15 text-[#FF5C68] border border-[#FF5C68]/30"
                        }`}
                      >
                        {room.status}
                      </span>
                    </div>

                    {/* Middle Info: Building & Metadata */}
                    <div className="space-y-1 text-[11px] text-[#70788F]">
                      <p className="truncate text-[#A7AEC2]">{room.building}</p>
                      <div className="flex items-center gap-2 pt-0.5 text-[10px]">
                        <span>Cap: {room.capacity ? `${room.capacity} seats` : "Unknown"}</span>
                        <span>•</span>
                        <span>
                          AC: {room.has_ac === true ? "Yes" : room.has_ac === false ? "No" : "Unknown"}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Status / Conflict Indicator */}
                    <div className="mt-2.5 pt-2 border-t border-[#252D42]/60">
                      {isAvailable ? (
                        <p className="text-[10px] text-[#35D07F] flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Free during queried interval</span>
                        </p>
                      ) : (
                        <div className="text-[10px] text-[#FF5C68] flex items-start gap-1">
                          <XCircle className="w-3 h-3 shrink-0 mt-0.5" />
                          <div className="truncate">
                            <span className="font-semibold block truncate">
                              {room.current_class?.subject_name || "Academic Class"}
                            </span>
                            <span className="font-mono text-[9px] text-[#70788F]">
                              {room.current_class?.start_time} - {room.current_class?.end_time} ({room.current_class?.section_name})
                            </span>
                          </div>
                        </div>
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl bg-[#0F1422] border border-[#252D42] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#252D42]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold font-mono text-[#F5F3EA]">
                    {inspectingRoom.room_number}
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      inspectingRoom.status === "AVAILABLE"
                        ? "bg-[#35D07F]/15 text-[#35D07F] border border-[#35D07F]/30"
                        : "bg-[#FF5C68]/15 text-[#FF5C68] border border-[#FF5C68]/30"
                    }`}
                  >
                    {inspectingRoom.status}
                  </span>
                </div>
                <p className="text-xs text-[#70788F] mt-0.5">
                  {inspectingRoom.building} • {inspectingRoom.floor_name}
                </p>
              </div>
              <button
                onClick={() => setInspectingRoom(null)}
                className="p-1.5 rounded-lg text-[#70788F] hover:text-[#F5F3EA] hover:bg-[#151B2B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Room Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#151B2B] border border-[#252D42]">
                <span className="text-[10px] text-[#70788F] block">Seating Capacity</span>
                <span className="text-sm font-bold font-mono text-[#F5F3EA]">
                  {inspectingRoom.capacity ? `${inspectingRoom.capacity} seats` : "Unknown"}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#151B2B] border border-[#252D42]">
                <span className="text-[10px] text-[#70788F] block">Air Conditioning</span>
                <span className="text-sm font-bold font-mono text-[#F5F3EA]">
                  {inspectingRoom.has_ac === true ? "Verified (Yes)" : inspectingRoom.has_ac === false ? "No" : "Unknown"}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#151B2B] border border-[#252D42]">
                <span className="text-[10px] text-[#70788F] block">Projector / AV</span>
                <span className="text-sm font-bold font-mono text-[#F5F3EA]">
                  {inspectingRoom.has_projector === true ? "Installed (Yes)" : inspectingRoom.has_projector === false ? "None" : "Unknown"}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#151B2B] border border-[#252D42]">
                <span className="text-[10px] text-[#70788F] block">Space Category</span>
                <span className="text-sm font-bold font-mono text-[#F5F3EA]">
                  {inspectingRoom.room_type}
                </span>
              </div>
            </div>

            {/* Scheduled Conflicts or Occupancy for Selected Date */}
            <div className="p-4 rounded-lg bg-[#151B2B] border border-[#252D42] space-y-2">
              <h4 className="text-xs font-bold text-[#F5F3EA]">
                Occupancy Breakdown for {selectedDate} ({gridData?.interval})
              </h4>
              {inspectingRoom.conflicts && inspectingRoom.conflicts.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {inspectingRoom.conflicts.map((c, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded bg-[#0F1422] border border-[#FF5C68]/30 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-[#F5F3EA]">{c.subject_name}</p>
                        <p className="text-[10px] text-[#70788F] font-mono">
                          Period {c.period_number} • {c.section_name} • {c.class_type}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-[#FF5C68] font-bold">
                        {c.start_time} - {c.end_time}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#35D07F] font-mono flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>No timetable classes scheduled in this room during the queried interval.</span>
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectingRoom(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#151B2B] hover:bg-[#1A2236] border border-[#252D42] text-[#F5F3EA]"
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
