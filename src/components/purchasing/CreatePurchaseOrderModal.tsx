"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Building,
  Calendar,
  DollarSign,
  Package,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { usePurchasing } from "@/context/PurchasingContext";
import { useShowroom } from "@/context/ShowroomContext";
import { PurchaseOrderItem, PaymentTermsType } from "@/types/purchasing";
import { formatEGP } from "@/lib/accountingEngine";

interface CreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillSupplierId?: string;
  prefillItems?: { productId: string; quantity: number }[];
}

export default function CreatePurchaseOrderModal({
  isOpen,
  onClose,
  prefillSupplierId,
  prefillItems,
}: CreatePurchaseOrderModalProps) {
  const { suppliers, supplierProducts, createPurchaseOrder } = usePurchasing();
  const { products, warehouses } = useShowroom();

  const [supplierId, setSupplierId] = useState(prefillSupplierId || suppliers[0]?.id || "");
  const [branchName, setBranchName] = useState("فرع التجمع الخامس");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || "wh-damietta-main");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermsType>("NET_30");
  const [notes, setNotes] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Line items state
  const [items, setItems] = useState<Array<{
    productId: string;
    productName: string;
    supplierSku: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
  }>>([]);

  // Initialize or prefill items
  useEffect(() => {
    if (prefillItems && prefillItems.length > 0) {
      const mapped = prefillItems.map((pi) => {
        const prod = products.find((p) => p.id === pi.productId);
        const sp = supplierProducts.find(
          (s) => s.productId === pi.productId && s.supplierId === supplierId
        );
        const unitPrice = sp ? sp.purchasePrice : prod?.costPrice || 15000;
        return {
          productId: pi.productId,
          productName: prod?.name || "صنف محدد",
          supplierSku: sp?.supplierSku || "SKU-AUTO",
          unit: prod?.unit || "قطعة",
          quantity: pi.quantity,
          unitPrice,
          discount: 0,
          taxRate: 0.14,
        };
      });
      setItems(mapped);
    } else if (items.length === 0 && products.length > 0) {
      const firstProd = products[0];
      const sp = supplierProducts.find(
        (s) => s.productId === firstProd.id && s.supplierId === supplierId
      );
      setItems([
        {
          productId: firstProd.id,
          productName: firstProd.name,
          supplierSku: sp?.supplierSku || "SKU-AUTO",
          unit: firstProd.unit || "قطعة",
          quantity: 5,
          unitPrice: sp ? sp.purchasePrice : firstProd.costPrice || 15000,
          discount: 0,
          taxRate: 0.14,
        },
      ]);
    }
  }, [isOpen, prefillItems, supplierId]);

  // Update payment terms when supplier changes
  useEffect(() => {
    const sel = suppliers.find((s) => s.id === supplierId);
    if (sel) {
      setPaymentTerms(sel.paymentTerms);
    }
  }, [supplierId, suppliers]);

  if (!isOpen) return null;

  const handleAddItemRow = () => {
    const firstProd = products[0];
    const sp = supplierProducts.find(
      (s) => s.productId === firstProd.id && s.supplierId === supplierId
    );
    setItems((prev) => [
      ...prev,
      {
        productId: firstProd.id,
        productName: firstProd.name,
        supplierSku: sp?.supplierSku || "SKU-AUTO",
        unit: firstProd.unit || "قطعة",
        quantity: 1,
        unitPrice: sp ? sp.purchasePrice : firstProd.costPrice || 10000,
        discount: 0,
        taxRate: 0.14,
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const sp = supplierProducts.find(
      (s) => s.productId === productId && s.supplierId === supplierId
    );
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return {
            ...item,
            productId,
            productName: prod?.name || item.productName,
            supplierSku: sp?.supplierSku || "SKU-AUTO",
            unitPrice: sp ? sp.purchasePrice : prod?.costPrice || item.unitPrice,
          };
        }
        return item;
      })
    );
  };

  const handleFieldChange = (index: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const subtotal = items.reduce(
    (sum, it) => sum + it.quantity * it.unitPrice - (Number(it.discount) || 0),
    0
  );
  const totalTax = subtotal * 0.14;
  const grandTotal = subtotal + totalTax;

  const selectedSupplier = suppliers.find((s) => s.id === supplierId) || suppliers[0];
  const selectedWarehouse = warehouses.find((w) => w.id === warehouseId) || warehouses[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || subtotal <= 0) return;

    const poItems: PurchaseOrderItem[] = items.map((it, idx) => {
      const lineSub = it.quantity * it.unitPrice - (Number(it.discount) || 0);
      const lineTax = lineSub * 0.14;
      return {
        id: `poi-${Date.now()}-${idx}`,
        productId: it.productId,
        productName: it.productName,
        supplierSku: it.supplierSku,
        unit: it.unit,
        quantity: Number(it.quantity),
        receivedQuantity: 0,
        remainingQuantity: Number(it.quantity),
        damagedQuantity: 0,
        unitPrice: Number(it.unitPrice),
        discount: Number(it.discount) || 0,
        taxRate: 0.14,
        taxAmount: lineTax,
        total: lineSub + lineTax,
      };
    });

    createPurchaseOrder({
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.nameAr,
      supplierTaxId: selectedSupplier.taxId,
      branchId: "branch-cairo",
      branchName,
      warehouseId: selectedWarehouse ? selectedWarehouse.id : "wh-damietta-main",
      warehouseName: selectedWarehouse ? selectedWarehouse.name : "مستودع التجمع الخامس الرئيسي",
      orderDate: new Date().toISOString().split("T")[0],
      expectedDeliveryDate,
      paymentTerms,
      paymentTermsDays: selectedSupplier.paymentTermsDays || 30,
      currency: "EGP",
      items: poItems,
      totalDiscount: 0,
      taxRate: 0.14,
      notes,
      createdBy: "أحمد سمير (المدير العام)",
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rewaq-gold/20 border border-rewaq-gold/40 flex items-center justify-center text-rewaq-gold font-bold">
              +
            </div>
            <div>
              <h2 className="text-base font-black">إصدار أمر شراء وتوريد جديد (PO)</h2>
              <p className="text-[11px] text-slate-300">
                تسجيل أمر توريد للمصنع أو المورد مع حساب الضرائب 14% وشروط السداد
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
                <p className="text-xs font-black">تم إصدار أمر الشراء بنجاح!</p>
                <p className="text-[11px] text-emerald-700">
                  تم إدراج الأمر في سجل المشتريات وجاهز للإرسال للمورد والاستلام بالمستودع.
                </p>
              </div>
            </div>
          )}

          {/* Supplier & Logistics Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                المورد / المصنع المعتمد:
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rewaq-gold"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nameAr} ({s.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                الفرع الطالب:
              </label>
              <select
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rewaq-gold"
              >
                <option value="فرع التجمع الخامس">فرع التجمع الخامس (الرئيسي)</option>
                <option value="فرع 6 أكتوبر">فرع 6 أكتوبر (المول)</option>
                <option value="مستودع ومصنع دمياط">مستودع ومصنع دمياط</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                مستودع الاستلام المستهدف:
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rewaq-gold"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.branchName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                تاريخ التسليم المتوقع:
              </label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rewaq-gold"
                required
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-rewaq-gold" />
                بنود وأصناف أمر التوريد:
              </span>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-300 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة صنف آخر
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">الصنف / الموديل</th>
                    <th className="p-3 w-28">كود المورد SKU</th>
                    <th className="p-3 w-24">الكمية</th>
                    <th className="p-3 w-32">سعر الشراء (ج.م)</th>
                    <th className="p-3 w-28">الإجمالي قبل الضريبة</th>
                    <th className="p-3 w-12 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => {
                    const rowTotal = item.quantity * item.unitPrice - (Number(item.discount) || 0);
                    return (
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
                            type="text"
                            value={item.supplierSku}
                            onChange={(e) => handleFieldChange(idx, "supplierSku", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono"
                          />
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
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleFieldChange(idx, "unitPrice", Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold font-mono"
                            required
                          />
                        </td>
                        <td className="p-2.5 font-bold font-mono text-slate-900">
                          {formatEGP(rowTotal)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Calculation & Terms Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  شروط وتسهيلات السداد (Payment Terms):
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value as PaymentTermsType)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rewaq-gold"
                >
                  <option value="NET_30">آجل 30 يوم من تاريخ استلام الفاتورة (Net 30)</option>
                  <option value="NET_15">آجل 15 يوم (Net 15)</option>
                  <option value="NET_45">آجل 45 يوم (Net 45)</option>
                  <option value="NET_60">آجل 60 يوم (Net 60)</option>
                  <option value="CASH">سداد نقدي عند التوريد / فوري (Cash on Delivery)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ملاحظات وتعليمات الشحن والتسليم:
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: يرجى التغليف بفقاعات هوائية مزدوجة وإرفاق شهادة الفحص وشهادة تجفيف الأفران..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold h-20"
                />
              </div>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2.5 flex flex-col justify-between">
              <span className="text-xs font-bold text-rewaq-gold border-b border-slate-800 pb-2">
                ملخص القيمة المالية والضريبية:
              </span>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>إجمالي البضاعة (قبل الضريبة):</span>
                  <span className="font-mono font-bold">{formatEGP(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>ضريبة القيمة المضافة 14% (مدخلات):</span>
                  <span className="font-mono font-bold text-emerald-400">{formatEGP(totalTax)}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-black border-t border-slate-800 pt-2 text-white">
                  <span>الإجمالي الصافي لأمر الشراء:</span>
                  <span className="font-mono text-rewaq-gold text-base">{formatEGP(grandTotal)}</span>
                </div>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-xl text-[11px] text-slate-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-rewaq-gold shrink-0" />
                <span>سيتم إثبات استحقاق القيد وحساب المورد عند استلام الفاتورة الضريبية ومطابقتها.</span>
              </div>
            </div>
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
              حفظ وإصدار أمر التوريد
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
