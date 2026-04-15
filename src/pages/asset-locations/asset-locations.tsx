import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminModulePage from "../../components/asset-admin/admin-module-page";
import useAxiosPrivate from "../../services/hooks/useaxios-private";

interface AssetLocationRecord {
  id: number | null;
  locationCode: string;
  locationName: string;
}

export default function AssetLocationsPage() {
  const axiosPrivate = useAxiosPrivate();
  const [rows, setRows] = useState<AssetLocationRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    locationCode: "",
    locationName: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const metrics = useMemo(
    () => [
      { label: "Locations", value: rows.length, helper: "Configured places from backend" },
      { label: "Latest Code", value: rows.at(-1)?.locationCode ?? "-", helper: "Most recently listed code" },
      { label: "Latest Location", value: rows.at(-1)?.locationName ?? "-", helper: "Most recently listed location" },
    ],
    [rows]
  );

  const resetForm = useCallback(() => {
    setFormData({
      locationCode: "",
      locationName: "",
    });
    setSubmitError("");
  }, []);

  const closeModal = useCallback(() => {
    if (isSaving) {
      return;
    }
    setIsModalOpen(false);
    setEditingIndex(null);
    resetForm();
  }, [isSaving, resetForm]);

  const mapLocationRecord = useCallback((location: any): AssetLocationRecord => ({
    id: typeof location?.id === "number" ? location.id : null,
    locationCode: location?.locationCode ?? "",
    locationName: location?.locationName ?? "",
  }), []);

  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await axiosPrivate.get("/assets/locations");
      const payload = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : [];

      setRows(payload.map(mapLocationRecord));
    } catch (error: any) {
      setRows([]);
      setLoadError(error?.response?.data?.message || "Failed to fetch asset locations. Check the API and try again.");
      console.error("Failed to fetch asset locations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [axiosPrivate, mapLocationRecord]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal, isModalOpen]);

  const openAddModal = () => {
    if (isSaving) {
      return;
    }
    setEditingIndex(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (row: AssetLocationRecord, index: number) => {
    if (isSaving) {
      return;
    }
    setEditingIndex(index);
    setFormData({
      locationCode: row.locationCode,
      locationName: row.locationName,
    });
    setSubmitError("");
    setIsModalOpen(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextRow: AssetLocationRecord = {
      id: editingIndex === null ? null : rows[editingIndex]?.id ?? null,
      locationCode: formData.locationCode.trim(),
      locationName: formData.locationName.trim(),
    };

    if (editingIndex !== null) {
      setRows((current) =>
        current.map((row, index) => (index === editingIndex ? nextRow : row))
      );
      closeModal();
      return;
    }

    setIsSaving(true);
    setSubmitError("");

    try {
      // axios baseURL already includes `/v1`, so this hits `POST /v1/assets/locations`.
      await axiosPrivate.post("/assets/locations", {
        locationCode: nextRow.locationCode,
        locationName: nextRow.locationName,
      });

      await fetchLocations();
      setIsModalOpen(false);
      setEditingIndex(null);
      resetForm();
    } catch (error: any) {
      setSubmitError(
        error?.response?.data?.message || "Failed to add location. Check the API and try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isSubmitDisabled = Object.values(formData).some((value) => value.trim() === "");

  return (
    <AdminModulePage
      title="Locations"
      subtitle="Maintain the location master used by the IT admin while assigning and tracking devices by team or handling unit."
      actionLabel="Add Location"
      onActionClick={openAddModal}
      onEditRow={openEditModal}
      metrics={metrics}
      columns={[
        { key: "locationCode", label: "Location Code" },
        { key: "locationName", label: "Location Name" },
      ]}
      rows={rows}
      emptyState={{
        title: isLoading ? "Loading locations" : loadError ? "Unable to load locations" : "No locations available",
        description: isLoading
          ? "Fetching asset locations from the backend."
          : loadError
            ? loadError
            : "No location records were returned from the backend yet.",
      }}
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
                    name="locationCode"
                    type="text"
                    value={formData.locationCode}
                    onChange={handleInputChange}
                    placeholder="Enter location code"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Location Name</span>
                  <input
                    name="locationName"
                    type="text"
                    value={formData.locationName}
                    onChange={handleInputChange}
                    placeholder="Enter location name"
                  />
                </label>
              </div>

              {submitError && <p className="asset-admin-form-error">{submitError}</p>}

              <div className="asset-admin-form-actions">
                <button type="button" className="asset-admin-secondary-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="asset-admin-primary-btn" disabled={isSubmitDisabled || isSaving}>
                  {isSaving ? "Saving..." : editingIndex === null ? "Save Location" : "Update Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminModulePage>
  );
}
