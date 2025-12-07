// app/_components/Contact/WorldMapLocations.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type LocationData = {
    id: number;
    title: string;
    address: string;
    email: string;
    phone: string;
    lat: number;
    lng: number;
};

export default function WorldMapLocations() {
    const [locations, setLocations] = useState<LocationData[]>([]);
    const [activeLoc, setActiveLoc] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLocations() {
            const { data, error } = await supabase.from('contact_locations').select('*');
            if (data && !error) setLocations(data);
            setLoading(false);
            console.log(data)
        }
        fetchLocations();
    }, []);

    // Aktif olan lokasyonun verisini buluyoruz
    const activeLocationData = locations.find(l => l.id === activeLoc);

    return (
        <div className="w-full py-24 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6 text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Global Mağazalarımız</h2>
                <p className="text-gray-500 mt-2 text-lg">Dünyanın dört bir yanındaki ofislerimizle hizmetinizdeyiz.</p>
            </div>

            <div className="relative w-full max-w-7xl mx-auto h-[450px] md:h-[550px]">
                {loading ? (
                    <div className="flex h-full items-center justify-center text-gray-400">Harita yükleniyor...</div>
                ) : (
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{ scale: 190, center: [15, 35] }}
                        style={{ width: "100%", height: "100%" }}
                    >
                        <Geographies geography={GEO_URL}>
                            {({ geographies }) =>
                                geographies.map((geo) => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill="white"
                                        stroke="#dee5f3"
                                        strokeWidth={0.8}
                                        style={{
                                            default: { outline: "none" },
                                            hover: { fill: "#dee5f3", outline: "none" },
                                            pressed: { outline: "none" },
                                        }}
                                    />
                                ))
                            }
                        </Geographies>

                        {/* 1. KATMAN: Tüm Noktalar (Döngü ile basılır) */}
                        {locations.map((loc) => (
                            <Marker
                                key={loc.id}
                                coordinates={[loc.lng, loc.lat]}
                                onMouseEnter={() => setActiveLoc(loc.id)}
                                onMouseLeave={() => setActiveLoc(null)}
                                style={{
                                    default: { cursor: "pointer", outline: "none" },
                                    hover: { cursor: "pointer", outline: "none" },
                                    pressed: { cursor: "pointer", outline: "none" }
                                }}
                            >
                                <g>
                                    <circle r={12} fill="none" stroke="#2563eb" strokeOpacity={0.4} strokeWidth={1}>
                                        <animate attributeName="r" from="4" to="18" dur="1.5s" repeatCount="indefinite" />
                                        <animate attributeName="opacity" from="1" to="0" dur="1.5s" repeatCount="indefinite" />
                                    </circle>
                                    <circle r={5} fill="#2563eb" stroke="#fff" strokeWidth={1.5} />
                                </g>
                            </Marker>
                        ))}

                        {/* 2. KATMAN: Sadece Aktif Tooltip (Döngü dışında, en sonda basılır) */}
                        {activeLocationData && (
                            <Marker coordinates={[activeLocationData.lng, activeLocationData.lat]}>
                                {/* Pointer events none ekledim ki mouse tooltip'e gelince titreme yapmasın */}
                                <g className="pointer-events-none">
                                    <foreignObject
                                        x={-150}
                                        y={-85}
                                        width={300}
                                        height={80}
                                        style={{ overflow: 'visible' }}
                                    >
                                        <div className="flex flex-col items-center justify-end w-full h-full pb-1">
                                            <div className="bg-white text-gray-900 shadow-xl rounded-lg px-4 py-2 border border-gray-200 text-center w-fit max-w-[280px]">
                                                <p className="font-bold text-sm whitespace-nowrap mb-0.5">{activeLocationData.title}</p>
                                                <p className="text-xs text-gray-500 whitespace-normal leading-snug">
                                                    {activeLocationData.address}
                                                </p>
                                                <p className="text-xs mt-2 text-gray-500 whitespace-normal leading-snug">
                                                    Phone: {activeLocationData.phone}
                                                </p>
                                                <p className="text-xs text-gray-500 whitespace-normal leading-snug">
                                                    Email: {activeLocationData.email}
                                                </p>

                                            </div>
                                            <div className="w-3 h-3 bg-white border-b border-r border-gray-200 transform rotate-45 -mt-1.5 shadow-sm z-10"></div>
                                        </div>
                                    </foreignObject>
                                </g>
                            </Marker>
                        )}
                    </ComposableMap>
                )}
            </div>
        </div>
    );
}