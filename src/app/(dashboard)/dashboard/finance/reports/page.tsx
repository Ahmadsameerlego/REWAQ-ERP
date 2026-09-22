"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Building2,
  TrendingUp,
  PieChart,
  BarChart3,
  Layers,
  Scale,
  CheckCircle2,
} from "lucide-react";
import FinanceNav from "@/components/finance/FinanceNav";
import { useFinance } from "@/context/FinanceContext";
import { formatEGP } from "@/lib/accountingEngine";

export default function ReportsPage() {
  const { accounts, treasuries, bankAccounts, financialSummary, activePeriod } = useFinance();
  const [activeReport, setActiveReport] = useState<"PL" | "BS" | "TB" | "BRANCH_PROFIT" | "CASH_FLOW">("PL");
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");

  const reportsList = [
    { id: "PL", name: "قائمة الدخل والأرباح (P&L)", icon: TrendingUp },
    { id: "BS", name: "الميزانية والمركز المالي (Balance Sheet)", icon: Scale },
    { id: "TB", name: "ميزان المراجعة (Trial Balance)", icon: Layers },
    { id: "BRANCH_PROFIT", name: "ربحية ومبيعات الفروع (Branch P&L)", icon: Building2 },
    { id: "CASH_FLOW", name: "التدفقات النقدية (Cash Flow)", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <FinanceNav />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <FileSpreadsheet className="w-3 h-3" />
              التقارير والقوائم المالية الختامية
            </span>
            <span className="text-xs text-slate-500 font-medium">| معايير المحاسبة المصرية (EAS)</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            القوائم المالية والتحليلات الختامية
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            قائمة الدخل (P&L)، الميزانية العمومية، ميزان المراجعة، وربحية كل فرع وصالة عرض.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-rewaq-gold font-bold text-xs px-4 py-2 rounded-xl shadow-2xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة القائمة المالية</span>
          </button>
        </div>
      </div>

      {/* Reports Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {reportsList.map((rep) => {
          const IconComponent = rep.icon;
          const isActive = activeReport === rep.id;
          return (
            <button
              key={rep.id}
              onClick={() => setActiveReport(rep.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? "text-rewaq-gold" : "text-slate-400"}`} />
              <span>{rep.name}</span>
            </button>
          );
        })}
      </div>

      {/* Report Container */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
        {/* Report Top Meta Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">شركة رِواق لتجارة وصناعة الأثاث</span>
            <h2 className="text-lg font-black text-slate-900">
              {activeReport === "PL"
                ? "قائمة الأرباح والخسائر (Profit & Loss Statement)"
                : activeReport === "BS"
                ? "قائمة المركز المالي والميزانية العمومية (Balance Sheet)"
                : activeReport === "TB"
                ? "ميزان المراجعة بالأرصدة (Trial Balance)"
                : activeReport === "BRANCH_PROFIT"
                ? "تحليل مبيعات وهوامش ربحية الفروع"
                : "قائمة التدفقات النقدية (Cash Flow)"}
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              عن الفترة المنتهية في: 30 سبتمبر 2026 (العملة: الجنيه المصري EGP)
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">تصفية حسب الفرع:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800"
            >
              <option value="ALL">جميع الفروع مجمعة (Consolidated)</option>
              <option value="cairo">فرع التجمع الخامس</option>
              <option value="october">فرع 6 أكتوبر</option>
              <option value="tanta">فرع طنطا</option>
            </select>
          </div>
        </div>

        {/* 1. PROFIT & LOSS STATEMENT */}
        {activeReport === "PL" && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <tbody className="divide-y divide-slate-100">
                  {/* Revenue */}
                  <tr className="bg-slate-100 font-black text-slate-900">
                    <td className="p-3">الإيرادات والمبيعات (Revenue)</td>
                    <td className="p-3 text-left font-mono font-black text-sm">
                      {formatEGP(financialSummary.totalNetSalesMonth)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pr-8 text-slate-700">إيرادات مبيعات معارض الأثاث (حساب 4010)</td>
                    <td className="p-2.5 text-left font-mono">{formatEGP(6240000)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pr-8 text-slate-700">إيرادات خدمات الشحن والتركيب (حساب 4020)</td>
                    <td className="p-2.5 text-left font-mono">{formatEGP(185000)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pr-8 text-rose-700">خصومات مبيعات ممنوحة (حساب 4040)</td>
                    <td className="p-2.5 text-left font-mono text-rose-700">({formatEGP(142000)})</td>
                  </tr>

                  {/* COGS */}
                  <tr className="bg-slate-100 font-black text-slate-900">
                    <td className="p-3">تكلفة البضاعة المباعة (Cost of Goods Sold - COGS)</td>
                    <td className="p-3 text-left font-mono font-black text-sm text-rose-700">
                      ({formatEGP(3760000)})
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pr-8 text-slate-700">تكلفة تصنيع وخامات الأثاث المباع (حساب 5010)</td>
                    <td className="p-2.5 text-left font-mono">{formatEGP(3650000)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pr-8 text-slate-700">تكاليف الشحن والتشوين المباشرة (حساب 5020)</td>
                    <td className="p-2.5 text-left font-mono">{formatEGP(110000)}</td>
                  </tr>

                  {/* Gross Profit */}
                  <tr className="bg-emerald-50 text-emerald-950 font-black text-sm border-t-2 border-b-2 border-emerald-300">
                    <td className="p-3.5">
                      مجمل الربح (Gross Profit)
                      <span className="mr-2 text-xs font-normal text-emerald-700 font-mono">
                        (الهامش: {financialSummary.grossMarginPercent.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="p-3.5 text-left font-mono font-black text-emerald-800">
                      {formatEGP(financialSummary.grossProfit)}
                    </td>
                  </tr>

                  {/* Operating Expenses */}
                  <tr className="bg-slate-100 font-black text-slate-900">
                    <td className="p-3">المصروفات التشغيلية (Operating Expenses)</td>
                    <td className="p-3 text-left font-mono font-black text-sm text-rose-700">
                      ({formatEGP(financialSummary.totalExpensesMonth)})
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pr-8 text-slate-700">إيجارات المعارض والمستودعات (حساب 6010)</td>
                    <td className="p-2.5 text-left font-mono">{formatEGP(480000)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pr-8 text-slate-700">رواتب وعمولات فريق المبيعات (حساب 6020)</td>
                    <td className="p-2.5 text-left font-mono">{formatEGP(540000)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pr-8 text-slate-700">تسويق وإعلانات ميتا وجوجل (حساب 6040)</td>
                    <td className="p-2.5 text-left font-mono">{formatEGP(210000)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pr-8 text-slate-700">كهرباء ومرافق وضيافة الصالة (حساب 6030)</td>
                    <td className="p-2.5 text-left font-mono">{formatEGP(65000)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pr-8 text-slate-700">صيانة أسطول الشحن وتجهيزات العرض (حساب 6050)</td>
                    <td className="p-2.5 text-left font-mono">{formatEGP(48000)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pr-8 text-slate-700">مصاريف إدارية وبنكية متنوعة (حساب 6060)</td>
                    <td className="p-2.5 text-left font-mono">{formatEGP(32000)}</td>
                  </tr>

                  {/* Net Operating Profit */}
                  <tr className="bg-slate-900 text-white font-black text-sm border-t-2 border-slate-900">
                    <td className="p-4">
                      صافي الأرباح التشغيلية (Net Operating Profit)
                      <span className="mr-2 text-xs font-normal text-rewaq-gold font-mono">
                        (صافي الهامش: {financialSummary.netMarginPercent.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="p-4 text-left font-mono font-black text-base text-rewaq-gold">
                      {formatEGP(financialSummary.netProfit)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. BALANCE SHEET */}
        {activeReport === "BS" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto text-xs">
            {/* Assets */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
              <div className="p-3.5 bg-slate-900 text-white font-black flex justify-between">
                <span>الأصول (Assets)</span>
                <span className="font-mono text-rewaq-gold">
                  {formatEGP(
                    financialSummary.totalLiquidCash +
                      financialSummary.totalCustomerReceivables +
                      3420000 +
                      1200000 +
                      financialSummary.totalVatInputMonth
                  )}
                </span>
              </div>

              <div className="p-3 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">الأصول المتداولة:</span>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>السيولة النقدية في الخزائن والبنوك</span>
                  <span className="font-mono font-bold">{formatEGP(financialSummary.totalLiquidCash)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>مدينون وحسابات عملاء وأقساط</span>
                  <span className="font-mono font-bold">{formatEGP(financialSummary.totalCustomerReceivables)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>مخزون المعارض والأثاث الجاهز والخامات</span>
                  <span className="font-mono font-bold">{formatEGP(3420000)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>ضريبة القيمة المضافة القابلة للخصم (مدخلات)</span>
                  <span className="font-mono font-bold">{formatEGP(financialSummary.totalVatInputMonth)}</span>
                </div>

                <span className="text-[10px] font-bold text-slate-400 uppercase block pt-2">الأصول غير المتداولة:</span>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>أصول ثابتة وتجهيزات وديكور المعارض</span>
                  <span className="font-mono font-bold">{formatEGP(1200000)}</span>
                </div>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
              <div className="p-3.5 bg-slate-900 text-white font-black flex justify-between">
                <span>الخصوم وحقوق الملكية (Liabilities & Equity)</span>
                <span className="font-mono text-rewaq-gold">
                  {formatEGP(
                    financialSummary.totalLiquidCash +
                      financialSummary.totalCustomerReceivables +
                      3420000 +
                      1200000 +
                      financialSummary.totalVatInputMonth
                  )}
                </span>
              </div>

              <div className="p-3 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">الالتزامات المتداولة:</span>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>أمانات ومقدمات عملاء (عرابين تعاقدات)</span>
                  <span className="font-mono font-bold">{formatEGP(financialSummary.totalCustomerAdvancesHeld)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>دائنون وموردو الأخشاب والأقمشة</span>
                  <span className="font-mono font-bold">{formatEGP(320000)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>ضريبة القيمة المضافة المستحقة (مخرجات)</span>
                  <span className="font-mono font-bold">{formatEGP(financialSummary.totalVatOutputMonth)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>مصروفات مستحقة ومخصصات</span>
                  <span className="font-mono font-bold">{formatEGP(59200)}</span>
                </div>

                <span className="text-[10px] font-bold text-slate-400 uppercase block pt-2">حقوق الملكية (Equity):</span>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>رأس المال المدفوع</span>
                  <span className="font-mono font-bold">{formatEGP(5000000)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>أرباح مرحلة وصافي أرباح الفترة</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {formatEGP(1521500 + financialSummary.netProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. TRIAL BALANCE */}
        {activeReport === "TB" && (
          <div className="overflow-x-auto max-w-4xl mx-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-right text-xs font-mono">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-sans font-bold">
                <tr>
                  <th className="p-3 font-mono">كود الحساب</th>
                  <th className="p-3">اسم الحساب</th>
                  <th className="p-3">رصيد مدين (Debit)</th>
                  <th className="p-3">رصيد دائن (Credit)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {accounts.map((acc) => (
                  <tr key={acc.code} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{acc.code}</td>
                    <td className="p-2.5 font-sans font-medium text-slate-800">{acc.nameAr}</td>
                    <td className="p-2.5 font-bold text-slate-900">
                      {acc.isDebitNormal && acc.currentBalance > 0 ? formatEGP(acc.currentBalance) : "-"}
                    </td>
                    <td className="p-2.5 font-bold text-slate-900">
                      {!acc.isDebitNormal && acc.currentBalance > 0 ? formatEGP(acc.currentBalance) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. BRANCH PROFITABILITY */}
        {activeReport === "BRANCH_PROFIT" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-sm">فرع التجمع الخامس (الرئيسي)</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                  أعلى مبيعات
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">المبيعات:</span>
                  <strong className="font-mono font-black">{formatEGP(3450000)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">تكلفة البضاعة (COGS):</span>
                  <span className="font-mono">{formatEGP(2050000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">المصروفات التشغيلية:</span>
                  <span className="font-mono">{formatEGP(620000)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold text-emerald-800 text-sm">
                  <span>صافي الربح:</span>
                  <span className="font-mono font-black">{formatEGP(780000)} (22.6%)</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-sm">فرع 6 أكتوبر (المول)</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                  أعلى هامش
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">المبيعات:</span>
                  <strong className="font-mono font-black">{formatEGP(1710000)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">تكلفة البضاعة (COGS):</span>
                  <span className="font-mono">{formatEGP(980000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">المصروفات التشغيلية:</span>
                  <span className="font-mono">{formatEGP(480000)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold text-emerald-800 text-sm">
                  <span>صافي الربح:</span>
                  <span className="font-mono font-black">{formatEGP(250000)} (14.6%)</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-sm">فرع طنطا (الدلتا)</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                  خصومات أعلى
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">المبيعات:</span>
                  <strong className="font-mono font-black">{formatEGP(1120000)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">تكلفة البضاعة (COGS):</span>
                  <span className="font-mono">{formatEGP(730000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">المصروفات التشغيلية:</span>
                  <span className="font-mono">{formatEGP(275000)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold text-emerald-800 text-sm">
                  <span>صافي الربح:</span>
                  <span className="font-mono font-black">{formatEGP(115000)} (10.2%)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. CASH FLOW STATEMENT */}
        {activeReport === "CASH_FLOW" && (
          <div className="max-w-4xl mx-auto space-y-4 text-xs">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <h4 className="font-black text-slate-900 text-xs">1. التدفقات النقدية من الأنشطة التشغيلية:</h4>
              <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200 font-mono">
                <div className="flex justify-between">
                  <span className="font-sans text-slate-700">النقدية المحصلة من مبيعات وعرابين العملاء:</span>
                  <strong className="text-emerald-700">+{formatEGP(3850000)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-slate-700">النقدية المدفوعة للموردين ومصانع الأخشاب:</span>
                  <strong className="text-rose-700">-{formatEGP(1850000)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-slate-700">النقدية المدفوعة للمصروفات التشغيلية والرواتب:</span>
                  <strong className="text-rose-700">-{formatEGP(1375000)}</strong>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold font-sans text-emerald-900">
                  <span>صافي التدفق النقدي التشغيلي:</span>
                  <strong className="font-mono text-sm">+{formatEGP(625000)}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
