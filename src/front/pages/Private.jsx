import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalReducer } from "../useGlobalReducer";

const Private = () => {
const [loading, setLoading] = useState(true);
const [user, setUser] = useState(null);
const navigate = useNavigate();
const { store, dispatch } = useGlobalReducer();

useEffect(() => {
if (!store.token) {
navigate("/login");
return;
}

const validateSession = async () => {
try {
const response = await fetch("/api/private", {
headers: {
Authorization: `Bearer ${store.token}`
}
});

if (!response.ok) {
dispatch({ type: "LOGOUT" });
navigate("/login");
return;
}

const data = await response.json();
setUser(data.user);
setLoading(false);
} catch (error) {
dispatch({ type: "LOGOUT" });
navigate("/login");
}
};

validateSession();
}, [dispatch, navigate, store.token]);

if (loading) {
return <div className="container mt-5">Loading...</div>;
}

return (
<div className="container mt-5">
<div className="row">
<div className="col-md-8 mx-auto">
<h1>Private Dashboard</h1>
<p className="lead">Welcome {user?.email}</p>
</div>
</div>
</div>
);
};

export default Private;
