"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  Clock,
  Wrench,
  Search,
  Filter,
  Plus,
  Eye,
  CheckCheck,
  X,
} from "lucide-react";
import { useShowroom } from "@/context/ShowroomContext";
import { DeliveryIssue } from "@/types/logistics";
import LogisticsNav from "@/components/logistics/LogisticsNav";

export default function DeliveryIssuesPage() {
  const { deliveryIssues, resolveDeliveryIssue } = useShowroom();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [resolvingIssue, setResolvingIssue] = useState<DeliveryIssue | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>("");

  const filteredIssues = deliveryIssues.filter((issue) => {
    const matchesStatus = statusFilter === "ALL" || issue.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      issue.customerName.toLowerCase().includes(q) ||
      issue.deliveryNumber.toLowerCase().includes(q) ||
      issue.contractNumber.toLowerCase().includes(q) ||
      issue.description.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingIssue || !resolutionNotes.trim()) return;

    resolveDeliveryIssue(resolvingIssue.id, resolutionNotes);
    setResolvingIssue(null);
    setResolutionNotes("");
  };

  const getIssueTypeLabel = (type: DeliveryIssue["type"]) => {
    switch (type) {
      case "DAMAGED":
        return { label: "تلف / خدش أثناء النقل", badge: "bg-rose-50 text-rose-800 border-rose-200" };
      case "MISSING_ITEM":
        return { label: "صنف أو ملحق ناقص", badge: "bg-amber-50 text-amber-800 border-amber-200" };
      case "WRONG_ITEM":
        return { label: "صنف أو لون غير مطابق", badge: "bg-orange-50 text-orange-800 border-orange-200" };
      case "INSTALLATION_ISSUE":
        return { label: "مشكلة في التركيب", badge: "bg-blue-50 text-blue-800 border-blue-200" };
      case "ADDRESS_ISSUE":
        return { label: "صعوبة الوصول للعنوان", badge: "bg-purple-50 text-purple-800 border-purple-200" };
      case "CUSTOMER_COMPLAINT":
        return { label: "شكوى أو اعتراض عميل", badge: "bg-red-50 text-red-900 border-red-200" };
      default:
        return { label: type, badge: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <LogisticsNav />

      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">
            سجل مشاكل الشحن والتركيبات (Delivery Issues & Complaints)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            رصد بلاغات التلف والأخطاء ومعالجتها مع ربط فوري بالعقد والعميل والمستودع.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-rose-800 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
            {deliveryIssues.filter((i) => i.status !== "RESOLVED").length} بلاغات قيد المعالجة
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالعميل، الشحنة، أو وصف المشكلة..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-9 text-xs text-slate-800 focus:outline-none focus:border-rewaq-gold focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {[
            { id: "ALL", label: "كل البلاغات" },
            { id: "OPEN", label: "جديد (Open)" },
            { id: "INVESTIGATING", label: "قيد المتابعة" },
            { id: "RESOLVED", label: "تم الحل بنجاح" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === f.id
                  ? "bg-white text-slate-900 shadow-xs font-black"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="p-3.5">الشحنة والعقد</th>
                <th className="p-3.5">العميل والهاتف</th>
                <th className="p-3.5">نوع المشكلة</th>
                <th className="p-3.5">الخطورة</th>
                <th className="p-3.5">الوصف والتفاصيل</th>
                <th className="p-3.5">مقدم البلاغ</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs italic">
                    لا توجد بلاغات مسجلة
                  </td>
                </tr>
              ) : (
                filteredIssues.map((iss) => {
                  const typeInfo = getIssueTypeLabel(iss.type);
                  const isResolved = iss.status === "RESOLVED";

                  return (
                    <tr key={iss.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5">
                        <div className="font-mono font-black text-slate-900">#{iss.deliveryNumber}</div>
                        <div className="text-[10px] text-slate-400 font-mono">#{iss.contractNumber}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{iss.customerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{iss.customerPhone}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${typeInfo.badge}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            iss.severity === "CRITICAL"
                              ? "bg-rose-100 text-rose-900"
                              : iss.severity === "HIGH"
                              ? "bg-orange-100 text-orange-900"
                              : iss.severity === "MEDIUM"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {iss.severity}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <p className="text-slate-800 line-clamp-2 leading-relaxed">{iss.description}</p>
                        {iss.resolutionNotes && (
                          <div className="text-[10px] text-emerald-800 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200 mt-1">
                            <span className="font-bold">الحل:</span> {iss.resolutionNotes}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <div>{iss.reportedBy}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{iss.reportedAt}</div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                            isResolved
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : iss.status === "INVESTIGATING"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {isResolved ? "تم الحل ✅" : iss.status === "INVESTIGATING" ? "قيد المتابعة" : "جديد"}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {!isResolved ? (
                          <button
                            type="button"
                            onClick={() => {
                              setResolvingIssue(iss);
                              setResolutionNotes(iss.resolutionNotes || "");
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>تسجيل الحل</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">مغلق</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve Modal */}
      {resolvingIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl w-full max-w-md space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  إغلاق وحل المشكلة (#{resolvingIssue.deliveryNumber})
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  العميل: {resolvingIssue.customerName}
                </p>
              </div>
              <button onClick={() => setResolvingIssue(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-slate-700">
                <span className="font-bold block text-slate-900 mb-1">وصف البلاغ:</span>
                <p>{resolvingIssue.description}</p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">إجراء الحل المتخذ:</label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="مثال: تم إرسال فني صيانة ودهان القطعة / تم تسليم الملحق الناقص مع اعتذار رسمي..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setResolvingIssue(null)}
                  className="text-slate-500 font-bold px-3 py-2"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-2.5 rounded-xl shadow-xs"
                >
                  اعتماد حل البلاغ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
