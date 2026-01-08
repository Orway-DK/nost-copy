'use client'

import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef
} from 'react'
import jsPDF from 'jspdf'
import {
  CMYK,
  PaperSize,
  TemplateSpec,
  cmykToRgbString,
  getContrastColor,
  VariationMode,
  Channel
} from '../lib/constants'

const mmToPx = (mm: number) => mm * 3.7795

interface CanvasBoardProps {
  activePaper: PaperSize
  activeTemplate: TemplateSpec
  baseCmyk: CMYK
  settings: any
  variationMode: VariationMode
  showSafeZone: boolean
}

export interface CanvasBoardRef {
  exportPdf: (type: 'print' | 'cut') => void
  resetView: () => void
}

const CanvasBoard = forwardRef<CanvasBoardRef, CanvasBoardProps>(
  (props, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const [zoomLevel, setZoomLevel] = useState(0.4)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [gridData, setGridData] = useState<any[]>([])

    useEffect(() => {
      const paperW = props.activePaper.w
      const paperH = props.activePaper.h

      const {
        safeMarginTop,
        safeMarginBottom,
        safeMarginLeft,
        safeMarginRight
      } = props.activeTemplate

      const availableW = paperW - (safeMarginLeft + safeMarginRight)
      const availableH = paperH - (safeMarginTop + safeMarginBottom)

      const itemSpace = props.settings.patchSizeMm + props.settings.gapMm

      let rows = 0,
        cols = 0
      if (props.settings.isAutoFit) {
        cols = Math.floor((availableW + props.settings.gapMm) / itemSpace)
        rows = Math.floor((availableH + props.settings.gapMm) / itemSpace)
        rows = Math.max(1, rows)
        cols = Math.max(1, cols)
      } else {
        rows = props.settings.manualRows
        cols = props.settings.manualCols
      }

      const newGrid: any[] = []
      const centerRow = Math.floor(rows / 2)
      const centerCol = Math.floor(cols / 2)
      const opMultiplier = props.settings.operation === 'add' ? 1 : -1

      const totalGridWidth =
        cols * props.settings.patchSizeMm + (cols - 1) * props.settings.gapMm
      const totalGridHeight =
        rows * props.settings.patchSizeMm + (rows - 1) * props.settings.gapMm

      const startX = safeMarginLeft + (availableW - totalGridWidth) / 2
      const startY = safeMarginTop + (availableH - totalGridHeight) / 2

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let cc = { ...props.baseCmyk }

          if (props.variationMode === '2-axis') {
            const xOff = c - centerCol
            const yOff = r - centerRow
            cc[props.settings.xAxisChannel as Channel] +=
              xOff * props.settings.stepValue * opMultiplier
            cc[props.settings.yAxisChannel as Channel] +=
              yOff * props.settings.stepValue * opMultiplier
          } else {
            const yD = centerRow - r
            const xD = c - centerCol
            if (yD > 0)
              cc[props.settings.topChannel as Channel] +=
                yD * props.settings.stepValue * opMultiplier
            if (yD < 0)
              cc[props.settings.bottomChannel as Channel] +=
                Math.abs(yD) * props.settings.stepValue * opMultiplier
            if (xD > 0)
              cc[props.settings.rightChannel as Channel] +=
                xD * props.settings.stepValue * opMultiplier
            if (xD < 0)
              cc[props.settings.leftChannel as Channel] +=
                Math.abs(xD) * props.settings.stepValue * opMultiplier
          }

          ;(['c', 'm', 'y', 'k'] as Channel[]).forEach(
            k => (cc[k] = Math.max(0, Math.min(100, Math.round(cc[k]))))
          )

          newGrid.push({
            r,
            c,
            cmyk: cc,
            xMm:
              startX + c * (props.settings.patchSizeMm + props.settings.gapMm),
            yMm:
              startY + r * (props.settings.patchSizeMm + props.settings.gapMm),
            isCenter: r === centerRow && c === centerCol
          })
        }
      }
      setGridData(newGrid)
    }, [
      props.activePaper,
      props.activeTemplate,
      props.baseCmyk,
      props.settings,
      props.variationMode
    ])

    const drawCanvas = (ctx: CanvasRenderingContext2D) => {
      const w = ctx.canvas.width
      const h = ctx.canvas.height
      const patchPx = mmToPx(props.settings.patchSizeMm)

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)

      if (props.activeTemplate.type !== 'none') {
        ctx.fillStyle = '#000000'
        const m = mmToPx(5)
        if (props.activeTemplate.type === 'summa') {
          const box = mmToPx(4)
          ctx.fillRect(m, m, box, box)
          ctx.fillRect(w - m - box, m, box, box)
          ctx.fillRect(m, h - m - box, box, box)
          ctx.fillRect(w - m - box, h - m - box, box, box)
          ctx.fillRect(m + box + m, h - m - box / 2, w - 4 * m - 2 * box, 2)
        } else if (props.activeTemplate.type === 'plotter') {
          const rad = mmToPx(2.5)
          ;[
            [m * 2, m * 2],
            [w - m * 2, m * 2],
            [m * 2, h - m * 2],
            [w - m * 2, h - m * 2]
          ].forEach(([px, py]) => {
            ctx.beginPath()
            ctx.arc(px, py, rad, 0, 2 * Math.PI)
            ctx.fill()
          })
        }
      }

      gridData.forEach(box => {
        const xPx = mmToPx(box.xMm)
        const yPx = mmToPx(box.yMm)

        ctx.fillStyle = cmykToRgbString(
          box.cmyk.c,
          box.cmyk.m,
          box.cmyk.y,
          box.cmyk.k
        )
        ctx.fillRect(xPx, yPx, patchPx, patchPx)

        if (box.isCenter) {
          ctx.lineWidth = 3
          ctx.strokeStyle = '#ff0000'
          ctx.strokeRect(xPx, yPx, patchPx, patchPx)
        }

        ctx.fillStyle = getContrastColor(
          box.cmyk.c,
          box.cmyk.m,
          box.cmyk.y,
          box.cmyk.k
        )
        const fontSize = mmToPx(2.5)
        ctx.font = `${fontSize}px sans-serif`
        const p = mmToPx(1)
        ctx.fillText(`C:${box.cmyk.c}`, xPx + p, yPx + p + fontSize)
        ctx.fillText(`M:${box.cmyk.m}`, xPx + p, yPx + p + fontSize * 2.2)
        ctx.fillText(`Y:${box.cmyk.y}`, xPx + p, yPx + p + fontSize * 3.4)
        ctx.fillText(`K:${box.cmyk.k}`, xPx + p, yPx + p + fontSize * 4.6)
      })
    }

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      canvas.width = mmToPx(props.activePaper.w)
      canvas.height = mmToPx(props.activePaper.h)
      drawCanvas(ctx)
    }, [gridData, props.showSafeZone, props.activePaper])

    useImperativeHandle(ref, () => ({
      resetView: () => {
        setPan({ x: 0, y: 0 })
        setZoomLevel(0.4)
      },

      exportPdf: (type: 'print' | 'cut') => {
        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: [props.activePaper.w, props.activePaper.h]
        })

        const patchSize = props.settings.patchSizeMm

        // 1. Şablon Elemanlarını Vektörel Çiz (PDF Komutlarıyla)
        if (props.activeTemplate.type !== 'none') {
          pdf.setFillColor(0, 0, 0)
          const m = 5
          const w = props.activePaper.w
          const h = props.activePaper.h

          if (props.activeTemplate.type === 'summa') {
            const b = 4
            pdf.rect(m, m, b, b, 'F')
            pdf.rect(w - m - b, m, b, b, 'F')
            pdf.rect(m, h - m - b, b, b, 'F')
            pdf.rect(w - m - b, h - m - b, b, b, 'F')
            pdf.rect(m + b + m, h - m - b / 2, w - 4 * m - 2 * b, 0.5, 'F')
          } else if (props.activeTemplate.type === 'plotter') {
            const r = 2.5
            pdf.circle(m * 2, m * 2, r, 'F')
            pdf.circle(w - m * 2, m * 2, r, 'F')
            pdf.circle(m * 2, h - m * 2, r, 'F')
            pdf.circle(w - m * 2, h - m * 2, r, 'F')
          }
        }

        // 2. Kareleri ve Yazıları Vektörel Çiz
        gridData.forEach(box => {
          if (type === 'print') {
            // Kareyi Vektörel Çiz
            const rgb = [
              Math.round(255 * (1 - box.cmyk.c / 100) * (1 - box.cmyk.k / 100)),
              Math.round(255 * (1 - box.cmyk.m / 100) * (1 - box.cmyk.k / 100)),
              Math.round(255 * (1 - box.cmyk.y / 100) * (1 - box.cmyk.k / 100))
            ]
            pdf.setFillColor(rgb[0], rgb[1], rgb[2])
            pdf.rect(box.xMm, box.yMm, patchSize, patchSize, 'F')

            // Metinleri Vektörel Yaz
            const textColor = getContrastColor(
              box.cmyk.c,
              box.cmyk.m,
              box.cmyk.y,
              box.cmyk.k
            )
            pdf.setTextColor(textColor === '#ffffff' ? 255 : 0)
            pdf.setFontSize(7)
            const p = 1
            pdf.text(`C:${box.cmyk.c}`, box.xMm + p, box.yMm + p + 2)
            pdf.text(`M:${box.cmyk.m}`, box.xMm + p, box.yMm + p + 4.5)
            pdf.text(`Y:${box.cmyk.y}`, box.xMm + p, box.yMm + p + 7)
            pdf.text(`K:${box.cmyk.k}`, box.xMm + p, box.yMm + p + 9.5)
          } else {
            // Sadece Kesim Çizgisi (Vektörel)
            pdf.setDrawColor(0)
            pdf.setLineWidth(0.1)
            pdf.rect(box.xMm, box.yMm, patchSize, patchSize, 'S')
          }
        })

        const suffix = type === 'cut' ? 'BICAK' : 'BASKI'
        const templateName = props.activeTemplate.name.split(' ')[0]
        pdf.save(`${props.activePaper.id}_${templateName}_${suffix}.pdf`)
      }
    }))

    // Sürükleme ve Zoom Handlerları...
    const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault()
      setZoomLevel(prev => Math.min(3, Math.max(0.1, prev - e.deltaY * 0.001)))
    }

    return (
      <div
        ref={containerRef}
        className='flex-1 overflow-hidden relative cursor-move bg-gray-700 flex items-center justify-center touch-none'
        onWheel={handleWheel}
        onMouseDown={e => {
          if (e.button === 0) {
            setIsDragging(true)
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
          }
        }}
        onMouseMove={e => {
          if (isDragging)
            setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          className='shadow-2xl bg-white'
        >
          <canvas ref={canvasRef} className='block pointer-events-none' />
        </div>
      </div>
    )
  }
)

CanvasBoard.displayName = 'CanvasBoard'
export default CanvasBoard
