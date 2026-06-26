import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAdmin } from "../utils/auth";

function AdminRoute({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) {
      alert("Acces interzis. Doar administratorii pot accesa această pagină.");
      navigate("/");
    }
  }, []);

  if (!isAdmin()) return null;

  return children;
}

export default AdminRoute;
