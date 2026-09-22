"use client";

import React, { useState } from "react";
import {
  Receipt,
  Search,
  Plus,
  Printer,
  X,
  CheckCircle2,
  Wallet,
  Building2,
  FileText,
  CreditCard,
  QrCode,
} from "lucide-react";
import FinanceNav from "@/components/finance/FinanceNav";
import CreateReceiptModal from "@/components/finance/CreateReceiptModal";
import { useFinance } from "@/context/FinanceContext";
import { ReceiptVoucher } from "@/types/finance";
import { formatEGP } from "@/lib/accountingEngine";

export default function ReceiptsPage() {
  const { receipts } = useFinance();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<ReceiptVoucher | null>(null);

  const filteredReceipts = receipts.filter(
    (r) =>
      r.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.orderNumber && r.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <FinanceNav onOpenReceiptModal={() => setShowCreateModal(true)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Receipt className="w-3 h-3" />
              سندات القبض والتحصيلات الرسمية
            </span>
            <span className="text-xs text-slate-500 font-medium">| التوثيق المالي وطرق السداد</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            سجل سندات القبض والتحصيلات النقدية والبنكية
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            إصدار وطباعة سندات قبض معتمدة للعملاء مع الترحيل التلقائي للخزائن وحسابات البنوك.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إصدار سند قبض جديد</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="بحث برقم السند، اسم العميل، أو رقم العقد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs text-slate-800 focus:outline-none focus:border-rewaq-gold"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <span className="text-xs font-bold text-slate-500">
          إجمالي السندات: {filteredReceipts.length}
        </span>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
              <tr>
                <th className="p-3.5">رقم السند</th>
                <th className="p-3.5">التاريخ</th>
                <th className="p-3.5">العميل</th>
                <th className="p-3.5">نوع السند / العقد</th>
                <th className="p-3.5">طريقة الدفع</th>
                <th className="p-3.5">الخزينة أو البنك المستلم</th>
                <th className="p-3.5">المبلغ المحصل</th>
                <th className="p-3.5">المستلم</th>
                <th className="p-3.5 text-center">طباعة / معاينة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 font-bold font-mono text-slate-900">{r.receiptNumber}</td>
                  <td className="p-3.5 font-mono text-slate-600">{r.date}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-slate-900 block">{r.customerName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{r.customerPhone}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-slate-800 block">
                      {r.type === "CONTRACT_DEPOSIT"
                        ? "عربون حجز تعاقد"
                        : r.type === "INSTALLMENT_PAYMENT"
                        ? "سداد قسط دوري"
                        : "تحصيل مباشر"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">عقد: #{r.orderNumber || "عام"}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                      {r.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3.5 text-[11px] text-slate-700 font-medium">
                    {r.treasuryOrBankName}
                  </td>
                  <td className="p-3.5 font-mono font-black text-emerald-800 text-sm">
                    {formatEGP(r.amount)}
                  </td>
                  <td className="p-3.5 text-slate-600">{r.receivedBy}</td>
                  <td className="p-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedReceiptForPrint(r)}
                      className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>معاينة وطباعة</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print / View Receipt Modal */}
      {selectedReceiptForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4">
            {/* Printable Receipt Card */}
            <div className="border-2 border-dashed border-slate-300 p-6 rounded-2xl space-y-4 bg-slate-50/50">
              {/* Receipt Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">شركة رِواق للأثاث والديكور</h3>
                  <p className="text-[10px] text-slate-500">سجل تجاري: 89410 | بطاقة ضريبية: 614-829-103</p>
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-rewaq-gold-dark font-mono block">
                    {selectedReceiptForPrint.receiptNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedReceiptForPrint.date}</span>
                </div>
              </div>

              <div className="text-center py-1">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-900 text-white">
                  سند قبض مالي معتمد
                </span>
              </div>

              {/* Receipt Content */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-bold">استلمنا من السيد/السيدة:</span>
                  <span className="font-black text-slate-900">{selectedReceiptForPrint.customerName}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-bold">مبلغ وقدره:</span>
                  <span className="font-black text-emerald-800 font-mono text-sm">
                    {formatEGP(selectedReceiptForPrint.amount)}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-bold">طريقة الدفع:</span>
                  <span className="font-bold text-slate-900">{selectedReceiptForPrint.paymentMethod}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-bold">وذلك عن:</span>
                  <span className="font-bold text-slate-900">
                    {selectedReceiptForPrint.notes || `دفعة لعقد أثاث #${selectedReceiptForPrint.orderNumber}`}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-bold">الخزينة / الحساب:</span>
                  <span className="font-medium text-slate-800">{selectedReceiptForPrint.treasuryOrBankName}</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block mb-3">توقيع العميل:</span>
                  <span className="text-slate-400 font-mono">........................</span>
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block mb-3">أمين الخزينة / المستلم:</span>
                  <span className="font-bold text-slate-900">{selectedReceiptForPrint.receivedBy}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedReceiptForPrint(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                إغلاق
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-black bg-slate-900 text-rewaq-gold hover:bg-slate-800 rounded-xl shadow-xs transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة السند</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateReceiptModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
