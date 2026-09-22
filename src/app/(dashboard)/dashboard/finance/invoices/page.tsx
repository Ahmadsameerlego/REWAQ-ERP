"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileCheck,
  Search,
  Plus,
  QrCode,
  Building2,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Eye,
  FileSpreadsheet,
} from "lucide-react";
import FinanceNav from "@/components/finance/FinanceNav";
import EtaSubmissionModal from "@/components/finance/EtaSubmissionModal";
import CreateReceiptModal from "@/components/finance/CreateReceiptModal";
import { useFinance } from "@/context/FinanceContext";
import { EtaInvoiceRecord } from "@/types/finance";
import { formatEGP } from "@/lib/accountingEngine";

export default function InvoicesPage() {
  const { etaInvoices, financialSummary } = useFinance();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState<EtaInvoiceRecord | null>(null);
  const [showEtaModal, setShowEtaModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const filteredInvoices = etaInvoices.filter((inv) => {
    const matchesSearch =
      inv.internalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.uuid && inv.uuid.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" || inv.etaStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const validCount = etaInvoices.filter((i) => i.etaStatus === "VALID").length;
  const rejectedCount = etaInvoices.filter((i) => i.etaStatus === "REJECTED").length;

  return (
    <div className="space-y-6">
      {/* Sub-Navigation */}
      <FinanceNav onOpenReceiptModal={() => setShowReceiptModal(true)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              منظومة الفاتورة والإيصال الإلكتروني المصرية
            </span>
            <span className="text-xs text-slate-500 font-medium">| ETA Egyptian Tax Authority</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            سجل فواتير المبيعات والإقرارات الضريبية
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            تكويد السلع (EGS/GS1)، احتساب ضريبة القيمة المضافة 14%، والتوقيع والإرسال اللحظي للمنظومة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/finance/taxes"
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-rewaq-gold font-bold text-xs px-4 py-2 rounded-xl shadow-2xs transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>إعدادات التكويد والربط الضريبي</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">إجمالي الفواتير الصادرة</span>
          <div className="text-xl font-black text-slate-900 font-mono">
            {formatEGP(etaInvoices.reduce((sum, i) => sum + i.totalAmount, 0))}
          </div>
          <span className="text-[10px] text-slate-400 block">{etaInvoices.length} فواتير مسجلة</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">ضريبة القيمة المضافة المحصلة (14%)</span>
          <div className="text-xl font-black text-emerald-700 font-mono">
            {formatEGP(financialSummary.totalVatOutputMonth)}
          </div>
          <span className="text-[10px] text-emerald-600 block">إقرار شهر سبتمبر 2026</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">فواتير معتمدة وموقعة (VALID)</span>
          <div className="text-xl font-black text-emerald-800 font-mono">
            {validCount} فواتير
          </div>
          <span className="text-[10px] text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            مطابقة للشروط ومزودة بـ UUID
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">فواتير مرفوضة تتطلب تصحيحاً</span>
          <div className="text-xl font-black text-rose-700 font-mono">
            {rejectedCount} فاتورة
          </div>
          <span className="text-[10px] text-rose-600 font-bold">نقص كود الصنف EGS</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="ابحث برقم الفاتورة، اسم العميل، أو الـ UUID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs text-slate-800 focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["ALL", "VALID", "REJECTED", "SUBMITTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st === "ALL"
                ? "الكل"
                : st === "VALID"
                ? "معتمدة (VALID)"
                : st === "REJECTED"
                ? "مرفوضة (REJECTED)"
                : "قيد الإرسال"}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
              <tr>
                <th className="p-3.5">رقم الفاتورة</th>
                <th className="p-3.5">العميل والمستلم</th>
                <th className="p-3.5">نوع المستند</th>
                <th className="p-3.5">الصافي</th>
                <th className="p-3.5">ضريبة 14%</th>
                <th className="p-3.5">الإجمالي</th>
                <th className="p-3.5">حالة الضرائب ETA</th>
                <th className="p-3.5">الرقم التعريفي الفريد UUID</th>
                <th className="p-3.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 font-bold font-mono text-slate-900">
                    {inv.internalId}
                    <span className="block text-[10px] font-normal text-slate-400">
                      عقد: {inv.sourceReference}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <span className="font-bold text-slate-900 block">{inv.receiverName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {inv.receiverType === "B" ? "شركة | ت: " : "مستهلك فردي | ق: "}
                      {inv.receiverTaxId || "بدون"}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {inv.documentTypeName}
                    </span>
                  </td>

                  <td className="p-3.5 font-mono font-bold text-slate-700">
                    {formatEGP(inv.netAmount)}
                  </td>

                  <td className="p-3.5 font-mono font-black text-emerald-700">
                    {formatEGP(inv.taxAmount)}
                  </td>

                  <td className="p-3.5 font-mono font-black text-slate-900">
                    {formatEGP(inv.totalAmount)}
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        inv.etaStatus === "VALID"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : inv.etaStatus === "REJECTED"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {inv.etaStatus === "VALID" ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                      )}
                      <span>
                        {inv.etaStatus === "VALID"
                          ? "معتمدة VALID"
                          : inv.etaStatus === "REJECTED"
                          ? "مرفوضة REJECTED"
                          : "قيد الإرسال"}
                      </span>
                    </span>
                  </td>

                  <td className="p-3.5 font-mono text-[11px] text-slate-600">
                    {inv.uuid ? (
                      <span title={inv.uuid}>{inv.uuid.substring(0, 18)}...</span>
                    ) : (
                      <span className="text-slate-400">قيد التوليد</span>
                    )}
                  </td>

                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setShowEtaModal(true);
                      }}
                      className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-rewaq-gold" />
                      <span>فحص وتوقيع ETA</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <EtaSubmissionModal
        isOpen={showEtaModal}
        onClose={() => {
          setShowEtaModal(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
      />

      <CreateReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
      />
    </div>
  );
}
