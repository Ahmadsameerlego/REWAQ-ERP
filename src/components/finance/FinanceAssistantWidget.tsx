"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  Send,
  X,
  TrendingUp,
  ArrowLeft,
  Coins,
  Receipt,
  FileCheck,
  Building2,
  HelpCircle,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";

interface FinanceAssistantWidgetProps {
  isOpen?: boolean;
  onClose?: () => void;
  isInline?: boolean;
}

export default function FinanceAssistantWidget({
  isOpen = false,
  onClose,
  isInline = false,
}: FinanceAssistantWidgetProps) {
  const { askFinanceAI } = useFinance();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<
    {
      sender: "user" | "assistant";
      text: string;
      metrics?: { label: string; value: string; isGood?: boolean }[];
      relatedAction?: { label: string; href: string };
    }[]
  >([
    {
      sender: "assistant",
      text: "أهلاً بك في المستشار المالي الذكي لـ Rewaq ERP. يمكنك سؤالي باللهجة العادية عن المبيعات، الأرباح، متأخرات الأقساط، الخزائن، الفواتير الإلكترونية أو المصروفات.",
    },
  ]);

  const quickQuestions = [
    "مبيعات فرع طنطا الشهر ده كام؟",
    "مين عليه أقساط متأخرة؟",
    "كام إجمالي العربون المحصل؟",
    "إيه أكبر المصروفات الشهر ده؟",
    "الربح الإجمالي وصافي الربح كام؟",
    "إيه الفواتير الإلكترونية المرفوضة؟",
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || query;
    if (!text.trim()) return;

    // Add user message
    const userMsg = { sender: "user" as const, text };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");

    // Query engine
    setTimeout(() => {
      const response = askFinanceAI(text);
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: response.answer,
          metrics: response.metrics,
          relatedAction: response.relatedAction,
        },
      ]);
    }, 300);
  };

  const content = (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rewaq-gold to-rewaq-gold-light text-slate-950 flex items-center justify-center font-black shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black flex items-center gap-1.5">
              <span>المساعد المالي والمحاسبي الذكي</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-rewaq-gold/20 text-rewaq-gold border border-rewaq-gold/30">
                Rewaq AI
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">إجابات مالية دقيقة من واقع القيود والمبيعات الفعلية</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-3 bg-slate-50 border-b border-slate-200/80 overflow-x-auto">
        <p className="text-[10px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-rewaq-gold" />
          <span>أسئلة سريعة شائعة:</span>
        </p>
        <div className="flex items-center gap-1.5 pb-1">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              className="text-[11px] font-bold bg-white hover:bg-rewaq-gold/10 hover:border-rewaq-gold text-slate-700 hover:text-slate-950 border border-slate-200 px-3 py-1 rounded-xl whitespace-nowrap transition shrink-0 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[420px] bg-slate-50/50">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === "user" ? "items-start" : "items-end"}`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-rewaq-gold text-slate-950 font-bold rounded-tl-xs shadow-xs"
                  : "bg-white text-slate-800 border border-slate-200 rounded-tr-xs shadow-2xs"
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {/* Metric Chips if available */}
              {m.metrics && m.metrics.length > 0 && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  {m.metrics.map((metric, mIdx) => (
                    <div key={mIdx} className="bg-slate-50 p-2 rounded-xl border border-slate-200/70">
                      <span className="text-[10px] text-slate-500 block">{metric.label}</span>
                      <span
                        className={`text-xs font-black font-mono ${
                          metric.isGood === false
                            ? "text-rose-600"
                            : metric.isGood === true
                            ? "text-emerald-700"
                            : "text-slate-900"
                        }`}
                      >
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Related Action Link */}
              {m.relatedAction && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                  <Link
                    href={m.relatedAction.href}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-[11px] font-black text-slate-900 hover:text-rewaq-gold-dark transition"
                  >
                    <span>{m.relatedAction.label}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="اسأل عن أي رقم أو تحصيل أو مصروف بالعامية... (مثال: أرباح الشهر ده كام؟)"
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
          />
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-rewaq-gold font-black p-2.5 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );

  if (isInline) {
    return <div className="border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">{content}</div>;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] shadow-2xl rounded-2xl border border-slate-700 overflow-hidden">
        {content}
      </div>
    </div>
  );
}
