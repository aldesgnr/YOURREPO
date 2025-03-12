import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Inspections from './pages/Inspections';
import Analysis from './pages/Analysis';
import Objects from './pages/Objects';
import Knowledge from './pages/Knowledge';
import Settings from './pages/Settings';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/inspections" element={<Inspections />} />
      <Route path="/analysis" element={<Analysis />} />
      <Route path="/objects" element={<Objects />} />
      <Route path="/knowledge" element={<Knowledge />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
};

export default AppRoutes;
