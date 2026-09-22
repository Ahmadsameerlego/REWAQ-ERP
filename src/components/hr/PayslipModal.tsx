"use client";

import React, { useRef } from "react";
import { X, Printer, Download, Banknote, ShieldCheck, CheckCircle2, Building, User } from "lucide-react";
import { Payslip } from "@/types/hr";
import { formatEGP } from "@/lib/hrEngine";

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payslip?: Payslip;
}

export default function PayslipModal({ isOpen, onClose, payslip }: PayslipModalProps) {
  const printableRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" dir="rtl">
        {/* Top Action Bar */}
        <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-rewaq-gold" />
            <h3 className="font-bold text-sm text-white">مفردات المرتب الرسمية (Payslip) - {payslip.periodLabel}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة القسيمة</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div ref={printableRef} className="p-6 md:p-8 space-y-6 text-slate-800 bg-white">
          {/* Company Brand & Payslip Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-950">رِواق للأثاث والديكور</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-900 text-rewaq-gold font-mono font-bold">Rewaq ERP</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">شركة آرو إنتيريور لتجهيزات المعارض والمفروشات الفاخرة - م.ع.م</p>
              <p className="text-[11px] text-slate-400 font-mono">س.ت: 184592 | ب.ض: 549-821-304</p>
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-slate-400 block">إشعار تحويل وصرف راتب</span>
              <span className="text-sm font-black font-mono text-slate-900 block">{payslip.payslipNumber}</span>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md inline-block mt-1">
                الفترة: {payslip.periodLabel}
              </span>
            </div>
          </div>

          {/* Employee Information Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">اسم الموظف:</span>
              <span className="font-bold text-slate-900 text-sm block">{payslip.employeeName}</span>
              <span className="text-slate-500 font-mono text-[10px]">كود: {payslip.employeeCode}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">الفرع والإدارة:</span>
              <span className="font-bold text-slate-900 block">{payslip.branchName}</span>
              <span className="text-slate-500 text-[11px] block">{payslip.departmentName}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">المسمى الوظيفي:</span>
              <span className="font-bold text-slate-900 block">{payslip.positionTitle}</span>
              <span className="text-slate-500 font-mono text-[10px]">الرقم القومي: {payslip.nationalId}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">طريقة الصرف:</span>
              <span className="font-bold text-slate-900 block">{payslip.bankName || "تحويل بنكي / نقدي"}</span>
              <span className="text-slate-500 font-mono text-[10px] truncate block">{payslip.bankAccountNumber || "خزينة الفرع"}</span>
            </div>
          </div>

          {/* Financial Breakdown: Earnings vs Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings Column */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-emerald-50 border-b border-emerald-100 p-3 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950">المستحقات والمكافآت (Earnings)</span>
                <span className="text-xs font-black font-mono text-emerald-800">ج.م</span>
              </div>
              <div className="p-3.5 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">الراتب الأساسي التعاقدي</span>
                  <span className="font-mono font-bold">{formatEGP(payslip.basicSalary)}</span>
                </div>
                {payslip.housingAllowance > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">بدل سكن وإقامة</span>
                    <span className="font-mono font-bold">{formatEGP(payslip.housingAllowance)}</span>
                  </div>
                )}
                {payslip.transportationAllowance > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">بدل انتقال وسفر</span>
                    <span className="font-mono font-bold">{formatEGP(payslip.transportationAllowance)}</span>
                  </div>
                )}
                {payslip.otherAllowances > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">بدلات أخرى منتظمة</span>
                    <span className="font-mono font-bold">{formatEGP(payslip.otherAllowances)}</span>
                  </div>
                )}
                {payslip.overtimeAmount > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-blue-700">
                    <span>ساعات عمل إضافي (Overtime)</span>
                    <span className="font-mono font-bold">{formatEGP(payslip.overtimeAmount)}</span>
                  </div>
                )}
                {payslip.commissionsAmount > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-purple-700">
                    <span>عمولة مبيعات وعقود المعرض</span>
                    <span className="font-mono font-bold">{formatEGP(payslip.commissionsAmount)}</span>
                  </div>
                )}
                {payslip.bonusAmount > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                    <span>حوافز ومكافأة تميز</span>
                    <span className="font-mono font-bold">{formatEGP(payslip.bonusAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 text-sm font-black text-slate-900">
                  <span>إجمالي الاستحقاق (Gross Salary):</span>
                  <span className="font-mono text-emerald-700">{formatEGP(payslip.grossSalary)}</span>
                </div>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-rose-50 border-b border-rose-100 p-3 flex items-center justify-between">
                <span className="text-xs font-bold text-rose-950">الاستقطاعات والخصومات (Deductions)</span>
                <span className="text-xs font-black font-mono text-rose-800">ج.م</span>
              </div>
              <div className="p-3.5 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">ضريبة كسب العمل (مصلحة الضرائب المصرية)</span>
                  <span className="font-mono font-bold text-rose-600">-{formatEGP(payslip.incomeTax)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">التأمينات الاجتماعية (حصة الموظف 11%)</span>
                  <span className="font-mono font-bold text-rose-600">-{formatEGP(payslip.employeeSocialInsurance)}</span>
                </div>
                {payslip.advanceDeduction > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-purple-700">
                    <span>قسط سلفة شهرية مستردة</span>
                    <span className="font-mono font-bold">-{formatEGP(payslip.advanceDeduction)}</span>
                  </div>
                )}
                {payslip.absenceDeduction > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-rose-700">
                    <span>خصم أيام غياب</span>
                    <span className="font-mono font-bold">-{formatEGP(payslip.absenceDeduction)}</span>
                  </div>
                )}
                {payslip.lateDeduction > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-amber-700">
                    <span>خصم دقائق تأخير</span>
                    <span className="font-mono font-bold">-{formatEGP(payslip.lateDeduction)}</span>
                  </div>
                )}
                {payslip.otherDeductions > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-rose-700">
                    <span>خصومات أخرى / جزاءات</span>
                    <span className="font-mono font-bold">-{formatEGP(payslip.otherDeductions)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 text-sm font-black text-slate-900">
                  <span>إجمالي المستقطع (Total Deductions):</span>
                  <span className="font-mono text-rose-700">-{formatEGP(payslip.totalDeductions)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Big Net Salary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
            <div>
              <span className="text-xs text-rewaq-gold font-bold block">صافي الراتب المستحق للصرف (Net Payable)</span>
              <span className="text-xs text-slate-400">بعد خصم كافة الضرائب والتأمينات والأقساط</span>
            </div>
            <div className="text-left">
              <span className="text-3xl font-black font-mono text-rewaq-gold">{formatEGP(payslip.netSalary)}</span>
            </div>
          </div>

          {/* Social Insurance Employer Transparency Notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              ℹ️ للمعلومة: سددت الشركة عنك أيضاً حصة صاحب العمل في التأمينات الاجتماعية بقيمة:{" "}
              <strong className="text-slate-800 font-mono">{formatEGP(payslip.employerSocialInsurance)} (18.75%)</strong>
            </span>
            <span className="font-bold text-emerald-700">مسددة بالكامل للتأمينات</span>
          </div>

          {/* Signatures Row */}
          <div className="grid grid-cols-3 gap-8 pt-6 border-t border-slate-200 text-center text-xs">
            <div>
              <span className="text-slate-400 block mb-6">إعداد شؤون العاملين (HR)</span>
              <span className="font-bold text-slate-800">أحمد سمير</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-6">مراجعة الإدارة المالية</span>
              <span className="font-bold text-slate-800">هاني عبد الحميد</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-6">توقيع واستلام الموظف</span>
              <span className="font-bold text-slate-800">{payslip.employeeName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
