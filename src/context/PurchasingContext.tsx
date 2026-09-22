"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import {
  Supplier,
  SupplierProduct,
  PurchaseRequest,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseReceiving,
  ReceivingItemQuality,
  SupplierInvoice,
  PurchaseReturn,
  SmartPurchaseSuggestion,
  PurchaseAuditLog,
  PurchasingSettings,
  PurchasingSummaryMetrics,
  PurchaseOrderStatus,
  PurchaseRequestStatus,
  ApprovalRuleConfig,
  ThreeWayMatchStatus,
} from "@/types/purchasing";
import { useShowroom } from "@/context/ShowroomContext";
import { useFinance } from "@/context/FinanceContext";
import {
  generatePurchaseInvoiceJournal,
  generatePurchaseReturnJournal,
  evaluateThreeWayMatch,
  formatEGP,
} from "@/lib/accountingEngine";

interface PurchasingContextType {
  // Suppliers & Products
  suppliers: Supplier[];
  supplierProducts: SupplierProduct[];
  addSupplier: (supplier: Omit<Supplier, "id" | "totalPurchases" | "totalPaid" | "balance" | "createdAt" | "performance" | "contacts" | "documents">) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  addSupplierProduct: (product: Omit<SupplierProduct, "id">) => SupplierProduct;
  updateSupplierProductPrice: (supplierProductId: string, newPrice: number, user: string) => void;

  // Purchase Requests
  purchaseRequests: PurchaseRequest[];
  createPurchaseRequest: (request: Omit<PurchaseRequest, "id" | "requestNumber" | "requestedAt" | "status" | "totalEstimatedAmount">) => PurchaseRequest;
  approvePurchaseRequest: (id: string, user: string) => void;
  rejectPurchaseRequest: (id: string, user: string, reason: string) => void;
  convertPRToPO: (requestId: string, user: string, targetWarehouseId?: string) => PurchaseOrder | null;

  // Purchase Orders
  purchaseOrders: PurchaseOrder[];
  createPurchaseOrder: (order: Omit<PurchaseOrder, "id" | "poNumber" | "createdAt" | "status" | "subtotal" | "totalTax" | "grandTotal" | "receivingIds" | "invoiceIds" | "matchingStatus">) => PurchaseOrder;
  approvePurchaseOrder: (id: string, user: string) => { success: boolean; message: string };
  sendPOToSupplier: (id: string, user: string) => void;
  cancelPurchaseOrder: (id: string, user: string, reason: string) => void;

  // Goods Receiving & Quality
  receivings: PurchaseReceiving[];
  receiveGoods: (data: {
    poId: string;
    deliveryNoteNumber?: string;
    driverName?: string;
    receiverName: string;
    items: ReceivingItemQuality[];
    notes?: string;
  }) => PurchaseReceiving;

  // Supplier Invoices & 3-Way Matching
  supplierInvoices: SupplierInvoice[];
  createSupplierInvoice: (data: {
    supplierInvoiceRef: string;
    poId: string;
    receivingId?: string;
    invoiceDate: string;
    dueDate: string;
    items: { productId: string; productName: string; quantity: number; unitPrice: number; taxAmount: number; total: number }[];
    notes?: string;
    user: string;
  }) => { invoice: SupplierInvoice; warnings: string[] };

  // Purchase Returns
  purchaseReturns: PurchaseReturn[];
  createPurchaseReturn: (data: {
    supplierId: string;
    poId: string;
    receivingId?: string;
    reason: PurchaseReturn["reason"];
    items: { productId: string; productName: string; quantity: number; unitPrice: number; taxAmount: number; total: number; defectReason: string }[];
    notes?: string;
    user: string;
  }) => PurchaseReturn;

  // Smart Suggestions & Analytics
  suggestions: SmartPurchaseSuggestion[];
  metrics: PurchasingSummaryMetrics;
  auditLogs: PurchaseAuditLog[];
  settings: PurchasingSettings;
  updateSettings: (updates: Partial<PurchasingSettings>) => void;

  // AI Assistant Engine
  askPurchasingAI: (query: string) => {
    answer: string;
    metrics?: { label: string; value: string; isGood?: boolean }[];
    relatedAction?: { label: string; href: string };
  };
}

const PurchasingContext = createContext<PurchasingContextType | undefined>(undefined);

export function PurchasingProvider({ children }: { children: React.ReactNode }) {
  const { products, stockLevels, stockReservations, orders: contractOrders, warehouses, adjustStock } = useShowroom();
  const { createJournalEntry, postJournalEntry } = useFinance();

  // 1. Settings State
  const [settings, setSettings] = useState<PurchasingSettings>({
    defaultVatRate: 0.14,
    autoSuggestOnReorderPoint: true,
    safetyStockBufferDays: 14,
    priceDiscrepancyTolerancePercent: 2.0,
    qtyDiscrepancyTolerancePercent: 0.0,
    defaultWarehouseId: "wh-damietta-main",
    defaultBranchId: "branch-cairo",
    approvalRules: [
      {
        id: "rule-1",
        branchId: "ALL",
        branchName: "جميع الفروع",
        role: "PURCHASE_OFFICER",
        maxApprovalLimit: 25000,
        requiresHigherApprovalAbove: 25000,
        isActive: true,
      },
      {
        id: "rule-2",
        branchId: "ALL",
        branchName: "جميع الفروع",
        role: "PURCHASING_MANAGER",
        maxApprovalLimit: 150000,
        requiresHigherApprovalAbove: 150000,
        isActive: true,
      },
      {
        id: "rule-3",
        branchId: "ALL",
        branchName: "الإدارة العامة",
        role: "GENERAL_MANAGER",
        maxApprovalLimit: 10000000,
        requiresHigherApprovalAbove: 10000000,
        isActive: true,
      },
    ],
  });

  // 2. Initial Suppliers (Egyptian Furniture Ecosystem)
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "sup-001",
      code: "SUP-001",
      nameAr: "مصنع رِواق للأخشاب الطبيعية - دمياط",
      nameEn: "Rewaq Damietta Woodworks",
      commercialRegistration: "109482-دمياط",
      taxId: "402-918-723",
      category: "NATURAL_WOOD",
      contactPerson: "م. أشرف التابعي",
      phone: "01004829104",
      email: "damietta-wood@rewaq-factory.eg",
      city: "دمياط",
      address: "المنطقة الصناعية الجديدة - دمياط",
      status: "ACTIVE",
      paymentTerms: "NET_30",
      paymentTermsDays: 30,
      currency: "EGP",
      accountCode: "2010",
      totalPurchases: 1450000,
      totalPaid: 1250000,
      balance: 200000,
      creditLimit: 500000,
      rating: 4.9,
      notes: "المورد والمصنع الرئيسي لهياكل الخشب الزان الأحمر الروماني والآرو",
      performance: {
        onTimeDeliveryRate: 96,
        quantityFulfillmentRate: 99,
        averageLeadTimeDays: 12,
        qualityDefectRate: 1.2,
        totalOrdersFulfilled: 42,
        priceStabilityScore: "HIGH",
      },
      contacts: [
        { name: "م. أشرف التابعي", role: "مدير المصنع", phone: "01004829104", email: "ashraf@rewaq-damietta.com", isPrimary: true },
        { name: "أ. محمود ربيع", role: "مسؤول اللوجستيات والشحن", phone: "01284729100", isPrimary: false },
      ],
      documents: [
        { id: "doc-1", title: "السجل التجاري والبطاقة الضريبية 2026", fileType: "PDF", uploadedAt: "2026-01-10" },
        { id: "doc-2", title: "شهادة منشأ خشب زان مجفف أفران", fileType: "PDF", uploadedAt: "2026-03-05" },
      ],
      createdAt: "2026-01-01",
    },
    {
      id: "sup-002",
      code: "SUP-002",
      nameAr: "شركة النساجون للأقمشة الفاخرة والمفروشات",
      nameEn: "Weavers Luxury Fabrics Co",
      commercialRegistration: "88419-القاهرة",
      taxId: "512-883-991",
      category: "FABRICS_UPHOLSTERY",
      contactPerson: "أ. طارق عبد الرحمن",
      phone: "01129384756",
      email: "sales@weavers-textiles.com.eg",
      city: "العاشر من رمضان",
      address: "المنطقة الصناعية B3 - العاشر من رمضان",
      status: "ACTIVE",
      paymentTerms: "NET_15",
      paymentTermsDays: 15,
      currency: "EGP",
      accountCode: "2010",
      totalPurchases: 620000,
      totalPaid: 540000,
      balance: 80000,
      creditLimit: 200000,
      rating: 4.7,
      notes: "مورد معتمد لأقمشة الكتان الإسباني والقطيفة المعالجة ضد البقع",
      performance: {
        onTimeDeliveryRate: 92,
        quantityFulfillmentRate: 97,
        averageLeadTimeDays: 7,
        qualityDefectRate: 1.5,
        totalOrdersFulfilled: 28,
        priceStabilityScore: "MEDIUM",
      },
      contacts: [
        { name: "أ. طارق عبد الرحمن", role: "مدير المبيعات التجارية", phone: "01129384756", isPrimary: true },
      ],
      documents: [
        { id: "doc-3", title: "كتالوج عينات خريف 2026 ومواصفات مقاومة البقع", fileType: "PDF", uploadedAt: "2026-02-15" },
      ],
      createdAt: "2026-01-15",
    },
    {
      id: "sup-003",
      code: "SUP-003",
      nameAr: "الشركة المصرية للإسفنج والتبطين الطبي (فوم تك)",
      nameEn: "FoamTech Egypt Medical Foam",
      commercialRegistration: "44912-الجيزة",
      taxId: "319-440-128",
      category: "FOAM_SPONGE",
      contactPerson: "ك/ حسام متولي",
      phone: "01099887766",
      email: "orders@foamtech-eg.com",
      city: "6 أكتوبر",
      address: "المنطقة الصناعية الثالثة - 6 أكتوبر",
      status: "ACTIVE",
      paymentTerms: "NET_30",
      paymentTermsDays: 30,
      currency: "EGP",
      accountCode: "2010",
      totalPurchases: 380000,
      totalPaid: 340000,
      balance: 40000,
      creditLimit: 150000,
      rating: 4.8,
      notes: "إسفنج سوفت ريباوند 35kg/m3 وهابيتات طبي",
      performance: {
        onTimeDeliveryRate: 95,
        quantityFulfillmentRate: 100,
        averageLeadTimeDays: 5,
        qualityDefectRate: 0.8,
        totalOrdersFulfilled: 19,
        priceStabilityScore: "HIGH",
      },
      contacts: [
        { name: "ك/ حسام متولي", role: "مسؤول العقود", phone: "01099887766", isPrimary: true },
      ],
      documents: [],
      createdAt: "2026-02-01",
    },
    {
      id: "sup-004",
      code: "SUP-004",
      nameAr: "مؤسسة الأهرام للزجاج والرخام الإسباني والمعادن",
      nameEn: "Al Ahram Glass & Marble",
      commercialRegistration: "77210-القاهرة",
      taxId: "294-118-005",
      category: "GLASS_METALS",
      contactPerson: "م. شريف جلال",
      phone: "01221199334",
      email: "info@ahram-glassmetal.eg",
      city: "القاهرة",
      address: "شق الثعبان - طرة - القاهرة",
      status: "ACTIVE",
      paymentTerms: "CASH",
      paymentTermsDays: 0,
      currency: "EGP",
      accountCode: "2010",
      totalPurchases: 290000,
      totalPaid: 290000,
      balance: 0,
      creditLimit: 100000,
      rating: 4.4,
      notes: "رخام كرارا إيطالي وسيكوريت 10مم وإستانلس ستيل ذهبي PVD",
      performance: {
        onTimeDeliveryRate: 88,
        quantityFulfillmentRate: 94,
        averageLeadTimeDays: 9,
        qualityDefectRate: 2.8,
        totalOrdersFulfilled: 14,
        priceStabilityScore: "VOLATILE",
      },
      contacts: [
        { name: "م. شريف جلال", role: "المشرف العام", phone: "01221199334", isPrimary: true },
      ],
      documents: [],
      createdAt: "2026-02-10",
    },
    {
      id: "sup-005",
      code: "SUP-005",
      nameAr: "المتحدة لإكسسوارات الأثاث والمفصلات الهيدروليك",
      nameEn: "United Furniture Hardware",
      commercialRegistration: "63219-الإسكندرية",
      taxId: "189-550-911",
      category: "HARDWARE_HANDLES",
      contactPerson: "أ. نادر فوزي",
      phone: "01066442211",
      email: "sales@united-hardware.com.eg",
      city: "الإسكندرية",
      address: "برج العرب الصناعية",
      status: "ACTIVE",
      paymentTerms: "NET_45",
      paymentTermsDays: 45,
      currency: "EGP",
      accountCode: "2010",
      totalPurchases: 180000,
      totalPaid: 180000,
      balance: 0,
      creditLimit: 100000,
      rating: 4.6,
      notes: "مفصلات سوفت كلوز ومجرى أدراج تركي أصلية",
      performance: {
        onTimeDeliveryRate: 98,
        quantityFulfillmentRate: 100,
        averageLeadTimeDays: 4,
        qualityDefectRate: 0.5,
        totalOrdersFulfilled: 15,
        priceStabilityScore: "HIGH",
      },
      contacts: [
        { name: "أ. نادر فوزي", role: "مدير الحسابات", phone: "01066442211", isPrimary: true },
      ],
      documents: [],
      createdAt: "2026-02-15",
    },
  ]);

  // 3. Initial Supplier Product Matrix (Item-Supplier mapping with prices & lead times)
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([
    {
      id: "sp-01",
      supplierId: "sup-001",
      supplierName: "مصنع رِواق للأخشاب الطبيعية - دمياط",
      productId: "prod-sofa-verona",
      productName: "صوفا فيرونا الفاخرة 3 مقاعد - زان روماني",
      category: "غرف المعيشة",
      supplierSku: "DM-SOFA-VR01",
      purchasePrice: 18500,
      lastPrice: 17200,
      priceChangeDate: "2026-08-10",
      minOrderQuantity: 3,
      leadTimeDays: 14,
      lastPurchaseDate: "2026-09-01",
      isPreferred: true,
      notes: "خشب زان أحمر مجفف مع تنجيد فوم 35",
    },
    {
      id: "sp-02",
      supplierId: "sup-001",
      supplierName: "مصنع رِواق للأخشاب الطبيعية - دمياط",
      productId: "prod-dining-milano",
      productName: "طاولة طعام ميلانو الرخامية مع 6 كراسي",
      category: "غرف الطعام",
      supplierSku: "DM-DINING-ML02",
      purchasePrice: 24500,
      lastPrice: 24500,
      priceChangeDate: "2026-07-01",
      minOrderQuantity: 2,
      leadTimeDays: 18,
      lastPurchaseDate: "2026-08-20",
      isPreferred: true,
      notes: "شاسيه زان مع تشطيب دهان دوكو فرن عالي الجودة",
    },
    {
      id: "sp-03",
      supplierId: "sup-001",
      supplierName: "مصنع رِواق للأخشاب الطبيعية - دمياط",
      productId: "prod-bed-florence",
      productName: "سرير فلورنسا الكينج مع هيدبورد كابوتنيه",
      category: "غرف النوم",
      supplierSku: "DM-BED-FL03",
      purchasePrice: 19800,
      lastPrice: 19800,
      minOrderQuantity: 2,
      leadTimeDays: 15,
      lastPurchaseDate: "2026-08-15",
      isPreferred: true,
    },
    {
      id: "sp-04",
      supplierId: "sup-002",
      supplierName: "شركة النساجون للأقمشة الفاخرة والمفروشات",
      productId: "prod-sofa-verona",
      productName: "صوفا فيرونا الفاخرة 3 مقاعد - زان روماني",
      category: "غرف المعيشة",
      supplierSku: "TX-VR-LINEN",
      purchasePrice: 19800,
      lastPrice: 19800,
      minOrderQuantity: 5,
      leadTimeDays: 18,
      lastPurchaseDate: "2026-06-12",
      isPreferred: false,
      notes: "يقدمون تجميع كامل مع مصنع وسيط بسعر أعلى",
    },
    {
      id: "sp-05",
      supplierId: "sup-004",
      supplierName: "مؤسسة الأهرام للزجاج والرخام الإسباني والمعادن",
      productId: "prod-center-table-gold",
      productName: "طاولة وسط إستانلس ذهبي مع سطح رخام كرارا",
      category: "طاولات وكماليات",
      supplierSku: "AH-CT-GOLD01",
      purchasePrice: 6200,
      lastPrice: 5800,
      priceChangeDate: "2026-09-05",
      minOrderQuantity: 4,
      leadTimeDays: 8,
      lastPurchaseDate: "2026-09-02",
      isPreferred: true,
    },
    {
      id: "sp-06",
      supplierId: "sup-005",
      supplierName: "المتحدة لإكسسوارات الأثاث والمفصلات الهيدروليك",
      productId: "prod-chair-accent-nordic",
      productName: "كرسي نورديك فوتيه مفرد مودرن",
      category: "كراسي ومفردات",
      supplierSku: "UN-CH-NRD09",
      purchasePrice: 4200,
      lastPrice: 4200,
      minOrderQuantity: 6,
      leadTimeDays: 7,
      lastPurchaseDate: "2026-08-28",
      isPreferred: true,
    },
  ]);

  // 4. Initial Purchase Requests
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([
    {
      id: "pr-001",
      requestNumber: "PR-2026-0041",
      branchId: "branch-cairo",
      branchName: "فرع التجمع الخامس",
      requestedBy: "سامح الدسوقي (مسؤول مبيعات الصالة)",
      department: "SHOWROOM",
      urgency: "HIGH",
      reason: "LOW_STOCK",
      reasonDetails: "رصيد صوفا فيرونا وصل إلى 3 وحدات مع وجود 4 حجوزات مؤكدة للتسليم الأسبوع القادم",
      items: [
        {
          id: "pri-1",
          productId: "prod-sofa-verona",
          productName: "صوفا فيرونا الفاخرة 3 مقاعد - زان روماني",
          category: "غرف المعيشة",
          quantity: 10,
          estimatedUnitPrice: 18500,
          estimatedTotal: 185000,
          preferredSupplierId: "sup-001",
          preferredSupplierName: "مصنع رِواق للأخشاب الطبيعية - دمياط",
        },
      ],
      totalEstimatedAmount: 185000,
      status: "APPROVED",
      requestedAt: "2026-09-18",
      requiredDate: "2026-10-02",
      approvedBy: "أحمد سمير (المدير العام)",
      approvedAt: "2026-09-19",
      notes: "معتمد للشراء الفوري ومطلوب إصدار أمر التوريد",
    },
    {
      id: "pr-002",
      requestNumber: "PR-2026-0042",
      branchId: "branch-damietta",
      branchName: "مستودع ومصنع دمياط",
      requestedBy: "كريم يونس (أمين المستودع الرئيسي)",
      department: "WAREHOUSE",
      urgency: "NORMAL",
      reason: "CONTRACT_DEMAND",
      reasonDetails: "طلب تعزيز مخزون طاولات الطعام الرخامية لتغطية عقود معارض أكتوبر والتجمع",
      items: [
        {
          id: "pri-2",
          productId: "prod-dining-milano",
          productName: "طاولة طعام ميلانو الرخامية مع 6 كراسي",
          category: "غرف الطعام",
          quantity: 6,
          estimatedUnitPrice: 24500,
          estimatedTotal: 147000,
          preferredSupplierId: "sup-001",
          preferredSupplierName: "مصنع رِواق للأخشاب الطبيعية - دمياط",
        },
      ],
      totalEstimatedAmount: 147000,
      status: "SUBMITTED",
      requestedAt: "2026-09-21",
      requiredDate: "2026-10-10",
      notes: "بانتظار اعتماد مدير المشتريات",
    },
  ]);

  // 5. Initial Purchase Orders
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: "po-1045",
      poNumber: "PO-2026-1045",
      supplierId: "sup-001",
      supplierName: "مصنع رِواق للأخشاب الطبيعية - دمياط",
      supplierTaxId: "402-918-723",
      branchId: "branch-cairo",
      branchName: "فرع التجمع الخامس",
      warehouseId: "wh-damietta-main",
      warehouseName: "مستودع التجمع الخامس الرئيسي",
      orderDate: "2026-09-10",
      expectedDeliveryDate: "2026-09-20", // Overdue slightly for smart alerts demo!
      paymentTerms: "NET_30",
      paymentTermsDays: 30,
      currency: "EGP",
      items: [
        {
          id: "poi-1",
          productId: "prod-sofa-verona",
          productName: "صوفا فيرونا الفاخرة 3 مقاعد - زان روماني",
          supplierSku: "DM-SOFA-VR01",
          unit: "قطعة",
          quantity: 20,
          receivedQuantity: 18,
          remainingQuantity: 2,
          damagedQuantity: 0,
          unitPrice: 18500,
          discount: 0,
          taxRate: 0.14,
          taxAmount: 51800,
          total: 421800,
        },
      ],
      subtotal: 370000,
      totalDiscount: 0,
      taxRate: 0.14,
      totalTax: 51800,
      grandTotal: 421800,
      notes: "توريد دفعة غرف معيشة للموسم الخريفي",
      status: "PARTIAL_RECEIVED",
      createdBy: "أحمد سمير (المدير العام)",
      createdAt: "2026-09-10",
      approvedBy: "أحمد سمير",
      approvedAt: "2026-09-10",
      sentAt: "2026-09-11",
      receivingIds: ["rcv-2026-081"],
      invoiceIds: ["pinv-2026-512"],
      matchingStatus: "DISCREPANCY",
      matchingNotes: "عجز 2 وحدة بين المستلم والمفوتر",
    },
    {
      id: "po-1046",
      poNumber: "PO-2026-1046",
      supplierId: "sup-004",
      supplierName: "مؤسسة الأهرام للزجاج والرخام الإسباني والمعادن",
      supplierTaxId: "294-118-005",
      branchId: "branch-cairo",
      branchName: "فرع التجمع الخامس",
      warehouseId: "wh-cairo-showroom",
      warehouseName: "مستودع فرع التجمع الخامس",
      orderDate: "2026-09-16",
      expectedDeliveryDate: "2026-09-24",
      paymentTerms: "CASH",
      paymentTermsDays: 0,
      currency: "EGP",
      items: [
        {
          id: "poi-2",
          productId: "prod-center-table-gold",
          productName: "طاولة وسط إستانلس ذهبي مع سطح رخام كرارا",
          supplierSku: "AH-CT-GOLD01",
          unit: "طاولة",
          quantity: 8,
          receivedQuantity: 8,
          remainingQuantity: 0,
          damagedQuantity: 0,
          unitPrice: 6200,
          discount: 0,
          taxRate: 0.14,
          taxAmount: 6944,
          total: 56544,
        },
      ],
      subtotal: 49600,
      totalDiscount: 0,
      taxRate: 0.14,
      totalTax: 6944,
      grandTotal: 56544,
      notes: "طاولات وسط صالة العرض الكبرى",
      status: "FULLY_RECEIVED",
      createdBy: "حازم إبراهيم (مسؤول مشتريات)",
      createdAt: "2026-09-16",
      approvedBy: "أحمد سمير",
      approvedAt: "2026-09-16",
      sentAt: "2026-09-17",
      receivingIds: ["rcv-2026-082"],
      invoiceIds: [],
      matchingStatus: "MATCHED",
    },
    {
      id: "po-1047",
      poNumber: "PO-2026-1047",
      supplierId: "sup-005",
      supplierName: "المتحدة لإكسسوارات الأثاث والمفصلات الهيدروليك",
      supplierTaxId: "189-550-911",
      branchId: "branch-october",
      branchName: "فرع 6 أكتوبر",
      warehouseId: "wh-october-mall",
      warehouseName: "مستودع فرع أكتوبر",
      orderDate: "2026-09-20",
      expectedDeliveryDate: "2026-09-27",
      paymentTerms: "NET_45",
      paymentTermsDays: 45,
      currency: "EGP",
      items: [
        {
          id: "poi-3",
          productId: "prod-chair-accent-nordic",
          productName: "كرسي نورديك فوتيه مفرد مودرن",
          supplierSku: "UN-CH-NRD09",
          unit: "كرسي",
          quantity: 12,
          receivedQuantity: 0,
          remainingQuantity: 12,
          damagedQuantity: 0,
          unitPrice: 4200,
          discount: 0,
          taxRate: 0.14,
          taxAmount: 7056,
          total: 57456,
        },
      ],
      subtotal: 50400,
      totalDiscount: 0,
      taxRate: 0.14,
      totalTax: 7056,
      grandTotal: 57456,
      notes: "شحنة كراسي إضافية لتجهيز جناح غرف المعيشة",
      status: "SENT",
      createdBy: "حازم إبراهيم",
      createdAt: "2026-09-20",
      approvedBy: "أحمد سمير",
      approvedAt: "2026-09-20",
      sentAt: "2026-09-21",
      receivingIds: [],
      invoiceIds: [],
      matchingStatus: "NOT_MATCHED",
    },
  ]);

  // 6. Initial Goods Receivings
  const [receivings, setReceivings] = useState<PurchaseReceiving[]>([
    {
      id: "rcv-2026-081",
      receivingNumber: "RCV-2026-081",
      poId: "po-1045",
      poNumber: "PO-2026-1045",
      supplierId: "sup-001",
      supplierName: "مصنع رِواق للأخشاب الطبيعية - دمياط",
      destinationBranch: "فرع التجمع الخامس",
      destinationWarehouse: "مستودع التجمع الخامس الرئيسي",
      destinationWarehouseId: "wh-damietta-main",
      date: "2026-09-18",
      receiverName: "كريم يونس (مسؤول الفحص والاستلام)",
      deliveryNoteNumber: "DN-DAM-9921",
      driverName: "عم صبحي (سيارة نقل دمياط)",
      driverPhone: "01099228833",
      items: [
        {
          productId: "prod-sofa-verona",
          productName: "صوفا فيرونا الفاخرة 3 مقاعد - زان روماني",
          orderedQty: 20,
          expectedQty: 20,
          receivedQty: 18,
          goodQty: 16,
          damagedQty: 2,
          defectReason: "خدوش طفيفة في دهان القوائم الخشبية أثناء التشوين والنقل",
          actionOnDamaged: "RETURN_TO_SUPPLIER",
          warehouseLocationCode: "WH-A12",
        },
      ],
      totalOrderedQty: 20,
      totalReceivedQty: 18,
      totalGoodQty: 16,
      totalDamagedQty: 2,
      status: "WITH_DISCREPANCY",
      notes: "تم استلام 16 وحدة سليمة وتسكينها، و2 وحدة بها خدوش تم عزلها لإعادتها للمصنع",
      inventoryStockMovementIds: ["mov-rcv-01"],
      createdAt: "2026-09-18",
    },
    {
      id: "rcv-2026-082",
      receivingNumber: "RCV-2026-082",
      poId: "po-1046",
      poNumber: "PO-2026-1046",
      supplierId: "sup-004",
      supplierName: "مؤسسة الأهرام للزجاج والرخام الإسباني والمعادن",
      destinationBranch: "فرع التجمع الخامس",
      destinationWarehouse: "مستودع فرع التجمع الخامس",
      destinationWarehouseId: "wh-cairo-showroom",
      date: "2026-09-19",
      receiverName: "كريم يونس",
      deliveryNoteNumber: "DN-AH-412",
      items: [
        {
          productId: "prod-center-table-gold",
          productName: "طاولة وسط إستانلس ذهبي مع سطح رخام كرارا",
          orderedQty: 8,
          expectedQty: 8,
          receivedQty: 8,
          goodQty: 8,
          damagedQty: 0,
          warehouseLocationCode: "WH-B04",
        },
      ],
      totalOrderedQty: 8,
      totalReceivedQty: 8,
      totalGoodQty: 8,
      totalDamagedQty: 0,
      status: "RECEIVED_FULL",
      notes: "استلام مطابق بالكامل دون أي ملاحظات",
      inventoryStockMovementIds: ["mov-rcv-02"],
      createdAt: "2026-09-19",
    },
  ]);

  // 7. Initial Supplier Invoices
  const [supplierInvoices, setSupplierInvoices] = useState<SupplierInvoice[]>([
    {
      id: "pinv-2026-512",
      invoiceNumber: "PINV-2026-512",
      supplierInvoiceRef: "INV-DAM-8834",
      supplierId: "sup-001",
      supplierName: "مصنع رِواق للأخشاب الطبيعية - دمياط",
      supplierTaxId: "402-918-723",
      poId: "po-1045",
      poNumber: "PO-2026-1045",
      receivingId: "rcv-2026-081",
      receivingNumber: "RCV-2026-081",
      invoiceDate: "2026-09-18",
      dueDate: "2026-10-18",
      items: [
        {
          productId: "prod-sofa-verona",
          productName: "صوفا فيرونا الفاخرة 3 مقاعد - زان روماني",
          quantity: 20, // Supplier billed full 20 while receiving had 18! Triggers 3-way match warning
          unitPrice: 18500,
          taxAmount: 51800,
          total: 421800,
        },
      ],
      subtotal: 370000,
      taxAmount: 51800,
      totalAmount: 421800,
      paidAmount: 0,
      remainingAmount: 421800,
      paymentStatus: "UNPAID",
      paymentTerms: "NET_30",
      matchStatus: "QUANTITY_MISMATCH",
      matchDiscrepancyNotes: "المورد أصدر الفاتورة بالكامل لـ 20 وحدة بينما الاستلام الفعلي بالمستودع 18 وحدة فقط",
      journalEntryId: "je-pinv-512",
      createdBy: "أحمد سمير",
      createdAt: "2026-09-18",
      notes: "بانتظار تسوية العجز أو إصدار إشعار خصم (Credit/Debit Note)",
    },
  ]);

  // 8. Initial Purchase Returns
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>([
    {
      id: "pret-001",
      returnNumber: "PRET-2026-014",
      supplierId: "sup-001",
      supplierName: "مصنع رِواق للأخشاب الطبيعية - دمياط",
      poId: "po-1045",
      poNumber: "PO-2026-1045",
      receivingId: "rcv-2026-081",
      receivingNumber: "RCV-2026-081",
      items: [
        {
          productId: "prod-sofa-verona",
          productName: "صوفا فيرونا الفاخرة 3 مقاعد - زان روماني",
          quantity: 2,
          unitPrice: 18500,
          taxAmount: 5180,
          total: 42180,
          defectReason: "خدوش بالقوائم الخشبية تستوجب إعادة الطلاء بالمصنع",
        },
      ],
      totalQuantity: 2,
      subtotal: 37000,
      taxAmount: 5180,
      totalRefundAmount: 42180,
      date: "2026-09-19",
      reason: "DEFECTIVE_DAMAGED",
      status: "SENT_TO_SUPPLIER",
      inventoryDeducted: true,
      debitNoteNumber: "DBN-2026-04",
      journalEntryId: "je-pret-014",
      createdBy: "كريم يونس",
      createdAt: "2026-09-19",
      notes: "تم شحن القطعتين على نفس سيارة المصنع لإعادة الفحص والدهان",
    },
  ]);

  // 9. Initial Audit Logs
  const [auditLogs, setAuditLogs] = useState<PurchaseAuditLog[]>([
    {
      id: "log-1",
      timestamp: "2026-09-20 14:30",
      user: "أحمد سمير (المدير العام)",
      action: "APPROVE",
      entityType: "PURCHASE_ORDER",
      entityId: "po-1047",
      entityReference: "PO-2026-1047",
      description: "اعتماد أمر الشراء بقيمة 57,456 ج.م وإرساله للمورد",
    },
    {
      id: "log-2",
      timestamp: "2026-09-19 11:15",
      user: "كريم يونس",
      action: "RETURN",
      entityType: "RETURN",
      entityId: "pret-001",
      entityReference: "PRET-2026-014",
      description: "إصدار إذن مرتجع لعدد 2 وحدة تالفة لأمر PO-2026-1045",
    },
  ]);

  const logAction = (entry: Omit<PurchaseAuditLog, "id" | "timestamp">) => {
    const newLog: PurchaseAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      ...entry,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // 10. Real-time Smart Suggestions Engine (Inventory + Contracts + Sales Velocity + Lead Times)
  const suggestions = useMemo<SmartPurchaseSuggestion[]>(() => {
    const result: SmartPurchaseSuggestion[] = [];

    // Analyze each product in catalog
    products.forEach((prod) => {
      // 1. Calculate physical available vs reserved
      const prodStockList = stockLevels.filter((sl) => sl.productId === prod.id);
      const totalOnHand = prodStockList.reduce((sum, sl) => sum + sl.onHand, 0);
      const totalReserved = prodStockList.reduce((sum, sl) => sum + sl.reserved, 0);
      const netAvailable = Math.max(0, totalOnHand - totalReserved);

      // 2. Calculate confirmed demand from contract orders not yet delivered
      const openContractOrders = contractOrders.filter(
        (o) => o.status === "BOOKED" || o.status === "PREPARING" || o.status === "PENDING_DEPOSIT"
      );
      const contractQtyDemand = openContractOrders.reduce((sum, order) => {
        const item = order.items.find((i) => i.productId === prod.id || i.productName.includes(prod.name));
        return sum + (item ? item.quantity : 0);
      }, 0);

      // 3. Calculate open POs currently ordered but not yet received
      const openPoQty = purchaseOrders
        .filter((po) => po.status === "APPROVED" || po.status === "SENT" || po.status === "PARTIAL_RECEIVED")
        .reduce((sum, po) => {
          const item = po.items.find((i) => i.productId === prod.id || i.productName.includes(prod.name));
          return sum + (item ? item.remainingQuantity : 0);
        }, 0);

      // 4. Estimation parameters
      const avgMonthlySales = prod.category === "غرف المعيشة" ? 14 : prod.category === "غرف الطعام" ? 8 : 6;
      const reorderPoint = prod.minStockThreshold || 5;
      const leadTimeDays = prod.leadTimeDays || 14;

      // Check shortage triggers:
      // A) Net Available is below zero or less than 3 days of sales
      // B) Total On-Hand + Open POs < Total Reserved + Reorder Point
      const totalExpectedStock = totalOnHand + openPoQty;
      const totalCommittedStock = totalReserved + reorderPoint;
      const isShortage = totalExpectedStock < totalCommittedStock || netAvailable < reorderPoint;

      if (isShortage) {
        const recommendedSupplierMapping = supplierProducts.find((sp) => sp.productId === prod.id && sp.isPreferred) ||
          supplierProducts.find((sp) => sp.productId === prod.id) || {
            supplierId: "sup-001",
            supplierName: "مصنع رِواق للأخشاب الطبيعية - دمياط",
            purchasePrice: prod.costPrice || 15000,
            leadTimeDays: 14,
          };

        const alternativeSuppliers = supplierProducts
          .filter((sp) => sp.productId === prod.id && sp.supplierId !== recommendedSupplierMapping.supplierId)
          .map((sp) => ({
            supplierId: sp.supplierId,
            supplierName: sp.supplierName,
            price: sp.purchasePrice,
            leadTimeDays: sp.leadTimeDays,
            rating: 4.5,
          }));

        const deficit = totalCommittedStock - totalExpectedStock;
        const suggestedOrderQty = Math.max(
          recommendedSupplierMapping && 'minOrderQuantity' in recommendedSupplierMapping ? (recommendedSupplierMapping as SupplierProduct).minOrderQuantity : 5,
          Math.ceil(deficit + (avgMonthlySales / 2))
        );

        let urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
        let primaryReason = "";
        let whyExplanation = "";

        if (netAvailable <= 2 && totalReserved > netAvailable) {
          urgency = "CRITICAL";
          primaryReason = "المخزون المتاح لا يغطي العقود المؤكدة للتسليم";
          whyExplanation = `المخزون المتاح (${netAvailable}) أقل من المحجوز للعملاء (${totalReserved}). يوجد عجز مباشر في تلبية مواعيد التسليم القادمة.`;
        } else if (netAvailable <= reorderPoint) {
          urgency = "HIGH";
          primaryReason = "الرصيد وصل لحد إعادة الطلب الأدنى";
          whyExplanation = `المتاح (${netAvailable}) وصل إلى حد الأمان (${reorderPoint}) مع معدل سحب شهري ${avgMonthlySales} وحدة وفترة توريد ${leadTimeDays} يوم.`;
        } else {
          urgency = "MEDIUM";
          primaryReason = "تأمين المخزون لمواجهة الطلب المتوقع";
          whyExplanation = `استناداً إلى متوسط مبيعات ${avgMonthlySales} شهرياً وفترة توريد ${leadTimeDays} يوم.`;
        }

        result.push({
          id: `sug-${prod.id}`,
          productId: prod.id,
          productName: prod.name,
          category: prod.category,
          currentAvailableStock: netAvailable,
          reservedStockForContracts: totalReserved,
          openPoQuantity: openPoQty,
          averageMonthlySales: avgMonthlySales,
          salesVelocityScore: avgMonthlySales > 10 ? "HIGH" : "MEDIUM",
          leadTimeDays: recommendedSupplierMapping.leadTimeDays,
          reorderPoint,
          suggestedOrderQty,
          urgency,
          primaryReason,
          whyExplanation,
          recommendedSupplierId: recommendedSupplierMapping.supplierId,
          recommendedSupplierName: recommendedSupplierMapping.supplierName,
          recommendedSupplierPrice: recommendedSupplierMapping.purchasePrice,
          estimatedTotalCost: suggestedOrderQty * recommendedSupplierMapping.purchasePrice,
          alternativeSuppliers,
          isContractDriven: totalReserved > 0,
        });
      }
    });

    return result;
  }, [products, stockLevels, contractOrders, purchaseOrders, supplierProducts]);

  // 11. Purchasing Summary Metrics
  const metrics = useMemo<PurchasingSummaryMetrics>(() => {
    const totalPurchasesThisMonth = purchaseOrders
      .filter((po) => po.status !== "CANCELLED" && po.status !== "DRAFT")
      .reduce((sum, po) => sum + po.grandTotal, 0);

    const totalOrdersThisMonth = purchaseOrders.length;
    const pendingApprovalOrders = purchaseOrders.filter((po) => po.status === "PENDING_APPROVAL");
    const pendingApprovalCount = pendingApprovalOrders.length;
    const pendingApprovalValue = pendingApprovalOrders.reduce((sum, po) => sum + po.grandTotal, 0);

    const orderedInTransitCount = purchaseOrders.filter((po) => po.status === "SENT").length;
    const partiallyReceivedCount = purchaseOrders.filter((po) => po.status === "PARTIAL_RECEIVED").length;

    // Overdue orders: expected delivery date is in the past and not fully received
    const todayStr = new Date().toISOString().split("T")[0];
    const overdueOrdersCount = purchaseOrders.filter(
      (po) =>
        (po.status === "SENT" || po.status === "PARTIAL_RECEIVED" || po.status === "APPROVED") &&
        po.expectedDeliveryDate < todayStr
    ).length;

    const outstandingPayables = suppliers.reduce((sum, s) => sum + s.balance, 0);

    const lowStockItemsCount = suggestions.filter((s) => s.urgency === "HIGH" || s.urgency === "CRITICAL").length;
    const outOfStockItemsCount = suggestions.filter((s) => s.currentAvailableStock === 0).length;
    const reservedItemsUnderShortage = suggestions.filter((s) => s.urgency === "CRITICAL").length;
    const activeSuppliersCount = suppliers.filter((s) => s.status === "ACTIVE").length;

    return {
      totalPurchasesThisMonth,
      totalOrdersThisMonth,
      pendingApprovalCount,
      pendingApprovalValue,
      orderedInTransitCount,
      overdueOrdersCount,
      partiallyReceivedCount,
      outstandingPayables,
      lowStockItemsCount,
      outOfStockItemsCount,
      reservedItemsUnderShortage,
      activeSuppliersCount,
    };
  }, [purchaseOrders, suppliers, suggestions]);

  // ----------------------------------------------------
  // ACTION HANDLERS
  // ----------------------------------------------------

  const addSupplier = (data: Omit<Supplier, "id" | "totalPurchases" | "totalPaid" | "balance" | "createdAt" | "performance" | "contacts" | "documents">): Supplier => {
    const newSupplier: Supplier = {
      ...data,
      id: `sup-${Date.now().toString().slice(-4)}`,
      totalPurchases: 0,
      totalPaid: 0,
      balance: 0,
      performance: {
        onTimeDeliveryRate: 100,
        quantityFulfillmentRate: 100,
        averageLeadTimeDays: data.paymentTermsDays || 10,
        qualityDefectRate: 0,
        totalOrdersFulfilled: 0,
        priceStabilityScore: "HIGH",
      },
      contacts: [
        {
          name: data.contactPerson,
          role: "المسؤول الرئيسي",
          phone: data.phone,
          email: data.email,
          isPrimary: true,
        },
      ],
      documents: [],
      createdAt: new Date().toISOString().split("T")[0],
    };

    setSuppliers(prev => [newSupplier, ...prev]);
    logAction({
      user: "أحمد سمير",
      action: "CREATE",
      entityType: "SUPPLIER",
      entityId: newSupplier.id,
      entityReference: newSupplier.code,
      description: `إضافة مورد جديد: ${newSupplier.nameAr} (${newSupplier.category})`,
    });
    return newSupplier;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    logAction({
      user: "أحمد سمير",
      action: "UPDATE",
      entityType: "SUPPLIER",
      entityId: id,
      entityReference: id,
      description: `تحديث بيانات المورد #${id}`,
    });
  };

  const addSupplierProduct = (data: Omit<SupplierProduct, "id">): SupplierProduct => {
    const newSp: SupplierProduct = {
      ...data,
      id: `sp-${Date.now().toString().slice(-5)}`,
    };
    setSupplierProducts(prev => [newSp, ...prev]);
    return newSp;
  };

  const updateSupplierProductPrice = (supplierProductId: string, newPrice: number, user: string) => {
    setSupplierProducts(prev =>
      prev.map(sp => {
        if (sp.id === supplierProductId) {
          const oldPrice = sp.purchasePrice;
          logAction({
            user,
            action: "UPDATE",
            entityType: "SUPPLIER",
            entityId: sp.supplierId,
            entityReference: sp.supplierSku,
            description: `تعديل سعر توريد الصنف ${sp.productName} من ${formatEGP(oldPrice)} إلى ${formatEGP(newPrice)}`,
            previousValue: oldPrice,
            newValue: newPrice,
          });
          return {
            ...sp,
            purchasePrice: newPrice,
            lastPrice: oldPrice,
            priceChangeDate: new Date().toISOString().split("T")[0],
          };
        }
        return sp;
      })
    );
  };

  // Purchase Requests
  const createPurchaseRequest = (data: Omit<PurchaseRequest, "id" | "requestNumber" | "requestedAt" | "status" | "totalEstimatedAmount">): PurchaseRequest => {
    const totalEst = data.items.reduce((sum, it) => sum + it.estimatedTotal, 0);
    const newPR: PurchaseRequest = {
      ...data,
      id: `pr-${Date.now().toString().slice(-4)}`,
      requestNumber: `PR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "SUBMITTED",
      totalEstimatedAmount: totalEst,
      requestedAt: new Date().toISOString().split("T")[0],
    };

    setPurchaseRequests(prev => [newPR, ...prev]);
    logAction({
      user: data.requestedBy,
      action: "CREATE",
      entityType: "PURCHASE_REQUEST",
      entityId: newPR.id,
      entityReference: newPR.requestNumber,
      description: `تقديم طلب شراء جديد #${newPR.requestNumber} بقيمة تقديرية ${formatEGP(totalEst)}`,
    });
    return newPR;
  };

  const approvePurchaseRequest = (id: string, user: string) => {
    setPurchaseRequests(prev =>
      prev.map(pr => (pr.id === id ? { ...pr, status: "APPROVED", approvedBy: user, approvedAt: new Date().toISOString().split("T")[0] } : pr))
    );
    logAction({
      user,
      action: "APPROVE",
      entityType: "PURCHASE_REQUEST",
      entityId: id,
      entityReference: id,
      description: `اعتماد طلب الشراء #${id}`,
    });
  };

  const rejectPurchaseRequest = (id: string, user: string, reason: string) => {
    setPurchaseRequests(prev =>
      prev.map(pr => (pr.id === id ? { ...pr, status: "REJECTED", rejectionReason: reason } : pr))
    );
    logAction({
      user,
      action: "REJECT",
      entityType: "PURCHASE_REQUEST",
      entityId: id,
      entityReference: id,
      description: `رفض طلب الشراء #${id} - السبب: ${reason}`,
    });
  };

  const convertPRToPO = (requestId: string, user: string, targetWarehouseId?: string): PurchaseOrder | null => {
    const pr = purchaseRequests.find(p => p.id === requestId);
    if (!pr) return null;

    const supplierId = pr.items[0]?.preferredSupplierId || suppliers[0]?.id || "sup-001";
    const supplier = suppliers.find(s => s.id === supplierId) || suppliers[0];

    const poItems: PurchaseOrderItem[] = pr.items.map((item, idx) => {
      const sp = supplierProducts.find(s => s.productId === item.productId && s.supplierId === supplier.id);
      const unitPrice = sp ? sp.purchasePrice : item.estimatedUnitPrice;
      const sub = item.quantity * unitPrice;
      const taxAmount = sub * 0.14;
      return {
        id: `poi-${Date.now()}-${idx}`,
        productId: item.productId,
        productName: item.productName,
        supplierSku: sp?.supplierSku || "SKU-GEN",
        unit: "قطعة",
        quantity: item.quantity,
        receivedQuantity: 0,
        remainingQuantity: item.quantity,
        damagedQuantity: 0,
        unitPrice,
        discount: 0,
        taxRate: 0.14,
        taxAmount,
        total: sub + taxAmount,
      };
    });

    const subtotal = poItems.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
    const totalTax = subtotal * 0.14;
    const grandTotal = subtotal + totalTax;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now().toString().slice(-4)}`,
      poNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierId: supplier.id,
      supplierName: supplier.nameAr,
      supplierTaxId: supplier.taxId,
      branchId: pr.branchId,
      branchName: pr.branchName,
      warehouseId: targetWarehouseId || "wh-damietta-main",
      warehouseName: "مستودع التجمع الخامس الرئيسي",
      orderDate: new Date().toISOString().split("T")[0],
      expectedDeliveryDate: pr.requiredDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      paymentTerms: supplier.paymentTerms,
      paymentTermsDays: supplier.paymentTermsDays,
      currency: "EGP",
      items: poItems,
      subtotal,
      totalDiscount: 0,
      taxRate: 0.14,
      totalTax,
      grandTotal,
      notes: `تم تحويله تلقائياً من طلب الشراء #${pr.requestNumber}`,
      status: "APPROVED",
      createdBy: user,
      createdAt: new Date().toISOString().split("T")[0],
      approvedBy: user,
      approvedAt: new Date().toISOString().split("T")[0],
      purchaseRequestId: pr.id,
      purchaseRequestNumber: pr.requestNumber,
      receivingIds: [],
      invoiceIds: [],
      matchingStatus: "NOT_MATCHED",
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    setPurchaseRequests(prev =>
      prev.map(p => (p.id === requestId ? { ...p, status: "CONVERTED_TO_PO", convertedPoId: newPO.id, convertedPoNumber: newPO.poNumber } : p))
    );

    logAction({
      user,
      action: "CREATE",
      entityType: "PURCHASE_ORDER",
      entityId: newPO.id,
      entityReference: newPO.poNumber,
      description: `تحويل طلب الشراء #${pr.requestNumber} إلى أمر شراء رقم #${newPO.poNumber}`,
    });

    return newPO;
  };

  // Purchase Orders
  const createPurchaseOrder = (data: Omit<PurchaseOrder, "id" | "poNumber" | "createdAt" | "status" | "subtotal" | "totalTax" | "grandTotal" | "receivingIds" | "invoiceIds" | "matchingStatus">): PurchaseOrder => {
    const subtotal = data.items.reduce((sum, it) => sum + (it.quantity * it.unitPrice) - (it.discount || 0), 0);
    const totalTax = subtotal * (data.taxRate || 0.14);
    const grandTotal = subtotal + totalTax;

    // Check approval thresholds
    let initialStatus: PurchaseOrderStatus = "APPROVED";
    const officerLimit = settings.approvalRules.find(r => r.role === "PURCHASE_OFFICER")?.maxApprovalLimit || 25000;
    if (grandTotal > officerLimit) {
      initialStatus = "PENDING_APPROVAL";
    }

    const newPO: PurchaseOrder = {
      ...data,
      id: `po-${Date.now().toString().slice(-4)}`,
      poNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      subtotal,
      totalDiscount: data.totalDiscount || 0,
      taxRate: data.taxRate || 0.14,
      totalTax,
      grandTotal,
      status: initialStatus,
      createdAt: new Date().toISOString().split("T")[0],
      receivingIds: [],
      invoiceIds: [],
      matchingStatus: "NOT_MATCHED",
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    logAction({
      user: data.createdBy,
      action: "CREATE",
      entityType: "PURCHASE_ORDER",
      entityId: newPO.id,
      entityReference: newPO.poNumber,
      description: `إنشاء أمر شراء جديد #${newPO.poNumber} للمورد ${newPO.supplierName} بقيمة ${formatEGP(grandTotal)}`,
    });

    return newPO;
  };

  const approvePurchaseOrder = (id: string, user: string): { success: boolean; message: string } => {
    const po = purchaseOrders.find(p => p.id === id);
    if (!po) return { success: false, message: "أمر الشراء غير موجود" };

    setPurchaseOrders(prev =>
      prev.map(p => (p.id === id ? { ...p, status: "APPROVED", approvedBy: user, approvedAt: new Date().toISOString().split("T")[0] } : p))
    );

    logAction({
      user,
      action: "APPROVE",
      entityType: "PURCHASE_ORDER",
      entityId: id,
      entityReference: po.poNumber,
      description: `اعتماد أمر الشراء #${po.poNumber}`,
    });

    return { success: true, message: `تم اعتماد أمر الشراء #${po.poNumber} بنجاح` };
  };

  const sendPOToSupplier = (id: string, user: string) => {
    setPurchaseOrders(prev =>
      prev.map(p => (p.id === id ? { ...p, status: "SENT", sentAt: new Date().toISOString().split("T")[0] } : p))
    );
    logAction({
      user,
      action: "SEND",
      entityType: "PURCHASE_ORDER",
      entityId: id,
      entityReference: id,
      description: `إرسال أمر الشراء #${id} رسمياً إلى المورد وتأكيد موعد التوريد المتوقع`,
    });
  };

  const cancelPurchaseOrder = (id: string, user: string, reason: string) => {
    setPurchaseOrders(prev =>
      prev.map(p => (p.id === id ? { ...p, status: "CANCELLED", cancelledAt: new Date().toISOString().split("T")[0], cancellationReason: reason } : p))
    );
    logAction({
      user,
      action: "CANCEL",
      entityType: "PURCHASE_ORDER",
      entityId: id,
      entityReference: id,
      description: `إلغاء أمر الشراء #${id} - السبب: ${reason}`,
    });
  };

  // Goods Receiving & Quality Inspection
  const receiveGoods = (data: {
    poId: string;
    deliveryNoteNumber?: string;
    driverName?: string;
    receiverName: string;
    items: ReceivingItemQuality[];
    notes?: string;
  }): PurchaseReceiving => {
    const po = purchaseOrders.find(p => p.id === data.poId);
    if (!po) throw new Error("Purchase order not found");

    const totalOrdered = data.items.reduce((sum, it) => sum + it.orderedQty, 0);
    const totalRcv = data.items.reduce((sum, it) => sum + it.receivedQty, 0);
    const totalGood = data.items.reduce((sum, it) => sum + it.goodQty, 0);
    const totalDamaged = data.items.reduce((sum, it) => sum + it.damagedQty, 0);

    const receivingNumber = `RCV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const movementIds: string[] = [];

    // 1. Update Showroom Inventory physically without requiring double data entry!
    data.items.forEach((it) => {
      if (it.goodQty > 0) {
        // Find product in Showroom
        const prod = products.find(p => p.id === it.productId);
        if (prod) {
          const currentOnHand = prod.stockQuantity || 0;
          const targetWh = warehouses.find(w => w.name.includes(po.branchName)) || warehouses[0];
          adjustStock(
            prod.id,
            targetWh ? targetWh.id : "wh-cairo-showroom",
            currentOnHand + it.goodQty,
            `استلام بضاعة واردة من المورد ${po.supplierName} (إذن #${receivingNumber} - أمر #${po.poNumber})`,
            data.receiverName
          );
          movementIds.push(`mov-${Date.now()}-${it.productId}`);
        }
      }
    });

    const newReceiving: PurchaseReceiving = {
      id: `rcv-${Date.now()}`,
      receivingNumber,
      poId: po.id,
      poNumber: po.poNumber,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      destinationBranch: po.branchName,
      destinationWarehouse: po.warehouseName,
      destinationWarehouseId: po.warehouseId,
      date: new Date().toISOString().split("T")[0],
      receiverName: data.receiverName,
      deliveryNoteNumber: data.deliveryNoteNumber,
      driverName: data.driverName,
      items: data.items,
      totalOrderedQty: totalOrdered,
      totalReceivedQty: totalRcv,
      totalGoodQty: totalGood,
      totalDamagedQty: totalDamaged,
      status: totalDamaged > 0 ? "WITH_DISCREPANCY" : totalRcv >= totalOrdered ? "RECEIVED_FULL" : "RECEIVED_PARTIAL",
      notes: data.notes,
      inventoryStockMovementIds: movementIds,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setReceivings(prev => [newReceiving, ...prev]);

    // 2. Update PO status & received item quantities
    setPurchaseOrders(prev =>
      prev.map(p => {
        if (p.id === po.id) {
          const updatedItems = p.items.map(item => {
            const rcvItem = data.items.find(ri => ri.productId === item.productId);
            if (rcvItem) {
              const newReceived = (item.receivedQuantity || 0) + rcvItem.receivedQty;
              const newRemaining = Math.max(0, item.quantity - newReceived);
              return {
                ...item,
                receivedQuantity: newReceived,
                remainingQuantity: newRemaining,
                damagedQuantity: (item.damagedQuantity || 0) + rcvItem.damagedQty,
              };
            }
            return item;
          });

          const allRemaining = updatedItems.reduce((sum, it) => sum + it.remainingQuantity, 0);
          const newStatus: PurchaseOrderStatus = allRemaining === 0 ? "FULLY_RECEIVED" : "PARTIAL_RECEIVED";

          return {
            ...p,
            items: updatedItems,
            status: newStatus,
            receivingIds: [...p.receivingIds, newReceiving.id],
          };
        }
        return p;
      })
    );

    logAction({
      user: data.receiverName,
      action: "RECEIVE",
      entityType: "RECEIVING",
      entityId: newReceiving.id,
      entityReference: newReceiving.receivingNumber,
      description: `استلام شحنة بضاعة #${receivingNumber} لأمر #${po.poNumber} (سليم: ${totalGood}، تالف/عجز: ${totalDamaged}) - تم تحديث المخزون الفعلي تلقائياً`,
    });

    return newReceiving;
  };

  // Supplier Invoices & 3-Way Matching
  const createSupplierInvoice = (data: {
    supplierInvoiceRef: string;
    poId: string;
    receivingId?: string;
    invoiceDate: string;
    dueDate: string;
    items: { productId: string; productName: string; quantity: number; unitPrice: number; taxAmount: number; total: number }[];
    notes?: string;
    user: string;
  }): { invoice: SupplierInvoice; warnings: string[] } => {
    const po = purchaseOrders.find(p => p.id === data.poId);
    if (!po) throw new Error("Purchase order not found");

    const rcv = receivings.find(r => r.id === data.receivingId || r.poId === po.id);

    const subtotal = data.items.reduce((sum, it) => sum + (it.quantity * it.unitPrice), 0);
    const taxAmount = subtotal * 0.14;
    const totalAmount = subtotal + taxAmount;

    // Run 3-Way Match evaluation
    const allWarnings: string[] = [];
    let aggregatedMatchStatus: ThreeWayMatchStatus = "MATCHED";

    data.items.forEach(invItem => {
      const poItem = po.items.find(i => i.productId === invItem.productId);
      const rcvItem = rcv?.items.find(i => i.productId === invItem.productId);

      const matchRes = evaluateThreeWayMatch({
        orderedQty: poItem ? poItem.quantity : invItem.quantity,
        receivedQty: rcvItem ? rcvItem.receivedQty : (poItem?.receivedQuantity || 0),
        invoicedQty: invItem.quantity,
        orderedUnitPrice: poItem ? poItem.unitPrice : invItem.unitPrice,
        invoicedUnitPrice: invItem.unitPrice,
        priceTolerancePercent: settings.priceDiscrepancyTolerancePercent,
      });

      if (matchRes.status !== "MATCHED") {
        aggregatedMatchStatus = matchRes.status;
        allWarnings.push(...matchRes.warnings);
      }
    });

    const invoiceNumber = `PINV-2026-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Generate Automated Journal Entry into Central Finance Engine!
    // Dr. Inventory 1040, Dr. Input VAT 1060, Cr. Accounts Payable 2010
    const journalEntry = generatePurchaseInvoiceJournal({
      invoiceNumber,
      supplierName: po.supplierName,
      supplierInvoiceRef: data.supplierInvoiceRef,
      poNumber: po.poNumber,
      subtotal,
      taxAmount,
      totalAmount,
      branchId: po.branchId,
      branchName: po.branchName,
      costCenterId: "cc-damietta",
      costCenterName: "مستودع الأثاث ومراكز التشغيل",
      user: data.user,
    });

    createJournalEntry(journalEntry);

    const newInvoice: SupplierInvoice = {
      id: `pinv-${Date.now()}`,
      invoiceNumber,
      supplierInvoiceRef: data.supplierInvoiceRef,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      supplierTaxId: po.supplierTaxId,
      poId: po.id,
      poNumber: po.poNumber,
      receivingId: rcv?.id,
      receivingNumber: rcv?.receivingNumber,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      items: data.items,
      subtotal,
      taxAmount,
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
      paymentStatus: "UNPAID",
      paymentTerms: po.paymentTerms,
      matchStatus: aggregatedMatchStatus,
      matchDiscrepancyNotes: allWarnings.length > 0 ? allWarnings.join(" | ") : undefined,
      journalEntryId: journalEntry.id,
      createdBy: data.user,
      createdAt: new Date().toISOString().split("T")[0],
      notes: data.notes,
    };

    setSupplierInvoices(prev => [newInvoice, ...prev]);

    // Update supplier balance in Suppliers directory
    setSuppliers(prev =>
      prev.map(s => {
        if (s.id === po.supplierId) {
          return {
            ...s,
            totalPurchases: s.totalPurchases + totalAmount,
            balance: s.balance + totalAmount,
          };
        }
        return s;
      })
    );

    // Update PO references
    setPurchaseOrders(prev =>
      prev.map(p => (p.id === po.id ? { ...p, invoiceIds: [...p.invoiceIds, newInvoice.id], matchingStatus: aggregatedMatchStatus } : p))
    );

    logAction({
      user: data.user,
      action: "INVOICE",
      entityType: "INVOICE",
      entityId: newInvoice.id,
      entityReference: newInvoice.invoiceNumber,
      description: `تسجيل فاتورة المورد #${invoiceNumber} (مرجع: ${data.supplierInvoiceRef}) بقيمة ${formatEGP(totalAmount)} - تم ترحيل القيد المحاسبي وتحديث المديونية`,
    });

    return { invoice: newInvoice, warnings: allWarnings };
  };

  // Purchase Returns
  const createPurchaseReturn = (data: {
    supplierId: string;
    poId: string;
    receivingId?: string;
    reason: PurchaseReturn["reason"];
    items: { productId: string; productName: string; quantity: number; unitPrice: number; taxAmount: number; total: number; defectReason: string }[];
    notes?: string;
    user: string;
  }): PurchaseReturn => {
    const supplier = suppliers.find(s => s.id === data.supplierId);
    const po = purchaseOrders.find(p => p.id === data.poId);

    const totalQty = data.items.reduce((sum, it) => sum + it.quantity, 0);
    const subtotal = data.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
    const taxAmount = subtotal * 0.14;
    const totalRefundAmount = subtotal + taxAmount;

    const returnNumber = `PRET-2026-${Math.floor(10 + Math.random() * 90)}`;
    const debitNoteNumber = `DBN-2026-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Post Reversal Journal Entry into Finance (Dr. Accounts Payable 2010, Cr. Inventory 1040, Cr. Input VAT 1060)
    const journalEntry = generatePurchaseReturnJournal({
      returnNumber,
      supplierName: supplier?.nameAr || "المورد",
      poNumber: po?.poNumber || "PO-REF",
      subtotal,
      taxAmount,
      totalRefundAmount,
      branchId: po?.branchId || "branch-cairo",
      branchName: po?.branchName || "الفرع الرئيسي",
      costCenterId: "cc-damietta",
      costCenterName: "مستودع الأثاث",
      user: data.user,
    });

    createJournalEntry(journalEntry);

    const newReturn: PurchaseReturn = {
      id: `pret-${Date.now()}`,
      returnNumber,
      supplierId: data.supplierId,
      supplierName: supplier?.nameAr || "",
      poId: data.poId,
      poNumber: po?.poNumber || "",
      receivingId: data.receivingId,
      items: data.items,
      totalQuantity: totalQty,
      subtotal,
      taxAmount,
      totalRefundAmount,
      date: new Date().toISOString().split("T")[0],
      reason: data.reason,
      status: "SENT_TO_SUPPLIER",
      inventoryDeducted: true,
      journalEntryId: journalEntry.id,
      debitNoteNumber,
      createdBy: data.user,
      createdAt: new Date().toISOString().split("T")[0],
      notes: data.notes,
    };

    setPurchaseReturns(prev => [newReturn, ...prev]);

    // 2. Reduce supplier balance in state
    setSuppliers(prev =>
      prev.map(s => {
        if (s.id === data.supplierId) {
          return {
            ...s,
            balance: Math.max(0, s.balance - totalRefundAmount),
          };
        }
        return s;
      })
    );

    logAction({
      user: data.user,
      action: "RETURN",
      entityType: "RETURN",
      entityId: newReturn.id,
      entityReference: newReturn.returnNumber,
      description: `إصدار إشعار مدين ومرتجع للمورد #${returnNumber} بقيمة ${formatEGP(totalRefundAmount)} - تم خصم المخزون والمديونية`,
    });

    return newReturn;
  };

  const updateSettings = (updates: Partial<PurchasingSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    logAction({
      user: "أحمد سمير",
      action: "UPDATE",
      entityType: "PURCHASE_ORDER",
      entityId: "settings",
      entityReference: "SETTINGS",
      description: "تحديث إعدادات وسياسات الشراء وحدود الصلاحيات",
    });
  };

  // AI Query Engine
  const askPurchasingAI = (query: string): {
    answer: string;
    metrics?: { label: string; value: string; isGood?: boolean }[];
    relatedAction?: { label: string; href: string };
  } => {
    const q = query.toLowerCase();

    // Query: أصناف محتاجة شراء / نواقص
    if (q.includes("أصناف") && (q.includes("شراء") || q.includes("ناقص") || q.includes("نواقص") || q.includes("حجز"))) {
      const count = suggestions.length;
      const criticalCount = suggestions.filter(s => s.urgency === "CRITICAL").length;
      return {
        answer: `يوجد حالياً ${count} أصناف يوصي النظام بشرائها، من بينها ${criticalCount} صنف في حالة حرجة بسبب وجود حجوزات لعقود عملاء قادمة غير مغطاة بالرصيد المتاح (مثل صوفا فيرونا). يمكنك التوجه لصفحة تخطيط المشتريات لإنشاء أوامر الشراء بضغطة زر.`,
        metrics: [
          { label: "أصناف مقترح شراؤها", value: `${count} أصناف`, isGood: false },
          { label: "نقص يهدد عقود مؤكدة", value: `${criticalCount} أصناف`, isGood: false },
          { label: "إجمالي التكلفة المقدرة", value: formatEGP(suggestions.reduce((sum, s) => sum + s.estimatedTotalCost, 0)), isGood: true },
        ],
        relatedAction: { label: "فتح شاشة تخطيط المشتريات", href: "/dashboard/purchasing/planning" },
      };
    }

    // Query: أوامر متأخرة
    if (q.includes("متأخر") || q.includes("تأخير") || q.includes("تأخرت")) {
      const overdue = purchaseOrders.filter(po => po.expectedDeliveryDate < new Date().toISOString().split("T")[0] && po.status !== "FULLY_RECEIVED" && po.status !== "CLOSED");
      if (overdue.length > 0) {
        return {
          answer: `يوجد ${overdue.length} أمر شراء متأخر عن موعد التوريد المتوقع: أمر #${overdue[0].poNumber} من المورد "${overdue[0].supplierName}" كان متوقعاً بتاريخ ${overdue[0].expectedDeliveryDate}.`,
          metrics: [
            { label: "الأوامر المتأخرة", value: `${overdue.length} أوامر`, isGood: false },
            { label: "قيمة الأوامر المتأخرة", value: formatEGP(overdue.reduce((s, o) => s + o.grandTotal, 0)), isGood: false },
          ],
          relatedAction: { label: "متابعة أوامر الشراء", href: "/dashboard/purchasing/orders" },
        };
      }
      return {
        answer: "جميع أوامر الشراء المفتوحة تسير وفق الجدول الزمني المحدد ولا يوجد أي توريدات متأخرة حالياً.",
        metrics: [{ label: "نسبة الالتزام بالمواعيد", value: "100%", isGood: true }],
      };
    }

    // Query: أرخص مورد
    if (q.includes("أرخص") || q.includes("سعر") || q.includes("مقارنة")) {
      return {
        answer: `بناءً على سجل الأسعار الفعلي: "مصنع رِواق للأخشاب بدمياط" يقدم أقل سعر لـ صوفا فيرونا (18,500 ج.م) مقارنة بشركة النساجون (19,800 ج.م). أما بالنسبة لمفصلات وخامات التجميع فإن "المتحدة للإكسسوارات" هي الأفضل سعراً وثباتاً.`,
        metrics: [
          { label: "أفضل سعر لصوفا فيرونا", value: "18,500 ج.م (وفر 1,300 ج.م)", isGood: true },
          { label: "معدل جودة المورد", value: "4.9 / 5", isGood: true },
        ],
        relatedAction: { label: "عرض دليل الموردين ومصفوفة الأسعار", href: "/dashboard/purchasing/suppliers" },
      };
    }

    // Query: إجمالي المشتريات
    if (q.includes("إجمالي") || q.includes("الشهر") || q.includes("مسحوبات") || q.includes("مديونية")) {
      return {
        answer: `إجمالي المشتريات الصادرة هذا الشهر بلغ ${formatEGP(metrics.totalPurchasesThisMonth)} موزعة على ${metrics.totalOrdersThisMonth} أمر شراء. رصيد المديونية المستحق لكافة الموردين يبلغ ${formatEGP(metrics.outstandingPayables)}.`,
        metrics: [
          { label: "مشتريات الشهر", value: formatEGP(metrics.totalPurchasesThisMonth), isGood: true },
          { label: "إجمالي الدائنين للموردين", value: formatEGP(metrics.outstandingPayables), isGood: false },
          { label: "الأوامر قيد الاعتماد", value: `${metrics.pendingApprovalCount} أوامر`, isGood: true },
        ],
        relatedAction: { label: "عرض التقارير والتحليلات", href: "/dashboard/purchasing/reports" },
      };
    }

    // Default fallback answer
    return {
      answer: `نظام المشتريات في رِواق جاهز للإجابة عن أسعار الموردين، الأصناف الناقصة، مواعيد استلام الشحنات، ومطابقة الفواتير.`,
      metrics: [
        { label: "الموردين النشطين", value: `${metrics.activeSuppliersCount} موردين`, isGood: true },
        { label: "الأصناف تحت المتابعة", value: `${products.length} صنف`, isGood: true },
      ],
      relatedAction: { label: "لوحة تحكم المشتريات", href: "/dashboard/purchasing" },
    };
  };

  return (
    <PurchasingContext.Provider
      value={{
        suppliers,
        supplierProducts,
        addSupplier,
        updateSupplier,
        addSupplierProduct,
        updateSupplierProductPrice,
        purchaseRequests,
        createPurchaseRequest,
        approvePurchaseRequest,
        rejectPurchaseRequest,
        convertPRToPO,
        purchaseOrders,
        createPurchaseOrder,
        approvePurchaseOrder,
        sendPOToSupplier,
        cancelPurchaseOrder,
        receivings,
        receiveGoods,
        supplierInvoices,
        createSupplierInvoice,
        purchaseReturns,
        createPurchaseReturn,
        suggestions,
        metrics,
        auditLogs,
        settings,
        updateSettings,
        askPurchasingAI,
      }}
    >
      {children}
    </PurchasingContext.Provider>
  );
}

export function usePurchasing() {
  const context = useContext(PurchasingContext);
  if (!context) {
    throw new Error("usePurchasing must be used within a PurchasingProvider");
  }
  return context;
}
