"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Plus,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  Sparkles,
  Search,
  Filter,
  ArrowUpRight,
  Building,
  User,
} from "lucide-react";
import PurchasingNav from "@/components/purchasing/PurchasingNav";
import { usePurchasing } from "@/context/PurchasingContext";
import { formatEGP } from "@/lib/accountingEngine";
import CreatePurchaseRequestModal from "@/components/purchasing/CreatePurchaseRequestModal";
import { PurchaseRequest } from "@/types/purchasing";

export default function PurchaseRequestsPage() {
  const {
    purchaseRequests,
    approvePurchaseRequest,
    rejectPurchaseRequest,
    convertPRToPO,
  } = usePurchasing();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(null);
  const [rejectReasonPrompt, setRejectReasonPrompt] = useState<string | null>(null);
  const [customRejectReason, setCustomRejectReason] = useState("");

  const filteredPRs = purchaseRequests.filter((pr) => {
    const matchesStatus = statusFilter === "ALL" || pr.status === statusFilter;
    const matchesSearch =
      pr.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleConvert = (prId: string) => {
    convertPRToPO(prId, "أحمد سمير (المدير العام)");
  };

  const handleReject = (prId: string) => {
    if (!customRejectReason.trim()) return;
    rejectPurchaseRequest(prId, "أحمد سمير", customRejectReason);
    setRejectReasonPrompt(null);
    setCustomRejectReason("");
  };

  return (
    <div className="space-y-6">
      <PurchasingNav onOpenCreatePR={() => setIsCreateOpen(true)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>المشتريات</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">طلبات الشراء الداخلية (PR)</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            طلبات الشراء والاحتياجات الداخلية (Purchase Requests)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            يقدم مسؤولو المعارض والمستودعات طلبات الاحتياج لاعتمادها وتحويلها إلى أوامر شراء رسمية (POs).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ تقديم طلب شراء جديد</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم الطلب، الطالب، أو الصنف..."
              className="w-64 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-rewaq-gold"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="SUBMITTED">⏳ بانتظار الاعتماد (Submitted)</option>
            <option value="APPROVED">✅ معتمد (Approved)</option>
            <option value="CONVERTED_TO_PO">📦 تم التحويل لأمر توريد (Converted)</option>
            <option value="REJECTED">❌ مرفوض (Rejected)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-bold">
          إجمالي الطلبات: <strong className="text-slate-900 font-black">{purchaseRequests.length}</strong>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPRs.map((pr) => {
          let statusBadge = (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
              مسودة
            </span>
          );

          if (pr.status === "SUBMITTED") {
            statusBadge = (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                بانتظار الاعتماد
              </span>
            );
          } else if (pr.status === "APPROVED") {
            statusBadge = (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                ✅ معتمد (جاهز للتحويل إلى PO)
              </span>
            );
          } else if (pr.status === "CONVERTED_TO_PO") {
            statusBadge = (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                📦 تم تحويله إلى أمر شراء {pr.convertedPoNumber}
              </span>
            );
          } else if (pr.status === "REJECTED") {
            statusBadge = (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                ❌ مرفوض
              </span>
            );
          }

          return (
            <div
              key={pr.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {pr.requestNumber}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {pr.requestedAt}
                    </span>
                  </div>
                  {statusBadge}
                </div>

                {/* Requester & Department */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>مقدم الطلب: <strong>{pr.requestedBy}</strong> ({pr.branchName})</span>
                  </div>
                  {pr.reasonDetails && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl">
                      {pr.reasonDetails}
                    </p>
                  )}
                </div>

                {/* Items List */}
                <div className="space-y-1.5 border-t border-slate-100 pt-2 text-xs">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    الأصناف المطلوبة ({pr.items.length} أصناف):
                  </span>
                  {pr.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-slate-50 p-2 rounded-xl"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{item.productName}</p>
                        <span className="text-[10px] text-slate-500">
                          الكمية المطلوبة: {item.quantity} وحدة
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {formatEGP(item.estimatedTotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions & Totals */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">إجمالي القيمة التقديرية:</span>
                  <span className="font-mono font-black text-sm text-slate-900">
                    {formatEGP(pr.totalEstimatedAmount)}
                  </span>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  {pr.status === "SUBMITTED" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setRejectReasonPrompt(pr.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition"
                      >
                        رفض الطلب
                      </button>
                      <button
                        type="button"
                        onClick={() => approvePurchaseRequest(pr.id, "أحمد سمير")}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition"
                      >
                        اعتماد الطلب
                      </button>
                    </>
                  )}

                  {pr.status === "APPROVED" && (
                    <button
                      type="button"
                      onClick={() => handleConvert(pr.id)}
                      className="px-4 py-2 rounded-xl text-xs font-black bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      تحويل إلى أمر شراء (PO) فوري
                    </button>
                  )}

                  {pr.status === "CONVERTED_TO_PO" && pr.convertedPoId && (
                    <Link
                      href={`/dashboard/purchasing/orders`}
                      className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>عرض أمر الشراء #{pr.convertedPoNumber}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reject Prompt Modal */}
      {rejectReasonPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-900">
              تأكيد رفض طلب الشراء
            </h3>
            <p className="text-xs text-slate-500">
              يرجى توضيح سبب الرفض ليظهر للموظف الطالب:
            </p>
            <input
              type="text"
              value={customRejectReason}
              onChange={(e) => setCustomRejectReason(e.target.value)}
              placeholder="مثال: يوجد مخزون كافٍ بمستودع أكتوبر يمكن تحويله..."
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rewaq-gold"
              required
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectReasonPrompt(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleReject(rejectReasonPrompt)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create PR Modal */}
      {isCreateOpen && (
        <CreatePurchaseRequestModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
    </div>
  );
}
