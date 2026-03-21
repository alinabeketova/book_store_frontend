import React, { useState } from 'react';
import './Filters.css';

const Filters = () => {
  const [activeFilter, setActiveFilter] = useState('Все');

  const filters = ['Все', 'Художественная', 'Фантастика', 'Детективы', 'Бизнес', 'Детские'];

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    console.log('Фильтр:', filter);
  };

  return (
    <div className="controls">
      <div className="filter-buttons">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => handleFilterClick(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Filters;