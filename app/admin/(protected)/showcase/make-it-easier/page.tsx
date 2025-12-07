import { getMakeItEasierAction, getSliderPartAction } from "./actions";
import MakeItEasierManager from "./make-it-easier-manager";

export const dynamic = "force-dynamic";

export default async function MakeItEasierPage() {
    const [sectionRes, sliderRes] = await Promise.all([
        getMakeItEasierAction(),
        getSliderPartAction()
    ]);

    return (
        <div className="grid gap-6">
            <div>
                <h2 className="text-2xl font-semibold" style={{ color: "var(--admin-fg)" }}>
                    İş Akışı & Kampanya Yönetimi
                </h2>
                <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
                    "3 Adımda Kolaylaştırın" bölümü ve altındaki kampanya slider'ını buradan yönetebilirsiniz.
                </p>
            </div>

            <MakeItEasierManager
                initialSection={sectionRes.data || null}
                initialSlider={sliderRes.data || null}
            />
        </div>
    );
}