"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { usePurchasing } from "@/context/PurchasingContext";
import { useShowroom } from "@/context/ShowroomContext";
import { formatEGP } from "@/lib/accountingEngine";

interface CreatePurchaseRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillProductId?: string;
  prefillQuantity?: number;
  prefillReason?: "LOW_STOCK" | "CONTRACT_DEMAND" | "CUSTOMER_SPECIAL_ORDER" | "SEASONAL_REPAIR" | "OTHER";
}

export default function CreatePurchaseRequestModal({
  isOpen,
  onClose,
  prefillProductId,
  prefillQuantity,
  prefillReason,
}: CreatePurchaseRequestModalProps) {
  const { createPurchaseRequest, suppliers, supplierProducts } = usePurchasing();
  const { products } = useShowroom();

  const [department, setDepartment] = useState<"SHOWROOM" | "WAREHOUSE" | "SALES" | "PROCUREMENT" | "PRODUCTION">("SHOWROOM");
  const [urgency, setUrgency] = useState<"NORMAL" | "HIGH" | "URGENT">("NORMAL");
  const [reason, setReason] = useState<"LOW_STOCK" | "CONTRACT_DEMAND" | "CUSTOMER_SPECIAL_ORDER" | "SEASONAL_REPAIR" | "OTHER">(prefillReason || "LOW_STOCK");
  const [reasonDetails, setReasonDetails] = useState("");
  const [requiredDate, setRequiredDate] = useState(
    new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0]
  );
  const [requestedBy, setRequestedBy] = useState("سامح الدسوقي (مسؤول الصالة)");
  const [isSuccess, setIsSuccess] = useState(false);

  const [items, setItems] = useState<Array<{
    productId: string;
    productName: string;
    category: string;
    quantity: number;
    estimatedUnitPrice: number;
    preferredSupplierId?: string;
    notes?: string;
  }>>([
    {
      productId: prefillProductId || products[0]?.id || "",
      productName: products.find((p) => p.id === prefillProductId)?.name || products[0]?.name || "",
      category: products.find((p) => p.id === prefillProductId)?.category || products[0]?.category || "",
      quantity: prefillQuantity || 5,
      estimatedUnitPrice: products.find((p) => p.id === prefillProductId)?.costPrice || products[0]?.costPrice || 15000,
      preferredSupplierId: suppliers[0]?.id || "",
    },
  ]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const firstProd = products[0];
    setItems((prev) => [
      ...prev,
      {
        productId: firstProd.id,
        productName: firstProd.name,
        category: firstProd.category,
        quantity: 1,
        estimatedUnitPrice: firstProd.costPrice || 10000,
        preferredSupplierId: suppliers[0]?.id || "",
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleProductChange = (idx: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const sp = supplierProducts.find((s) => s.productId === productId);
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            productId,
            productName: prod?.name || item.productName,
            category: prod?.category || item.category,
            estimatedUnitPrice: sp ? sp.purchasePrice : prod?.costPrice || item.estimatedUnitPrice,
          };
        }
        return item;
      })
    );
  };

  const handleFieldChange = (idx: number, field: string, val: any) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return { ...item, [field]: val };
        }
        return item;
      })
    );
  };

  const totalEstimated = items.reduce(
    (sum, it) => sum + Number(it.quantity) * Number(it.estimatedUnitPrice),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    createPurchaseRequest({
      branchId: "branch-cairo",
      branchName: "فرع التجمع الخامس",
      requestedBy,
      department,
      urgency,
      reason,
      reasonDetails,
      items: items.map((it, idx) => ({
        id: `pri-${Date.now()}-${idx}`,
        productId: it.productId,
        productName: it.productName,
        category: it.category,
        quantity: Number(it.quantity),
        estimatedUnitPrice: Number(it.estimatedUnitPrice),
        estimatedTotal: Number(it.quantity) * Number(it.estimatedUnitPrice),
        preferredSupplierId: it.preferredSupplierId,
        preferredSupplierName: suppliers.find((s) => s.id === it.preferredSupplierId)?.nameAr,
        notes: it.notes,
      })),
      requiredDate,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rewaq-gold/20 border border-rewaq-gold/40 flex items-center justify-center text-rewaq-gold font-bold">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black">طلب شراء داخلي جديد (PR)</h2>
              <p className="text-[11px] text-slate-300">
                طلب تعزيز مخزون صالة العرض أو توفير نواقص لعقود العملاء للاعتماد
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {isSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-black">تم إرسال طلب الشراء بنجاح!</p>
                <p className="text-[11px] text-emerald-700">
                  تم إدراج الطلب في قائمة الانتظار لعرضه على مدير المشتريات للاعتماد والتحويل إلى أمر توريد.
                </p>
              </div>
            </div>
          )}

          {/* Department & Reason Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                القسم / الجهة الطالبة:
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rewaq-gold"
              >
                <option value="SHOWROOM">صالة العرض والمبيعات</option>
                <option value="WAREHOUSE">المستودع الرئيسي</option>
                <option value="SALES">المبيعات الخارجية والمشاريع</option>
                <option value="PRODUCTION">المصنع وورش التجميع</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                سبب الاحتياج:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rewaq-gold"
              >
                <option value="LOW_STOCK">انخفاض المخزون عن حد الأمان</option>
                <option value="CONTRACT_DEMAND">تغطية عقود وحجوزات عملاء مؤكدة</option>
                <option value="CUSTOMER_SPECIAL_ORDER">طلب خاص / تفصيل لعميل</option>
                <option value="SEASONAL_REPAIR">تجديد معروضات الصالة</option>
                <option value="OTHER">أسباب تشغيلية أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                درجة الأهمية / الاستعجال:
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rewaq-gold"
              >
                <option value="NORMAL">عادي (جدول التوريد الدوري)</option>
                <option value="HIGH">هام (عقود وشيكة)</option>
                <option value="URGENT">عاجل جداً (نقص حرج يوقف التسليم)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              شرح تفصيلي لسبب الطلب والعملاء المرتبطين (إن وجد):
            </label>
            <textarea
              value={reasonDetails}
              onChange={(e) => setReasonDetails(e.target.value)}
              placeholder="مثال: يرجى التوريد سريعاً لتغطية عقد فيلا التجمع الخامس للعميل م. أحمد شوقي قبل نهاية الشهر..."
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold h-16"
            />
          </div>

          {/* Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">الأصناف والكميات المطلوبة:</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-300 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة صنف
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">الصنف</th>
                    <th className="p-3 w-24">الكمية</th>
                    <th className="p-3 w-32">السعر التقديري</th>
                    <th className="p-3 w-32">المورد المقترح</th>
                    <th className="p-3 w-12 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-2.5">
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-rewaq-gold"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.category})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleFieldChange(idx, "quantity", Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-center"
                          required
                        />
                      </td>
                      <td className="p-2.5 font-mono">
                        <input
                          type="number"
                          value={item.estimatedUnitPrice}
                          onChange={(e) => handleFieldChange(idx, "estimatedUnitPrice", Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold font-mono"
                          required
                        />
                      </td>
                      <td className="p-2.5">
                        <select
                          value={item.preferredSupplierId}
                          onChange={(e) => handleFieldChange(idx, "preferredSupplierId", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                        >
                          {suppliers.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nameAr}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length <= 1}
                          className={`p-1.5 rounded-lg transition ${
                            items.length <= 1
                              ? "text-slate-300 cursor-not-allowed"
                              : "text-rose-500 hover:bg-rose-50"
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl">
            <span className="text-xs font-bold text-slate-300">
              إجمالي القيمة التقديرية للطلب:
            </span>
            <span className="text-base font-black text-rewaq-gold font-mono">
              {formatEGP(totalEstimated)}
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 shadow-md transition cursor-pointer"
            >
              إرسال طلب الشراء للاعتماد
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
