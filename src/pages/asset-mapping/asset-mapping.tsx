import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminModulePage from "../../components/asset-admin/admin-module-page";
import useAxiosPrivate from "../../services/hooks/useaxios-private";
import { MappingRecord } from "../../data/asset-admin-data";

interface AssetOption {
  id: number;
  assetName: string;
  deviceId: string;
  serialNumber: string;
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

const emptyFormState: MappingRecord = {
  assetName: "",
  deviceId: "",
  serialNumber: "",
  employeeId: "",
  assignedTo: "",
  department: "",
  location: "",
  assignedOn: "",
};

export default function AssetMappingPage() {
  const axiosPrivate = useAxiosPrivate();
  const [rows, setRows] = useState<MappingRecord[]>([]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [formData, setFormData] = useState<MappingRecord>(emptyFormState);
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

  const resetForm = useCallback(() => {
    setFormData(emptyFormState);
    setSubmitError("");
  }, []);

  const closeModal = useCallback(() => {
    if (isSaving) {
      return;
    }
    setIsMapModalOpen(false);
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

  const mapMappingRecord = useCallback(
    (
      mapping: any,
      lookups?: {
        assetsById: Map<number, AssetOption>;
        usersById: Map<number, EmployeeOption>;
        locationsById: Map<number, LocationOption>;
      }
    ): MappingRecord => {
      const assetId = typeof mapping?.assetId === "number" ? mapping.assetId : null;
      const userId = typeof mapping?.userId === "number" ? mapping.userId : null;
      const locationId = typeof mapping?.locationId === "number" ? mapping.locationId : null;
      const matchedAsset = assetId !== null ? lookups?.assetsById.get(assetId) : undefined;
      const matchedUser = userId !== null ? lookups?.usersById.get(userId) : undefined;
      const matchedLocation = locationId !== null ? lookups?.locationsById.get(locationId) : undefined;
      const fullUserName = `${mapping?.user?.firstName ?? ""} ${mapping?.user?.lastName ?? ""}`.trim();

      return {
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
  }, [axiosPrivate, mapMappingRecord]);

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
  }, [axiosPrivate]);

  useEffect(() => {
    fetchMappings();
    fetchMappingOptions();
  }, [fetchMappingOptions, fetchMappings]);

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

    if (!selectedAsset?.id || !selectedUser?.id || !selectedLocation?.id) {
      setSubmitError("Select a valid asset, responsible user, and location before saving the mapping.");
      return;
    }

    setIsSaving(true);
    setSubmitError("");

    try {
      // axios baseURL already includes `/v1`, so this hits `POST /v1/assets/mappings`.
      await axiosPrivate.post("/assets/mappings", {
        assetId: selectedAsset.id,
        locationId: selectedLocation.id,
        userId: selectedUser.id,
        assignedDate: formData.assignedOn,
      });

      await fetchMappings();
      setIsMapModalOpen(false);
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
    formData.deviceId.trim() === "" ||
    formData.assignedTo.trim() === "" ||
    formData.employeeId.trim() === "" ||
    formData.department.trim() === "" ||
    formData.location.trim() === "" ||
    formData.assignedOn.trim() === "";

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
                  <span>Device ID</span>
                  <input
                    name="deviceId"
                    type="text"
                    value={formData.deviceId}
                    readOnly
                    disabled
                    placeholder="Auto-filled from asset"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Serial Number (Optional)</span>
                  <input
                    name="serialNumber"
                    type="text"
                    value={formData.serialNumber}
                    readOnly
                    disabled
                    placeholder="Auto-filled when available"
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
                  {isSaving ? "Saving..." : "Save Mapping"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminModulePage>
  );
}
