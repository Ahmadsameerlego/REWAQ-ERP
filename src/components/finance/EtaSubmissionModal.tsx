"use client";

import React, { useState } from "react";
import {
  FileCheck,
  X,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ShieldCheck,
  QrCode,
  Copy,
  ExternalLink,
  RefreshCw,
  Code2,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { EtaInvoiceRecord } from "@/types/finance";
import { formatEGP } from "@/lib/accountingEngine";

interface EtaSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: EtaInvoiceRecord | null;
}

export default function EtaSubmissionModal({
  isOpen,
  onClose,
  invoice,
}: EtaSubmissionModalProps) {
  const { submitInvoiceToETA, retryEtaSubmission } = useFinance();
  const [activeTab, setActiveTab] = useState<"DETAILS" | "JSON_PAYLOAD">("DETAILS");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen || !invoice) return null;

  const handleLiveSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      if (invoice.etaStatus === "REJECTED") {
        retryEtaSubmission(invoice.id);
        setSubmitFeedback({
          success: true,
          message: "تم تصحيح أكواد الأصناف وإعادة إرسال الفاتورة بنجاح لمنظومة الضرائب المصرية (ETA).",
        });
      } else {
        const result = submitInvoiceToETA(invoice.id);
        setSubmitFeedback(result);
      }
      setIsSubmitting(false);
    }, 800);
  };

  const etaJsonPayload = {
    issuer: {
      address: {
        branchID: "0",
        country: "EG",
        governate: "Cairo",
        regionCity: "New Cairo",
        streetName: "North 90th Street",
        buildingNumber: "14B",
      },
      type: "B",
      id: "614829103", // Rewaq Company Tax ID
      name: "شركة رِواق للأثاث والديكور والتجارة (ش.ذ.م.م)",
    },
    receiver: {
      address: {
        country: "EG",
        regionCity: invoice.receiverAddress || "القاهرة",
      },
      type: invoice.receiverType,
      id: invoice.receiverTaxId || "N/A",
      name: invoice.receiverName,
    },
    documentType: invoice.documentType,
    documentTypeVersion: "1.0",
    dateTimeIssued: invoice.dateTimeIssued,
    taxpayerActivityCode: "3100", // Furniture Manufacture & Retail
    internalID: invoice.internalId,
    invoiceLines: invoice.lines.map((l, idx) => ({
      description: l.description,
      itemType: l.itemType,
      itemCode: l.itemCode,
      unitType: l.unitType,
      quantity: l.quantity,
      unitValue: {
        currencySold: "EGP",
        amountEGP: l.unitPrice,
      },
      salesTotal: l.salesTotal,
      discount: {
        rate: 0,
        amount: l.discount,
      },
      netTotal: l.netTotal,
      taxableItems: [
        {
          taxType: "T1",
          amount: l.taxAmount,
          subType: "V009",
          rate: l.taxRate * 100,
        },
      ],
      total: l.total,
    })),
    totalSalesAmount: invoice.totalSalesAmount,
    totalDiscountAmount: invoice.totalDiscountAmount,
    netAmount: invoice.netAmount,
    taxTotals: [
      {
        taxType: "T1",
        amount: invoice.taxAmount,
      },
    ],
    totalAmount: invoice.totalAmount,
    signatures: [
      {
        signatureType: "I",
        value: invoice.signatureToken || "PENDING_DIGITAL_TOKEN",
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rewaq-gold text-slate-950 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black">مصلحة الضرائب المصرية | فحص الفاتورة الإلكترونية</h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    invoice.etaStatus === "VALID"
                      ? "bg-emerald-500 text-slate-950 font-black"
                      : invoice.etaStatus === "REJECTED"
                      ? "bg-rose-500 text-white"
                      : "bg-amber-500 text-slate-950"
                  }`}
                >
                  {invoice.etaStatus === "VALID"
                    ? "معتمدة وصحيحة (VALID)"
                    : invoice.etaStatus === "REJECTED"
                    ? "مرفوضة (REJECTED)"
                    : "قيد الإرسال (PENDING)"}
                </span>
              </div>
              <p className="text-[10px] text-slate-300">
                رقم داخلي: {invoice.internalId} | نوع المستند: {invoice.documentTypeName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 border-b border-slate-200 bg-slate-50 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setActiveTab("DETAILS")}
            className={`pb-2 text-xs font-black transition border-b-2 cursor-pointer ${
              activeTab === "DETAILS"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            بيانات الفاتورة والضرائب (14% VAT)
          </button>

          <button
            onClick={() => setActiveTab("JSON_PAYLOAD")}
            className={`pb-2 text-xs font-black transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "JSON_PAYLOAD"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>حمولة JSON لمصلحة الضرائب (ETA Standard Schema)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {submitFeedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-bold flex items-start gap-2 ${
                submitFeedback.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              {submitFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{submitFeedback.message}</span>
            </div>
          )}

          {invoice.validationErrors.length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-rose-700">
                <AlertTriangle className="w-4 h-4" />
                <span>أسباب الرفض من منظومة الفواتير الإلكترونية:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-900 font-medium">
                {invoice.validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "DETAILS" ? (
            <div className="space-y-4">
              {/* ETA Unique UUID & Signature Bar */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">الرقم التعريفي الموحد (ETA UUID):</span>
                  <span className="font-mono font-bold text-slate-900 select-all">
                    {invoice.uuid || "قيد التوليد عند الإرسال"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">حالة التوقيع الإلكتروني (Digital Signature):</span>
                  <span className="font-bold flex items-center gap-1 text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    موقعة إلكترونياً برقم تعريف مصرح
                  </span>
                </div>
              </div>

              {/* Taxpayer & Receiver Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">بيانات البائع (رِواق):</span>
                  <p className="font-bold text-slate-900">شركة رِواق لتجارة وصناعة الأثاث</p>
                  <p className="text-slate-500 font-mono mt-0.5">رقم التسجيل: 614-829-103</p>
                  <p className="text-slate-500 mt-0.5">كود النشاط: 3100 (أثاث ومفروشات)</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">بيانات المشتري (العميل):</span>
                  <p className="font-bold text-slate-900">{invoice.receiverName}</p>
                  <p className="text-slate-500 font-mono mt-0.5">
                    {invoice.receiverType === "B" ? "رقم ضريبي: " : "رقم قومي: "}
                    {invoice.receiverTaxId || "غير محدد"}
                  </p>
                  <p className="text-slate-500 mt-0.5">{invoice.receiverAddress || "القاهرة"}</p>
                </div>
              </div>

              {/* Line items table with GS1/EGS codes */}
              <div>
                <h4 className="text-xs font-black text-slate-900 mb-2">بنود الفاتورة والأكواد السلعية:</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                      <tr>
                        <th className="p-2">الصنف</th>
                        <th className="p-2">كود السلعة (EGS/GS1)</th>
                        <th className="p-2">الكمية</th>
                        <th className="p-2">السعر</th>
                        <th className="p-2">ق.م 14%</th>
                        <th className="p-2">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {invoice.lines.map((l, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium text-slate-900">{l.description}</td>
                          <td className="p-2 font-mono text-[11px] text-slate-600 font-bold">{l.itemCode}</td>
                          <td className="p-2 font-mono">{l.quantity}</td>
                          <td className="p-2 font-mono">{formatEGP(l.unitPrice)}</td>
                          <td className="p-2 font-mono font-bold text-emerald-700">{formatEGP(l.taxAmount)}</td>
                          <td className="p-2 font-mono font-bold text-slate-900">{formatEGP(l.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Totals */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 block">صافي الفاتورة قبل الضريبة:</span>
                  <span className="text-sm font-bold font-mono">{formatEGP(invoice.netAmount)}</span>
                </div>

                <div>
                  <span className="text-[10px] text-rewaq-gold block">ضريبة القيمة المضافة (14%):</span>
                  <span className="text-sm font-black text-rewaq-gold font-mono">{formatEGP(invoice.taxAmount)}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">إجمالي الفاتورة النهائي:</span>
                  <span className="text-base font-black text-white font-mono">{formatEGP(invoice.totalAmount)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-[380px] border border-slate-800" dir="ltr">
                {JSON.stringify(etaJsonPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            {invoice.qrCodeUrl && (
              <a
                href={invoice.qrCodeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-rewaq-gold-dark transition"
              >
                <QrCode className="w-4 h-4" />
                <span>معاينة الإشعار على بوابة الضرائب</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              إغلاق
            </button>

            {invoice.etaStatus !== "VALID" && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleLiveSubmit}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition cursor-pointer"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <FileCheck className="w-4 h-4" />
                )}
                <span>
                  {invoice.etaStatus === "REJECTED" ? "تصحيح الأكواد وإعادة الإرسال" : "إرسال واعتماد بمصلحة الضرائب"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
