"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  Receipt,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  Building,
  FileCheck,
  Eye,
  ShieldAlert,
} from "lucide-react";
import PurchasingNav from "@/components/purchasing/PurchasingNav";
import { usePurchasing } from "@/context/PurchasingContext";
import { formatEGP } from "@/lib/accountingEngine";
import CreateSupplierBillModal from "@/components/purchasing/CreateSupplierBillModal";
import ThreeWayMatchModal from "@/components/purchasing/ThreeWayMatchModal";
import { SupplierInvoice, PurchaseOrder } from "@/types/purchasing";

export default function SupplierInvoicesPage() {
  const { supplierInvoices, purchaseOrders } = usePurchasing();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [matchFilter, setMatchFilter] = useState<string>("ALL");
  const [selectedMatchPO, setSelectedMatchPO] = useState<PurchaseOrder | null>(null);

  const filteredInvoices = supplierInvoices.filter((inv) => {
    const matchesMatch = matchFilter === "ALL" || inv.matchStatus === matchFilter;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.supplierInvoiceRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.poNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMatch && matchesSearch;
  });

  const totalInvoicedAmount = supplierInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalDiscrepancies = supplierInvoices.filter((i) => i.matchStatus !== "MATCHED").length;

  const handleOpen3WayMatch = (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (po) {
      setSelectedMatchPO(po);
    }
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
            <span className="text-slate-900 font-bold">فواتير الموردين والمطابقة الثلاثية</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            فواتير الموردين والمطابقة الثلاثية (Supplier Bills & 3-Way Matching)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            مطابقة فواتير المصانع مع أوامر الشراء والاستلام الفعلي بالمستودع، وتوليد القيود المحاسبية تلقائياً.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ تسجيل فاتورة مورد جديدة</span>
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">إجمالي فواتير التوريد المسجلة</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatEGP(totalInvoicedAmount)}
          </div>
          <span className="text-[10px] text-slate-400">شامل ضريبة القيمة المضافة 14%</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">حالات عدم التطابق (Discrepancies)</span>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {totalDiscrepancies}{" "}
            <span className="text-xs font-normal text-slate-500">فواتير تحتاج مراجعة</span>
          </div>
          <span className="text-[10px] text-amber-700">فروق كميات أو أسعار بين الفاتورة والاستلام</span>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-bold text-slate-300">الربط مع الإدارة المالية</span>
          <div className="text-xs text-rewaq-gold font-bold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>قيود اليومية والمديونية ترحل آلياً</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Dr. مخزون (1040) + Dr. ضريبة مدخلات (1060) | Cr. دائنون موردين (2010)
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم الفاتورة، مرجع المورد، أو أمر الشراء..."
              className="w-72 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          </div>

          <select
            value={matchFilter}
            onChange={(e) => setMatchFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-rewaq-gold"
          >
            <option value="ALL">جميع حالات المطابقة</option>
            <option value="MATCHED">✅ متطابقة تماماً (100% Match)</option>
            <option value="QUANTITY_MISMATCH">⚠️ عجز أو فرق كمية (Qty Mismatch)</option>
            <option value="PRICE_MISMATCH">⚠️ فرق سعر عن التعاقد (Price Mismatch)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-bold">
          عدد الفواتير: <strong className="text-slate-900 font-black">{filteredInvoices.length}</strong>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">رقم الفاتورة الداخلي</th>
                <th className="p-3">رقم فاتورة المورد (Ref)</th>
                <th className="p-3">المورد</th>
                <th className="p-3">أمر الشراء (PO)</th>
                <th className="p-3">تاريخ الفاتورة</th>
                <th className="p-3">تاريخ الاستحقاق</th>
                <th className="p-3">الإجمالي (شامل 14%)</th>
                <th className="p-3 text-center">حالة المطابقة 3-Way</th>
                <th className="p-3 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => {
                const isMatched = inv.matchStatus === "MATCHED";

                return (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-700">
                      {inv.supplierInvoiceRef}
                    </td>
                    <td className="p-3 font-bold text-slate-900">{inv.supplierName}</td>
                    <td className="p-3 font-mono text-slate-700">{inv.poNumber}</td>
                    <td className="p-3 font-mono text-slate-500">{inv.invoiceDate}</td>
                    <td className="p-3 font-mono text-slate-500">{inv.dueDate}</td>
                    <td className="p-3 font-mono font-black text-slate-900">
                      {formatEGP(inv.totalAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpen3WayMatch(inv.poId)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black cursor-pointer transition ${
                          isMatched
                            ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                            : "bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200"
                        }`}
                      >
                        {isMatched
                          ? "✅ متطابقة 100%"
                          : inv.matchStatus === "QUANTITY_MISMATCH"
                          ? "⚠️ عجز كمية (Qty)"
                          : "⚠️ فرق سعر (Price)"}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpen3WayMatch(inv.poId)}
                        className="text-xs text-blue-700 hover:underline font-bold"
                      >
                        عرض المقارنة
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isCreateOpen && (
        <CreateSupplierBillModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      {selectedMatchPO && (
        <ThreeWayMatchModal
          isOpen={!!selectedMatchPO}
          onClose={() => setSelectedMatchPO(null)}
          purchaseOrder={selectedMatchPO}
        />
      )}
    </div>
  );
}
