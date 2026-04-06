import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminModulePage from "../../components/asset-admin/admin-module-page";
import { IoMdCopy } from "react-icons/io";
import tickIcon from "../../assets/icons/tick.png";
import useAxiosPrivate from "../../services/hooks/useaxios-private";

interface CredentialRecord {
  id: string;
  name: string;
  source: string;
  username: string;
  password: string;
  passwordPreview: string;
  category: string;
  notes: string;
  updatedOn: string;
}

interface CredentialFormState {
  name: string;
  source: string;
  username: string;
  password: string;
  category: string;
  notes: string;
}

interface CredentialDisplayRow extends CredentialRecord {
  sourceCell: React.ReactNode;
  usernameCell: React.ReactNode;
  passwordCell: React.ReactNode;
}

const emptyFormState: CredentialFormState = {
  name: "",
  source: "",
  username: "",
  password: "",
  category: "",
  notes: "",
};

const maskPassword = (password: string) => (password.trim() ? "•".repeat(Math.max(8, password.trim().length)) : "");

const copyIconButtonStyle: React.CSSProperties = {
  width: "32px",
  height: "32px",
  borderRadius: "10px",
  border: "1px solid rgba(148, 163, 184, 0.24)",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  color: "#0f766e",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  padding: 0,
  flexShrink: 0,
};

const truncateCellText = (value: string) =>
  value.length > 10 ? `${value.slice(0, 10)}...` : value;

const buildCopyCell = (
  value: string,
  label: string,
  copiedValue: string,
  handleCopy: (value: string, label: string) => void
) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
    <span title={value}>{truncateCellText(value || "Not set")}</span>
    <button
      type="button"
      style={copyIconButtonStyle}
      onClick={() => handleCopy(value, label)}
      aria-label={`Copy ${label}`}
      title={copiedValue === label ? "Copied" : "Copy"}
      disabled={!value.trim()}
    >
      {copiedValue === label ? (
        <img src={tickIcon} alt="Copied" style={{ width: "16px", height: "16px" }} />
      ) : (
        <IoMdCopy />
      )}
    </button>
  </div>
);

export default function CredentialManagerPage() {
  const axiosPrivate = useAxiosPrivate();
  const [rows, setRows] = useState<CredentialRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingCredential, setViewingCredential] = useState<CredentialRecord | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [formData, setFormData] = useState<CredentialFormState>(emptyFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [copiedValue, setCopiedValue] = useState("");

  const mapCredentialRecord = useCallback((credential: any): CredentialRecord => ({
    id: String(credential?.id ?? credential?.credentialId ?? ""),
    name: credential?.name ?? credential?.credentialName ?? "",
    source: credential?.source ?? "",
    username: credential?.username ?? credential?.userName ?? "",
    password: credential?.password ?? "",
    passwordPreview: maskPassword(credential?.password ?? ""),
    category: credential?.category ?? credential?.type ?? "",
    notes: credential?.notes ?? credential?.description ?? "",
    updatedOn:
      typeof credential?.updatedAt === "string" && credential.updatedAt
        ? credential.updatedAt.slice(0, 10)
        : typeof credential?.updatedOn === "string" && credential.updatedOn
          ? credential.updatedOn.slice(0, 10)
          : new Date().toISOString().slice(0, 10),
  }), []);

  const fetchCredentials = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      // axios baseURL already includes `/v1`, so this hits `GET /v1/assets/credentials`.
      const response = await axiosPrivate.get("/assets/credentials");
      const payload = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data?.credentials)
          ? response.data.credentials
          : Array.isArray(response.data)
            ? response.data
            : [];

      setRows(payload.map(mapCredentialRecord).filter((credential: CredentialRecord) => credential.id !== ""));
    } catch (error: any) {
      setRows([]);
      setLoadError(error?.response?.data?.message || "Failed to load credentials. Check the API and try again.");
      console.error("Failed to fetch credentials:", error);
    } finally {
      setIsLoading(false);
    }
  }, [axiosPrivate, mapCredentialRecord]);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const metrics = useMemo(
    () => [
      { label: "Stored Credentials", value: rows.length, helper: "Loaded from the credential vault API" },
      { label: "Sources", value: new Set(rows.map((row) => row.source).filter(Boolean)).size, helper: "Platforms currently tracked" },
      { label: "Categories", value: new Set(rows.map((row) => row.category).filter(Boolean)).size, helper: "Credential groups in use" },
      { label: "Latest Update", value: rows[0]?.updatedOn ?? "-", helper: "Most recent credential change" },
    ],
    [rows]
  );

  const availableCategories = useMemo(
    () => Array.from(new Set(rows.map((row) => row.category).filter(Boolean))),
    [rows]
  );

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesCategory = categoryFilter === "All Categories" || row.category === categoryFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [row.name, row.source, row.username, row.category, row.notes]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, rows, searchTerm]);

  const handleCopy = useCallback(async (value: string, label: string) => {
    if (!value.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(label);
      window.setTimeout(() => {
        setCopiedValue((current) => (current === label ? "" : current));
      }, 1600);
    } catch (error) {
      console.error("Failed to copy credential value:", error);
    }
  }, []);

  const displayRows = useMemo<CredentialDisplayRow[]>(
    () =>
      filteredRows.map((row) => ({
        ...row,
        sourceCell: buildCopyCell(row.source, `source-${row.id}`, copiedValue, handleCopy),
        usernameCell: buildCopyCell(row.username, `username-${row.id}`, copiedValue, handleCopy),
        passwordCell: (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span title={row.passwordPreview}>{truncateCellText(row.passwordPreview)}</span>
            <button
              type="button"
              style={copyIconButtonStyle}
              onClick={() => handleCopy(row.password, `password-${row.id}`)}
              aria-label="Copy password"
              title={copiedValue === `password-${row.id}` ? "Copied" : "Copy"}
              disabled={!row.password.trim()}
            >
              {copiedValue === `password-${row.id}` ? (
                <img src={tickIcon} alt="Copied" style={{ width: "16px", height: "16px" }} />
              ) : (
                <IoMdCopy />
              )}
            </button>
          </div>
        ),
      })),
    [copiedValue, filteredRows, handleCopy]
  );

  const resetForm = useCallback(() => {
    setFormData(emptyFormState);
    setSubmitError("");
  }, []);

  const closeModal = useCallback(() => {
    if (isSaving) {
      return;
    }
    setIsModalOpen(false);
    setEditingId(null);
    resetForm();
  }, [isSaving, resetForm]);

  const closeViewModal = useCallback(() => {
    setViewingCredential(null);
  }, []);

  useEffect(() => {
    if (!isModalOpen && !viewingCredential) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (viewingCredential) {
          closeViewModal();
          return;
        }
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal, closeViewModal, isModalOpen, viewingCredential]);

  const openAddModal = () => {
    if (isSaving || isDeletingId !== null) {
      return;
    }
    setEditingId(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (row: CredentialRecord) => {
    if (isSaving || isDeletingId !== null) {
      return;
    }
    setEditingId(row.id);
    setFormData({
      name: row.name,
      source: row.source,
      username: row.username,
      password: row.password,
      category: row.category,
      notes: row.notes,
    });
    setSubmitError("");
    setIsModalOpen(true);
  };

  const openViewModal = (row: CredentialRecord) => {
    setViewingCredential(row);
  };

  const handleDelete = async (id: string) => {
    setIsDeletingId(id);

    try {
      // axios baseURL already includes `/v1`, so this hits `DELETE /v1/assets/credentials/:id`.
      await axiosPrivate.delete(`/assets/credentials/${id}`);
      setRows((current) => current.filter((row) => row.id !== id));

      if (viewingCredential?.id === id) {
        closeViewModal();
      }
    } catch (error: any) {
      console.error("Failed to delete credential:", error);
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (submitError) {
      setSubmitError("");
    }
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedForm: CredentialFormState = {
      name: formData.name.trim(),
      source: formData.source.trim(),
      username: formData.username.trim(),
      password: formData.password.trim(),
      category: formData.category.trim(),
      notes: formData.notes.trim(),
    };

    if ([trimmedForm.name, trimmedForm.source, trimmedForm.username, trimmedForm.password].some((value) => value === "")) {
      setSubmitError("Name, source, username, and password are required.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingId) {
        // axios baseURL already includes `/v1`, so this hits `PUT /v1/assets/credentials/:id`.
        await axiosPrivate.put(`/assets/credentials/${editingId}`, trimmedForm);
      } else {
        // axios baseURL already includes `/v1`, so this hits `POST /v1/assets/credentials`.
        await axiosPrivate.post("/assets/credentials", trimmedForm);
      }

      await fetchCredentials();
      setIsModalOpen(false);
      setEditingId(null);
      resetForm();
    } catch (error: any) {
      setSubmitError(error?.response?.data?.message || "Failed to save credential. Check the API and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const tableControls = (
    <>
      <input
        type="search"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Search name, source, username, or notes"
      />
      <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
        <option>All Categories</option>
        {availableCategories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </>
  );

  return (
    <AdminModulePage
      title="Credential Manager"
      subtitle="Store and review operational credentials by system, source, and account owner using the live credential vault API."
      actionLabel="Add Credential"
      onActionClick={openAddModal}
      renderRowActions={(row) => (
        <>
          <button
            type="button"
            className="asset-admin-secondary-btn"
            onClick={() => openViewModal(row as CredentialRecord)}
          >
            View
          </button>
          <button
            type="button"
            className="asset-admin-secondary-btn"
            onClick={() => openEditModal(row as CredentialRecord)}
          >
            Edit
          </button>
          <button
            type="button"
            className="asset-admin-danger-btn"
            onClick={() => handleDelete((row as CredentialRecord).id)}
            disabled={isDeletingId === (row as CredentialRecord).id}
          >
            {isDeletingId === (row as CredentialRecord).id ? "Deleting..." : "Delete"}
          </button>
        </>
      )}
      metrics={metrics}
      columns={[
        { key: "name", label: "Name" },
        { key: "sourceCell", label: "Source" },
        { key: "usernameCell", label: "Username" },
        { key: "passwordCell", label: "Password" },
        { key: "category", label: "Category" },
        { key: "updatedOn", label: "Updated On" },
      ]}
      rows={displayRows}
      totalRowCount={rows.length}
      tableControls={tableControls}
      emptyState={{
        title: isLoading ? "Loading credentials" : loadError ? "Unable to load credentials" : "No credentials saved",
        description: isLoading
          ? "Fetching credentials from the backend."
          : loadError
            ? loadError
            : "Add your first credential record to start organizing system access.",
      }}
    >
      {viewingCredential && (
        <div className="asset-admin-modal-backdrop" onClick={closeViewModal}>
          <div
            className="asset-admin-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="credential-manager-view-title"
          >
            <div className="asset-admin-modal-header">
              <div>
                <p className="asset-admin-modal-kicker">Credential Details</p>
                <h3 id="credential-manager-view-title">{viewingCredential.name}</h3>
              </div>
              <button type="button" className="asset-admin-modal-close" onClick={closeViewModal} aria-label="Close credential details popup">
                x
              </button>
            </div>

            <div className="asset-admin-form">
              <div className="asset-admin-form-grid">
                <div className="asset-admin-field">
                  <span>Name</span>
                  <strong>{viewingCredential.name}</strong>
                </div>
                <div className="asset-admin-field">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span>Source</span>
                    <button
                      type="button"
                      style={copyIconButtonStyle}
                      onClick={() => handleCopy(viewingCredential.source, `view-source-${viewingCredential.id}`)}
                      aria-label="Copy source"
                      title={copiedValue === `view-source-${viewingCredential.id}` ? "Copied" : "Copy source"}
                    >
                      {copiedValue === `view-source-${viewingCredential.id}` ? (
                        <img src={tickIcon} alt="Copied" style={{ width: "16px", height: "16px" }} />
                      ) : (
                        <IoMdCopy />
                      )}
                    </button>
                  </div>
                  <strong>{viewingCredential.source}</strong>
                </div>
                <div className="asset-admin-field">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span>Username</span>
                    <button
                      type="button"
                      style={copyIconButtonStyle}
                      onClick={() => handleCopy(viewingCredential.username, `view-username-${viewingCredential.id}`)}
                      aria-label="Copy username"
                      title={copiedValue === `view-username-${viewingCredential.id}` ? "Copied" : "Copy username"}
                    >
                      {copiedValue === `view-username-${viewingCredential.id}` ? (
                        <img src={tickIcon} alt="Copied" style={{ width: "16px", height: "16px" }} />
                      ) : (
                        <IoMdCopy />
                      )}
                    </button>
                  </div>
                  <strong>{viewingCredential.username}</strong>
                </div>
                <div className="asset-admin-field">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span>Password</span>
                    <button
                      type="button"
                      style={copyIconButtonStyle}
                      onClick={() => handleCopy(viewingCredential.password, `view-password-${viewingCredential.id}`)}
                      aria-label="Copy password"
                      title={copiedValue === `view-password-${viewingCredential.id}` ? "Copied" : "Copy password"}
                    >
                      {copiedValue === `view-password-${viewingCredential.id}` ? (
                        <img src={tickIcon} alt="Copied" style={{ width: "16px", height: "16px" }} />
                      ) : (
                        <IoMdCopy />
                      )}
                    </button>
                  </div>
                  <strong>{viewingCredential.password}</strong>
                </div>
                <div className="asset-admin-field">
                  <span>Category</span>
                  <strong>{viewingCredential.category || "Not set"}</strong>
                </div>
                <div className="asset-admin-field">
                  <span>Updated On</span>
                  <strong>{viewingCredential.updatedOn}</strong>
                </div>
                <div className="asset-admin-field">
                  <span>Notes</span>
                  <strong>{viewingCredential.notes || "No notes added"}</strong>
                </div>
              </div>

              <div className="asset-admin-form-actions">
                <button type="button" className="asset-admin-secondary-btn" onClick={closeViewModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="asset-admin-modal-backdrop" onClick={closeModal}>
          <div
            className="asset-admin-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="credential-manager-modal-title"
          >
            <div className="asset-admin-modal-header">
              <div>
                <p className="asset-admin-modal-kicker">{editingId ? "Edit Credential" : "New Credential"}</p>
                <h3 id="credential-manager-modal-title">{editingId ? "Update Credential" : "Add Credential"}</h3>
              </div>
              <button type="button" className="asset-admin-modal-close" onClick={closeModal} aria-label="Close credential popup">
                x
              </button>
            </div>

            <form className="asset-admin-form" onSubmit={handleSubmit}>
              <div className="asset-admin-form-grid">
                <label className="asset-admin-field">
                  <span>Name</span>
                  <input name="name" type="text" value={formData.name} onChange={handleInputChange} placeholder="AWS Root, VPN Admin, Router Login" />
                </label>

                <label className="asset-admin-field">
                  <span>Source</span>
                  <input name="source" type="text" value={formData.source} onChange={handleInputChange} placeholder="AWS, GitHub, Firewall, Domain Controller" />
                </label>

                <label className="asset-admin-field">
                  <span>Username</span>
                  <input name="username" type="text" value={formData.username} onChange={handleInputChange} placeholder="Enter username" />
                </label>

                <label className="asset-admin-field">
                  <span>Password</span>
                  <input name="password" type="text" value={formData.password} onChange={handleInputChange} placeholder="Enter password" />
                </label>

                <label className="asset-admin-field">
                  <span>Category</span>
                  <input name="category" type="text" value={formData.category} onChange={handleInputChange} placeholder="Infrastructure, Cloud, Network, App" />
                </label>

                <label className="asset-admin-field">
                  <span>Notes</span>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Optional notes, rotation hints, or owner details" rows={4} />
                </label>
              </div>

              {submitError && <p className="asset-admin-form-error">{submitError}</p>}

              <div className="asset-admin-form-actions">
                <button type="button" className="asset-admin-secondary-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="asset-admin-primary-btn" disabled={isSaving}>
                  {isSaving ? "Saving..." : editingId ? "Update Credential" : "Save Credential"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminModulePage>
  );
}
