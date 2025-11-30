"use client";

import TopHorizontalBanner from "@/app/_components/TopHorizontalBanner/topHorizontalBanner";
import NavigationBar from "@/app/_components/NavigationBar/NavigationBar";
import MainFooter from "@/app/_components/mainFooter/mainFooter";
import { ReactNode } from "react";

// Eğer bazı rotalarda banner istemezseniz pathname ile koşul koyabilirsiniz.
export default function SiteLayout({ children }: { children: ReactNode }) {

    return (
        <div className="min-h-screen flex flex-col">
            <TopHorizontalBanner />
            <NavigationBar />
            <main className="flex-1 w-full flex flex-col items-center">{children}</main>
            <MainFooter />
        </div>
    );
}