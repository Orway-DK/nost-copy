// orway-dk/nost-copy/nost-copy-d541a3f124d8a8bc7c3eeea745918156697a239e/app/admin/(protected)/categories/page.tsx
"use client";

import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { IoAdd, IoPencil, IoTrash, IoFolderOpen } from "react-icons/io5";

type Category = {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    active: boolean;
    sort: number;
    children?: Category[];
};

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/categories");
            const json = await res.json();
            if (json.data) {
                setCategories(buildTree(json.data));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz? Alt kategoriler de silinecektir!")) return;
        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
            if (res.ok) fetchCategories();
            else alert("Silinemedi");
        } catch (e) {
            console.error(e);
        }
    };

    function buildTree(items: Category[]) {
        const map: Record<number, Category> = {};
        const roots: Category[] = [];

        items.forEach(item => {
            map[item.id] = { ...item, children: [] };
        });

        items.forEach(item => {
            if (item.parent_id && map[item.parent_id]) {
                map[item.parent_id].children?.push(map[item.id]);
            } else {
                roots.push(map[item.id]);
            }
        });

        return roots;
    }

    // DÜZELTME: React.Fragment kullanıldı ve key atandı.
    const renderRow = (cat: Category, level = 0) => (
        <Fragment key={cat.id}>
            <tr className="tr-admin hover:bg-admin-input-bg transition-colors">
                <td className="td-admin">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
                        {level > 0 && <span className="text-gray-300">└─</span>}
                        <IoFolderOpen className="text-yellow-500" />
                        <span className="font-medium">{cat.name}</span>
                    </div>
                </td>
                <td className="td-admin text-xs text-admin-muted">{cat.slug}</td>
                <td className="td-admin">{cat.sort}</td>
                <td className="td-admin">
                    <span className={`badge-admin ${cat.active ? 'badge-admin-success' : 'badge-admin-default'}`}>
                        {cat.active ? 'Active' : 'Pasif'}
                    </span>
                </td>
                <td className="td-admin w-32 text-right">
                    <div className="flex justify-end gap-2">
                        <Link href={`/admin/categories/${cat.id}`} className="btn-admin btn-admin-secondary p-2">
                            <IoPencil />
                        </Link>
                        <button onClick={() => handleDelete(cat.id)} className="btn-admin btn-admin-danger p-2">
                            <IoTrash />
                        </button>
                    </div>
                </td>
            </tr>
            {/* Recursive çağrı */}
            {cat.children?.map(child => renderRow(child, level + 1))}
        </Fragment>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Categories</h2>
                <Link href="/admin/categories/new" className="btn-admin btn-admin-primary flex items-center gap-2">
                    <IoAdd /> Add Category
                </Link>
            </div>

            <div className="table-admin overflow-x-auto">
                <table className="w-full">
                    <thead className="thead-admin">
                        <tr>
                            <th className="th-admin">Category Name</th>
                            <th className="th-admin">Slug</th>
                            <th className="th-admin w-20">Sort</th>
                            <th className="th-admin w-24">Status</th>
                            <th className="th-admin text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="p-4 text-center">Yükleniyor...</td></tr>
                        ) : categories.length === 0 ? (
                            <tr><td colSpan={5} className="p-4 text-center">Kategori bulunamadı.</td></tr>
                        ) : (
                            categories.map(cat => renderRow(cat))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}