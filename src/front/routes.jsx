import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Private from "./pages/Private.jsx";
import { StoreProvider } from "./useGlobalReducer";

const AppRoutes = () => {
return (
<StoreProvider>
<Router>
<Navbar />
<Routes>
<Route path="/" element={<Home />} />
<Route path="/signup" element={<Signup />} />
<Route path="/login" element={<Login />} />
<Route path="/private" element={<Private />} />
</Routes>
</Router>
</StoreProvider>
);
};

export default AppRoutes;
