import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "../redux/provider";
import Head from 'next/head'


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CSS Video Editor",
  description: "Video Editor Application",
  icons: {
    icon: [
      { url: '/images/icon.png', type: 'image/png' },
    ],
    shortcut: ['/images/icon.png'],
    apple: [
      { url: '/images/icon.png', type: 'image/png' },
    ],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
       <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1268172306474314"
        crossOrigin="anonymous"
       ></script>
      </head>	  
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
