"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building,
  Calendar,
  DollarSign,
  Package,
  FileCheck,
} from "lucide-react";
import PurchasingNav from "@/components/purchasing/PurchasingNav";
import { usePurchasing } from "@/context/PurchasingContext";
import { formatEGP } from "@/lib/accountingEngine";
import CreateReturnModal from "@/components/purchasing/CreateReturnModal";

export default function PurchaseReturnsPage() {
  const { purchaseReturns } = usePurchasing();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReturns = purchaseReturns.filter(
    (ret) =>
      ret.returnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalRefundAmount = purchaseReturns.reduce((sum, r) => sum + r.totalRefundAmount, 0);
  const totalReturnedQty = purchaseReturns.reduce((sum, r) => sum + r.totalQuantity, 0);

  return (
    <div className="space-y-6">
      <PurchasingNav />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>المشتريات</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">مرتجعات الموردين (Debit Notes)</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            سجل مرتجعات الموردين والإشعارات المدينة (Purchase Returns)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            إرجاع البضائع التالفة أو المخالفة للمواصفات، وتخفيض المخزون والمديونية تلقائياً بموجب إشعار مدين (Debit Note).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>+ إصدار إذن مرتجع جديد</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">إجمالي قيمة المرتجعات المخصومة</span>
          <div className="text-2xl font-black text-rose-700 font-mono">
            {formatEGP(totalRefundAmount)}
          </div>
          <span className="text-[10px] text-slate-400">تم خصمها من رصيد دائنون الموردين</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">إجمالي القطع المرتجعة</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalReturnedQty}{" "}
            <span className="text-xs font-normal text-slate-500">وحدة تالفة</span>
          </div>
          <span className="text-[10px] text-slate-400">تم خصمها من رصيد المستودع</span>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-bold text-slate-300">أثر المرتجع في النظام المالي</span>
          <div className="text-xs text-rose-300 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-rose-400" />
            <span>قيد إشعار مدين تلقائي (Debit Note)</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Dr. دائنون موردين (2010) | Cr. مخزون (1040) + Cr. ضريبة مدخلات (1060)
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم المرتجع، المورد، أو أمر الشراء..."
            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 pr-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="text-xs text-slate-500 font-bold">
          عدد المرتجعات: <strong className="text-slate-900 font-black">{purchaseReturns.length}</strong>
        </div>
      </div>

      {/* Returns List */}
      <div className="space-y-4">
        {filteredReturns.map((ret) => (
          <div
            key={ret.id}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition"
          >
            {/* Top Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 font-mono font-black text-xs flex items-center justify-center">
                  PRET
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono font-black text-sm text-slate-900">{ret.returnNumber}</h3>
                    {ret.debitNoteNumber && (
                      <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                        إشعار مدين: {ret.debitNoteNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">
                    المورد: <strong className="text-slate-900">{ret.supplierName}</strong> | أمر شراء أصلي:{" "}
                    <strong className="text-slate-900 font-mono">{ret.poNumber}</strong>
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-400 block">القيمة المستردة المخصومة:</span>
                <span className="text-base font-black text-rose-700 font-mono">
                  -{formatEGP(ret.totalRefundAmount)}
                </span>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 block text-[11px]">
                الأصناف المرتجعة وأسباب التلف:
              </span>
              <div className="space-y-1.5">
                {ret.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-rose-50/50 border border-rose-100 p-2.5 rounded-xl flex items-center justify-between text-slate-800"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      <span className="text-[11px] text-rose-700">
                        سبب الإرجاع: {item.defectReason}
                      </span>
                    </div>

                    <div className="text-left font-mono">
                      <span className="font-bold text-slate-900">{item.quantity} وحدة</span>
                      <span className="text-[11px] text-slate-500 block">
                        ({formatEGP(item.total)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>تاريخ الإرجاع: {ret.date} | المنشئ: {ret.createdBy}</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                تم قيد الإشعار المدين وتعديل رصيد المخزون
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isCreateOpen && (
        <CreateReturnModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
    </div>
  );
}
