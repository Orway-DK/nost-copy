"use client";

import { SWRConfig } from "swr";

export default function SWRProvider({ children }: { children: React.ReactNode }) {
    // Use a fresh Map per reload to avoid memory growth during Fast Refresh
    const provider = () => new Map<string, any>();

    return (
        <SWRConfig
            value={{
                provider,
                revalidateOnFocus: false,
                revalidateOnReconnect: false,
                // Optional: you can add a global fetcher if you use one across the app
                // fetcher: (url: string) => fetch(url).then(res => res.json()),
            }}
        >
            {children}
        </SWRConfig>
    );
}