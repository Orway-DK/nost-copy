"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { createClient } from '@supabase/supabase-js';
// DÜZELTME: Doğru LanguageProvider yolunu kullanıyoruz
import { useLanguage } from "@/components/LanguageProvider";

// Supabase Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Leaflet bileşenleri (SSR kapatıldı)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then(mod => mod.Tooltip), { ssr: false });

// --- DİL SÖZLÜĞÜ (Statik Metinler) ---
const TRANSLATIONS: Record<string, any> = {
    tr: {
        header: "Global Mağazalarımız",
        sub: "Dünyanın dört bir yanındaki ofislerimizle hizmetinizdeyiz.",
        btn: "Haritada Aç",
        loading: "Harita yükleniyor..."
    },
    en: {
        header: "Our Global Locations",
        sub: "We are at your service with our offices around the world.",
        btn: "Open in Map",
        loading: "Loading map..."
    },
    de: {
        header: "Unsere Globalen Standorte",
        sub: "Wir sind mit unseren Büros auf der ganzen Welt für Sie da.",
        btn: "Auf Karte öffnen",
        loading: "Karte wird geladen..."
    }
};

type LocationData = {
    id: number;
    title: string;
    address: string;
    phone: string;
    email: string;
    lat: number;
    lng: number;
    map_url?: string;
    // Çoklu dil alanları
    title_de?: string;
    address_de?: string;
    title_en?: string;
    address_en?: string;
};

export default function WorldMapLocations() {
    // 1. Yeni Provider'dan 'lang' değerini çekiyoruz (lang_code ile aynıdır)
    const { lang } = useLanguage();

    const [locations, setLocations] = useState<LocationData[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeLoc, setActiveLoc] = useState<number | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 2. Mevcut dilin sözlüğünü seç (Bulamazsa tr'ye düş)
    const t = TRANSLATIONS[lang] || TRANSLATIONS.tr;

    useEffect(() => {
        async function fetchLocations() {
            const { data, error } = await supabase.from('contact_locations').select('*');
            if (data && !error) setLocations(data);
            setLoading(false);
        }
        fetchLocations();
    }, []);

    // --- MOUSE EVENTLERİ ---
    const handleMouseEnter = (id: number) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setActiveLoc(id);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveLoc(null);
        }, 2000); // 2 saniye gecikme
    };

    // --- DİNAMİK İÇERİK SEÇİCİ ---
    const getLocalizedContent = (loc: LocationData) => {
        let title = loc.title;       // Varsayılan (TR)
        let address = loc.address;   // Varsayılan (TR)
        let email = loc.email;   // Varsayılan (TR)
        let phone = loc.phone;   // Varsayılan (TR)

        if (lang === 'de') {
            title = loc.title_de || loc.title;
            address = loc.address_de || loc.address;
        } else if (lang === 'en') {
            title = loc.title_en || loc.title;
            address = loc.address_en || loc.address;
        }

        return { title, address, email, phone };
    };

    const mapStyle = { height: "100%", width: "100%", borderRadius: "0", zIndex: 0 };

    return (
        <div className="w-full pt-24 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6 text-center mb-12">
                {/* Statik Başlıklar */}
                <h2 suppressHydrationWarning className="...">
                    {t.header}
                </h2>
                <p className="text-gray-500 mt-2 text-lg">{t.sub}</p>
            </div>

            <div className="relative w-full max-w-7xl mx-auto h-[450px] md:h-[550px] rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-50 z-0">
                {loading ? (
                    <div className="flex h-full items-center justify-center text-gray-400">{t.loading}</div>
                ) : (
                    <MapContainer
                        center={[25, 10]}
                        zoom={2}
                        scrollWheelZoom={false}
                        style={mapStyle}
                        // @ts-ignore
                        worldCopyJump={true}
                    >
                        <TileLayer
                            attribution='&copy; CARTO'
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        />

                        {locations.map((loc) => {
                            const content = getLocalizedContent(loc);

                            return (
                                <CircleMarker
                                    key={loc.id}
                                    center={[loc.lat, loc.lng]}
                                    pathOptions={{
                                        color: '#2563eb',
                                        fillColor: '#2563eb',
                                        fillOpacity: 0.6,
                                        weight: 2
                                    }}
                                    radius={8}
                                    eventHandlers={{
                                        mouseover: () => handleMouseEnter(loc.id),
                                        mouseout: handleMouseLeave,
                                        click: () => handleMouseEnter(loc.id)
                                    }}
                                >
                                    {activeLoc === loc.id && (
                                        <Tooltip
                                            permanent={true}
                                            direction="top"
                                            offset={[0, -10]}
                                            opacity={1}
                                            interactive={true}
                                            eventHandlers={{
                                                mouseover: () => handleMouseEnter(loc.id),
                                                mouseout: handleMouseLeave
                                            }}
                                        >
                                            <div className="text-center px-2 py-1 flex flex-col items-center gap-2 min-w-[150px]">
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900 mb-0.5">{content.title}</p>
                                                    <p className="text-xs text-gray-500 max-w-[200px] whitespace-normal leading-snug">
                                                        {content.address}
                                                    </p>
                                                    <p className="text-xs mt-2 text-gray-500 max-w-[200px] whitespace-normal leading-snug">
                                                        {content.phone}
                                                    </p>
                                                    <p className="text-xs text-gray-500 max-w-[200px] whitespace-normal leading-snug">
                                                        {content.email}
                                                    </p>
                                                </div>

                                                {loc.map_url && (
                                                    <a
                                                        href={loc.map_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-1 text-xs font-semibold bg-blue-600 !text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors no-underline flex items-center justify-center gap-1.5 w-full shadow-sm"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <span>{t.btn}</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                                                            <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                                                            <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                                                        </svg>
                                                    </a>
                                                )}
                                            </div>
                                        </Tooltip>
                                    )}
                                </CircleMarker>
                            );
                        })}
                    </MapContainer>
                )}
            </div>
        </div>
    );
}