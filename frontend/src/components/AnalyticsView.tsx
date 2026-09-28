"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { BarChart3, TrendingUp, PieChart as PieIcon, ShieldCheck } from "lucide-react";
import { fetchAnalytics } from "../lib/api";

interface AnalyticsViewProps {
  sectionId: number;
  selectedTarget: number;
}

export default function AnalyticsView({ sectionId, selectedTarget }: AnalyticsViewProps) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchAnalytics(sectionId, selectedTarget);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sectionId, selectedTarget]);

  if (!data) return null;

  const targetPct = Math.round(selectedTarget * 100);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#F7F4E8] text-[#171717]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#171717] tracking-tight">
            Academic Attendance Analytics &amp; Health Distributions
          </h2>
          <p className="text-xs text-[#7A7A7A] mt-0.5">
            Data-dense visual telemetry calibrated to the {targetPct}% requirement threshold.
          </p>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#FFFDF8] text-[#171717] border border-[#E8E3D7] shadow-sm self-start sm:self-auto">
          RECHARTS TELEMETRY
        </span>
      </div>

      {/* Top Grid: Comparison Bar Chart & Health Distribution Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Attendance Comparison (Bar Chart) */}
        <div className="lg:col-span-2 p-7 rounded-[28px] bg-[#FFFDF8] border border-[#E8E3D7] space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#7A3DF0]" />
              Subject Attendance vs. Target Threshold
            </h3>
            <span className="text-[11px] font-semibold text-[#7A7A7A]">
              Reference line: {targetPct}%
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.comparison} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E3D7" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#7A7A7A"
                  tick={{ fill: "#171717", fontSize: 10, fontWeight: 500 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#7A7A7A"
                  tick={{ fill: "#7A7A7A", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFDF8",
                    borderColor: "#E8E3D7",
                    borderRadius: "16px",
                    color: "#171717",
                    fontSize: "12px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    fontWeight: 600,
                  }}
                  formatter={(val: any) => [`${val}%`, "Attendance"]}
                />
                <ReferenceLine y={targetPct} stroke="#FFD81A" strokeDasharray="4 4" strokeWidth={2} />
                <Bar
                  dataKey="current"
                  name="Current Attendance"
                  radius={[6, 6, 0, 0]}
                  fill="#45B36B"
                >
                  {data.comparison.map((entry: any, index: number) => {
                    const color =
                      entry.status === "CRITICAL"
                        ? "#E74C3C"
                        : entry.status === "WATCH"
                        ? "#FF8A3D"
                        : "#45B36B";
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Distribution Donut Chart */}
        <div className="p-7 rounded-[28px] bg-[#FFFDF8] border border-[#E8E3D7] space-y-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-[#7A3DF0]" />
                Course Health Distribution
              </h3>
            </div>
            <p className="text-[11px] text-[#7A7A7A]">
              Deterministic classification breakdown
            </p>

            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.distribution.filter((d: any) => d.value > 0)}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {data.distribution.map((entry: any, index: number) => {
                      const color =
                        entry.name?.includes("Critical") ? "#E74C3C" :
                        entry.name?.includes("Watch") || entry.name?.includes("Caution") ? "#FF8A3D" : "#45B36B";
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFDF8",
                      borderColor: "#E8E3D7",
                      borderRadius: "16px",
                      color: "#171717",
                      fontSize: "12px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-[#E8E3D7]">
            {data.distribution.map((item: any, idx: number) => {
              const color =
                item.name?.includes("Critical") ? "#E74C3C" :
                item.name?.includes("Watch") || item.name?.includes("Caution") ? "#FF8A3D" : "#45B36B";
              return (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[#7A7A7A] font-medium">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-[#171717]">{item.value} Courses</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Attendance Trend Line Chart */}
      <div className="p-7 rounded-[28px] bg-[#FFFDF8] border border-[#E8E3D7] space-y-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#7A3DF0]" />
              Weekly Attendance Trajectory Trend
            </h3>
            <p className="text-[11px] text-[#7A7A7A] mt-0.5">
              Historical progression across Semester III academic calendar
            </p>
          </div>
          <span className="text-xs font-bold text-[#45B36B]">
            Currently +9.7% above minimum detention
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trend} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E3D7" vertical={false} />
              <XAxis dataKey="week" stroke="#7A7A7A" tick={{ fill: "#171717", fontSize: 11 }} />
              <YAxis domain={[60, 100]} stroke="#7A7A7A" tick={{ fill: "#7A7A7A", fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFDF8",
                  borderColor: "#E8E3D7",
                  borderRadius: "16px",
                  color: "#171717",
                  fontSize: "12px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  fontWeight: 600,
                }}
                formatter={(val: any) => [`${val}%`, "Attendance"]}
              />
              <ReferenceLine y={targetPct} stroke="#FFD81A" strokeDasharray="4 4" strokeWidth={2} label={{ value: `Target ${targetPct}%`, fill: "#171717", fontSize: 11, position: "top", fontWeight: "bold" }} />
              <Line
                type="monotone"
                dataKey="attendance"
                stroke="#171717"
                strokeWidth={3}
                dot={{ r: 4, fill: "#FFD81A", stroke: "#171717", strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: "#FFD81A", stroke: "#171717", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
