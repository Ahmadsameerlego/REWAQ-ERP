"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users2,
  Search,
  Filter,
  Plus,
  Building,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowLeft,
  LayoutGrid,
  List,
  Eye,
  Edit,
  UserCheck,
} from "lucide-react";
import HrNav from "@/components/hr/HrNav";
import CreateEmployeeModal from "@/components/hr/CreateEmployeeModal";
import SalaryChangeModal from "@/components/hr/SalaryChangeModal";
import { useHR } from "@/context/HRContext";
import { Employee, EmployeeStatus } from "@/types/hr";
import { formatEGP } from "@/lib/hrEngine";

export default function EmployeesPage() {
  const { employees, departments } = useHR();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [salaryChangeEmployee, setSalaryChangeEmployee] = useState<Employee | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBranch, setFilterBranch] = useState("ALL");
  const [filterDept, setFilterDept] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

  const filteredEmployees = employees.filter((emp) => {
    if (filterBranch !== "ALL" && emp.branchId !== filterBranch) return false;
    if (filterDept !== "ALL" && emp.departmentId !== filterDept) return false;
    if (filterStatus !== "ALL" && emp.status !== filterStatus) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = emp.fullName.toLowerCase().includes(q);
      const matchCode = emp.employeeCode.toLowerCase().includes(q);
      const matchPhone = emp.phone.includes(q);
      const matchNID = emp.nationalId.includes(q);
      if (!matchName && !matchCode && !matchPhone && !matchNID) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <HrNav onOpenEmployeeModal={() => setIsCreateModalOpen(true)} />

      {/* Header & Filter Row */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Users2 className="w-5 h-5 text-rewaq-gold" />
              <span>دليل الموظفين وشؤون العاملين (Employee Directory)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              إدارة بيانات {employees.length} موظف عبر كافة فروع ومعارض ومصانع المنظومة
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode("GRID")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "GRID" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-400 hover:text-slate-700"
                }`}
                title="عرض بطاقات"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("TABLE")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "TABLE" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-400 hover:text-slate-700"
                }`}
                title="عرض جدول"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة موظف جديد</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* Global Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="بحث بالاسم، الكود، الهاتف، أو الرقم القومي..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-rewaq-gold"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="ALL">كل الفروع ({employees.length})</option>
              <option value="branch-cairo">فرع التجمع الرئيسي</option>
              <option value="branch-october">فرع 6 أكتوبر</option>
              <option value="branch-tanta">فرع طنطا</option>
              <option value="branch-damietta">مستودع ومصنع دمياط</option>
              <option value="all-branches">الإدارة العامة</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="ALL">كل الأقسام</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="ALL">كل الحالات</option>
              <option value="ACTIVE">نشط وعلى رأس العمل</option>
              <option value="PROBATION">تحت الاختبار</option>
              <option value="ON_LEAVE">في إجازة</option>
              <option value="TERMINATED">منتهي الخدمة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Grid View */}
      {viewMode === "GRID" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Card Top: Avatar, Name & Code */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-rewaq-gold font-bold text-base flex items-center justify-center border border-slate-800">
                      {emp.avatarUrl ? (
                        <img src={emp.avatarUrl} alt={emp.fullName} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <span>{emp.fullName.slice(0, 2)}</span>
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/hr/employees/${emp.id}`}
                        className="font-bold text-sm text-slate-900 hover:text-rewaq-gold-dark transition block"
                      >
                        {emp.fullName}
                      </Link>
                      <span className="text-xs text-slate-500 block">{emp.positionTitle}</span>
                      <span className="text-[10px] font-mono text-slate-400">{emp.employeeCode}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      emp.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : emp.status === "PROBATION"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : emp.status === "ON_LEAVE"
                        ? "bg-blue-50 text-blue-800 border border-blue-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {emp.status === "ACTIVE"
                      ? "نشط"
                      : emp.status === "PROBATION"
                      ? "فترة اختبار"
                      : emp.status === "ON_LEAVE"
                      ? "إجازة"
                      : "منتهي"}
                  </span>
                </div>

                {/* Details Pills */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">الفرع:</span>
                    <span className="font-bold text-slate-800">{emp.branchName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">القسم:</span>
                    <span className="text-slate-800">{emp.departmentName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">الهاتف:</span>
                    <span className="font-mono text-slate-800">{emp.phone}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-400">الراتب الأساسي:</span>
                    <span className="font-mono font-black text-slate-900">{formatEGP(emp.basicSalary)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSalaryChangeEmployee(emp)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-emerald-700 transition"
                  title="تعديل الراتب وحفظ التاريخ"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تعديل راتب</span>
                </button>

                <Link
                  href={`/dashboard/hr/employees/${emp.id}`}
                  className="inline-flex items-center gap-1 text-xs font-black text-slate-950 hover:text-rewaq-gold-dark bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
                >
                  <span>الملف الشامل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pr-6">الموظف</th>
                  <th className="p-3.5">الفرع والقسم</th>
                  <th className="p-3.5">المسمى الوظيفي</th>
                  <th className="p-3.5">الهاتف</th>
                  <th className="p-3.5">الراتب الأساسي</th>
                  <th className="p-3.5">طريقة الصرف</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 pr-6">
                      <div className="font-bold text-slate-900">{emp.fullName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{emp.employeeCode} - تعيين {emp.hireDate}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-800">{emp.branchName}</div>
                      <div className="text-[10px] text-slate-400">{emp.departmentName}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">{emp.positionTitle}</td>
                    <td className="p-3.5 font-mono text-slate-700">{emp.phone}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">{formatEGP(emp.basicSalary)}</td>
                    <td className="p-3.5 text-slate-600">
                      {emp.paymentMethod === "BANK_TRANSFER"
                        ? "تحويل بنكي"
                        : emp.paymentMethod === "INSTAPAY"
                        ? "إنستاباي"
                        : "نقداً"}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {emp.status === "ACTIVE" ? "نشط" : "تحت الاختبار"}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <Link
                        href={`/dashboard/hr/employees/${emp.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 hover:text-rewaq-gold bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg transition"
                      >
                        <Eye className="w-3 h-3" />
                        <span>عرض الملف</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateEmployeeModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <SalaryChangeModal
        isOpen={Boolean(salaryChangeEmployee)}
        onClose={() => setSalaryChangeEmployee(undefined)}
        employee={salaryChangeEmployee}
      />
    </div>
  );
}
