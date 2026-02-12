import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer>
            <div className="footer-content">
                <p>© 2023 Книжный магазин "Книжный мир". Все права защищены.</p>
                <ul className="footer-links">
                    <li><a href="#">Политика конфиденциальности</a></li>
                    <li><a href="#">Условия использования</a></li>
                    <li><a href="#">Доставка и оплата</a></li>
                    <li><a href="#">Контакты</a></li>
                </ul>
            </div>
        </footer>
    );
};

export default Footer;