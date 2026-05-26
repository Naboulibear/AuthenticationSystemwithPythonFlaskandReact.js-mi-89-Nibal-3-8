import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Private from "../js/component/private.jsx";

const Navbar = () => {
	const navigate = useNavigate();
	const token = sessionStorage.getItem("token");

	const handleLogout = () => {
		sessionStorage.removeItem("token");
		sessionStorage.removeItem("user");
		navigate("/login");
	};

	return (
		<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
			<div className="container-fluid">
				<Link className="navbar-brand" to="/">Authentication System</Link>
				<div className="navbar-nav ms-auto">
					{token ? (
						<button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
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

const Landing = () => {
	const token = sessionStorage.getItem("token");

	return (
		<div className="container mt-5 text-center">
			<h1>Welcome to Authentication System</h1>
			<p className="lead">A secure login and signup system built with React and Flask</p>
			{token ? (
				<Link to="/private" className="btn btn-primary btn-lg">Go to Dashboard</Link>
			) : (
				<>
					<Link to="/login" className="btn btn-primary btn-lg me-2">Login</Link>
					<Link to="/signup" className="btn btn-success btn-lg">Signup</Link>
				</>
			)}
		</div>
	);
};

const AppRoutes = () => {
	return (
		<Router>
			<Navbar />
			<Routes>
				<Route path="/" element={<Landing />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/login" element={<Login />} />
				<Route path="/private" element={<Private />} />
			</Routes>
		</Router>
	);
};

export default AppRoutes;
