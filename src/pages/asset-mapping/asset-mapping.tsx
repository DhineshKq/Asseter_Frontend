import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminModulePage from "../../components/asset-admin/admin-module-page";
import useAxiosPrivate from "../../services/hooks/useaxios-private";
import { MappingRecord } from "../../data/asset-admin-data";
import * as XLSX from "xlsx";
import downloadIcon from "../../assets/icons/download.png";

interface AssetOption {
  id: number;
  assetName: string;
  deviceId: string;
  serialNumber: string;
  availableQuantity: string;
}

interface EmployeeOption {
  id: number;
  employeeId: string;
  name: string;
  team: string;
}

interface LocationOption {
  id: number;
  locationName: string;
}

interface AssetMappingRow extends MappingRecord {
  id: number | null;
  assetId: number | null;
  userId: number | null;
  locationId: number | null;
  assignedQuantity: string;
}

interface MappingFormState extends MappingRecord {
  availableQuantity: string;
  assignedQuantity: string;
}

const emptyFormState: MappingFormState = {
  assetName: "",
  deviceId: "",
  serialNumber: "",
  employeeId: "",
  assignedTo: "",
  department: "",
  location: "",
  assignedOn: "",
  availableQuantity: "",
  assignedQuantity: "",
};

export default function AssetMappingPage() {
  const axiosPrivate = useAxiosPrivate();
  const [rows, setRows] = useState<AssetMappingRow[]>([]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [editingMappingId, setEditingMappingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<MappingFormState>(emptyFormState);
  const [assetOptions, setAssetOptions] = useState<AssetOption[]>([]);
  const [userOptions, setUserOptions] = useState<EmployeeOption[]>([]);
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [isLoadingMappings, setIsLoadingMappings] = useState(true);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [optionsError, setOptionsError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const metrics = useMemo(() => {
    const latestMapping = rows.reduce<string>((latest, current) => {
      if (!latest) return current.assignedOn;
      return new Date(current.assignedOn) > new Date(latest) ? current.assignedOn : latest;
    }, "");

    return [
      { label: "Mapped Assets", value: rows.length, helper: "Assigned with responsibility" },
      { label: "Departments", value: new Set(rows.map((item) => item.department).filter(Boolean)).size, helper: "Teams with mappings" },
      { label: "Latest Mapping", value: latestMapping || "-", helper: "Most recent assignment date" },
    ];
  }, [rows]);

  const handleDownloadReport = useCallback(() => {
    const exportRows = rows.map((row) => ({
      assetName: row.assetName,
      serialNumber: row.serialNumber,
      employeeId: row.employeeId,
      assignedTo: row.assignedTo,
      department: row.department,
      location: row.location,
      assignedQuantity: row.assignedQuantity,
      assignedOn: row.assignedOn,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asset Mapping");
    XLSX.writeFile(workbook, "asset-mapping-report.xlsx");
  }, [rows]);

  const resetForm = useCallback(() => {
    setFormData(emptyFormState);
    setSubmitError("");
  }, []);

  const closeModal = useCallback(() => {
    if (isSaving) {
      return;
    }
    setIsMapModalOpen(false);
    setEditingMappingId(null);
    resetForm();
  }, [isSaving, resetForm]);

  const normalizeDate = useCallback((value: unknown) => {
    if (typeof value !== "string" || value.trim() === "") {
      return "";
    }

    const trimmedValue = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
      return trimmedValue;
    }

    const parsedDate = new Date(trimmedValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toISOString().slice(0, 10);
  }, []);

  const getAvailableQuantity = useCallback((asset: any) => {
    const totalQuantity = Number(asset?.quantity ?? 0);
    const assignedItems = Number(asset?.Assigned_items ?? asset?.assignedItems ?? 0);

    if (!Number.isFinite(totalQuantity)) {
      return "";
    }

    return String(Math.max(totalQuantity - (Number.isFinite(assignedItems) ? assignedItems : 0), 0));
  }, []);

  const mapMappingRecord = useCallback(
    (
      mapping: any,
      lookups?: {
        assetsById: Map<number, AssetOption>;
        usersById: Map<number, EmployeeOption>;
        locationsById: Map<number, LocationOption>;
      }
    ): AssetMappingRow => {
      const assetId = typeof mapping?.assetId === "number" ? mapping.assetId : null;
      const userId = typeof mapping?.userId === "number" ? mapping.userId : null;
      const locationId = typeof mapping?.locationId === "number" ? mapping.locationId : null;
      const matchedAsset = assetId !== null ? lookups?.assetsById.get(assetId) : undefined;
      const matchedUser = userId !== null ? lookups?.usersById.get(userId) : undefined;
      const matchedLocation = locationId !== null ? lookups?.locationsById.get(locationId) : undefined;
      const fullUserName = `${mapping?.user?.firstName ?? ""} ${mapping?.user?.lastName ?? ""}`.trim();

      return {
        id:
          typeof mapping?.id === "number"
            ? mapping.id
            : typeof mapping?.mappingId === "number"
              ? mapping.mappingId
              : null,
        assetId,
        userId,
        locationId,
        assetName:
          mapping?.asset?.assetName ??
          mapping?.assetDetails?.assetName ??
          matchedAsset?.assetName ??
          mapping?.assetName ??
          "",
        deviceId:
          mapping?.asset?.deviceId ??
          mapping?.assetDetails?.deviceId ??
          matchedAsset?.deviceId ??
          mapping?.deviceId ??
          "",
        serialNumber:
          mapping?.asset?.serialNumber ??
          mapping?.assetDetails?.serialNumber ??
          matchedAsset?.serialNumber ??
          mapping?.serialNumber ??
          "",
        employeeId:
          mapping?.employeeId ??
          mapping?.employee?.employeeId ??
          mapping?.user?.employeeId ??
          matchedUser?.employeeId ??
          "",
        assignedTo:
          mapping?.responsibilityUser ??
          mapping?.employee?.name ??
          (fullUserName || undefined) ??
          mapping?.user?.name ??
          matchedUser?.name ??
          mapping?.assignedTo ??
          "",
        department:
          mapping?.employee?.team ??
          mapping?.user?.team ??
          matchedUser?.team ??
          mapping?.department ??
          "",
        location:
          mapping?.location?.locationName ??
          mapping?.location?.name ??
          matchedLocation?.locationName ??
          mapping?.locationName ??
          mapping?.location ??
          "",
        assignedOn: normalizeDate(
          mapping?.assignedDate ??
          mapping?.assignedOn ??
          mapping?.mappingDate ??
          mapping?.createdAt
        ),
        assignedQuantity:
          mapping?.assignedQuantity != null
            ? String(mapping.assignedQuantity)
            : mapping?.assigned_items != null
              ? String(mapping.assigned_items)
              : "",
      };
    },
    [normalizeDate]
  );

  const fetchMappings = useCallback(async () => {
    setIsLoadingMappings(true);
    setLoadError("");

    try {
      // axios baseURL already includes `/v1`, so these hit the matching `/v1/...` routes.
      const [mappingsResponse, assetsResponse, locationsResponse, employeesResponse] = await Promise.all([
        axiosPrivate.get("/assets/mappings"),
        axiosPrivate.get("/assets"),
        axiosPrivate.get("/assets/locations"),
        axiosPrivate.get("/employees"),
      ]);

      const mappingsPayload = Array.isArray(mappingsResponse.data?.data)
        ? mappingsResponse.data.data
        : Array.isArray(mappingsResponse.data?.mappings)
          ? mappingsResponse.data.mappings
          : Array.isArray(mappingsResponse.data)
            ? mappingsResponse.data
            : [];

      const assetsPayload = Array.isArray(assetsResponse.data?.data)
        ? assetsResponse.data.data
        : Array.isArray(assetsResponse.data)
          ? assetsResponse.data
          : [];

      const locationsPayload = Array.isArray(locationsResponse.data?.data)
        ? locationsResponse.data.data
        : Array.isArray(locationsResponse.data)
          ? locationsResponse.data
          : [];

      const employeesPayload = Array.isArray(employeesResponse.data?.data)
        ? employeesResponse.data.data
        : Array.isArray(employeesResponse.data?.employees)
          ? employeesResponse.data.employees
          : Array.isArray(employeesResponse.data)
            ? employeesResponse.data
            : [];

      const assetsById = new Map<number, AssetOption>(
        assetsPayload
          .filter((asset: any) => typeof asset?.id === "number")
          .map((asset: any) => [
            asset.id,
            {
              id: asset.id,
              assetName: asset.assetName ?? "",
              deviceId: asset.deviceId ?? "",
              serialNumber: asset.serialNumber ?? "",
              availableQuantity: getAvailableQuantity(asset),
            },
          ])
      );

      const locationsById = new Map<number, LocationOption>(
        locationsPayload
          .filter((location: any) => typeof location?.id === "number")
          .map((location: any) => [
            location.id,
            {
              id: location.id,
              locationName: location.locationName ?? "",
            },
          ])
      );

      const usersById = new Map<number, EmployeeOption>(
        employeesPayload
          .filter((employee: any) => typeof employee?.id === "number")
          .map((employee: any) => [
            employee.id,
            {
              id: employee.id,
              employeeId: employee.employeeId ?? "",
              name: employee.name ?? "",
              team: employee.team ?? "",
            },
          ])
      );

      setRows(
        mappingsPayload.map((mapping: any) =>
          mapMappingRecord(mapping, { assetsById, usersById, locationsById })
        )
      );
    } catch (error: any) {
      setRows([]);
      setLoadError(
        error?.response?.data?.message || "Failed to fetch asset mappings. Check the API and try again."
      );
      console.error("Failed to fetch asset mappings:", error);
    } finally {
      setIsLoadingMappings(false);
    }
  }, [axiosPrivate, getAvailableQuantity, mapMappingRecord]);

  const fetchMappingOptions = useCallback(async () => {
    setIsLoadingOptions(true);
    setOptionsError("");

    try {
      const [assetsResponse, locationsResponse, employeesResponse] = await Promise.all([
        axiosPrivate.get("/assets"),
        axiosPrivate.get("/assets/locations"),
        axiosPrivate.get("/employees"),
      ]);

      const assetsPayload = Array.isArray(assetsResponse.data?.data)
        ? assetsResponse.data.data
        : Array.isArray(assetsResponse.data)
          ? assetsResponse.data
          : [];
      const locationsPayload = Array.isArray(locationsResponse.data?.data)
        ? locationsResponse.data.data
        : Array.isArray(locationsResponse.data)
          ? locationsResponse.data
          : [];
      const employeesPayload = Array.isArray(employeesResponse.data?.data)
        ? employeesResponse.data.data
        : Array.isArray(employeesResponse.data)
          ? employeesResponse.data
          : [];

      setAssetOptions(
        assetsPayload.map((asset: any) => ({
          id: asset.id,
          assetName: asset.assetName ?? "",
          deviceId: asset.deviceId ?? "",
          serialNumber: asset.serialNumber ?? "",
          availableQuantity: getAvailableQuantity(asset),
        }))
      );
      setLocationOptions(
        locationsPayload.map((location: any) => ({
          id: location.id,
          locationName: location.locationName ?? "",
        }))
      );
      setUserOptions(
        employeesPayload.map((employee: any) => ({
          id: employee.id,
          employeeId: employee.employeeId ?? "",
          name: employee.name ?? "",
          team: employee.team ?? "",
        }))
      );
    } catch (error: any) {
      setAssetOptions([]);
      setLocationOptions([]);
      setUserOptions([]);
      setOptionsError(
        error?.response?.data?.message || "Failed to load assets, locations, or employees for mapping."
      );
      console.error("Failed to load mapping options:", error);
    } finally {
      setIsLoadingOptions(false);
    }
  }, [axiosPrivate, getAvailableQuantity]);

  useEffect(() => {
    fetchMappings();
    fetchMappingOptions();
  }, [fetchMappingOptions, fetchMappings]);

  useEffect(() => {
    if (!isMapModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal, isMapModalOpen]);

  const openAddModal = useCallback(() => {
    if (isSaving) {
      return;
    }

    setEditingMappingId(null);
    resetForm();
    setIsMapModalOpen(true);
  }, [isSaving, resetForm]);

  const openEditModal = useCallback((row: AssetMappingRow) => {
    if (isSaving) {
      return;
    }

    setEditingMappingId(row.id);
    setFormData({
      assetName: row.assetName,
      deviceId: row.deviceId,
      serialNumber: row.serialNumber,
      employeeId: row.employeeId,
      assignedTo: row.assignedTo,
      department: row.department,
      location: row.location,
      assignedOn: row.assignedOn,
      availableQuantity: assetOptions.find((item) => item.assetName === row.assetName)?.availableQuantity ?? "",
      assignedQuantity: row.assignedQuantity,
    });
    setSubmitError("");
    setIsMapModalOpen(true);
  }, [assetOptions, isSaving]);

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
        serialNumber: selectedAsset?.serialNumber ?? "",
        availableQuantity: selectedAsset?.availableQuantity ?? "",
      }));
      return;
    }

    if (name === "assignedTo") {
      const selectedUser = userOptions.find((item) => item.name === value);
      setFormData((current) => ({
        ...current,
        assignedTo: value,
        employeeId: selectedUser?.employeeId ?? "",
        department: selectedUser?.team ?? "",
      }));
      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const selectedAsset = assetOptions.find((item) => item.assetName === formData.assetName);
    const selectedUser = userOptions.find((item) => item.name === formData.assignedTo);
    const selectedLocation = locationOptions.find((item) => item.locationName === formData.location);
    const assignedQuantity = Number(formData.assignedQuantity);
    const assignedDateIso = formData.assignedOn ? new Date(`${formData.assignedOn}T00:00:00`).toISOString() : "";

    if (!selectedAsset?.id || !selectedUser?.id || !selectedLocation?.id) {
      setSubmitError("Select a valid asset, responsible user, and location before saving the mapping.");
      return;
    }

    if (formData.assignedQuantity.trim() === "") {
      setSubmitError("Enter the assigned quantity before saving the mapping.");
      return;
    }

    const availableQuantity = Number(selectedAsset.availableQuantity);

    if (!Number.isFinite(assignedQuantity) || assignedQuantity <= 0) {
      setSubmitError("Assigned quantity must be greater than 0.");
      return;
    }

    if (assignedDateIso === "" || Number.isNaN(new Date(assignedDateIso).getTime())) {
      setSubmitError("Enter a valid assigned date before saving the mapping.");
      return;
    }

    // if (Number.isFinite(availableQuantity) && Number.isFinite(assignedQuantity) && assignedQuantity > availableQuantity) {
    //   setSubmitError("Assigned quantity cannot be greater than available quantity.");
    //   return;
    // }

    setIsSaving(true);
    setSubmitError("");

    try {
      const payload = {
        assetId: selectedAsset.id,
        locationId: selectedLocation.id,
        userId: selectedUser.id,
        assignedQuantity,
        assignedDate: assignedDateIso,
        remarks: "Updated allocation",
      };

      if (editingMappingId) {
        await axiosPrivate.put(`/assets/mappings/${editingMappingId}`, payload);
        
      } else {
        await axiosPrivate.post("/assets/mappings", payload);
      }

      await Promise.all([fetchMappings(), fetchMappingOptions()]);
      setIsMapModalOpen(false);
      setEditingMappingId(null);
      resetForm();
    } catch (error: any) {
      setSubmitError(
        error?.response?.data?.message || "Failed to save asset mapping. Check the API and try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isSubmitDisabled =
    formData.assetName.trim() === "" ||
    formData.assignedTo.trim() === "" ||
    formData.employeeId.trim() === "" ||
    formData.department.trim() === "" ||
    formData.location.trim() === "" ||
    formData.assignedOn.trim() === "" ||
    formData.assignedQuantity.trim() === "";

  return (
    <AdminModulePage
      title="Asset Mapping"
      subtitle="Track which employee or team is responsible for each asset. This module gives the admin a single place to review ownership."
      actionLabel="Map Asset"
      headerActions={
        <button type="button" className="asset-admin-secondary-btn" onClick={handleDownloadReport} aria-label="Download asset mapping report" title="Download Report">
          <img src={downloadIcon} alt="Download" style={{ width: "16px", height: "16px" }} />
        </button>
      }
      onActionClick={openAddModal}
      onEditRow={(row) => openEditModal(row as AssetMappingRow)}
      metrics={metrics}
      columns={[
        { key: "assetName", label: "Asset Name" },
        { key: "serialNumber", label: "S/N No" },
        { key: "employeeId", label: "Employee ID" },
        { key: "assignedTo", label: "Responsible User" },
        { key: "department", label: "Department" },
        { key: "location", label: "Location" },
        { key: "assignedOn", label: "Assigned On" },
      ]}
      rows={rows}
      emptyState={{
        title: isLoadingMappings
          ? "Loading asset mappings"
          : loadError
            ? "Unable to load asset mappings"
            : "No mapped assets yet",
        description: isLoadingMappings
          ? "Fetching mapped asset details from the backend."
          : loadError
            ? loadError
            : "Create a new asset mapping to populate this module.",
      }}
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
                <p className="asset-admin-modal-kicker">{editingMappingId ? "Edit Mapping" : "New Mapping"}</p>
                <h3 id="map-asset-modal-title">{editingMappingId ? "Edit Asset Mapping" : "Map Asset"}</h3>
              </div>
              <button type="button" className="asset-admin-modal-close" onClick={closeModal} aria-label="Close map asset popup">
                x
              </button>
            </div>

            <form className="asset-admin-form" onSubmit={handleSubmit}>
              <div className="asset-admin-form-grid">
                <label className="asset-admin-field">
                  <span>Asset Name</span>
                  <select name="assetName" value={formData.assetName} onChange={handleInputChange} disabled={isLoadingOptions}>
                    <option value="">{isLoadingOptions ? "Loading assets..." : "Select asset"}</option>
                    {assetOptions.map((option) => (
                      <option key={option.id} value={option.assetName}>
                        {option.assetName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="asset-admin-field">
                  <span>Serial Number</span>
                  <input
                    name="serialNumber"
                    type="text"
                    value={formData.serialNumber}
                    readOnly
                    disabled
                    placeholder="Auto-filled if available"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Available Quantity</span>
                  <input
                    name="availableQuantity"
                    type="text"
                    value={formData.availableQuantity}
                    readOnly
                    disabled
                    placeholder="Auto-filled from selected asset"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Assigned Quantity</span>
                  <input
                    name="assignedQuantity"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.assignedQuantity}
                    onChange={handleInputChange}
                    placeholder="Enter assigned quantity"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Responsible User</span>
                  <select name="assignedTo" value={formData.assignedTo} onChange={handleInputChange} disabled={isLoadingOptions}>
                    <option value="">{isLoadingOptions ? "Loading users..." : "Select user"}</option>
                    {userOptions.map((option) => (
                      <option key={option.id} value={option.name}>
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
                    readOnly
                    disabled
                    placeholder="Auto-filled from user"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Location</span>
                  <select name="location" value={formData.location} onChange={handleInputChange} disabled={isLoadingOptions}>
                    <option value="">{isLoadingOptions ? "Loading locations..." : "Select location"}</option>
                    {locationOptions.map((option) => (
                      <option key={option.id} value={option.locationName}>
                        {option.locationName}
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

              {(optionsError || submitError) && <p className="asset-admin-form-error">{submitError || optionsError}</p>}

              <div className="asset-admin-form-actions">
                <button type="button" className="asset-admin-secondary-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="asset-admin-primary-btn" disabled={isSubmitDisabled || isLoadingOptions || isSaving}>
                  {isSaving ? "Saving..." : editingMappingId ? "Update Mapping" : "Save Mapping"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminModulePage>
  );
}
