"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Send,
  Terminal,
  Bot,
  User,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { sendAdvisorChat } from "../lib/api";

interface Message {
  id: string;
  sender: "user" | "advisor";
  text: string;
  toolCalls?: Array<{
    tool_name: string;
    input_args: Record<string, any>;
    output_result: Record<string, any>;
  }>;
  structuredData?: any;
}

interface AdvisorChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: number;
  selectedTarget: number;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

export default function AdvisorChatModal({
  isOpen,
  onClose,
  sectionId,
  selectedTarget,
  initialPrompt,
  onClearInitialPrompt,
}: AdvisorChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "advisor",
      text: `### Academic Attendance Advisor

Good morning, Sarvesh. I am your Attendance Advisor, connected directly to your semester timetable and deterministic mathematical calculation engine.

You can ask me questions such as:
* *"If I take a 3-day sick leave starting tomorrow, will Digital Logic drop below 75%?"*
* *"How many classes can I safely miss in Maths?"*
* *"Can I recover Solid State Devices to 85%?"*
* *"Which subject should I prioritize this week?"*

All calculations are verified by backend rational mathematics, never fabricated by language models.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTools, setShowTools] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle initial prompt from parent
  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendAdvisorChat(query, sectionId, selectedTarget);
      const advisorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "advisor",
        text: res.ai_response,
        toolCalls: res.tool_calls,
        structuredData: res.structured_data,
      };
      setMessages((prev) => [...prev, advisorMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "advisor",
        text: "I encountered an issue querying the deterministic engine. Please verify the backend is running.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const promptChips = [
    "If I take a 3-day sick leave starting tomorrow, will Digital Logic drop below 75%?",
    "How many classes can I safely miss in Maths?",
    "Can I reach 85% in Solid State Devices?",
    "Which subject should I focus on this week?",
    "Why is Digital Logic marked critical?",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full bg-[#FFFDF8] border-l border-[#E8E3D7] shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="h-16 px-6 border-b border-[#E8E3D7] flex items-center justify-between shrink-0 bg-[#FFFDF8]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#7A3DF0]/10 border border-[#7A3DF0]/30 flex items-center justify-center text-[#7A3DF0]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[#171717]">
                  Attendance Advisor AI
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#45B36B]/15 text-[#45B36B] border border-[#45B36B]/30 font-bold font-mono">
                  DETERMINISTIC
                </span>
              </div>
              <p className="text-[11px] text-[#7A7A7A]">
                Ground-truth mathematics • SRM IST Regulation 2026
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7A7A7A] hover:text-[#171717] hover:bg-[#FAFAFC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#F7F4E8]/40">
          {messages.map((msg) => {
            const isAdvisor = msg.sender === "advisor";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAdvisor ? "items-start" : "items-start justify-end"}`}
              >
                {isAdvisor && (
                  <div className="w-7 h-7 rounded-xl bg-[#7A3DF0]/10 border border-[#7A3DF0]/30 flex items-center justify-center text-[#7A3DF0] shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-[22px] p-4 text-xs leading-relaxed space-y-2 shadow-sm ${
                    isAdvisor
                      ? "bg-[#FFFDF8] text-[#171717] border border-[#E8E3D7]"
                      : "bg-[#FFD81A] text-[#171717] font-medium ml-auto"
                  }`}
                >
                  {/* Tool Call Trace */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mb-2 pb-2 border-b border-[#E8E3D7]">
                      <button
                        onClick={() =>
                          setShowTools((prev) => ({ ...prev, [msg.id]: !prev[msg.id] }))
                        }
                        className="flex items-center gap-1.5 text-[10px] font-mono text-[#7A3DF0] hover:underline font-bold"
                      >
                        <Terminal className="w-3 h-3" />
                        <span>
                          Executed {msg.toolCalls.length} Deterministic Backend Tool(s)
                        </span>
                        {showTools[msg.id] ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {showTools[msg.id] && (
                        <div className="mt-2 p-3 rounded-xl bg-[#FAFAFC] border border-[#E8E3D7] text-[10px] font-mono text-[#171717] space-y-1.5">
                          {msg.toolCalls.map((tc, tidx) => (
                            <div key={tidx}>
                              <span className="text-[#45B36B] font-bold">{tc.tool_name}</span>
                              <pre className="text-[#7A7A7A] overflow-x-auto text-[10px] mt-0.5">
                                {JSON.stringify(tc.input_args)}
                              </pre>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Markdown Content */}
                  <div
                    className="prose prose-xs max-w-none text-[#171717] space-y-1.5"
                    dangerouslySetInnerHTML={{
                      __html: msg.text
                        .replace(/### (.*)/g, "<h4 class='text-sm font-extrabold text-[#171717] mt-1 mb-1'>$1</h4>")
                        .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-[#171717]'>$1</strong>")
                        .replace(/\*(.*?)\*/g, "<em class='text-[#7A7A7A]'>$1</em>")
                        .replace(/\n\n/g, "<br/>")
                        .replace(/\n/g, "<br/>"),
                    }}
                  />
                </div>

                {!isAdvisor && (
                  <div className="w-7 h-7 rounded-xl bg-[#171717] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-[#7A3DF0]/10 border border-[#7A3DF0]/30 flex items-center justify-center text-[#7A3DF0] shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-[20px] bg-[#FFFDF8] border border-[#E8E3D7] flex items-center gap-3 text-xs text-[#7A7A7A] shadow-sm">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#7A3DF0] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-[#7A3DF0] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-[#7A3DF0] animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
                <span className="font-medium text-[#171717]">Calculating with deterministic engine...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions & Input */}
        <div className="p-4 border-t border-[#E8E3D7] bg-[#FFFDF8] space-y-3 shrink-0">
          {/* Prompt Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {promptChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#FAFAFC] hover:bg-[#F7F4E8] text-[#171717] border border-[#E8E3D7] hover:border-[#171717] shrink-0 transition-all shadow-sm"
              >
                {chip.slice(0, 38)}...
              </button>
            ))}
          </div>

          {/* Text Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask attendance question (e.g. 'Can I miss tomorrow's DBMS?')..."
              className="flex-1 bg-[#FAFAFC] text-xs text-[#171717] placeholder-[#7A7A7A] font-medium border border-[#E8E3D7] rounded-2xl px-4 py-3 focus:border-[#FFD81A] focus:outline-none focus:ring-2 focus:ring-[#FFD81A]/40 transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 rounded-2xl bg-[#FFD81A] hover:bg-[#FACC15] disabled:opacity-40 text-[#171717] transition-all shrink-0 active:scale-95 shadow-sm font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
