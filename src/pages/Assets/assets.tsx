import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminModulePage from "../../components/asset-admin/admin-module-page";
import useAxiosPrivate from "../../services/hooks/useaxios-private";
import { AssetRecord, AssetStatus } from "../../data/asset-admin-data";
import * as XLSX from "xlsx";
import downloadIcon from "../../assets/icons/download.png";

interface AssetFormState {
  serialNumbers: string[];
  assetName: string;
  invoiceNo: string;
  invoiceDate: string;
  vendor: string;
  quantity: string;
  receiveBy: string;
  amount: string;
  receivedDate: string;
  type: string;
  status: AssetStatus;
  locationId: string;
}

export default function AssetsPage() {
  const axiosPrivate = useAxiosPrivate();
  const [rows, setRows] = useState<AssetRecord[]>([]);
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
    serialNumbers: [],
    assetName: "",
    invoiceNo: "",
    invoiceDate: "",
    vendor: "",
    quantity: "",
    receiveBy: "",
    amount: "",
    receivedDate: "",
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

  const handleDownloadReport = useCallback(() => {
    const exportRows = rows.map((row) => ({
      assetCode: row.assetCode,
      receivedDate: row.receivedDate,
      invoiceNumber: row.invoiceNo,
      invoiceDate: row.invoiceDate,
      vendor: row.vendor,
      assetName: row.assetName,
      assetModel: row.type,
      serialNumber: row.serialNumber,
      quantity: row.quantity,
      amount: row.amount,
      receivedBy: row.receiveBy,
      status: row.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inward");
    XLSX.writeFile(workbook, "inward-report.xlsx");
  }, [rows]);

  const resetForm = useCallback(() => {
    setFormData({
      serialNumbers: [],
      assetName: "",
      invoiceNo: "",
      invoiceDate: "",
      vendor: "",
      quantity: "",
      receiveBy: "",
      amount: "",
      receivedDate: "",
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
    assetModel: asset.assetModel ?? "",
    invoiceNo: asset.invoiceNo ?? asset.invoice_no ?? asset.invoiceNumber ?? "",
    invoiceDate: asset.invoiceDate ?? asset.invoice_date ?? "",
    vendor: asset.vendor ?? "",
    quantity: asset.quantity != null ? String(asset.quantity) : "",
    assignedItems: typeof asset.Assigned_items === "number"
      ? asset.Assigned_items
      : typeof asset.assignedItems === "number"
        ? asset.assignedItems
        : 0,
    receiveBy: asset.receiveBy ?? asset.receivedBy ?? asset.receive_by ?? asset.received_by ?? "",
    amount: asset.amount != null ? String(asset.amount) : "",
    receivedDate: asset.receivedDate ?? asset.received_date ?? "",
    type: asset.assetType ?? asset.assetModel ?? asset.type ?? "",
    status: normalizeStatus(asset.assetStatus ?? asset.status),
    location: asset.location?.locationName ?? asset.location?.name ?? asset.locationName ?? `Location ${asset.locationId ?? "-"}`,
    createdAt: asset.createdAt ?? "",
    updatedAt: asset.updatedAt ?? "",
  }), []);

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
  }, [fetchAssets]);

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
    const qty = parseInt(row.quantity, 10);
    const existingSerials = row.serialNumber
      ? row.serialNumber.split(",").map((s) => s.trim())
      : [];
    const serialNumbers = Array.from(
      { length: Number.isFinite(qty) && qty > 0 ? qty : 0 },
      (_, i) => existingSerials[i] ?? ""
    );
    setFormData({
      serialNumbers,
      assetName: row.assetName,
      invoiceNo: row.invoiceNo,
      invoiceDate: row.invoiceDate,
      vendor: row.vendor,
      quantity: row.quantity,
      receiveBy: row.receiveBy,
      amount: row.amount,
      receivedDate: row.receivedDate,
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
    if (submitError) {
      setSubmitError("");
    }

    if (name === "quantity") {
      const qty = parseInt(value, 10);
      setFormData((current) => ({
        ...current,
        quantity: value,
        serialNumbers:
          Number.isFinite(qty) && qty > 0
            ? Array.from({ length: qty }, (_, i) => current.serialNumbers[i] ?? "")
            : [],
      }));
      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSerialNumberChange = (index: number, value: string) => {
    if (submitError) {
      setSubmitError("");
    }
    setFormData((current) => {
      const updated = [...current.serialNumbers];
      updated[index] = value;
      return { ...current, serialNumbers: updated };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const locationId = Number(formData.locationId);
    const quantity = Number(formData.quantity);
    const amount = formData.amount.trim() === "" ? undefined : Number(formData.amount);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setSubmitError("Qty must be greater than 0.");
      return;
    }

    if (amount !== undefined && (!Number.isFinite(amount) || amount < 0)) {
      setSubmitError("Amount must be a valid number.");
      return;
    }

    const nonEmptySerials = formData.serialNumbers.filter((s) => s.trim() !== "");

    const payload: Record<string, string | number | string[]> = {
      serialNumber: nonEmptySerials.join(", "),
      serialNumbers: nonEmptySerials,
      assetName: formData.assetName.trim(),
      receivedDate: formData.receivedDate,
      invoiceNumber: formData.invoiceNo.trim(),
      invoiceDate: formData.invoiceDate,
      vendor: formData.vendor.trim(),
      assetModel: formData.type.trim(),
      quantity,
      receivedBy: formData.receiveBy.trim(),
      status: formData.status.toLowerCase(),
    };

    if (amount !== undefined) {
      payload.amount = amount;
    }

    if (Number.isInteger(locationId) && locationId > 0) {
      payload.locationId = locationId;
    }

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
    formData.assetName,
    formData.vendor,
    formData.quantity,
    formData.receiveBy,
    formData.receivedDate,
    formData.status,
  ].some((value) => value.trim() === "");

  return (
    <AdminModulePage
      title="Inward"
      subtitle="Manage IT assets with device ID, serial number, asset name, type, status, and item location handled by the responsible team."
      actionLabel="Add Inward"
      headerActions={
        <button type="button" className="asset-admin-secondary-btn" onClick={handleDownloadReport} aria-label="Download inward report" title="Download Report">
          <img src={downloadIcon} alt="Download" style={{ width: "16px", height: "16px" }} />
        </button>
      }
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
        { key: "serialNumber", label: "S/N No" },
        { key: "assetName", label: "Assets Name" },
        { key: "invoiceNo", label: "Invoice Number" },
        { key: "invoiceDate", label: "Invoice Date" },
        { key: "vendor", label: "Vendor" },
        { key: "quantity", label: "Qty" },
        { key: "receiveBy", label: "Received By" },
        { key: "amount", label: "Amount" },
        { key: "receivedDate", label: "Receive Date" },
        { key: "type", label: "Assets Modal" },
        { key: "status", label: "Status" },
        // { key: "location", label: "Location" },
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
                <p className="asset-admin-modal-kicker">{editingIndex === null ? "New Inward" : "Edit Inward"}</p>
                <h3 id="asset-admin-modal-title">{editingIndex === null ? "Add Inward" : "Edit Inward"}</h3>
              </div>
              <button type="button" className="asset-admin-modal-close" onClick={closeModal} aria-label="Close add inward popup">
                x
              </button>
            </div>

            <form className="asset-admin-form" onSubmit={handleSubmit}>
              <div className="asset-admin-form-grid">
                <label className="asset-admin-field">
                  <span>Receive Date *</span>
                  <input
                    name="receivedDate"
                    type="date"
                    value={formData.receivedDate}
                    onChange={handleInputChange}
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Invoice Number</span>
                  <input
                    name="invoiceNo"
                    type="text"
                    value={formData.invoiceNo}
                    onChange={handleInputChange}
                    placeholder="Enter invoice number"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Invoice Date</span>
                  <input
                    name="invoiceDate"
                    type="date"
                    value={formData.invoiceDate}
                    onChange={handleInputChange}
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Vendor *</span>
                  <input
                    name="vendor"
                    type="text"
                    value={formData.vendor}
                    onChange={handleInputChange}
                    placeholder="Enter vendor name"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Assets Name *</span>
                  <input
                    name="assetName"
                    type="text"
                    value={formData.assetName}
                    onChange={handleInputChange}
                    placeholder="Enter assets name"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Assets Modal</span>
                  <input
                    name="type"
                    type="text"
                    list="asset-type-options"
                    value={formData.type}
                    onChange={handleInputChange}
                    placeholder="Enter assets modal"
                  />
                  <datalist id="asset-type-options">
                    {typeOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </label>

                <label className="asset-admin-field">
                  <span>Qty *</span>
                  <input
                    name="quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="Enter quantity"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Amount</span>
                  <input
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Received By *</span>
                  <input
                    name="receiveBy"
                    type="text"
                    value={formData.receiveBy}
                    onChange={handleInputChange}
                    placeholder="Enter receiver name"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Status *</span>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {formData.serialNumbers.length > 0 && (
                <div className="asset-admin-serial-section">
                  <p className="asset-admin-serial-label">
                    Serial Numbers <span className="asset-admin-serial-optional">(optional)</span>
                  </p>
                  <div className="asset-admin-serial-grid">
                    {formData.serialNumbers.map((sn, index) => (
                      <label key={index} className="asset-admin-field">
                        <span>Serial #{index + 1}</span>
                        <input
                          type="text"
                          value={sn}
                          onChange={(e) => handleSerialNumberChange(index, e.target.value)}
                          placeholder={`Enter serial number ${index + 1}`}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {submitError && <p className="asset-admin-form-error">{submitError}</p>}

              <div className="asset-admin-form-actions">
                <button type="button" className="asset-admin-secondary-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="asset-admin-primary-btn" disabled={isSubmitDisabled || isSaving}>
                  {isSaving ? "Saving..." : editingIndex === null ? "Save Inward" : "Update Inward"}
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
