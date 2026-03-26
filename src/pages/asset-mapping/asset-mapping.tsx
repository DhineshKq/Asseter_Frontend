import React, { useMemo, useState } from "react";
import AdminModulePage from "../../components/asset-admin/admin-module-page";
import { assets, locations, mappings, MappingRecord, users } from "../../data/asset-admin-data";

export default function AssetMappingPage() {
  const [rows, setRows] = useState<MappingRecord[]>(mappings);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [formData, setFormData] = useState<MappingRecord>({
    assetName: "",
    deviceId: "",
    assignedTo: "",
    department: "",
    location: "",
    assignedOn: "",
  });

  const metrics = useMemo(() => {
    const latestMapping = rows.reduce<string>((latest, current) => {
      if (!latest) return current.assignedOn;
      return new Date(current.assignedOn) > new Date(latest) ? current.assignedOn : latest;
    }, "");

    return [
      { label: "Mapped Assets", value: rows.length, helper: "Assigned with responsibility" },
      { label: "Departments", value: new Set(rows.map((item) => item.department)).size, helper: "Teams with mappings" },
      { label: "Latest Mapping", value: latestMapping || "-", helper: "Most recent assignment date" },
    ];
  }, [rows]);

  const assetOptions = assets.map((item) => ({
    assetName: item.assetName,
    deviceId: item.deviceId,
    location: item.location,
  }));
  const userOptions = users.map((item) => ({
    name: item.name,
    team: item.team,
  }));
  const locationOptions = locations.map((item) => item.name);

  const resetForm = () => {
    setFormData({
      assetName: "",
      deviceId: "",
      assignedTo: "",
      department: "",
      location: "",
      assignedOn: "",
    });
  };

  const closeModal = () => {
    setIsMapModalOpen(false);
    resetForm();
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    if (name === "assetName") {
      const selectedAsset = assetOptions.find((item) => item.assetName === value);
      setFormData((current) => ({
        ...current,
        assetName: value,
        deviceId: selectedAsset?.deviceId ?? "",
        location: selectedAsset?.location ?? current.location,
      }));
      return;
    }

    if (name === "assignedTo") {
      const selectedUser = userOptions.find((item) => item.name === value);
      setFormData((current) => ({
        ...current,
        assignedTo: value,
        department: selectedUser?.team ?? current.department,
      }));
      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRows((current) => [...current, formData]);
    closeModal();
  };

  const isSubmitDisabled = Object.values(formData).some((value) => value.trim() === "");

  return (
    <AdminModulePage
      title="Asset Mapping"
      subtitle="Track which employee or team is responsible for each asset. This module gives the admin a single place to review ownership."
      actionLabel="Map Asset"
      onActionClick={() => setIsMapModalOpen(true)}
      metrics={metrics}
      columns={[
        { key: "assetName", label: "Asset Name" },
        { key: "deviceId", label: "Device ID" },
        { key: "assignedTo", label: "Responsible User" },
        { key: "department", label: "Department" },
        { key: "location", label: "Location" },
        { key: "assignedOn", label: "Assigned On" },
      ]}
      rows={rows}
    >
      {isMapModalOpen && (
        <div className="asset-admin-modal-backdrop" onClick={closeModal}>
          <div
            className="asset-admin-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="map-asset-modal-title"
          >
            <div className="asset-admin-modal-header">
              <div>
                <p className="asset-admin-modal-kicker">New Mapping</p>
                <h3 id="map-asset-modal-title">Map Asset</h3>
              </div>
              <button type="button" className="asset-admin-modal-close" onClick={closeModal} aria-label="Close map asset popup">
                x
              </button>
            </div>

            <form className="asset-admin-form" onSubmit={handleSubmit}>
              <div className="asset-admin-form-grid">
                <label className="asset-admin-field">
                  <span>Asset Name</span>
                  <select name="assetName" value={formData.assetName} onChange={handleInputChange}>
                    <option value="">Select asset</option>
                    {assetOptions.map((option) => (
                      <option key={option.deviceId} value={option.assetName}>
                        {option.assetName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="asset-admin-field">
                  <span>Device ID</span>
                  <input
                    name="deviceId"
                    type="text"
                    value={formData.deviceId}
                    onChange={handleInputChange}
                    placeholder="Enter device ID"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Responsible User</span>
                  <select name="assignedTo" value={formData.assignedTo} onChange={handleInputChange}>
                    <option value="">Select user</option>
                    {userOptions.map((option) => (
                      <option key={option.name} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="asset-admin-field">
                  <span>Department</span>
                  <input
                    name="department"
                    type="text"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="Enter department"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Location</span>
                  <select name="location" value={formData.location} onChange={handleInputChange}>
                    <option value="">Select location</option>
                    {locationOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="asset-admin-field">
                  <span>Assigned On</span>
                  <input
                    name="assignedOn"
                    type="date"
                    value={formData.assignedOn}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <div className="asset-admin-form-actions">
                <button type="button" className="asset-admin-secondary-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="asset-admin-primary-btn" disabled={isSubmitDisabled}>
                  Save Mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminModulePage>
  );
}
