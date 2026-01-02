// C:\Projeler\nost-copy\app\admin\(protected)\about\page.tsx

import { getAboutContentAction } from "./actions";
import AboutForm from "./about-form";

export const dynamic = "force-dynamic";

export default async function AboutAdminPage() {
  const res = await getAboutContentAction();
  const data = res.success ? res.data : {};

  return (
    <div className="h-full w-full flex flex-col p-4">
      {/* Header - Minimalist */}
      <div className="mb-6">
        <div className="flex flex-row gap-4 items-end">
          <h1 className="text-2xl font-bold text-[var(--admin-fg)]">
            Hakkımızda İçeriği
          </h1>
          <p className="text-[var(--admin-muted)] text-sm">
            Hakkımızda sayfasındaki metinleri ve istatistikleri yönetin. Dil
            seçenekleri (TR/EN/DE) ile çoklu dil desteği sağlayın.
          </p>
        </div>
      </div>
      <div className="h-1 w-12 bg-[var(--primary)] rounded-full mb-4 -mt-4"></div>

      {/* Form - Esnek alan kaplasın */}
      <div className="flex-1 min-h-0">
        <AboutForm initialData={data || {}} />
      </div>
    </div>
  );
}
