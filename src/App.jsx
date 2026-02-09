import React from 'react';
import './App.css';
import Navbar from './components/layout/Navbar/Navbar';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Footer from './components/layout/Footer/Footer';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Profile from './pages/Profile/Profile';
import BookPage from './pages/Book/Book';

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
          <Routes>
            <Route path="/"  element={<Home />}/>
            <Route path="/login"  element={<Login />}/>
            <Route path="/profile"  element={<Profile />}/>
             <Route path="/book/:id" element={<BookPage />} />
          </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;