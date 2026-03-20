import React from "react";
import AdminModulePage from "../../components/asset-admin/admin-module-page";
import { assets } from "../../data/asset-admin-data";

export default function AssetsPage() {
  return (
    <AdminModulePage
      title="Assets Module"
      subtitle="Manage IT assets with device ID, serial number, asset name, type, status, and item location handled by the responsible team."
      actionLabel="Add Asset"
      metrics={[
        { label: "Asset Records", value: assets.length, helper: "Tracked in the frontend" },
        { label: "Working", value: assets.filter((item) => item.status === "Working").length, helper: "Healthy devices" },
        { label: "Deferred", value: assets.filter((item) => item.status === "Deferred").length, helper: "Waiting for action" },
      ]}
      columns={[
        { key: "deviceId", label: "Device ID" },
        { key: "serialNumber", label: "S/N No" },
        { key: "assetName", label: "Asset Name" },
        { key: "type", label: "Type" },
        { key: "status", label: "Asset Status" },
        { key: "location", label: "Item Location" },
        { key: "owner", label: "Responsible" },
      ]}
      rows={assets}
    />
  );
}
