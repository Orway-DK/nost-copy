// app/admin/_components/MediaPickerModal.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { IoCloudUpload, IoImages, IoLink, IoClose, IoCheckmark } from "react-icons/io5";
import Image from "next/image";

type MediaPickerProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    bucketName?: string; // Varsayılan: 'products'
};

export default function MediaPickerModal({ isOpen, onClose, onSelect, bucketName = "products" }: MediaPickerProps) {
    const [activeTab, setActiveTab] = useState<"library" | "upload" | "link">("upload");
    const [libraryImages, setLibraryImages] = useState<{ name: string; url: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [linkInput, setLinkInput] = useState("");

    // Paste için ref
    const containerRef = useRef<HTMLDivElement>(null);

    const supabase = createSupabaseBrowserClient();

    // 1. Kütüphaneyi Yükle
    const fetchLibrary = async () => {
        setLoading(true);
        const { data, error } = await supabase.storage.from(bucketName).list("", {
            limit: 100,
            offset: 0,
            sortBy: { column: "created_at", order: "desc" },
        });

        if (data) {
            const urls = data.map((file) => {
                const { data: publicUrl } = supabase.storage.from(bucketName).getPublicUrl(file.name);
                return { name: file.name, url: publicUrl.publicUrl };
            });
            setLibraryImages(urls);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen && activeTab === "library") {
            fetchLibrary();
        }
    }, [isOpen, activeTab]);

    // 2. Dosya Yükleme (File Input veya Paste)
    const handleFileUpload = async (file: File) => {
        setUploading(true);
        try {
            // Benzersiz isim: timestamp-filename
            const fileName = `${Date.now()}-${slugifyFileName(file.name)}`;
            const { data, error } = await supabase.storage.from(bucketName).upload(fileName, file);

            if (error) throw error;

            const { data: publicUrl } = supabase.storage.from(bucketName).getPublicUrl(fileName);
            onSelect(publicUrl.publicUrl);
            onClose();
        } catch (e: any) {
            alert("Yükleme hatası: " + e.message);
        } finally {
            setUploading(false);
        }
    };

    // Paste Olayını Dinle
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (!isOpen) return;
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                    const blob = items[i].getAsFile();
                    if (blob) handleFileUpload(blob);
                }
            }
        };

        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, [isOpen]);

    function slugifyFileName(name: string) {
        const parts = name.split(".");
        const ext = parts.pop();
        const base = parts.join(".").replace(/[^a-zA-Z0-9]/g, "-");
        return `${base}.${ext}`;
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div ref={containerRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Medya Seçimi</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <IoClose size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab("upload")}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === "upload" ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/20" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                    >
                        <IoCloudUpload size={18} /> Yükle
                    </button>
                    <button
                        onClick={() => setActiveTab("library")}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === "library" ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/20" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                    >
                        <IoImages size={18} /> Kütüphane
                    </button>
                    <button
                        onClick={() => setActiveTab("link")}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === "link" ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/20" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                    >
                        <IoLink size={18} /> Bağlantı
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900/50 min-h-[300px]">

                    {/* 1. UPLOAD TAB */}
                    {activeTab === "upload" && (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 transition-colors hover:border-blue-400 bg-white dark:bg-gray-800">
                            <IoCloudUpload className="text-6xl text-gray-300 mb-4" />
                            <p className="text-gray-500 mb-6 text-center">
                                Dosyaları buraya sürükleyin veya panodan yapıştırın (Ctrl+V)
                            </p>
                            <label className="btn-admin btn-admin-primary cursor-pointer">
                                <span>Dosya Seç</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                    disabled={uploading}
                                />
                            </label>
                            {uploading && <p className="mt-4 text-sm text-blue-600 animate-pulse">Yükleniyor...</p>}
                        </div>
                    )}

                    {/* 2. LIBRARY TAB */}
                    {activeTab === "library" && (
                        <div>
                            {loading ? (
                                <div className="text-center py-10 text-gray-500">Görseller yükleniyor...</div>
                            ) : libraryImages.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">Henüz görsel yok.</div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                    {libraryImages.map((img) => (
                                        <div
                                            key={img.name}
                                            onClick={() => { onSelect(img.url); onClose(); }}
                                            className="group relative aspect-square bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500"
                                        >
                                            <Image src={img.url} alt={img.name} fill className="object-cover" sizes="150px" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. LINK TAB */}
                    {activeTab === "link" && (
                        <div className="flex flex-col gap-4">
                            <label className="text-sm font-medium">Görsel Bağlantısı (URL)</label>
                            <div className="flex gap-2">
                                <input
                                    className="admin-input flex-1"
                                    placeholder="https://example.com/image.png"
                                    value={linkInput}
                                    onChange={(e) => setLinkInput(e.target.value)}
                                />
                                <button
                                    className="btn-admin btn-admin-primary"
                                    onClick={() => {
                                        if (linkInput) {
                                            onSelect(linkInput);
                                            onClose();
                                        }
                                    }}
                                >
                                    Ekle
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}