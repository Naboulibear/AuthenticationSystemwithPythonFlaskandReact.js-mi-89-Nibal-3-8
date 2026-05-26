import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Private = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return navigate('/login');

    const verifyToken = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/user', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          sessionStorage.removeItem('token');
          return navigate('/login');
        }

        const userData = await response.json();
        setUser(userData);
        setLoading(false);
      } catch (err) {
        navigate('/login');
      }
    };

    verifyToken();
  }, [navigate]);

  if (loading) return <div className="container mt-5">Loading...</div>;

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <h1>Welcome {user?.email}</h1>
          <button className="btn btn-danger mt-4" onClick={() => { sessionStorage.clear(); navigate('/login'); }}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Private;
