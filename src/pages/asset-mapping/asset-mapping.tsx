import React from "react";
import AdminModulePage from "../../components/asset-admin/admin-module-page";
import { mappings } from "../../data/asset-admin-data";

export default function AssetMappingPage() {
  return (
    <AdminModulePage
      title="Asset Mapping"
      subtitle="Track which employee or team is responsible for each asset. This module gives the admin a single place to review ownership."
      actionLabel="Map Asset"
      metrics={[
        { label: "Mapped Assets", value: mappings.length, helper: "Assigned with responsibility" },
        { label: "Departments", value: 4, helper: "Teams with mappings" },
        { label: "Latest Mapping", value: "2026-03-01", helper: "Most recent assignment date" },
      ]}
      columns={[
        { key: "assetName", label: "Asset Name" },
        { key: "deviceId", label: "Device ID" },
        { key: "assignedTo", label: "Responsible User" },
        { key: "department", label: "Department" },
        { key: "location", label: "Location" },
        { key: "assignedOn", label: "Assigned On" },
      ]}
      rows={mappings}
    />
  );
}
