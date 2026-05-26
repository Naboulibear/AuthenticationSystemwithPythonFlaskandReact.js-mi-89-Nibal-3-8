import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalReducer } from "../useGlobalReducer";

const Navbar = () => {
const navigate = useNavigate();
const { store, dispatch } = useGlobalReducer();

const handleLogout = async () => {
if (store.token) {
try {
await fetch("/api/logout", {
method: "POST",
headers: {
Authorization: `Bearer ${store.token}`
}
});
} catch (error) {
// Ignore logout request errors and clear local state anyway
}
}

dispatch({ type: "LOGOUT" });
navigate("/");
};

return (
<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
<div className="container-fluid">
<Link className="navbar-brand" to="/">Authentication System</Link>
<div className="navbar-nav ms-auto">
{store.isAuthenticated ? (
<>
<Link className="nav-link" to="/private">Private</Link>
<button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
</>
) : (
<>
<Link className="nav-link" to="/login">Login</Link>
<Link className="nav-link" to="/signup">Signup</Link>
</>
)}
</div>
</div>
</nav>
);
};

export default Navbar;
