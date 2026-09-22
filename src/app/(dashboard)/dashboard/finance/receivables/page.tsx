"use client";

import React, { useState } from "react";
import {
  Users2,
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  FileSpreadsheet,
  Receipt,
  Coins,
} from "lucide-react";
import FinanceNav from "@/components/finance/FinanceNav";
import CreateReceiptModal from "@/components/finance/CreateReceiptModal";
import { useFinance } from "@/context/FinanceContext";
import { formatEGP } from "@/lib/accountingEngine";

export default function ReceivablesPage() {
  const { customerAdvances, customerInstallments, receipts, financialSummary } = useFinance();
  const [activeTab, setActiveTab] = useState<"ADVANCES" | "RECEIVABLES" | "AGING">("ADVANCES");
  const [searchQuery, setSearchQuery] = useState("");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [prefillData, setPrefillData] = useState<{ customerName: string; contractId: string; amount: number }>({
    customerName: "",
    contractId: "",
    amount: 0,
  });

  const filteredAdvances = customerAdvances.filter(
    (adv) =>
      adv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adv.advanceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (adv.orderNumber && adv.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Sub-Navigation */}
      <FinanceNav onOpenReceiptModal={() => setShowReceiptModal(true)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
              <Users2 className="w-3 h-3" />
              دفتر حسابات العملاء والعرابين
            </span>
            <span className="text-xs text-slate-500 font-medium">| إدارة الأمانات والمستحقات الآجلة</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            إدارة عرابين التعاقدات ومديونيات العملاء
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            العرابين تعامل محاسبياً كالتزام (حساب 2020) حتى استيفاء التصنيع والتسليم وإصدار الفاتورة الضريبية.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setPrefillData({ customerName: "", contractId: "", amount: 30000 });
              setShowReceiptModal(true);
            }}
            className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل عربون حجز جديد</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">إجمالي العرابين المحتفظ بها (أمانات)</span>
          <div className="text-xl font-black text-blue-700 font-mono">
            {formatEGP(financialSummary.totalCustomerAdvancesHeld)}
          </div>
          <span className="text-[10px] text-slate-400 block">حساب أمانات ومقدمات عملاء (2020)</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">إجمالي مديونيات العملاء (آجل)</span>
          <div className="text-xl font-black text-slate-900 font-mono">
            {formatEGP(financialSummary.totalCustomerReceivables)}
          </div>
          <span className="text-[10px] text-slate-400 block">حساب مدينو عملاء وأقساط (1030)</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">متأخرات تجاوزت الموعد</span>
          <div className="text-xl font-black text-rose-700 font-mono">
            {formatEGP(financialSummary.totalOverdueReceivables)}
          </div>
          <span className="text-[10px] text-rose-600 font-bold">2 أقساط متأخرة</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">عرابين تمت تسويتها هذا الشهر</span>
          <div className="text-xl font-black text-emerald-700 font-mono">
            {formatEGP(60000)}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">مع تسليم صالون إعمار</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("ADVANCES")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "ADVANCES"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              سجل العرابين والدفعات المقدمة (Advances)
            </button>

            <button
              onClick={() => setActiveTab("RECEIVABLES")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "RECEIVABLES"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              كشف حسابات العملاء (Customer Ledger)
            </button>

            <button
              onClick={() => setActiveTab("AGING")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "AGING"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              أعمار الديون (Aging Analysis)
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="بحث باسم العميل أو رقم العقد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-xs text-slate-800 focus:outline-none focus:border-rewaq-gold"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
          </div>
        </div>

        {activeTab === "ADVANCES" && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
                <tr>
                  <th className="p-3">رقم العربون</th>
                  <th className="p-3">اسم العميل</th>
                  <th className="p-3">رقم العقد</th>
                  <th className="p-3">قيمة العربون</th>
                  <th className="p-3">المسوى بالفاتورة</th>
                  <th className="p-3">المتبقي كالتزام</th>
                  <th className="p-3">طريقة الدفع</th>
                  <th className="p-3">الخزينة / البنك</th>
                  <th className="p-3">الحالة المحاسبية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdvances.map((adv) => (
                  <tr key={adv.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold font-mono text-slate-900">{adv.advanceNumber}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{adv.customerName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{adv.customerPhone}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700">{adv.orderNumber || "عام"}</td>
                    <td className="p-3 font-mono font-black text-slate-900">{formatEGP(adv.amount)}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700">{formatEGP(adv.settledAmount)}</td>
                    <td className="p-3 font-mono font-black text-blue-800">{formatEGP(adv.remainingAmount)}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {adv.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 text-[11px]">{adv.treasuryOrBankName}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          adv.status === "SETTLED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {adv.status === "SETTLED" ? "تمت التسوية بالكامل" : "نشط (تحت التنفيذ)"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "RECEIVABLES" && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
            <h4 className="font-black text-slate-900">حساب العميل: د. هاني ممدوح عبد الوهاب (كشف تفصيلي)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-3 rounded-xl border border-slate-200 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 font-sans block">الرصيد الافتتاحي:</span>
                <span className="font-bold text-slate-900">0 ج.م</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-sans block">+ الفواتير الصادرة:</span>
                <span className="font-bold text-slate-900">239,400 ج.م</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-sans block">- المدفوعات والعرابين:</span>
                <span className="font-bold text-emerald-700">-120,000 ج.م</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-sans block">= الرصيد الختامي المستحق:</span>
                <span className="font-black text-blue-800">119,400 ج.م</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5">التاريخ</th>
                    <th className="p-2.5">النوع</th>
                    <th className="p-2.5">المرجع</th>
                    <th className="p-2.5">مدين (+)</th>
                    <th className="p-2.5">دائن (-)</th>
                    <th className="p-2.5">الرصيد التراكمي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-mono">2026-09-10</td>
                    <td className="p-2.5 font-bold text-blue-700">عربون حجز</td>
                    <td className="p-2.5 font-mono">ADV-5012</td>
                    <td className="p-2.5 font-mono">-</td>
                    <td className="p-2.5 font-mono text-emerald-700 font-bold">60,000 ج.م</td>
                    <td className="p-2.5 font-mono font-bold">-60,000 ج.م (لنا أمانة)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono">2026-09-15</td>
                    <td className="p-2.5 font-bold text-emerald-700">سداد قسط 1</td>
                    <td className="p-2.5 font-mono">REC-8830</td>
                    <td className="p-2.5 font-mono">-</td>
                    <td className="p-2.5 font-mono text-emerald-700 font-bold">60,000 ج.م</td>
                    <td className="p-2.5 font-mono font-bold">-120,000 ج.م</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono">2026-09-21</td>
                    <td className="p-2.5 font-bold text-slate-900">فاتورة بيع صالون</td>
                    <td className="p-2.5 font-mono">INV-2026-1044</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900">239,400 ج.م</td>
                    <td className="p-2.5 font-mono">-</td>
                    <td className="p-2.5 font-mono font-black text-blue-800">119,400 ج.م</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "AGING" && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="font-bold text-emerald-950 block">مستحقات جارية (أقل من 30 يوماً)</span>
              <span className="text-lg font-black text-emerald-800 font-mono mt-1 block">402,000 ج.م</span>
              <span className="text-[10px] text-emerald-700">ضمن فترة السماح العادية</span>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <span className="font-bold text-amber-950 block">متأخرات 30 - 60 يوماً</span>
              <span className="text-lg font-black text-amber-900 font-mono mt-1 block">83,000 ج.م</span>
              <span className="text-[10px] text-amber-700">تتطلب تذكير واتساب وهاتف</span>
            </div>

            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
              <span className="font-bold text-rose-950 block">متأخرات 60 - 90 يوماً</span>
              <span className="text-lg font-black text-rose-800 font-mono mt-1 block">0 ج.م</span>
              <span className="text-[10px] text-rose-600">لا يوجد</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block">ديون مشكوك فيها (&gt; 90 يوماً)</span>
              <span className="text-lg font-black text-slate-900 font-mono mt-1 block">0 ج.م</span>
              <span className="text-[10px] text-slate-500">نسبة التحصيل 98.4%</span>
            </div>
          </div>
        )}
      </div>

      <CreateReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        prefillCustomerName={prefillData.customerName}
        prefillContractId={prefillData.contractId}
        prefillAmount={prefillData.amount}
      />
    </div>
  );
}
