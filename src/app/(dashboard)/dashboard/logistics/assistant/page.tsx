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
  ArrowRight,
  Package,
} from "lucide-react";
import LogisticsNav from "@/components/logistics/LogisticsNav";
import SmartAssistantWidget from "@/components/logistics/SmartAssistantWidget";
import DeliveryDetailsModal from "@/components/logistics/DeliveryDetailsModal";
import { useShowroom } from "@/context/ShowroomContext";
import { DeliveryOrder } from "@/types/logistics";

export default function SmartAssistantPage() {
  const { deliveries } = useShowroom();
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);

  return (
    <div className="space-y-6 pb-12">
      <LogisticsNav />

      {/* Main Assistant Full Widget */}
      <SmartAssistantWidget
        standalone
        onSelectDelivery={(delId) => {
          const matched = deliveries.find((d) => d.id === delId);
          if (matched) setSelectedDelivery(matched);
        }}
      />

      {/* Delivery Details Modal */}
      {selectedDelivery && (
        <DeliveryDetailsModal
          delivery={selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
          onCheckReadiness={() => {}}
          onPickPack={() => {}}
          onScheduleAssign={() => {}}
          onDispatch={() => {}}
          onCompletePOD={() => {}}
          onFail={() => {}}
          onReportIssue={() => {}}
          onCreateReturn={() => {}}
        />
      )}
    </div>
  );
}
