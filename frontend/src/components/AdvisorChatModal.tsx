"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Send,
  Terminal,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  MapPin,
  Zap
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

Good day! I am your Attendance Advisor, connected directly to your semester timetable and deterministic mathematical calculation engine.

You can ask me questions such as:
* *"What's my next class?"*
* *"What classes do I have today?"*
* *"If I take a 3-day sick leave, will I drop below 75%?"*
* *"How many classes can I safely miss?"*

All timetable lookups are from your enrolled section. All calculations are verified by deterministic mathematics.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTools, setShowTools] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

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
        text: "Something went wrong while checking your timetable. Please ensure the backend is running and try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Quick action buttons (§38) — structured deterministic requests
  const quickActions = [
    { label: "Next Class", icon: Clock, query: "What is my next class?" },
    { label: "Today's Classes", icon: Calendar, query: "What classes do I have today?" },
    { label: "Free Period", icon: Zap, query: "When is my next free period?" },
    { label: "Room", icon: MapPin, query: "Where is my next class?" },
  ];

  const promptChips = [
    "If I take a 3-day sick leave starting tomorrow, will I drop below 75%?",
    "How many classes can I safely miss in Maths?",
    "Which subject should I focus on this week?",
    "What classes do I have tomorrow?",
    "Can I reach 85% in Solid State Devices?",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop close on mobile */}
      <div className="absolute inset-0 md:hidden" onClick={onClose} />
      
      <div className="w-full max-w-xl h-full bg-[#FFFDF8] dark:bg-[#0F1422] border-l border-[#E8E3D7] dark:border-[#252D42] shadow-2xl flex flex-col justify-between relative z-10">
        {/* Header */}
        <div className="h-14 md:h-16 px-4 md:px-6 border-b border-[#E8E3D7] dark:border-[#252D42] flex items-center justify-between shrink-0 bg-[#FFFDF8] dark:bg-[#0F1422]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#7A3DF0]/10 dark:bg-[#7C5CFF]/20 border border-[#7A3DF0]/30 dark:border-[#7C5CFF]/40 flex items-center justify-center text-[#7A3DF0] dark:text-[#A78BFA]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[#171717] dark:text-[#F5F3EA]">
                  Attendance Advisor
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#45B36B]/15 dark:bg-[#35D07F]/20 text-[#45B36B] dark:text-[#35D07F] border border-[#45B36B]/30 dark:border-[#35D07F]/40 font-bold font-mono hidden sm:inline">
                  DETERMINISTIC
                </span>
              </div>
              <p className="text-[11px] text-[#7A7A7A] dark:text-[#A7AEC2] hidden sm:block">
                Timetable facts • Mathematical calculations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7A7A7A] dark:text-[#A7AEC2] hover:text-[#171717] dark:hover:text-[#F5F3EA] hover:bg-[#FAFAFC] dark:hover:bg-[#151B2B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Buttons (§38) */}
        <div className="px-3 md:px-4 py-2 border-b border-[#E8E3D7] dark:border-[#252D42] bg-[#FAFAFC]/50 dark:bg-[#151B2B]/30 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(action.query)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold bg-[#FFFDF8] dark:bg-[#0F1422] hover:bg-[#FFF8D6] dark:hover:bg-[#7C5CFF]/20 text-[#171717] dark:text-[#F5F3EA] border border-[#E8E3D7] dark:border-[#252D42] hover:border-[#FFD81A] dark:hover:border-[#7C5CFF] shrink-0 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <Icon className="w-3.5 h-3.5 text-[#7A3DF0] dark:text-[#A78BFA]" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-5 bg-[#F7F4E8]/40 dark:bg-[#080B14]/40">
          {messages.map((msg) => {
            const isAdvisor = msg.sender === "advisor";
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 md:gap-3 ${isAdvisor ? "items-start" : "items-start justify-end"}`}
              >
                {isAdvisor && (
                  <div className="w-7 h-7 rounded-xl bg-[#7A3DF0]/10 dark:bg-[#7C5CFF]/20 border border-[#7A3DF0]/30 dark:border-[#7C5CFF]/40 flex items-center justify-center text-[#7A3DF0] dark:text-[#A78BFA] shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] md:max-w-[85%] rounded-[18px] md:rounded-[22px] p-3.5 md:p-4 text-xs leading-relaxed space-y-2 shadow-sm ${
                    isAdvisor
                      ? "bg-[#FFFDF8] dark:bg-[#0F1422] text-[#171717] dark:text-[#F5F3EA] border border-[#E8E3D7] dark:border-[#252D42]"
                      : "bg-[#FFD81A] dark:bg-[#7C5CFF] text-[#171717] dark:text-[#F5F3EA] font-medium ml-auto"
                  }`}
                >
                  {/* Tool Call Trace */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mb-2 pb-2 border-b border-[#E8E3D7] dark:border-[#252D42]">
                      <button
                        onClick={() =>
                          setShowTools((prev) => ({ ...prev, [msg.id]: !prev[msg.id] }))
                        }
                        className="flex items-center gap-1.5 text-[10px] font-mono text-[#7A3DF0] dark:text-[#A78BFA] hover:underline font-bold"
                      >
                        <Terminal className="w-3 h-3" />
                        <span>
                          {msg.toolCalls.length} Deterministic Tool(s)
                        </span>
                        {showTools[msg.id] ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {showTools[msg.id] && (
                        <div className="mt-2 p-3 rounded-xl bg-[#FAFAFC] dark:bg-[#151B2B] border border-[#E8E3D7] dark:border-[#252D42] text-[10px] font-mono text-[#171717] dark:text-[#F5F3EA] space-y-1.5 overflow-x-auto">
                          {msg.toolCalls.map((tc, tidx) => (
                            <div key={tidx}>
                              <span className="text-[#45B36B] dark:text-[#35D07F] font-bold">{tc.tool_name}</span>
                              <pre className="text-[#7A7A7A] dark:text-[#A7AEC2] overflow-x-auto text-[10px] mt-0.5 whitespace-pre-wrap break-words">
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
                    className="prose prose-xs max-w-none text-[#171717] dark:text-[#F5F3EA] space-y-1.5 break-words"
                    dangerouslySetInnerHTML={{
                      __html: msg.text
                        .replace(/### (.*)/g, "<h4 class='text-sm font-extrabold text-[#171717] dark:text-[#F5F3EA] mt-1 mb-1'>$1</h4>")
                        .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-[#171717] dark:text-[#F5F3EA]'>$1</strong>")
                        .replace(/\*(.*?)\*/g, "<em class='text-[#7A7A7A] dark:text-[#A7AEC2]'>$1</em>")
                        .replace(/\n\n/g, "<br/>")
                        .replace(/\n/g, "<br/>"),
                    }}
                  />
                </div>

                {!isAdvisor && (
                  <div className="w-7 h-7 rounded-xl bg-[#171717] dark:bg-[#252D42] flex items-center justify-center text-white dark:text-[#F5F3EA] shrink-0 mt-0.5 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-[#7A3DF0]/10 dark:bg-[#7C5CFF]/20 border border-[#7A3DF0]/30 dark:border-[#7C5CFF]/40 flex items-center justify-center text-[#7A3DF0] dark:text-[#A78BFA] shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-[20px] bg-[#FFFDF8] dark:bg-[#0F1422] border border-[#E8E3D7] dark:border-[#252D42] flex items-center gap-3 text-xs text-[#7A7A7A] dark:text-[#A7AEC2] shadow-sm">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#7A3DF0] dark:bg-[#A78BFA] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-[#7A3DF0] dark:bg-[#A78BFA] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-[#7A3DF0] dark:bg-[#A78BFA] animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
                <span className="font-medium text-[#171717] dark:text-[#F5F3EA]">Checking your timetable...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions & Input */}
        <div className="p-3 md:p-4 border-t border-[#E8E3D7] dark:border-[#252D42] bg-[#FFFDF8] dark:bg-[#0F1422] space-y-2 md:space-y-3 shrink-0">
          {/* Prompt Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {promptChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                disabled={loading}
                className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#FAFAFC] dark:bg-[#151B2B] hover:bg-[#F7F4E8] dark:hover:bg-[#252D42] text-[#171717] dark:text-[#F5F3EA] border border-[#E8E3D7] dark:border-[#252D42] hover:border-[#171717] dark:hover:border-[#7C5CFF] shrink-0 transition-all shadow-sm disabled:opacity-50"
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
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about classes, attendance, rooms..."
              className="flex-1 bg-[#FAFAFC] dark:bg-[#151B2B] text-xs text-[#171717] dark:text-[#F5F3EA] placeholder-[#7A7A7A] dark:placeholder-[#70788F] font-medium border border-[#E8E3D7] dark:border-[#252D42] rounded-2xl px-4 py-3 focus:border-[#FFD81A] dark:focus:border-[#7C5CFF] focus:outline-none focus:ring-2 focus:ring-[#FFD81A]/40 dark:focus:ring-[#7C5CFF]/40 transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 rounded-2xl bg-[#FFD81A] hover:bg-[#FACC15] dark:bg-[#7C5CFF] dark:hover:bg-[#9278FF] disabled:opacity-40 text-[#171717] dark:text-[#F5F3EA] transition-all shrink-0 active:scale-95 shadow-sm font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
