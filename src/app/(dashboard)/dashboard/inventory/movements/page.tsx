"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  History,
  Layers,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  RefreshCw,
  SlidersHorizontal,
  Package,
  Calendar,
  User
} from "lucide-react";
import { useShowroom } from "@/context/ShowroomContext";

export default function StockMovementsPage() {
  const { stockMovements } = useShowroom();

  const [searchFilter, setSearchFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const filteredMovements = stockMovements.filter((mov) => {
    if (typeFilter !== "ALL" && mov.movementType !== typeFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const match = [
        mov.productName,
        mov.reference,
        mov.user,
        mov.fromLocation,
        mov.toLocation,
        mov.notes,
      ]
        .join(" ")
        .toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  const receivingCount = stockMovements.filter((m) => m.movementType === "RECEIVING").length;
  const salesCount = stockMovements.filter((m) => m.movementType === "SALE_ISSUE").length;
  const reservationCount = stockMovements.filter((m) => m.movementType === "RESERVATION" || m.movementType === "RESERVATION_RELEASE").length;
  const transfersCount = stockMovements.filter((m) => m.movementType.startsWith("TRANSFER")).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/dashboard/inventory" className="hover:text-rewaq-gold-dark flex items-center gap-1 font-medium transition">
              <Layers className="w-3.5 h-3.5" />
              المخزون والمستودعات
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">دفتر حركات المخزون</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <History className="w-6 h-6 text-rewaq-gold" />
            دفتر حركات المخزون غير القابل للتعديل
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable Audit Ledger: سجل تاريخي مفصل لكل حركة توريد، حجز تعاقد، صرف بيع، تحويل فروع، أو تسوية جرد.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-3.5 py-2 rounded-xl border border-slate-200 whitespace-nowrap">
            إجمالي السجلات: {stockMovements.length}
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-bold block">إذونات الاستلام والتوريد</span>
            <span className="text-lg font-black text-slate-900 font-mono">{receivingCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-bold block">صرف مبيعات نهائي</span>
            <span className="text-lg font-black text-slate-900 font-mono">{salesCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-bold block">حركات حجز العقود</span>
            <span className="text-lg font-black text-slate-900 font-mono">{reservationCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-bold block">تحويلات الفروع والمستودعات</span>
            <span className="text-lg font-black text-slate-900 font-mono">{transfersCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="بحث سريع: برقم العقد، اسم الصنف، اسم المستخدم، المستودع، أو الملاحظات..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-rewaq-gold transition"
          >
            <option value="ALL">جميع أنواع الحركات</option>
            <option value="RECEIVING">📥 إذن استلام توريد</option>
            <option value="SALE_ISSUE">📤 صرف بيع نهائي</option>
            <option value="RESERVATION">🔒 حجز تعاقد</option>
            <option value="RESERVATION_RELEASE">🔓 فك حجز</option>
            <option value="TRANSFER_IN">🚚 استلام تحويل</option>
            <option value="TRANSFER_OUT">🚛 خروج تحويل</option>
            <option value="ADJUSTMENT">⚖️ تسوية جرد</option>
            <option value="DAMAGED">⚠️ إتلاف/تالف</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                <th className="p-4 whitespace-nowrap">الوقت والتاريخ</th>
                <th className="p-4 whitespace-nowrap">نوع الحركة</th>
                <th className="p-4 whitespace-nowrap">الصنف والبيان</th>
                <th className="p-4 whitespace-nowrap">مسار الحركة (من ➔ إلى)</th>
                <th className="p-4 text-center whitespace-nowrap">الكمية</th>
                <th className="p-4 whitespace-nowrap">المرجع والمستخدم</th>
                <th className="p-4 whitespace-nowrap">ملاحظات والتفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 text-xs">
                    لا توجد حركات مخزنية تطابق معايير البحث
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => {
                  const isPositive =
                    mov.movementType === "RECEIVING" ||
                    mov.movementType === "TRANSFER_IN" ||
                    mov.movementType === "RETURN";
                  return (
                    <tr key={mov.id} className="hover:bg-slate-50/70 transition">
                      {/* Date & Time */}
                      <td className="p-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{mov.date}</span>
                        </div>
                      </td>

                      {/* Movement Type Badge */}
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap ${
                            mov.movementType === "RECEIVING"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : mov.movementType === "SALE_ISSUE"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : mov.movementType === "RESERVATION"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : mov.movementType === "RESERVATION_RELEASE"
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : mov.movementType === "TRANSFER_IN"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : mov.movementType === "TRANSFER_OUT"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : mov.movementType === "ADJUSTMENT"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {mov.movementType === "RECEIVING"
                            ? "📥 إذن استلام توريد"
                            : mov.movementType === "SALE_ISSUE"
                            ? "📤 صرف بيع نهائي"
                            : mov.movementType === "RESERVATION"
                            ? "🔒 حجز تعاقد"
                            : mov.movementType === "RESERVATION_RELEASE"
                            ? "🔓 فك حجز"
                            : mov.movementType === "TRANSFER_IN"
                            ? "🚚 استلام تحويل"
                            : mov.movementType === "TRANSFER_OUT"
                            ? "🚛 خروج تحويل"
                            : mov.movementType === "ADJUSTMENT"
                            ? "⚖️ تسوية جرد"
                            : "⚠️ إتلاف/تالف"}
                        </span>
                      </td>

                      {/* Product Name */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <p className="font-bold text-slate-900">{mov.productName}</p>
                        </div>
                      </td>

                      {/* Path */}
                      <td className="p-4 text-slate-700 font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {mov.fromLocation || "-"}
                          </span>
                          <span className="text-slate-400">➔</span>
                          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {mov.toLocation || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="p-4 text-center font-mono font-black text-sm whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-lg ${
                            isPositive
                              ? "text-emerald-700 bg-emerald-50"
                              : "text-slate-800 bg-slate-100"
                          }`}
                        >
                          {isPositive ? `+${mov.quantity}` : `-${mov.quantity}`}
                        </span>
                      </td>

                      {/* Reference & User */}
                      <td className="p-4 whitespace-nowrap">
                        {mov.reference && (
                          <div className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100/80 px-2 py-0.5 rounded w-fit mb-0.5">
                            {mov.reference}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{mov.user}</span>
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="p-4 text-[11px] text-slate-600 max-w-xs truncate">
                        {mov.notes || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

