import React from "react";
import { Link } from "react-router-dom";
import { useGlobalReducer } from "../useGlobalReducer";

const Home = () => {
const { store } = useGlobalReducer();

return (
<div className="container mt-5 text-center">
<h1>Welcome to Authentication System</h1>
<p className="lead">A secure login and signup system built with React and Flask</p>
{store.isAuthenticated ? (
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

export default Home;
