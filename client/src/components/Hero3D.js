import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

const slides = [
    {
        title: 'Smart Farming Insights',
        subtitle: 'Real-time analytics for better yields',
        img: '/images/smart.png',
        bg: 'linear-gradient(135deg,#56ab2f 0%,#a8e063 100%)',
    },
    {
        title: 'Market Price Trends',
        subtitle: 'Stay ahead with live wholesale prices',
        img: '/images/market.png',
        bg: 'linear-gradient(135deg,#36d1dc 0%,#5b86e5 100%)',
    },
    {
        title: 'AI Disease Detection',
        subtitle: 'Upload crop images for instant diagnosis',
        img: '/images/ai.jpg',
        bg: 'linear-gradient(135deg,#ff9966 0%,#ff5e62 100%)',
    },
    {
        title: 'Learning Hub',
        subtitle: 'Grow your skills with expert courses',
        img: '/images/learn.jpg',
        bg: 'linear-gradient(135deg,#7b4397 0%,#dc2430 100%)',
    },
];

export default function Hero3D({ height = 400 }) {
    const [index, setIndex] = useState(0);
    const mounted = useRef(false);

    useEffect(() => {
        mounted.current = true;
        const t = setInterval(() => {
            setIndex((i) => (i + 1) % slides.length);
        }, 4500);
        return () => {
            mounted.current = false;
            clearInterval(t);
        };
    }, []);

    const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
    const next = () => setIndex((i) => (i + 1) % slides.length);

    return (
        <Box sx={{ position: 'relative', perspective: 1200, mb: 4 }}>
            <style>{`
                .hero-3d-container{ position:relative; width:100%; height:${height}px; transform-style:preserve-3d; }
                .hero-3d-scene{ 
                    position:absolute; 
                    width:100%; 
                    height:100%; 
                    left:0; 
                    top:0; 
                    transform-style:preserve-3d; 
                    transition: transform 5000ms  cubic-bezier(0.23, 1, 0.32, 1);
                    will-change: transform;
                }
                .hero-3d-slide{ 
                    position:absolute; 
                    width:70%; 
                    height:78%; 
                    left:15%; 
                    top:11%; 
                    border-radius:16px; 
                    color:white; 
                    display:flex; 
                    align-items:center; 
                    justify-content:center; 
                    text-align:center; 
                    box-shadow:0 12px 30px rgba(0,0,0,0.18); 
                    backface-visibility:hidden; 
                    overflow:hidden;
                    transform-style: preserve-3d;
                }
                .hero-3d-slide img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transform:translateZ(0); }
                .hero-3d-overlay{ position:absolute; inset:0; background:rgba(0,0,0,0.28); mix-blend-mode: normal; }
                .hero-3d-content{ 
                    padding:28px; 
                    position:relative; 
                    z-index:2;
                    transition: opacity 400ms ease-in-out;
                }
                .hero-indicators{ position:absolute; left:50%; transform:translateX(-50%); bottom:10px; display:flex; gap:8px }
                .hero-indicators button{ width:10px; height:10px; border-radius:50%; border:none; background:rgba(255,255,255,0.5); cursor:pointer; transition: all 300ms ease; }
                .hero-indicators button.active{ background:rgba(255,255,255,1); transform: scale(1.2); }
                .hero-nav{ position:absolute; top:50%; transform:translateY(-50%); width:100%; display:flex; justify-content:space-between; padding:0 12px }
                .hero-nav button{ background:rgba(255,255,255,0.12); border:none; color:white; width:44px; height:44px; border-radius:50%; backdrop-filter: blur(4px); cursor:pointer; transition: all 250ms ease; }
                .hero-nav button:hover{ background:rgba(255,255,255,0.25); transform: scale(1.1); }
                @media (max-width:600px){ .hero-3d-slide{ width:86%; left:7%; top:8%; height:84%; border-radius:12px } }
            `}</style>

            <div className="hero-3d-container">
                <div
                    className="hero-3d-scene"
                    style={{ transform: `rotateY(${index * -90}deg)` }}
                >
                    {slides.map((s, i) => {
                        const angle = i * 90;
                        return (
                            <div
                                key={i}
                                className="hero-3d-slide"
                                style={{
                                    transform: `rotateY(${angle}deg) translateZ(420px)`,
                                    background: !s.img ? s.bg : undefined,
                                }}
                            >
                                {s.img && <img src={s.img} alt={s.title} />}
                                <div
                                    className="hero-3d-overlay"
                                    style={{ background: s.bg ? s.bg.replace(/,([^,]+)$/, ', 0.45)') : 'rgba(0,0,0,0.28)' }}
                                />
                                <div className="hero-3d-content">
                                    <Typography variant="h4" component="div" sx={{ fontWeight: 800, mb: 1 }}>
                                        {s.title}
                                    </Typography>
                                    <Typography variant="subtitle1" sx={{ opacity: 0.95 }}>
                                        {s.subtitle}
                                    </Typography>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="hero-nav">
                    <button aria-label="prev" onClick={prev}><ArrowBackIos /></button>
                    <button aria-label="next" onClick={next}><ArrowForwardIos /></button>
                </div>

                <div className="hero-indicators">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            className={i === index ? 'active' : ''}
                            onClick={() => setIndex(i)}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            </div>
        </Box>
    );
}
