import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/tenants.css";
import Navbar from "../components/Navbar";

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const res = await api.get("/tenants");
        setTenants(res.data.data.tenants);
      } catch (err) {
        setError("Failed to load tenants");
      } finally {
        setLoading(false);
      }
    };

    loadTenants();
  }, []);

  if (loading) return <p className="page-loading">Loading tenants...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <>
    <Navbar />
    <div className="tenants-page">
      <h1 className="page-title">All Tenants</h1>

      <div className="tenants-grid">
        {tenants.map((t) => (
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
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
