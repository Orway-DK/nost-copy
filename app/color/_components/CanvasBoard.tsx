import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import jsPDF from "jspdf";
import {
  CMYK,
  PaperSize,
  TemplateSpec,
  cmykToRgbString,
  getContrastColor,
  VariationMode,
  Channel,
} from "../lib/constants";

const mmToPx = (mm: number) => mm * 3.7795;

interface CanvasBoardProps {
  activePaper: PaperSize;
  activeTemplate: TemplateSpec;
  // isPortrait kaldırıldı
  baseCmyk: CMYK;
  settings: any;
  variationMode: VariationMode;
  showSafeZone: boolean;
}

export interface CanvasBoardRef {
  exportPdf: (type: "print" | "cut") => void;
  resetView: () => void;
}

const CanvasBoard = forwardRef<CanvasBoardRef, CanvasBoardProps>(
  (props, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [zoomLevel, setZoomLevel] = useState(0.4);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [gridData, setGridData] = useState<any[]>([]);

    // 1. Grid Hesaplama (Daima Dikey)
    useEffect(() => {
      // Kağıt ölçüleri (Daima W x H)
      const paperW = props.activePaper.w;
      const paperH = props.activePaper.h;

      // Şablon Marjinleri (Döndürme yok, direkt alıyoruz)
      const {
        safeMarginTop,
        safeMarginBottom,
        safeMarginLeft,
        safeMarginRight,
      } = props.activeTemplate;

      // Kullanılabilir alan
      const availableW = paperW - (safeMarginLeft + safeMarginRight);
      const availableH = paperH - (safeMarginTop + safeMarginBottom);

      // Grid hesabı
      const itemSpace = props.settings.patchSizeMm + props.settings.gapMm;

      let rows = 0,
        cols = 0;
      if (props.settings.isAutoFit) {
        cols = Math.floor((availableW + props.settings.gapMm) / itemSpace);
        rows = Math.floor((availableH + props.settings.gapMm) / itemSpace);
        rows = Math.max(1, rows);
        cols = Math.max(1, cols);
      } else {
        rows = props.settings.manualRows;
        cols = props.settings.manualCols;
      }

      const newGrid: any[] = [];
      const centerRow = Math.floor(rows / 2);
      const centerCol = Math.floor(cols / 2);
      const opMultiplier = props.settings.operation === "add" ? 1 : -1;

      const totalGridWidth =
        cols * mmToPx(props.settings.patchSizeMm) +
        (cols - 1) * mmToPx(props.settings.gapMm);
      const totalGridHeight =
        rows * mmToPx(props.settings.patchSizeMm) +
        (rows - 1) * mmToPx(props.settings.gapMm);

      // Başlangıç noktası
      const startX =
        mmToPx(safeMarginLeft) + (mmToPx(availableW) - totalGridWidth) / 2;
      const startY =
        mmToPx(safeMarginTop) + (mmToPx(availableH) - totalGridHeight) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let cc = { ...props.baseCmyk };

          if (props.variationMode === "2-axis") {
            const xOff = c - centerCol;
            const yOff = r - centerRow;
            cc[props.settings.xAxisChannel as Channel] +=
              xOff * props.settings.stepValue * opMultiplier;
            cc[props.settings.yAxisChannel as Channel] +=
              yOff * props.settings.stepValue * opMultiplier;
          } else {
            const yD = centerRow - r;
            const xD = c - centerCol;
            if (yD > 0)
              cc[props.settings.topChannel as Channel] +=
                yD * props.settings.stepValue * opMultiplier;
            if (yD < 0)
              cc[props.settings.bottomChannel as Channel] +=
                Math.abs(yD) * props.settings.stepValue * opMultiplier;
            if (xD > 0)
              cc[props.settings.rightChannel as Channel] +=
                xD * props.settings.stepValue * opMultiplier;
            if (xD < 0)
              cc[props.settings.leftChannel as Channel] +=
                Math.abs(xD) * props.settings.stepValue * opMultiplier;
          }

          (["c", "m", "y", "k"] as Channel[]).forEach(
            (k) => (cc[k] = Math.max(0, Math.min(100, Math.round(cc[k]))))
          );

          const xPos =
            startX +
            c *
              (mmToPx(props.settings.patchSizeMm) +
                mmToPx(props.settings.gapMm));
          const yPos =
            startY +
            r *
              (mmToPx(props.settings.patchSizeMm) +
                mmToPx(props.settings.gapMm));

          newGrid.push({
            r,
            c,
            cmyk: cc,
            x: xPos,
            y: yPos,
            isCenter: r === centerRow && c === centerCol,
          });
        }
      }
      setGridData(newGrid);
    }, [
      props.activePaper,
      props.activeTemplate,
      props.baseCmyk,
      props.settings,
      props.variationMode,
    ]);

    // 2. Çizim Fonksiyonu
    const drawCanvas = (
      ctx: CanvasRenderingContext2D,
      renderType: "screen" | "print" | "cut"
    ) => {
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      const patchPx = mmToPx(props.settings.patchSizeMm);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);

      // --- ŞABLON ÇİZİMİ (Sabit Dikey) ---
      if (props.activeTemplate.type !== "none") {
        ctx.fillStyle = "#000000";
        ctx.strokeStyle = "#000000";
        const m = mmToPx(5);

        if (props.activeTemplate.type === "summa") {
          const box = mmToPx(4);
          ctx.fillRect(m, m, box, box); // Sol Üst
          ctx.fillRect(w - m - box, m, box, box); // Sağ Üst
          ctx.fillRect(m, h - m - box, box, box); // Sol Alt
          ctx.fillRect(w - m - box, h - m - box, box, box); // Sağ Alt

          // Barcode Çizgisi: Her zaman altta (Dikey kağıt, kısa kenar altı)
          ctx.fillRect(m + box + m, h - m - box / 2, w - 4 * m - 2 * box, 2);
        } else if (props.activeTemplate.type === "plotter") {
          const rad = mmToPx(2.5);
          ctx.beginPath();
          ctx.arc(m * 2, m * 2, rad, 0, 2 * Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(w - m * 2, m * 2, rad, 0, 2 * Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(m * 2, h - m * 2, rad, 0, 2 * Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(w - m * 2, h - m * 2, rad, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      // --- GRID ÇİZİMİ ---
      gridData.forEach((box) => {
        if (renderType === "cut") {
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(box.x, box.y, patchPx, patchPx);
        } else {
          ctx.fillStyle = cmykToRgbString(
            box.cmyk.c,
            box.cmyk.m,
            box.cmyk.y,
            box.cmyk.k
          );
          ctx.fillRect(box.x, box.y, patchPx, patchPx);

          if (box.isCenter) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#ff0000";
            ctx.strokeRect(box.x, box.y, patchPx, patchPx);
          }

          ctx.fillStyle = getContrastColor(
            box.cmyk.c,
            box.cmyk.m,
            box.cmyk.y,
            box.cmyk.k
          );
          const fontSize = mmToPx(2.5);
          ctx.font = `${fontSize}px sans-serif`;
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          const p = mmToPx(1);
          ctx.fillText(`C:${box.cmyk.c}`, box.x + p, box.y + p);
          ctx.fillText(
            `M:${box.cmyk.m}`,
            box.x + p,
            box.y + p + fontSize * 1.2
          );
          ctx.fillText(
            `Y:${box.cmyk.y}`,
            box.x + p,
            box.y + p + fontSize * 2.4
          );
          ctx.fillText(
            `K:${box.cmyk.k}`,
            box.x + p,
            box.y + p + fontSize * 3.6
          );
        }
      });

      // --- GÜVENLİ ALAN (Screen only) ---
      if (renderType === "screen" && props.showSafeZone) {
        const {
          safeMarginTop,
          safeMarginBottom,
          safeMarginLeft,
          safeMarginRight,
        } = props.activeTemplate;
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          mmToPx(safeMarginLeft),
          mmToPx(safeMarginTop),
          w - mmToPx(safeMarginLeft + safeMarginRight),
          h - mmToPx(safeMarginTop + safeMarginBottom)
        );
        ctx.setLineDash([]);
      }
    };

    // 3. Render Loop
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = props.activePaper.w;
      const h = props.activePaper.h;

      canvas.width = mmToPx(w);
      canvas.height = mmToPx(h);

      drawCanvas(ctx, "screen");
    }, [gridData, props.showSafeZone, props.activePaper]);

    // 4. Export
    useImperativeHandle(ref, () => ({
      resetView: () => {
        setPan({ x: 0, y: 0 });
        setZoomLevel(0.4);
      },

      exportPdf: (type: "print" | "cut") => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tCtx = tempCanvas.getContext("2d");
        if (!tCtx) return;
        drawCanvas(tCtx, type);

        const pdf = new jsPDF({
          orientation: "p", // Her zaman Portrait
          unit: "mm",
          format: [props.activePaper.w, props.activePaper.h],
        });

        const imgData = tempCanvas.toDataURL("image/jpeg", 1.0);
        pdf.addImage(
          imgData,
          "JPEG",
          0,
          0,
          props.activePaper.w,
          props.activePaper.h
        );

        const suffix = type === "cut" ? "BICAK" : "BASKI";
        const templateName = props.activeTemplate.name.split(" ")[0];
        pdf.save(`${props.activePaper.id}_${templateName}_${suffix}.pdf`);
      },
    }));

    // Event Handlers
    const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      setZoomLevel((prev) =>
        Math.min(3, Math.max(0.1, prev - e.deltaY * 0.001))
      );
    };

    return (
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative cursor-move bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] flex items-center justify-center"
        onWheel={handleWheel}
        onMouseDown={(e) => {
          if (e.button === 0) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
          }
        }}
        onMouseMove={(e) => {
          if (isDragging)
            setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
          className="shadow-2xl bg-white"
        >
          <canvas ref={canvasRef} className="block pointer-events-none" />
        </div>
      </div>
    );
  }
);

CanvasBoard.displayName = "CanvasBoard";
export default CanvasBoard;
