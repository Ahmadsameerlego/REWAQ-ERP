"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  FileCheck,
  Percent,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  QrCode,
  ExternalLink,
  Edit2,
  Plus,
  RefreshCw,
} from "lucide-react";
import FinanceNav from "@/components/finance/FinanceNav";
import { useFinance } from "@/context/FinanceContext";
import { formatEGP } from "@/lib/accountingEngine";

export default function TaxesPage() {
  const { taxConfigs, etaInvoices, financialSummary, updateTaxConfig } = useFinance();
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState<number>(0.14);

  const taxableSales = 6240000;
  const exemptSales = 0;
  const totalOutputVat = financialSummary.totalVatOutputMonth;
  const totalInputVat = financialSummary.totalVatInputMonth;
  const netPayable = financialSummary.netVatPosition;

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <FinanceNav />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              مصلحة الضرائب المصرية | ETA Compliance
            </span>
            <span className="text-xs text-slate-500 font-medium">| جاهزية تشريعات 2026 وتعديلات القيمة المضافة</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            منظومة الضرائب المصرية، نموذج 10، وقواعد الـ VAT
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            النسب والضرائب ديناميكية بالكامل وقابلة للتعديل من الإعدادات دون الحاجة لتغيير كود النظام.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/finance/invoices"
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-rewaq-gold font-bold text-xs px-4 py-2 rounded-xl shadow-2xs transition cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>عرض سجل الفواتير الإلكترونية</span>
          </Link>
        </div>
      </div>

      {/* Egyptian Taxpayer Profile Info Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold block mb-1">الممول والمسجل الضريبي:</span>
            <p className="font-bold text-slate-900">شركة رِواق لتجارة وصناعة الأثاث (ش.ذ.م.م)</p>
            <p className="text-slate-500 font-mono mt-0.5">مأمورية ضرائب: القاهرة الجديدة - الشركات المساهمة</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold block mb-1">رقم التسجيل الضريبي الموحد:</span>
            <p className="font-mono font-black text-slate-900 text-sm">614-829-103</p>
            <p className="text-slate-500 font-mono mt-0.5">كود النشاط: 3100 (تصنيع وتجارة الأثاث)</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold block mb-1">التوقيع الإلكتروني (E-Seal Token):</span>
            <div className="flex items-center gap-1 text-emerald-700 font-bold mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>مفعل ومعتمد من Egypt Trust</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">صالح حتى: 2027-12-31</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold block mb-1">تكامل POS مع الإيصال الإلكتروني:</span>
            <div className="flex items-center gap-1 text-emerald-700 font-bold mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>أجهزة الفروع متصلة مباشرة</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">إرسال لحظي للإيصالات B2C</p>
          </div>
        </div>
      </div>

      {/* Egyptian VAT Form 10 Return Simulator (نموذج 10 إقرار القيمة المضافة) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                إقرار ضريبة القيمة المضافة الشهري (نموذج 10 ض.ق.م - سبتمبر 2026)
              </h3>
              <p className="text-[11px] text-slate-500">حساب المخرجات والمدخلات وصافي المستحق لمصلحة الضرائب</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            جاهز للإرسال على بوابة المصلحة
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Output VAT (المخرجات - المبيعات) */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
            <h4 className="text-xs font-black text-slate-900 flex items-center justify-between">
              <span>أولاً: المبيعات وضريبة المخرجات (Output VAT)</span>
              <span className="text-rewaq-gold-dark font-mono font-black">{formatEGP(totalOutputVat)}</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200/80">
                <span className="text-slate-600">المبيعات العامة الخاضعة لنسبة 14%:</span>
                <strong className="font-mono">{formatEGP(taxableSales)}</strong>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200/80">
                <span className="text-slate-600">المبيعات المعفاة أو بنسبة 0%:</span>
                <strong className="font-mono">{formatEGP(exemptSales)}</strong>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold">
                <span>إجمالي ضريبة المخرجات المحصلة من العملاء:</span>
                <span className="font-mono font-black">{formatEGP(totalOutputVat)}</span>
              </div>
            </div>
          </div>

          {/* Input VAT (المدخلات - المشتريات والمصروفات) */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
            <h4 className="text-xs font-black text-slate-900 flex items-center justify-between">
              <span>ثانياً: المشتريات والمصروفات القابلة للخصم (Input VAT)</span>
              <span className="text-emerald-700 font-mono font-black">{formatEGP(totalInputVat)}</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200/80">
                <span className="text-slate-600">ضريبة مدخلات مشتريات خامات الأخشاب والأقمشة:</span>
                <strong className="font-mono">{formatEGP(39300)}</strong>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200/80">
                <span className="text-slate-600">ضريبة مدخلات مصروفات التسويق والصيانة:</span>
                <strong className="font-mono">{formatEGP(19100)}</strong>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold">
                <span>إجمالي ضريبة المدخلات المخصومة (حساب 1060):</span>
                <span className="font-mono font-black">{formatEGP(totalInputVat)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net VAT Position Box */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-rewaq-gold font-bold block mb-0.5">
              صافي الضريبة الواجبة السداد لمصلحة الضرائب المصرية (نموذج 10):
            </span>
            <p className="text-[11px] text-slate-300">
              ضريبة المخرجات ({formatEGP(totalOutputVat)}) - ضريبة المدخلات ({formatEGP(totalInputVat)})
            </p>
          </div>

          <div className="text-left">
            <span className="text-2xl font-black font-mono text-rewaq-gold tracking-tight">
              {formatEGP(netPayable)}
            </span>
            <span className="text-[10px] text-slate-400 block">تستحق قبل نهاية أكتوبر 2026</span>
          </div>
        </div>
      </div>

      {/* Configurable Tax Rules & Rates Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              قواعد ونسب الضرائب المعتمدة بالنظام (Tax Configuration)
            </h3>
            <p className="text-[11px] text-slate-500">
              يمكن تحديث النسب في أي وقت إذا صدرت تعديلات تشريعية جديدة من وزارة المالية
            </p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
              <tr>
                <th className="p-3">كود الضريبة</th>
                <th className="p-3">اسم الضريبة والبيان</th>
                <th className="p-3">النسبة المئوية</th>
                <th className="p-3">كود تصنيف ETA</th>
                <th className="p-3">الحساب المحاسبي المرتبط</th>
                <th className="p-3">تاريخ السريان</th>
                <th className="p-3 text-center">تعديل النسبة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {taxConfigs.map((tc) => (
                <tr key={tc.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 font-mono font-bold text-slate-900">{tc.code}</td>
                  <td className="p-3">
                    <span className="font-bold text-slate-900 block">{tc.nameAr}</span>
                    <span className="text-[10px] text-slate-500">{tc.description}</span>
                  </td>
                  <td className="p-3 font-mono font-black text-slate-900 text-sm">
                    {(tc.rate * 100).toFixed(0)}%
                  </td>
                  <td className="p-3 font-mono text-slate-600">{tc.taxType}</td>
                  <td className="p-3 font-mono text-slate-700">{tc.accountCode}</td>
                  <td className="p-3 font-mono text-slate-500">{tc.effectiveFrom}</td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingConfigId(tc.id);
                        setEditRate(tc.rate);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>تحديث النسبة</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Tax Modal */}
      {editingConfigId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl p-5 space-y-4">
            <h3 className="text-sm font-black text-slate-900">تحديث النسبة الضريبية</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">النسبة الجديدة (مثال 0.14 لـ 14%):</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={1}
                  value={editRate}
                  onChange={(e) => setEditRate(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingConfigId(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateTaxConfig(editingConfigId, { rate: editRate });
                    setEditingConfigId(null);
                  }}
                  className="px-5 py-2 font-black bg-slate-900 text-rewaq-gold rounded-xl hover:bg-slate-800"
                >
                  حفظ وتطبيق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
