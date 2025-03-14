"use client"

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth.context";
import { Suspense, useEffect } from "react";
import Loading from "./(home)/loading";
import SocketProvider from "@/contexts/socket.context";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


// const queryClient = new QueryClient({ });

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}
      >
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <SocketProvider>
                {/* <Suspense fallback={<Loading/>}> */}
                {children}
                {/* </Suspense> */}
            </SocketProvider>
          </QueryClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
