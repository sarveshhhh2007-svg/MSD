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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full bg-[#0F1422] border-l border-[#252D42] shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="h-16 px-6 border-b border-[#252D42] flex items-center justify-between shrink-0 bg-[#0F1422]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#A78BFA]/15 border border-[#A78BFA]/30 flex items-center justify-center text-[#A78BFA]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#F5F3EA]">
                  Attendance Advisor AI
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/25 font-mono">
                  DETERMINISTIC
                </span>
              </div>
              <p className="text-[11px] text-[#70788F]">
                Ground-truth mathematics • SRM IST Regulation 2026
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#70788F] hover:text-[#F5F3EA] hover:bg-[#151B2B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((msg) => {
            const isAdvisor = msg.sender === "advisor";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAdvisor ? "items-start" : "items-start justify-end"}`}
              >
                {isAdvisor && (
                  <div className="w-7 h-7 rounded-lg bg-[#A78BFA]/15 border border-[#A78BFA]/30 flex items-center justify-center text-[#A78BFA] shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed space-y-2 ${
                    isAdvisor
                      ? "bg-[#151B2B] text-[#F5F3EA] border border-[#252D42]"
                      : "bg-[#7C5CFF] text-[#F5F3EA] ml-auto shadow-md"
                  }`}
                >
                  {/* Tool Call Trace (Section 39) */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mb-2 pb-2 border-b border-[#252D42]">
                      <button
                        onClick={() =>
                          setShowTools((prev) => ({ ...prev, [msg.id]: !prev[msg.id] }))
                        }
                        className="flex items-center gap-1.5 text-[10px] font-mono text-[#A78BFA] hover:underline"
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
                        <div className="mt-2 p-2 rounded bg-[#080B14] border border-[#252D42] text-[10px] font-mono text-[#A7AEC2] space-y-1">
                          {msg.toolCalls.map((tc, tidx) => (
                            <div key={tidx}>
                              <span className="text-[#35D07F] font-bold">{tc.tool_name}</span>
                              <pre className="text-[#70788F] overflow-x-auto">
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
                    className="prose prose-invert prose-xs max-w-none text-[#F5F3EA] space-y-1.5"
                    dangerouslySetInnerHTML={{
                      __html: msg.text
                        .replace(/### (.*)/g, "<h4 class='text-sm font-bold text-[#F5F3EA] mt-1 mb-1'>$1</h4>")
                        .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-[#F5F3EA]'>$1</strong>")
                        .replace(/\*(.*?)\*/g, "<em class='text-[#A7AEC2]'>$1</em>")
                        .replace(/\n\n/g, "<br/>")
                        .replace(/\n/g, "<br/>"),
                    }}
                  />
                </div>

                {!isAdvisor && (
                  <div className="w-7 h-7 rounded-lg bg-[#7C5CFF]/20 border border-[#7C5CFF]/40 flex items-center justify-center text-[#9278FF] shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#A78BFA]/15 border border-[#A78BFA]/30 flex items-center justify-center text-[#A78BFA] shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-xl bg-[#151B2B] border border-[#252D42] flex items-center gap-2 text-xs text-[#A7AEC2]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#A78BFA]" />
                <span>Running deterministic timetable evaluation...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions & Input */}
        <div className="p-4 border-t border-[#252D42] bg-[#0F1422] space-y-3 shrink-0">
          {/* Prompt Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {promptChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="px-2.5 py-1 rounded-full text-[11px] bg-[#151B2B] hover:bg-[#151B2B]/80 text-[#A7AEC2] hover:text-[#F5F3EA] border border-[#252D42] shrink-0 transition-colors"
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
              placeholder="Ask attendance question (e.g. 'How many classes can I miss in Maths?')..."
              className="flex-1 bg-[#151B2B] text-xs text-[#F5F3EA] placeholder-[#70788F] border border-[#252D42] rounded-lg px-3.5 py-2.5 focus:border-[#7C5CFF] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-lg bg-[#7C5CFF] hover:bg-[#9278FF] disabled:opacity-40 text-[#F5F3EA] transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
