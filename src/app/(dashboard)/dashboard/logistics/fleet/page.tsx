"use client";

import React, { useState } from "react";
import {
  Users2,
  Truck,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Star,
  ShieldCheck,
  Wrench,
  X,
  Layers,
} from "lucide-react";
import { useShowroom } from "@/context/ShowroomContext";
import { Driver, Vehicle } from "@/types/logistics";
import LogisticsNav from "@/components/logistics/LogisticsNav";

export default function FleetManagementPage() {
  const { drivers, vehicles, addDriver, updateDriver, addVehicle, updateVehicle } = useShowroom();

  const [activeTab, setActiveTab] = useState<"DRIVERS" | "VEHICLES">("DRIVERS");
  const [showAddDriverModal, setShowAddDriverModal] = useState<boolean>(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState<boolean>(false);

  // New Driver form state
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverPhone, setNewDriverPhone] = useState("");
  const [newDriverLicense, setNewDriverLicense] = useState("");
  const [newDriverBranch, setNewDriverBranch] = useState("فرع التجمع الرئيسي");

  // New Vehicle form state
  const [newVehPlate, setNewVehPlate] = useState("");
  const [newVehModel, setNewVehModel] = useState("");
  const [newVehType, setNewVehType] = useState<Vehicle["type"]>("HALF_TRUCK");
  const [newVehCapacity, setNewVehCapacity] = useState<number>(18);
  const [newVehItemsCap, setNewVehItemsCap] = useState<number>(5);
  const [newVehBranch, setNewVehBranch] = useState("فرع التجمع الرئيسي");

  const handleCreateDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName || !newDriverPhone) return;

    addDriver({
      name: newDriverName,
      phone: newDriverPhone,
      status: "AVAILABLE",
      rating: 5.0,
      licenseNumber: newDriverLicense || "LIC-EGY-NEW",
      branch: newDriverBranch,
      isAvailable: true,
    });

    setNewDriverName("");
    setNewDriverPhone("");
    setNewDriverLicense("");
    setShowAddDriverModal(false);
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehPlate || !newVehModel) return;

    addVehicle({
      plateNumber: newVehPlate,
      model: newVehModel,
      type: newVehType,
      capacityCbm: Number(newVehCapacity) || 18,
      maxItemsCapacity: Number(newVehItemsCap) || 5,
      status: "AVAILABLE",
      branch: newVehBranch,
    });

    setNewVehPlate("");
    setNewVehModel("");
    setShowAddVehicleModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <LogisticsNav />

      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">
            إدارة أسطول الشحن والسائقين (Fleet & Drivers)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            متابعة إتاحة السائقين، سعة سيارات النقل، وحالة الصيانة بدون تعقيد.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("DRIVERS")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "DRIVERS"
                  ? "bg-white text-slate-900 shadow-xs font-black"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              السائقين ({drivers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("VEHICLES")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "VEHICLES"
                  ? "bg-white text-slate-900 shadow-xs font-black"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              السيارات والمركبات ({vehicles.length})
            </button>
          </div>

          {activeTab === "DRIVERS" ? (
            <button
              type="button"
              onClick={() => setShowAddDriverModal(true)}
              className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سائق</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddVehicleModal(true)}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-rewaq-gold" />
              <span>إضافة مركبة</span>
            </button>
          )}
        </div>
      </div>

      {/* DRIVERS TAB */}
      {activeTab === "DRIVERS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {drivers.map((drv) => {
            const isAvailable = drv.status === "AVAILABLE";
            return (
              <div
                key={drv.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{drv.name}</h3>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-mono">{drv.phone}</span>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${
                        isAvailable
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : drv.status === "ON_DELIVERY"
                          ? "bg-sky-50 text-sky-800 border-sky-200 animate-pulse"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {isAvailable ? "متاح للتحميل" : drv.status === "ON_DELIVERY" ? "في رحلة 🚚" : "إجازة"}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>السيارة المسندة:</span>
                      <span className="font-bold text-slate-800">{drv.vehicleAssigned || "مركبة حرة"}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>شحنات اليوم:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {drv.assignedDeliveriesCount} رحلات
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>الفرع التابع له:</span>
                      <span>{drv.branch}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{drv.rating}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      updateDriver(drv.id, {
                        status: isAvailable ? "OFF_DUTY" : "AVAILABLE",
                        isAvailable: !isAvailable,
                      });
                    }}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                  >
                    {isAvailable ? "تحويل لغير متاح" : "تفعيل الإتاحة"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VEHICLES TAB */}
      {activeTab === "VEHICLES" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {vehicles.map((veh) => (
            <div
              key={veh.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 block mb-1">
                      {veh.plateNumber}
                    </span>
                    <h3 className="text-xs font-black text-slate-800">{veh.model}</h3>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${
                      veh.status === "AVAILABLE"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : veh.status === "ON_DELIVERY"
                        ? "bg-sky-50 text-sky-800 border-sky-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {veh.status === "AVAILABLE"
                      ? "متاحة"
                      : veh.status === "ON_DELIVERY"
                      ? "في خط سير"
                      : veh.status === "ASSIGNED"
                      ? "محجوزة"
                      : "صيانة"}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>السائق الحالي:</span>
                    <span className="font-bold text-slate-900">{veh.currentDriverName || "بدون سائق"}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>سعة التحميل (CBM):</span>
                    <span className="font-mono font-bold text-slate-900">{veh.capacityCbm} م³</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>الحد الأقصى للقطع:</span>
                    <span className="font-mono font-bold text-slate-900">{veh.maxItemsCapacity} قطع كبرى</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">{veh.branch}</span>
                <button
                  type="button"
                  onClick={() => {
                    updateVehicle(veh.id, {
                      status: veh.status === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE",
                    });
                  }}
                  className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                >
                  {veh.status === "MAINTENANCE" ? "إنهاء الصيانة" : "تحويل للصيانة"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Driver Modal */}
      {showAddDriverModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl w-full max-w-md space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900">إضافة سائق جديد لأسطول المعرض</h3>
              <button onClick={() => setShowAddDriverModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDriver} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">اسم السائق:</label>
                <input
                  type="text"
                  required
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  placeholder="الاسم ثلاثي..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-rewaq-gold"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">رقم الهاتف:</label>
                <input
                  type="text"
                  required
                  value={newDriverPhone}
                  onChange={(e) => setNewDriverPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-rewaq-gold"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">رقم رخصة القيادة المهنية:</label>
                <input
                  type="text"
                  value={newDriverLicense}
                  onChange={(e) => setNewDriverLicense(e.target.value)}
                  placeholder="LIC-EGY-..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-rewaq-gold"
                />
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowAddDriverModal(false)}
                  className="text-slate-500 font-bold px-3 py-2"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-xs"
                >
                  حفظ السائق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl w-full max-w-md space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900">إضافة سيارة شحن جديدة للأسطول</h3>
              <button onClick={() => setShowAddVehicleModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">رقم اللوحة:</label>
                <input
                  type="text"
                  required
                  value={newVehPlate}
                  onChange={(e) => setNewVehPlate(e.target.value)}
                  placeholder="مثال: أ ر 542"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-rewaq-gold"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">موديل ونوع الشاحنة:</label>
                <input
                  type="text"
                  required
                  value={newVehModel}
                  onChange={(e) => setNewVehModel(e.target.value)}
                  placeholder="مثال: شيفروليه جامبو صندوق مغلق"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-rewaq-gold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">السعة (CBM):</label>
                  <input
                    type="number"
                    value={newVehCapacity}
                    onChange={(e) => setNewVehCapacity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-rewaq-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">أقصى عدد قطع:</label>
                  <input
                    type="number"
                    value={newVehItemsCap}
                    onChange={(e) => setNewVehItemsCap(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-rewaq-gold"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="text-slate-500 font-bold px-3 py-2"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-black px-5 py-2.5 rounded-xl shadow-xs"
                >
                  حفظ المركبة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
