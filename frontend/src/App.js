import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import MapView from './pages/MapView';
import ReportComplaint from './pages/ReportComplaint';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<MapView />} />
        <Route path="/login" element={<Login />} />
        <Route path="/report" element={token ? <ReportComplaint /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;