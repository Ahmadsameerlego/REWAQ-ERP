"use client";

import React, { useState } from "react";
import {
  X,
  FileSpreadsheet,
  Package,
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useShowroom, ContractOrder } from "@/context/ShowroomContext";
import { DeliveryItem, TimeWindow } from "@/types/logistics";

interface CreateDeliveryModalProps {
  onClose: () => void;
  onCreated?: (deliveryId: string) => void;
}

export default function CreateDeliveryModal({ onClose, onCreated }: CreateDeliveryModalProps) {
  const { orders, products, warehouses, drivers, vehicles, createDeliveryOrder, createPartialDelivery } = useShowroom();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedContractId, setSelectedContractId] = useState<string>(orders[0]?.id || "");
  const [selectedItemIds, setSelectedItemIds] = useState<Record<string, number>>({});
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("12:00 - 14:00");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [specialInstructions, setSpecialInstructions] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isPartialMode, setIsPartialMode] = useState<boolean>(false);

  const selectedContract = orders.find((o) => o.id === selectedContractId);

  // When a contract is selected, initialize item selections
  const handleSelectContract = (contract: ContractOrder) => {
    setSelectedContractId(contract.id);
    setDeliveryAddress(contract.deliveryAddress || "");
    const initialItemMap: Record<string, number> = {};
    contract.items.forEach((it) => {
      initialItemMap[it.productId] = it.quantity;
    });
    setSelectedItemIds(initialItemMap);
  };

  const handleQuantityChange = (productId: string, qty: number, maxQty: number) => {
    const validQty = Math.max(0, Math.min(maxQty, qty));
    setSelectedItemIds((prev) => ({
      ...prev,
      [productId]: validQty,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    const chosenItems: DeliveryItem[] = selectedContract.items
      .filter((it) => (selectedItemIds[it.productId] || 0) > 0)
      .map((it) => ({
        productId: it.productId,
        productName: it.productName,
        fabricColor: it.fabricColor,
        quantity: selectedItemIds[it.productId] || it.quantity,
        pickedQty: 0,
        unitPrice: it.unitPrice,
        isFromFloor: it.isFromFloor,
      }));

    if (chosenItems.length === 0) {
      alert("يرجى اختيار صنف واحد على الأقل للتسليم");
      return;
    }

    const isPartial = chosenItems.length < selectedContract.items.length ||
      chosenItems.some((ci) => {
        const orig = selectedContract.items.find((i) => i.productId === ci.productId);
        return orig && ci.quantity < orig.quantity;
      });

    const driver = drivers.find((d) => d.id === selectedDriverId);
    const vehicle = vehicles.find((v) => v.id === selectedVehicleId);

    const newDel = createDeliveryOrder({
      contractId: selectedContract.id,
      contractNumber: selectedContract.orderNumber,
      customerId: selectedContract.customerId,
      customerName: selectedContract.customerName,
      customerPhone: selectedContract.customerPhone,
      deliveryAddress: deliveryAddress || selectedContract.deliveryAddress,
      city: selectedContract.customerCity,
      branch: selectedContract.branch,
      items: chosenItems,
      scheduledDate,
      timeWindow,
      driverId: driver?.id,
      driverName: driver?.name,
      driverPhone: driver?.phone,
      vehicleId: vehicle?.id,
      vehiclePlate: vehicle?.plateNumber,
      vehicleType: vehicle?.model,
      status: driver ? "ASSIGNED" : "SCHEDULED",
      notes,
      specialInstructions,
      isPartial,
      partialDeliveryIndex: isPartial ? 1 : undefined,
      totalPartialDeliveries: isPartial ? 2 : undefined,
    });

    if (onCreated) {
      onCreated(newDel.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-right">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <Plus className="w-5 h-5 text-rewaq-gold" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                إصدار إذن تسليم وشحن جديد (Create Delivery Order)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ربط تلقائي بالعقود والمخزون بدون تكرار إدخال البيانات.
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

        {/* Wizard Steps Indicator */}
        <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-center gap-2 shrink-0">
          {[
            { num: 1, title: "1. اختيار العقد والعميل" },
            { num: 2, title: "2. تحديد الأصناف والتسليم الجزئي" },
            { num: 3, title: "3. الجدولة وتعيين الأسطول" },
          ].map((st) => (
            <div
              key={st.num}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                step === st.num
                  ? "bg-slate-900 text-white shadow-xs"
                  : step > st.num
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <span>{st.title}</span>
              {step > st.num && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* STEP 1: Select Contract */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  اختر العقد المراد شحنه من قائمة العقود المعتمدة:
                </label>
                <p className="text-[11px] text-slate-400">
                  العقود التي تم تسجيلها بالـ POS ومسدد عربونها:
                </p>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {orders.map((contract) => {
                  const isSelected = selectedContractId === contract.id;
                  return (
                    <div
                      key={contract.id}
                      onClick={() => handleSelectContract(contract)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-amber-50/50 border-rewaq-gold shadow-2xs ring-1 ring-rewaq-gold"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 text-xs">
                            #{contract.orderNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {contract.customerName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            ({contract.customerPhone})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>الفرع: {contract.branch}</span>
                          <span>•</span>
                          <span>الأصناف: {contract.items.length} أصناف</span>
                          <span>•</span>
                          <span>العنوان: {contract.deliveryAddress}</span>
                        </div>
                      </div>

                      <div className="text-left font-mono shrink-0">
                        <span className="text-xs font-black text-slate-900 block">
                          {contract.netAmount.toLocaleString()} ج.م
                        </span>
                        <span className="text-[10px] font-bold text-amber-700 block">
                          متبقي: {contract.remainingDue.toLocaleString()} ج
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedContract && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1 text-[11px]">
                  <span className="font-black text-slate-700 block">العنوان المعتمد للتسليم:</span>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="تأكيد أو تعديل العنوان بالتفصيل..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-rewaq-gold"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Products Selection & Partial Delivery */}
          {step === 2 && selectedContract && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">
                    أصناف العقد #{selectedContract.orderNumber}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    يمكنك تعديل الكميات أو استبعاد أصناف لتنفيذ تسليم جزئي (Partial Delivery).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPartialMode(!isPartialMode)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                    isPartialMode ? "bg-purple-100 text-purple-900 border-purple-300" : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {isPartialMode ? "✓ وضع التسليم الجزئي مفعّل" : "تفعيل التسليم الجزئي"}
                </button>
              </div>

              <div className="space-y-2 divide-y divide-slate-100 border border-slate-200 rounded-2xl p-2 bg-white">
                {selectedContract.items.map((item) => {
                  const currentQty = selectedItemIds[item.productId] ?? item.quantity;
                  return (
                    <div key={item.productId} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 text-xs">{item.productName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>الخامة: {item.fabricColor || "افتراضي"}</span>
                          <span>•</span>
                          <span>الكمية بالعقد: {item.quantity}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-slate-600">كمية هذا التسليم:</span>
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.productId, currentQty - 1, item.quantity)}
                            className="w-6 h-6 rounded-lg bg-white font-black text-slate-800 flex items-center justify-center hover:bg-slate-200"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-xs">
                            {currentQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.productId, currentQty + 1, item.quantity)}
                            className="w-6 h-6 rounded-lg bg-white font-black text-slate-800 flex items-center justify-center hover:bg-slate-200"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">تعليمات خاصة للشحنة (اختياري):</label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="مثال: الدور الثالث بدون مصعد / الاتصال بالعميل قبل التحرك..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-rewaq-gold focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Scheduling & Fleet Assignment */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">تاريخ التسليم المقترح:</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-rewaq-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">النافذة الزمنية (Time Slot):</label>
                  <select
                    value={timeWindow}
                    onChange={(e) => setTimeWindow(e.target.value as TimeWindow)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-rewaq-gold"
                  >
                    <option value="10:00 - 12:00">10:00 ص – 12:00 م (الفترة الصباحية الأولى)</option>
                    <option value="12:00 - 14:00">12:00 م – 02:00 م (الفترة الصباحية الثانية)</option>
                    <option value="14:00 - 16:00">02:00 م – 04:00 م (فترة الظهيرة)</option>
                    <option value="16:00 - 18:00">04:00 م – 06:00 م (الفترة المسائية)</option>
                    <option value="18:00 - 20:00">06:00 م – 08:00 م (الفترة المسائية المتأخرة)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">تعيين السائق المسؤول:</label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => {
                      setSelectedDriverId(e.target.value);
                      const drv = drivers.find((d) => d.id === e.target.value);
                      if (drv) {
                        const matchedVeh = vehicles.find((v) => v.currentDriverId === drv.id || v.plateNumber === drv.vehicleAssigned);
                        if (matchedVeh) setSelectedVehicleId(matchedVeh.id);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-rewaq-gold"
                  >
                    <option value="">-- بدون تعيين سائق الآن (جدولة فقط) --</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.status === "AVAILABLE" ? "متاح" : "مشغول"} - {d.assignedDeliveriesCount} شحنات)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">تعيين سيارة الشحن:</label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-rewaq-gold"
                  >
                    <option value="">-- بدون تعيين سيارة الآن --</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.model} ({v.plateNumber}) - سعة {v.maxItemsCapacity} قطع
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">ملاحظات داخلية لمنسق الشحن:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي تفاصيل تنسيقية أو تعليمات للمخزن..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-rewaq-gold"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Navigation */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 px-4 py-2 rounded-xl transition cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>السابق</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-xl transition cursor-pointer"
            >
              إلغاء
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev + 1) as 1 | 2 | 3)}
                className="inline-flex items-center gap-1.5 text-xs font-black text-slate-950 bg-rewaq-gold hover:bg-rewaq-gold-dark px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
              >
                <span>التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-rewaq-gold" />
                <span>إصدار إذن التسليم فوراً</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
