"use client";

import React, { useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Printer, Banknote, Building, ShieldCheck, User } from "lucide-react";
import HrNav from "@/components/hr/HrNav";
import { useHR } from "@/context/HRContext";
import { formatEGP } from "@/lib/hrEngine";

export default function SinglePayslipPage() {
  const params = useParams();
  const router = useRouter();
  const slipId = params.id as string;

  const { payslips } = useHR();
  const printableRef = useRef<HTMLDivElement>(null);

  const payslip = payslips.find((p) => p.id === slipId || p.payslipNumber === slipId || p.employeeId === slipId);

  if (!payslip) {
    return (
      <div className="space-y-6">
        <HrNav />
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <p className="text-slate-500 font-bold mb-4">قسيمة الراتب غير موجودة</p>
          <Link
            href="/dashboard/hr/payroll"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للرواتب</span>
          </Link>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <HrNav />
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {/* Action Header */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/dashboard/hr/payroll"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لمسيرات الرواتب</span>
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-rewaq-gold font-black text-xs px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة القسيمة (Print Payslip)</span>
          </button>
        </div>

        {/* Payslip Document */}
        <div ref={printableRef} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 text-slate-800">
          {/* Header */}
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

          {/* Employer share info */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              ℹ️ حصة صاحب العمل المسددة للتأمينات الاجتماعية:{" "}
              <strong className="text-slate-800 font-mono">{formatEGP(payslip.employerSocialInsurance)} (18.75%)</strong>
            </span>
            <span className="font-bold text-emerald-700">مسددة بالكامل</span>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-8 pt-6 border-t border-slate-200 text-center text-xs">
            <div>
              <span className="text-slate-400 block mb-6">إعداد شؤون العاملين</span>
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
