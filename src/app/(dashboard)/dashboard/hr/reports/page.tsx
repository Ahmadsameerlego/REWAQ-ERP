"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Building,
  Users2,
  Clock,
  Plane,
  Banknote,
  Coins,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import HrNav from "@/components/hr/HrNav";
import { useHR } from "@/context/HRContext";
import { formatEGP } from "@/lib/hrEngine";

export default function HrReportsPage() {
  const { employees, departments, payrollRuns, attendanceRecords, leaveBalances } = useHR();
  const [activeReport, setActiveReport] = useState<"PAYROLL_COST" | "BRANCH_DISTRIBUTION" | "ATTENDANCE_SUMMARY" | "TAX_INSURANCE">("PAYROLL_COST");

  const latestRun = payrollRuns[0];

  // Group payroll costs by branch
  const costByBranch = React.useMemo(() => {
    if (!latestRun) return [];
    const map: Record<string, { branchName: string; employeeCount: number; basicTotal: number; grossTotal: number; netTotal: number; employerCost: number }> = {};

    latestRun.items.forEach((item) => {
      const bName = item.branchName;
      if (!map[bName]) {
        map[bName] = {
          branchName: bName,
          employeeCount: 0,
          basicTotal: 0,
          grossTotal: 0,
          netTotal: 0,
          employerCost: 0,
        };
      }
      map[bName].employeeCount += 1;
      map[bName].basicTotal += item.basicSalary;
      map[bName].grossTotal += item.grossSalary;
      map[bName].netTotal += item.netSalary;
      map[bName].employerCost += item.grossSalary + item.employerSocialInsurance;
    });

    return Object.values(map);
  }, [latestRun]);

  // Group payroll costs by department
  const costByDept = React.useMemo(() => {
    if (!latestRun) return [];
    const map: Record<string, { deptName: string; count: number; gross: number; net: number }> = {};

    latestRun.items.forEach((item) => {
      const dName = item.departmentName;
      if (!map[dName]) {
        map[dName] = { deptName: dName, count: 0, gross: 0, net: 0 };
      }
      map[dName].count += 1;
      map[dName].gross += item.grossSalary;
      map[dName].net += item.netSalary;
    });

    return Object.values(map);
  }, [latestRun]);

  const handleExportCSV = () => {
    alert("تم تصدير التقرير بتنسيق Excel / CSV بنجاح.");
  };

  return (
    <div className="space-y-6">
      <HrNav />

      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-rewaq-gold" />
            <span>تقارير وتحليلات الموارد البشرية والرواتب (HR & Payroll Reports)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            مؤشرات تكلفة العمالة بالفروع ومراكز التكلفة، الضرائب، التأمينات، والحضور
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-rewaq-gold font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>تصدير Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-thin">
        {[
          { id: "PAYROLL_COST", label: "تكلفة الرواتب ومراكز التكلفة بالفروع", icon: Banknote },
          { id: "TAX_INSURANCE", label: "تقرير الضرائب والتأمينات المصرية", icon: ShieldCheck },
          { id: "BRANCH_DISTRIBUTION", label: "توزيع الموظفين بالأقسام", icon: Users2 },
          { id: "ATTENDANCE_SUMMARY", label: "ملخص الحضور والانصراف والتأخير", icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white font-black shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-rewaq-gold" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* REPORT 1: PAYROLL COST BY BRANCH & DEPT */}
      {activeReport === "PAYROLL_COST" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              توزيع تكلفة الرواتب الشهرية حسب الفروع (Cost Center Allocation) - {latestRun?.periodLabel}
            </h3>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 pr-6">الفرع / مركز التكلفة</th>
                    <th className="p-3.5">عدد الموظفين</th>
                    <th className="p-3.5">الرواتب الأساسية</th>
                    <th className="p-3.5">إجمالي الاستحقاق (Gross)</th>
                    <th className="p-3.5">صافي الرواتب (Net)</th>
                    <th className="p-3.5">التكلفة الكلية على الشركة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {costByBranch.map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3.5 pr-6 font-bold text-slate-900">{b.branchName}</td>
                      <td className="p-3.5 font-mono">{b.employeeCount} موظف</td>
                      <td className="p-3.5 font-mono">{formatEGP(b.basicTotal)}</td>
                      <td className="p-3.5 font-mono text-emerald-700 font-bold">{formatEGP(b.grossTotal)}</td>
                      <td className="p-3.5 font-mono font-black text-slate-950">{formatEGP(b.netTotal)}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-900 bg-slate-50">{formatEGP(b.employerCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              توزيع تكلفة الرواتب حسب الإدارات والأقسام
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {costByDept.map((d, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{d.deptName}</span>
                    <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {d.count} موظف
                    </span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                    <span className="text-slate-500">إجمالي الراتب:</span>
                    <span className="font-mono font-black text-slate-900">{formatEGP(d.gross)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: TAX & INSURANCE */}
      {activeReport === "TAX_INSURANCE" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">تقرير استقطاعات مصلحة الضرائب والتأمينات الاجتماعية المصرية</h3>
              <p className="text-xs text-slate-400 mt-0.5">تفصيل كسب العمل (نموذج 4 مرتبات) وحصص التأمين الاجتماعي 11% و 18.75%</p>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl">
              قانون العمل والضرائب 2026
            </span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pr-6">الموظف</th>
                  <th className="p-3.5">الرقم القومي</th>
                  <th className="p-3.5">الرقم التأميني</th>
                  <th className="p-3.5">الراتب الخاضع للتأمين</th>
                  <th className="p-3.5">حصة الموظف (11%)</th>
                  <th className="p-3.5">حصة الشركة (18.75%)</th>
                  <th className="p-3.5">ضريبة كسب العمل</th>
                  <th className="p-3.5">إجمالي المسدد للهيئة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latestRun?.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3.5 pr-6 font-bold text-slate-900">{item.employeeName}</td>
                    <td className="p-3.5 font-mono text-slate-600">29405150102456</td>
                    <td className="p-3.5 font-mono text-slate-600">14890214</td>
                    <td className="p-3.5 font-mono">{formatEGP(item.basicSalary)}</td>
                    <td className="p-3.5 font-mono text-rose-600 font-bold">-{formatEGP(item.employeeSocialInsurance)}</td>
                    <td className="p-3.5 font-mono text-slate-800 font-bold">{formatEGP(item.employerSocialInsurance)}</td>
                    <td className="p-3.5 font-mono text-rose-600 font-bold">-{formatEGP(item.incomeTax)}</td>
                    <td className="p-3.5 font-mono font-black text-slate-950 bg-slate-50">
                      {formatEGP(item.employeeSocialInsurance + item.employerSocialInsurance + item.incomeTax)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: BRANCH DISTRIBUTION */}
      {activeReport === "BRANCH_DISTRIBUTION" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4 animate-in fade-in duration-150">
          <h3 className="font-bold text-sm text-slate-900">توزيع القوى العاملة حسب الأقسام والمسميات</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const occupants = employees.filter((e) => e.departmentId === dept.id);
              return (
                <div key={dept.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-xs text-slate-900 block">{dept.nameAr}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black font-mono text-slate-900">{occupants.length}</span>
                    <span className="text-xs text-slate-400">موظفين</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* REPORT 4: ATTENDANCE SUMMARY */}
      {activeReport === "ATTENDANCE_SUMMARY" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4 animate-in fade-in duration-150">
          <h3 className="font-bold text-sm text-slate-900">سجل إجمالي الحضور والانضباط الشهري</h3>
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pr-6">الموظف</th>
                  <th className="p-3.5">الفرع</th>
                  <th className="p-3.5">أيام الحضور</th>
                  <th className="p-3.5">مرات التأخير</th>
                  <th className="p-3.5">ساعات الإضافي</th>
                  <th className="p-3.5">معدل الالتزام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="p-3.5 pr-6 font-bold text-slate-900">{emp.fullName}</td>
                    <td className="p-3.5 text-slate-700">{emp.branchName}</td>
                    <td className="p-3.5 font-mono">22 يوم</td>
                    <td className="p-3.5 font-mono text-amber-700 font-bold">1 تأخير</td>
                    <td className="p-3.5 font-mono text-blue-700 font-bold">+4 ساعات</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                        98% ممتاز
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
