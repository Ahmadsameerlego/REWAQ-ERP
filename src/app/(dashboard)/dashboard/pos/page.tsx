"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle2,
  DollarSign,
  Printer,
  MessageCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  ShoppingBag,
  Layers,
  Truck,
  ShieldCheck,
  Building2,
  Phone,
  QrCode,
  Calendar
} from "lucide-react";
import { useShowroom, ContractOrder, ProductItem } from "@/context/ShowroomContext";

function POSContent() {
  const { products, customers, orders, createOrder, collectPayment } = useShowroom();
  const searchParams = useSearchParams();
  
  // Wizard Modal State
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<ContractOrder | null>(null);
  const [paymentInput, setPaymentInput] = useState("");
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<ContractOrder | null>(null);
  const [contractSearch, setContractSearch] = useState("");

  // Step 1: Customer Selection
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("القاهرة الجديدة");
  const [selectedBranch, setSelectedBranch] = useState("فرع التجمع الرئيسي");
  const [salesRep, setSalesRep] = useState("كريم يوسف");

  // Step 2: Selected Products in Cart
  const [cartItems, setCartItems] = useState<{
    productId: string;
    productName: string;
    fabricColor: string;
    quantity: number;
    unitPrice: number;
    isFromFloor: boolean;
  }[]>([]);

  // Step 3: Pricing & Deposit
  const [discountAmount, setDiscountAmount] = useState(0);
  const [depositAmount, setDepositAmount] = useState(25000);
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  // Step 4: Shipping & Assembly
  const [deliveryDate, setDeliveryDate] = useState("2026-10-15");
  const [deliveryAddress, setDeliveryAddress] = useState("التجمع الخامس - حي النرجس");
  const [needsAssembly, setNeedsAssembly] = useState(true);
  const [orderNotes, setOrderNotes] = useState("يرجى الاتصال قبل موعد الشحن بـ 24 ساعة");

  // Newly created order for Step 5
  const [completedOrder, setCompletedOrder] = useState<ContractOrder | null>(null);

  // Read URL query parameters to auto-populate customer details from CRM & Visits
  useEffect(() => {
    const qName = searchParams.get("customerName");
    const qPhone = searchParams.get("customerPhone");
    const qBranch = searchParams.get("branch");
    const qRep = searchParams.get("rep");
    const qProduct = searchParams.get("product");

    if (qName || qPhone) {
      if (qName) setCustomerName(qName);
      if (qPhone) setCustomerPhone(qPhone);
      if (qBranch) setSelectedBranch(qBranch);
      if (qRep) setSalesRep(qRep);

      // Auto match interested product if provided
      if (qProduct && products.length > 0) {
        const matched = products.find((p) => p.name.includes(qProduct) || qProduct.includes(p.name));
        if (matched) {
          setCartItems([
            {
              productId: matched.id,
              productName: matched.name,
              fabricColor: matched.availableColors[0] || "افتراضي",
              quantity: 1,
              unitPrice: matched.retailPrice,
              isFromFloor: matched.isFloorDisplay,
            },
          ]);
          setWizardStep(2); // Jump directly to products/swatches
        }
      }
      setShowWizard(true);
    }
  }, [searchParams, products]);

  // Cart Calculations
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const netTotal = Math.max(0, cartSubtotal - discountAmount);
  const remainingDue = Math.max(0, netTotal - depositAmount);

  // Quick Select Customer from Unified Customers
  const handleSelectCustomer = (phone: string) => {
    const cust = customers.find((c) => c.phone === phone);
    if (cust) {
      setCustomerName(cust.fullName);
      setCustomerPhone(cust.phone);
      setCustomerCity(cust.city || "القاهرة");
      setSelectedBranch(cust.preferredBranch || selectedBranch);
      setSalesRep(cust.assignedRep || salesRep);
    }
  };

  // Add Product to Cart
  const handleAddToCart = (product: ProductItem) => {
    const existingIndex = cartItems.findIndex((i) => i.productId === product.id);
    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: product.id,
          productName: product.name,
          fabricColor: product.availableColors[0] || "افتراضي",
          quantity: 1,
          unitPrice: product.retailPrice,
          isFromFloor: product.isFloorDisplay,
        },
      ]);
    }
  };

  // Submit Order in Wizard
  const handleFinishWizard = () => {
    const created = createOrder({
      customerName,
      customerPhone,
      customerCity,
      branch: selectedBranch,
      salesRep,
      items: cartItems,
      totalAmount: cartSubtotal,
      discount: discountAmount,
      netAmount: netTotal,
      depositPaid: depositAmount,
      remainingDue: remainingDue,
      status: remainingDue === 0 ? "DELIVERED_PAID" : "BOOKED",
      deliveryDate,
      deliveryAddress,
      needsAssembly,
      notes: orderNotes,
    });
    setCompletedOrder(created);
    setWizardStep(5);
  };

  const handleOpenNewWizard = () => {
    setWizardStep(1);
    setCartItems([]);
    setDiscountAmount(0);
    setDepositAmount(20000);
    setCustomerName("");
    setCustomerPhone("");
    setCompletedOrder(null);
    setShowWizard(true);
  };

  // Handle Payment Collection
  const handleCollectPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrderForPayment && Number(paymentInput) > 0) {
      collectPayment(selectedOrderForPayment.id, Number(paymentInput));
      setSelectedOrderForPayment(null);
      setPaymentInput("");
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.customerName.includes(contractSearch) ||
      o.orderNumber.includes(contractSearch) ||
      o.customerPhone.includes(contractSearch)
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Top Header */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1">
              <span>الرئيسية</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-bold text-slate-700">نقاط البيع والتعاقدات (POS)</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            إدارة العقود والعرابين ونقاط البيع بالصالة (Showroom POS)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            معالج التعاقد الذكي، حساب العرابين والبواقي آلياً، وإصدار عقود البيع الرسمية للعملاء بدون إعادة إدخال بيانات.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNewWizard}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-rewaq-gold to-rewaq-gold-dark hover:from-rewaq-gold-light hover:to-rewaq-gold text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-lg shadow-rewaq-gold/20 transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ تسجيل تعاقد / حجز عربون جديد</span>
        </button>
      </div>

      {/* 2. Contracts Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي العقود النشطة</span>
          <div className="text-2xl font-black text-slate-900 font-mono">{orders.length} عقد</div>
          <span className="text-[10px] text-slate-400">عبر كل الفروع والصالات</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي العرابين المحصلة</span>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {orders.reduce((acc, o) => acc + o.depositPaid, 0).toLocaleString()} ج.م
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">مودعة في خزائن الفروع</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي البواقي المستحقة (COD)</span>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {orders.reduce((acc, o) => acc + o.remainingDue, 0).toLocaleString()} ج.م
          </div>
          <span className="text-[10px] text-amber-600 font-bold">تُحصّل عند التسليم والتركيب</span>
        </div>
      </div>

      {/* 3. Contracts List Table */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">سجل التعاقدات والمبيعات الرسمية</h2>
            <p className="text-xs text-slate-400 mt-0.5">متابعة دفعات العربونات والبواقي وطباعة العقود</p>
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={contractSearch}
              onChange={(e) => setContractSearch(e.target.value)}
              placeholder="ابحث برقم العقد، اسم العميل، أو الهاتف..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 pr-9 text-xs text-slate-800 focus:outline-none focus:border-rewaq-gold focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                <th className="py-3.5 px-3.5">رقم العقد</th>
                <th className="py-3.5 px-3.5">العميل والفرع</th>
                <th className="py-3.5 px-3.5">الأصناف والقطع</th>
                <th className="py-3.5 px-3.5">الإجمالي</th>
                <th className="py-3.5 px-3.5">العربون المدفوع</th>
                <th className="py-3.5 px-3.5">باقي الحساب</th>
                <th className="py-3.5 px-3.5">تاريخ التسليم</th>
                <th className="py-3.5 px-3.5 text-center">أكشن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-3.5 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                  <td className="py-3.5 px-3.5">
                    <p className="font-bold text-slate-800">{ord.customerName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{ord.customerPhone} | {ord.branch}</p>
                  </td>
                  <td className="py-3.5 px-3.5 max-w-[200px] truncate" title={ord.items.map((i) => i.productName).join(" + ")}>
                    {ord.items.map((i) => `${i.productName} (${i.fabricColor})`).join(" + ")}
                  </td>
                  <td className="py-3.5 px-3.5 font-mono font-bold text-slate-900">
                    {ord.netAmount.toLocaleString()} ج
                  </td>
                  <td className="py-3.5 px-3.5 font-mono font-bold text-emerald-700">
                    {ord.depositPaid.toLocaleString()} ج
                  </td>
                  <td className="py-3.5 px-3.5 font-mono font-bold text-amber-700">
                    {ord.remainingDue > 0 ? `${ord.remainingDue.toLocaleString()} ج` : "خالص بالكامل ✅"}
                  </td>
                  <td className="py-3.5 px-3.5 font-mono text-slate-600">{ord.deliveryDate}</td>
                  <td className="py-3.5 px-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {ord.remainingDue > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderForPayment(ord);
                            setPaymentInput(ord.remainingDue.toString());
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px] hover:bg-amber-100 transition cursor-pointer"
                        >
                          تحصيل دفعة
                        </button>
                      )}

                      <Link
                        href={`/dashboard/logistics/orders?search=${encodeURIComponent(ord.orderNumber)}`}
                        className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                        title="إدارة وشحن التسليم"
                      >
                        <Truck className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setSelectedOrderForPrint(ord)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                        title="طباعة العقد الرسمي"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={`https://wa.me/2${ord.customerPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                        title="إرسال الفاتورة واتساب"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Sequential 5-Step Contract Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 text-slate-900 my-auto">
            
            {/* Modal Header & Step Bar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-rewaq-gold uppercase">معالج التعاقدات الذكي</span>
                <h3 className="text-lg font-black text-slate-900">
                  {wizardStep === 1 && "الخطوة 1: اختيار بيانات العميل والفرع"}
                  {wizardStep === 2 && "الخطوة 2: اختيار قطع الأثاث والأقمشة"}
                  {wizardStep === 3 && "الخطوة 3: الحساب المالي والعربون (Deposit)"}
                  {wizardStep === 4 && "الخطوة 4: موعد وعنوان الشحن والتركيب"}
                  {wizardStep === 5 && "الخطوة 5: تأكيد العقد والطباعة الرسمية ✅"}
                </h3>
              </div>

              <button
                onClick={() => setShowWizard(false)}
                className="text-slate-400 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Indicator */}
            {wizardStep < 5 && (
              <div className="flex items-center justify-between mb-6 px-2">
                {[
                  { num: 1, label: "العميل" },
                  { num: 2, label: "المنتجات" },
                  { num: 3, label: "العربون" },
                  { num: 4, label: "الشحن" },
                ].map((s) => (
                  <div key={s.num} className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        wizardStep >= s.num
                          ? "bg-rewaq-gold text-slate-950 font-black"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {s.num}
                    </div>
                    <span className={`text-xs font-bold ${wizardStep >= s.num ? "text-slate-900" : "text-slate-400"}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Step 1: Customer Details */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                {/* CRM Customers Quick Pick */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span className="text-xs font-bold text-slate-700 block mb-2">
                    سحب سريع لبيانات عميل مسجل بالـ CRM:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {customers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCustomer(c.phone)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                          customerPhone === c.phone
                            ? "bg-rewaq-gold text-slate-950 font-black border-rewaq-gold"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {c.fullName} ({c.phone})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اسم العميل الثلاثي *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="د. هاني عبد الحميد"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-rewaq-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">رقم الهاتف *</label>
                    <input
                      type="text"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="01012345678"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-rewaq-gold font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">المنطقة / المدينة</label>
                    <input
                      type="text"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-rewaq-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">فرع البيع</label>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold"
                    >
                      <option value="فرع التجمع الرئيسي">فرع التجمع الرئيسي</option>
                      <option value="فرع 6 أكتوبر (المول)">فرع 6 أكتوبر (المول)</option>
                      <option value="مبيعات مصنع دمياط">مبيعات مصنع دمياط</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">مسؤول المبيعات</label>
                    <select
                      value={salesRep}
                      onChange={(e) => setSalesRep(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold"
                    >
                      <option value="كريم يوسف">كريم يوسف</option>
                      <option value="سارة ممدوح">سارة ممدوح</option>
                      <option value="محمود الشامي">محمود الشامي</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    disabled={!customerName || !customerPhone}
                    onClick={() => setWizardStep(2)}
                    className="bg-slate-900 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-slate-800 transition cursor-pointer flex items-center gap-2"
                  >
                    <span>المتابعة لاختيار المنتجات</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Product & Fabric Selection */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-700 block">اختر قطع الأثاث لإضافتها للعقد:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
                  {products.map((p) => {
                    const inCart = cartItems.some((i) => i.productId === p.id);
                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                          inCart
                            ? "bg-rewaq-gold/10 border-rewaq-gold shadow-xs"
                            : "bg-slate-50 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">{p.woodType}</p>
                          <span className="text-xs font-mono font-bold text-emerald-700 mt-1 block">
                            {p.retailPrice.toLocaleString()} ج.م
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddToCart(p)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                            inCart
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-900 text-white hover:bg-slate-800"
                          }`}
                        >
                          {inCart ? "تمت الإضافة ✓" : "+ إضافة للعقد"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Items Swatches */}
                {cartItems.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs">
                    <span className="text-rewaq-gold font-bold block mb-2">تخصيص ألوان الأقمشة وحالة المخزون:</span>
                    <div className="space-y-2">
                      {cartItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                          <span>{item.productName} (×{item.quantity})</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-[10px]">لون القماش:</span>
                            <input
                              type="text"
                              value={item.fabricColor}
                              onChange={(e) => {
                                const updated = [...cartItems];
                                updated[idx].fabricColor = e.target.value;
                                setCartItems(updated);
                              }}
                              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    السابق
                  </button>
                  <button
                    type="button"
                    disabled={cartItems.length === 0}
                    onClick={() => setWizardStep(3)}
                    className="bg-slate-900 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-slate-800 transition cursor-pointer flex items-center gap-2"
                  >
                    <span>المتابعة للحساب والعربون</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Financials & Deposit Calculation */}
            {wizardStep === 3 && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono">
                  <div>
                    <span className="text-slate-400 block font-sans text-[11px]">إجمالي الأصناف:</span>
                    <strong className="text-sm font-bold text-slate-900">{cartSubtotal.toLocaleString()} ج</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-sans text-[11px]">الصافي بعد الخصم:</span>
                    <strong className="text-sm font-bold text-emerald-700">{netTotal.toLocaleString()} ج</strong>
                  </div>
                  <div className="border-r border-slate-200 pr-3">
                    <span className="text-amber-600 block font-sans text-[11px] font-bold">باقي الحساب عند الباب:</span>
                    <strong className="text-base font-black text-amber-700">{remainingDue.toLocaleString()} ج</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">قيمة الخصم الممنوح (ج.م)</label>
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-rewaq-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-emerald-800 mb-1">العربون المدفوع الآن (كاش / فيزا) *</label>
                    <input
                      type="number"
                      required
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-full bg-emerald-50/60 border border-emerald-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">طريقة سداد العربون</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "CASH", label: "كاش بالفرع" },
                      { id: "VISA", label: "فيزا POS" },
                      { id: "INSTAPAY", label: "انستاباي" },
                      { id: "VALU", label: "تقسيط فاليو" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          paymentMethod === m.id
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    السابق
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(4)}
                    className="bg-slate-900 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-slate-800 transition cursor-pointer flex items-center gap-2"
                  >
                    <span>المتابعة لجدولة الشحن</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Shipping & Final Assembly */}
            {wizardStep === 4 && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تاريخ الاستلام والتسليم المتفق عليه *</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-rewaq-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">عنوان التسليم بالتفصيل</label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 flex items-center justify-between">
                  <div>
                    <span className="font-bold block">إرسال فني تركيب مع الشحنة (نجار / كهربائي)</span>
                    <span className="text-[11px] text-blue-700">تجميع القطع وضبطها داخل شقة العميل</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={needsAssembly}
                    onChange={(e) => setNeedsAssembly(e.target.checked)}
                    className="w-4 h-4 accent-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">شروط وملاحظات العقد</label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold"
                  ></textarea>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    السابق
                  </button>
                  <button
                    type="button"
                    onClick={handleFinishWizard}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-6 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد التعاقد وحفظ الفاتورة الرسمية</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Contract Confirmed & Printed */}
            {wizardStep === 5 && completedOrder && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-xl shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-black text-slate-900">تم تسجيل التعاقد وحجز العربون بنجاح!</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  رقم العقد: <strong className="font-mono text-slate-900">{completedOrder.orderNumber}</strong> | العميل: <strong>{completedOrder.customerName}</strong>
                </p>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 max-w-md mx-auto space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>إجمالي العقد:</span>
                    <strong>{completedOrder.netAmount.toLocaleString()} ج</strong>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>العربون المستلم بالخزينة:</span>
                    <strong>{completedOrder.depositPaid.toLocaleString()} ج</strong>
                  </div>
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>باقي الحساب عند الاستلام:</span>
                    <strong>{completedOrder.remainingDue.toLocaleString()} ج</strong>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrderForPrint(completedOrder);
                      setShowWizard(false);
                    }}
                    className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-rewaq-gold" />
                    <span>طباعة وثيقة العقد A4</span>
                  </button>

                  <a
                    href={`https://wa.me/2${completedOrder.customerPhone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-emerald-500 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>إرسال إيصال العربون واتساب</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowWizard(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 5. Collect Payment Modal */}
      {selectedOrderForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900 relative">
            <button
              onClick={() => setSelectedOrderForPayment(null)}
              className="absolute top-5 left-5 text-slate-400 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-slate-900 mb-1">استلام دفعة / سداد باقي العقد</h3>
            <p className="text-xs text-slate-500 mb-4">
              عقد رقم: <strong className="font-mono">{selectedOrderForPayment.orderNumber}</strong> ({selectedOrderForPayment.customerName})
            </p>

            <form onSubmit={handleCollectPaymentSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-mono">
                <span>المبلغ المتبقي حالياً: </span>
                <strong className="text-sm font-black">{selectedOrderForPayment.remainingDue.toLocaleString()} ج.م</strong>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المبلغ المحصل الآن (ج.م) *</label>
                <input
                  type="number"
                  required
                  value={paymentInput}
                  onChange={(e) => setPaymentInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:border-rewaq-gold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForPayment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  تأكيد التحصيل وتوريد الخزينة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Official A4 Contract Document Preview Modal */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 text-slate-900 my-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-950 text-rewaq-gold flex items-center justify-center font-bold text-sm">
                  REWAQ
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">عقد بيع وتوريد أثاث رسمي</h3>
                  <p className="text-[11px] text-slate-500">رِواق لتجارة الأثاث والديكور — {selectedOrderForPrint.branch}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderForPrint(null)}
                className="text-slate-400 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contract Body Document */}
            <div className="space-y-4 text-xs leading-relaxed border p-6 rounded-2xl bg-slate-50/50">
              <div className="flex justify-between border-b pb-3 text-slate-700">
                <div>
                  <span>رقم العقد: </span>
                  <strong className="font-mono text-slate-900">{selectedOrderForPrint.orderNumber}</strong>
                </div>
                <div>
                  <span>تاريخ التعاقد: </span>
                  <strong className="font-mono">{selectedOrderForPrint.createdAt}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 text-slate-800">
                <div>
                  <span className="text-slate-400 block">بيانات السيد / السيدة:</span>
                  <strong>{selectedOrderForPrint.customerName}</strong> ({selectedOrderForPrint.customerPhone})
                </div>
                <div>
                  <span className="text-slate-400 block">عنوان التسليم:</span>
                  <strong>{selectedOrderForPrint.deliveryAddress}</strong>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-2">
                <span className="font-bold text-slate-900 block mb-1">المواصفات والقطع المعتمدة:</span>
                <table className="w-full text-right text-xs bg-white rounded-xl border">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold">
                      <th className="p-2">الصنف</th>
                      <th className="p-2">لون القماش المعتمد</th>
                      <th className="p-2">الكمية</th>
                      <th className="p-2">السعر</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrderForPrint.items.map((it, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2 font-bold">{it.productName}</td>
                        <td className="p-2 text-slate-600">{it.fabricColor}</td>
                        <td className="p-2 font-mono">1</td>
                        <td className="p-2 font-mono">{it.unitPrice.toLocaleString()} ج</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-white p-3.5 rounded-xl border font-mono space-y-1">
                <div className="flex justify-between">
                  <span>إجمالي القيمة:</span>
                  <strong>{selectedOrderForPrint.netAmount.toLocaleString()} ج.م</strong>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>العربون المسدد:</span>
                  <strong>{selectedOrderForPrint.depositPaid.toLocaleString()} ج.م</strong>
                </div>
                <div className="flex justify-between text-amber-700 font-bold border-t pt-1">
                  <span>المتبقي عند الاستلام:</span>
                  <strong>{selectedOrderForPrint.remainingDue.toLocaleString()} ج.م</strong>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrderForPrint(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-800"
              >
                <Printer className="w-4 h-4 text-rewaq-gold" />
                <span>طباعة الوثيقة الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function POSPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">جاري تحميل نقاط البيع...</div>}>
      <POSContent />
    </Suspense>
  );
}
