import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCommentDots,
  FaXmark,
  FaPaperPlane,
  FaRotateRight,
  FaWandMagicSparkles,
  FaArrowRight,
  FaSpinner,
  FaRobot,
  FaMagnifyingGlass,
} from "react-icons/fa6";
import api from "../services/api";

const INITIAL_MESSAGE = {
  id: "welcome-1",
  role: "model",
  content:
    "Hi there! I am **RentoBot**, your AI assistant on Rentosphere 🏠\n\nHow can I help you today? You can ask me to:\n- **Find verified rental homes** by locality, BHK, or budget\n- **Explain zero-brokerage policies** and how to reach owners\n- **Guide landlords** on listing properties and estimating fair rent\n- **Answer questions** on security deposits and rental agreements",
  suggestedActions: [
    { label: "Search Homes in Chennai", url: "/search?city=Chennai" },
    { label: "Post a Property for Free", url: "/post-property" },
  ],
  quickReplies: [
    "Find 2BHK in Velachery under 30k",
    "How does zero brokerage work?",
    "How are security deposits calculated?",
    "How do I estimate fair market rent?",
  ],
};

const SUGGESTED_PROMPTS = [
  "2BHK in Velachery under 30k",
  "Is there any brokerage?",
  "Estimate my flat's rent",
  "Rental agreement norms",
];

// Simple markdown formatter for clean rendering of bolding, bullets, and linebreaks
function renderFormattedMessage(text) {
  if (!text) return null;

  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-xs leading-relaxed text-gray-800">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header ###
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-bold text-gray-900 text-xs mt-1">
              {trimmed.replace(/^###\s+/, "")}
            </h4>
          );
        }

        // Bullet point -
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          const bulletContent = trimmed.replace(/^[-•]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span className="text-[#009587] font-bold">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(bulletContent) }} />
            </div>
          );
        }

        // Numbered list 1.
        const numMatch = trimmed.match(/^([0-9]+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span className="text-[#009587] font-semibold">{numMatch[1]}.</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(numMatch[2]) }} />
            </div>
          );
        }

        return (
          <p
            key={idx}
            dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
          />
        );
      })}
    </div>
  );
}

function formatInline(str) {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
}

export default function Chatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Load message history from sessionStorage
  const [messages, setMessages] = useState(() => {
    try {
      const stored = sessionStorage.getItem("rentosphere_chat_history");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback to initial
    }
    return [INITIAL_MESSAGE];
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Save to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("rentosphere_chat_history", JSON.stringify(messages));
    } catch (err) {
      console.warn("Could not persist chat history:", err);
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const raw = (textToSend || input).trim();
    if (!raw || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: raw,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Build history for backend multi-turn context
    const historyPayload = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await api.post("/chatbot/message", {
        message: raw,
        history: historyPayload,
      });

      const data = res.data?.data;
      if (data) {
        const botMsg = {
          id: `bot-${Date.now()}`,
          role: "model",
          content: data.reply || "I'm here to help with all your rental housing needs!",
          suggestedActions: data.suggestedActions || [],
          quickReplies: data.quickReplies || [],
          provider: data.provider || "gemini",
        };
        setMessages((prev) => [...prev, botMsg]);
        if (!isOpen) setHasUnread(true);
      }
    } catch (err) {
      console.error("Chatbot error:", err);
      const fallbackMsg = {
        id: `bot-${Date.now()}`,
        role: "model",
        content:
          "I had trouble contacting the live AI server right now, but I can still assist you! You can browse our zero-brokerage listings or post a property below.",
        suggestedActions: [
          { label: "Search All Homes", url: "/search" },
          { label: "Post a Property", url: "/post-property" },
        ],
        quickReplies: ["Find 2BHK in Chennai", "Zero Brokerage Policy"],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    sessionStorage.removeItem("rentosphere_chat_history");
  };

  const handleActionClick = (url) => {
    if (url) {
      navigate(url);
    }
  };

  return (
    <>
      {/* ── Floating Launcher Button ────────────────────────────────────────── */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open Rentosphere AI Assistant"
            className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#009587] to-teal-700 hover:from-[#007f73] hover:to-teal-800 text-white px-4 py-3 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="relative">
              <FaRobot className="text-lg transition-transform group-hover:rotate-12" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold leading-tight">RentoBot AI</div>
              <div className="text-[10px] text-teal-100 font-medium leading-none mt-0.5">
                Housing Assistant
              </div>
            </div>

            {hasUnread && (
              <span className="absolute -top-1.5 -left-1.5 bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 border border-white shadow-xs">
                New
              </span>
            )}
          </button>
        )}
      </div>

      {/* ── Expandable Chatbot Window ───────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 w-[94vw] sm:w-[410px] h-[550px] max-h-[85vh] bg-white border border-gray-300 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#009587] to-teal-800 text-white px-4 py-3 flex items-center justify-between border-b border-teal-800/40">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center bg-white/15 border border-white/20">
                <FaRobot className="text-base text-white" />
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 border border-teal-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider">RentoBot</h3>
                  <span className="bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 text-[9px] font-bold px-1.5 py-0.2">
                    AI Online
                  </span>
                </div>
                <p className="text-[10px] text-teal-100/90 leading-tight">
                  Rentosphere Smart Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-teal-100">
              <button
                type="button"
                onClick={handleClearChat}
                title="Reset conversation"
                className="p-1.5 hover:text-white hover:bg-white/10 transition"
              >
                <FaRotateRight className="text-xs" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chatbot"
                className="p-1.5 hover:text-white hover:bg-white/10 transition"
              >
                <FaXmark className="text-sm" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-teal-50/60 border-b border-teal-100 px-3 py-1.5 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 shrink-0 flex items-center gap-1">
              <FaWandMagicSparkles className="text-[10px] text-emerald-600" />
              Ask:
            </span>
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="text-[10px] font-medium bg-white hover:bg-teal-50 text-gray-700 border border-gray-200 hover:border-teal-400 px-2 py-0.5 transition shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/40">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[88%] p-3 text-xs shadow-2xs border ${
                      isUser
                        ? "bg-[#009587] text-white border-[#007f73] rounded-tl-lg rounded-tr-none rounded-br-lg rounded-bl-lg"
                        : "bg-white text-gray-800 border-gray-200 rounded-tl-none rounded-tr-lg rounded-br-lg rounded-bl-lg"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      renderFormattedMessage(msg.content)
                    )}

                    {/* Suggested Action Buttons */}
                    {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-wrap gap-1.5">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            type="button"
                            onClick={() => handleActionClick(action.url)}
                            className="inline-flex items-center gap-1.5 bg-teal-50 hover:bg-[#009587] text-[#009587] hover:text-white border border-teal-300 px-2.5 py-1 text-[11px] font-semibold transition"
                          >
                            <FaMagnifyingGlass className="text-[10px]" />
                            <span>{action.label}</span>
                            <FaArrowRight className="text-[9px]" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Follow-up Quick Replies under Bot message */}
                  {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1 max-w-[90%]">
                      {msg.quickReplies.map((qr, qIdx) => (
                        <button
                          key={qIdx}
                          type="button"
                          onClick={() => handleSendMessage(qr)}
                          className="bg-white hover:bg-teal-50 border border-gray-300 hover:border-[#009587] text-gray-700 hover:text-[#009587] text-[10px] font-medium px-2 py-0.5 transition"
                        >
                          💬 {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="bg-white border border-gray-200 p-3 shadow-2xs flex items-center gap-2 text-xs text-gray-500">
                  <FaSpinner className="animate-spin text-[#009587] text-xs" />
                  <span className="font-medium">RentoBot is typing…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-gray-200 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about homes, rent, or policies..."
              disabled={isLoading}
              className="flex-1 border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#009587] focus:bg-white transition disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-[#009587] hover:bg-[#007f73] disabled:opacity-40 text-white p-2.5 text-xs font-semibold flex items-center justify-center transition shrink-0"
              title="Send message"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin text-xs" />
              ) : (
                <FaPaperPlane className="text-xs" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
