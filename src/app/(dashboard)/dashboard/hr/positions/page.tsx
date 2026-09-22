"use client";

import React, { useState } from "react";
import { Briefcase, Plus, Users2, X } from "lucide-react";
import HrNav from "@/components/hr/HrNav";
import { useHR } from "@/context/HRContext";
import { Position } from "@/types/hr";
import { formatEGP } from "@/lib/hrEngine";

export default function PositionsPage() {
  const { positions, addPosition, departments, employees } = useHR();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: `POS-0${positions.length + 1}`,
    titleAr: "",
    titleEn: "",
    departmentId: departments[0]?.id || "dept-sales",
    departmentName: departments[0]?.nameAr || "إدارة مبيعات الصالات والمعارض",
    minSalary: 8000,
    maxSalary: 15000,
    status: "ACTIVE" as const,
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleAr) return;
    const dept = departments.find((d) => d.id === formData.departmentId);
    addPosition({
      ...formData,
      departmentName: dept ? dept.nameAr : formData.departmentName,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <HrNav />

      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-rewaq-gold" />
            <span>دليل الوظائف والدرجات المهنية (Positions & Job Titles)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تحديد المسميات الوظيفية، الأقسام التابعة، ونطاقات الرواتب المقترحة
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مسمى وظيفي</span>
        </button>
      </div>

      {/* Positions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 pr-6">كود الوظيفة</th>
                <th className="p-3.5">المسمى الوظيفي (عربي / إنجليزي)</th>
                <th className="p-3.5">القسم التابع</th>
                <th className="p-3.5">نطاق الراتب المقترح</th>
                <th className="p-3.5">شاغلو الوظيفة</th>
                <th className="p-3.5">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {positions.map((pos) => {
                const occupants = employees.filter((e) => e.positionId === pos.id);
                return (
                  <tr key={pos.id} className="hover:bg-slate-50">
                    <td className="p-3.5 pr-6 font-mono font-bold text-slate-900">{pos.code}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{pos.titleAr}</div>
                      <div className="text-[10px] font-mono text-slate-400">{pos.titleEn}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">{pos.departmentName}</td>
                    <td className="p-3.5 font-mono text-slate-700">
                      {pos.minSalary && pos.maxSalary ? (
                        <span>
                          {formatEGP(pos.minSalary)} - {formatEGP(pos.maxSalary)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold font-mono bg-slate-100 px-2 py-0.5 rounded-md text-slate-800">
                        {occupants.length} موظف
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                        نشط
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">إضافة مسمى وظيفي جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">المسمى بالعربية *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مسؤول مبيعات هاتفية (Telesales)"
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المسمى بالإنجليزية</label>
                <input
                  type="text"
                  placeholder="e.g. Telesales Representative"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">القسم التابع له *</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الحد الأدنى للراتب (ج.م)</label>
                  <input
                    type="number"
                    value={formData.minSalary}
                    onChange={(e) => setFormData({ ...formData, minSalary: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الحد الأقصى للراتب (ج.م)</label>
                  <input
                    type="number"
                    value={formData.maxSalary}
                    onChange={(e) => setFormData({ ...formData, maxSalary: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-500 font-bold">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black">
                  حفظ المسمى
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
