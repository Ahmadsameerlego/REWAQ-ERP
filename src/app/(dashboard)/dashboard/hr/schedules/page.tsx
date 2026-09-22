"use client";

import React, { useState } from "react";
import { CalendarDays, Plus, Clock, CheckCircle2, X } from "lucide-react";
import HrNav from "@/components/hr/HrNav";
import { useHR } from "@/context/HRContext";
import { WorkSchedule } from "@/types/hr";

export default function SchedulesPage() {
  const { schedules, addSchedule, employees } = useHR();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "FIXED" as const,
    workDays: ["SUN", "MON", "TUE", "WED", "THU", "SAT"] as ("SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT")[],
    startTime: "09:00",
    endTime: "17:00",
    dailyHours: 8,
    gracePeriodMinutes: 15,
    overtimeAllowed: true,
    overtimeHourRateMultiplier: 1.35,
    weekendDays: ["FRI"] as ("SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT")[],
    isDefault: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    addSchedule(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <HrNav />

      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-rewaq-gold" />
            <span>مواعيد وجداول العمل (Work Schedules)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تحديد أوقات الحضور والانصراف، فترات السماح، والورديات الصباحية والمسائية
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة جدول دوام جديد</span>
        </button>
      </div>

      {/* Schedules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {schedules.map((sch) => {
          const assignedCount = employees.filter((e) => e.scheduleId === sch.id).length;
          return (
            <div
              key={sch.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{sch.name}</h3>
                    <span className="text-[11px] font-mono text-slate-400">{sch.code}</span>
                  </div>
                  {sch.isDefault && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rewaq-gold text-slate-950">
                      الافتراضي
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">مواعيد الدوام:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {sch.startTime} ⬅️ {sch.endTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ساعات العمل اليومية:</span>
                    <span className="font-mono font-bold text-slate-800">{sch.dailyHours} ساعات</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">فترة السماح عند التأخير:</span>
                    <span className="font-mono font-bold text-amber-700">{sch.gracePeriodMinutes} دقيقة</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">معدل الإضافي:</span>
                    <span className="font-mono font-bold text-blue-700">{sch.overtimeHourRateMultiplier}x الساعة</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-400">الموظفون المسند لهم:</span>
                    <span className="font-bold font-mono text-slate-900">{assignedCount} موظف</span>
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
              <h3 className="font-bold text-sm text-slate-900">إضافة جدول عمل جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم جدول الدوام *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: دوام فرع طنطا الصباحي"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">وقت الحضور</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">وقت الانصراف</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">دقائق السماح</label>
                  <input
                    type="number"
                    value={formData.gracePeriodMinutes}
                    onChange={(e) => setFormData({ ...formData, gracePeriodMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">معدل الإضافي (ساعة)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={formData.overtimeHourRateMultiplier}
                    onChange={(e) => setFormData({ ...formData, overtimeHourRateMultiplier: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-500 font-bold">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black">
                  حفظ الجدول
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
