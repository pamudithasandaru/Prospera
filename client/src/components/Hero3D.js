import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

export default function Hero3D({ height = 420 }) {
    return (
        <Box sx={{ position: 'relative', mb: 4 }}>
            <style>{`
                .hero-video{
                    position:relative; 
                    width:100%; 
                    height:${height}px; 
                    border-radius:24px; 
                    overflow:hidden; 
                    background: #0b1f0f;
                    box-shadow: 0 30px 80px rgba(15, 23, 42, 0.25);
                }
                .hero-video-media{
                    position:absolute; inset:0; width:100%; height:100%;
                    object-fit:cover;
                }
                .hero-video-overlay{
                    position:absolute; inset:0;
                    background: linear-gradient(110deg, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.2) 55%, rgba(15,23,42,0.05) 100%);
                }
                .hero-video-content{
                    position:relative; height:100%;
                    display:grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
                    gap:24px; padding: 36px 48px; color:#fff;
                }
                .hero-video-copy{ display:flex; flex-direction:column; justify-content:center; gap:16px; }
                .hero-video-title{ font-size: clamp(26px, 3.2vw, 40px); font-weight: 800; line-height: 1.1; }
                .hero-video-subtitle{ font-size: clamp(14px, 1.4vw, 18px); opacity: 0.92; max-width: 520px; }
                .hero-video-panel{
                    align-self:center; border-radius:20px; padding: 20px; 
                    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2);
                    backdrop-filter: blur(10px); box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                @media (max-width:900px){
                    .hero-video-content{ grid-template-columns: 1fr; padding: 28px; }
                }
                @media (max-width:600px){
                    .hero-video{ border-radius:16px; height:${Math.max(320, height - 60)}px; }
                    .hero-video-content{ padding: 22px; }
                }
            `}</style>

            <div className="hero-video">
                <video
                    className="hero-video-media"
                    src="/videos/deed.mp4"
                    poster="/images/smart.png"
                    autoPlay
                    muted
                    loop
                    playsInline
                />
                <div className="hero-video-overlay" />

                <div className="hero-video-content">
                    <div className="hero-video-copy">
                        <Chip
                            label="Prospera Platform"
                            sx={{
                                width: 'fit-content',
                                bgcolor: 'rgba(255,255,255,0.16)',
                                color: 'white',
                                fontWeight: 600,
                            }}
                        />
                        <Typography className="hero-video-title" component="h2">
                            Smarter agriculture, powered by data and AI.
                        </Typography>
                        <Typography className="hero-video-subtitle" variant="subtitle1">
                            Real-time insights, market signals, and expert guidance to help every farm thrive.
                        </Typography>
                    </div>

                    <div className="hero-video-panel">
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                            What you get
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Live market pricing, AI diagnostics, crop planning, and learning resources—all in one place.
                        </Typography>
                    </div>
                </div>
            </div>
        </Box>
    );
}
