"use client";

import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  Users2,
  AlertTriangle,
  Send,
  HelpCircle,
  Truck,
  RotateCcw,
  ArrowRight,
  Package,
} from "lucide-react";
import { useShowroom } from "@/context/ShowroomContext";

interface SmartAssistantWidgetProps {
  onSelectDelivery?: (deliveryId: string) => void;
  standalone?: boolean;
}

export default function SmartAssistantWidget({
  onSelectDelivery,
  standalone = false,
}: SmartAssistantWidgetProps) {
  const { deliveries, drivers, vehicles, logisticsInsights, orders } = useShowroom();
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [customQuery, setCustomQuery] = useState<string>("");
  const [searchAnswer, setSearchAnswer] = useState<any>(null);

  const presetQuestions = [
    {
      id: "TODAY_TOMORROW",
      label: "إيه تسليمات اليوم وبكرة؟",
      icon: Calendar,
      answerTitle: "شحنات اليوم والغد المجدولة",
      compute: () => {
        const today = new Date().toISOString().split("T")[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
        const matches = deliveries.filter(
          (d) => d.scheduledDate === today || d.scheduledDate === tomorrow || d.status === "OUT_FOR_DELIVERY"
        );
        return {
          type: "DELIVERIES",
          list: matches,
          summary: `يوجد ${matches.length} شحنات مجدولة بين اليوم والغد، بإجمالي تحصيلات COD متوقعة ${matches
            .reduce((s, d) => s + d.codAmount, 0)
            .toLocaleString()} ج.م.`,
        };
      },
    },
    {
      id: "AVAILABLE_DRIVERS",
      label: "مين السواقين المتاحين حالياً؟",
      icon: Users2,
      answerTitle: "السائقين المتاحين للتعيين الفوري",
      compute: () => {
        const available = drivers.filter((d) => d.status === "AVAILABLE");
        const onTrip = drivers.filter((d) => d.status === "ON_DELIVERY");
        return {
          type: "DRIVERS",
          available,
          onTrip,
          summary: `يوجد ${available.length} سائقين متاحين الآن للتحميل، بينما ${onTrip.length} سائقين في رحلات توصيل ميدانية.`,
        };
      },
    },
    {
      id: "READY_NOT_SCHEDULED",
      label: "إيه الطلبات الجاهزة ومش متجدولة؟",
      icon: Package,
      answerTitle: "الطلبات الجاهزة 100% بالمستودع ولم تُجدول",
      compute: () => {
        const readyNotSched = deliveries.filter(
          (d) => d.status === "READY" && (!d.driverId || !d.scheduledDate)
        );
        return {
          type: "DELIVERIES",
          list: readyNotSched,
          summary:
            readyNotSched.length > 0
              ? `يوجد ${readyNotSched.length} شحنات مكتملة التجهيز بالمستودع وتنتظر تحديد موعد وتعيين السائق.`
              : "جميع الشحنات الجاهزة مجدولة وموزعة على خطوط السير بنجاح.",
        };
      },
    },
    {
      id: "DELAYED_DELIVERIES",
      label: "إيه التسليمات المتأخرة أو المتعثرة؟",
      icon: AlertTriangle,
      answerTitle: "الشحنات المتأخرة والمعاد جدولتها",
      compute: () => {
        const delayed = deliveries.filter(
          (d) => d.status === "FAILED" || d.status === "RESCHEDULED"
        );
        return {
          type: "DELIVERIES",
          list: delayed,
          summary:
            delayed.length > 0
              ? `يوجد ${delayed.length} شحنات متعثرة أو تم تأجيلها لطلب العملاء أو لصيانة القطع.`
              : "لا توجد أي شحنات متأخرة حالياً.",
        };
      },
    },
    {
      id: "ROUTE_GROUPING",
      label: "إيه التسليمات اللي ممكن تتجمع في رحلة واحدة؟",
      icon: Sparkles,
      answerTitle: "اقتراحات التجميع الجغرافي الذكي",
      compute: () => {
        const routeInsights = logisticsInsights.filter((i) => i.type === "ROUTE_GROUPING" && !i.resolved);
        return {
          type: "INSIGHTS",
          list: routeInsights,
          summary:
            routeInsights.length > 0
              ? `رصد النظام ${routeInsights.length} فرص دمج لرحلات متقاربة جغرافياً (كالشيخ زايد أو طنطا) لتوفير الوقود والوقت.`
              : "جميع الرحلات موزعة وفق أقصى كفاءة جغرافية.",
        };
      },
    },
  ];

  const handleSelectQuestion = (qId: string) => {
    setSelectedQuestion(qId);
    setSearchAnswer(null);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;

    setSelectedQuestion(null);
    const query = customQuery.trim().toLowerCase();

    // Find in deliveries by number, contract, customer name, phone, city
    const matchedDeliveries = deliveries.filter(
      (d) =>
        d.deliveryNumber.toLowerCase().includes(query) ||
        d.contractNumber.toLowerCase().includes(query) ||
        d.customerName.toLowerCase().includes(query) ||
        d.customerPhone.includes(query) ||
        d.city.toLowerCase().includes(query) ||
        d.items.some((i) => i.productName.toLowerCase().includes(query))
    );

    const matchedDriver = drivers.find((d) => d.name.toLowerCase().includes(query));

    if (matchedDeliveries.length > 0) {
      setSearchAnswer({
        title: `نتائج البحث عن: "${customQuery}"`,
        summary: `تم العثور على ${matchedDeliveries.length} شحنات مطابقة لاستفسارك:`,
        type: "DELIVERIES",
        list: matchedDeliveries,
      });
    } else if (matchedDriver) {
      setSearchAnswer({
        title: `بيانات السائق: ${matchedDriver.name}`,
        summary: `الحالة: ${matchedDriver.status === "AVAILABLE" ? "متاح" : "في رحلة"} | سيارة: ${matchedDriver.vehicleAssigned} | هاتف: ${matchedDriver.phone}`,
        type: "DRIVERS",
        available: matchedDriver.status === "AVAILABLE" ? [matchedDriver] : [],
        onTrip: matchedDriver.status === "ON_DELIVERY" ? [matchedDriver] : [],
      });
    } else {
      setSearchAnswer({
        title: `لم يتم العثور على نتائج لـ "${customQuery}"`,
        summary: "يرجى التأكد من رقم العقد، رقم إذن التسليم، أو اسم العميل المطلوب.",
        type: "EMPTY",
      });
    }
  };

  const currentActivePreset = presetQuestions.find((q) => q.id === selectedQuestion);
  const activeResult = currentActivePreset ? currentActivePreset.compute() : searchAnswer;

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden ${standalone ? "p-6" : "p-5"}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-slate-900 text-rewaq-gold rounded-2xl shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-black text-slate-900">
                المساعد اللوجستي الذكي (Smart Delivery Assistant)
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                بيانات حية
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              إجابات فورية ودقيقة مبنية على بيانات الشحن والمخزون والعقود الفعلية بالـ ERP.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div className="py-4 border-b border-slate-100 space-y-2">
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
          أسئلة سريعة شائعة:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {presetQuestions.map((q) => {
            const isSelected = selectedQuestion === q.id;
            const IconComp = q.icon;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSelectQuestion(q.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isSelected ? "text-rewaq-gold" : "text-slate-400"}`} />
                <span>{q.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Query Search Bar */}
      <form onSubmit={handleSearchSubmit} className="pt-4 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="اسأل المساعد اللوجستي (مثال: العقد 089 هيتسلم إمتى؟ أو ابحث باسم العميل)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer shrink-0"
        >
          <Send className="w-3.5 h-3.5 text-rewaq-gold" />
          <span>استفسار</span>
        </button>
      </form>

      {/* Answer View Result */}
      {activeResult && (
        <div className="mt-5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3 animate-fadeIn text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-4 h-4 text-rewaq-gold" />
              {currentActivePreset ? currentActivePreset.answerTitle : searchAnswer?.title}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <p className="text-slate-700 font-medium leading-relaxed">
            {activeResult.summary}
          </p>

          {/* DELIVERIES LIST RESULT */}
          {activeResult.type === "DELIVERIES" && activeResult.list?.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeResult.list.map((del: any) => (
                <div
                  key={del.id}
                  className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900">
                        #{del.deliveryNumber}
                      </span>
                      <span className="font-bold text-slate-800">{del.customerName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({del.customerPhone})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>{del.city} - {del.deliveryAddress}</span>
                      <span>•</span>
                      <span>الموعد: {del.scheduledDate} ({del.timeWindow})</span>
                      {del.driverName && (
                        <>
                          <span>•</span>
                          <span>السائق: {del.driverName}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-left font-mono shrink-0">
                    <span className="text-xs font-black text-amber-700 block">
                      {del.codAmount.toLocaleString()} ج.م
                    </span>
                    {onSelectDelivery && (
                      <button
                        type="button"
                        onClick={() => onSelectDelivery(del.id)}
                        className="text-[10px] font-bold text-rewaq-gold-dark hover:underline"
                      >
                        فتح الإذن ⬅
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DRIVERS LIST RESULT */}
          {activeResult.type === "DRIVERS" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeResult.available?.map((drv: any) => (
                <div key={drv.id} className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-950 block">{drv.name}</span>
                    <span className="text-[10px] text-emerald-700 font-mono">{drv.phone} | {drv.vehicleAssigned}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                    متاح
                  </span>
                </div>
              ))}

              {activeResult.onTrip?.map((drv: any) => (
                <div key={drv.id} className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between opacity-80">
                  <div>
                    <span className="font-bold text-slate-800 block">{drv.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{drv.phone} | {drv.vehicleAssigned}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                    في رحلة
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* INSIGHTS RESULT */}
          {activeResult.type === "INSIGHTS" && (
            <div className="space-y-2">
              {activeResult.list?.map((ins: any) => (
                <div key={ins.id} className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-950 block text-xs">{ins.title}</span>
                  <p className="text-[11px] text-amber-900">{ins.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
