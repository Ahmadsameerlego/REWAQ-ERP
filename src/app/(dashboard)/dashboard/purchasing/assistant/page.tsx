"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  Send,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Clock,
  Building,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import PurchasingNav from "@/components/purchasing/PurchasingNav";
import { usePurchasing } from "@/context/PurchasingContext";

export default function PurchasingAssistantPage() {
  const { askPurchasingAI } = usePurchasing();

  const [messages, setMessages] = useState<Array<{
    sender: "user" | "ai";
    text: string;
    metrics?: { label: string; value: string; isGood?: boolean }[];
    relatedAction?: { label: string; href: string };
  }>>([
    {
      sender: "ai",
      text: "مرحباً بك! أنا مساعد المشتريات والتوريدات الذكي في نظام رِواق. أستطيع إجابتك فوراً عن نواقص صالة العرض، مقارنة أسعار المصانع وموردي دمياط، حالة طلبيات الشراء المتأخرة، وإجمالي المديونية للموردين. كيف أستطيع مساعدتك الآن؟",
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");

  const sampleQuestions = [
    "إيه الأصناف اللي محتاجة شراء عاجل؟",
    "إيه أوامر الشراء المتأخرة عن موعد التوريد؟",
    "مين أرخص مورد لصوفا فيرونا؟",
    "إيه المنتجات اللي سعر شرائها زاد مؤخراً؟",
    "كام إجمالي مشترياتنا ومديونية الموردين هذا الشهر؟",
    "إيه الطلبات اللي لسه مستلمناهاش؟",
  ];

  const handleSendQuery = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg = { sender: "user" as const, text: queryText };
    const response = askPurchasingAI(queryText);

    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        sender: "ai",
        text: response.answer,
        metrics: response.metrics,
        relatedAction: response.relatedAction,
      },
    ]);

    setInputQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery(inputQuery);
    }
  };

  return (
    <div className="space-y-6">
      <PurchasingNav />

      {/* Main Assistant Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[700px]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rewaq-gold/20 border border-rewaq-gold/40 flex items-center justify-center text-rewaq-gold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black flex items-center gap-2">
                <span>المساعد الذكي للمشتريات والتوريدات (Procurement AI)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  متصل بالبيانات الحية
                </span>
              </h1>
              <p className="text-[11px] text-slate-300">
                إجابات فورية بالعامية المصرية استناداً لأحدث حركات المخزون والموردين والفواتير
              </p>
            </div>
          </div>
        </div>

        {/* Chat History Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => {
            const isAI = msg.sender === "ai";

            return (
              <div
                key={idx}
                className={`flex gap-3 max-w-2xl ${
                  isAI ? "mr-auto flex-row" : "ml-auto flex-row-reverse"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                    isAI
                      ? "bg-slate-900 text-rewaq-gold border border-slate-800"
                      : "bg-rewaq-gold text-slate-950"
                  }`}
                >
                  {isAI ? <Sparkles className="w-4 h-4" /> : "أنا"}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed space-y-3 ${
                    isAI
                      ? "bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tr-none shadow-2xs"
                      : "bg-slate-900 text-white rounded-tl-none"
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Contextual Metric Cards */}
                  {msg.metrics && msg.metrics.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                      {msg.metrics.map((m, i) => (
                        <div
                          key={i}
                          className="bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-0.5"
                        >
                          <span className="text-[10px] text-slate-500 block">{m.label}</span>
                          <strong className="text-xs font-black text-slate-900 font-mono">
                            {m.value}
                          </strong>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Related Action Button */}
                  {msg.relatedAction && (
                    <div className="pt-2">
                      <Link
                        href={msg.relatedAction.href}
                        className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition"
                      >
                        <span>{msg.relatedAction.label}</span>
                        <ArrowRight className="w-3 h-3 text-rewaq-gold" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-rewaq-gold" />
            أسئلة شائعة:
          </span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendQuery(q)}
              className="text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 px-3 py-1 rounded-full border border-slate-200 shrink-0 transition cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Bottom Input Field */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب سؤالك هنا عن المشتريات، الموردين، مواعيد التوريد، أو الأسعار... (اضغط Enter للإرسال)"
              className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
            />
            <button
              type="button"
              onClick={() => handleSendQuery(inputQuery)}
              disabled={!inputQuery.trim()}
              className={`p-3 rounded-2xl transition cursor-pointer flex items-center justify-center ${
                inputQuery.trim()
                  ? "bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 shadow-md font-bold"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
