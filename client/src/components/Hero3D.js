import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const slides = [
    {
        image: '/images/slideshow/28862.jpg',
        label: 'MASTERPIECE OF AGRICULTURE',
        title: 'Feeding today, sustaining tomorrow.',
        description:
            'Reflects a balance between productivity and stewardship, where farmers grow nutritious food today using practices that preserve soil health, biodiversity, and natural resources. This vision emphasizes long-term resilience, ensuring that agriculture continues to support livelihoods, communities, and the planet for years to come.',
        thumbTitle: '',
    },
    {
        image: '/images/slideshow/2148289389.jpg',
        label: 'MASTERPIECE OF AGRICULTURE',
        title: 'Where quality meets the harvest.',
        description:
            'Every harvest is selected, handled, and traded with care, ensuring fair value for farmers and reliable quality for consumers. This slogan reflects a place where nature’s hard work is honored, and only the best of the harvest reaches the market.',
        thumbTitle: '',
    },
    {
        image: '/images/slideshow/12297.jpg',
        label: 'MASTERPIECE OF AGRICULTURE',
        title: 'Voices of the fields.',
        description:
            'Power of sharing real experiences, knowledge, and challenges directly from the people who work the land. By connecting agricultural voices, this concept promotes collaboration, knowledge exchange, fair opportunities, and collective problem-solving. It strengthens the agricultural community, amplifies grassroots innovation, and builds a more informed, inclusive, and resilient agricultural ecosystem for everyone involved.',
        thumbTitle: '',
    },
    {
        image: '/images/slideshow/2151463023.jpg',
        label: 'MASTERPIECE OF AGRICULTURE',
        title: 'Seeds of knowledge.',
        description:
            'Every lesson in agriculture is a seed planted for future growth. In e-agricultural learning, knowledge is accessible anytime and anywhere, allowing farmers, students, and agripreneurs to continuously develop their skills.',
        thumbTitle: '',
    },
    {
        image: '/images/slideshow/2156677.jpg',
        label: 'MASTERPIECE OF AGRICULTURE',
        title: 'AI insights from soil to sky.',
        description:
            'By integrating ground-level data with aerial and atmospheric information, AI provides accurate predictions, early warnings for pests and diseases, optimized irrigation and fertilization plans, and improved yield forecasting',
        thumbTitle: '',
    },
];

export default function Hero3D({ height = 450 }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const intervalRef = useRef(null);
    const countItem = slides.length;
    const sliderHeight = typeof height === 'number' ? `${height}px` : height;

    const startAutoSlide = useCallback((duration) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setActiveIndex((current) => (current + 1) % countItem);
        }, duration);
    }, [countItem]);

    useEffect(() => {
        startAutoSlide(10000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [startAutoSlide]);

    const showSlider = (nextIndex) => {
        setActiveIndex(nextIndex);
        startAutoSlide(20000);
    };

    const handleNext = () => {
        const nextIndex = activeIndex + 1 >= countItem ? 0 : activeIndex + 1;
        showSlider(nextIndex);
    };

    const handlePrev = () => {
        const nextIndex = activeIndex - 1 < 0 ? countItem - 1 : activeIndex - 1;
        showSlider(nextIndex);
    };

    return (
        <div style={{ fontFamily: "'Trebuchet MS','Lucida Sans Unicode','Lucida Grande','Lucida Sans',Arial,sans-serif" }}>
            <style>{`
                .slider{
                    height: ${sliderHeight};
                    margin-top: 0;
                    position: relative;
                }
                .slider .list .item{
                    position: absolute;
                    inset: 0 0 0 0;
                    overflow: hidden;
                    opacity: 0;
                    transition: 5s;
                }
                .slider .list .item img{
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .slider .list .item::after{
                    content: '';
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    background-image: linear-gradient(transparent,rgba(0,0,0,.8));
                }
                .slider .list .item .content{
                    position: absolute;
                    left: 5%;
                    top: 12%;
                    width: 500px;
                    max-width: 80%;
                    z-index: 1;
                    color: #eee;
                }
                .slider .list .item .content p:nth-child(1){
                    text-transform: uppercase;
                    letter-spacing: 10px;
                    text-shadow: 0 0 30px #000;
                }
                .slider .list .item .content h2{
                    font-size: 70px;
                    margin: 0;
                    text-shadow: 0 0 30px #000;
                    color: lightblue;
                    line-height: 1;
                }
                .slider .list .item.active p:nth-child(3){
                    text-shadow: 0 0 10px #000;
                }
                .slider .list .item.active{
                    opacity: 1;
                    z-index: 10;
                }
                @keyframes showContent{
                    to{
                        transform: translateY(0);
                        filter: blur(0);
                        opacity: 1;
                    }
                }
                .slider .list .item.active p:nth-child(1),
                .slider .list .item.active h2,
                .slider .list .item.active p:nth-child(3){
                    transform: translateY(30px);
                    filter: blur(20px);
                    opacity: 0;
                    animation: showContent .5s .7s ease-in-out 1 forwards;
                }
                .slider .list .item.active h2{
                    animation-delay: 1s;
                }
                .slider .list .item.active p:nth-child(3){
                    animation-duration: 1.3s;
                }
                .arrows{
                    position: absolute;
                    top: 54%;
                    right: 50px;
                    z-index: 100;
                }
                .arrows button{
                    background-color: #eee5;
                    border: none;
                    font-family: monospace;
                    width: 40px;
                    height: 40px;
                    border-radius: 5px;
                    font-size: x-large;
                    color: lightblue;
                    transition: .5s;
                    margin-left: 8px;
                }
                .arrows button:hover{
                    background-color: #eee;
                    color: black;
                    cursor: pointer;
                }
                .thumbnail{
                    position: absolute;
                    bottom: 10px;
                    z-index: 11;
                    display: flex;
                    gap: 10px;
                    width: 100%;
                    height: 250px;
                    padding: 0 50px;
                    box-sizing: border-box;
                    overflow: auto;
                    justify-content: right;
                }
                .thumbnail::-webkit-scrollbar{
                    width: 0;
                }
                .thumbnail .item{
                    width: 150px;
                    height: 220px;
                    filter: brightness(.5);
                    transition: .5s;
                    flex-shrink: 0;
                    cursor: pointer;
                    position: relative;
                    border: none;
                    padding: 0;
                    background: transparent;
                }
                .thumbnail .item img{
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 10px;
                }
                .thumbnail .item.active{
                    filter: brightness(1.5);
                }
                .thumbnail .item .content{
                    position: absolute;
                    inset: auto 10px 10px;
                    color: #eee;
                    font-size: 12px;
                    text-shadow: 0 0 10px #000;
                }
                @media screen and (max-width:678px){
                    .thumbnail{
                        justify-content: start;
                    }
                    .slider .list .item .content h2{
                        font-size: 60px;
                    }
                }
            `}</style>

            <div className="slider">
                <div className="list">
                    {slides.map((slide, index) => (
                        <div className={`item ${index === activeIndex ? 'active' : ''}`} key={slide.title}>
                            <img src={slide.image} alt={slide.title} />
                            <div className="content">
                                <p>{slide.label}</p>
                                <h2>{slide.title}</h2>
                                <p>{slide.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="arrows">
                    <button id="prev" type="button" onClick={handlePrev}>&lt;</button>
                    <button id="next" type="button" onClick={handleNext}>&gt;</button>
                </div>

                <div className="thumbnail">
                    {slides.map((slide, index) => (
                        <button
                            type="button"
                            className={`item ${index === activeIndex ? 'active' : ''}`}
                            key={`${slide.title}-thumb`}
                            onClick={() => showSlider(index)}
                        >
                            <img src={slide.image} alt={slide.thumbTitle} />
                            <div className="content">{slide.thumbTitle}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

Hero3D.propTypes = {
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
