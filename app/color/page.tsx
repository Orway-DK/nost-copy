"use client";

import React, { useState, useRef } from "react";
import {
  CMYK,
  PaperSize,
  PAPER_PRESETS,
  TemplateSpec,
  TEMPLATE_PRESETS,
  VariationMode,
  OperationMode,
} from "./lib/constants";
import Sidebar from "./_components/Sidebar";
import Navbar from "./_components/Navbar";
import CanvasBoard, { CanvasBoardRef } from "./_components/CanvasBoard";

export default function Home() {
  const [baseCmyk, setBaseCmyk] = useState<CMYK>({ c: 40, m: 40, y: 40, k: 0 });
  const [activePaper, setActivePaper] = useState<PaperSize>(PAPER_PRESETS[1]);
  const [activeTemplate, setActiveTemplate] = useState<TemplateSpec>(
    TEMPLATE_PRESETS[0]
  );
  // isPortrait kaldırıldı
  const [variationMode, setVariationMode] = useState<VariationMode>("4-way");
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(0.4);

  const [settings, setSettings] = useState({
    patchSizeMm: 20,
    gapMm: 3,
    stepValue: 5,
    xAxisChannel: "c",
    yAxisChannel: "m",
    topChannel: "k",
    bottomChannel: "c",
    leftChannel: "y",
    rightChannel: "m",
    operation: "add" as OperationMode,
    isAutoFit: true,
    manualRows: 5,
    manualCols: 5,
  });

  const canvasRef = useRef<CanvasBoardRef>(null);

  const handleExport = (type: "print" | "cut") => {
    canvasRef.current?.exportPdf(type);
  };

  const handleReset = () => {
    canvasRef.current?.resetView();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-gray-100 font-sans select-none">
      <Sidebar
        baseCmyk={baseCmyk}
        setBaseCmyk={setBaseCmyk}
        settings={settings}
        setSettings={setSettings}
        variationMode={variationMode}
      />

      <main className="flex-1 flex flex-col h-full bg-gray-600 relative">
        <Navbar
          activePaper={activePaper}
          setActivePaper={setActivePaper}
          activeTemplate={activeTemplate}
          setActiveTemplate={setActiveTemplate}
          // isPortrait prop'u silindi
          variationMode={variationMode}
          setVariationMode={setVariationMode}
          showSafeZone={showSafeZone}
          setShowSafeZone={setShowSafeZone}
          onExportPdf={handleExport}
          onResetView={handleReset}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
        />

        <CanvasBoard
          ref={canvasRef}
          activePaper={activePaper}
          activeTemplate={activeTemplate}
          // isPortrait prop'u silindi
          baseCmyk={baseCmyk}
          settings={settings}
          variationMode={variationMode}
          showSafeZone={showSafeZone}
        />
      </main>
    </div>
  );
}
