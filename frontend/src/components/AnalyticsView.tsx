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
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#F5F3EA]">
            Academic Attendance Analytics &amp; Health Distributions
          </h2>
          <p className="text-xs text-[#70788F]">
            Data-dense visual telemetry calibrated to the {targetPct}% requirement threshold.
          </p>
        </div>

        <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#151B2B] text-[#A7AEC2] border border-[#252D42]">
          RECHARTS TELEMETRY
        </span>
      </div>

      {/* Top Grid: Comparison Bar Chart & Health Distribution Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Attendance Comparison (Bar Chart) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#0F1422] border border-[#252D42] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#F5F3EA] uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#7C5CFF]" />
              Subject Attendance vs. Target Threshold
            </h3>
            <span className="text-[11px] text-[#70788F]">
              Reference line: {targetPct}%
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.comparison} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252D42" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#70788F"
                  tick={{ fill: "#A7AEC2", fontSize: 10 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#70788F"
                  tick={{ fill: "#70788F", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#151B2B",
                    borderColor: "#252D42",
                    borderRadius: "8px",
                    color: "#F5F3EA",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${val}%`, "Attendance"]}
                />
                <ReferenceLine y={targetPct} stroke="#7C5CFF" strokeDasharray="4 4" strokeWidth={1.5} />
                <Bar
                  dataKey="current"
                  name="Current Attendance"
                  radius={[4, 4, 0, 0]}
                  fill="#35D07F"
                >
                  {data.comparison.map((entry: any, index: number) => {
                    const color =
                      entry.status === "CRITICAL"
                        ? "#FF5C68"
                        : entry.status === "WATCH"
                        ? "#F5B942"
                        : "#35D07F";
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Distribution Donut Chart */}
        <div className="p-5 rounded-xl bg-[#0F1422] border border-[#252D42] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[#F5F3EA] uppercase tracking-wider flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-[#7C5CFF]" />
                Course Health Distribution
              </h3>
            </div>
            <p className="text-[11px] text-[#70788F]">
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
                    {data.distribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#151B2B",
                      borderColor: "#252D42",
                      borderRadius: "8px",
                      color: "#F5F3EA",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-[#252D42]">
            {data.distribution.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[#A7AEC2]">{item.name}</span>
                </div>
                <span className="font-bold text-[#F5F3EA]">{item.value} Courses</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Trend Line Chart (Section 34) */}
      <div className="p-5 rounded-xl bg-[#0F1422] border border-[#252D42] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#F5F3EA] uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#7C5CFF]" />
              Weekly Attendance Trajectory Trend
            </h3>
            <p className="text-[11px] text-[#70788F]">
              Historical progression across Semester III academic calendar
            </p>
          </div>
          <span className="text-xs font-semibold text-[#35D07F]">
            Currently +9.7% above minimum detention
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trend} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252D42" vertical={false} />
              <XAxis dataKey="week" stroke="#70788F" tick={{ fill: "#A7AEC2", fontSize: 11 }} />
              <YAxis domain={[60, 100]} stroke="#70788F" tick={{ fill: "#70788F", fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#151B2B",
                  borderColor: "#252D42",
                  borderRadius: "8px",
                  color: "#F5F3EA",
                  fontSize: "12px",
                }}
                formatter={(val: any) => [`${val}%`, "Attendance"]}
              />
              <ReferenceLine y={targetPct} stroke="#7C5CFF" strokeDasharray="4 4" label={{ value: `Target ${targetPct}%`, fill: "#9278FF", fontSize: 11, position: "top" }} />
              <Line
                type="monotone"
                dataKey="attendance"
                stroke="#7C5CFF"
                strokeWidth={3}
                dot={{ r: 4, fill: "#7C5CFF" }}
                activeDot={{ r: 6, fill: "#9278FF" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
