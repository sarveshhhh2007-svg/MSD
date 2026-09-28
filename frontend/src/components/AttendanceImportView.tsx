"use client";

import React, { useState } from "react";
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileImage,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Edit2,
  Trash2,
  Check,
  X
} from "lucide-react";
import { parseAttendanceScreenshot, confirmAttendanceImport, updateManualAttendance } from "../lib/api";

interface AttendanceImportViewProps {
  sectionId: number;
  onRefreshData: () => void;
}

export default function AttendanceImportView({
  sectionId,
  onRefreshData,
}: AttendanceImportViewProps) {
  const [activeTab, setActiveTab] = useState<"ocr" | "manual">("ocr");
  const [loading, setLoading] = useState(false);
  const [ocrResults, setOcrResults] = useState<any | null>(null);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editAttended, setEditAttended] = useState<number>(0);
  const [editConducted, setEditConducted] = useState<number>(0);
  const [confirmedMessage, setConfirmedMessage] = useState<string | null>(null);

  // Manual entry form
  const [manualSubjectId, setManualSubjectId] = useState<number>(4); // DLD default
  const [manualAttended, setManualAttended] = useState<number>(29);
  const [manualConducted, setManualConducted] = useState<number>(40);
  const [manualSuccess, setManualSuccess] = useState<boolean>(false);

  const handleSimulateOCR = async () => {
    try {
      setLoading(true);
      setConfirmedMessage(null);
      // Calls FastAPI OCR parser endpoint
      const res = await parseAttendanceScreenshot(undefined, undefined, sectionId);
      setOcrResults(res);
    } catch (err) {
      console.error("OCR parse error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAll = async () => {
    if (!ocrResults) return;
    try {
      setLoading(true);
      await confirmAttendanceImport(ocrResults.subjects);
      setConfirmedMessage("All attendance records confirmed and recalculated!");
      onRefreshData();
    } catch (err) {
      console.error("Failed to confirm attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = (idx: number) => {
    if (!ocrResults) return;
    const updated = [...ocrResults.subjects];
    updated[idx].attended = editAttended;
    updated[idx].conducted = editConducted;
    updated[idx].status = "VALID";
    updated[idx].confidence = 1.0;
    updated[idx].confidence_tier = "HIGH";
    setOcrResults({ ...ocrResults, subjects: updated });
    setEditingRowIndex(null);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateManualAttendance(manualSubjectId, manualAttended, manualConducted);
      setManualSuccess(true);
      onRefreshData();
      setTimeout(() => setManualSuccess(false), 3000);
    } catch (err) {
      console.error("Manual update error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#F5F3EA]">
            Attendance Ingestion &amp; OCR Engine
          </h2>
          <p className="text-xs text-[#70788F]">
            Upload college ERP screenshots with deterministic validation, alias resolution, and manual review.
          </p>
        </div>

        <div className="flex items-center bg-[#0F1422] p-1 rounded-lg border border-[#252D42]">
          <button
            onClick={() => setActiveTab("ocr")}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
              activeTab === "ocr"
                ? "bg-[#7C5CFF] text-[#F5F3EA]"
                : "text-[#A7AEC2] hover:text-[#F5F3EA]"
            }`}
          >
            Screenshot OCR
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
              activeTab === "manual"
                ? "bg-[#7C5CFF] text-[#F5F3EA]"
                : "text-[#A7AEC2] hover:text-[#F5F3EA]"
            }`}
          >
            Manual Adjustment
          </button>
        </div>
      </div>

      {activeTab === "ocr" ? (
        <div className="space-y-6">
          {/* Upload Dropzone Card */}
          <div className="p-8 rounded-xl bg-[#0F1422] border-2 border-dashed border-[#252D42] hover:border-[#7C5CFF]/60 transition-colors flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-[#151B2B] border border-[#252D42] flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-[#7C5CFF]" />
            </div>
            <h3 className="text-xs font-bold text-[#F5F3EA]">
              Drag &amp; Drop Attendance Portal Screenshot
            </h3>
            <p className="text-[11px] text-[#70788F] max-w-sm mt-1 mb-4">
              Supports PNG, JPG, or PDF screenshots from SRM Academia, Evarsity, or CollPoll portals.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSimulateOCR}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#7C5CFF] hover:bg-[#9278FF] text-[#F5F3EA] shadow-md transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Vision AI...</span>
                  </>
                ) : (
                  <>
                    <FileImage className="w-3.5 h-3.5" />
                    <span>Load SRM College ERP Sample Screenshot</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* OCR Pipeline Steps Visualization (Section 20) */}
          <div className="p-4 rounded-xl bg-[#0F1422] border border-[#252D42]">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-[#70788F] mb-3">
              Deterministic Verification Architecture
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-[#151B2B] border border-[#252D42]">
                <span className="text-[10px] text-[#7C5CFF] font-mono block">STAGE 1</span>
                <span className="font-semibold text-[#F5F3EA] block mt-0.5">Vision OCR</span>
                <span className="text-[10px] text-[#70788F]">Extracts raw numbers</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#151B2B] border border-[#252D42]">
                <span className="text-[10px] text-[#7C5CFF] font-mono block">STAGE 2</span>
                <span className="font-semibold text-[#F5F3EA] block mt-0.5">Subject Matcher</span>
                <span className="text-[10px] text-[#70788F]">Code &rarr; Name &rarr; Alias</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#151B2B] border border-[#252D42]">
                <span className="text-[10px] text-[#7C5CFF] font-mono block">STAGE 3</span>
                <span className="font-semibold text-[#F5F3EA] block mt-0.5">Validation</span>
                <span className="text-[10px] text-[#70788F]">Rejects Attended &gt; Conducted</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#151B2B] border border-[#252D42]">
                <span className="text-[10px] text-[#7C5CFF] font-mono block">STAGE 4</span>
                <span className="font-semibold text-[#F5F3EA] block mt-0.5">User Review</span>
                <span className="text-[10px] text-[#70788F]">Never commits blindly</span>
              </div>
            </div>
          </div>

          {/* OCR Review Table (Section 25) */}
          {ocrResults && (
            <div className="p-5 rounded-xl bg-[#0F1422] border border-[#252D42] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#F5F3EA] uppercase tracking-wider">
                    Extracted Attendance Table (Review Required)
                  </h3>
                  <p className="text-[11px] text-[#70788F]">
                    Source: {ocrResults.filename} • Overall Confidence: {Math.round(ocrResults.overall_confidence * 100)}%
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleConfirmAll}
                    disabled={loading}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#35D07F] hover:bg-[#35D07F]/90 text-black flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm All &amp; Calculate</span>
                  </button>
                </div>
              </div>

              {confirmedMessage && (
                <div className="p-3 rounded-lg bg-[#35D07F]/10 border border-[#35D07F]/30 text-[#35D07F] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{confirmedMessage}</span>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#252D42] text-[11px] text-[#70788F]">
                      <th className="pb-2 font-medium">Extracted Subject</th>
                      <th className="pb-2 font-medium">Resolved Course</th>
                      <th className="pb-2 font-medium text-center">Attended</th>
                      <th className="pb-2 font-medium text-center">Conducted</th>
                      <th className="pb-2 font-medium text-center">% Rate</th>
                      <th className="pb-2 font-medium text-center">Confidence</th>
                      <th className="pb-2 font-medium text-center">Status</th>
                      <th className="pb-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252D42]/60 text-[#A7AEC2]">
                    {ocrResults.subjects.map((row: any, idx: number) => {
                      const isEditing = editingRowIndex === idx;
                      const isHigh = row.confidence_tier === "HIGH";
                      const isReview = row.confidence_tier === "MEDIUM" || row.status === "REVIEW_REQUIRED";
                      const pct = row.conducted > 0 ? Math.round((row.attended / row.conducted) * 100) : 0;

                      return (
                        <tr key={idx} className="hover:bg-[#151B2B]/40 transition-colors">
                          <td className="py-2.5 font-mono text-[#F5F3EA]">
                            {row.raw_subject}
                          </td>
                          <td className="py-2.5">
                            <span className="font-semibold text-[#F5F3EA] block">
                              {row.matched_subject_name || "Unmapped"}
                            </span>
                            <span className="text-[10px] text-[#70788F] font-mono">
                              {row.matched_subject_code || "Review needed"}
                            </span>
                          </td>

                          {/* Attended & Conducted */}
                          <td className="py-2.5 text-center">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editAttended}
                                onChange={(e) => setEditAttended(Number(e.target.value))}
                                className="w-14 bg-[#151B2B] text-center border border-[#7C5CFF] rounded p-1 text-[#F5F3EA]"
                              />
                            ) : (
                              <span className="font-semibold text-[#F5F3EA]">{row.attended}</span>
                            )}
                          </td>
                          <td className="py-2.5 text-center">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editConducted}
                                onChange={(e) => setEditConducted(Number(e.target.value))}
                                className="w-14 bg-[#151B2B] text-center border border-[#7C5CFF] rounded p-1 text-[#F5F3EA]"
                              />
                            ) : (
                              <span className="font-semibold text-[#F5F3EA]">{row.conducted}</span>
                            )}
                          </td>

                          {/* % Rate */}
                          <td className="py-2.5 text-center font-bold text-[#F5F3EA]">
                            {pct}%
                          </td>

                          {/* Confidence */}
                          <td className="py-2.5 text-center">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                isHigh
                                  ? "bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/30"
                                  : "bg-[#F5B942]/10 text-[#F5B942] border border-[#F5B942]/30"
                              }`}
                            >
                              {Math.round(row.confidence * 100)}%
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-2.5 text-center">
                            {isHigh ? (
                              <span className="text-[10px] font-semibold text-[#35D07F]">High</span>
                            ) : (
                              <span className="text-[10px] font-semibold text-[#F5B942]">Review</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleSaveEdit(idx)}
                                  className="p-1 rounded bg-[#35D07F]/20 text-[#35D07F] hover:bg-[#35D07F]/30"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingRowIndex(null)}
                                  className="p-1 rounded bg-red-900/20 text-red-400 hover:bg-red-900/30"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingRowIndex(idx);
                                  setEditAttended(row.attended);
                                  setEditConducted(row.conducted);
                                }}
                                className="px-2 py-1 rounded bg-[#151B2B] text-[#A7AEC2] hover:text-[#F5F3EA] border border-[#252D42] text-[11px]"
                              >
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Manual Entry Form */
        <div className="max-w-xl mx-auto p-6 rounded-xl bg-[#0F1422] border border-[#252D42] space-y-5">
          <div>
            <h3 className="text-xs font-bold text-[#F5F3EA] uppercase tracking-wider">
              Manual Attendance Correction
            </h3>
            <p className="text-[11px] text-[#70788F]">
              Directly update conducted and attended counts for any subject. Triggers immediate recalculation.
            </p>
          </div>

          {manualSuccess && (
            <div className="p-3 rounded-lg bg-[#35D07F]/10 border border-[#35D07F]/30 text-[#35D07F] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Attendance updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#A7AEC2] block mb-1.5">
                Target Subject
              </label>
              <select
                value={manualSubjectId}
                onChange={(e) => setManualSubjectId(Number(e.target.value))}
                className="w-full bg-[#151B2B] text-xs text-[#F5F3EA] border border-[#252D42] rounded-lg p-2.5 focus:border-[#7C5CFF] focus:outline-none"
              >
                <option value={4}>21ECC203T — Digital Logic Design</option>
                <option value={1}>21MAB201T — Transforms and Boundary Value Problems</option>
                <option value={2}>21ECC201T — Solid State Devices</option>
                <option value={3}>21CSS201T — Computer Organization &amp; Architecture</option>
                <option value={5}>21ECC205T — Electromagnetic Theory</option>
                <option value={6}>21LEM201T — Professional Ethics</option>
                <option value={7}>21LEM202T — Universal Human Values-II</option>
                <option value={8}>21ECC211L — Devices &amp; Digital IC Lab</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[#A7AEC2] block mb-1.5">
                  Attended Classes
                </label>
                <input
                  type="number"
                  min={0}
                  value={manualAttended}
                  onChange={(e) => setManualAttended(Number(e.target.value))}
                  className="w-full bg-[#151B2B] text-xs text-[#F5F3EA] border border-[#252D42] rounded-lg p-2.5 focus:border-[#7C5CFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#A7AEC2] block mb-1.5">
                  Conducted Classes
                </label>
                <input
                  type="number"
                  min={manualAttended}
                  value={manualConducted}
                  onChange={(e) => setManualConducted(Number(e.target.value))}
                  className="w-full bg-[#151B2B] text-xs text-[#F5F3EA] border border-[#252D42] rounded-lg p-2.5 focus:border-[#7C5CFF] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[#7C5CFF] hover:bg-[#9278FF] text-[#F5F3EA] shadow-md transition-all"
            >
              Update Record
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
