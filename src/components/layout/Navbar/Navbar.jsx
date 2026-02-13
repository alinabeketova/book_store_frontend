import React from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';
import { 
  FaBook, 
  FaMapMarkerAlt, 
  FaBars, 
  FaSearch, 
  FaUser, 
  FaClipboardList, 
  FaHeart, 
  FaShoppingCart 
} from 'react-icons/fa';

const Navbar = () => {
    return (
        <div className="navbar">
            <div>
                <div className="city">
                    <FaMapMarkerAlt />
                    Россия, Москва
                </div>
                <div className="logo">
                    <FaBook />
                    <Link to="/">Книжный</Link>
                </div>
            </div>
            <button className="catalog-btn">
                <FaBars />
                Каталог
            </button>
            <div className="search">
                <input id="searchInput" placeholder="Найти книгу..." />
                <button>
                    <FaSearch />
                </button>
            </div>
            <div className="icons">
                <div>
                    <FaUser />
                    <Link to="/login"><span>Профиль</span></Link>
                </div>
                <div>
                    <FaClipboardList />
                    <span>Заказы</span>
                </div>
                <div id="favoritesIcon">
                    <FaHeart />
                    <span>Избранное</span>
                </div>
                <div>
                    <FaShoppingCart />
                    <span>Корзина</span>
                </div>
            </div>
        </div>
    );
};

export default Navbar;