import React from "react";
import {
  PaperSize,
  PAPER_PRESETS,
  TemplateSpec,
  TEMPLATE_PRESETS,
  VariationMode,
} from "../lib/constants";

interface NavbarProps {
  activePaper: PaperSize;
  setActivePaper: (p: PaperSize) => void;
  activeTemplate: TemplateSpec;
  setActiveTemplate: (t: TemplateSpec) => void;
  // isPortrait kaldırıldı
  variationMode: VariationMode;
  setVariationMode: (v: VariationMode) => void;
  showSafeZone: boolean;
  setShowSafeZone: (v: boolean) => void;
  onExportPdf: (type: "print" | "cut") => void;
  onResetView: () => void;
  zoomLevel: number;
  setZoomLevel: any;
}

const Navbar: React.FC<NavbarProps> = (props) => {
  return (
    <div className="h-16 bg-gray-800 flex items-center justify-between px-4 shadow-md text-white z-10 shrink-0 overflow-x-auto overflow-y-hidden">
      <div className="flex items-center justify-between w-full min-w-[600px]">
        {/* SOL: Ayarlar */}
        <div className="flex items-center space-x-4">
          {/* Kağıt */}
          <div className="flex flex-col shrink-0">
            <span className="text-[9px] text-gray-400 font-bold uppercase">
              Kağıt
            </span>
            <select
              value={props.activePaper.id}
              onChange={(e) =>
                props.setActivePaper(
                  PAPER_PRESETS.find((p) => p.id === e.target.value)!
                )
              }
              className="bg-gray-700 text-white text-xs border border-gray-600 rounded px-2 py-1 cursor-pointer"
            >
              {PAPER_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Şablon */}
          <div className="flex flex-col shrink-0">
            <span className="text-[9px] text-blue-400 font-bold uppercase">
              Kesim Şablonu
            </span>
            <select
              value={props.activeTemplate.id}
              onChange={(e) =>
                props.setActiveTemplate(
                  TEMPLATE_PRESETS.find((t) => t.id === e.target.value)!
                )
              }
              className="bg-gray-700 text-white text-xs border border-blue-500 rounded px-2 py-1 cursor-pointer"
            >
              {TEMPLATE_PRESETS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mod Toggle (Yön butonu gitti) */}
          <div className="flex flex-col shrink-0">
            <span className="text-[9px] text-gray-400 font-bold uppercase">
              Mod
            </span>
            <div className="flex bg-gray-700 rounded p-0.5 border border-gray-600">
              <button
                onClick={() => props.setVariationMode("2-axis")}
                className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                  props.variationMode === "2-axis"
                    ? "bg-blue-600"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                2-Eksen
              </button>
              <button
                onClick={() => props.setVariationMode("4-way")}
                className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                  props.variationMode === "4-way"
                    ? "bg-purple-600"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                4-Yön
              </button>
            </div>
          </div>
        </div>

        {/* ORTA: Görünüm Kontrol */}
        <div className="flex items-center space-x-3 mx-4 shrink-0">
          <label className="flex items-center space-x-2 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={props.showSafeZone}
              onChange={(e) => props.setShowSafeZone(e.target.checked)}
              className="rounded text-blue-500 focus:ring-0 bg-gray-700 border-gray-600"
            />
            <span className="text-gray-300 whitespace-nowrap">
              Güvenli Alan
            </span>
          </label>
          <div className="h-6 w-px bg-gray-600"></div>
          <button
            onClick={props.onResetView}
            className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded border border-gray-600 whitespace-nowrap"
          >
            Ortala
          </button>
        </div>

        {/* SAĞ: Export */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => props.onExportPdf("cut")}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs border border-gray-500 transition flex flex-col items-center leading-none min-w-[70px]"
          >
            <span className="font-bold whitespace-nowrap">BIÇAK PDF</span>
            <span className="text-[9px] text-gray-400 mt-0.5">
              Sadece Çizgi
            </span>
          </button>

          <button
            onClick={() => props.onExportPdf("print")}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded text-xs shadow-lg transition flex flex-col items-center leading-none min-w-[80px]"
          >
            <span className="font-bold whitespace-nowrap">BASKI PDF</span>
            <span className="text-[9px] text-red-200 mt-0.5">Full Çıktı</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
