// app/admin/(protected)/categories/[id]/page.tsx
import { Suspense } from "react";
import CategoryForm from "./_components/CategoryForm";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CategoryDetailPage(props: PageProps) {
    const params = await props.params;
    const isNew = params.id === "new";
    const categoryId = isNew ? null : parseInt(params.id);
    const title = isNew ? "Add New Category" : `Edit Category (ID: ${params.id})`;

    return (
        <div className="grid gap-6">
            <h2 className="text-2xl font-semibold">{title}</h2>

            <div className="border-b border-admin-border mb-4">
                <nav className="flex space-x-4">
                    <span className="pb-3 border-b-2 border-admin-accent text-admin-accent font-medium">
                        Category Details
                    </span>
                </nav>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <CategoryForm categoryId={categoryId} isNew={isNew} />
            </Suspense>
        </div>
    );
}