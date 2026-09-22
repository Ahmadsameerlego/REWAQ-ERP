"use client";

import React, { useState } from "react";
import { Plane, Plus, CheckCircle2, XCircle, Clock, Calendar, Users2, ShieldCheck, Edit } from "lucide-react";
import HrNav from "@/components/hr/HrNav";
import RequestLeaveModal from "@/components/hr/RequestLeaveModal";
import { useHR } from "@/context/HRContext";

export default function LeavesPage() {
  const { leaveRequests, leaveBalances, approveLeaveRequest, rejectLeaveRequest, adjustLeaveBalance } = useHR();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"REQUESTS" | "BALANCES">("REQUESTS");

  return (
    <div className="space-y-6">
      <HrNav onOpenLeaveModal={() => setIsModalOpen(true)} />

      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Plane className="w-5 h-5 text-emerald-600" />
            <span>إدارة الإجازات وأرصدة الموظفين (Leaves & Balances)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تقديم طلبات الإجازة، مسار الاعتماد، وإدارة الأرصدة السنوية والعارضة
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab("REQUESTS")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "REQUESTS" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              طلبات الإجازة ({leaveRequests.length})
            </button>
            <button
              onClick={() => setActiveTab("BALANCES")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "BALANCES" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              أرصدة الموظفين ({leaveBalances.length})
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>تقديم طلب إجازة</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "REQUESTS" ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pr-6">رقم الطلب</th>
                  <th className="p-3.5">الموظف والقسم</th>
                  <th className="p-3.5">نوع الإجازة</th>
                  <th className="p-3.5">الفترة (من - إلى)</th>
                  <th className="p-3.5">عدد الأيام</th>
                  <th className="p-3.5">السبب وملاحظات الطلب</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 text-center">إجراءات الاعتماد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaveRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="p-3.5 pr-6 font-mono font-bold text-slate-900">{req.requestNumber}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block">{req.employeeName}</span>
                      <span className="text-[10px] text-slate-400">{req.departmentName}</span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">{req.leaveTypeName}</td>
                    <td className="p-3.5 font-mono">
                      {req.startDate} ⬅️ {req.endDate}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-800">{req.daysCount} أيام</td>
                    <td className="p-3.5 text-slate-600">{req.reason}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          req.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : req.status === "REJECTED"
                            ? "bg-rose-50 text-rose-800 border border-rose-200"
                            : "bg-amber-500 text-slate-950"
                        }`}
                      >
                        {req.status === "APPROVED" ? "معتمد" : req.status === "REJECTED" ? "مرفوض" : "بانتظار الموافقة"}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {req.status === "PENDING_APPROVAL" ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => approveLeaveRequest(req.id, "أحمد سمير")}
                            className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg transition"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>موافقة</span>
                          </button>
                          <button
                            onClick={() => rejectLeaveRequest(req.id, "أحمد سمير", "حاجة العمل القصوى")}
                            className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg transition"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>رفض</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">تم الاعتماد</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* BALANCES TABLE */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pr-6">الموظف</th>
                  <th className="p-3.5">نوع الإجازة</th>
                  <th className="p-3.5">السنة المالية</th>
                  <th className="p-3.5">الرصيد المستحق (Entitled)</th>
                  <th className="p-3.5">المستهلك (Used)</th>
                  <th className="p-3.5">الرصيد المتبقي (Remaining)</th>
                  <th className="p-3.5 text-center">تعديل الرصيد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaveBalances.map((bal) => (
                  <tr key={bal.id} className="hover:bg-slate-50">
                    <td className="p-3.5 pr-6 font-bold text-slate-900">{bal.employeeName}</td>
                    <td className="p-3.5 font-medium text-slate-800">{bal.leaveTypeName}</td>
                    <td className="p-3.5 font-mono text-slate-500">{bal.year}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">{bal.entitledDays} يوم</td>
                    <td className="p-3.5 font-mono text-slate-600">{bal.usedDays} يوم</td>
                    <td className="p-3.5 font-mono font-black text-emerald-700 text-sm">{bal.remainingDays} يوم</td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => {
                          const newEnt = prompt("أدخل الرصيد المستحق الجديد (أيام):", String(bal.entitledDays));
                          if (newEnt) {
                            adjustLeaveBalance(bal.id, { entitled: Number(newEnt) }, "أحمد سمير");
                          }
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg"
                      >
                        <Edit className="w-3 h-3" />
                        <span>تعديل يدوي</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <RequestLeaveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
