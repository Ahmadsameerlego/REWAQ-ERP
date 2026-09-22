"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  DeliveryOrder,
  DeliveryStatus,
  DeliveryItem,
  Driver,
  Vehicle,
  DeliveryIssue,
  DeliveryReturn,
  LogisticsInsight,
  ProofOfDelivery,
  TimeWindow,
  DeliveryTimelineEvent,
} from "@/types/logistics";

export interface ProductItem {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  brand: string;
  woodType: string;
  dimensions: string;
  unit: string;
  retailPrice: number;
  minPrice: number;
  costPrice: number;
  image: string;
  availableColors: string[];
  stockQuantity: number;
  isFloorDisplay: boolean;
  floorBranch: string;
  status: "ACTIVE" | "DISCONTINUED" | "COMING_SOON";
  minStockThreshold: number;
  leadTimeDays: number;
  lastMovementDate: string;
}

export type JourneyStage =
  | "LEAD"
  | "CONTACTED"
  | "VISIT_BOOKED"
  | "CHECKED_IN"
  | "INSPECTING"
  | "QUOTATION"
  | "CONTRACTED"
  | "DEPOSIT_PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "FOLLOW_UP";

export interface TimelineEvent {
  id: string;
  type: "call" | "whatsapp" | "note" | "visit_booked" | "visit_checkin" | "inspecting" | "visit_ended" | "quotation" | "contract" | "deposit" | "shipping" | "delivery" | "followup";
  title: string;
  description: string;
  timestamp: string;
  author: string;
  badge?: string;
  badgeColor?: string;
}

export interface InterestedProduct {
  name: string;
  category?: string;
  woodType?: string;
  fabricColor?: string;
  budget?: string;
  notes?: string;
}

export interface NextAction {
  id?: string;
  task: string;
  rep: string;
  dueDate: string;
  priority: "urgent" | "normal";
  completed: boolean;
  channel?: "call" | "whatsapp" | "meeting" | "showroom";
  notes?: string;
}

export interface CustomerRecord {
  id: string;
  fullName: string;
  phone: string;
  whatsapp?: string;
  city: string;
  source: string;
  campaignName?: string;
  preferredBranch: string;
  assignedRep: string;
  stage: JourneyStage;
  interestedProducts: InterestedProduct[];
  nextAction?: NextAction;
  notes: string;
  createdAt: string;
  timeline: TimelineEvent[];
  quotations: {
    id: string;
    number: string;
    date: string;
    amount: number;
    items: string;
    status: "DRAFT" | "SENT" | "ACCEPTED" | "EXPIRED";
  }[];
}

export type CRMLead = CustomerRecord & {
  status: "NEW" | "CONTACTED" | "VISIT_BOOKED" | "VISITED" | "QUOTATION" | "WON" | "LOST";
  roomType: string;
  budget: string;
  branch: string;
};

export interface ContractOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  branch: string;
  salesRep: string;
  items: {
    productId: string;
    productName: string;
    fabricColor: string;
    quantity: number;
    unitPrice: number;
    isFromFloor: boolean;
  }[];
  totalAmount: number;
  discount: number;
  netAmount: number;
  depositPaid: number;
  remainingDue: number;
  status: "PENDING_DEPOSIT" | "BOOKED" | "PREPARING" | "SHIPPED" | "DELIVERED_PAID" | "CANCELLED";
  deliveryDate: string;
  deliveryAddress: string;
  needsAssembly: boolean;
  notes: string;
  createdAt: string;
}

export interface ShowroomVisit {
  id: string;
  customerId?: string;
  customerName: string;
  phone: string;
  branch: string;
  salesRep: string;
  visitDate: string;
  timeSlot: string;
  roomInterest: string;
  status: "SCHEDULED" | "CONFIRMED" | "CHECKED_IN" | "INSPECTING" | "COMPLETED" | "NO_SHOW" | "CANCELLED";
  checkInTime?: string;
  outcome?: "VERY_INTERESTED" | "INTERESTED" | "NEEDS_FOLLOWUP" | "NO_MATCH" | "CONTRACTED";
  outcomeNotes?: string;
  notes: string;
}

// ----------------------------------------------------
// INVENTORY & WAREHOUSE DATA MODELS
// ----------------------------------------------------

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  branchName: string;
  type: "SHOWROOM" | "WAREHOUSE" | "CENTRAL";
  managerName: string;
  address: string;
  capacityPercentage: number;
}

export interface StockLevel {
  id: string;
  productId: string;
  warehouseId: string;
  branchName: string;
  warehouseName: string;
  locationCode: string; // e.g. "A01", "B03", "FL-01"
  onHand: number;      // Total physically present
  reserved: number;    // Committed to customer orders
  display: number;     // Display piece on floor
  damaged: number;     // Damaged / blocked
  inTransit: number;   // On the way to this warehouse
}

export type MovementType =
  | "RECEIVING"
  | "SALE_ISSUE"
  | "RESERVATION"
  | "RESERVATION_RELEASE"
  | "TRANSFER_OUT"
  | "TRANSFER_IN"
  | "ADJUSTMENT"
  | "DAMAGED"
  | "DISPLAY_TRANSFER"
  | "RETURN";

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  movementType: MovementType;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  reference: string; // Contract #, PO #, Transfer #, Count #
  user: string;
  date: string;
  notes: string;
}

export interface StockReservation {
  id: string;
  productId: string;
  productName: string;
  branchName: string;
  warehouseName: string;
  quantity: number;
  customerName: string;
  customerPhone: string;
  contractNumber: string;
  contractId?: string;
  status: "ACTIVE" | "FULFILLED" | "CANCELLED";
  reservedAt: string;
  deliveryTargetDate: string;
}

export interface TransferOrder {
  id: string;
  transferNumber: string;
  productId: string;
  productName: string;
  fromBranch: string;
  fromWarehouse: string;
  toBranch: string;
  toWarehouse: string;
  quantity: number;
  status: "REQUESTED" | "APPROVED" | "IN_TRANSIT" | "RECEIVED" | "CANCELLED";
  requestedBy: string;
  approvedBy?: string;
  requestedAt: string;
  shippedAt?: string;
  receivedAt?: string;
  driverName?: string;
  notes: string;
}

export interface ReceivingOrderItem {
  productId: string;
  productName: string;
  expectedQty: number;
  receivedQty: number;
  missingQty: number;
  damagedQty: number;
  status: "ACCEPTED" | "PARTIAL" | "DISCREPANCY";
}

export interface ReceivingOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  destinationWarehouse: string;
  destinationBranch: string;
  items: ReceivingOrderItem[];
  totalExpected: number;
  totalReceived: number;
  status: "PENDING" | "RECEIVED" | "DISCREPANCY";
  receivedBy: string;
  receivedAt: string;
  notes: string;
}

export interface StockCountItem {
  productId: string;
  productName: string;
  sku: string;
  locationCode: string;
  systemQty: number;
  physicalQty: number;
  difference: number;
  costValueDiff: number;
  reason?: string;
}

export interface StockCount {
  id: string;
  countNumber: string;
  warehouseName: string;
  branchName: string;
  conductedBy: string;
  countedAt: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED_ADJUSTED";
  approvedBy?: string;
  items: StockCountItem[];
  totalDifference: number;
  totalValueDifference: number;
  notes: string;
}

export interface SmartInsight {
  id: string;
  type: "LOW_STOCK" | "SLOW_MOVING" | "OVERSTOCK" | "TRANSFER_SUGGESTION" | "RESERVATION_RISK" | "DISCREPANCY";
  severity: "CRITICAL" | "WARNING" | "INFO" | "OPPORTUNITY";
  title: string;
  description: string;
  recommendation: string;
  relatedProductId?: string;
  relatedProductName?: string;
  fromBranch?: string;
  toBranch?: string;
  suggestedQty?: number;
  actionLabel?: string;
  resolved: boolean;
}

interface ShowroomContextType {
  products: ProductItem[];
  customers: CustomerRecord[];
  leads: CustomerRecord[];
  orders: ContractOrder[];
  visits: ShowroomVisit[];

  // Inventory & Warehouse States
  warehouses: Warehouse[];
  stockLevels: StockLevel[];
  stockMovements: StockMovement[];
  stockReservations: StockReservation[];
  transferOrders: TransferOrder[];
  receivingOrders: ReceivingOrder[];
  stockCounts: StockCount[];
  smartInsights: SmartInsight[];

  // Customer Actions
  addCustomer: (data: Partial<CustomerRecord> & { fullName: string; phone: string }) => CustomerRecord;
  updateCustomer: (customerId: string, data: Partial<CustomerRecord>) => void;
  updateCustomerJourney: (customerId: string, stage: JourneyStage, customTitle?: string, customDesc?: string) => void;
  addTimelineEvent: (customerId: string, event: Omit<TimelineEvent, "id">) => void;
  setCustomerNextAction: (customerId: string, action: NextAction) => void;
  completeNextAction: (customerId: string) => void;

  // POS & Order Actions
  createOrder: (orderData: Omit<ContractOrder, "id" | "orderNumber" | "createdAt">) => ContractOrder;
  collectPayment: (orderId: string, amount: number) => void;

  // Visit Actions
  addVisit: (visit: Omit<ShowroomVisit, "id">) => void;
  updateVisitStatus: (visitId: string, status: ShowroomVisit["status"], outcome?: ShowroomVisit["outcome"], outcomeNotes?: string) => void;
  checkInVisit: (visitId: string) => void;
  startInspection: (visitId: string) => void;
  endVisit: (visitId: string, outcome: ShowroomVisit["outcome"], outcomeNotes?: string, nextAction?: NextAction) => void;

  // Inventory Actions
  createTransferOrder: (data: Omit<TransferOrder, "id" | "transferNumber" | "status" | "requestedAt">) => TransferOrder;
  approveTransferOrder: (transferId: string, approvedBy: string) => void;
  shipTransferOrder: (transferId: string, driverName: string) => void;
  receiveTransferOrder: (transferId: string, receivedBy: string) => void;
  cancelTransferOrder: (transferId: string) => void;

  createReceivingOrder: (data: Omit<ReceivingOrder, "id" | "status" | "receivedAt">) => ReceivingOrder;
  confirmReceivingOrder: (receivingId: string, items: ReceivingOrderItem[], receivedBy: string) => void;

  createStockCount: (data: Omit<StockCount, "id" | "status">) => StockCount;
  approveStockCountAdjustment: (countId: string, approvedBy: string) => void;

  addProduct: (product: Omit<ProductItem, "id" | "stockQuantity">, initialStockByWarehouse?: Record<string, number>) => ProductItem;
  updateProduct: (productId: string, data: Partial<ProductItem>) => void;
  adjustStock: (productId: string, warehouseId: string, newOnHand: number, reason: string, user: string) => void;
  applyTransferSuggestion: (insightId: string) => void;
  dismissInsight: (insightId: string) => void;

  // Delivery & Logistics States
  deliveries: DeliveryOrder[];
  drivers: Driver[];
  vehicles: Vehicle[];
  deliveryIssues: DeliveryIssue[];
  deliveryReturns: DeliveryReturn[];
  logisticsInsights: LogisticsInsight[];

  // Delivery Actions
  createDeliveryOrder: (orderData: Partial<DeliveryOrder> & { contractId: string }) => DeliveryOrder;
  updateDeliveryStatus: (deliveryId: string, status: DeliveryStatus, notes?: string) => void;
  checkDeliveryReadiness: (deliveryId: string) => {
    isReady: boolean;
    reasons: string[];
    missingItems: { productName: string; required: number; available: number }[];
    isAddressValid: boolean;
    isCustomerValid: boolean;
    isContractValid: boolean;
  };
  updatePickingStatus: (deliveryId: string, productId: string, pickedQty: number) => void;
  markDeliveryReady: (deliveryId: string) => { success: boolean; error?: string };
  scheduleDelivery: (
    deliveryId: string,
    scheduleData: {
      date: string;
      timeWindow: string;
      driverId?: string;
      vehicleId?: string;
      deliveryTeam?: string;
      notes?: string;
      forceOverride?: boolean;
      overrideReason?: string;
    }
  ) => { success: boolean; warning?: string };
  assignDriverAndVehicle: (
    deliveryId: string,
    driverId: string,
    vehicleId: string,
    forceOverride?: boolean,
    overrideReason?: string
  ) => { success: boolean; warning?: string };
  dispatchDelivery: (deliveryId: string) => void;
  completeDelivery: (deliveryId: string, pod: ProofOfDelivery) => void;
  failDelivery: (
    deliveryId: string,
    reason: DeliveryOrder["failureReason"],
    action: "RESCHEDULE" | "RETURN_WAREHOUSE",
    notes: string
  ) => void;
  createPartialDelivery: (
    contractId: string,
    selectedItems: { productId: string; quantity: number }[],
    notes?: string
  ) => DeliveryOrder;
  addDeliveryIssue: (data: Omit<DeliveryIssue, "id" | "reportedAt" | "status">) => DeliveryIssue;
  resolveDeliveryIssue: (issueId: string, resolutionNotes: string) => void;
  addDeliveryReturn: (data: Omit<DeliveryReturn, "id" | "requestedAt" | "status">) => DeliveryReturn;
  processDeliveryReturn: (
    returnId: string,
    inventoryAction: "AVAILABLE" | "DAMAGED" | "WORKSHOP",
    processedBy: string,
    notes?: string
  ) => void;
  addDriver: (driver: Omit<Driver, "id" | "assignedDeliveriesCount">) => Driver;
  updateDriver: (driverId: string, data: Partial<Driver>) => void;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => Vehicle;
  updateVehicle: (vehicleId: string, data: Partial<Vehicle>) => void;
  dismissLogisticsInsight: (insightId: string) => void;
  applyLogisticsInsight: (insightId: string) => void;
}

const ShowroomContext = createContext<ShowroomContextType | undefined>(undefined);

const generateUniqueId = (prefix = "EV") => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

export function ShowroomProvider({ children }: { children: React.ReactNode }) {
  // 1. Master Products Catalog
  const [products, setProducts] = useState<ProductItem[]>([
    {
      id: "PROD-01",
      sku: "SLN-LOTUS-01",
      barcode: "622100100101",
      name: "صالون نيو كلاسيك لوتس الملكي (9 مقاعد)",
      category: "صالونات وركنات",
      brand: "رِواق الملكي",
      woodType: "خشب زان أحمر روماني طبيعي",
      dimensions: "240سم × 95سم × 85سم",
      unit: "طقم كامل",
      retailPrice: 78000,
      minPrice: 72000,
      costPrice: 48000,
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80",
      availableColors: ["كشمير دافئ", "رمادي بترولي", "أوف وايت كريمي", "أخضر زمردي"],
      stockQuantity: 7,
      isFloorDisplay: true,
      floorBranch: "فرع التجمع الرئيسي",
      status: "ACTIVE",
      minStockThreshold: 3,
      leadTimeDays: 14,
      lastMovementDate: "2026-09-20",
    },
    {
      id: "PROD-02",
      sku: "BED-KING-02",
      barcode: "622100100202",
      name: "غرفة نوم ماستر كينج هيلتون (سرير + دولاب 6 ضلفة + 2 كومود + تسريحة)",
      category: "غرف نوم",
      brand: "رِواق للأثاث الفاخر",
      woodType: "زان أحمر مع قشرة أرو طبيعي",
      dimensions: "سرير 180×200سم | دولاب 280سم",
      unit: "غرفة نوم كاملة",
      retailPrice: 96000,
      minPrice: 89000,
      costPrice: 59000,
      image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&auto=format&fit=crop&q=80",
      availableColors: ["بيج شامبين", "رمادي دخاني", "بني جوزي"],
      stockQuantity: 4,
      isFloorDisplay: true,
      floorBranch: "فرع 6 أكتوبر (المول)",
      status: "ACTIVE",
      minStockThreshold: 2,
      leadTimeDays: 20,
      lastMovementDate: "2026-09-19",
    },
    {
      id: "PROD-03",
      sku: "DIN-MARBLE-03",
      barcode: "622100100303",
      name: "طقم غرفة طعام أوركيد (سفرة رخام إسباني + 8 كراسي + بوفيه مرآة)",
      category: "غرف طعام وسفرة",
      brand: "مجموعة إسبانيا الفاخرة",
      woodType: "خشب زان وقواعد ستانلس ذهبي PVD",
      dimensions: "ترابيزة 220سم × 110سم",
      unit: "طقم طعام كامل",
      retailPrice: 88000,
      minPrice: 82000,
      costPrice: 53000,
      image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&auto=format&fit=crop&q=80",
      availableColors: ["رخام بيانكو أبيض مع كراسي رمادي", "رخام بورتورو أسود وذهبي"],
      stockQuantity: 5,
      isFloorDisplay: false,
      floorBranch: "مستودع دمياط المركزي",
      status: "ACTIVE",
      minStockThreshold: 2,
      leadTimeDays: 12,
      lastMovementDate: "2026-09-15",
    },
    {
      id: "PROD-04",
      sku: "LGT-CRYSTAL-04",
      barcode: "622100100404",
      name: "نجفة مودرن كريستال عصفور نخب أول (3 مستويات LED)",
      category: "إضاءة وديكور",
      brand: "كريستال عصفور",
      woodType: "هيكل معدني مطلي ذهب ومطعمة بكريستال عصفور",
      dimensions: "قطر 90سم × ارتفاع 120سم",
      unit: "قطعة",
      retailPrice: 28000,
      minPrice: 24000,
      costPrice: 15000,
      image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80",
      availableColors: ["إضاءة دافئة 3000K", "إضاءة نهارية 4000K", "ثلاثية الدرجات"],
      stockQuantity: 12,
      isFloorDisplay: true,
      floorBranch: "فرع التجمع الرئيسي",
      status: "ACTIVE",
      minStockThreshold: 5,
      leadTimeDays: 5,
      lastMovementDate: "2026-09-21",
    },
    {
      id: "PROD-05",
      sku: "SOFA-VERONA-05",
      barcode: "622100100505",
      name: "كنبة ثلاثية مودرن فيرونا (Sofa Verona Beige)",
      category: "صالونات وركنات",
      brand: "مودرن ليفينج",
      woodType: "خشب سويد فنلندي وزان أحمر",
      dimensions: "220سم × 90سم × 80سم",
      unit: "قطعة",
      retailPrice: 34000,
      minPrice: 31000,
      costPrice: 19500,
      image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&auto=format&fit=crop&q=80",
      availableColors: ["بيج كريمي", "رمادي فاتح", "أزرق كحلي"],
      stockQuantity: 8,
      isFloorDisplay: true,
      floorBranch: "فرع التجمع الرئيسي",
      status: "ACTIVE",
      minStockThreshold: 4,
      leadTimeDays: 10,
      lastMovementDate: "2026-09-18",
    },
    {
      id: "PROD-06",
      sku: "TBL-MARBLE-06",
      barcode: "622100100606",
      name: "ترابيزة شاي وسطية رخام كلكتا مع أرجل ذهبية",
      category: "ترابيزات وطاولات",
      brand: "رِواق ديزاين",
      woodType: "سطح رخام كلكتا طبيعي وقواعد ستانلس 304",
      dimensions: "120سم × 70سم × 45سم",
      unit: "قطعة",
      retailPrice: 18500,
      minPrice: 16000,
      costPrice: 9800,
      image: "https://images.unsplash.com/photo-1533090161767-e6ffed986b88?w=600&auto=format&fit=crop&q=80",
      availableColors: ["رخام كلكتا أبيض عروق رمادية", "رخام أسود نيرو ماركينا"],
      stockQuantity: 14,
      isFloorDisplay: false,
      floorBranch: "مستودع دمياط المركزي",
      status: "ACTIVE",
      minStockThreshold: 4,
      leadTimeDays: 7,
      lastMovementDate: "2026-06-25", // Slow moving indicator
    },
  ]);

  // 2. Warehouses Hierarchy
  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    {
      id: "WH-CAIRO-SHOWROOM",
      code: "CR-SH",
      name: "معرض التجمع الخامس (الرئيسي)",
      branchName: "فرع التجمع الرئيسي",
      type: "SHOWROOM",
      managerName: "كريم يوسف",
      address: "التجمع الخامس - شارع التسعين الشمالي",
      capacityPercentage: 85,
    },
    {
      id: "WH-CAIRO-STORAGE",
      code: "CR-WH",
      name: "مخزن التجمع الخلفي",
      branchName: "فرع التجمع الرئيسي",
      type: "WAREHOUSE",
      managerName: "عماد نبيل",
      address: "التجمع الخامس - المنطقة الصناعية",
      capacityPercentage: 68,
    },
    {
      id: "WH-OCT-SHOWROOM",
      code: "OCT-SH",
      name: "معرض 6 أكتوبر (المول)",
      branchName: "فرع 6 أكتوبر (المول)",
      type: "SHOWROOM",
      managerName: "سارة ممدوح",
      address: "محور 26 يوليو - مول العرب",
      capacityPercentage: 90,
    },
    {
      id: "WH-OCT-STORAGE",
      code: "OCT-WH",
      name: "مخزن 6 أكتوبر",
      branchName: "فرع 6 أكتوبر (المول)",
      type: "WAREHOUSE",
      managerName: "هيثم توفيق",
      address: "المنطقة الصناعية الرابعة - أكتوبر",
      capacityPercentage: 55,
    },
    {
      id: "WH-TANTA-SHOWROOM",
      code: "TNT-SH",
      name: "معرض فرع طنطا",
      branchName: "فرع طنطا",
      type: "SHOWROOM",
      managerName: "محمود الشامي",
      address: "شارع الجيش - ميدان المحطة",
      capacityPercentage: 75,
    },
    {
      id: "WH-TANTA-STORAGE",
      code: "TNT-WH",
      name: "مخزن فرع طنطا",
      branchName: "فرع طنطا",
      type: "WAREHOUSE",
      managerName: "سامح الديب",
      address: "طريق طنطا السريع - مخازن الأثاث",
      capacityPercentage: 40,
    },
    {
      id: "WH-DAMIETTA",
      code: "DAM-CENTRAL",
      name: "مستودع دمياط المركزي واللوجستي",
      branchName: "مستودع دمياط",
      type: "CENTRAL",
      managerName: "م. إبراهيم شطا",
      address: "المنطقة الصناعية الجديدة - دمياط",
      capacityPercentage: 62,
    },
  ]);

  // 3. Stock Levels per Warehouse
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([
    // PROD-01 (Salon Lotus - Total OnHand: 7)
    { id: "STK-01", productId: "PROD-01", warehouseId: "WH-CAIRO-SHOWROOM", branchName: "فرع التجمع الرئيسي", warehouseName: "معرض التجمع الخامس", locationCode: "SH-A01", onHand: 2, reserved: 1, display: 1, damaged: 0, inTransit: 0 },
    { id: "STK-02", productId: "PROD-01", warehouseId: "WH-CAIRO-STORAGE", branchName: "فرع التجمع الرئيسي", warehouseName: "مخزن التجمع الخلفي", locationCode: "ST-B02", onHand: 2, reserved: 1, display: 0, damaged: 0, inTransit: 0 },
    { id: "STK-03", productId: "PROD-01", warehouseId: "WH-OCT-SHOWROOM", branchName: "فرع 6 أكتوبر (المول)", warehouseName: "معرض 6 أكتوبر", locationCode: "SH-01", onHand: 1, reserved: 0, display: 1, damaged: 0, inTransit: 0 },
    { id: "STK-04", productId: "PROD-01", warehouseId: "WH-DAMIETTA", branchName: "مستودع دمياط", warehouseName: "مستودع دمياط المركزي", locationCode: "WH-C05", onHand: 2, reserved: 0, display: 0, damaged: 0, inTransit: 0 },

    // PROD-02 (Bed King Hilton - Total OnHand: 4)
    { id: "STK-05", productId: "PROD-02", warehouseId: "WH-CAIRO-SHOWROOM", branchName: "فرع التجمع الرئيسي", warehouseName: "معرض التجمع الخامس", locationCode: "SH-B04", onHand: 1, reserved: 0, display: 1, damaged: 0, inTransit: 0 },
    { id: "STK-06", productId: "PROD-02", warehouseId: "WH-OCT-SHOWROOM", branchName: "فرع 6 أكتوبر (المول)", warehouseName: "معرض 6 أكتوبر", locationCode: "SH-B01", onHand: 1, reserved: 0, display: 1, damaged: 0, inTransit: 0 },
    { id: "STK-07", productId: "PROD-02", warehouseId: "WH-DAMIETTA", branchName: "مستودع دمياط", warehouseName: "مستودع دمياط المركزي", locationCode: "WH-A12", onHand: 2, reserved: 1, display: 0, damaged: 0, inTransit: 0 },

    // PROD-03 (Dining Orchid - Total OnHand: 5)
    { id: "STK-08", productId: "PROD-03", warehouseId: "WH-CAIRO-SHOWROOM", branchName: "فرع التجمع الرئيسي", warehouseName: "معرض التجمع الخامس", locationCode: "SH-C02", onHand: 1, reserved: 0, display: 1, damaged: 0, inTransit: 0 },
    { id: "STK-09", productId: "PROD-03", warehouseId: "WH-OCT-STORAGE", branchName: "فرع 6 أكتوبر (المول)", warehouseName: "مخزن 6 أكتوبر", locationCode: "ST-04", onHand: 1, reserved: 0, display: 0, damaged: 0, inTransit: 0 },
    { id: "STK-10", productId: "PROD-03", warehouseId: "WH-DAMIETTA", branchName: "مستودع دمياط", warehouseName: "مستودع دمياط المركزي", locationCode: "WH-D08", onHand: 3, reserved: 1, display: 0, damaged: 0, inTransit: 0 },

    // PROD-04 (Crystal Chandelier - Total OnHand: 12)
    { id: "STK-11", productId: "PROD-04", warehouseId: "WH-CAIRO-SHOWROOM", branchName: "فرع التجمع الرئيسي", warehouseName: "معرض التجمع الخامس", locationCode: "LGT-01", onHand: 4, reserved: 1, display: 2, damaged: 0, inTransit: 0 },
    { id: "STK-12", productId: "PROD-04", warehouseId: "WH-OCT-SHOWROOM", branchName: "فرع 6 أكتوبر (المول)", warehouseName: "معرض 6 أكتوبر", locationCode: "LGT-02", onHand: 3, reserved: 0, display: 1, damaged: 0, inTransit: 0 },
    { id: "STK-13", productId: "PROD-04", warehouseId: "WH-DAMIETTA", branchName: "مستودع دمياط", warehouseName: "مستودع دمياط المركزي", locationCode: "WH-E01", onHand: 5, reserved: 0, display: 0, damaged: 0, inTransit: 0 },

    // PROD-05 (Sofa Verona - Total OnHand: 8)
    // Tanta has low stock (2 onHand, 1 display, 1 reserved -> 0 available) with 4 reservations needed!
    // Cairo has surplus (5 onHand, 1 display -> 4 available).
    { id: "STK-14", productId: "PROD-05", warehouseId: "WH-CAIRO-STORAGE", branchName: "فرع التجمع الرئيسي", warehouseName: "مخزن التجمع الخلفي", locationCode: "ST-A09", onHand: 5, reserved: 1, display: 0, damaged: 0, inTransit: 0 },
    { id: "STK-15", productId: "PROD-05", warehouseId: "WH-TANTA-SHOWROOM", branchName: "فرع طنطا", warehouseName: "معرض فرع طنطا", locationCode: "TNT-01", onHand: 2, reserved: 2, display: 1, damaged: 0, inTransit: 0 },
    { id: "STK-16", productId: "PROD-05", warehouseId: "WH-DAMIETTA", branchName: "مستودع دمياط", warehouseName: "مستودع دمياط المركزي", locationCode: "WH-A04", onHand: 1, reserved: 0, display: 0, damaged: 0, inTransit: 0 },

    // PROD-06 (Marble Tea Table - Total OnHand: 14, Slow Moving)
    { id: "STK-17", productId: "PROD-06", warehouseId: "WH-CAIRO-STORAGE", branchName: "فرع التجمع الرئيسي", warehouseName: "مخزن التجمع الخلفي", locationCode: "ST-C11", onHand: 6, reserved: 0, display: 0, damaged: 0, inTransit: 0 },
    { id: "STK-18", productId: "PROD-06", warehouseId: "WH-DAMIETTA", branchName: "مستودع دمياط", warehouseName: "مستودع دمياط المركزي", locationCode: "WH-T02", onHand: 8, reserved: 0, display: 0, damaged: 0, inTransit: 0 },
  ]);

  // 4. Stock Reservations
  const [stockReservations, setStockReservations] = useState<StockReservation[]>([
    {
      id: "RES-101",
      productId: "PROD-01",
      productName: "صالون نيو كلاسيك لوتس الملكي",
      branchName: "فرع التجمع الرئيسي",
      warehouseName: "مخزن التجمع الخلفي",
      quantity: 1,
      customerName: "د. هاني عبد الحميد",
      customerPhone: "01012345678",
      contractNumber: "ORD-2026-089",
      status: "ACTIVE",
      reservedAt: "2026-09-18",
      deliveryTargetDate: "2026-10-15",
    },
    {
      id: "RES-102",
      productId: "PROD-05",
      productName: "كنبة ثلاثية مودرن فيرونا (Sofa Verona)",
      branchName: "فرع طنطا",
      warehouseName: "معرض فرع طنطا",
      quantity: 2,
      customerName: "أ. طارق عبد المجيد",
      customerPhone: "01188997766",
      contractNumber: "ORD-2026-091",
      status: "ACTIVE",
      reservedAt: "2026-09-20",
      deliveryTargetDate: "2026-09-28",
    },
    {
      id: "RES-103",
      productId: "PROD-02",
      productName: "غرفة نوم ماستر كينج هيلتون",
      branchName: "مستودع دمياط",
      warehouseName: "مستودع دمياط المركزي",
      quantity: 1,
      customerName: "م. شريف فهمي",
      customerPhone: "01234567890",
      contractNumber: "ORD-2026-090",
      status: "ACTIVE",
      reservedAt: "2026-09-19",
      deliveryTargetDate: "2026-10-05",
    },
  ]);

  // 5. Stock Movements Audit Trail
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([
    {
      id: "MOV-1001",
      productId: "PROD-01",
      productName: "صالون نيو كلاسيك لوتس الملكي",
      movementType: "RESERVATION",
      quantity: 1,
      fromLocation: "مخزن التجمع الخلفي",
      toLocation: "حجز لعقد عميل",
      reference: "ORD-2026-089",
      user: "كريم يوسف",
      date: "2026-09-18 14:30",
      notes: "حجز الصالون بعد سداد العربون بعقد رسمي",
    },
    {
      id: "MOV-1002",
      productId: "PROD-04",
      productName: "نجفة مودرن كريستال عصفور",
      movementType: "RECEIVING",
      quantity: 6,
      fromLocation: "مصنع كريستال عصفور",
      toLocation: "مستودع دمياط المركزي",
      reference: "PO-2026-88",
      user: "إبراهيم شطا",
      date: "2026-09-20 11:15",
      notes: "استلام دفعة إنتاج جديدة معتمدة",
    },
    {
      id: "MOV-1003",
      productId: "PROD-05",
      productName: "كنبة ثلاثية مودرن فيرونا",
      movementType: "TRANSFER_OUT",
      quantity: 2,
      fromLocation: "مستودع دمياط المركزي",
      toLocation: "قيد النقل إلى فرع طنطا",
      reference: "TR-2026-041",
      user: "سامح الديب",
      date: "2026-09-20 16:00",
      notes: "طلب تحويل لتغطية عجز فرع طنطا",
    },
  ]);

  // 6. Transfer Orders
  const [transferOrders, setTransferOrders] = useState<TransferOrder[]>([
    {
      id: "TR-2026-041",
      transferNumber: "TR-2026-041",
      productId: "PROD-05",
      productName: "كنبة ثلاثية مودرن فيرونا (Sofa Verona)",
      fromBranch: "مستودع دمياط",
      fromWarehouse: "مستودع دمياط المركزي",
      toBranch: "فرع طنطا",
      toWarehouse: "معرض فرع طنطا",
      quantity: 2,
      status: "IN_TRANSIT",
      requestedBy: "محمود الشامي (مدير طنطا)",
      approvedBy: "أحمد سمير (المدير العام)",
      requestedAt: "2026-09-20 10:30",
      shippedAt: "2026-09-20 16:00",
      driverName: "عم صبحي (سيارة نقل 458)",
      notes: "شحنة مستعجلة لتسليم حجز عقد الأسبوع القادم",
    },
    {
      id: "TR-2026-040",
      transferNumber: "TR-2026-040",
      productId: "PROD-03",
      productName: "طقم غرفة طعام أوركيد",
      fromBranch: "مستودع دمياط",
      fromWarehouse: "مستودع دمياط المركزي",
      toBranch: "فرع التجمع الرئيسي",
      toWarehouse: "معرض التجمع الخامس",
      quantity: 1,
      status: "RECEIVED",
      requestedBy: "كريم يوسف",
      approvedBy: "أحمد سمير",
      requestedAt: "2026-09-17 09:00",
      shippedAt: "2026-09-18 12:00",
      receivedAt: "2026-09-19 15:30",
      driverName: "محمد راضي",
      notes: "عينة عرض جديدة بالصالة",
    },
  ]);

  // 7. Receiving Orders (استلام الشحنات من المصنع والموردين)
  const [receivingOrders, setReceivingOrders] = useState<ReceivingOrder[]>([
    {
      id: "REC-2026-012",
      poNumber: "PO-2026-88",
      supplierName: "مصنع رواق للأخشاب الفاخرة - دمياط",
      destinationWarehouse: "مستودع دمياط المركزي",
      destinationBranch: "مستودع دمياط",
      totalExpected: 10,
      totalReceived: 9,
      status: "DISCREPANCY",
      receivedBy: "إبراهيم شطا",
      receivedAt: "2026-09-20 11:15",
      notes: "شحنة صالونات ونجف - عجز قطعة واحدة من النجف جاري استكمالها",
      items: [
        {
          productId: "PROD-01",
          productName: "صالون نيو كلاسيك لوتس الملكي",
          expectedQty: 4,
          receivedQty: 4,
          missingQty: 0,
          damagedQty: 0,
          status: "ACCEPTED",
        },
        {
          productId: "PROD-04",
          productName: "نجفة مودرن كريستال عصفور",
          expectedQty: 6,
          receivedQty: 5,
          missingQty: 1,
          damagedQty: 0,
          status: "PARTIAL",
        },
      ],
    },
    {
      id: "REC-2026-011",
      poNumber: "PO-2026-85",
      supplierName: "شركة الرخام الإسباني الحديث",
      destinationWarehouse: "مخزن التجمع الخلفي",
      destinationBranch: "فرع التجمع الرئيسي",
      totalExpected: 6,
      totalReceived: 6,
      status: "RECEIVED",
      receivedBy: "عماد نبيل",
      receivedAt: "2026-09-18 10:00",
      notes: "استلام أطقم سفرة أوركيد مطابقة للمواصفات بالكامل",
      items: [
        {
          productId: "PROD-03",
          productName: "طقم غرفة طعام أوركيد",
          expectedQty: 6,
          receivedQty: 6,
          missingQty: 0,
          damagedQty: 0,
          status: "ACCEPTED",
        },
      ],
    },
  ]);

  // 8. Stock Count / Inventory Audit (الجرد الدوري)
  const [stockCounts, setStockCounts] = useState<StockCount[]>([
    {
      id: "CNT-2026-03",
      countNumber: "INV-COUNT-2026-09",
      warehouseName: "مخزن التجمع الخلفي",
      branchName: "فرع التجمع الرئيسي",
      conductedBy: "لجنة الجرد: عماد نبيل + مراجع الحسابات",
      countedAt: "2026-09-15",
      status: "APPROVED_ADJUSTED",
      approvedBy: "أحمد سمير (المدير العام)",
      totalDifference: -1,
      totalValueDifference: -9800,
      notes: "جرد الربع الثالث لمخزن التجمع - تم اكتشاف كسر في ترابيزة شاي واعتماد شطبها",
      items: [
        {
          productId: "PROD-01",
          productName: "صالون نيو كلاسيك لوتس الملكي",
          sku: "SLN-LOTUS-01",
          locationCode: "ST-B02",
          systemQty: 2,
          physicalQty: 2,
          difference: 0,
          costValueDiff: 0,
          reason: "مطابق 100%",
        },
        {
          productId: "PROD-06",
          productName: "ترابيزة شاي وسطية رخام كلكتا",
          sku: "TBL-MARBLE-06",
          locationCode: "ST-C11",
          systemQty: 7,
          physicalQty: 6,
          difference: -1,
          costValueDiff: -9800,
          reason: "شرخ في الرخام أثناء النقل - تحويل لتالف",
        },
      ],
    },
  ]);

  // 9. Smart Inventory Insights & AI Recommendations
  const [smartInsights, setSmartInsights] = useState<SmartInsight[]>([
    {
      id: "INS-01",
      type: "RESERVATION_RISK",
      severity: "CRITICAL",
      title: "عجز في حجز كنبة فيرونا بفرع طنطا ⚠️",
      description: "Sofa Verona متبقي منها 2 فقط كـ On Hand في فرع طنطا (1 منها عينة صالة)، ويوجد 4 حجوزات مؤكدة بعقود.",
      recommendation: "يوجد فائض (5 وحدات) بمخزن التجمع بالقاهرة. يُقترح تحويل 3 وحدات فوراً إلى طنطا.",
      relatedProductId: "PROD-05",
      relatedProductName: "كنبة ثلاثية مودرن فيرونا",
      fromBranch: "فرع التجمع الرئيسي",
      toBranch: "فرع طنطا",
      suggestedQty: 3,
      actionLabel: "اعتماد أمر التحويل (3 وحدات)",
      resolved: false,
    },
    {
      id: "INS-02",
      type: "SLOW_MOVING",
      severity: "WARNING",
      title: "صنف راكد منذ 87 يوماً 💡",
      description: "ترابيزة شاي وسطية رخام كلكتا (PROD-06) لم تسجل أي حركة بيع منذ 87 يوماً ويوجد 14 قطعة بالمخازن.",
      recommendation: "يُقترح عمل عرض ترويجي Bundle مع صالون لوتس أو تطبيق خصم 10% لتسريع دوران المخزون.",
      relatedProductId: "PROD-06",
      relatedProductName: "ترابيزة شاي وسطية رخام كلكتا",
      actionLabel: "مراجعة سياسة التسعير والعروض",
      resolved: false,
    },
    {
      id: "INS-03",
      type: "LOW_STOCK",
      severity: "WARNING",
      title: "توقع نفاد مخزون غرفة نوم هيلتون خلال 6 أيام",
      description: "متبقي قطعتين فقط بمستودع دمياط، ومعدل الطلب المتوقع 3 غرف أسبوعياً مع Lead Time تصنيع 20 يوماً.",
      recommendation: "يُوصى بإصدار أمر إنتاج عاجل للمصنع لتجهيز 5 غرف نوم إضافية.",
      relatedProductId: "PROD-02",
      relatedProductName: "غرفة نوم ماستر كينج هيلتون",
      actionLabel: "إصدار أمر إنتاج بالمصنع",
      resolved: false,
    },
    {
      id: "INS-04",
      type: "DISCREPANCY",
      severity: "INFO",
      title: "فرق استلام في إذن PO-2026-88 (عجز قطعة واحدة)",
      description: "شحنة النجف الكريستال وصل منها 5 قطع من أصل 6 قطع متوقعة.",
      recommendation: "تم تسجيل الشحنة جزئياً وجاري التواصل مع المورد لتسليم القطعة المتبقية.",
      relatedProductId: "PROD-04",
      relatedProductName: "نجفة مودرن كريستال عصفور",
      actionLabel: "متابعة المورد",
      resolved: false,
    },
  ]);

  // 10. Customers & Single Records
  const [customers, setCustomers] = useState<CustomerRecord[]>([
    {
      id: "CUST-01",
      fullName: "د. هاني عبد الحميد",
      phone: "01012345678",
      whatsapp: "01012345678",
      city: "القاهرة الجديدة - التجمع الخامس",
      source: "Meta Lead Ads",
      campaignName: "حملة الصالونات المودرن والسمارت",
      preferredBranch: "فرع التجمع الرئيسي",
      assignedRep: "كريم يوسف",
      stage: "CONTRACTED",
      notes: "مهتم بالصالون النيو كلاسيك الملكي، دفع عربون 25,000 ج بعقد رسمي رقم ORD-2026-089",
      createdAt: "2026-09-18",
      interestedProducts: [{ name: "صالون نيو كلاسيك لوتس الملكي (9 مقاعد)", budget: "78,000 ج" }],
      nextAction: {
        task: "تنسيق موعد الشحن والتركيب مع العميل قبل 24 ساعة",
        rep: "كريم يوسف",
        dueDate: "2026-10-14",
        priority: "normal",
        completed: false,
        channel: "call",
      },
      quotations: [{ id: "Q-101", number: "QUOT-2026-01", date: "2026-09-18", amount: 78000, items: "صالون لوتس كشمير", status: "ACCEPTED" }],
      timeline: [
        { id: "EV-01", type: "contract", title: "توقيع تعاقد رسمي #ORD-2026-089", description: "إجمالي العقد 78,000 ج مع دفع عربون 25,000 ج", timestamp: "2026-09-18 14:30", author: "كريم يوسف", badge: "تعاقد رسمي", badgeColor: "bg-emerald-50 text-emerald-800" },
        { id: "EV-02", type: "visit_ended", title: "معاينة واختيار الأقمشة بالمعرض", description: "اختار قماش الكشمير وعاين الصالون مع مسؤول المبيعات", timestamp: "2026-09-18 12:00", author: "كريم يوسف", badge: "زيارة صالة", badgeColor: "bg-blue-50 text-blue-700" },
      ],
    },
    {
      id: "CUST-02",
      fullName: "م. شريف فهمي",
      phone: "01234567890",
      whatsapp: "01234567890",
      city: "الشيخ زايد - كمبوند الربوة",
      source: "Instagram Reels",
      campaignName: "حملة غرف النوم النيو كلاسيك",
      preferredBranch: "فرع 6 أكتوبر (المول)",
      assignedRep: "سارة ممدوح",
      stage: "CONTRACTED",
      notes: "طلب غرفة نوم هيلتون كينج، دفع عربون 30,000 ج",
      createdAt: "2026-09-19",
      interestedProducts: [{ name: "غرفة نوم ماستر كينج هيلتون", budget: "96,000 ج" }],
      nextAction: {
        task: "متابعة تجهيز الدولاب والسرير في المستودع المركزي",
        rep: "سارة ممدوح",
        dueDate: "2026-10-01",
        priority: "normal",
        completed: false,
        channel: "showroom",
      },
      quotations: [{ id: "Q-102", number: "QUOT-2026-02", date: "2026-09-19", amount: 96000, items: "غرفة نوم هيلتون كينج", status: "ACCEPTED" }],
      timeline: [
        { id: "EV-03", type: "contract", title: "توقيع تعاقد #ORD-2026-090", description: "إجمالي العقد 96,000 ج - عربون 30,000 ج", timestamp: "2026-09-19 16:00", author: "سارة ممدوح", badge: "تعاقد رسمي", badgeColor: "bg-emerald-50 text-emerald-800" },
      ],
    },
    {
      id: "CUST-03",
      fullName: "أ. طارق عبد المجيد",
      phone: "01188997766",
      whatsapp: "01188997766",
      city: "طنطا - شارع النحاس",
      source: "WhatsApp Direct",
      preferredBranch: "فرع طنطا",
      assignedRep: "محمود الشامي",
      stage: "CONTRACTED",
      notes: "حجز قطعتين كنبة فيرونا بيج لعيادته بطنطا، دفع عربون 20,000 ج",
      createdAt: "2026-09-20",
      interestedProducts: [{ name: "كنبة ثلاثية مودرن فيرونا (Sofa Verona)", budget: "68,000 ج" }],
      nextAction: {
        task: "تأكيد وصول شحنة التحويل من دمياط إلى معرض طنطا",
        rep: "محمود الشامي",
        dueDate: "2026-09-23",
        priority: "urgent",
        completed: false,
        channel: "call",
      },
      quotations: [{ id: "Q-103", number: "QUOT-2026-03", date: "2026-09-20", amount: 68000, items: "2 كنبة فيرونا بيج", status: "ACCEPTED" }],
      timeline: [
        { id: "EV-04", type: "contract", title: "توقيع تعاقد #ORD-2026-091", description: "حجز 2 كنبة فيرونا - عربون 20,000 ج", timestamp: "2026-09-20 13:00", author: "محمود الشامي", badge: "تعاقد رسمي", badgeColor: "bg-emerald-50 text-emerald-800" },
      ],
    },
  ]);

  // 11. Orders & Visits
  const [orders, setOrders] = useState<ContractOrder[]>([
    {
      id: "ORD-2026-088",
      orderNumber: "ORD-2026-088",
      customerId: "CUST-01",
      customerName: "د. هاني عبد الحميد",
      customerPhone: "01012345678",
      customerCity: "القاهرة الجديدة",
      branch: "فرع التجمع الرئيسي",
      salesRep: "كريم يوسف",
      items: [
        {
          productId: "PROD-01",
          productName: "صالون نيو كلاسيك لوتس الملكي (9 مقاعد)",
          fabricColor: "كشمير دافئ",
          quantity: 1,
          unitPrice: 78000,
          isFromFloor: false,
        },
        {
          productId: "PROD-06",
          productName: "ترابيزة شاي وسطية رخام كلكتا",
          fabricColor: "رخام كلكتا أبيض",
          quantity: 1,
          unitPrice: 18500,
          isFromFloor: false,
        },
      ],
      totalAmount: 96500,
      discount: 4500,
      netAmount: 92000,
      depositPaid: 50000,
      remainingDue: 42000,
      status: "SHIPPED",
      deliveryDate: "2026-09-21",
      deliveryAddress: "التجمع الخامس - النرجس فيلات - ش 14",
      needsAssembly: true,
      notes: "صالون نيو كلاسيك 9 مقاعد + ترابيزة رخام هندي - في الطريق الآن",
      createdAt: "2026-09-17",
    },
    {
      id: "ORD-2026-085",
      orderNumber: "ORD-2026-085",
      customerId: "CUST-04",
      customerName: "م. نادية رشدي",
      customerPhone: "01198765432",
      customerCity: "الشيخ زايد",
      branch: "فرع 6 أكتوبر (المول)",
      salesRep: "سارة ممدوح",
      items: [
        {
          productId: "PROD-02",
          productName: "غرفة نوم ماستر كينج هيلتون",
          fabricColor: "بيج شامبين",
          quantity: 1,
          unitPrice: 96000,
          isFromFloor: false,
        },
      ],
      totalAmount: 98500,
      discount: 0,
      netAmount: 98500,
      depositPaid: 30000,
      remainingDue: 68500,
      status: "BOOKED",
      deliveryDate: "2026-09-22",
      deliveryAddress: "الشيخ زايد - كمبوند الياسمين - عمارة 4",
      needsAssembly: true,
      notes: "مؤجل لطلب العميل لإعادة الجدولة",
      createdAt: "2026-09-15",
    },
    {
      id: "ORD-2026-082",
      orderNumber: "ORD-2026-082",
      customerId: "CUST-05",
      customerName: "أ. طارق عبد العزيز",
      customerPhone: "01234567890",
      customerCity: "مدينة نصر",
      branch: "فرع التجمع الرئيسي",
      salesRep: "كريم يوسف",
      items: [
        {
          productId: "PROD-03",
          productName: "طقم غرفة طعام أوركيد",
          fabricColor: "رخام إسباني",
          quantity: 1,
          unitPrice: 88000,
          isFromFloor: false,
        },
        {
          productId: "PROD-04",
          productName: "نجفة مودرن كريستال عصفور",
          fabricColor: "إضاءة دافئة",
          quantity: 1,
          unitPrice: 28000,
          isFromFloor: false,
        },
      ],
      totalAmount: 116000,
      discount: 6000,
      netAmount: 110000,
      depositPaid: 75000,
      remainingDue: 35000,
      status: "DELIVERED_PAID",
      deliveryDate: "2026-09-20",
      deliveryAddress: "مدينة نصر - مكرم عبيد - برج الأطباء",
      needsAssembly: true,
      notes: "تم التسليم والسداد بنجاح",
      createdAt: "2026-09-12",
    },
    {
      id: "ORD-2026-081",
      orderNumber: "ORD-2026-081",
      customerId: "CUST-06",
      customerName: "أ. منى زكريا",
      customerPhone: "01099887766",
      customerCity: "مصر الجديدة",
      branch: "فرع التجمع الرئيسي",
      salesRep: "كريم يوسف",
      items: [
        {
          productId: "PROD-05",
          productName: "كنبة ثلاثية مودرن فيرونا (Sofa Verona)",
          fabricColor: "رمادي فاتح",
          quantity: 1,
          unitPrice: 34000,
          isFromFloor: false,
        },
      ],
      totalAmount: 43000,
      discount: 0,
      netAmount: 43000,
      depositPaid: 15000,
      remainingDue: 28000,
      status: "PREPARING",
      deliveryDate: "2026-09-22",
      deliveryAddress: "مصر الجديدة - الميرغني - أمام النادي",
      needsAssembly: false,
      notes: "مجدول للتحميل والتسليم",
      createdAt: "2026-09-14",
    },
    {
      id: "ORD-2026-089",
      orderNumber: "ORD-2026-089",
      customerId: "CUST-01",
      customerName: "د. هاني عبد الحميد",
      customerPhone: "01012345678",
      customerCity: "القاهرة الجديدة",
      branch: "فرع التجمع الرئيسي",
      salesRep: "كريم يوسف",
      items: [
        {
          productId: "PROD-01",
          productName: "صالون نيو كلاسيك لوتس الملكي (9 مقاعد)",
          fabricColor: "كشمير دافئ",
          quantity: 1,
          unitPrice: 78000,
          isFromFloor: false,
        },
      ],
      totalAmount: 78000,
      discount: 3000,
      netAmount: 75000,
      depositPaid: 25000,
      remainingDue: 50000,
      status: "PREPARING",
      deliveryDate: "2026-10-15",
      deliveryAddress: "التجمع الخامس - النرجس عمارة 44",
      needsAssembly: true,
      notes: "التسليم في الدور الثاني بمصعد",
      createdAt: "2026-09-18",
    },
    {
      id: "ORD-2026-090",
      orderNumber: "ORD-2026-090",
      customerId: "CUST-02",
      customerName: "م. شريف فهمي",
      customerPhone: "01234567890",
      customerCity: "الشيخ زايد",
      branch: "فرع 6 أكتوبر (المول)",
      salesRep: "سارة ممدوح",
      items: [
        {
          productId: "PROD-02",
          productName: "غرفة نوم ماستر كينج هيلتون",
          fabricColor: "رمادي دخاني",
          quantity: 1,
          unitPrice: 96000,
          isFromFloor: false,
        },
      ],
      totalAmount: 96000,
      discount: 0,
      netAmount: 96000,
      depositPaid: 30000,
      remainingDue: 66000,
      status: "BOOKED",
      deliveryDate: "2026-10-05",
      deliveryAddress: "الشيخ زايد - كمبوند الربوة - فيلا 12",
      needsAssembly: true,
      notes: "غرفة نوم جاهزة بمستودع دمياط وبانتظار الجدولة",
      createdAt: "2026-09-19",
    },
    {
      id: "ORD-2026-091",
      orderNumber: "ORD-2026-091",
      customerId: "CUST-03",
      customerName: "أ. طارق عبد المجيد",
      customerPhone: "01188997766",
      customerCity: "طنطا",
      branch: "فرع طنطا",
      salesRep: "محمود الشامي",
      items: [
        {
          productId: "PROD-05",
          productName: "كنبة ثلاثية مودرن فيرونا (Sofa Verona)",
          fabricColor: "بيج كريمي",
          quantity: 2,
          unitPrice: 34000,
          isFromFloor: false,
        },
      ],
      totalAmount: 68000,
      discount: 0,
      netAmount: 68000,
      depositPaid: 20000,
      remainingDue: 48000,
      status: "BOOKED",
      deliveryDate: "2026-09-28",
      deliveryAddress: "طنطا - شارع النحاس - برج الصفا",
      needsAssembly: false,
      notes: "بانتظار وصول شحنة التحويل من دمياط إلى طنطا",
      createdAt: "2026-09-20",
    },
  ]);

  const [visits, setVisits] = useState<ShowroomVisit[]>([
    {
      id: "VIS-101",
      customerName: "د. هاني عبد الحميد",
      phone: "01012345678",
      branch: "فرع التجمع الرئيسي",
      salesRep: "كريم يوسف",
      visitDate: "اليوم",
      timeSlot: "05:00 م",
      roomInterest: "صالون نيو كلاسيك لوتس الملكي",
      status: "COMPLETED",
      outcome: "CONTRACTED",
      notes: "تم الاتفاق وسداد العربون بالـ POS",
    },
  ]);

  // 12. Drivers Fleet
  const [drivers, setDrivers] = useState<Driver[]>([
    {
      id: "DRV-01",
      name: "عماد مصطفى",
      phone: "01012344321",
      status: "ON_DELIVERY",
      assignedDeliveriesCount: 2,
      rating: 4.9,
      licenseNumber: "LIC-EGY-8841",
      vehicleAssigned: "سيارة نصف نقل (أ ر 542)",
      branch: "فرع التجمع الرئيسي",
      isAvailable: false,
    },
    {
      id: "DRV-02",
      name: "أشرف عادل",
      phone: "01155443322",
      status: "AVAILABLE",
      assignedDeliveriesCount: 1,
      rating: 4.8,
      licenseNumber: "LIC-EGY-9012",
      vehicleAssigned: "جامبو مغلقة (ب ط 891)",
      branch: "فرع 6 أكتوبر (المول)",
      isAvailable: true,
    },
    {
      id: "DRV-03",
      name: "سيد حسني",
      phone: "01288776655",
      status: "AVAILABLE",
      assignedDeliveriesCount: 1,
      rating: 4.7,
      licenseNumber: "LIC-EGY-4311",
      vehicleAssigned: "فان مغلقة (ج ن 112)",
      branch: "فرع التجمع الرئيسي",
      isAvailable: true,
    },
    {
      id: "DRV-04",
      name: "وائل القصاص",
      phone: "01066554411",
      status: "AVAILABLE",
      assignedDeliveriesCount: 0,
      rating: 4.9,
      licenseNumber: "LIC-EGY-6623",
      vehicleAssigned: "جامبو ثقيل (د س 334)",
      branch: "مستودع دمياط",
      isAvailable: true,
    },
  ]);

  // 13. Vehicles Fleet
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: "VEH-01",
      plateNumber: "أ ر 542",
      model: "إيسوزو نصف نقل مجهزة للأثاث",
      type: "HALF_TRUCK",
      capacityCbm: 16,
      maxItemsCapacity: 4,
      status: "ON_DELIVERY",
      currentDriverName: "عماد مصطفى",
      currentDriverId: "DRV-01",
      branch: "فرع التجمع الرئيسي",
    },
    {
      id: "VEH-02",
      plateNumber: "ب ط 891",
      model: "شيفروليه جامبو صندوق مغلق فايبر",
      type: "JUMBO",
      capacityCbm: 28,
      maxItemsCapacity: 8,
      status: "AVAILABLE",
      currentDriverName: "أشرف عادل",
      currentDriverId: "DRV-02",
      branch: "فرع 6 أكتوبر (المول)",
    },
    {
      id: "VEH-03",
      plateNumber: "ج ن 112",
      model: "سوزوكي فان مغلقة للديكور والنجف",
      type: "VAN",
      capacityCbm: 8,
      maxItemsCapacity: 3,
      status: "AVAILABLE",
      currentDriverName: "سيد حسني",
      currentDriverId: "DRV-03",
      branch: "فرع التجمع الرئيسي",
    },
    {
      id: "VEH-04",
      plateNumber: "د س 334",
      model: "مرسيدس أكتروس نقل ثقيل بين الفروع",
      type: "TRUCK_HEAVY",
      capacityCbm: 45,
      maxItemsCapacity: 14,
      status: "AVAILABLE",
      currentDriverName: "وائل القصاص",
      currentDriverId: "DRV-04",
      branch: "مستودع دمياط",
    },
  ]);

  // 14. Delivery Orders
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([
    {
      id: "DL-1042",
      deliveryNumber: "DL-1042",
      contractId: "ORD-2026-088",
      contractNumber: "ORD-2026-088",
      customerId: "CUST-01",
      customerName: "د. هاني عبد الحميد",
      customerPhone: "01012345678",
      deliveryAddress: "التجمع الخامس - النرجس فيلات - ش 14",
      city: "القاهرة الجديدة",
      zone: "التجمع الخامس",
      branch: "فرع التجمع الرئيسي",
      warehouse: "مخزن التجمع الخلفي",
      items: [
        {
          productId: "PROD-01",
          productName: "صالون نيو كلاسيك لوتس الملكي (9 مقاعد)",
          fabricColor: "كشمير دافئ",
          quantity: 1,
          pickedQty: 1,
          unitPrice: 78000,
          isFromFloor: false,
        },
        {
          productId: "PROD-06",
          productName: "ترابيزة شاي وسطية رخام كلكتا",
          fabricColor: "رخام كلكتا أبيض",
          quantity: 1,
          pickedQty: 1,
          unitPrice: 18500,
          isFromFloor: false,
        },
      ],
      scheduledDate: "2026-09-21",
      timeWindow: "12:00 - 14:00",
      driverId: "DRV-01",
      driverName: "عماد مصطفى",
      driverPhone: "01012344321",
      vehicleId: "VEH-01",
      vehiclePlate: "أ ر 542",
      vehicleType: "نصف نقل مجهزة",
      deliveryTeam: "عماد مصطفى (سائق) + م/ إبراهيم (فني تركيب)",
      status: "OUT_FOR_DELIVERY",
      notes: "صالون نيو كلاسيك 9 مقاعد + ترابيزة رخام هندي - تم التحميل",
      specialInstructions: "الدور الثاني بفيلا النرجس - مصعد متوفر",
      needsAssembly: true,
      codAmount: 42000,
      depositPaid: 50000,
      totalContractAmount: 92000,
      isPartial: false,
      timeline: [
        { id: "DL-EV-01", status: "DRAFT", title: "إنشاء إذن التسليم من العقد", description: "تم استخراج أمر الشحن من عقد #ORD-2026-088", timestamp: "2026-09-18 10:00", author: "كريم يوسف" },
        { id: "DL-EV-02", status: "READY", title: "اكتمال التجهيز والفحص", description: "تم تجهيز الصالون والترابيزة والتأكد من مطابقة الألوان 100%", timestamp: "2026-09-20 15:30", author: "عماد نبيل (أمين المخزن)" },
        { id: "DL-EV-03", status: "ASSIGNED", title: "جدولة وتعيين السائق", description: "تم التعيين للسائق عماد مصطفى وسيارة (أ ر 542)", timestamp: "2026-09-21 08:30", author: "منسق الشحن" },
        { id: "DL-EV-04", status: "OUT_FOR_DELIVERY", title: "خرجت الشحنة للتسليم 🚚", description: "الشحنة في طريقها للعميل ومتبقي تحصيل 42,000 ج.م", timestamp: "2026-09-21 11:45", author: "عماد مصطفى" },
      ],
      createdAt: "2026-09-18",
    },
    {
      id: "DL-1052",
      deliveryNumber: "DL-1052",
      contractId: "ORD-2026-089",
      contractNumber: "ORD-2026-089",
      customerId: "CUST-01",
      customerName: "د. هاني عبد الحميد",
      customerPhone: "01012345678",
      deliveryAddress: "التجمع الخامس - النرجس عمارة 44",
      city: "القاهرة الجديدة",
      zone: "التجمع الخامس",
      branch: "فرع التجمع الرئيسي",
      warehouse: "مخزن التجمع الخلفي",
      items: [
        {
          productId: "PROD-01",
          productName: "صالون نيو كلاسيك لوتس الملكي (9 مقاعد)",
          fabricColor: "كشمير دافئ",
          quantity: 1,
          pickedQty: 0,
          unitPrice: 78000,
          isFromFloor: false,
        },
      ],
      scheduledDate: "2026-10-15",
      timeWindow: "14:00 - 16:00",
      status: "PREPARING",
      notes: "بانتظار انتهاء التغليف والتجهيز بالمخزن",
      specialInstructions: "يرجى تغليف القماش بالكامل بالبابلز لمنع الأتربة",
      needsAssembly: true,
      codAmount: 50000,
      depositPaid: 25000,
      totalContractAmount: 75000,
      isPartial: false,
      timeline: [
        { id: "DL-EV-05", status: "DRAFT", title: "إنشاء إذن التسليم", description: "تم استخراج أمر الشحن من POS", timestamp: "2026-09-18 14:35", author: "كريم يوسف" },
        { id: "DL-EV-06", status: "PREPARING", title: "بدء التجهيز والتغليف بالمخزن", description: "جاري حجز القطعة من المخزن وفحصها", timestamp: "2026-09-21 09:00", author: "عماد نبيل" },
      ],
      createdAt: "2026-09-18",
    },
    {
      id: "DL-1045",
      deliveryNumber: "DL-1045",
      contractId: "ORD-2026-081",
      contractNumber: "ORD-2026-081",
      customerId: "CUST-06",
      customerName: "أ. منى زكريا",
      customerPhone: "01099887766",
      deliveryAddress: "مصر الجديدة - الميرغني - أمام النادي",
      city: "القاهرة",
      zone: "مصر الجديدة",
      branch: "فرع التجمع الرئيسي",
      warehouse: "مخزن التجمع الخلفي",
      items: [
        {
          productId: "PROD-05",
          productName: "كنبة ثلاثية مودرن فيرونا (Sofa Verona)",
          fabricColor: "رمادي فاتح",
          quantity: 1,
          pickedQty: 1,
          unitPrice: 34000,
          isFromFloor: false,
        },
      ],
      scheduledDate: "2026-09-22",
      timeWindow: "16:00 - 18:00",
      driverId: "DRV-03",
      driverName: "سيد حسني",
      driverPhone: "01288776655",
      vehicleId: "VEH-03",
      vehiclePlate: "ج ن 112",
      vehicleType: "فان مغلقة",
      deliveryTeam: "سيد حسني + فني تركيب",
      status: "ASSIGNED",
      notes: "تم التجهيز والتعيين لسيارة الفان",
      needsAssembly: false,
      codAmount: 28000,
      depositPaid: 15000,
      totalContractAmount: 43000,
      isPartial: false,
      timeline: [
        { id: "DL-EV-07", status: "DRAFT", title: "إنشاء الشحنة", description: "أمر شحن عقد أ. منى زكريا", timestamp: "2026-09-14 11:00", author: "كريم يوسف" },
        { id: "DL-EV-08", status: "READY", title: "القطعة جاهزة بالكامل", description: "كنبة فيرونا جاهزة ومغلفة", timestamp: "2026-09-20 14:00", author: "عماد نبيل" },
        { id: "DL-EV-09", status: "ASSIGNED", title: "تعيين السائق والسيارة", description: "مجدولة لغد الثلاثاء 4-6 مساءً مع سيد حسني", timestamp: "2026-09-21 10:00", author: "منسق الشحن" },
      ],
      createdAt: "2026-09-14",
    },
    {
      id: "DL-1048",
      deliveryNumber: "DL-1048",
      contractId: "ORD-2026-090",
      contractNumber: "ORD-2026-090",
      customerId: "CUST-02",
      customerName: "م. شريف فهمي",
      customerPhone: "01234567890",
      deliveryAddress: "الشيخ زايد - كمبوند الربوة - فيلا 12",
      city: "الشيخ زايد",
      zone: "الشيخ زايد",
      branch: "فرع 6 أكتوبر (المول)",
      warehouse: "مستودع دمياط المركزي",
      items: [
        {
          productId: "PROD-02",
          productName: "غرفة نوم ماستر كينج هيلتون",
          fabricColor: "رمادي دخاني",
          quantity: 1,
          pickedQty: 1,
          unitPrice: 96000,
          isFromFloor: false,
        },
      ],
      scheduledDate: "2026-09-24",
      timeWindow: "10:00 - 12:00",
      status: "READY",
      notes: "الغرفة جاهزة بالمستودع وبانتظار تحديد موعد وتعيين السائق",
      specialInstructions: "تتطلب نجارين تركيب محترفين لتركيب دريسنج هيلتون 6 ضلف",
      needsAssembly: true,
      codAmount: 66000,
      depositPaid: 30000,
      totalContractAmount: 96000,
      isPartial: false,
      timeline: [
        { id: "DL-EV-10", status: "DRAFT", title: "إنشاء الشحنة", description: "تعاقد غرفة نوم هيلتون", timestamp: "2026-09-19 16:15", author: "سارة ممدوح" },
        { id: "DL-EV-11", status: "READY", title: "تم فحص الجاهزية واعتماد الشحنة", description: "جميع القطع جاهزة بالمستودع 1/1", timestamp: "2026-09-21 08:00", author: "إبراهيم شطا" },
      ],
      createdAt: "2026-09-19",
    },
    {
      id: "DL-1050",
      deliveryNumber: "DL-1050",
      contractId: "ORD-2026-085",
      contractNumber: "ORD-2026-085",
      customerId: "CUST-04",
      customerName: "م. نادية رشدي",
      customerPhone: "01198765432",
      deliveryAddress: "الشيخ زايد - كمبوند الياسمين - عمارة 4",
      city: "الشيخ زايد",
      zone: "الشيخ زايد",
      branch: "فرع 6 أكتوبر (المول)",
      warehouse: "مخزن 6 أكتوبر",
      items: [
        {
          productId: "PROD-02",
          productName: "غرفة نوم ماستر كينج هيلتون",
          fabricColor: "بيج شامبين",
          quantity: 1,
          pickedQty: 1,
          unitPrice: 96000,
          isFromFloor: false,
        },
      ],
      scheduledDate: "2026-09-24",
      timeWindow: "12:00 - 14:00",
      driverId: "DRV-02",
      driverName: "أشرف عادل",
      driverPhone: "01155443322",
      vehicleId: "VEH-02",
      vehiclePlate: "ب ط 891",
      vehicleType: "جامبو مغلقة",
      deliveryTeam: "أشرف عادل + م/ حمادة (نجار)",
      status: "RESCHEDULED",
      notes: "تمت إعادة الجدولة لطلب العميلة بسبب تأخر تشطيبات الشقة",
      specialInstructions: "التنسيق قبل التحرك بساعتين",
      needsAssembly: true,
      codAmount: 68500,
      depositPaid: 30000,
      totalContractAmount: 98500,
      isPartial: false,
      timeline: [
        { id: "DL-EV-12", status: "DRAFT", title: "إنشاء الشحنة", description: "طلب غرفة نوم م. نادية", timestamp: "2026-09-15 12:00", author: "سارة ممدوح" },
        { id: "DL-EV-13", status: "FAILED", title: "تعذر التسليم بالموعد السابق", description: "طلبت العميلة تأجيل الاستلام لحين انتهاء دهانات الغرفة", timestamp: "2026-09-20 11:30", author: "أشرف عادل" },
        { id: "DL-EV-14", status: "RESCHEDULED", title: "إعادة الجدولة ليوم الخميس", description: "تم تعديل الموعد إلى الخميس القادم 12:00 - 02:00 م", timestamp: "2026-09-21 09:15", author: "منسق الشحن" },
      ],
      createdAt: "2026-09-15",
    },
    {
      id: "DL-1039",
      deliveryNumber: "DL-1039",
      contractId: "ORD-2026-082",
      contractNumber: "ORD-2026-082",
      customerId: "CUST-05",
      customerName: "أ. طارق عبد العزيز",
      customerPhone: "01234567890",
      deliveryAddress: "مدينة نصر - مكرم عبيد - برج الأطباء",
      city: "القاهرة",
      zone: "مدينة نصر",
      branch: "فرع التجمع الرئيسي",
      warehouse: "مخزن التجمع الخلفي",
      items: [
        {
          productId: "PROD-03",
          productName: "طقم غرفة طعام أوركيد",
          fabricColor: "رخام إسباني",
          quantity: 1,
          pickedQty: 1,
          unitPrice: 88000,
          isFromFloor: false,
        },
        {
          productId: "PROD-04",
          productName: "نجفة مودرن كريستال عصفور",
          fabricColor: "إضاءة دافئة",
          quantity: 1,
          pickedQty: 1,
          unitPrice: 28000,
          isFromFloor: false,
        },
      ],
      scheduledDate: "2026-09-20",
      timeWindow: "10:00 - 12:00",
      driverId: "DRV-03",
      driverName: "سيد حسني",
      driverPhone: "01288776655",
      vehicleId: "VEH-03",
      vehiclePlate: "ج ن 112",
      vehicleType: "فان مغلقة",
      deliveryTeam: "سيد حسني + م/ محمود (فني كهرباء ونجف)",
      status: "DELIVERED",
      notes: "تم التسليم بنجاح وتحصيل المبلغ كاملاً وتجربة النجفة",
      needsAssembly: true,
      codAmount: 35000,
      depositPaid: 75000,
      totalContractAmount: 110000,
      isPartial: false,
      proofOfDelivery: {
        deliveredAt: "2026-09-20 11:40",
        receivedBy: "أ. طارق عبد العزيز",
        receiverRelation: "العميل نفسه",
        codCollected: 35000,
        hasSignature: true,
        signatureName: "طارق عبد العزيز",
        notes: "تم تركيب النجفة والتأكد من سلامة السفرة بالكامل بدون أي ملاحظات",
      },
      timeline: [
        { id: "DL-EV-15", status: "DRAFT", title: "إنشاء إذن التسليم", description: "أمر شحن سفرة ونجفة", timestamp: "2026-09-12 14:00", author: "كريم يوسف" },
        { id: "DL-EV-16", status: "OUT_FOR_DELIVERY", title: "خروج سيارة الشحن", description: "خرجت الشحنة مع سيد حسني ومحمود فني الكهرباء", timestamp: "2026-09-20 09:30", author: "منسق الشحن" },
        { id: "DL-EV-17", status: "DELIVERED", title: "تم التسليم والتحصيل بنجاح ✅", description: "تحصيل 35,000 ج.م نقداً وتوقيع إثبات التسليم", timestamp: "2026-09-20 11:45", author: "سيد حسني" },
      ],
      createdAt: "2026-09-12",
      deliveredAt: "2026-09-20 11:40",
    },
    {
      id: "DL-1055",
      deliveryNumber: "DL-1055",
      contractId: "ORD-2026-091",
      contractNumber: "ORD-2026-091",
      customerId: "CUST-03",
      customerName: "أ. طارق عبد المجيد",
      customerPhone: "01188997766",
      deliveryAddress: "طنطا - شارع النحاس - برج الصفا",
      city: "طنطا",
      zone: "طنطا",
      branch: "فرع طنطا",
      warehouse: "معرض فرع طنطا",
      items: [
        {
          productId: "PROD-05",
          productName: "كنبة ثلاثية مودرن فيرونا (Sofa Verona)",
          fabricColor: "بيج كريمي",
          quantity: 2,
          pickedQty: 0,
          unitPrice: 34000,
          isFromFloor: false,
          notes: "القطعة قيد النقل من دمياط إلى طنطا بأمر TR-2026-041",
        },
      ],
      scheduledDate: "2026-09-28",
      timeWindow: "14:00 - 16:00",
      status: "DRAFT",
      notes: "لا يمكن اعتماد الجاهزية لوجود نقص في رصيد المستودع الحالي",
      needsAssembly: false,
      codAmount: 48000,
      depositPaid: 20000,
      totalContractAmount: 68000,
      isPartial: false,
      timeline: [
        { id: "DL-EV-18", status: "DRAFT", title: "إنشاء مسودة التسليم", description: "تم إنشاء المسودة بانتظار وصول شحنة التحويل", timestamp: "2026-09-20 13:05", author: "محمود الشامي" },
      ],
      createdAt: "2026-09-20",
    },
  ]);

  // 15. Delivery Issues Log
  const [deliveryIssues, setDeliveryIssues] = useState<DeliveryIssue[]>([
    {
      id: "ISS-01",
      deliveryId: "DL-1050",
      deliveryNumber: "DL-1050",
      contractNumber: "ORD-2026-085",
      customerName: "م. نادية رشدي",
      customerPhone: "01198765432",
      type: "DAMAGED",
      severity: "MEDIUM",
      description: "خدش طفيف في جانب كومود غرفة النوم أثناء التحميل بالمصعد",
      status: "INVESTIGATING",
      reportedBy: "أشرف عادل (سائق)",
      reportedAt: "2026-09-20 12:15",
      resolutionNotes: "جاري إرسال فني استرجاع ودهان لترميم القطعة قبل موعد التسليم الجديد",
    },
    {
      id: "ISS-02",
      deliveryId: "DL-1039",
      deliveryNumber: "DL-1039",
      contractNumber: "ORD-2026-082",
      customerName: "أ. طارق عبد العزيز",
      customerPhone: "01234567890",
      type: "INSTALLATION_ISSUE",
      severity: "LOW",
      description: "حاجة لسلك تمديد إضافي لتعليق النجفة في السقف المرتفع",
      status: "RESOLVED",
      reportedBy: "م/ محمود (فني كهرباء)",
      reportedAt: "2026-09-20 10:45",
      resolutionNotes: "تم توفير الوصلة الإضافية وتركيب النجفة بنجاح تام",
      resolvedAt: "2026-09-20 11:30",
    },
  ]);

  // 16. Delivery Returns Log
  const [deliveryReturns, setDeliveryReturns] = useState<DeliveryReturn[]>([
    {
      id: "RET-01",
      deliveryId: "DL-1030",
      deliveryNumber: "DL-1030",
      contractNumber: "ORD-2026-080",
      customerName: "د. هاني عبد الحميد",
      productId: "PROD-06",
      productName: "ترابيزة شاي وسطية رخام كلكتا",
      quantity: 1,
      reason: "شرخ سطحي غير مطابق للمواصفات تم اكتشافه عند فتح التغليف",
      condition: "MINOR_DAMAGE",
      returnedToWarehouse: "مخزن التجمع الخلفي",
      inventoryAction: "WORKSHOP",
      status: "PENDING_INSPECTION",
      requestedAt: "2026-09-19 16:00",
      notes: "تم استبدال القطعة للعميل فوراً وإرجاع القطعة القديمة للصيانة",
    },
  ]);

  // 17. Smart Logistics Insights & AI Engine
  const [logisticsInsights, setLogisticsInsights] = useState<LogisticsInsight[]>([
    {
      id: "LINS-01",
      type: "NOT_SCHEDULED",
      severity: "WARNING",
      title: "عقد جاهز للتسليم ولم يتم جدولته ⚠️",
      description: "غرفة نوم هيلتون (#DL-1048) الخاصة بالعميل م. شريف فهمي جاهزة بالكامل بمستودع دمياط.",
      recommendation: "يُقترح التواصل مع العميل وتحديد نافذة تسليم ليوم الخميس في منطقة الشيخ زايد.",
      affectedDeliveryIds: ["DL-1048"],
      targetZone: "الشيخ زايد",
      actionLabel: "جدولة موعد التسليم الآن",
      actionType: "SCHEDULE",
      resolved: false,
    },
    {
      id: "LINS-02",
      type: "ROUTE_GROUPING",
      severity: "OPPORTUNITY",
      title: "تجميع ذكي: رحلتان في الشيخ زايد يوم الخميس 💡",
      description: "يوجد تسليم #DL-1048 وتسليم #DL-1050 في الشيخ زايد (كمبوند الربوة وكمبوند الياسمين) في نفس اليوم.",
      recommendation: "تجميع الطلبين مع السائق أشرف عادل وسيارة الجامبو لتوفير 45% من استهلاك الوقود وتكلفة الشحن.",
      affectedDeliveryIds: ["DL-1048", "DL-1050"],
      targetZone: "الشيخ زايد",
      targetDate: "2026-09-24",
      actionLabel: "دمج في خط سير واحد",
      actionType: "GROUP_ROUTE",
      resolved: false,
    },
    {
      id: "LINS-03",
      type: "INCOMPLETE_ITEMS",
      severity: "CRITICAL",
      title: "طلب غير مكتمل بمخزن طنطا (#DL-1055) ⚠️",
      description: "طلب العميل أ. طارق عبد المجيد (2 كنبة فيرونا) غير مكتمل بالمخزن ورصيده الحالي لا يسمح بالتحميل.",
      recommendation: "أمر التحويل TR-2026-041 في الطريق من دمياط. يرجى تأكيد استلامه قبل اعتماد الجاهزية للتسليم.",
      affectedDeliveryIds: ["DL-1055"],
      targetZone: "طنطا",
      actionLabel: "متابعة إذن الاستلام TR-2026-041",
      actionType: "RESOLVE_STOCK",
      resolved: false,
    },
    {
      id: "LINS-04",
      type: "DELAYED",
      severity: "WARNING",
      title: "شحنة مؤجلة بطلب العميل (#DL-1050) ⚠️",
      description: "شحنة م. نادية رشدي تم تأجيلها من الموعد الأصلي بناء على رغبة العميل.",
      recommendation: "تأكيد جهوزية موقع العميل قبل موعد الخميس بـ 24 ساعة.",
      affectedDeliveryIds: ["DL-1050"],
      targetZone: "الشيخ زايد",
      actionLabel: "إرسال رسالة واتساب تأكيدية",
      resolved: false,
    },
    {
      id: "LINS-05",
      type: "FLEET_CAPACITY_OVERLOAD",
      severity: "INFO",
      title: "ضغط مرتفع متوقع على أسطول الشحن يوم السبت 💡",
      description: "تم حجز 85% من سعة سيارات النقل ليوم السبت القادم بمحافظة القاهرة والجيزة.",
      recommendation: "يُقترح تقديم مواعيد بعض الشحنات ليوم الجمعة أو تأجيل الشحنات المرنة للأحد.",
      actionLabel: "مراجعة خريطة الأسبوع",
      resolved: false,
    },
  ]);

  // ==========================================
  // INVENTORY & STOCK LOGIC HANDLERS
  // ==========================================

  // 1. Create Transfer Order
  const createTransferOrder = (data: Omit<TransferOrder, "id" | "transferNumber" | "status" | "requestedAt">) => {
    const newTransferNumber = `TR-2026-${String(transferOrders.length + 42).padStart(3, "0")}`;
    const newTransfer: TransferOrder = {
      ...data,
      id: generateUniqueId("TR"),
      transferNumber: newTransferNumber,
      status: "REQUESTED",
      requestedAt: new Date().toLocaleString("ar-EG"),
    };
    setTransferOrders((prev) => [newTransfer, ...prev]);

    // Record Movement in Audit
    const movement: StockMovement = {
      id: generateUniqueId("MOV"),
      productId: data.productId,
      productName: data.productName,
      movementType: "TRANSFER_OUT",
      quantity: data.quantity,
      fromLocation: `${data.fromBranch} (${data.fromWarehouse})`,
      toLocation: `${data.toBranch} (${data.toWarehouse})`,
      reference: newTransferNumber,
      user: data.requestedBy,
      date: new Date().toLocaleString("ar-EG"),
      notes: `طلب تحويل مخزني جديد: ${data.notes || "بانتظار الاعتماد"}`,
    };
    setStockMovements((prev) => [movement, ...prev]);

    return newTransfer;
  };

  // 2. Approve Transfer Order
  const approveTransferOrder = (transferId: string, approvedBy: string) => {
    setTransferOrders((prev) =>
      prev.map((tr) => (tr.id === transferId ? { ...tr, status: "APPROVED", approvedBy } : tr))
    );
  };

  // 3. Ship Transfer Order (Moves out from source, increases inTransit)
  const shipTransferOrder = (transferId: string, driverName: string) => {
    const tr = transferOrders.find((t) => t.id === transferId);
    if (!tr) return;

    setTransferOrders((prev) =>
      prev.map((t) =>
        t.id === transferId
          ? { ...t, status: "IN_TRANSIT", shippedAt: new Date().toLocaleString("ar-EG"), driverName }
          : t
      )
    );

    // Update Stock Levels: Source OnHand decreases, Destination inTransit increases
    setStockLevels((prev) =>
      prev.map((stk) => {
        if (stk.productId === tr.productId && stk.warehouseName === tr.fromWarehouse) {
          return { ...stk, onHand: Math.max(0, stk.onHand - tr.quantity) };
        }
        if (stk.productId === tr.productId && stk.warehouseName === tr.toWarehouse) {
          return { ...stk, inTransit: stk.inTransit + tr.quantity };
        }
        return stk;
      })
    );

    // Audit Movement
    const movement: StockMovement = {
      id: generateUniqueId("MOV"),
      productId: tr.productId,
      productName: tr.productName,
      movementType: "TRANSFER_OUT",
      quantity: tr.quantity,
      fromLocation: `${tr.fromBranch} (${tr.fromWarehouse})`,
      toLocation: `شحن قيد النقل مع: ${driverName}`,
      reference: tr.transferNumber,
      user: driverName,
      date: new Date().toLocaleString("ar-EG"),
      notes: "خرجت الشحنة من المخزن المصدر وهي في طريقها للفرع المستلم",
    };
    setStockMovements((prev) => [movement, ...prev]);
  };

  // 4. Receive Transfer Order (inTransit decreases, Destination OnHand increases)
  const receiveTransferOrder = (transferId: string, receivedBy: string) => {
    const tr = transferOrders.find((t) => t.id === transferId);
    if (!tr) return;

    setTransferOrders((prev) =>
      prev.map((t) =>
        t.id === transferId
          ? { ...t, status: "RECEIVED", receivedAt: new Date().toLocaleString("ar-EG") }
          : t
      )
    );

    // Update Stock Levels: Destination inTransit decreases, Destination OnHand increases
    setStockLevels((prev) =>
      prev.map((stk) => {
        if (stk.productId === tr.productId && stk.warehouseName === tr.toWarehouse) {
          return {
            ...stk,
            inTransit: Math.max(0, stk.inTransit - tr.quantity),
            onHand: stk.onHand + tr.quantity,
          };
        }
        return stk;
      })
    );

    // Audit Movement
    const movement: StockMovement = {
      id: generateUniqueId("MOV"),
      productId: tr.productId,
      productName: tr.productName,
      movementType: "TRANSFER_IN",
      quantity: tr.quantity,
      fromLocation: `شحن قيد النقل من ${tr.fromBranch}`,
      toLocation: `${tr.toBranch} (${tr.toWarehouse})`,
      reference: tr.transferNumber,
      user: receivedBy,
      date: new Date().toLocaleString("ar-EG"),
      notes: "تم استلام الشحنة وتفريغها بالمستودع بنجاح وتحديث الرصيد",
    };
    setStockMovements((prev) => [movement, ...prev]);
  };

  const cancelTransferOrder = (transferId: string) => {
    setTransferOrders((prev) =>
      prev.map((t) => (t.id === transferId ? { ...t, status: "CANCELLED" } : t))
    );
  };

  // 5. Create Receiving Order
  const createReceivingOrder = (data: Omit<ReceivingOrder, "id" | "status" | "receivedAt">) => {
    const newOrder: ReceivingOrder = {
      ...data,
      id: generateUniqueId("REC"),
      status: "PENDING",
      receivedAt: new Date().toLocaleString("ar-EG"),
    };
    setReceivingOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  // 6. Confirm Receiving Order & Update Stock
  const confirmReceivingOrder = (receivingId: string, items: ReceivingOrderItem[], receivedBy: string) => {
    const rec = receivingOrders.find((r) => r.id === receivingId);
    if (!rec) return;

    const hasDiscrepancy = items.some((i) => i.missingQty > 0 || i.damagedQty > 0);

    setReceivingOrders((prev) =>
      prev.map((r) =>
        r.id === receivingId
          ? {
              ...r,
              items,
              status: hasDiscrepancy ? "DISCREPANCY" : "RECEIVED",
              receivedBy,
              receivedAt: new Date().toLocaleString("ar-EG"),
            }
          : r
      )
    );

    // Increase OnHand in target warehouse for each received item
    items.forEach((item) => {
      if (item.receivedQty > 0) {
        setStockLevels((prev) =>
          prev.map((stk) => {
            if (stk.productId === item.productId && stk.warehouseName === rec.destinationWarehouse) {
              return { ...stk, onHand: stk.onHand + item.receivedQty };
            }
            return stk;
          })
        );

        // Record Movement
        const mov: StockMovement = {
          id: generateUniqueId("MOV"),
          productId: item.productId,
          productName: item.productName,
          movementType: "RECEIVING",
          quantity: item.receivedQty,
          fromLocation: rec.supplierName,
          toLocation: rec.destinationWarehouse,
          reference: rec.poNumber,
          user: receivedBy,
          date: new Date().toLocaleString("ar-EG"),
          notes: `استلام شحنة توريد من المورد (${item.status})`,
        };
        setStockMovements((prev) => [mov, ...prev]);
      }
    });
  };

  // 7. Stock Count & Adjustment Approval
  const createStockCount = (data: Omit<StockCount, "id" | "status">) => {
    const newCount: StockCount = {
      ...data,
      id: generateUniqueId("CNT"),
      status: "PENDING_APPROVAL",
    };
    setStockCounts((prev) => [newCount, ...prev]);
    return newCount;
  };

  const approveStockCountAdjustment = (countId: string, approvedBy: string) => {
    const cnt = stockCounts.find((c) => c.id === countId);
    if (!cnt) return;

    setStockCounts((prev) =>
      prev.map((c) => (c.id === countId ? { ...c, status: "APPROVED_ADJUSTED", approvedBy } : c))
    );

    // Adjust each stock level with difference
    cnt.items.forEach((it) => {
      if (it.difference !== 0) {
        setStockLevels((prev) =>
          prev.map((stk) => {
            if (stk.productId === it.productId && stk.warehouseName === cnt.warehouseName) {
              return { ...stk, onHand: it.physicalQty };
            }
            return stk;
          })
        );

        // Audit Movement
        const mov: StockMovement = {
          id: generateUniqueId("MOV"),
          productId: it.productId,
          productName: it.productName,
          movementType: "ADJUSTMENT",
          quantity: Math.abs(it.difference),
          fromLocation: it.difference < 0 ? cnt.warehouseName : "تسوية جردية (فائض)",
          toLocation: it.difference < 0 ? "تسوية جردية (عجز/تالف)" : cnt.warehouseName,
          reference: cnt.countNumber,
          user: approvedBy,
          date: new Date().toLocaleString("ar-EG"),
          notes: `تسوية فروقات جرد معتمدة: ${it.reason || "تعديل رصيد مطابق للجرد الفعلي"}`,
        };
        setStockMovements((prev) => [mov, ...prev]);
      }
    });
  };

  // 8. Add/Update Product
  const addProduct = (productData: Omit<ProductItem, "id" | "stockQuantity">, initialStockByWarehouse?: Record<string, number>) => {
    const newId = generateUniqueId("PROD");
    const totalInitStock = initialStockByWarehouse
      ? Object.values(initialStockByWarehouse).reduce((a, b) => a + b, 0)
      : 0;

    const newProd: ProductItem = {
      ...productData,
      id: newId,
      stockQuantity: totalInitStock,
    };
    setProducts((prev) => [newProd, ...prev]);

    // Create stock levels for warehouses
    if (initialStockByWarehouse) {
      Object.entries(initialStockByWarehouse).forEach(([whId, qty]) => {
        const wh = warehouses.find((w) => w.id === whId);
        if (wh && qty > 0) {
          const newStk: StockLevel = {
            id: generateUniqueId("STK"),
            productId: newId,
            warehouseId: wh.id,
            branchName: wh.branchName,
            warehouseName: wh.name,
            locationCode: "A01",
            onHand: qty,
            reserved: 0,
            display: 0,
            damaged: 0,
            inTransit: 0,
          };
          setStockLevels((prev) => [...prev, newStk]);

          // Audit
          const mov: StockMovement = {
            id: generateUniqueId("MOV"),
            productId: newId,
            productName: newProd.name,
            movementType: "RECEIVING",
            quantity: qty,
            fromLocation: "رصيد افتتاحي / تسجيل صنف",
            toLocation: wh.name,
            reference: `INIT-${newProd.sku}`,
            user: "أحمد سمير",
            date: new Date().toLocaleString("ar-EG"),
            notes: "تسجيل صنف جديد مع رصيد أولي بالمستودع",
          };
          setStockMovements((prev) => [mov, ...prev]);
        }
      });
    }

    return newProd;
  };

  const updateProduct = (productId: string, data: Partial<ProductItem>) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...data } : p)));
  };

  // 9. Manual Adjust Stock with Reason & Audit
  const adjustStock = (productId: string, warehouseId: string, newOnHand: number, reason: string, user: string) => {
    const prod = products.find((p) => p.id === productId);
    const wh = warehouses.find((w) => w.id === warehouseId);
    if (!prod || !wh) return;

    const currentStk = stockLevels.find((s) => s.productId === productId && s.warehouseId === warehouseId);
    const prevOnHand = currentStk?.onHand || 0;
    const diff = newOnHand - prevOnHand;

    setStockLevels((prev) =>
      prev.map((s) => {
        if (s.productId === productId && s.warehouseId === warehouseId) {
          return { ...s, onHand: newOnHand };
        }
        return s;
      })
    );

    const mov: StockMovement = {
      id: generateUniqueId("MOV"),
      productId: prod.id,
      productName: prod.name,
      movementType: "ADJUSTMENT",
      quantity: Math.abs(diff),
      fromLocation: diff < 0 ? wh.name : "تسوية يدوية",
      toLocation: diff < 0 ? "تسوية يدوية" : wh.name,
      reference: `ADJ-${Date.now().toString().slice(-4)}`,
      user,
      date: new Date().toLocaleString("ar-EG"),
      notes: `تعديل رصيد يدوي: ${reason}`,
    };
    setStockMovements((prev) => [mov, ...prev]);
  };

  // 10. Apply Transfer Suggestion from Smart Insights
  const applyTransferSuggestion = (insightId: string) => {
    const insight = smartInsights.find((i) => i.id === insightId);
    if (!insight || !insight.fromBranch || !insight.toBranch || !insight.relatedProductId) return;

    const fromWh = warehouses.find((w) => w.branchName === insight.fromBranch && w.type === "WAREHOUSE") || warehouses.find((w) => w.branchName === insight.fromBranch);
    const toWh = warehouses.find((w) => w.branchName === insight.toBranch && w.type === "SHOWROOM") || warehouses.find((w) => w.branchName === insight.toBranch);

    if (fromWh && toWh) {
      createTransferOrder({
        productId: insight.relatedProductId,
        productName: insight.relatedProductName || "منتج",
        fromBranch: insight.fromBranch,
        fromWarehouse: fromWh.name,
        toBranch: insight.toBranch,
        toWarehouse: toWh.name,
        quantity: insight.suggestedQty || 2,
        requestedBy: "الذكاء المخزني (Smart Insight)",
        notes: `تم إنشاء التحويل آلياً بناء على التوصية الذكية: ${insight.recommendation}`,
      });

      setSmartInsights((prev) =>
        prev.map((ins) => (ins.id === insightId ? { ...ins, resolved: true } : ins))
      );
    }
  };

  const dismissInsight = (insightId: string) => {
    setSmartInsights((prev) => prev.filter((i) => i.id !== insightId));
  };

  // ==========================================
  // POS & CONTRACTS INTEGRATION WITH INVENTORY
  // ==========================================
  const createOrder = (orderData: Omit<ContractOrder, "id" | "orderNumber" | "createdAt">) => {
    const newOrderNumber = `ORD-2026-${String(orders.length + 89).padStart(3, "0")}`;
    const newOrder: ContractOrder = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      orderNumber: newOrderNumber,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setOrders((prev) => [newOrder, ...prev]);

    // 1. Automatically update single customer record
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.phone === orderData.customerPhone || c.id === orderData.customerId) {
          return {
            ...c,
            stage: "CONTRACTED",
            timeline: [
              {
                id: generateUniqueId("EV"),
                type: "contract",
                title: `توقيع تعاقد جديد #${newOrderNumber}`,
                description: `تعاقد بقيمة ${orderData.netAmount.toLocaleString()} ج | عربون مسدد: ${orderData.depositPaid.toLocaleString()} ج`,
                timestamp: "الآن",
                author: orderData.salesRep,
                badge: "تعاقد POS",
                badgeColor: "bg-emerald-100 text-emerald-900 font-bold",
              },
              ...c.timeline,
            ],
          };
        }
        return c;
      })
    );

    // 2. Automatically Create Stock Reservation & Movement for each ordered product
    orderData.items.forEach((item) => {
      // Find matching warehouse for the order branch
      const matchedWh =
        warehouses.find((w) => w.branchName === orderData.branch && w.type === "WAREHOUSE") ||
        warehouses.find((w) => w.branchName === orderData.branch) ||
        warehouses[0];

      // Add Stock Reservation
      const newRes: StockReservation = {
        id: generateUniqueId("RES"),
        productId: item.productId,
        productName: item.productName,
        branchName: orderData.branch,
        warehouseName: matchedWh.name,
        quantity: item.quantity,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        contractNumber: newOrderNumber,
        contractId: newOrder.id,
        status: "ACTIVE",
        reservedAt: new Date().toISOString().split("T")[0],
        deliveryTargetDate: orderData.deliveryDate,
      };
      setStockReservations((prev) => [newRes, ...prev]);

      // Update Stock Level: reserved increases
      setStockLevels((prev) =>
        prev.map((stk) => {
          if (stk.productId === item.productId && (stk.branchName === orderData.branch || stk.warehouseId === matchedWh.id)) {
            return { ...stk, reserved: stk.reserved + item.quantity };
          }
          return stk;
        })
      );

      // Record Reservation Movement in Audit
      const mov: StockMovement = {
        id: generateUniqueId("MOV"),
        productId: item.productId,
        productName: item.productName,
        movementType: "RESERVATION",
        quantity: item.quantity,
        fromLocation: `${orderData.branch} (${matchedWh.name})`,
        toLocation: `حجز لعقد العميل: ${orderData.customerName}`,
        reference: newOrderNumber,
        user: orderData.salesRep,
        date: new Date().toLocaleString("ar-EG"),
        notes: `حجز تلقائي من الـ POS بعد سداد العربون بقيمة ${orderData.depositPaid.toLocaleString()} ج`,
      };
      setStockMovements((prev) => [mov, ...prev]);
    });

    return newOrder;
  };

  const collectPayment = (orderId: string, amount: number) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const newDeposit = ord.depositPaid + amount;
          const newRemaining = Math.max(0, ord.netAmount - newDeposit);
          return {
            ...ord,
            depositPaid: newDeposit,
            remainingDue: newRemaining,
            status: newRemaining === 0 ? "DELIVERED_PAID" : ord.status,
          };
        }
        return ord;
      })
    );
  };

  // ----------------------------------------------------
  // CRM & VISITS FUNCTIONS
  // ----------------------------------------------------
  const addCustomer = (data: Partial<CustomerRecord> & { fullName: string; phone: string }) => {
    const newCustomer: CustomerRecord = {
      id: generateUniqueId("CUST"),
      fullName: data.fullName,
      phone: data.phone,
      whatsapp: data.whatsapp || data.phone,
      city: data.city || "القاهرة",
      source: data.source || "Meta Lead Ads",
      campaignName: data.campaignName,
      preferredBranch: data.preferredBranch || "فرع التجمع الرئيسي",
      assignedRep: data.assignedRep || "كريم يوسف",
      stage: data.stage || "LEAD",
      interestedProducts: data.interestedProducts || [],
      nextAction: data.nextAction,
      notes: data.notes || "",
      createdAt: new Date().toISOString().split("T")[0],
      timeline: [
        {
          id: generateUniqueId("EV"),
          type: "note",
          title: "تسجيل العميل بالـ CRM",
          description: `تم تسجيل العميل عبر ${data.source || "Meta Lead Ads"}`,
          timestamp: "الآن",
          author: data.assignedRep || "النظام",
          badge: "ليد جديد",
          badgeColor: "bg-blue-50 text-blue-700",
        },
      ],
      quotations: [],
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (customerId: string, data: Partial<CustomerRecord>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, ...data } : c))
    );
  };

  const updateCustomerJourney = (customerId: string, stage: JourneyStage, customTitle?: string, customDesc?: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            stage,
            timeline: [
              {
                id: generateUniqueId("EV"),
                type: "note",
                title: customTitle || `تحديث مرحلة العميل إلى (${stage})`,
                description: customDesc || "تم تحديث مسار رحلة العميل بنجاح",
                timestamp: "الآن",
                author: "مسؤول المبيعات",
                badge: stage,
                badgeColor: "bg-emerald-50 text-emerald-700 font-bold",
              },
              ...c.timeline,
            ],
          };
        }
        return c;
      })
    );
  };

  const addTimelineEvent = (customerId: string, event: Omit<TimelineEvent, "id">) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: generateUniqueId("EV"),
    };
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId ? { ...c, timeline: [newEvent, ...c.timeline] } : c
      )
    );
  };

  const setCustomerNextAction = (customerId: string, action: NextAction) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            nextAction: action,
            timeline: [
              {
                id: generateUniqueId("EV"),
                type: "followup",
                title: "تحديد إجراء قادم (Next Action)",
                description: `${action.task} - الموعد: ${action.dueDate} (المسؤول: ${action.rep})`,
                timestamp: "الآن",
                author: action.rep,
                badge: "متابعة",
                badgeColor: action.priority === "urgent" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700",
              },
              ...c.timeline,
            ],
          };
        }
        return c;
      })
    );
  };

  const completeNextAction = (customerId: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId && c.nextAction) {
          return {
            ...c,
            nextAction: { ...c.nextAction, completed: true },
            timeline: [
              {
                id: generateUniqueId("EV"),
                type: "followup",
                title: "إتمام المتابعة بنجاح",
                description: `تم تنفيذ: ${c.nextAction.task}`,
                timestamp: "الآن",
                author: c.nextAction.rep,
                badge: "تم الإنجاز ✅",
                badgeColor: "bg-emerald-50 text-emerald-700",
              },
              ...c.timeline,
            ],
          };
        }
        return c;
      })
    );
  };

  // Visits
  const addVisit = (visitData: Omit<ShowroomVisit, "id">) => {
    const newVisit: ShowroomVisit = {
      ...visitData,
      id: `VIS-${Date.now().toString().slice(-4)}`,
    };
    setVisits((prev) => [newVisit, ...prev]);

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.phone === visitData.phone || c.id === visitData.customerId) {
          return {
            ...c,
            stage: "VISIT_BOOKED",
            timeline: [
              {
                id: generateUniqueId("EV"),
                type: "visit_booked",
                title: `حجز موعد زيارة في ${visitData.branch}`,
                description: `موعد: ${visitData.visitDate} (${visitData.timeSlot}) - مسؤول المبيعات: ${visitData.salesRep}`,
                timestamp: "الآن",
                author: visitData.salesRep,
                badge: "حجز موعد",
                badgeColor: "bg-amber-50 text-amber-700",
              },
              ...c.timeline,
            ],
          };
        }
        return c;
      })
    );
  };

  const updateVisitStatus = (
    visitId: string,
    status: ShowroomVisit["status"],
    outcome?: ShowroomVisit["outcome"],
    outcomeNotes?: string
  ) => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId
          ? {
              ...v,
              status,
              outcome: outcome || v.outcome,
              outcomeNotes: outcomeNotes || v.outcomeNotes,
            }
          : v
      )
    );
  };

  const checkInVisit = (visitId: string) => {
    const nowTime = new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
    setVisits((prev) =>
      prev.map((v) => {
        if (v.id === visitId) {
          return { ...v, status: "CHECKED_IN", checkInTime: nowTime };
        }
        return v;
      })
    );

    const visit = visits.find((v) => v.id === visitId);
    if (visit) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.phone === visit.phone || c.id === visit.customerId) {
            return {
              ...c,
              stage: "CHECKED_IN",
              timeline: [
                {
                  id: generateUniqueId("EV"),
                  type: "visit_checkin",
                  title: "تسجيل حضور العميل بالمعرض (Checked-in)",
                  description: `حضر العميل في ${visit.branch} الساعة ${nowTime}`,
                  timestamp: "الآن",
                  author: visit.salesRep,
                  badge: "حضور مؤكد",
                  badgeColor: "bg-emerald-50 text-emerald-700",
                },
                ...c.timeline,
              ],
            };
          }
          return c;
        })
      );
    }
  };

  const startInspection = (visitId: string) => {
    setVisits((prev) =>
      prev.map((v) => (v.id === visitId ? { ...v, status: "INSPECTING" } : v))
    );
    const visit = visits.find((v) => v.id === visitId);
    if (visit) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.phone === visit.phone || c.id === visit.customerId) {
            return {
              ...c,
              stage: "INSPECTING",
              timeline: [
                {
                  id: generateUniqueId("EV"),
                  type: "inspecting",
                  title: "بدء معاينة المنتجات بالصالة",
                  description: `جولة معاينة مع مسؤول المبيعات: ${visit.salesRep}`,
                  timestamp: "الآن",
                  author: visit.salesRep,
                  badge: "جاري المعاينة",
                  badgeColor: "bg-blue-50 text-blue-700",
                },
                ...c.timeline,
              ],
            };
          }
          return c;
        })
      );
    }
  };

  const endVisit = (
    visitId: string,
    outcome: ShowroomVisit["outcome"],
    outcomeNotes?: string,
    nextAction?: NextAction
  ) => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId
          ? {
              ...v,
              status: "COMPLETED",
              outcome,
              outcomeNotes,
            }
          : v
      )
    );

    const visit = visits.find((v) => v.id === visitId);
    if (visit) {
      const outcomeLabels: Record<string, string> = {
        VERY_INTERESTED: "مهتم جداً وقريب من التعاقد",
        INTERESTED: "مهتم بالمنتج ويقارن الخيارات",
        NEEDS_FOLLOWUP: "يحتاج متابعة واستشارة العائلة",
        NO_MATCH: "لم يجد الموديل أو المقاس المناسب",
        CONTRACTED: "تم التعاقد ودفع العربون بنجاح",
      };

      setCustomers((prev) =>
        prev.map((c) => {
          if (c.phone === visit.phone || c.id === visit.customerId) {
            const updatedTimeline: TimelineEvent[] = [
              {
                id: generateUniqueId("EV"),
                type: "visit_ended",
                title: `إنهاء الزيارة - النتيجة: ${outcome ? outcomeLabels[outcome] : "مكتملة"}`,
                description: outcomeNotes || "تمت الزيارة ومناقشة التفاصيل مع مسؤول المبيعات",
                timestamp: "الآن",
                author: visit.salesRep,
                badge: "نتيجة الزيارة",
                badgeColor: "bg-purple-50 text-purple-700",
              },
              ...c.timeline,
            ];

            return {
              ...c,
              stage: outcome === "CONTRACTED" ? "CONTRACTED" : c.stage,
              nextAction: nextAction || c.nextAction,
              timeline: updatedTimeline,
            };
          }
          return c;
        })
      );
    }
  };

  // ==========================================
  // DELIVERY & LOGISTICS LOGIC HANDLERS
  // ==========================================

  // 1. Create Delivery Order
  const createDeliveryOrder = (orderData: Partial<DeliveryOrder> & { contractId: string }) => {
    const matchedContract = orders.find((o) => o.id === orderData.contractId || o.orderNumber === orderData.contractId);
    const newDeliveryNumber = `DL-${1056 + deliveries.length}`;
    const newDeliveryId = generateUniqueId("DL");

    const deliveryItems: DeliveryItem[] = orderData.items && orderData.items.length > 0
      ? orderData.items
      : (matchedContract?.items.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          fabricColor: it.fabricColor,
          quantity: it.quantity,
          pickedQty: 0,
          unitPrice: it.unitPrice,
          isFromFloor: it.isFromFloor,
        })) || []);

    const newDelivery: DeliveryOrder = {
      id: newDeliveryId,
      deliveryNumber: newDeliveryNumber,
      contractId: matchedContract?.id || orderData.contractId,
      contractNumber: matchedContract?.orderNumber || orderData.contractNumber || "ORD-2026-NEW",
      customerId: matchedContract?.customerId || orderData.customerId,
      customerName: orderData.customerName || matchedContract?.customerName || "عميل بدون اسم",
      customerPhone: orderData.customerPhone || matchedContract?.customerPhone || "",
      deliveryAddress: orderData.deliveryAddress || matchedContract?.deliveryAddress || "",
      city: orderData.city || matchedContract?.customerCity || "القاهرة",
      zone: orderData.zone || orderData.city || "المنطقة الرئيسية",
      branch: orderData.branch || matchedContract?.branch || "فرع التجمع الرئيسي",
      warehouse: orderData.warehouse || "مخزن التجمع الخلفي",
      items: deliveryItems,
      scheduledDate: orderData.scheduledDate || matchedContract?.deliveryDate || new Date().toISOString().split("T")[0],
      timeWindow: orderData.timeWindow || "12:00 - 14:00",
      driverId: orderData.driverId,
      driverName: orderData.driverName,
      driverPhone: orderData.driverPhone,
      vehicleId: orderData.vehicleId,
      vehiclePlate: orderData.vehiclePlate,
      vehicleType: orderData.vehicleType,
      deliveryTeam: orderData.deliveryTeam,
      status: orderData.status || "DRAFT",
      notes: orderData.notes || matchedContract?.notes || "",
      specialInstructions: orderData.specialInstructions || "",
      needsAssembly: orderData.needsAssembly ?? matchedContract?.needsAssembly ?? true,
      codAmount: orderData.codAmount ?? matchedContract?.remainingDue ?? 0,
      depositPaid: orderData.depositPaid ?? matchedContract?.depositPaid ?? 0,
      totalContractAmount: orderData.totalContractAmount ?? matchedContract?.netAmount ?? 0,
      isPartial: orderData.isPartial || false,
      partialDeliveryIndex: orderData.partialDeliveryIndex,
      totalPartialDeliveries: orderData.totalPartialDeliveries,
      timeline: [
        {
          id: generateUniqueId("DL-EV"),
          status: orderData.status || "DRAFT",
          title: `إنشاء إذن تسليم جديد #${newDeliveryNumber}`,
          description: `تم إنشاء الشحنة وربطها بالعقد #${matchedContract?.orderNumber || orderData.contractNumber}`,
          timestamp: "الآن",
          author: "منسق الشحن",
          badge: "إنشاء شحنة",
          badgeColor: "bg-slate-100 text-slate-800",
        },
      ],
      createdAt: new Date().toISOString().split("T")[0],
    };

    setDeliveries((prev) => [newDelivery, ...prev]);

    // Update Customer Timeline
    const targetPhone = newDelivery.customerPhone;
    if (targetPhone) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.phone === targetPhone || c.id === newDelivery.customerId) {
            return {
              ...c,
              timeline: [
                {
                  id: generateUniqueId("EV"),
                  type: "shipping",
                  title: `إصدار إذن شحن وتسليم #${newDeliveryNumber}`,
                  description: `تم إعداد أمر التسليم لعنوان: ${newDelivery.deliveryAddress}`,
                  timestamp: "الآن",
                  author: "منظومة الشحن",
                  badge: "إذن شحن",
                  badgeColor: "bg-blue-50 text-blue-700 font-bold",
                },
                ...c.timeline,
              ],
            };
          }
          return c;
        })
      );
    }

    return newDelivery;
  };

  // 2. Update Delivery Status
  const updateDeliveryStatus = (deliveryId: string, status: DeliveryStatus, notes?: string) => {
    setDeliveries((prev) =>
      prev.map((del) => {
        if (del.id === deliveryId) {
          const statusTitles: Record<DeliveryStatus, string> = {
            DRAFT: "تم تحويل الشحنة لمسودة",
            PREPARING: "جاري تجهيز وتجميع الأصناف بالمخزن 📦",
            READY: "اكتمل التجهيز والشحنة جاهزة للجدولة ✅",
            SCHEDULED: "تم تحديد موعد التسليم 🗓️",
            ASSIGNED: "تم تعيين السائق والسيارة 🚚",
            OUT_FOR_DELIVERY: "خرجت الشحنة في الطريق للعميل 🚀",
            DELIVERED: "تم التسليم بنجاح وإغلاق الإذن 🏁",
            FAILED: "تعذر التسليم وتسجيل الملاحظات ⚠️",
            RESCHEDULED: "تمت إعادة الجدولة لموعد بديل 🔄",
            CANCELLED: "تم إلغاء أمر التسليم ❌",
          };

          const newTimelineEvent: DeliveryTimelineEvent = {
            id: generateUniqueId("DL-EV"),
            status,
            title: statusTitles[status] || `تحديث الحالة إلى ${status}`,
            description: notes || `تحديث تلقائي لحالة الشحنة إلى (${status})`,
            timestamp: new Date().toLocaleString("ar-EG"),
            author: "منسق الشحن والعمليات",
            badge: status,
          };

          return {
            ...del,
            status,
            notes: notes ? `${del.notes ? del.notes + " | " : ""}${notes}` : del.notes,
            timeline: [newTimelineEvent, ...del.timeline],
          };
        }
        return del;
      })
    );
  };

  // 3. Check Delivery Readiness (Verifies Inventory, Address, Customer, Contract)
  const checkDeliveryReadiness = (deliveryId: string) => {
    const del = deliveries.find((d) => d.id === deliveryId);
    if (!del) {
      return {
        isReady: false,
        reasons: ["إذن الشحن غير موجود بالنظام"],
        missingItems: [],
        isAddressValid: false,
        isCustomerValid: false,
        isContractValid: false,
      };
    }

    const reasons: string[] = [];
    const missingItems: { productName: string; required: number; available: number }[] = [];

    // 1. Customer Phone Verification
    const isCustomerValid = Boolean(del.customerPhone && del.customerPhone.trim().length >= 8);
    if (!isCustomerValid) {
      reasons.push("بيانات هاتف العميل غير مكتملة أو غير صالحة");
    }

    // 2. Delivery Address Verification
    const isAddressValid = Boolean(del.deliveryAddress && del.deliveryAddress.trim().length >= 6);
    if (!isAddressValid) {
      reasons.push("عنوان التسليم غير محدد بدقة كافية");
    }

    // 3. Contract Validity
    const matchedContract = orders.find((o) => o.id === del.contractId || o.orderNumber === del.contractNumber);
    const isContractValid = Boolean(matchedContract && matchedContract.status !== "CANCELLED");
    if (!isContractValid) {
      reasons.push("العقد المرتبط غير صالح أو تم إلغاؤه");
    }

    // 4. Products & Stock Availability
    del.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId || p.name.includes(item.productName) || item.productName.includes(p.name));
      const relevantLevels = stockLevels.filter((sl) => sl.productId === (prod?.id || item.productId));
      const totalAvailable = relevantLevels.reduce((sum, sl) => sum + Math.max(0, sl.onHand - sl.display - sl.damaged), 0);

      // If available physical stock is strictly less than required quantity
      if (totalAvailable < item.quantity && item.pickedQty < item.quantity) {
        missingItems.push({
          productName: item.productName,
          required: item.quantity,
          available: totalAvailable,
        });
        reasons.push(`❌ صنف ناقص: ${item.productName} (المطلوب: ${item.quantity} | المتاح بالمستودع: ${totalAvailable})`);
      }
    });

    const isReady = reasons.length === 0 && missingItems.length === 0;

    return {
      isReady,
      reasons,
      missingItems,
      isAddressValid,
      isCustomerValid,
      isContractValid,
    };
  };

  // 4. Update Picking Status (Required / Picked / Missing)
  const updatePickingStatus = (deliveryId: string, productId: string, pickedQty: number) => {
    setDeliveries((prev) =>
      prev.map((del) => {
        if (del.id === deliveryId) {
          const updatedItems = del.items.map((it) =>
            it.productId === productId ? { ...it, pickedQty: Math.min(it.quantity, Math.max(0, pickedQty)) } : it
          );

          const allPicked = updatedItems.every((it) => it.pickedQty >= it.quantity);
          const newStatus = allPicked && del.status === "PREPARING" ? "READY" : del.status;

          const timelineUpdate = allPicked && del.status === "PREPARING"
            ? [
                {
                  id: generateUniqueId("DL-EV"),
                  status: "READY" as DeliveryStatus,
                  title: "تم استكمال تجميع كافة الأصناف (100%)",
                  description: "تم تأكيد فحص التجهيز وأصبحت الشحنة جاهزة للتحميل",
                  timestamp: "الآن",
                  author: "مسؤول المستودع",
                  badge: "جاهز للشحن",
                  badgeColor: "bg-emerald-50 text-emerald-800 font-bold",
                },
                ...del.timeline,
              ]
            : del.timeline;

          return {
            ...del,
            items: updatedItems,
            status: newStatus,
            timeline: timelineUpdate,
          };
        }
        return del;
      })
    );
  };

  // 5. Mark Delivery Ready
  const markDeliveryReady = (deliveryId: string) => {
    const readiness = checkDeliveryReadiness(deliveryId);
    if (!readiness.isReady) {
      return { success: false, error: readiness.reasons.join(" | ") };
    }

    setDeliveries((prev) =>
      prev.map((del) => {
        if (del.id === deliveryId) {
          const fullyPickedItems = del.items.map((it) => ({ ...it, pickedQty: it.quantity }));
          return {
            ...del,
            items: fullyPickedItems,
            status: "READY",
            timeline: [
              {
                id: generateUniqueId("DL-EV"),
                status: "READY",
                title: "اعتماد جاهزية الشحنة للتسليم ✅",
                description: "تم فحص كافة الأصناف والعنوان والمخزون بنجاح تام",
                timestamp: "الآن",
                author: "أمين المستودع",
                badge: "جاهز للتسليم",
                badgeColor: "bg-emerald-100 text-emerald-900 font-bold",
              },
              ...del.timeline,
            ],
          };
        }
        return del;
      })
    );

    return { success: true };
  };

  // 6. Schedule Delivery & Conflict Detection Engine
  const scheduleDelivery = (
    deliveryId: string,
    scheduleData: {
      date: string;
      timeWindow: string;
      driverId?: string;
      vehicleId?: string;
      deliveryTeam?: string;
      notes?: string;
      forceOverride?: boolean;
      overrideReason?: string;
    }
  ) => {
    const del = deliveries.find((d) => d.id === deliveryId);
    if (!del) return { success: false, warning: "الشحنة غير موجودة" };

    const selectedDriver = drivers.find((drv) => drv.id === scheduleData.driverId);
    const selectedVehicle = vehicles.find((v) => v.id === scheduleData.vehicleId);

    // Conflict Check 1: Driver busy in same slot
    let conflictWarning: string | null = null;
    if (scheduleData.driverId) {
      const driverConflict = deliveries.find(
        (d) =>
          d.id !== deliveryId &&
          d.driverId === scheduleData.driverId &&
          d.scheduledDate === scheduleData.date &&
          d.timeWindow === scheduleData.timeWindow &&
          d.status !== "DELIVERED" &&
          d.status !== "CANCELLED" &&
          d.status !== "FAILED"
      );

      if (driverConflict) {
        conflictWarning = `⚠️ السائق ${selectedDriver?.name || "المحدد"} مسند إليه شحنة أخرى (#${driverConflict.deliveryNumber}) في نفس الفترة الزمنية (${scheduleData.timeWindow}).`;
      }
    }

    // Conflict Check 2: Vehicle assigned in same slot
    if (!conflictWarning && scheduleData.vehicleId) {
      const vehicleConflict = deliveries.find(
        (d) =>
          d.id !== deliveryId &&
          d.vehicleId === scheduleData.vehicleId &&
          d.scheduledDate === scheduleData.date &&
          d.timeWindow === scheduleData.timeWindow &&
          d.status !== "DELIVERED" &&
          d.status !== "CANCELLED" &&
          d.status !== "FAILED"
      );

      if (vehicleConflict) {
        conflictWarning = `⚠️ السيارة ${selectedVehicle?.plateNumber || "المحددة"} مشغولة في شحنة أخرى (#${vehicleConflict.deliveryNumber}) في نفس الوقت.`;
      }
    }

    // Capacity Check
    if (!conflictWarning && selectedVehicle) {
      const totalItemCount = del.items.reduce((s, it) => s + it.quantity, 0);
      if (totalItemCount > selectedVehicle.maxItemsCapacity) {
        conflictWarning = `⚠️ سعة السيارة (${selectedVehicle.maxItemsCapacity} قطع) قد لا تتسع لحجم هذه الشحنة (${totalItemCount} قطع).`;
      }
    }

    if (conflictWarning && !scheduleData.forceOverride) {
      return { success: false, warning: conflictWarning };
    }

    // Apply Scheduling
    const newStatus: DeliveryStatus = scheduleData.driverId ? "ASSIGNED" : "SCHEDULED";

    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === deliveryId) {
          const overrideNote = scheduleData.forceOverride
            ? ` | تم التجاوز الإداري للتعارض: ${scheduleData.overrideReason || "موافقة المدير"}`
            : "";

          return {
            ...d,
            scheduledDate: scheduleData.date,
            timeWindow: scheduleData.timeWindow,
            driverId: scheduleData.driverId || d.driverId,
            driverName: selectedDriver?.name || d.driverName,
            driverPhone: selectedDriver?.phone || d.driverPhone,
            vehicleId: scheduleData.vehicleId || d.vehicleId,
            vehiclePlate: selectedVehicle?.plateNumber || d.vehiclePlate,
            vehicleType: selectedVehicle?.model || d.vehicleType,
            deliveryTeam: scheduleData.deliveryTeam || d.deliveryTeam || (selectedDriver ? `${selectedDriver.name} + فني تركيب` : undefined),
            status: newStatus,
            overrideConflictReason: scheduleData.forceOverride ? scheduleData.overrideReason : undefined,
            notes: scheduleData.notes ? `${d.notes ? d.notes + " | " : ""}${scheduleData.notes}${overrideNote}` : d.notes,
            timeline: [
              {
                id: generateUniqueId("DL-EV"),
                status: newStatus,
                title: `جدولة التسليم: ${scheduleData.date} (${scheduleData.timeWindow})`,
                description: selectedDriver
                  ? `تم تعيين السائق ${selectedDriver.name} والمركبة (${selectedVehicle?.plateNumber || "محددة"})${overrideNote}`
                  : `تم حجز النافذة الزمنية بانتظار تعيين السائق`,
                timestamp: "الآن",
                author: "منسق الشحن واللوجستيات",
                badge: "تمت الجدولة",
                badgeColor: "bg-blue-50 text-blue-700 font-bold",
              },
              ...d.timeline,
            ],
          };
        }
        return d;
      })
    );

    // Update Driver & Vehicle Active Counters
    if (selectedDriver) {
      setDrivers((prev) =>
        prev.map((drv) =>
          drv.id === selectedDriver.id
            ? { ...drv, assignedDeliveriesCount: drv.assignedDeliveriesCount + 1 }
            : drv
        )
      );
    }

    if (selectedVehicle) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === selectedVehicle.id ? { ...v, status: "ASSIGNED", currentDriverName: selectedDriver?.name } : v
        )
      );
    }

    return { success: true };
  };

  // 7. Assign Driver & Vehicle Shortcut
  const assignDriverAndVehicle = (
    deliveryId: string,
    driverId: string,
    vehicleId: string,
    forceOverride = false,
    overrideReason = ""
  ) => {
    const del = deliveries.find((d) => d.id === deliveryId);
    if (!del) return { success: false, warning: "الشحنة غير موجودة" };

    return scheduleDelivery(deliveryId, {
      date: del.scheduledDate || new Date().toISOString().split("T")[0],
      timeWindow: del.timeWindow || "12:00 - 14:00",
      driverId,
      vehicleId,
      forceOverride,
      overrideReason,
    });
  };

  // 8. Dispatch Delivery (Out for Delivery - Integrates with Inventory inTransit)
  const dispatchDelivery = (deliveryId: string) => {
    const del = deliveries.find((d) => d.id === deliveryId);
    if (!del) return;

    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === deliveryId) {
          return {
            ...d,
            status: "OUT_FOR_DELIVERY",
            timeline: [
              {
                id: generateUniqueId("DL-EV"),
                status: "OUT_FOR_DELIVERY",
                title: "خرجت الشحنة مع السائق للتسليم 🚚",
                description: `السيارة (${d.vehiclePlate || "الأسطول"}) في طريقها للعميل. المبلغ المطلوب تحصيله: ${d.codAmount.toLocaleString()} ج.م`,
                timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
                author: d.driverName || "منسق الشحن",
                badge: "في الطريق",
                badgeColor: "bg-amber-50 text-amber-800 font-bold",
              },
              ...d.timeline,
            ],
          };
        }
        return d;
      })
    );

    // Update Driver & Vehicle to ON_DELIVERY
    if (del.driverId) {
      setDrivers((prev) =>
        prev.map((drv) => (drv.id === del.driverId ? { ...drv, status: "ON_DELIVERY", isAvailable: false } : drv))
      );
    }
    if (del.vehicleId) {
      setVehicles((prev) =>
        prev.map((v) => (v.id === del.vehicleId ? { ...v, status: "ON_DELIVERY" } : v))
      );
    }

    // Update Contract Order Status to SHIPPED
    setOrders((prev) =>
      prev.map((ord) => (ord.id === del.contractId || ord.orderNumber === del.contractNumber ? { ...ord, status: "SHIPPED" } : ord))
    );

    // Update Customer 360 Timeline
    if (del.customerPhone) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.phone === del.customerPhone || c.id === del.customerId) {
            return {
              ...c,
              stage: "SHIPPED",
              timeline: [
                {
                  id: generateUniqueId("EV"),
                  type: "shipping",
                  title: `شحنتك في الطريق إليك 🚚 (#${del.deliveryNumber})`,
                  description: `السائق ${del.driverName || "المسؤول"} في الطريق لعنوانك. المبلغ المتبقي عند الاستلام: ${del.codAmount.toLocaleString()} ج`,
                  timestamp: "الآن",
                  author: del.driverName || "فريق الشحن",
                  badge: "جاري التوصيل",
                  badgeColor: "bg-blue-50 text-blue-700 font-bold",
                },
                ...c.timeline,
              ],
            };
          }
          return c;
        })
      );
    }

    // Inventory Audit: Move stock to inTransit
    del.items.forEach((item) => {
      const mov: StockMovement = {
        id: generateUniqueId("MOV"),
        productId: item.productId,
        productName: item.productName,
        movementType: "TRANSFER_OUT",
        quantity: item.quantity,
        fromLocation: del.warehouse,
        toLocation: `شحنة عميل في الطريق (${del.customerName})`,
        reference: del.deliveryNumber,
        user: del.driverName || "سائق الشحن",
        date: new Date().toLocaleString("ar-EG"),
        notes: `خروج بضاعة للتسليم بالعقد #${del.contractNumber}`,
      };
      setStockMovements((prev) => [mov, ...prev]);
    });
  };

  // 9. Complete Delivery (Proof of Delivery POD + Inventory Deduction + Finance Settlement)
  const completeDelivery = (deliveryId: string, pod: ProofOfDelivery) => {
    const del = deliveries.find((d) => d.id === deliveryId);
    if (!del) return;

    const deliveredAtStr = pod.deliveredAt || new Date().toLocaleString("ar-EG");

    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === deliveryId) {
          return {
            ...d,
            status: "DELIVERED",
            deliveredAt: deliveredAtStr,
            proofOfDelivery: pod,
            timeline: [
              {
                id: generateUniqueId("DL-EV"),
                status: "DELIVERED",
                title: "تم التسليم بنجاح وإثبات الوصول (POD) ✅",
                description: `المستلم: ${pod.receivedBy} (${pod.receiverRelation}) | تم تحصيل ${pod.codCollected.toLocaleString()} ج.م ${pod.hasSignature ? "مع توقيع رسمي" : ""}`,
                timestamp: deliveredAtStr,
                author: d.driverName || "السائق",
                badge: "تم التسليم",
                badgeColor: "bg-emerald-100 text-emerald-900 font-bold",
              },
              ...d.timeline,
            ],
          };
        }
        return d;
      })
    );

    // Deduct stock physically from warehouse stock levels
    del.items.forEach((item) => {
      setStockLevels((prev) =>
        prev.map((sl) => {
          if (sl.productId === item.productId && sl.warehouseName === del.warehouse) {
            return {
              ...sl,
              onHand: Math.max(0, sl.onHand - item.quantity),
              reserved: Math.max(0, sl.reserved - item.quantity),
            };
          }
          return sl;
        })
      );

      // Audit Sale Issue Movement
      const mov: StockMovement = {
        id: generateUniqueId("MOV"),
        productId: item.productId,
        productName: item.productName,
        movementType: "SALE_ISSUE",
        quantity: item.quantity,
        fromLocation: del.warehouse,
        toLocation: `تم التسليم للعميل: ${del.customerName}`,
        reference: del.contractNumber,
        user: del.driverName || "السائق",
        date: deliveredAtStr,
        notes: `خصم نهائي من المستودع بعد إثبات التسليم للعميل (${pod.receivedBy})`,
      };
      setStockMovements((prev) => [mov, ...prev]);
    });

    // Settle Contract Order & Collect remaining payment
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === del.contractId || ord.orderNumber === del.contractNumber) {
          const updatedDeposit = ord.depositPaid + pod.codCollected;
          return {
            ...ord,
            depositPaid: updatedDeposit,
            remainingDue: 0,
            status: "DELIVERED_PAID",
          };
        }
        return ord;
      })
    );

    // Free up Driver & Vehicle
    if (del.driverId) {
      setDrivers((prev) =>
        prev.map((drv) =>
          drv.id === del.driverId
            ? {
                ...drv,
                status: "AVAILABLE",
                isAvailable: true,
                assignedDeliveriesCount: Math.max(0, drv.assignedDeliveriesCount - 1),
              }
            : drv
        )
      );
    }
    if (del.vehicleId) {
      setVehicles((prev) =>
        prev.map((v) => (v.id === del.vehicleId ? { ...v, status: "AVAILABLE" } : v))
      );
    }

    // Update Customer 360 Record
    if (del.customerPhone) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.phone === del.customerPhone || c.id === del.customerId) {
            return {
              ...c,
              stage: "DELIVERED",
              timeline: [
                {
                  id: generateUniqueId("EV"),
                  type: "delivery",
                  title: `اكتمل التسليم وسداد الحساب بالكامل ✅`,
                  description: `استلم: ${pod.receivedBy} | تم توريد ${pod.codCollected.toLocaleString()} ج كاش عبر السائق ${del.driverName}`,
                  timestamp: "الآن",
                  author: del.driverName || "السائق",
                  badge: "تسليم مكتمل",
                  badgeColor: "bg-emerald-50 text-emerald-800 font-bold",
                },
                ...c.timeline,
              ],
            };
          }
          return c;
        })
      );
    }
  };

  // 10. Failed Delivery & Next Step Handling
  const failDelivery = (
    deliveryId: string,
    reason: DeliveryOrder["failureReason"],
    action: "RESCHEDULE" | "RETURN_WAREHOUSE",
    notes: string
  ) => {
    const del = deliveries.find((d) => d.id === deliveryId);
    if (!del) return;

    const reasonLabels: Record<string, string> = {
      CUSTOMER_UNAVAILABLE: "العميل غير متواجد / مغلق الهاتف",
      WRONG_ADDRESS: "العنوان غير صحيح أو تعذر الوصول",
      PRODUCT_ISSUE: "ملاحظة أو عيب بالمنتج يرفضه العميل",
      VEHICLE_ISSUE: "عطل مفاجئ بسيارة التوصيل",
      CUSTOMER_RESCHEDULE_REQUEST: "طلب العميل تأجيل الاستلام لوقت لاحق",
      OTHER: "أسباب تشغيلية أخرى",
    };

    const actionText = action === "RESCHEDULE" ? "إعادة الجدولة لموعد لاحق" : "إرجاع البضاعة للمستودع";

    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === deliveryId) {
          const nextStatus: DeliveryStatus = action === "RESCHEDULE" ? "RESCHEDULED" : "FAILED";
          return {
            ...d,
            status: nextStatus,
            failureReason: reason,
            failureAction: action,
            failureNotes: notes,
            timeline: [
              {
                id: generateUniqueId("DL-EV"),
                status: nextStatus,
                title: `تعذر التسليم: ${reason ? reasonLabels[reason] : "سبب غير محدد"} ⚠️`,
                description: `الإجراء المطلوب: ${actionText} | ملاحظات: ${notes}`,
                timestamp: new Date().toLocaleString("ar-EG"),
                author: d.driverName || "السائق",
                badge: "تعذر التسليم",
                badgeColor: "bg-rose-50 text-rose-800 font-bold",
              },
              ...d.timeline,
            ],
          };
        }
        return d;
      })
    );

    // Free up Driver & Vehicle
    if (del.driverId) {
      setDrivers((prev) =>
        prev.map((drv) =>
          drv.id === del.driverId ? { ...drv, status: "AVAILABLE", isAvailable: true } : drv
        )
      );
    }
    if (del.vehicleId) {
      setVehicles((prev) =>
        prev.map((v) => (v.id === del.vehicleId ? { ...v, status: "AVAILABLE" } : v))
      );
    }
  };

  // 11. Partial Delivery Support (Split contract items into multiple deliveries)
  const createPartialDelivery = (
    contractId: string,
    selectedItems: { productId: string; quantity: number }[],
    notes?: string
  ) => {
    const matchedContract = orders.find((o) => o.id === contractId || o.orderNumber === contractId);
    if (!matchedContract) throw new Error("Contract not found");

    const partialItems: DeliveryItem[] = selectedItems.map((sel) => {
      const origItem = matchedContract.items.find((i) => i.productId === sel.productId);
      return {
        productId: sel.productId,
        productName: origItem?.productName || "صنف",
        fabricColor: origItem?.fabricColor,
        quantity: sel.quantity,
        pickedQty: 0,
        unitPrice: origItem?.unitPrice || 0,
        isFromFloor: origItem?.isFromFloor || false,
      };
    });

    const newDel = createDeliveryOrder({
      contractId: matchedContract.id,
      contractNumber: matchedContract.orderNumber,
      customerName: matchedContract.customerName,
      customerPhone: matchedContract.customerPhone,
      deliveryAddress: matchedContract.deliveryAddress,
      city: matchedContract.customerCity,
      branch: matchedContract.branch,
      items: partialItems,
      isPartial: true,
      partialDeliveryIndex: 1,
      totalPartialDeliveries: 2,
      notes: notes || `تسليم جزئي للدفعة الأولى (${partialItems.length} من أصل ${matchedContract.items.length} أصناف)`,
    });

    return newDel;
  };

  // 12. Delivery Issues Management
  const addDeliveryIssue = (data: Omit<DeliveryIssue, "id" | "reportedAt" | "status">) => {
    const newIssue: DeliveryIssue = {
      ...data,
      id: generateUniqueId("ISS"),
      status: "OPEN",
      reportedAt: new Date().toLocaleString("ar-EG"),
    };
    setDeliveryIssues((prev) => [newIssue, ...prev]);

    // Append to Delivery Timeline
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === data.deliveryId || d.deliveryNumber === data.deliveryNumber) {
          return {
            ...d,
            timeline: [
              {
                id: generateUniqueId("DL-EV"),
                status: "ISSUE",
                title: `تسجيل بلاغ مشكلة تسليم (${data.type})`,
                description: data.description,
                timestamp: "الآن",
                author: data.reportedBy,
                badge: "مشكلة تسليم ⚠️",
                badgeColor: "bg-rose-50 text-rose-700",
              },
              ...d.timeline,
            ],
          };
        }
        return d;
      })
    );

    return newIssue;
  };

  const resolveDeliveryIssue = (issueId: string, resolutionNotes: string) => {
    setDeliveryIssues((prev) =>
      prev.map((iss) =>
        iss.id === issueId
          ? {
              ...iss,
              status: "RESOLVED",
              resolutionNotes,
              resolvedAt: new Date().toLocaleString("ar-EG"),
            }
          : iss
      )
    );
  };

  // 13. Delivery Returns & Warehouse Reintegration
  const addDeliveryReturn = (data: Omit<DeliveryReturn, "id" | "requestedAt" | "status">) => {
    const newReturn: DeliveryReturn = {
      ...data,
      id: generateUniqueId("RET"),
      status: "PENDING_INSPECTION",
      requestedAt: new Date().toLocaleString("ar-EG"),
    };
    setDeliveryReturns((prev) => [newReturn, ...prev]);
    return newReturn;
  };

  const processDeliveryReturn = (
    returnId: string,
    inventoryAction: "AVAILABLE" | "DAMAGED" | "WORKSHOP",
    processedBy: string,
    notes?: string
  ) => {
    const ret = deliveryReturns.find((r) => r.id === returnId);
    if (!ret) return;

    setDeliveryReturns((prev) =>
      prev.map((r) =>
        r.id === returnId
          ? {
              ...r,
              inventoryAction,
              status: inventoryAction === "AVAILABLE" ? "ACCEPTED_RESTOCKED" : "ACCEPTED_DAMAGED",
              inspectedAt: new Date().toLocaleString("ar-EG"),
              processedBy,
              notes: notes || r.notes,
            }
          : r
      )
    );

    // Reintegrate to stock
    setStockLevels((prev) =>
      prev.map((sl) => {
        if (sl.productId === ret.productId && sl.warehouseName === ret.returnedToWarehouse) {
          if (inventoryAction === "AVAILABLE") {
            return { ...sl, onHand: sl.onHand + ret.quantity };
          } else {
            return { ...sl, damaged: sl.damaged + ret.quantity, onHand: sl.onHand + ret.quantity };
          }
        }
        return sl;
      })
    );

    // Audit Movement
    const mov: StockMovement = {
      id: generateUniqueId("MOV"),
      productId: ret.productId,
      productName: ret.productName,
      movementType: "RETURN",
      quantity: ret.quantity,
      fromLocation: `مرتجع من العميل: ${ret.customerName}`,
      toLocation: ret.returnedToWarehouse,
      reference: ret.deliveryNumber,
      user: processedBy,
      date: new Date().toLocaleString("ar-EG"),
      notes: `استلام مرتجع بعد التسليم (${inventoryAction}): ${notes || ret.reason}`,
    };
    setStockMovements((prev) => [mov, ...prev]);
  };

  // 14. Fleet Add / Edit
  const addDriver = (driverData: Omit<Driver, "id" | "assignedDeliveriesCount">) => {
    const newDriver: Driver = {
      ...driverData,
      id: generateUniqueId("DRV"),
      assignedDeliveriesCount: 0,
    };
    setDrivers((prev) => [newDriver, ...prev]);
    return newDriver;
  };

  const updateDriver = (driverId: string, data: Partial<Driver>) => {
    setDrivers((prev) => prev.map((d) => (d.id === driverId ? { ...d, ...data } : d)));
  };

  const addVehicle = (vehicleData: Omit<Vehicle, "id">) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: generateUniqueId("VEH"),
    };
    setVehicles((prev) => [newVehicle, ...prev]);
    return newVehicle;
  };

  const updateVehicle = (vehicleId: string, data: Partial<Vehicle>) => {
    setVehicles((prev) => prev.map((v) => (v.id === vehicleId ? { ...v, ...data } : v)));
  };

  // 15. Logistics Insights
  const dismissLogisticsInsight = (insightId: string) => {
    setLogisticsInsights((prev) => prev.filter((i) => i.id !== insightId));
  };

  const applyLogisticsInsight = (insightId: string) => {
    const ins = logisticsInsights.find((i) => i.id === insightId);
    if (!ins) return;

    if (ins.actionType === "GROUP_ROUTE" && ins.affectedDeliveryIds && ins.affectedDeliveryIds.length > 0) {
      // Group route: assign driver DRV-02 and same vehicle
      ins.affectedDeliveryIds.forEach((delId) => {
        scheduleDelivery(delId, {
          date: ins.targetDate || "2026-09-24",
          timeWindow: "12:00 - 14:00",
          driverId: "DRV-02",
          vehicleId: "VEH-02",
          deliveryTeam: "أشرف عادل + م/ حمادة (نجار)",
          notes: "تم دمج الرحلة جغرافياً في خط سير الشيخ زايد",
          forceOverride: true,
          overrideReason: "تجميع خط سير ذكي موصى به من الذكاء الاصطناعي",
        });
      });
    }

    setLogisticsInsights((prev) =>
      prev.map((i) => (i.id === insightId ? { ...i, resolved: true } : i))
    );
  };

  return (
    <ShowroomContext.Provider
      value={{
        products,
        customers,
        leads: customers,
        orders,
        visits,

        warehouses,
        stockLevels,
        stockMovements,
        stockReservations,
        transferOrders,
        receivingOrders,
        stockCounts,
        smartInsights,

        // Logistics State
        deliveries,
        drivers,
        vehicles,
        deliveryIssues,
        deliveryReturns,
        logisticsInsights,

        addCustomer,
        updateCustomer,
        updateCustomerJourney,
        addTimelineEvent,
        setCustomerNextAction,
        completeNextAction,

        createOrder,
        collectPayment,

        addVisit,
        updateVisitStatus,
        checkInVisit,
        startInspection,
        endVisit,

        createTransferOrder,
        approveTransferOrder,
        shipTransferOrder,
        receiveTransferOrder,
        cancelTransferOrder,

        createReceivingOrder,
        confirmReceivingOrder,

        createStockCount,
        approveStockCountAdjustment,

        addProduct,
        updateProduct,
        adjustStock,
        applyTransferSuggestion,
        dismissInsight,

        // Logistics Actions
        createDeliveryOrder,
        updateDeliveryStatus,
        checkDeliveryReadiness,
        updatePickingStatus,
        markDeliveryReady,
        scheduleDelivery,
        assignDriverAndVehicle,
        dispatchDelivery,
        completeDelivery,
        failDelivery,
        createPartialDelivery,
        addDeliveryIssue,
        resolveDeliveryIssue,
        addDeliveryReturn,
        processDeliveryReturn,
        addDriver,
        updateDriver,
        addVehicle,
        updateVehicle,
        dismissLogisticsInsight,
        applyLogisticsInsight,
      }}
    >
      {children}
    </ShowroomContext.Provider>
  );
}

export function useShowroom() {
  const context = useContext(ShowroomContext);
  if (!context) {
    throw new Error("useShowroom must be used within a ShowroomProvider");
  }
  return context;
}
