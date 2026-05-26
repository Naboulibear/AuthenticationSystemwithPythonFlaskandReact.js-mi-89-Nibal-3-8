import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
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
			const response = await fetch(`/api/signup`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			if (!response.ok) {
				const data = await response.json();
				setError(data.message || "Signup failed");
				return;
			}

			// Signup successful, redirect to login
			navigate("/login");
		} catch (err) {
			setError("An error occurred. Please try again.");
			console.error(err);
		}
	};

	return (
		<div className="container mt-5">
			<div className="row justify-content-center">
				<div className="col-md-6">
					<h1 className="text-center mb-4">Sign Up</h1>
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
						<button type="submit" className="btn btn-primary w-100">Sign Up</button>
					</form>
					<p className="text-center mt-3">
						Already have an account? <a href="/login">Login here</a>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Signup;
