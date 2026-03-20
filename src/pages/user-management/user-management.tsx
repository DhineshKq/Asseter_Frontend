import React from "react";
import AdminModulePage from "../../components/asset-admin/admin-module-page";
import { users } from "../../data/asset-admin-data";

export default function UserManagementPage() {
  return (
    <AdminModulePage
      title="User Module"
      subtitle="Admin can create and maintain users who receive, handle, or administer assets across teams."
      actionLabel="Add User"
      metrics={[
        { label: "Users", value: users.length, helper: "Current sample records" },
        { label: "IT Admins", value: users.filter((item) => item.role === "IT Admin").length, helper: "Administrative access" },
        { label: "Active Status", value: users.filter((item) => item.status === "Active").length, helper: "Currently active users" },
      ]}
      columns={[
        { key: "employeeId", label: "Employee ID" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role" },
        { key: "team", label: "Team" },
        { key: "status", label: "Status" },
      ]}
      rows={users}
    />
  );
}
