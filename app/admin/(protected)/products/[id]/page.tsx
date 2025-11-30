// orway-dk/nost-copy/nost-copy-d541a3f124d8a8bc7c3eeea745918156697a239e/app/admin/(protected)/products/[id]/page.tsx
import ProductForm from "../[id]/_components/ProductForm";
import { Suspense } from "react";

// Next.js 15+ için params bir Promise'dir. Tip tanımını buna göre güncelliyoruz.
interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductDetailPage(props: PageProps) {
    // 1. Önce params Promise'ini çözüyoruz (await)
    const params = await props.params;

    // 2. Artık id'ye güvenle erişebiliriz
    const idString = params.id;
    const isNew = idString === "new";

    const productId = isNew ? null : parseInt(idString);
    const title = isNew ? "Add New Product" : `Edit Product (ID: ${idString})`;

    return (
        <div className="grid gap-6">
            <h2 className="text-2xl font-semibold">{title}</h2>

            <Suspense fallback={<div>Loading Product...</div>}>
                <ProductForm productId={productId} isNew={isNew} />
            </Suspense>
        </div>
    );
}