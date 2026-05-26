import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Private = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if token exists in sessionStorage
        const token = sessionStorage.getItem('token');
        const userData = sessionStorage.getItem('user');

        if (!token) {
            // No token, redirect to login
            navigate('/login');
            return;
        }

        // Set user data if available
        if (userData) {
            setUser(JSON.parse(userData));
        }

        setLoading(false);
    }, [navigate]);

    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="card-title">Welcome to Private Area</h2>
                            {user && (
                                <div>
                                    <p className="card-text">Logged in as: <strong>{user.email}</strong></p>
                                    <p className="card-text">User ID: {user.id}</p>
                                    <p className="card-text">Status: {user.is_active ? 'Active' : 'Inactive'}</p>
                                </div>
                            )}
                            <p className="card-text">This is a protected page that only authenticated users can access.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
