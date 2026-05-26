import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (!email || !password) {
			setError("Please fill in all fields");
			return;
		}

		try {
			const response = await fetch(`http://localhost:3001/api/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			if (!response.ok) {
				const data = await response.json();
				setError(data.message || "Login failed");
				return;
			}

			const data = await response.json();
			
			// Save token to sessionStorage
			sessionStorage.setItem("token", data.token);
			sessionStorage.setItem("user", JSON.stringify(data.user));

			// Redirect to private page
			navigate("/private");
		} catch (err) {
			setError("Network error. Make sure backend is running on port 3001");
			console.error(err);
		}
	};

	return (
		<div className="container mt-5">
			<div className="row justify-content-center">
				<div className="col-md-6">
					<h1 className="text-center mb-4">Login</h1>
					{error && <div className="alert alert-danger" role="alert">{error}</div>}
					<form onSubmit={handleSubmit}>
						<div className="mb-3">
							<label htmlFor="email" className="form-label">Email</label>
							<input
								type="email"
								className="form-control"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Enter your email"
							/>
						</div>
						<div className="mb-3">
							<label htmlFor="password" className="form-label">Password</label>
							<input
								type="password"
								className="form-control"
								id="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter your password"
							/>
						</div>
						<button type="submit" className="btn btn-primary w-100">Login</button>
					</form>
					<p className="text-center mt-3">
						Don't have an account? <a href="/signup">Sign up here</a>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Login;
