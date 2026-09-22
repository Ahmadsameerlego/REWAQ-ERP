"use client";

import React from "react";
import FinanceNav from "@/components/finance/FinanceNav";
import FinanceAssistantWidget from "@/components/finance/FinanceAssistantWidget";
import { Bot, Sparkles, HelpCircle } from "lucide-react";

export default function FinanceAssistantPage() {
  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <FinanceNav />

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rewaq-gold/15 text-rewaq-gold-dark border border-rewaq-gold/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            المستشار المالي الذكي (AI Financial Advisor)
          </span>
          <span className="text-xs text-slate-500 font-medium">| محرك استعلام وتحليل البيانات اللحظي</span>
        </div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
          المساعد المالي والمحاسبي الذكي لـ Rewaq ERP
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          اسأل باللغة الطبيعية أو العامية المصرية عن أي مؤشر مالي، أرباح الفروع، متأخرات العملاء، أو الفواتير الضريبية.
        </p>
      </div>

      {/* Embedded Full Assistant */}
      <FinanceAssistantWidget isInline={true} />
    </div>
  );
}
