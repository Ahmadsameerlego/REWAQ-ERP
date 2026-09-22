"use client";

import React, { useState } from "react";
import {
  Calendar,
  Search,
  MessageCircle,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Phone,
  User,
} from "lucide-react";
import FinanceNav from "@/components/finance/FinanceNav";
import CreateReceiptModal from "@/components/finance/CreateReceiptModal";
import { useFinance } from "@/context/FinanceContext";
import { CustomerInstallment } from "@/types/finance";
import { formatEGP } from "@/lib/accountingEngine";

export default function InstallmentsPage() {
  const { customerInstallments } = useFinance();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedForReceipt, setSelectedForReceipt] = useState<CustomerInstallment | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const filteredInstallments = customerInstallments.filter((inst) => {
    const matchesSearch =
      inst.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.customerPhone.includes(searchQuery);

    const matchesStatus = statusFilter === "ALL" || inst.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const overdueCount = customerInstallments.filter((i) => i.status === "OVERDUE").length;
  const dueCount = customerInstallments.filter((i) => i.status === "DUE").length;
  const paidCount = customerInstallments.filter((i) => i.status === "PAID").length;

  const handleOpenReceipt = (inst: CustomerInstallment) => {
    setSelectedForReceipt(inst);
    setShowReceiptModal(true);
  };

  const getWhatsAppLink = (inst: CustomerInstallment) => {
    const phone = inst.customerPhone.startsWith("0") ? `20${inst.customerPhone.substring(1)}` : inst.customerPhone;
    const msg = encodeURIComponent(
      `مرحباً ${inst.customerName}، تحية طيبة من شركة رِواق للأثاث.\nنود تذكيركم بموعد استحقاق القسط رقم ${inst.installmentNumber} بقيمة ${formatEGP(inst.amount)} لعقد أثاث رقم #${inst.orderNumber}.\nيمكنكم السداد نقداً بالمعرض أو عبر انستاباي/تحويل بنكي.\nشكراً لثقتكم برِواق.`
    );
    return `https://wa.me/${phone}?text=${msg}`;
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <FinanceNav onOpenReceiptModal={() => setShowReceiptModal(true)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              جدول الأقساط والتحصيل الدوري
            </span>
            <span className="text-xs text-slate-500 font-medium">| متابعة خطط السداد وتنبيهات الاستحقاق</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            جدول استحقاق أقساط عقود الأثاث
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            تتبع الأقساط المسددة، المستحقة خلال الأسبوع، والمتأخرة مع إمكانية إرسال إشعار تذكير عبر واتساب فوراً.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedForReceipt(null);
              setShowReceiptModal(true);
            }}
            className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>تسجيل تحصيل قسط</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs bg-rose-50/40 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900">أقساط متأخرة (Overdue)</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-700 font-mono">
            {formatEGP(
              customerInstallments
                .filter((i) => i.status === "OVERDUE")
                .reduce((sum, i) => sum + i.remainingAmount, 0)
            )}
          </div>
          <span className="text-[10px] text-rose-700 font-bold">{overdueCount} أقساط تجاوزت موعد الاستحقاق</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs bg-amber-50/40 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">أقساط مستحقة قريباً (Due Soon)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-800 font-mono">
            {formatEGP(
              customerInstallments
                .filter((i) => i.status === "DUE")
                .reduce((sum, i) => sum + i.remainingAmount, 0)
            )}
          </div>
          <span className="text-[10px] text-amber-700 font-bold">{dueCount} أقساط خلال الـ 7 أيام القادمة</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/40 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900">أقساط تم سدادها هذا الشهر</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700 font-mono">
            {formatEGP(
              customerInstallments
                .filter((i) => i.status === "PAID")
                .reduce((sum, i) => sum + i.paidAmount, 0)
            )}
          </div>
          <span className="text-[10px] text-emerald-700 font-bold">{paidCount} أقساط مسددة بالكامل</span>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="بحث باسم العميل، الهاتف، أو رقم العقد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs text-slate-800 focus:outline-none focus:border-rewaq-gold"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["ALL", "OVERDUE", "DUE", "PAID", "PENDING"].map((st) => (
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
                : st === "OVERDUE"
                ? "متأخر ⚠️"
                : st === "DUE"
                ? "مستحق ⏳"
                : st === "PAID"
                ? "مسدد ✓"
                : "قادم"}
            </button>
          ))}
        </div>
      </div>

      {/* Installments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
              <tr>
                <th className="p-3.5">العميل ورقم العقد</th>
                <th className="p-3.5">القسط</th>
                <th className="p-3.5">تاريخ الاستحقاق</th>
                <th className="p-3.5">مبلغ القسط</th>
                <th className="p-3.5">المسدد</th>
                <th className="p-3.5">المتبقي</th>
                <th className="p-3.5">حالة القسط</th>
                <th className="p-3.5 text-center">إجراءات المتابعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInstallments.map((inst) => {
                const isOverdue = inst.status === "OVERDUE";
                const isDue = inst.status === "DUE";
                const isPaid = inst.status === "PAID";

                return (
                  <tr key={inst.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block">{inst.customerName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        عقد: #{inst.orderNumber} | {inst.customerPhone}
                      </span>
                    </td>

                    <td className="p-3.5 font-bold font-mono text-slate-700">
                      قسط {inst.installmentNumber} من {inst.totalInstallments}
                    </td>

                    <td className="p-3.5 font-mono font-bold text-slate-800">
                      {inst.dueDate}
                    </td>

                    <td className="p-3.5 font-mono font-black text-slate-900">
                      {formatEGP(inst.amount)}
                    </td>

                    <td className="p-3.5 font-mono font-bold text-emerald-700">
                      {formatEGP(inst.paidAmount)}
                    </td>

                    <td className="p-3.5 font-mono font-black text-rose-700">
                      {formatEGP(inst.remainingAmount)}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-800"
                            : isOverdue
                            ? "bg-rose-100 text-rose-800 font-black animate-pulse"
                            : isDue
                            ? "bg-amber-100 text-amber-800 font-bold"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {isPaid ? "تم السداد ✓" : isOverdue ? "متأخر ⚠️" : isDue ? "مستحق الآن ⏳" : "مجدول"}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {!isPaid && (
                          <>
                            <a
                              href={getWhatsAppLink(inst)}
                              target="_blank"
                              rel="noreferrer"
                              title="إرسال تذكير عبر واتساب"
                              className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[11px] px-2.5 py-1 rounded-lg transition"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="hidden sm:inline">واتساب</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => handleOpenReceipt(inst)}
                              className="inline-flex items-center gap-1 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-[11px] px-3 py-1 rounded-lg shadow-2xs transition cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>تحصيل</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CreateReceiptModal
        isOpen={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
          setSelectedForReceipt(null);
        }}
        prefillCustomerName={selectedForReceipt?.customerName}
        prefillContractId={selectedForReceipt?.orderNumber}
        prefillAmount={selectedForReceipt?.remainingAmount}
        prefillInstallmentId={selectedForReceipt?.id}
      />
    </div>
  );
}
