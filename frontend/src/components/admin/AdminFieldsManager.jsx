import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { API_URL } from "../../utils/api";
import { getToken } from "../../utils/auth";
import ErrorMessage from "../ErrorMessage";
import { SkeletonAdminTable } from "../Skeleton";
import AdminFieldForm from "./AdminFieldForm";

function AdminFieldsManager() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingField, setEditingField] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadFields();
  }, []);

  async function loadFields() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_URL + "/admin/fields", {
        headers: { Authorization: "Bearer " + getToken() },
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.mesaj || "Eroare.");
        return;
      }
      setFields(data);
    } catch {
      setError("Eroare conexiune.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(field) {
    if (
      !window.confirm(
        `Ștergi terenul "${field.name}"? Acțiunea e ireversibilă.`,
      )
    )
      return;

    try {
      const response = await fetch(API_URL + "/admin/fields/" + field.id, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + getToken() },
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.mesaj || "Eroare la ștergere.");
        return;
      }

      alert("Teren șters cu succes!");
      loadFields();
    } catch {
      alert("Eroare conexiune.");
    }
  }

  function handleFormSuccess() {
    setEditingField(null);
    setShowAddForm(false);
    loadFields();
  }

  if (loading) return <SkeletonAdminTable rows={4} cols={5} />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Gestionare Terenuri ({fields.length})</h2>
        {!showAddForm && !editingField && (
          <button className="btn-primary" onClick={() => setShowAddForm(true)}>
            + Adaugă teren nou
          </button>
        )}
      </div>

      {showAddForm && (
        <AdminFieldForm
          field={null}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingField && (
        <AdminFieldForm
          field={editingField}
          onSuccess={handleFormSuccess}
          onCancel={() => setEditingField(null)}
        />
      )}

      {!showAddForm && !editingField && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nume</th>
                <th>Locație</th>
                <th>Preț/oră</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.id}>
                  <td>{field.id}</td>
                  <td>{field.name}</td>
                  <td>{field.location}</td>
                  <td>{field.price_per_hour} lei</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => setEditingField(field)}
                    >
                      <Pencil size={13} strokeWidth={2.5} /> Editează
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(field)}
                    >
                      <Trash2 size={13} strokeWidth={2.5} /> Șterge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminFieldsManager;
