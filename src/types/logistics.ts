export type DeliveryStatus =
  | "DRAFT"
  | "PREPARING"
  | "READY"
  | "SCHEDULED"
  | "ASSIGNED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED"
  | "RESCHEDULED"
  | "CANCELLED";

export type TimeWindow =
  | "10:00 - 12:00"
  | "12:00 - 14:00"
  | "14:00 - 16:00"
  | "16:00 - 18:00"
  | "18:00 - 20:00";

export interface DeliveryItem {
  productId: string;
  productName: string;
  sku?: string;
  fabricColor?: string;
  quantity: number;
  pickedQty: number;
  unitPrice: number;
  isFromFloor: boolean;
  notes?: string;
}

export interface DeliveryTimelineEvent {
  id: string;
  status: DeliveryStatus | "NOTE" | "ISSUE" | "ASSIGNED" | "RESCHEDULED";
  title: string;
  description: string;
  timestamp: string;
  author: string;
  badge?: string;
  badgeColor?: string;
}

export interface ProofOfDelivery {
  deliveredAt: string;
  receivedBy: string;
  receiverPhone?: string;
  receiverRelation: string; // e.g. "العميل نفسه", "الزوجة", "حارس العقار", "مهندس الموقع"
  notes?: string;
  codCollected: number;
  hasSignature: boolean;
  signatureName?: string;
  photoUrl?: string;
}

export interface DeliveryOrder {
  id: string;
  deliveryNumber: string; // e.g. DL-1042
  contractId: string;
  contractNumber: string; // e.g. ORD-2026-089
  customerId?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  zone?: string; // e.g. "التجمع الخامس", "الشيخ زايد", "طنطا", "مدينة نصر"
  branch: string;
  warehouse: string;
  items: DeliveryItem[];
  scheduledDate: string; // YYYY-MM-DD
  timeWindow: TimeWindow | string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleId?: string;
  vehiclePlate?: string;
  vehicleType?: string;
  deliveryTeam?: string; // e.g. "فريق نقل 1 + فني تركيب نجف"
  status: DeliveryStatus;
  notes?: string;
  specialInstructions?: string;
  needsAssembly: boolean;
  codAmount: number; // المبلغ المطلوب تحصيله عند الباب
  depositPaid: number;
  totalContractAmount: number;
  isPartial: boolean;
  partialDeliveryIndex?: number; // 1 of 2
  totalPartialDeliveries?: number;
  timeline: DeliveryTimelineEvent[];
  proofOfDelivery?: ProofOfDelivery;
  failureReason?:
    | "CUSTOMER_UNAVAILABLE"
    | "WRONG_ADDRESS"
    | "PRODUCT_ISSUE"
    | "VEHICLE_ISSUE"
    | "CUSTOMER_RESCHEDULE_REQUEST"
    | "OTHER";
  failureAction?: "RESCHEDULE" | "RETURN_WAREHOUSE";
  failureNotes?: string;
  overrideConflictReason?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  status: "AVAILABLE" | "ON_DELIVERY" | "OFF_DUTY";
  assignedDeliveriesCount: number;
  rating: number;
  licenseNumber: string;
  vehicleAssigned?: string;
  branch: string;
  isAvailable: boolean;
}

export interface Vehicle {
  id: string;
  plateNumber: string; // e.g. "أ ر 542"
  model: string; // e.g. "شيفروليه جامبو 7000"
  type: "TRUCK_HEAVY" | "JUMBO" | "HALF_TRUCK" | "VAN";
  capacityCbm: number; // cubic meters
  maxItemsCapacity: number; // capacity units
  status: "AVAILABLE" | "ASSIGNED" | "ON_DELIVERY" | "MAINTENANCE" | "INACTIVE";
  currentDriverName?: string;
  currentDriverId?: string;
  branch: string;
}

export interface DeliveryIssue {
  id: string;
  deliveryId: string;
  deliveryNumber: string;
  contractNumber: string;
  customerName: string;
  customerPhone: string;
  type:
    | "DAMAGED"
    | "MISSING_ITEM"
    | "WRONG_ITEM"
    | "CUSTOMER_COMPLAINT"
    | "INSTALLATION_ISSUE"
    | "ADDRESS_ISSUE";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  status: "OPEN" | "INVESTIGATING" | "RESOLVED";
  reportedBy: string;
  reportedAt: string;
  resolutionNotes?: string;
  resolvedAt?: string;
}

export interface DeliveryReturn {
  id: string;
  deliveryId: string;
  deliveryNumber: string;
  contractNumber: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  reason: string;
  condition: "PERFECT" | "MINOR_DAMAGE" | "HEAVILY_DAMAGED";
  returnedToWarehouse: string;
  inventoryAction: "AVAILABLE" | "DAMAGED" | "WORKSHOP";
  status: "PENDING_INSPECTION" | "ACCEPTED_RESTOCKED" | "ACCEPTED_DAMAGED" | "REJECTED";
  requestedAt: string;
  inspectedAt?: string;
  processedBy?: string;
  notes?: string;
}

export interface LogisticsInsight {
  id: string;
  type:
    | "NOT_SCHEDULED"
    | "DELAYED"
    | "ROUTE_GROUPING"
    | "INCOMPLETE_ITEMS"
    | "FLEET_CAPACITY_OVERLOAD";
  severity: "WARNING" | "CRITICAL" | "OPPORTUNITY" | "INFO";
  title: string;
  description: string;
  recommendation: string;
  affectedDeliveryIds?: string[];
  targetZone?: string;
  targetDate?: string;
  actionLabel?: string;
  actionType?: "SCHEDULE" | "GROUP_ROUTE" | "RESOLVE_STOCK" | "REASSIGN";
  resolved?: boolean;
}

export type LogisticsUserRole =
  | "WAREHOUSE_EMPLOYEE"
  | "DELIVERY_COORDINATOR"
  | "BRANCH_MANAGER"
  | "ADMIN";
