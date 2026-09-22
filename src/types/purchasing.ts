// Rewaq ERP - Purchasing & Suppliers Domain Types (Egyptian Furniture Retail Standard)

export type PurchaseOrderStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "SENT"
  | "PARTIAL_RECEIVED"
  | "FULLY_RECEIVED"
  | "CLOSED"
  | "CANCELLED";

export type PurchaseRequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "CONVERTED_TO_PO"
  | "REJECTED"
  | "CANCELLED";

export type SupplierStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export type SupplierCategory =
  | "NATURAL_WOOD"       // مصانع وموردي الأخشاب الطبيعية (زان، آرو، موسكي)
  | "FABRICS_UPHOLSTERY" // أقمشة التنجيد والمفروشات والكتان
  | "FOAM_SPONGE"        // الإسفنج عالي الكثافة والتبطين
  | "HARDWARE_HANDLES"   // الإكسسوارات والمقابض والمفصلات
  | "GLASS_METALS"       // المسطحات الزجاجية والرخام والمعادن
  | "LIGHTING_ELECTRIC"  // وحدات الإضاءة والليد والأباجورات
  | "SHOWROOM_SUPPLIES"  // مستلزمات المعارض والتغليف والتشوين
  | "IMPORTED_FINISHED"; // أثاث تام الصنع مستورد ومحلي

export type PaymentTermsType = "CASH" | "NET_15" | "NET_30" | "NET_45" | "NET_60" | "CUSTOM";

export interface SupplierContact {
  name: string;
  role: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

export interface SupplierDocument {
  id: string;
  title: string;
  fileType: string;
  uploadedAt: string;
  fileUrl?: string;
}

export interface SupplierPerformance {
  onTimeDeliveryRate: number;      // e.g. 94%
  quantityFulfillmentRate: number; // e.g. 98%
  averageLeadTimeDays: number;     // e.g. 12 days
  qualityDefectRate: number;       // e.g. 1.8%
  totalOrdersFulfilled: number;
  priceStabilityScore: "HIGH" | "MEDIUM" | "VOLATILE";
}

export interface SupplierProduct {
  id: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  category: string;
  supplierSku: string;
  purchasePrice: number;
  lastPrice: number;
  priceChangeDate?: string;
  minOrderQuantity: number;
  leadTimeDays: number;
  lastPurchaseDate?: string;
  isPreferred: boolean;
  notes?: string;
}

export interface Supplier {
  id: string;
  code: string;               // e.g. "SUP-010"
  nameAr: string;
  nameEn?: string;
  commercialRegistration?: string; // السجل التجاري
  taxId: string;              // البطاقة الضريبية (9 أرقام)
  category: SupplierCategory;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  status: SupplierStatus;
  paymentTerms: PaymentTermsType;
  paymentTermsDays: number;
  currency: "EGP" | "USD" | "EUR";
  accountCode: string;        // e.g. "2010"
  totalPurchases: number;
  totalPaid: number;
  balance: number;            // Current Accounts Payable (رصيد مستحق له)
  creditLimit: number;
  rating: number;             // 1-5
  notes?: string;
  performance: SupplierPerformance;
  contacts: SupplierContact[];
  documents: SupplierDocument[];
  createdAt: string;
}

export interface PurchaseRequestItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  estimatedUnitPrice: number;
  estimatedTotal: number;
  preferredSupplierId?: string;
  preferredSupplierName?: string;
  notes?: string;
}

export interface PurchaseRequest {
  id: string;
  requestNumber: string;       // e.g. "PR-2026-0042"
  branchId: string;
  branchName: string;
  requestedBy: string;
  department: "SHOWROOM" | "WAREHOUSE" | "SALES" | "PROCUREMENT" | "PRODUCTION";
  urgency: "NORMAL" | "HIGH" | "URGENT";
  reason: "LOW_STOCK" | "CONTRACT_DEMAND" | "CUSTOMER_SPECIAL_ORDER" | "SEASONAL_REPAIR" | "OTHER";
  reasonDetails?: string;
  items: PurchaseRequestItem[];
  totalEstimatedAmount: number;
  status: PurchaseRequestStatus;
  requestedAt: string;
  requiredDate: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  convertedPoNumber?: string;
  convertedPoId?: string;
  notes?: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  supplierSku: string;
  unit: string;
  quantity: number;
  receivedQuantity: number;
  remainingQuantity: number;
  damagedQuantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;             // e.g. 0.14 for Egyptian VAT
  taxAmount: number;
  total: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;            // e.g. "PO-2026-1045"
  supplierId: string;
  supplierName: string;
  supplierTaxId: string;
  branchId: string;
  branchName: string;
  warehouseId: string;
  warehouseName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  paymentTerms: PaymentTermsType;
  paymentTermsDays: number;
  currency: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  totalDiscount: number;
  taxRate: number;             // Standard 0.14 (14% VAT)
  totalTax: number;
  grandTotal: number;
  notes: string;
  status: PurchaseOrderStatus;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  sentAt?: string;
  closedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  purchaseRequestId?: string;
  purchaseRequestNumber?: string;
  // Matching & Receiving tracking
  receivingIds: string[];
  invoiceIds: string[];
  matchingStatus: ThreeWayMatchStatus | "NOT_MATCHED" | "PARTIALLY_MATCHED" | "DISCREPANCY";
  matchingNotes?: string;
}

export interface ReceivingItemQuality {
  productId: string;
  productName: string;
  orderedQty: number;
  expectedQty: number;
  receivedQty: number;
  goodQty: number;
  damagedQty: number;
  defectReason?: string;
  actionOnDamaged?: "RETURN_TO_SUPPLIER" | "ACCEPT_WITH_DISCOUNT" | "HOLD_FOR_INSPECTION" | "SUPPLIER_REPLACE";
  warehouseLocationCode: string;
}

export interface PurchaseReceiving {
  id: string;
  receivingNumber: string;     // e.g. "RCV-2026-089"
  poId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  destinationBranch: string;
  destinationWarehouse: string;
  destinationWarehouseId: string;
  date: string;
  receiverName: string;
  deliveryNoteNumber?: string; // رقم إذن تسليم المورد
  driverName?: string;
  driverPhone?: string;
  items: ReceivingItemQuality[];
  totalOrderedQty: number;
  totalReceivedQty: number;
  totalGoodQty: number;
  totalDamagedQty: number;
  status: "DRAFT" | "RECEIVED_FULL" | "RECEIVED_PARTIAL" | "WITH_DISCREPANCY";
  notes?: string;
  inventoryStockMovementIds: string[];
  createdAt: string;
}

export type ThreeWayMatchStatus =
  | "MATCHED"
  | "PRICE_MISMATCH"
  | "QUANTITY_MISMATCH"
  | "BOTH_MISMATCH"
  | "PENDING_REVIEW";

export interface SupplierInvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  total: number;
}

export interface SupplierInvoice {
  id: string;
  invoiceNumber: string;        // e.g. "PINV-2026-512"
  supplierInvoiceRef: string;   // رقم فاتورة المورد الضريبية الأصلية
  supplierId: string;
  supplierName: string;
  supplierTaxId: string;
  poId: string;
  poNumber: string;
  receivingId?: string;
  receivingNumber?: string;
  invoiceDate: string;
  dueDate: string;
  items: SupplierInvoiceItem[];
  subtotal: number;
  taxAmount: number;            // 14% VAT
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
  paymentTerms: PaymentTermsType;
  matchStatus: ThreeWayMatchStatus;
  matchDiscrepancyNotes?: string;
  journalEntryId?: string;
  attachmentUrl?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface PurchaseReturnItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  total: number;
  defectReason: string;
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string;         // e.g. "PRET-2026-015"
  supplierId: string;
  supplierName: string;
  poId: string;
  poNumber: string;
  receivingId?: string;
  receivingNumber?: string;
  items: PurchaseReturnItem[];
  totalQuantity: number;
  subtotal: number;
  taxAmount: number;
  totalRefundAmount: number;
  date: string;
  reason: "DEFECTIVE_DAMAGED" | "WRONG_SPECIFICATION" | "EXCESS_DELIVERY" | "PRICE_DISPUTE" | "LATE_DELIVERY";
  status: "DRAFT" | "SENT_TO_SUPPLIER" | "CREDITED_SETTLED" | "REJECTED";
  inventoryDeducted: boolean;
  journalEntryId?: string;
  debitNoteNumber?: string;
  createdBy: string;
  createdAt: string;
  notes?: string;
}

export interface SmartPurchaseSuggestion {
  id: string;
  productId: string;
  productName: string;
  category: string;
  currentAvailableStock: number;
  reservedStockForContracts: number;
  openPoQuantity: number;
  averageMonthlySales: number;
  salesVelocityScore: "HIGH" | "MEDIUM" | "LOW";
  leadTimeDays: number;
  reorderPoint: number;
  suggestedOrderQty: number;
  urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  primaryReason: string;
  whyExplanation: string;
  recommendedSupplierId: string;
  recommendedSupplierName: string;
  recommendedSupplierPrice: number;
  estimatedTotalCost: number;
  alternativeSuppliers: {
    supplierId: string;
    supplierName: string;
    price: number;
    leadTimeDays: number;
    rating: number;
  }[];
  isContractDriven: boolean;
  associatedContracts?: string[];
}

export interface PurchaseAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: "CREATE" | "UPDATE" | "APPROVE" | "REJECT" | "SEND" | "RECEIVE" | "INVOICE" | "RETURN" | "CANCEL";
  entityType: "PURCHASE_ORDER" | "PURCHASE_REQUEST" | "RECEIVING" | "INVOICE" | "SUPPLIER" | "RETURN";
  entityId: string;
  entityReference: string;
  description: string;
  previousValue?: any;
  newValue?: any;
  reason?: string;
}

export interface ApprovalRuleConfig {
  id: string;
  branchId: string;             // "ALL" or specific branch
  branchName: string;
  role: "PURCHASE_OFFICER" | "PURCHASING_MANAGER" | "BRANCH_MANAGER" | "GENERAL_MANAGER" | "ADMIN";
  maxApprovalLimit: number;     // e.g. 50,000 EGP
  requiresHigherApprovalAbove: number;
  isActive: boolean;
}

export interface PurchasingSettings {
  defaultVatRate: number;       // 0.14
  autoSuggestOnReorderPoint: boolean;
  safetyStockBufferDays: number;
  priceDiscrepancyTolerancePercent: number; // e.g. 2%
  qtyDiscrepancyTolerancePercent: number;   // e.g. 0%
  approvalRules: ApprovalRuleConfig[];
  defaultWarehouseId: string;
  defaultBranchId: string;
}

export interface PurchasingSummaryMetrics {
  totalPurchasesThisMonth: number;
  totalOrdersThisMonth: number;
  pendingApprovalCount: number;
  pendingApprovalValue: number;
  orderedInTransitCount: number;
  overdueOrdersCount: number;
  partiallyReceivedCount: number;
  outstandingPayables: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  reservedItemsUnderShortage: number;
  activeSuppliersCount: number;
}
