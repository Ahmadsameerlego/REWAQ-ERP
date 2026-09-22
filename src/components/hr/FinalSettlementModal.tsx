"use client";

import React, { useState } from "react";
import { X, UserCheck, Calculator, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useHR } from "@/context/HRContext";
import { formatEGP } from "@/lib/hrEngine";

interface FinalSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FinalSettlementModal({ isOpen, onClose }: FinalSettlementModalProps) {
  const { employees, createFinalSettlement, leaveBalances, advances } = useHR();

  const activeEmployees = employees.filter((e) => e.status !== "TERMINATED");
  const [employeeId, setEmployeeId] = useState(activeEmployees[0]?.id || "");
  const [terminationDate, setTerminationDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState<"RESIGNATION" | "CONTRACT_END" | "TERMINATION" | "RETIREMENT">("RESIGNATION");

  const [unpaidSalaryAmount, setUnpaidSalaryAmount] = useState(6500);
  const [unusedLeaveDays, setUnusedLeaveDays] = useState(8);
  const [endOfServiceGratuity, setEndOfServiceGratuity] = useState(15000);
  const [approvedBonuses, setApprovedBonuses] = useState(0);
  const [damagesOrPenalties, setDamagesOrPenalties] = useState(0);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const currentEmp = activeEmployees.find((e) => e.id === employeeId);
  const empAdvance = advances.find((a) => a.employeeId === employeeId && a.status === "ACTIVE");
  const outstandingAdvance = empAdvance ? empAdvance.remainingBalance : 0;

  // Calculate daily rate
  const dailyRate = currentEmp ? (currentEmp.basicSalary + currentEmp.housingAllowance + currentEmp.transportationAllowance) / 30 : 0;
  const leaveCompensation = Math.round(unusedLeaveDays * dailyRate);

  const totalEntitlements = Number(unpaidSalaryAmount) + leaveCompensation + Number(endOfServiceGratuity) + Number(approvedBonuses);
  const totalDeductions = outstandingAdvance + Number(damagesOrPenalties);
  const netSettlement = Math.max(0, totalEntitlements - totalDeductions);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmp) return;

    createFinalSettlement(
      {
        employeeId: currentEmp.id,
        employeeCode: currentEmp.employeeCode,
        employeeName: currentEmp.fullName,
        departmentName: currentEmp.departmentName,
        positionTitle: currentEmp.positionTitle,
        branchName: currentEmp.branchName,
        hireDate: currentEmp.hireDate,
        terminationDate,
        serviceDurationText: "3 سنوات و 8 أشهر",
        reason,
        lastSalaryMonth: "2026-09",
        unpaidSalaryAmount: Number(unpaidSalaryAmount),
        unusedLeaveDays: Number(unusedLeaveDays),
        leaveCompensationAmount: leaveCompensation,
        endOfServiceGratuity: Number(endOfServiceGratuity),
        approvedBonuses: Number(approvedBonuses),
        totalEntitlements,
        outstandingAdvanceBalance: outstandingAdvance,
        damagesOrPenalties: Number(damagesOrPenalties),
        otherDeductions: 0,
        totalDeductions,
        netSettlementAmount: netSettlement,
        notes,
      },
      "أحمد سمير"
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" dir="rtl">
        <div className="p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">إجراء مخالصة نهاية الخدمة (Final Settlement)</h3>
              <p className="text-[11px] text-slate-400">حساب مكافأة نهاية الخدمة، رصيد الإجازات، وتصفية السلف القائمة</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">الموظف المعني بالمخالصة *</label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
              >
                {activeEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.positionTitle}) - {emp.branchName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">سبب إنهاء الخدمة *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="RESIGNATION">استقالة برغبة الموظف</option>
                <option value="CONTRACT_END">انتهاء مدة العقد وعدم التجديد</option>
                <option value="TERMINATION">إنهاء خدمة من قبل الشركة</option>
                <option value="RETIREMENT">بلوغ سن التقاعد</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">تاريخ آخر يوم عمل *</label>
              <input
                type="date"
                required
                value={terminationDate}
                onChange={(e) => setTerminationDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">راتب الأيام المتبقية للشهر (ج.م)</label>
              <input
                type="number"
                value={unpaidSalaryAmount}
                onChange={(e) => setUnpaidSalaryAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">أيام الإجازات غير المستخدمة للتسوية</label>
              <input
                type="number"
                min={0}
                value={unusedLeaveDays}
                onChange={(e) => setUnusedLeaveDays(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                المقابل المالي: {formatEGP(leaveCompensation)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">مكافأة نهاية الخدمة التقديرية (ج.م)</label>
              <input
                type="number"
                min={0}
                value={endOfServiceGratuity}
                onChange={(e) => setEndOfServiceGratuity(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Advances & Deductions Section */}
          {outstandingAdvance > 0 && (
            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-between text-xs text-rose-900">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>رصيد سلفة مستحقة سيتم استقطاعها من المخالصة:</span>
              </span>
              <span className="font-bold font-mono text-sm text-rose-700">-{formatEGP(outstandingAdvance)}</span>
            </div>
          )}

          {/* Net Final Settlement Output */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-rewaq-gold font-bold block">صافي مبلغ المخالصة المستحق للموظف:</span>
              <span className="text-[11px] text-slate-400">إجمالي المستحقات ({formatEGP(totalEntitlements)}) - الخصومات ({formatEGP(totalDeductions)})</span>
            </div>
            <div className="text-left font-mono font-black text-2xl text-rewaq-gold">
              {formatEGP(netSettlement)}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">ملاحظات المخالصة والتسليم الإداري</label>
            <textarea
              rows={2}
              placeholder="مثال: تم استلام العهدة (اللابتوب، مفاتيح المعرض، الهاتف) وتسوية كافة البنود"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rewaq-gold"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition">
              إلغاء
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-700 text-white shadow-md transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>اعتماد المخالصة وتصفية الحساب</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
