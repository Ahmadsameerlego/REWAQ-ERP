"use client";

import React, { useState } from "react";
import {
  Settings,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  Lock,
  Percent,
  Sliders,
  Wallet,
} from "lucide-react";
import FinanceNav from "@/components/finance/FinanceNav";
import { useFinance } from "@/context/FinanceContext";
import { FinanceRole } from "@/types/finance";

export default function FinanceSettingsPage() {
  const {
    accountMappings,
    taxConfigs,
    costCenters,
    periods,
    activeRole,
    setActiveRole,
    updateAccountMappings,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<"MAPPINGS" | "PERIODS" | "COST_CENTERS" | "ROLES">("MAPPINGS");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const rolesMatrix: {
    feature: string;
    cashier: boolean;
    accountant: boolean;
    manager: boolean;
    admin: boolean;
  }[] = [
    { feature: "إصدار سندات قبض وتحصيل نقدي", cashier: true, accountant: true, manager: true, admin: true },
    { feature: "تسجيل عهد ومصروفات يومية", cashier: true, accountant: true, manager: true, admin: true },
    { feature: "إنشاء وترحيل قيود اليومية اليدوية", cashier: false, accountant: true, manager: true, admin: true },
    { feature: "إرسال وتوقيع الفواتير الضريبية ETA", cashier: false, accountant: true, manager: true, admin: true },
    { feature: "تسوية وعكس القيود المحاسبية (Reversal)", cashier: false, accountant: false, manager: true, admin: true },
    { feature: "إقفال الفترات المحاسبية الشهرية", cashier: false, accountant: false, manager: true, admin: true },
    { feature: "تعديل شجرة الحسابات والربط الآلي", cashier: false, accountant: false, manager: false, admin: true },
  ];

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <FinanceNav />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
              <Settings className="w-3 h-3" />
              إعدادات المحرك المالي والمحاسبي
            </span>
            <span className="text-xs text-slate-500 font-medium">| Account Mapping & Rules</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            إعدادات التوجيه المحاسبي والربط الآلي والصلاحيات
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            تحديد الحسابات الافتراضية للمبيعات والمخزون، طرق الدفع، مصفوفة صلاحيات الفريق، وإدارة الفترات.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl flex items-center gap-1 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              تم حفظ الإعدادات بنجاح
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-rewaq-gold font-bold text-xs px-4 py-2 rounded-xl shadow-2xs transition cursor-pointer"
          >
            <span>حفظ وتطبيق التغييرات</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "MAPPINGS", name: "الربط المحاسبي التلقائي (Account Mapping)" },
          { id: "PERIODS", name: "الفترات المالية والإقفال الشهري" },
          { id: "COST_CENTERS", name: "مراكز التكلفة والموازنات" },
          { id: "ROLES", name: "مصفوفة الصلاحيات والأمان" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
        {activeTab === "MAPPINGS" && (
          <div className="space-y-6 max-w-4xl text-xs">
            {/* Product Category Mappings */}
            <div className="space-y-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-rewaq-gold" />
                <span>ربط فئات المنتجات بالحسابات المالية (Sales, COGS, Inventory):</span>
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-3">فئة الأثاث</th>
                      <th className="p-3">حساب الإيراد</th>
                      <th className="p-3">حساب تكلفة البضاعة (COGS)</th>
                      <th className="p-3">حساب المخزون (Asset)</th>
                      <th className="p-3">حساب القيمة المضافة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {accountMappings.productCategories.map((pc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-sans font-bold text-slate-900">{pc.category}</td>
                        <td className="p-3">{pc.salesAccount} - إيرادات مبيعات</td>
                        <td className="p-3">{pc.cogsAccount} - تكلفة بضاعة مباعة</td>
                        <td className="p-3">{pc.inventoryAccount} - مخزون أثاث</td>
                        <td className="p-3 font-bold text-emerald-800">{pc.vatAccount} - مخرجات 14%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Methods Mapping */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>توجيه طرق الدفع إلى الخزائن والحسابات البنكية:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {accountMappings.paymentMethods.map((pm, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{pm.method}</span>
                      <span className="text-[10px] text-slate-500 font-sans">توجيه التحصيل آلياً إلى:</span>
                    </div>
                    <div className="text-left font-mono">
                      <span className="font-bold text-slate-900 block">{pm.targetAccountCode}</span>
                      <span className="text-[10px] text-slate-600 font-sans">{pm.targetName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "PERIODS" && (
          <div className="space-y-4 max-w-4xl text-xs">
            <h3 className="font-black text-slate-900 text-sm">سجل الفترات المحاسبية وحالة الإقفال:</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-right">
                <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3">الفترة المالية</th>
                    <th className="p-3">تاريخ البداية</th>
                    <th className="p-3">تاريخ النهاية</th>
                    <th className="p-3">حالة الفترة</th>
                    <th className="p-3">تاريخ وقائم بالإقفال</th>
                    <th className="p-3">القيود المجمدة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {periods.map((p) => (
                    <tr key={p.id}>
                      <td className="p-3 font-bold text-slate-900">{p.nameAr}</td>
                      <td className="p-3 font-mono">{p.startDate}</td>
                      <td className="p-3 font-mono">{p.endDate}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === "CLOSED"
                              ? "bg-slate-200 text-slate-700"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {p.status === "CLOSED" ? "مقفل ومجمد 🔒" : "مفتوح للمعاملات"}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-600">
                        {p.closedAt ? `${p.closedAt} (${p.closedBy})` : "الفترة جارية"}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {p.lockedEntriesCount} قيود
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "COST_CENTERS" && (
          <div className="space-y-4 max-w-4xl text-xs">
            <h3 className="font-black text-slate-900 text-sm">مراكز التكلفة والموازنات التقديرية:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {costCenters.map((cc) => (
                <div key={cc.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{cc.nameAr}</span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{cc.code}</span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span>المسؤول:</span>
                      <strong className="text-slate-900">{cc.manager}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>الموازنة المخصصة:</span>
                      <strong className="font-mono">{cc.budgetAllocated.toLocaleString()} ج.م</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>المنفق الفعلي:</span>
                      <strong className="font-mono text-rose-700">{cc.budgetSpent.toLocaleString()} ج.م</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "ROLES" && (
          <div className="space-y-4 max-w-4xl text-xs">
            <h3 className="font-black text-slate-900 text-sm">مصفوفة الصلاحيات المالية (Role-Based Access Control):</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-right">
                <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3">الصلاحية / الوظيفة المالية</th>
                    <th className="p-3 text-center">كاشير الصالة</th>
                    <th className="p-3 text-center">المحاسب</th>
                    <th className="p-3 text-center">المدير المالي</th>
                    <th className="p-3 text-center">الإدارة (Admin)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rolesMatrix.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-900">{r.feature}</td>
                      <td className="p-3 text-center">{r.cashier ? "✓" : "—"}</td>
                      <td className="p-3 text-center font-bold text-emerald-700">{r.accountant ? "✓" : "—"}</td>
                      <td className="p-3 text-center font-bold text-emerald-700">{r.manager ? "✓" : "—"}</td>
                      <td className="p-3 text-center font-bold text-emerald-700">{r.admin ? "✓" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
