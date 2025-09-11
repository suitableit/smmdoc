"use client";

import React from "react";
import { FaSync, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

type ProviderInfo = {
  id?: string;
  name?: string;
  apiUrl?: string;
  status?: string;
};

export type ProviderOrderStatusProps = {
  order: {
    id: string;
    status?: string;
    isProviderService?: boolean;
    providerId?: string;
    providerServiceId?: string;
    providerOrderId?: string;
    providerStatus?: string;
    lastSyncAt?: string;
    apiProvider?: ProviderInfo;
  };
  onSync?: (orderId: string) => void | Promise<void>;
};

const statusBadge = (status?: string) => {
  if (!status) return <span className="px-2 py-0.5 text-xs rounded bg-gray-200 text-gray-700">unknown</span>;
  const norm = status.toLowerCase();
  if (norm === "completed")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">
        <FaCheckCircle className="w-3 h-3" /> {status}
      </span>
    );
  if (["failed", "cancelled", "partial"].includes(norm))
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-red-100 text-red-700">
        <FaExclamationTriangle className="w-3 h-3" /> {status}
      </span>
    );
  return <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">{status}</span>;
};

export default function ProviderOrderStatus({ order, onSync }: ProviderOrderStatusProps) {
  const isProvider = !!order.isProviderService && !!order.providerId;

  return (
    <div className="flex flex-col gap-1 min-w-[180px]">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Provider</span>
        <span className="text-xs font-medium">
          {order.apiProvider?.name || (isProvider ? `#${order.providerId}` : "N/A")}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Status</span>
        <div>{statusBadge(order.providerStatus || (isProvider ? order.status : "N/A"))}</div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Last Sync</span>
        <span className="text-xs text-gray-700">
          {order.lastSyncAt ? new Date(order.lastSyncAt).toLocaleString() : "—"}
        </span>
      </div>

      {isProvider && (
        <button
          type="button"
          onClick={() => onSync?.(order.id)}
          className="mt-1 inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
          title="Sync provider order"
        >
          <FaSync className="w-3 h-3" /> Sync
        </button>
      )}
    </div>
  );
}