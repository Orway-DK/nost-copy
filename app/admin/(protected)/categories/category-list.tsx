// app/admin/(protected)/categories/category-list.tsx
"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import { IoPencil, IoTrash, IoFolderOpen } from "react-icons/io5";
import { deleteCategoryAction } from "./actions";
import { useRouter } from "next/navigation";

export default function CategoryList({ initialData }: { initialData: any[] }) {
    const router = useRouter();
    const [busyId, setBusyId] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
        if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz? Alt kategoriler de silinecektir!")) return;
        setBusyId(id);
        const res = await deleteCategoryAction(id);
        if (res.success) {
            router.refresh();
        } else {
            alert(res.message);
        }
        setBusyId(null);
    };

    const renderRow = (cat: any, level = 0) => (
        <Fragment key={cat.id}>
            <tr className="transition-colors hover:bg-[var(--admin-input-bg)]" style={{ borderBottomColor: "var(--admin-card-border)" }}>
                <td className="py-3 px-4">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
                        {level > 0 && <span className="opacity-30">└─</span>}
                        <IoFolderOpen className="text-yellow-500" />
                        <span className="font-medium" style={{ color: "var(--admin-fg)" }}>{cat.name}</span>
                    </div>
                </td>
                <td className="py-3 px-4 text-xs opacity-60 font-mono">{cat.slug}</td>
                <td className="py-3 px-4 text-sm">{cat.sort}</td>
                <td className="py-3 px-4">
                    {cat.active ? (
                        <span className="badge-admin badge-admin-success">Aktif</span>
                    ) : (
                        <span className="badge-admin badge-admin-default opacity-60">Pasif</span>
                    )}
                </td>
                <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                        <Link
                            href={`/admin/categories/${cat.id}`}
                            className="btn-admin btn-admin-secondary p-2 leading-none"
                        >
                            <IoPencil size={16} />
                        </Link>
                        <button
                            onClick={() => handleDelete(cat.id)}
                            disabled={busyId === cat.id}
                            className="btn-admin btn-admin-danger p-2 leading-none"
                        >
                            <IoTrash size={16} />
                        </button>
                    </div>
                </td>
            </tr>
            {/* Recursive Render */}
            {cat.children?.map((child: any) => renderRow(child, level + 1))}
        </Fragment>
    );

    return (
        <div className="card-admin overflow-hidden p-0">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead style={{ backgroundColor: "var(--admin-input-bg)", color: "var(--admin-muted)" }}>
                        <tr className="border-b" style={{ borderColor: "var(--admin-card-border)" }}>
                            <th className="py-3 px-4">Kategori Adı</th>
                            <th className="py-3 px-4">Slug</th>
                            <th className="py-3 px-4 w-20">Sıra</th>
                            <th className="py-3 px-4 w-24">Durum</th>
                            <th className="py-3 px-4 w-32 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: "var(--admin-card-border)" }}>
                        {initialData.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center opacity-50">Kayıt yok.</td></tr>
                        ) : (
                            initialData.map(cat => renderRow(cat))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}