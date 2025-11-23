'use client';

import React from 'react';

export default function ComingSoon() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col justify-between relative overflow-hidden font-sans">

            {/* --- Main Content --- */}
            <div className="flex flex-col justify-center items-center text-center px-4 pt-18 lg:pt-32 flex-1">
                
                {/* Logo */}
                <header className="flex justify-center mb-15">
                    <div className="flex flex-col items-center">
                        <img
                            src="/funoon-logo.webp"
                            alt="Fiesta Logo"
                            className="w-30 md:w-40 h-auto object-contain"
                        />
                    </div>
                </header>

                {/* Main Text */}
                <main className="flex flex-col justify-center items-center text-center px-4 mb-15">
                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-[0.15em] text-white mb-4" style={{ fontFamily: '"American Typewriter Light", "American Typewriter", "Courier New", Courier, monospace' }}>
                        Coming Soon
                    </h2>
                    <p className="text-md md:text-2xl lg:text-3xl font-extralight text-white/90">
                        A new chapter unfolds soon
                    </p>
                </main>
            </div>

            {/* --- Footer --- */}
            <footer className="w-full pb-8 pt-0 px-6 md:px-12 flex flex-col lg:flex-row items-end justify-between relative z-10 gap-8 lg:gap-0">

                {/* Left Side: Logos and Text */}
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full lg:w-auto text-center md:text-left">

                    {/* Logos Group */}
                    <div className="flex items-center gap-5 shrink-0">
                        {/* NUSA Logo */}
                        <div className="w-14 h-14 flex items-center justify-center">
                            <img
                                src="/logo.webp"
                                alt="NUSA Logo"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    if (e.currentTarget.parentElement) {
                                        e.currentTarget.parentElement.innerHTML = '<div class="text-[8px] opacity-50 text-white">Logo</div>';
                                    }
                                }}
                            />
                        </div>

                        {/* QR Code */}
                        <div className="w-14 h-14 flex items-center justify-center bg-white p-1">
                            <img 
                                src="/qrcode.webp" 
                                alt="QR Code" 
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    {/* Description Text */}
                    <div className="max-w-md text-[10px] leading-relaxed text-white/80 font-light">
                        <p>
                            <strong className="font-medium text-white">Funoon Fiesta</strong> is the annual arts fest of Jamia Nooriya Arabiyya, Faizabad, organized under the Noorul Ulama Students' Association. A vibrant celebration of creativity, culture, and artistic expression.
                        </p>
                    </div>
                </div>

                {/* Right Side: Wavy Lines */}
                <div className="w-full lg:w-1/2 flex justify-center lg:justify-end lg:mt-0">
                    <svg width="100%" height="30" viewBox="0 5 300 26" className="opacity-40">
                        <path d="M0 10 Q 30 0, 60 10 T 120 10 T 180 10 T 240 10 T 300 10 T 360 10 T 420 10 T 480 10 T 540 10 T 600 10 T 660 10 T 720 10 T 780 10 T 840 10 T 900 10 T 960 10 T 1020 10 T 1080 10 T 1140 10 T 1200 10 T 1260 10 T 1320 10 T 1380 10 T 1440 10 T 1500 10 T 1560 10 T 1620 10 T 1680 10 T 1740 10 T 1800 10 T 1860 10 T 1920 10 T 1980 10 T 2040 10 T 2100 10 T 2160 10 T 2220 10 T 2280 10 T 2340 10 T 2400 10 T 2460 10 T 2520 10 T 2580 10 T 2640 10 T 2700 10 T 2760 10 T 2820 10 T 2880 10 T 2940 10 T 3000 10" stroke="white" strokeWidth="1" fill="none" />
                        <path d="M0 15 Q 30 5, 60 15 T 120 15 T 180 15 T 240 15 T 300 15 T 360 15 T 420 15 T 480 15 T 540 15 T 600 15 T 660 15 T 720 15 T 780 15 T 840 15 T 900 15 T 960 15 T 1020 15 T 1080 15 T 1140 15 T 1200 15 T 1260 15 T 1320 15 T 1380 15 T 1440 15 T 1500 15 T 1560 15 T 1620 15 T 1680 15 T 1740 15 T 1800 15 T 1860 15 T 1920 15 T 1980 15 T 2040 15 T 2100 15 T 2160 15 T 2220 15 T 2280 15 T 2340 15 T 2400 15 T 2460 15 T 2520 15 T 2580 15 T 2640 15 T 2700 15 T 2760 15 T 2820 15 T 2880 15 T 2940 15 T 3000 15" stroke="white" strokeWidth="1" fill="none" />
                        <path d="M0 20 Q 30 10, 60 20 T 120 20 T 180 20 T 240 20 T 300 20 T 360 20 T 420 20 T 480 20 T 540 20 T 600 20 T 660 20 T 720 20 T 780 20 T 840 20 T 900 20 T 960 20 T 1020 20 T 1080 20 T 1140 20 T 1200 20 T 1260 20 T 1320 20 T 1380 20 T 1440 20 T 1500 20 T 1560 20 T 1620 20 T 1680 20 T 1740 20 T 1800 20 T 1860 20 T 1920 20 T 1980 20 T 2040 20 T 2100 20 T 2160 20 T 2220 20 T 2280 20 T 2340 20 T 2400 20 T 2460 20 T 2520 20 T 2580 20 T 2640 20 T 2700 20 T 2760 20 T 2820 20 T 2880 20 T 2940 20 T 3000 20" stroke="white" strokeWidth="1" fill="none" />
                        <path d="M0 25 Q 30 15, 60 25 T 120 25 T 180 25 T 240 25 T 300 25 T 360 25 T 420 25 T 480 25 T 540 25 T 600 25 T 660 25 T 720 25 T 780 25 T 840 25 T 900 25 T 960 25 T 1020 25 T 1080 25 T 1140 25 T 1200 25 T 1260 25 T 1320 25 T 1380 25 T 1440 25 T 1500 25 T 1560 25 T 1620 25 T 1680 25 T 1740 25 T 1800 25 T 1860 25 T 1920 25 T 1980 25 T 2040 25 T 2100 25 T 2160 25 T 2220 25 T 2280 25 T 2340 25 T 2400 25 T 2460 25 T 2520 25 T 2580 25 T 2640 25 T 2700 25 T 2760 25 T 2820 25 T 2880 25 T 2940 25 T 3000 25" stroke="white" strokeWidth="1" fill="none" />
                    </svg>
                </div>
            </footer>
        </div>
    );
}