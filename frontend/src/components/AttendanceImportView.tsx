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
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#F7F4E8] text-[#171717]">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#171717] tracking-tight">
            Attendance Ingestion &amp; OCR Engine
          </h2>
          <p className="text-xs text-[#7A7A7A] mt-0.5">
            Upload college ERP screenshots with deterministic validation, alias resolution, and manual review.
          </p>
        </div>

        <div className="flex items-center bg-[#FFFDF8] p-1.5 rounded-2xl border border-[#E8E3D7] shadow-sm self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("ocr")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "ocr"
                ? "bg-[#FFD81A] text-[#171717] shadow-sm"
                : "text-[#7A7A7A] hover:text-[#171717]"
            }`}
          >
            Screenshot OCR
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "manual"
                ? "bg-[#FFD81A] text-[#171717] shadow-sm"
                : "text-[#7A7A7A] hover:text-[#171717]"
            }`}
          >
            Manual Adjustment
          </button>
        </div>
      </div>

      {activeTab === "ocr" ? (
        <div className="space-y-6">
          {/* Upload Dropzone Card */}
          <div className="p-10 rounded-[28px] bg-[#FFFDF8] border-2 border-dashed border-[#E8E3D7] hover:border-[#171717] transition-all flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7] flex items-center justify-center mb-4 shadow-sm">
              <Upload className="w-7 h-7 text-[#7A3DF0]" />
            </div>
            <h3 className="text-sm font-extrabold text-[#171717]">
              Drag &amp; Drop Attendance Portal Screenshot
            </h3>
            <p className="text-xs text-[#7A7A7A] max-w-sm mt-1 mb-5">
              Supports PNG, JPG, or PDF screenshots from SRM Academia, Evarsity, or CollPoll portals.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSimulateOCR}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FFD81A] hover:bg-[#FACC15] text-[#171717] shadow-sm transition-all flex items-center gap-2 active:scale-95"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#171717]" />
                    <span>Processing Vision AI...</span>
                  </>
                ) : (
                  <>
                    <FileImage className="w-4 h-4 text-[#171717]" />
                    <span>Load SRM College ERP Sample Screenshot</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* OCR Pipeline Steps Visualization */}
          <div className="p-6 rounded-[28px] bg-[#FFFDF8] border border-[#E8E3D7] shadow-sm">
            <p className="text-[11px] uppercase tracking-wider font-bold text-[#7A7A7A] mb-4">
              Deterministic Verification Architecture
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7]">
                <span className="text-[10px] text-[#7A3DF0] font-mono font-bold block">STAGE 1</span>
                <span className="font-bold text-[#171717] block mt-1">Vision OCR</span>
                <span className="text-[11px] text-[#7A7A7A]">Extracts raw numbers</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7]">
                <span className="text-[10px] text-[#7A3DF0] font-mono font-bold block">STAGE 2</span>
                <span className="font-bold text-[#171717] block mt-1">Subject Matcher</span>
                <span className="text-[11px] text-[#7A7A7A]">Code &rarr; Name &rarr; Alias</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7]">
                <span className="text-[10px] text-[#7A3DF0] font-mono font-bold block">STAGE 3</span>
                <span className="font-bold text-[#171717] block mt-1">Validation</span>
                <span className="text-[11px] text-[#7A7A7A]">Rejects Attended &gt; Conducted</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#E8E3D7]">
                <span className="text-[10px] text-[#7A3DF0] font-mono font-bold block">STAGE 4</span>
                <span className="font-bold text-[#171717] block mt-1">User Review</span>
                <span className="text-[11px] text-[#7A7A7A]">Never commits blindly</span>
              </div>
            </div>
          </div>

          {/* OCR Review Table */}
          {ocrResults && (
            <div className="p-6 rounded-[28px] bg-[#FFFDF8] border border-[#E8E3D7] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                    Extracted Attendance Table (Review Required)
                  </h3>
                  <p className="text-[11px] text-[#7A7A7A] mt-0.5">
                    Source: {ocrResults.filename} • Overall Confidence: {Math.round(ocrResults.overall_confidence * 100)}%
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleConfirmAll}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#45B36B] hover:bg-[#3ea05f] text-white flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm All &amp; Calculate</span>
                  </button>
                </div>
              </div>

              {confirmedMessage && (
                <div className="p-3.5 rounded-2xl bg-[#45B36B]/15 border border-[#45B36B]/30 text-[#45B36B] text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#45B36B]" />
                  <span>{confirmedMessage}</span>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E8E3D7] text-[11px] text-[#7A7A7A] uppercase font-semibold">
                      <th className="pb-3">Extracted Subject</th>
                      <th className="pb-3">Resolved Course</th>
                      <th className="pb-3 text-center">Attended</th>
                      <th className="pb-3 text-center">Conducted</th>
                      <th className="pb-3 text-center">% Rate</th>
                      <th className="pb-3 text-center">Confidence</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E3D7] text-[#171717]">
                    {ocrResults.subjects.map((row: any, idx: number) => {
                      const isEditing = editingRowIndex === idx;
                      const isHigh = row.confidence_tier === "HIGH";
                      const pct = row.conducted > 0 ? Math.round((row.attended / row.conducted) * 100) : 0;

                      return (
                        <tr key={idx} className="hover:bg-[#FAFAFC]/60 transition-colors">
                          <td className="py-3 font-mono font-medium text-[#171717]">
                            {row.raw_subject}
                          </td>
                          <td className="py-3">
                            <span className="font-bold text-[#171717] block">
                              {row.matched_subject_name || "Unmapped"}
                            </span>
                            <span className="text-[10px] text-[#7A7A7A] font-mono">
                              {row.matched_subject_code || "Review needed"}
                            </span>
                          </td>

                          {/* Attended & Conducted */}
                          <td className="py-3 text-center">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editAttended}
                                onChange={(e) => setEditAttended(Number(e.target.value))}
                                className="w-14 bg-[#FAFAFC] text-center border border-[#FFD81A] rounded-lg p-1 text-[#171717] font-bold"
                              />
                            ) : (
                              <span className="font-extrabold text-[#171717]">{row.attended}</span>
                            )}
                          </td>
                          <td className="py-3 text-center">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editConducted}
                                onChange={(e) => setEditConducted(Number(e.target.value))}
                                className="w-14 bg-[#FAFAFC] text-center border border-[#FFD81A] rounded-lg p-1 text-[#171717] font-bold"
                              />
                            ) : (
                              <span className="font-extrabold text-[#171717]">{row.conducted}</span>
                            )}
                          </td>

                          {/* % Rate */}
                          <td className="py-3 text-center font-extrabold text-[#171717]">
                            {pct}%
                          </td>

                          {/* Confidence */}
                          <td className="py-3 text-center">
                            <span
                              className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                                isHigh
                                  ? "bg-[#45B36B]/15 text-[#45B36B] border border-[#45B36B]/30"
                                  : "bg-[#FF8A3D]/15 text-[#FF8A3D] border border-[#FF8A3D]/30"
                              }`}
                            >
                              {Math.round(row.confidence * 100)}%
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 text-center">
                            {isHigh ? (
                              <span className="text-[10px] font-bold text-[#45B36B]">● Valid</span>
                            ) : (
                              <span className="text-[10px] font-bold text-[#FF8A3D]">● Review</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleSaveEdit(idx)}
                                  className="p-1 rounded-lg bg-[#45B36B]/20 text-[#45B36B] hover:bg-[#45B36B]/30"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingRowIndex(null)}
                                  className="p-1 rounded-lg bg-[#E74C3C]/20 text-[#E74C3C] hover:bg-[#E74C3C]/30"
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
                                className="px-2.5 py-1 rounded-xl bg-[#FAFAFC] text-[#171717] hover:bg-[#F7F4E8] border border-[#E8E3D7] text-[11px] font-semibold transition-all shadow-sm"
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
        <div className="max-w-xl mx-auto p-8 rounded-[28px] bg-[#FFFDF8] border border-[#E8E3D7] space-y-6 shadow-sm">
          <div>
            <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
              Manual Attendance Correction
            </h3>
            <p className="text-[11px] text-[#7A7A7A] mt-0.5">
              Directly update conducted and attended counts for any subject. Triggers immediate recalculation.
            </p>
          </div>

          {manualSuccess && (
            <div className="p-3.5 rounded-2xl bg-[#45B36B]/15 border border-[#45B36B]/30 text-[#45B36B] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#45B36B]" />
              <span>Attendance updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#7A7A7A] block mb-1.5">
                Target Subject
              </label>
              <select
                value={manualSubjectId}
                onChange={(e) => setManualSubjectId(Number(e.target.value))}
                className="w-full bg-[#FAFAFC] text-xs text-[#171717] font-medium border border-[#E8E3D7] rounded-xl p-3 focus:border-[#FFD81A] focus:outline-none transition-all shadow-sm"
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
                <label className="text-xs font-semibold text-[#7A7A7A] block mb-1.5">
                  Attended Classes
                </label>
                <input
                  type="number"
                  min={0}
                  value={manualAttended}
                  onChange={(e) => setManualAttended(Number(e.target.value))}
                  className="w-full bg-[#FAFAFC] text-xs text-[#171717] font-bold border border-[#E8E3D7] rounded-xl p-3 focus:border-[#FFD81A] focus:outline-none transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7A7A7A] block mb-1.5">
                  Conducted Classes
                </label>
                <input
                  type="number"
                  min={manualAttended}
                  value={manualConducted}
                  onChange={(e) => setManualConducted(Number(e.target.value))}
                  className="w-full bg-[#FAFAFC] text-xs text-[#171717] font-bold border border-[#E8E3D7] rounded-xl p-3 focus:border-[#FFD81A] focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs font-bold bg-[#FFD81A] hover:bg-[#FACC15] text-[#171717] shadow-sm transition-all active:scale-95"
            >
              Update Record
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
