"use client";

import "./globals.css";
import { AuthProvider } from "@/contexts/authContext"; // Import AuthProvider
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import Header from "@/components/Header/Header";

import { Space_Mono } from 'next/font/google';

const spaceMono = Space_Mono({
    subsets: ["latin"],
    weight: ["400", "700"],
});


export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`min-h-screen relative bg-fixed font-mono ${spaceMono.className}`}>

                {/* 🌈 Blobs Container */}
                <div className="fixed w-screen h-screen -z-10 overflow-hidden pointer-events-none bg-gradient-to-tr from-red-200 to-green-200">
                    {/* Floating Blobs */}
                    <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-purple-300 rounded-full opacity-30 blur-3xl animate-float-slow"></div>
                    <div className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] bg-blue-200 rounded-full opacity-30 blur-3xl animate-float-slower"></div>
                    <div className="absolute top-1/3 left-1/2 w-80 h-80 bg-pink-300 rounded-full opacity-20 blur-3xl animate-float"></div>
                </div>


                {/* Main Content */}
                <AuthProvider>
                    <BrowserRouter>
                        <Header />
                        {children}
                    </BrowserRouter>
                </AuthProvider>
            </body>
        </html>
    );
}

