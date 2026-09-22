"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  FileWarning,
  Wrench,
  PackageX,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { DeliveryOrder, DeliveryIssue } from "@/types/logistics";
import { useShowroom } from "@/context/ShowroomContext";

interface CreateIssueModalProps {
  delivery: DeliveryOrder | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateIssueModal({
  delivery,
  onClose,
  onSuccess,
}: CreateIssueModalProps) {
  if (!delivery) return null;

  const { addDeliveryIssue } = useShowroom();

  const [type, setType] = useState<DeliveryIssue["type"]>("DAMAGED");
  const [severity, setSeverity] = useState<DeliveryIssue["severity"]>("MEDIUM");
  const [description, setDescription] = useState<string>("");
  const [reportedBy, setReportedBy] = useState<string>(delivery.driverName || "مسؤول الشحن");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    addDeliveryIssue({
      deliveryId: delivery.id,
      deliveryNumber: delivery.deliveryNumber,
      contractNumber: delivery.contractNumber,
      customerName: delivery.customerName,
      customerPhone: delivery.customerPhone,
      type,
      severity,
      description,
      reportedBy,
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden text-right">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 text-rose-800 border border-rose-300 rounded-xl shadow-2xs">
              <FileWarning className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                تسجيل بلاغ مشكلة شحن / تركيب
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                شحنة #{delivery.deliveryNumber} | عقد: #{delivery.contractNumber}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">نوع المشكلة:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DeliveryIssue["type"])}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-rewaq-gold"
            >
              <option value="DAMAGED">تلف / خدش أثناء النقل أو التحميل (Damaged)</option>
              <option value="MISSING_ITEM">صنف أو ملحق ناقص (Missing Item)</option>
              <option value="WRONG_ITEM">صنف أو لون مختلف عن العقد (Wrong Item)</option>
              <option value="INSTALLATION_ISSUE">مشكلة في التركيب أو التجميع (Installation Issue)</option>
              <option value="ADDRESS_ISSUE">صعوبة في الوصول أو تفاصيل العنوان (Address Issue)</option>
              <option value="CUSTOMER_COMPLAINT">شكوى أو اعتراض من العميل (Customer Complaint)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">درجة الأهمية / الخطورة:</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "LOW", label: "بسيطة", color: "bg-slate-50 text-slate-700" },
                { id: "MEDIUM", label: "متوسطة", color: "bg-amber-50 text-amber-800 font-bold" },
                { id: "HIGH", label: "عالية", color: "bg-orange-50 text-orange-800 font-bold" },
                { id: "CRITICAL", label: "حرجة", color: "bg-rose-50 text-rose-800 font-black" },
              ].map((sev) => (
                <button
                  key={sev.id}
                  type="button"
                  onClick={() => setSeverity(sev.id as DeliveryIssue["severity"])}
                  className={`p-2 rounded-xl text-xs border text-center transition cursor-pointer ${
                    severity === sev.id
                      ? "border-slate-900 bg-slate-900 text-white font-black shadow-2xs"
                      : "border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {sev.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">وصف المشكلة بالتفصيل:</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب وصفاً دقيقاً لما تم رصده أو ملاحظة العميل..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-rewaq-gold focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">مقدم البلاغ:</label>
            <input
              type="text"
              required
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-rewaq-gold focus:bg-white"
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
              className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تسجيل البلاغ وربطه بالعقد</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
