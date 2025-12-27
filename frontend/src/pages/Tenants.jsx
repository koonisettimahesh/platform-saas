import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/tenants.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const role = user?.role;
  const [editingTenant, setEditingTenant] = useState(null);
  const [formData, setFormData] = useState({});
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const res = await api.get("/tenants");
        setTenants(res.data.data.tenants);
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Failed to load tenants");
      } finally {
        setLoading(false);
      }
    };

    loadTenants();
  }, []);
  const handleUpdate = async () => {
    try {
      await api.put(`/tenants/${editingTenant.id}`, formData);

      setTenants((prev) =>
        prev.map((t) => (t.id === editingTenant.id ? { ...t, ...formData } : t))
      );

      setEditingTenant(null);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Failed to update tenant");
    }
  };
  const filteredTenants = tenants.filter((t) => {
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;

    const matchesPlan =
      planFilter === "ALL" || t.subscriptionPlan?.toUpperCase() === planFilter;

    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesPlan && matchesSearch;
  });

  if (loading) return <p className="page-loading">Loading tenants...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <>
      <Navbar />
      <div className="tenants-page">
        <div className="tenants-filters">
          <input
            type="text"
            placeholder="Search tenant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="ALL">All Plans</option>
            <option value="FREE">Free</option>
            <option value="PRO">Pro</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </div>

        <h1 className="page-title">All Tenants</h1>

        <div className="tenants-grid">
          {filteredTenants.map((t) => (
            <div key={t.id} className="tenant-card">
              <div className="tenant-header">
                <h3>{t.name}</h3>
                <span className={`status ${t.status}`}>
                  {t.status.toUpperCase()}
                </span>
              </div>

              <p className="subdomain">
                <strong>Subdomain:</strong> {t.subdomain}
              </p>

              <div className="badges">
                <span className={`plan ${t.subscriptionPlan}`}>
                  {t.subscriptionPlan.toUpperCase()} PLAN
                </span>
              </div>

              <div className="stats">
                <div>
                  <span className="stat-number">{t.totalUsers}</span>
                  <span className="stat-label">Users</span>
                </div>
                <div>
                  <span className="stat-number">{t.totalProjects}</span>
                  <span className="stat-label">Projects</span>
                </div>
              </div>
              {role === "super_admin" && (
                <button
                  className="edit-btn"
                  onClick={() => {
                    setEditingTenant(t);
                    setFormData(t);
                  }}
                >
                  Edit
                </button>
              )}
            </div>
          ))}
          {filteredTenants.length === 0 && (
            <p className="empty-text">No tenants match your filters</p>
          )}
        </div>
      </div>
      {editingTenant && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Edit Tenant</h2>

            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Tenant Name"
            />

            <input
              value={formData.subdomain}
              onChange={(e) =>
                setFormData({ ...formData, subdomain: e.target.value })
              }
              placeholder="Subdomain"
            />

            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="active">Active</option>
              <option value="suspended">Inactive</option>
            </select>

            <select
              value={formData.subscriptionPlan}
              onChange={(e) =>
                setFormData({ ...formData, subscriptionPlan: e.target.value })
              }
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <div className="modal-actions">
              <button onClick={handleUpdate}>Save</button>
              <button onClick={() => setEditingTenant(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
