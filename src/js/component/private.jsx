import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Private = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const token = sessionStorage.getItem("token");

		if (!token) {
			// No token, redirect to login
			navigate("/login");
			return;
		}

		// Optionally verify token with backend
		const verifyToken = async () => {
			try {
				const response = await fetch(`http://localhost:3001/api/user`, {
					headers: {
						"Authorization": `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					// Token invalid, redirect to login
					sessionStorage.removeItem("token");
					sessionStorage.removeItem("user");
					navigate("/login");
					return;
				}

				const userData = sessionStorage.getItem("user");
				setUser(userData ? JSON.parse(userData) : null);
				setLoading(false);
			} catch (err) {
				console.error("Token verification failed:", err);
				navigate("/login");
			}
		};

		verifyToken();
	}, [navigate]);

	const handleLogout = () => {
		sessionStorage.removeItem("token");
		sessionStorage.removeItem("user");
		navigate("/login");
	};

	if (loading) {
		return <div className="container mt-5"><p>Loading...</p></div>;
	}

	return (
		<div className="container mt-5">
			<div className="row">
				<div className="col-md-8 mx-auto">
					<h1 className="mb-4">Welcome to your Dashboard</h1>
					{user && (
						<div className="alert alert-success" role="alert">
							<h4 className="alert-heading">Hello, {user.email}!</h4>
							<p>You are successfully authenticated and logged in.</p>
						</div>
					)}
					<div className="card">
						<div className="card-body">
							<h5 className="card-title">Private Content</h5>
							<p className="card-text">This page is only visible to authenticated users.</p>
							<p className="card-text">Your session is secure and stored in sessionStorage.</p>
						</div>
					</div>
					<button 
						className="btn btn-danger mt-4" 
						onClick={handleLogout}
					>
						Logout
					</button>
				</div>
			</div>
		</div>
	);
};

export default Private;