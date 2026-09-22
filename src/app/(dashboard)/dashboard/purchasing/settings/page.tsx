"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Scale,
  Building,
  Save,
  Clock,
} from "lucide-react";
import PurchasingNav from "@/components/purchasing/PurchasingNav";
import { usePurchasing } from "@/context/PurchasingContext";
import { formatEGP } from "@/lib/accountingEngine";
import { ApprovalRuleConfig } from "@/types/purchasing";

export default function PurchasingSettingsPage() {
  const { settings, updateSettings } = usePurchasing();

  const [approvalRules, setApprovalRules] = useState<ApprovalRuleConfig[]>(settings.approvalRules);
  const [priceTolerance, setPriceTolerance] = useState<number>(settings.priceDiscrepancyTolerancePercent);
  const [safetyDays, setSafetyDays] = useState<number>(settings.safetyStockBufferDays);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRuleLimitChange = (ruleId: string, limit: number) => {
    setApprovalRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, maxApprovalLimit: limit } : r))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      approvalRules,
      priceDiscrepancyTolerancePercent: Number(priceTolerance),
      safetyStockBufferDays: Number(safetyDays),
    });
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PurchasingNav />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>المشتريات</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">إعدادات وسياسات الاعتماد</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            إعدادات صلاحيات الاعتماد وسياسات المطابقة
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ضبط حدود اعتمادات أوامر الشراء حسب المسمى الوظيفي والفرع، ونسب التفاوت المسموحة في المطابقة الثلاثية.
          </p>
        </div>

        {isSuccess && (
          <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>تم حفظ وتطبيق السياسات بنجاح!</span>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Approval Thresholds */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-rewaq-gold" />
            <h2 className="text-sm font-black text-slate-900">
              حدود صلاحيات اعتماد أوامر الشراء (Approval Thresholds Matrix):
            </h2>
          </div>

          <div className="space-y-3">
            {approvalRules.map((rule) => {
              let roleName = "مسؤول مشتريات (Purchase Officer)";
              if (rule.role === "PURCHASING_MANAGER") roleName = "مدير المشتريات (Purchasing Manager)";
              if (rule.role === "GENERAL_MANAGER") roleName = "المدير العام / المالك (General Manager)";

              return (
                <div
                  key={rule.id}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 text-sm">{roleName}</p>
                    <span className="text-[11px] text-slate-500">
                      نطاق التطبيق: {rule.branchName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-600">أقصى حد للاعتماد الفردي:</span>
                    <div className="relative">
                      <input
                        type="number"
                        value={rule.maxApprovalLimit}
                        onChange={(e) => handleRuleLimitChange(rule.id, Number(e.target.value))}
                        className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold font-mono text-slate-900 w-36 focus:outline-none focus:border-rewaq-gold"
                      />
                      <span className="absolute left-2 top-2 text-[10px] text-slate-400 font-bold">
                        ج.م
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Tolerance & Safety Buffer */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Scale className="w-5 h-5 text-rewaq-gold" />
            <h2 className="text-sm font-black text-slate-900">
              سياسات المطابقة الذكية وفترة الأمان (Safety Buffer):
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="block font-bold text-slate-800">
                نسبة التفاوت السعري المسموحة في المطابقة الثلاثية (%):
              </label>
              <input
                type="number"
                step="0.5"
                value={priceTolerance}
                onChange={(e) => setPriceTolerance(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold font-mono focus:outline-none focus:border-rewaq-gold"
              />
              <span className="text-[10px] text-slate-400 block">
                إذا زاد سعر الفاتورة عن أمر الشراء بأكثر من هذه النسبة، يظهر تنبيه مراجعة فوراً.
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="block font-bold text-slate-800">
                أيام الأمان الإضافية لحساب حد إعادة الطلب (Safety Days Buffer):
              </label>
              <input
                type="number"
                value={safetyDays}
                onChange={(e) => setSafetyDays(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold font-mono focus:outline-none focus:border-rewaq-gold"
              />
              <span className="text-[10px] text-slate-400 block">
                تضاف إلى فترة التوريد (Lead Time) لضمان عدم نفاد المخزون أثناء ذروة المواسم.
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-6 py-3 rounded-2xl shadow-md transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ وتطبيق إعدادات المشتريات</span>
          </button>
        </div>
      </form>
    </div>
  );
}
