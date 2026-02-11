import React, { useState, useEffect, useCallback } from 'react';
import './Carousel.css';
import { FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa';

import slide1 from '../../../assets/images/Carousel/1.jpg';
import slide2 from '../../../assets/images/Carousel/2.jpg';
import slide3 from '../../../assets/images/Carousel/3.jpg';
import slide4 from '../../../assets/images/Carousel/4.jpg';


const slides = [
    {
        id: 1,
        image: slide1
    },
    {
        id: 2,
        image: slide2
    },
    {
        id: 3,
        image: slide3
    },
    {
        id: 4,
        image: slide4
    }
];


const Carousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [nextSlide]);

    return (
        <div className="carousel-container">
            <div className="carousel">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                        style={{
                            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${slide.image}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                    </div>
                ))}

                <button className="carousel-btn prev" onClick={prevSlide}>
                    <FaChevronLeft />
                </button>
                <button className="carousel-btn next" onClick={nextSlide}>
                    <FaChevronRight />
                </button>

                <div className="carousel-dots">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`dot ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Перейти к слайду ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Carousel; 