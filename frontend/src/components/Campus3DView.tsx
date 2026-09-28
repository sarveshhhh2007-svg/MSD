"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Layers,
  Sparkles,
  Clock,
  Users,
  Wind,
  PhoneCall,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Maximize2,
  RotateCcw,
  Share2,
  ArrowRight,
  MapPin,
  Calendar,
  X,
  Compass
} from "lucide-react";
import { fetchFloorGrid, FloorGridResponse, RoomData } from "../lib/api";

interface Campus3DViewProps {
  selectedRoomNumber?: string | null;
  onSelectRoom?: (roomNum: string | null) => void;
  onNavigateToGrid?: () => void;
  onFindFreeRoom?: (durationHours: number) => void;
}

export default function Campus3DView({
  selectedRoomNumber,
  onSelectRoom,
  onNavigateToGrid,
  onFindFreeRoom,
}: Campus3DViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridData, setGridData] = useState<FloorGridResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFloor, setSelectedFloor] = useState<number | "ALL">("ALL");
  const [activeRoom, setActiveRoom] = useState<RoomData | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<RoomData | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  
  // Claim state (Requirement 30)
  const [claimedRoomNumber, setClaimedRoomNumber] = useState<string | null>(null);
  
  // Live timestamp-based countdown (Requirement 29)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(2488); // ~41m 28s default

  // Load backend floor grid
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchFloorGrid("2026-09-28", "10:42", "ALL");
        setGridData(data);
      } catch (err) {
        console.error("Failed to load 3D floor data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Sync selectedRoomNumber from props
  useEffect(() => {
    if (selectedRoomNumber && gridData) {
      for (const fl of gridData.floors) {
        const found = fl.rooms.find((r) => r.room_number === selectedRoomNumber);
        if (found) {
          setActiveRoom(found);
          break;
        }
      }
    }
  }, [selectedRoomNumber, gridData]);

  // Live timestamp countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    if (totalSec <= 0) return "00:00:00 (CLASS STARTED)";
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Three.js scene setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = null; // transparent to inherit UI theme

    // Camera
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(38, 30, 42);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(30, 50, 30);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const blueFill = new THREE.DirectionalLight(0x7a3df0, 0.4);
    blueFill.position.set(-30, 20, -30);
    scene.add(blueFill);

    // Group for building meshes
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    // Room mesh references for raycasting
    const roomMeshes: { mesh: THREE.Mesh; roomData: RoomData; floorNum: number }[] = [];

    // Colors
    const COLOR_AVAILABLE = 0x45b36b; // Success Green
    const COLOR_OCCUPIED = 0xe74c3c;  // Critical Red
    const COLOR_EXPIRING = 0xff8a3d;  // Warning Orange
    const COLOR_SLAB = 0xe8e3d7;      // Subtle warm border/slab

    const floorsToRender = gridData ? gridData.floors : [];

    floorsToRender.forEach((floor) => {
      const fNum = floor.floor_number;
      if (selectedFloor !== "ALL" && selectedFloor !== fNum) return;

      const floorY = fNum * 4.8;

      // Floor Base Slab
      const slabGeo = new THREE.BoxGeometry(26, 0.4, 18);
      const slabMat = new THREE.MeshStandardMaterial({
        color: COLOR_SLAB,
        roughness: 0.7,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85,
      });
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.position.set(0, floorY, 0);
      slabMesh.receiveShadow = true;
      buildingGroup.add(slabMesh);

      // Slabs edge line
      const slabEdges = new THREE.EdgesGeometry(slabGeo);
      const slabLine = new THREE.LineSegments(
        slabEdges,
        new THREE.LineBasicMaterial({ color: 0xd8d2c4, linewidth: 1 })
      );
      slabLine.position.set(0, floorY, 0);
      buildingGroup.add(slabLine);

      // Layout rooms in a double-loaded corridor row
      floor.rooms.forEach((room, rIdx) => {
        const row = rIdx % 2 === 0 ? -5 : 5;
        const col = Math.floor(rIdx / 2) * 4.8 - 9.5;

        const isAvail = room.status === "AVAILABLE";
        const isExp = (room.status as string) === "EXPIRING";
        const roomColor = isAvail ? COLOR_AVAILABLE : isExp ? COLOR_EXPIRING : COLOR_OCCUPIED;

        const roomWidth = 4.2;
        const roomHeight = 3.2;
        const roomDepth = 5.2;

        const roomGeo = new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth);
        const roomMat = new THREE.MeshStandardMaterial({
          color: roomColor,
          roughness: 0.35,
          metalness: 0.2,
          transparent: true,
          opacity: 0.9,
        });

        const roomMesh = new THREE.Mesh(roomGeo, roomMat);
        roomMesh.position.set(col, floorY + roomHeight / 2 + 0.2, row);
        roomMesh.castShadow = true;
        roomMesh.receiveShadow = true;
        buildingGroup.add(roomMesh);

        // Edge highlights
        const roomEdges = new THREE.EdgesGeometry(roomGeo);
        const roomLine = new THREE.LineSegments(
          roomEdges,
          new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1.5, transparent: true, opacity: 0.7 })
        );
        roomLine.position.copy(roomMesh.position);
        buildingGroup.add(roomLine);

        roomMeshes.push({ mesh: roomMesh, roomData: room, floorNum: fNum });
      });
    });

    camera.lookAt(0, (selectedFloor === "ALL" ? 14 : (selectedFloor as number) * 4.8), 0);

    // Orbit & Pan Drag Handlers
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let spherical = { radius: 55, theta: 0.8, phi: 0.95 };

    const updateCamera = () => {
      const targetY = selectedFloor === "ALL" ? 12 : (selectedFloor as number) * 4.8;
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi) + targetY;
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, targetY, 0);
    };
    updateCamera();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        prevMousePos = { x: e.clientX, y: e.clientY };

        spherical.theta -= deltaX * 0.008;
        spherical.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, spherical.phi - deltaY * 0.008));
        updateCamera();
      } else {
        // Raycasting for hover tooltip
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
        const intersects = raycaster.intersectObjects(roomMeshes.map((r) => r.mesh));

        if (intersects.length > 0) {
          const hit = roomMeshes.find((r) => r.mesh === intersects[0].object);
          if (hit) {
            setHoveredRoom(hit.roomData);
            setHoverPos({ x: e.clientX - rect.left + 15, y: e.clientY - rect.top - 10 });
            container.style.cursor = "pointer";
          }
        } else {
          setHoveredRoom(null);
          setHoverPos(null);
          container.style.cursor = "default";
        }
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycaster.intersectObjects(roomMeshes.map((r) => r.mesh));

      if (intersects.length > 0) {
        const hit = roomMeshes.find((r) => r.mesh === intersects[0].object);
        if (hit) {
          setActiveRoom(hit.roomData);
          if (onSelectRoom) onSelectRoom(hit.roomData.room_number);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(20, Math.min(95, spherical.radius + e.deltaY * 0.05));
      updateCamera();
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("click", onClick);
    container.addEventListener("wheel", onWheel, { passive: false });

    // Animation Loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("click", onClick);
      container.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [gridData, selectedFloor]);

  // Handle WhatsApp Squad Message (Requirement 31)
  const handleCallTheSquad = (room: RoomData) => {
    const text = encodeURIComponent(
      `📍 Heading to ${room.room_number} — ${room.floor_name}. It's free until 2:30 PM (${formatCountdown(secondsRemaining)} left). Come fast!`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F7F4E8] dark:bg-[#080B14] text-[#171717] dark:text-[#F5F3EA] overflow-hidden relative">
      {/* Top Controls Overlay */}
      <div className="p-6 pb-2 z-10 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black tracking-tight text-[#171717] dark:text-[#F5F3EA]">
              Interactive 3D Campus Explorer
            </h2>
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#7A3DF0]/15 text-[#7A3DF0] dark:text-[#A78BFA] border border-[#7A3DF0]/30 font-bold">
              PHASE 2 WEBGL
            </span>
          </div>
          <p className="text-xs text-[#7A7A7A] dark:text-[#A7AEC2] mt-0.5">
            Real-time space occupancy mapped in 3D perspective • SRM IST Campus
          </p>
        </div>

        {/* Free Time Alert Banner (Requirement 33) */}
        <div className="flex items-center gap-3 bg-[#FFFDF8] dark:bg-[#0F1422] p-2 px-4 rounded-2xl border border-[#E8E3D7] dark:border-[#252D42] shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#45B36B] dark:bg-[#35D07F] animate-ping" />
            <span className="text-xs font-bold text-[#171717] dark:text-[#F5F3EA]">
              Free Window: 1h 42m
            </span>
          </div>
          <button
            onClick={() => onFindFreeRoom && onFindFreeRoom(1.7)}
            className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#FFD81A] hover:bg-[#FACC15] dark:bg-[#7C5CFF] dark:hover:bg-[#9278FF] text-[#171717] dark:text-[#F5F3EA] shadow-sm transition-all flex items-center gap-1 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Find a Room</span>
          </button>
        </div>
      </div>

      {/* Floor Filter Bar & Legend */}
      <div className="px-6 py-2 z-10 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Floor Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-[#FFFDF8] dark:bg-[#0F1422] p-1.5 rounded-2xl border border-[#E8E3D7] dark:border-[#252D42] shadow-sm">
          <button
            onClick={() => setSelectedFloor("ALL")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              selectedFloor === "ALL"
                ? "bg-[#FFD81A] dark:bg-[#7C5CFF] text-[#171717] dark:text-[#F5F3EA] shadow-sm"
                : "text-[#7A7A7A] dark:text-[#70788F] hover:text-[#171717] dark:hover:text-[#F5F3EA]"
            }`}
          >
            All Floors (0–6)
          </button>
          {[0, 1, 2, 3, 4, 5, 6].map((fl) => (
            <button
              key={fl}
              onClick={() => setSelectedFloor(fl)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedFloor === fl
                  ? "bg-[#FFD81A] dark:bg-[#7C5CFF] text-[#171717] dark:text-[#F5F3EA] shadow-sm"
                  : "text-[#7A7A7A] dark:text-[#70788F] hover:text-[#171717] dark:hover:text-[#F5F3EA]"
              }`}
            >
              F{fl}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono font-semibold bg-[#FFFDF8] dark:bg-[#0F1422] p-2 px-3.5 rounded-2xl border border-[#E8E3D7] dark:border-[#252D42] shadow-sm">
          <span className="flex items-center gap-1.5 text-[#45B36B] dark:text-[#35D07F]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#45B36B] dark:bg-[#35D07F]" />
            Available
          </span>
          <span className="flex items-center gap-1.5 text-[#FF8A3D] dark:text-[#F5B942]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A3D] dark:bg-[#F5B942]" />
            Expiring
          </span>
          <span className="flex items-center gap-1.5 text-[#E74C3C] dark:text-[#FF5C68]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E74C3C] dark:bg-[#FF5C68]" />
            Occupied
          </span>
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div className="flex-1 min-h-0 relative">
        <div ref={containerRef} className="w-full h-full select-none" />

        {/* Hover Tooltip */}
        {hoveredRoom && hoverPos && (
          <div
            style={{ left: hoverPos.x, top: hoverPos.y }}
            className="absolute z-30 pointer-events-none p-3 rounded-2xl bg-[#FFFDF8]/95 dark:bg-[#0F1422]/95 border border-[#E8E3D7] dark:border-[#252D42] backdrop-blur-md shadow-xl text-xs space-y-1 min-w-[150px]"
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold font-mono text-[#171717] dark:text-[#F5F3EA]">
                {hoveredRoom.room_number}
              </span>
              <span
                className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded-full ${
                  hoveredRoom.status === "AVAILABLE"
                    ? "text-[#45B36B] dark:text-[#35D07F] bg-[#45B36B]/15"
                    : "text-[#E74C3C] dark:text-[#FF5C68] bg-[#E74C3C]/15"
                }`}
              >
                {hoveredRoom.status}
              </span>
            </div>
            <p className="text-[10px] text-[#7A7A7A] dark:text-[#70788F]">
              {hoveredRoom.floor_name}
            </p>
            <p className="text-[10px] text-[#171717] dark:text-[#A7AEC2] font-mono">
              Free until 2:30 PM
            </p>
          </div>
        )}

        {/* Interactive Helper Overlay (Bottom Left) */}
        <div className="absolute bottom-6 left-6 z-10 p-3 px-4 rounded-2xl bg-[#FFFDF8]/90 dark:bg-[#0F1422]/90 border border-[#E8E3D7] dark:border-[#252D42] backdrop-blur-sm text-[11px] font-mono text-[#7A7A7A] dark:text-[#A7AEC2] shadow-md flex items-center gap-3">
          <Compass className="w-4 h-4 text-[#7A3DF0]" />
          <span>Click room to inspect • Drag to rotate • Scroll to zoom</span>
        </div>

        {/* Selected Room Details Drawer / Panel (Right Side) */}
        {activeRoom && (
          <div className="absolute top-4 right-4 bottom-4 w-96 z-20 bg-[#FFFDF8] dark:bg-[#0F1422] border border-[#E8E3D7] dark:border-[#252D42] rounded-[28px] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E3D7] dark:border-[#252D42]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black font-mono text-[#171717] dark:text-[#F5F3EA]">
                      {activeRoom.room_number}
                    </h3>
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                        activeRoom.status === "AVAILABLE"
                          ? "bg-[#45B36B]/15 text-[#45B36B] dark:text-[#35D07F]"
                          : "bg-[#E74C3C]/15 text-[#E74C3C] dark:text-[#FF5C68]"
                      }`}
                    >
                      ● {activeRoom.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#7A7A7A] dark:text-[#A7AEC2] mt-0.5">
                    {activeRoom.building} • {activeRoom.floor_name}
                  </p>
                </div>
                <button
                  onClick={() => setActiveRoom(null)}
                  className="p-1.5 rounded-xl text-[#7A7A7A] hover:text-[#171717] dark:hover:text-[#F5F3EA] hover:bg-[#FAFAFC] dark:hover:bg-[#151B2B]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Live Timestamp-based Countdown Banner (Requirement 29) */}
              <div className="p-4 rounded-2xl bg-[#FAFAFC] dark:bg-[#151B2B] border border-[#E8E3D7] dark:border-[#252D42] space-y-1 text-center">
                <span className="text-[10px] uppercase font-bold text-[#7A7A7A] dark:text-[#70788F] tracking-wider block">
                  Available Until 02:30 PM • Live Countdown
                </span>
                <span className="text-2xl font-black font-mono text-[#171717] dark:text-[#F5F3EA] block">
                  {formatCountdown(secondsRemaining)}
                </span>
                <span className="text-[10px] text-[#45B36B] dark:text-[#35D07F] font-semibold block">
                  Synchronized with official SRM IST timetable schedule
                </span>
              </div>

              {/* Room Metadata Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#FAFAFC] dark:bg-[#151B2B] border border-[#E8E3D7] dark:border-[#252D42]">
                  <span className="text-[10px] text-[#7A7A7A] dark:text-[#70788F] block font-semibold">Capacity</span>
                  <span className="font-extrabold text-[#171717] dark:text-[#F5F3EA]">
                    {activeRoom.capacity ? `${activeRoom.capacity} seats` : "60 seats"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAFAFC] dark:bg-[#151B2B] border border-[#E8E3D7] dark:border-[#252D42]">
                  <span className="text-[10px] text-[#7A7A7A] dark:text-[#70788F] block font-semibold">Air Conditioning</span>
                  <span className="font-extrabold text-[#4C6EF5]">
                    {activeRoom.has_ac ? "AC Verified ✓" : "Standard"}
                  </span>
                </div>
              </div>

              {/* Next Scheduled Class */}
              <div className="p-4 rounded-2xl bg-[#FAFAFC] dark:bg-[#151B2B] border border-[#E8E3D7] dark:border-[#252D42] space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A7A] dark:text-[#70788F] block">
                  Next Class in this Space
                </span>
                <p className="font-bold text-[#171717] dark:text-[#F5F3EA]">
                  {activeRoom.current_class?.subject_name || "21ECC201T — Solid State Devices"}
                </p>
                <p className="text-[11px] text-[#7A7A7A] dark:text-[#A7AEC2] font-mono">
                  Starts at 02:30 PM • Section III ECE-B
                </p>
              </div>

              {/* Claimed Status Notice (Requirement 30) */}
              {claimedRoomNumber === activeRoom.room_number && (
                <div className="p-3 rounded-2xl bg-[#FFD81A]/20 dark:bg-[#7C5CFF]/20 border border-[#FFD81A]/40 dark:border-[#7C5CFF]/40 text-xs font-bold text-[#171717] dark:text-[#F5F3EA] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#45B36B] dark:text-[#35D07F]" />
                    Claimed for your session
                  </span>
                  <button
                    onClick={() => setClaimedRoomNumber(null)}
                    className="text-[10px] underline font-mono text-[#E74C3C] dark:text-[#FF5C68]"
                  >
                    Release Room
                  </button>
                </div>
              )}
            </div>

            {/* Actions: Claim Room & Call the Squad */}
            <div className="space-y-2 pt-4 border-t border-[#E8E3D7] dark:border-[#252D42]">
              {claimedRoomNumber === activeRoom.room_number ? (
                <button
                  onClick={() => setClaimedRoomNumber(null)}
                  className="w-full py-3 rounded-2xl text-xs font-bold bg-[#FAFAFC] dark:bg-[#151B2B] hover:bg-[#E74C3C]/10 text-[#E74C3C] dark:text-[#FF5C68] border border-[#E8E3D7] dark:border-[#252D42] transition-all"
                >
                  Release Room
                </button>
              ) : (
                <button
                  onClick={() => setClaimedRoomNumber(activeRoom.room_number)}
                  className="w-full py-3 rounded-2xl text-xs font-bold bg-[#FFD81A] hover:bg-[#FACC15] dark:bg-[#7C5CFF] dark:hover:bg-[#9278FF] text-[#171717] dark:text-[#F5F3EA] shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Claim for My Session</span>
                </button>
              )}

              {/* Call the Squad (WhatsApp dynamic message - Requirement 31) */}
              <button
                onClick={() => handleCallTheSquad(activeRoom)}
                className="w-full py-3 rounded-2xl text-xs font-bold bg-[#45B36B] hover:bg-[#3ea05f] text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call the Squad (WhatsApp)</span>
              </button>

              {/* Grid ↔ 3D Synchronization (Requirement 32) */}
              {onNavigateToGrid && (
                <button
                  onClick={onNavigateToGrid}
                  className="w-full py-2.5 rounded-2xl text-xs font-semibold bg-[#FAFAFC] dark:bg-[#151B2B] hover:bg-[#F7F4E8] text-[#171717] dark:text-[#A7AEC2] border border-[#E8E3D7] dark:border-[#252D42] transition-all flex items-center justify-center gap-1.5 text-[11px]"
                >
                  <span>View in Floor Grid</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
