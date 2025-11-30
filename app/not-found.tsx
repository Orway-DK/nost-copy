export default function NotFound() {
    return (
        <div className="w-full flex flex-col items-center justify-center py-24">
            <h1 className="text-3xl font-bold mb-4">Sayfa bulunamadı</h1>
            <p className="text-gray-600 mb-6">
                Aradığınız içerik silinmiş veya hiç var olmamış olabilir.
            </p>
            <a
                href="/home"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            >
                Ana Sayfa
            </a>
        </div>
    );
}