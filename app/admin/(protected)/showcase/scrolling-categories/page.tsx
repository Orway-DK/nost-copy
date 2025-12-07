import ScrollingCategoriesList from "./scrolling-categories-list";
import { getScrollingCategoriesAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ScrollingCategoriesPage() {
    // Veriyi action üzerinden çekiyoruz
    const res = await getScrollingCategoriesAction();
    const categories = res.success ? res.data : [];

    return (
        <div className="grid gap-6">
            <div>
                <h2 className="text-2xl font-semibold" style={{ color: "var(--admin-fg)" }}>
                    Kayan Kategoriler
                </h2>
                <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
                    Anasayfadaki kayan bantta görünecek kategorilerin sırasını ve görünürlüğünü ayarlayın.
                </p>
            </div>

            <ScrollingCategoriesList initialItems={categories} />
        </div>
    );
}