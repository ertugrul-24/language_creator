import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home, Languages, Dictionary, Grammar, Courses } from '@/pages';
import './styles/globals.css';

/**
 * App - Main application component with routing
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/languages" element={<Languages />} />
        <Route path="/dictionary" element={<Dictionary />} />
        <Route path="/grammar" element={<Grammar />} />
        <Route path="/courses" element={<Courses />} />
      </Routes>
    </Router>
  );
}

export default App;
