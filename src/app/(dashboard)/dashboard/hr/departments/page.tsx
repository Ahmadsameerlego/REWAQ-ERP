"use client";

import React, { useState } from "react";
import { Building2, Plus, Users2, MapPin, CheckCircle2, X } from "lucide-react";
import HrNav from "@/components/hr/HrNav";
import { useHR } from "@/context/HRContext";
import { Department } from "@/types/hr";

export default function DepartmentsPage() {
  const { departments, addDepartment, employees } = useHR();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: `D-0${departments.length + 1}`,
    nameAr: "",
    nameEn: "",
    branchId: "branch-cairo",
    branchName: "فرع التجمع الرئيسي",
    managerName: "أحمد سمير",
    costCenterId: "cc-cairo",
    status: "ACTIVE" as const,
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr) return;
    addDepartment(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <HrNav />

      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-rewaq-gold" />
            <span>إدارة الهيكل الإداري والأقسام (Departments)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تنظيم الإدارات وتوزيع الموظفين ومراكز التكلفة المحاسبية بالفروع
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const deptEmployees = employees.filter((e) => e.departmentId === dept.id);
          return (
            <div
              key={dept.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 font-black text-xs font-mono">
                      {dept.code}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{dept.nameAr}</h3>
                      <span className="text-[11px] text-slate-400 font-mono block">{dept.nameEn}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                    نشط
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">{dept.description || "قسم تشغيلي بالمنظومة"}</p>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">الفرع التابع:</span>
                    <span className="font-bold text-slate-800">{dept.branchName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">المدير المسؤول:</span>
                    <span className="font-bold text-slate-800">{dept.managerName || "أحمد سمير"}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-400">عدد الموظفين:</span>
                    <span className="font-mono font-bold text-slate-900">{deptEmployees.length} موظف</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">إضافة قسم جديد للهيكل الإداري</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم القسم (عربي) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: إدارة التسويق والعلاقات العامة"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم بالإنجليزية</label>
                <input
                  type="text"
                  placeholder="Marketing & Public Relations"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الفرع المرتبط</label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="branch-cairo">فرع التجمع الخامس (الرئيسي)</option>
                  <option value="branch-october">فرع 6 أكتوبر (المول)</option>
                  <option value="branch-damietta">مستودع ومصنع دمياط</option>
                  <option value="ALL">كل الفروع مجمعة</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الوصف والمهام الرئيسية</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-500 font-bold">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black">
                  حفظ القسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
