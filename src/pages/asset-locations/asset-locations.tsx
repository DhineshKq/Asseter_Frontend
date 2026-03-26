import React, { useEffect, useMemo, useState } from "react";
import AdminModulePage from "../../components/asset-admin/admin-module-page";
import { LocationRecord, locations } from "../../data/asset-admin-data";

export default function AssetLocationsPage() {
  const [rows, setRows] = useState<LocationRecord[]>(locations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
  });

  const metrics = useMemo(
    () => [
      { label: "Locations", value: rows.length, helper: "Configured places" },
      { label: "Latest Code", value: rows.at(-1)?.code ?? "-", helper: "Most recently added code" },
      { label: "Latest Location", value: rows.at(-1)?.name ?? "-", helper: "Most recently added location" },
    ],
    [rows]
  );

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingIndex(null);
    resetForm();
  };

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
        setEditingIndex(null);
        resetForm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const openAddModal = () => {
    setEditingIndex(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (row: LocationRecord, index: number) => {
    setEditingIndex(index);
    setFormData({
      code: row.code,
      name: row.name,
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRows((current) =>
      editingIndex === null
        ? [
            ...current,
            {
              code: formData.code,
              name: formData.name,
            },
          ]
        : current.map((row, index) =>
            index === editingIndex
              ? {
                  code: formData.code,
                  name: formData.name,
                }
              : row
          )
    );
    closeModal();
  };

  const isSubmitDisabled = Object.values(formData).some((value) => value.trim() === "");

  return (
    <AdminModulePage
      title="Asset Locations"
      subtitle="Maintain the location master used by the IT admin while assigning and tracking devices by team or handling unit."
      actionLabel="Add Location"
      onActionClick={openAddModal}
      onEditRow={openEditModal}
      metrics={metrics}
      columns={[
        { key: "code", label: "Location Code" },
        { key: "name", label: "Location Name" },
      ]}
      rows={rows}
    >
      {isModalOpen && (
        <div className="asset-admin-modal-backdrop" onClick={closeModal}>
          <div
            className="asset-admin-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-admin-modal-title"
          >
            <div className="asset-admin-modal-header">
              <div>
                <p className="asset-admin-modal-kicker">{editingIndex === null ? "New Location" : "Edit Location"}</p>
                <h3 id="location-admin-modal-title">{editingIndex === null ? "Add Location" : "Edit Location"}</h3>
              </div>
              <button type="button" className="asset-admin-modal-close" onClick={closeModal} aria-label="Close add location popup">
                x
              </button>
            </div>

            <form className="asset-admin-form" onSubmit={handleSubmit}>
              <div className="asset-admin-form-grid">
                <label className="asset-admin-field">
                  <span>Location Code</span>
                  <input
                    name="code"
                    type="text"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Enter location code"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Location Name</span>
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter location name"
                  />
                </label>
              </div>

              <div className="asset-admin-form-actions">
                <button type="button" className="asset-admin-secondary-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="asset-admin-primary-btn" disabled={isSubmitDisabled}>
                  {editingIndex === null ? "Save Location" : "Update Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminModulePage>
  );
}
