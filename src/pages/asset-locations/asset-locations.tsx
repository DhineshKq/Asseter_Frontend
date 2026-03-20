import React from "react";
import AdminModulePage from "../../components/asset-admin/admin-module-page";
import { locations } from "../../data/asset-admin-data";

export default function AssetLocationsPage() {
  return (
    <AdminModulePage
      title="Asset Locations"
      subtitle="Maintain the location master used by the IT admin while assigning and tracking devices by team or handling unit."
      actionLabel="Add Location"
      metrics={[
        { label: "Locations", value: locations.length, helper: "Configured places" },
        { label: "Teams Covered", value: 5, helper: "Mapped operational groups" },
        { label: "Largest Location", value: "Infra Team", helper: "18 mapped assets" },
      ]}
      columns={[
        { key: "code", label: "Location Code" },
        { key: "name", label: "Location Name" },
        { key: "team", label: "Team" },
        { key: "floor", label: "Floor / Area" },
        { key: "assetsCount", label: "Assets" },
      ]}
      rows={locations}
    />
  );
}
