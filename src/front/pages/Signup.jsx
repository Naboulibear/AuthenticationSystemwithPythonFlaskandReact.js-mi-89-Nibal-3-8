import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const navigate = useNavigate();

const handleSubmit = async (e) => {
e.preventDefault();
setError("");

try {
const response = await fetch("/api/signup", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ email, password })
});

const data = await response.json();
if (!response.ok) {
setError(data.message || "Unable to sign up");
return;
}

navigate("/login");
} catch (requestError) {
setError("Network error");
}
};

return (
<div className="container mt-5">
<div className="row justify-content-center">
<div className="col-md-6">
<h1 className="text-center mb-4">Sign Up</h1>
{error && <div className="alert alert-danger">{error}</div>}
<form onSubmit={handleSubmit}>
<div className="mb-3">
<input
type="email"
className="form-control"
placeholder="Email"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
/>
</div>
<div className="mb-3">
<input
type="password"
className="form-control"
placeholder="Password"
value={password}
onChange={(e) => setPassword(e.target.value)}
required
/>
</div>
<button type="submit" className="btn btn-primary w-100">Sign Up</button>
</form>
<p className="text-center mt-3">
Already have an account? <Link to="/login">Login</Link>
</p>
</div>
</div>
</div>
);
};

export default Signup;
