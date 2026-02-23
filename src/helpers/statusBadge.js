export const getStatusBadge = (value, fallbackLabel = "Pending Approval") => {
    const normalized =
        typeof value === "string" ? value.trim().toLowerCase() : "";
    if (!normalized) {
        return { label: fallbackLabel, bg: "#E2E8F0", color: "#475569" };
    }
    if (normalized === "active") {
        return { label: "Active", bg: "#DBEAFE", color: "#2563EB" };
    }
    if (normalized === "rejected") {
        return { label: "Rejected", bg: "#FEE2E2", color: "#DC2626" };
    }
    if (normalized === "under-review-by-manager") {
        return { label: "Partially Approved", bg: "#FEF3C7", color: "#B45309" };
    }
    if (normalized === "under-review-by-admin") {
        return { label: "Approved", bg: "#DCFCE7", color: "#16A34A" };
    }
    return { label: fallbackLabel, bg: "#E2E8F0", color: "#475569" };
};

