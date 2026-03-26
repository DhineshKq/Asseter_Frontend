import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminModulePage from "../../components/asset-admin/admin-module-page";
import useAxiosPrivate from "../../services/hooks/useaxios-private";
import { AssetRecord, AssetStatus } from "../../data/asset-admin-data";

interface AssetFormState {
  deviceId: string;
  serialNumber: string;
  assetName: string;
  type: string;
  status: AssetStatus;
  locationId: string;
}

interface AssetLocationOption {
  id: number;
  locationCode: string;
  locationName: string;
  teamName: string;
}

export default function AssetsPage() {
  const axiosPrivate = useAxiosPrivate();
  const [rows, setRows] = useState<AssetRecord[]>([]);
  const [locationOptions, setLocationOptions] = useState<AssetLocationOption[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AssetRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [formData, setFormData] = useState<AssetFormState>({
    deviceId: "",
    serialNumber: "",
    assetName: "",
    type: "",
    status: "Working",
    locationId: "",
  });

  const statusOptions: AssetStatus[] = ["Working", "In Repair", "Deferred", "Retired"];
  const typeOptions = ["Laptop", "Monitor", "Network Device", "Printer", "Server", "Desktop", "Accessory"];

  const metrics = useMemo(
    () => [
      { label: "Asset Records", value: rows.length, helper: "Tracked in the frontend" },
      { label: "Working", value: rows.filter((item) => item.status === "Working").length, helper: "Healthy devices" },
      { label: "In Repair", value: rows.filter((item) => item.status === "In Repair").length, helper: "Under maintenance" },
      { label: "Deferred", value: rows.filter((item) => item.status === "Deferred").length, helper: "Waiting for action" },
    ],
    [rows]
  );

  const resetForm = useCallback(() => {
    setFormData({
      deviceId: "",
      serialNumber: "",
      assetName: "",
      type: "",
      status: "Working",
      locationId: "",
    });
    setSubmitError("");
  }, []);

  const normalizeStatus = (status: string | undefined): AssetStatus => {
    switch ((status ?? "").toLowerCase()) {
      case "working":
        return "Working";
      case "in repair":
      case "in_repair":
        return "In Repair";
      case "deferred":
        return "Deferred";
      case "retired":
        return "Retired";
      default:
        return "Working";
    }
  };

  const mapAssetRecord = useCallback((asset: any): AssetRecord => ({
    id: typeof asset.id === "number" ? asset.id : null,
    assetCode: asset.assetCode ?? "",
    locationId: typeof asset.locationId === "number" ? asset.locationId : null,
    deviceId: asset.deviceId ?? "",
    serialNumber: asset.serialNumber ?? "",
    assetName: asset.assetName ?? "",
    type: asset.assetType ?? asset.type ?? "",
    status: normalizeStatus(asset.assetStatus ?? asset.status),
    location: asset.location?.locationName ?? asset.location?.name ?? asset.locationName ?? `Location ${asset.locationId ?? "-"}`,
  }), []);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await axiosPrivate.get("/assets/locations");
      const payload = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : [];

      setLocationOptions(
        payload.map((location: any) => ({
          id: location.id,
          locationCode: location.locationCode ?? "",
          locationName: location.locationName ?? "",
          teamName: location.teamName ?? "",
        }))
      );
    } catch (error) {
      setLocationOptions([]);
      console.error("Failed to fetch asset locations:", error);
    }
  }, [axiosPrivate]);

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await axiosPrivate.get("/assets");
      const payload = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.assets)
            ? response.data.assets
            : [];

      setRows(payload.map(mapAssetRecord));
    } catch (error) {
      setRows([]);
      console.error("Failed to fetch assets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [axiosPrivate, mapAssetRecord]);

  const closeModal = useCallback(() => {
    if (isSaving) {
      return;
    }
    setIsModalOpen(false);
    setEditingIndex(null);
    resetForm();
  }, [isSaving, resetForm]);

  const closeDeleteModal = useCallback(() => {
    if (isDeleting) {
      return;
    }
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
    setDeleteError("");
  }, [isDeleting]);

  useEffect(() => {
    fetchAssets();
    fetchLocations();
  }, [fetchAssets, fetchLocations]);

  useEffect(() => {
    if (!isModalOpen && !isDeleteModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isDeleteModalOpen) {
          closeDeleteModal();
          return;
        }
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeDeleteModal, closeModal, isDeleteModalOpen, isModalOpen]);

  const openAddModal = () => {
    if (isSaving || isDeleting) {
      return;
    }
    setEditingIndex(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (row: AssetRecord, index: number) => {
    if (isSaving || isDeleting) {
      return;
    }
    setEditingIndex(index);
      setFormData({
        deviceId: row.deviceId,
        serialNumber: row.serialNumber,
        assetName: row.assetName,
        type: row.type,
        status: row.status,
        locationId: row.locationId ? String(row.locationId) : "",
    });
    setSubmitError("");
    setIsModalOpen(true);
  };

  const openDeleteModal = (row: AssetRecord) => {
    if (isSaving || isDeleting) {
      return;
    }
    setDeleteTarget(row);
    setDeleteError("");
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.id) {
      setDeleteError("Asset ID is missing. Refresh the page and try again.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      // axios baseURL already includes `/v1`, so this hits `DELETE /v1/assets/:id`.
      await axiosPrivate.delete(`/assets/${deleteTarget.id}`);
      await fetchAssets();
      closeDeleteModal();
    } catch (error: any) {
      setDeleteError(error?.response?.data?.message || "Failed to delete asset. Check the API and try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const locationId = Number(formData.locationId);

    if (!Number.isInteger(locationId) || locationId <= 0) {
      setSubmitError("Select a valid location before saving the asset.");
      return;
    }

    const payload = {
      deviceId: formData.deviceId.trim(),
      serialNumber: formData.serialNumber.trim(),
      assetName: formData.assetName.trim(),
      assetType: formData.type.trim(),
      locationId,
      assetStatus: formData.status.toLowerCase(),
    };

    if (editingIndex !== null) {
      const currentAsset = rows[editingIndex];
      if (!currentAsset?.id) {
        setSubmitError("Asset ID is missing. Refresh the page and try again.");
        return;
      }

      setIsSaving(true);
      setSubmitError("");

      try {
        await axiosPrivate.put(`/assets/${currentAsset.id}`, payload);
        await fetchAssets();
        closeModal();
      } catch (error: any) {
        setSubmitError(error?.response?.data?.message || "Failed to update asset. Check the API and try again.");
      } finally {
        setIsSaving(false);
      }

      return;
    }

    setIsSaving(true);
    setSubmitError("");

    try {
      await axiosPrivate.post("/assets", payload);

      await fetchAssets();
      closeModal();
    } catch (error: any) {
      setSubmitError(error?.response?.data?.message || "Failed to save asset. Check the API and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const isSubmitDisabled = [
    formData.deviceId,
    formData.serialNumber,
    formData.assetName,
    formData.type,
    formData.status,
    formData.locationId,
  ].some((value) => value.trim() === "");

  return (
    <AdminModulePage
      title="Assets Module"
      subtitle="Manage IT assets with device ID, serial number, asset name, type, status, and item location handled by the responsible team."
      actionLabel="Add Asset"
      onActionClick={openAddModal}
      onEditRow={openEditModal}
      renderRowActions={(row) => (
        <button
          type="button"
          className="asset-admin-danger-btn"
          onClick={() => openDeleteModal(row as AssetRecord)}
          disabled={isDeleting || !(row as AssetRecord).id}
          aria-disabled={isDeleting || !(row as AssetRecord).id}
          title={!(row as AssetRecord).id ? "Cannot delete an asset without an ID" : "Delete asset"}
        >
          Delete
        </button>
      )}
      metrics={metrics}
      columns={[
        { key: "assetCode", label: "Asset Code" },
        { key: "deviceId", label: "Device ID" },
        { key: "serialNumber", label: "S/N No" },
        { key: "assetName", label: "Asset Name" },
        { key: "type", label: "Type" },
        { key: "status", label: "Asset Status" },
        { key: "location", label: "Location" },
      ]}
      rows={rows}
      emptyState={{
        title: isLoading ? "Loading assets" : "No assets available",
        description: isLoading
          ? "Fetching assets from the backend."
          : "No asset records were returned from the backend yet.",
      }}
    >
      {isModalOpen && (
        <div className="asset-admin-modal-backdrop" onClick={closeModal}>
          <div
            className="asset-admin-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="asset-admin-modal-title"
          >
            <div className="asset-admin-modal-header">
              <div>
                <p className="asset-admin-modal-kicker">{editingIndex === null ? "New Asset" : "Edit Asset"}</p>
                <h3 id="asset-admin-modal-title">{editingIndex === null ? "Add Asset" : "Edit Asset"}</h3>
              </div>
              <button type="button" className="asset-admin-modal-close" onClick={closeModal} aria-label="Close add asset popup">
                x
              </button>
            </div>

            <form className="asset-admin-form" onSubmit={handleSubmit}>
              <div className="asset-admin-form-grid">
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
                  <span>Serial Number</span>
                  <input
                    name="serialNumber"
                    type="text"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    placeholder="Enter serial number"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Asset Name</span>
                  <input
                    name="assetName"
                    type="text"
                    value={formData.assetName}
                    onChange={handleInputChange}
                    placeholder="Enter asset name"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Type</span>
                  <input
                    name="type"
                    type="text"
                    list="asset-type-options"
                    value={formData.type}
                    onChange={handleInputChange}
                    placeholder="Enter or select type"
                  />
                  <datalist id="asset-type-options">
                    {typeOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </label>

                <label className="asset-admin-field">
                  <span>Status</span>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="asset-admin-field">
                  <span>Location ID</span>
                  <select
                    name="locationId"
                    value={formData.locationId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select location</option>
                    {locationOptions.map((location) => (
                      <option key={location.id} value={String(location.id)}>
                        {location.locationName} ({location.locationCode})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {submitError && <p className="asset-admin-form-error">{submitError}</p>}

              <div className="asset-admin-form-actions">
                <button type="button" className="asset-admin-secondary-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="asset-admin-primary-btn" disabled={isSubmitDisabled || isSaving}>
                  {isSaving ? "Saving..." : editingIndex === null ? "Save Asset" : "Update Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="asset-admin-modal-backdrop" onClick={closeDeleteModal}>
          <div
            className="asset-admin-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="asset-admin-delete-modal-title"
          >
            <div className="asset-admin-modal-header">
              <div>
                <p className="asset-admin-modal-kicker">Confirm Delete</p>
                <h3 id="asset-admin-delete-modal-title">Delete Asset</h3>
              </div>
              <button
                type="button"
                className="asset-admin-modal-close"
                onClick={closeDeleteModal}
                aria-label="Close delete asset popup"
                disabled={isDeleting}
              >
                x
              </button>
            </div>

            <div className="asset-admin-form">
              <p>
                Delete{" "}
                <strong>
                  {deleteTarget?.assetName || deleteTarget?.assetCode || "this asset"}
                </strong>
                ? This action cannot be undone.
              </p>

              {deleteError && <p className="asset-admin-form-error">{deleteError}</p>}

              <div className="asset-admin-form-actions">
                <button type="button" className="asset-admin-secondary-btn" onClick={closeDeleteModal} disabled={isDeleting}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="asset-admin-danger-btn"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminModulePage>
  );
}
