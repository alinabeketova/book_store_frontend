import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import "./Cart.css"

const Cart = () => {
  return (
    <div className="empty-state">
      <FaShoppingCart size={64} />
      <h3>Корзина пуста</h3>
      <p>Добавьте товары для покупки в корзину</p>
    </div>
  );
};

export default Cart;