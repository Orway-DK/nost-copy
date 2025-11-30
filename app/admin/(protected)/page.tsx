export default function AdminHome() {
    return (
        <div className="flex flex-col gap-8">
            <div className="max-w-6xl">
                <h2 className="text-2xl font-semibold mb-2">Admin Panel</h2>
                <p className="text-admin-muted">Hoş geldiniz.</p>
            </div>

            <div className="max-w-6xl">
                <h2 className="text-2xl font-semibold mb-2">İkinci Bölüm</h2>
                <p className="text-admin-muted">Sidebar sabit, kendi scroll’u var; navbar üstte sabit.</p>
            </div>

            <div className="max-w-6xl">
                <h2 className="text-2xl font-semibold mb-2">Uzun İçerik</h2>
                <div className="space-y-6 mt-6">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <p key={i} className="text-sm">
                            Paragraf {i + 1}: içerik örneği.
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
}