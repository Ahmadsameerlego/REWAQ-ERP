"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  DollarSign,
  UserCheck,
  Phone,
  PenTool,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { DeliveryOrder, ProofOfDelivery } from "@/types/logistics";
import { useShowroom } from "@/context/ShowroomContext";

interface ProofOfDeliveryModalProps {
  delivery: DeliveryOrder | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ProofOfDeliveryModal({
  delivery,
  onClose,
  onSuccess,
}: ProofOfDeliveryModalProps) {
  if (!delivery) return null;

  const { completeDelivery } = useShowroom();

  const [deliveredAt, setDeliveredAt] = useState<string>(
    new Date().toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })
  );
  const [receivedBy, setReceivedBy] = useState<string>(delivery.customerName || "");
  const [receiverRelation, setReceiverRelation] = useState<string>("العميل نفسه");
  const [receiverPhone, setReceiverPhone] = useState<string>(delivery.customerPhone || "");
  const [codCollected, setCodCollected] = useState<number>(delivery.codAmount || 0);
  const [hasSignature, setHasSignature] = useState<boolean>(true);
  const [signatureName, setSignatureName] = useState<string>(delivery.customerName || "");
  const [notes, setNotes] = useState<string>("تم فحص واستلام كافة القطع بحالة ممتازة وبدون أي تلفيات");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pod: ProofOfDelivery = {
      deliveredAt,
      receivedBy,
      receiverRelation,
      receiverPhone,
      codCollected: Number(codCollected) || 0,
      hasSignature,
      signatureName: hasSignature ? signatureName : undefined,
      notes,
    };

    completeDelivery(delivery.id, pod);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden text-right">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                إثبات التسليم والتحصيل المالي (Proof of Delivery - POD)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                إذن شحن #{delivery.deliveryNumber} | العقد: #{delivery.contractNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1 text-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-bold">العميل المستهدف:</span>
              <span className="font-bold text-slate-900">{delivery.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold">العنوان:</span>
              <span className="text-slate-600">{delivery.deliveryAddress}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <span className="font-bold text-slate-900">المبلغ المطلوب تحصيله نقداً (COD):</span>
              <span className="font-mono font-black text-sm text-emerald-800">
                {delivery.codAmount.toLocaleString()} ج.م
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">اسم الشخص المستلم فعلياً:</label>
              <input
                type="text"
                required
                value={receivedBy}
                onChange={(e) => {
                  setReceivedBy(e.target.value);
                  if (hasSignature) setSignatureName(e.target.value);
                }}
                placeholder="اسم المستلم..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-rewaq-gold focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">صفة المستلم:</label>
              <select
                value={receiverRelation}
                onChange={(e) => setReceiverRelation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-rewaq-gold"
              >
                <option value="العميل نفسه">العميل نفسه (صاحب العقد)</option>
                <option value="الزوج / الزوجة">الزوج / الزوجة</option>
                <option value="أحد أفراد الأسرة">أحد أفراد الأسرة (ابن / والد)</option>
                <option value="مهندس الموقع / الديكور">مهندس الموقع / الديكور</option>
                <option value="حارس العقار / ممثل العميل">حارس العقار / ممثل العميل</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">المبلغ المحصل نقداً (COD):</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={codCollected}
                  onChange={(e) => setCodCollected(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-12 text-xs font-mono font-bold text-emerald-800 focus:outline-none focus:border-rewaq-gold focus:bg-white"
                />
                <span className="absolute left-3 top-2.5 text-[11px] font-bold text-slate-400">ج.م</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">هاتف المستلم:</label>
              <input
                type="text"
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-rewaq-gold focus:bg-white"
              />
            </div>
          </div>

          {/* Digital Signature Confirmation Box */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-slate-600" />
                التوقيع الإلكتروني للاستلام
              </span>
              <input
                type="checkbox"
                id="sigCheck"
                checked={hasSignature}
                onChange={(e) => setHasSignature(e.target.checked)}
                className="rounded text-rewaq-gold"
              />
            </div>

            {hasSignature && (
              <div className="space-y-1.5">
                <div className="h-14 bg-white border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 font-mono text-xs select-none">
                  [ تم التقاط التوقيع الرقمي للمستلم: {signatureName} ]
                </div>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="اسم الموقع ثلاثي..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">ملاحظات التسليم والتأكيد:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات تخص حالة القطع أو التركيب..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-rewaq-gold focus:bg-white"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2 rounded-xl transition cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>تأكيد التسليم وخصم المخزون والتحصيل</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
