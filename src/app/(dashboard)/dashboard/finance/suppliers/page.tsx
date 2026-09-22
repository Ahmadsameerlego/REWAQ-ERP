"use client";

import React, { useState } from "react";
import {
  Coins,
  Search,
  Plus,
  Phone,
  Building2,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";
import FinanceNav from "@/components/finance/FinanceNav";
import { useFinance } from "@/context/FinanceContext";
import { Supplier, SupplierBill } from "@/types/finance";
import { formatEGP } from "@/lib/accountingEngine";

export default function SuppliersPage() {
  const { suppliers, supplierBills, createSupplierPayment, treasuries, bankAccounts } = useFinance();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"SUPPLIERS" | "BILLS">("SUPPLIERS");
  const [selectedBillForPay, setSelectedBillForPay] = useState<SupplierBill | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paidFromId, setPaidFromId] = useState(treasuries[0]?.id || "tr-cairo");
  const [isSuccess, setIsSuccess] = useState(false);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery)
  );

  const totalPayable = suppliers.reduce((sum, s) => sum + s.balance, 0);

  const handlePayBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillForPay || paymentAmount <= 0) return;

    createSupplierPayment({
      supplierId: selectedBillForPay.supplierId,
      supplierName: selectedBillForPay.supplierName,
      billId: selectedBillForPay.id,
      billNumber: selectedBillForPay.billNumber,
      amount: paymentAmount,
      paymentMethod: "BANK_TRANSFER",
      paidFromId,
      paidFromName: "بنك CIB - الحساب التجاري",
      date: new Date().toISOString().split("T")[0],
      reference: `سداد فاتورة توريد #${selectedBillForPay.billNumber}`,
      notes: "سداد عبر تحويل بنكي CIB",
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setSelectedBillForPay(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <FinanceNav />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
              <Coins className="w-3 h-3" />
              حسابات الموردين والدائنين (Accounts Payable)
            </span>
            <span className="text-xs text-slate-500 font-medium">| جاهز للتكامل المستقبلي مع المشتريات</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            سجل موردي الخامات وفواتير التوريد والمدفوعات
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة مستحقات مصانع وموردي الأخشاب الزان، أقمشة التنجيد، وإكسسوارات الأثاث.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold">
            إجمالي الدائنين: <span className="text-rewaq-gold font-mono font-black">{formatEGP(totalPayable)}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">إجمالي المديونية للموردين</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatEGP(totalPayable)}
          </div>
          <span className="text-[10px] text-slate-400 block">حساب دائنون وموردون (2010)</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">إجمالي مشتريات وتوريدات الخامات</span>
          <div className="text-2xl font-black text-emerald-800 font-mono">
            {formatEGP(suppliers.reduce((sum, s) => sum + s.totalPurchases, 0))}
          </div>
          <span className="text-[10px] text-emerald-600 block">أخشاب دمياط + أقمشة المحلة</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">إجمالي المسدد للموردين</span>
          <div className="text-2xl font-black text-blue-800 font-mono">
            {formatEGP(suppliers.reduce((sum, s) => sum + s.totalPaid, 0))}
          </div>
          <span className="text-[10px] text-blue-600 block">نسبة السداد 90.6%</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("SUPPLIERS")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "SUPPLIERS"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              دليل الموردين والأرصدة
            </button>

            <button
              onClick={() => setActiveTab("BILLS")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "BILLS"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              فواتير التوريد واستحقاقات السداد
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="بحث باسم المورد أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-xs text-slate-800 focus:outline-none focus:border-rewaq-gold"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
          </div>
        </div>

        {activeTab === "SUPPLIERS" && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
                <tr>
                  <th className="p-3">كود المورد</th>
                  <th className="p-3">اسم المورد / المؤسسة</th>
                  <th className="p-3">المسؤول والهاتف</th>
                  <th className="p-3">المدينة / التصنيف</th>
                  <th className="p-3">إجمالي التوريدات</th>
                  <th className="p-3">المسدد</th>
                  <th className="p-3">الرصيد المستحق (لنا / علينا)</th>
                  <th className="p-3">فترة الائتمان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono font-bold text-slate-900">{s.code}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{s.nameAr}</span>
                      <span className="text-[10px] text-slate-400 font-mono">سجل ضريبي: {s.taxNumber}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-slate-800 block">{s.contactPerson}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{s.phone}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-800 block">{s.city}</span>
                      <span className="text-[10px] text-slate-500">
                        {s.category === "RAW_WOOD"
                          ? "أخشاب زان وموسكي"
                          : s.category === "FABRICS"
                          ? "أقمشة وكتان"
                          : "إكسسوارات ومقابض"}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">{formatEGP(s.totalPurchases)}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700">{formatEGP(s.totalPaid)}</td>
                    <td className="p-3 font-mono font-black text-rose-700 text-sm">
                      {formatEGP(s.balance)}
                    </td>
                    <td className="p-3 font-mono text-slate-600">{s.paymentTermsDays} يوماً</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "BILLS" && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
                <tr>
                  <th className="p-3">رقم الفاتورة</th>
                  <th className="p-3">المورد</th>
                  <th className="p-3">تاريخ التوريد</th>
                  <th className="p-3">تاريخ الاستحقاق</th>
                  <th className="p-3">الأساسي</th>
                  <th className="p-3">ضريبة 14%</th>
                  <th className="p-3">الإجمالي</th>
                  <th className="p-3">المتبقي</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-center">إجراء سداد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplierBills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono font-bold text-slate-900">{b.billNumber}</td>
                    <td className="p-3 font-bold text-slate-900">{b.supplierName}</td>
                    <td className="p-3 font-mono text-slate-600">{b.date}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{b.dueDate}</td>
                    <td className="p-3 font-mono font-bold text-slate-700">{formatEGP(b.subtotal)}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700">{formatEGP(b.taxAmount)}</td>
                    <td className="p-3 font-mono font-black text-slate-900">{formatEGP(b.totalAmount)}</td>
                    <td className="p-3 font-mono font-black text-rose-700">{formatEGP(b.remainingAmount)}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                        مستحقة السداد
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBillForPay(b);
                          setPaymentAmount(b.remainingAmount);
                        }}
                        className="px-3 py-1 text-xs font-black bg-slate-900 hover:bg-slate-800 text-rewaq-gold rounded-lg transition cursor-pointer"
                      >
                        سداد الفاتورة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay Supplier Modal */}
      {selectedBillForPay && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 space-y-4">
            <h3 className="text-sm font-black text-slate-900">سداد مستحقات مورد: {selectedBillForPay.supplierName}</h3>
            {isSuccess ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-black text-slate-900">تم تسجيل سداد المورد بنجاح!</h4>
              </div>
            ) : (
              <form onSubmit={handlePayBill} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">فاتورة التوريد:</label>
                  <input
                    type="text"
                    disabled
                    value={`${selectedBillForPay.billNumber} (المتبقي: ${formatEGP(selectedBillForPay.remainingAmount)})`}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المبلغ المسدد (ج.م):</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={selectedBillForPay.remainingAmount}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-2 font-mono font-black text-sm text-emerald-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setSelectedBillForPay(null)}
                    className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                  >
                    تأكيد السداد والترحيل
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
