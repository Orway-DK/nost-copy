// CircularText.tsx
import styles from "./circular-text.module.css";
import { FaArrowLeftLong } from "react-icons/fa6";

export default function CircularText({ text }: { text: string }) {
  return (
    <section className="relative w-30 h-30 flex items-center justify-center place-items-center">
      <div className="relative rounded-full p-2 bg-white">
        {/* CSS Module içindeki .spin sınıfını kullan */}
        <div className={styles.spin}>
          <svg
            viewBox="0 0 200 200"
            className="block w-24 h-auto"
            aria-label="circular-text"
          >
            <defs>
              <path
                id="circlePath"
                d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0"
                fill="none"
                stroke="transparent"
              />
            </defs>

            <text fill="currentColor" style={{ letterSpacing: "0.2em" }}>
              <textPath
                href="#circlePath"
                startOffset="0"
                fontSize="24"
                textAnchor="start"
                lengthAdjust="spacingAndGlyphs"
                textLength="490"
              >
                {text}
              </textPath>
            </text>
          </svg>
        </div>

        {/* Tailwind’de geçerli sınıf: rotate-[225deg] */}
        <div className="absolute inset-0 flex items-center justify-center">
          <FaArrowLeftLong className="text-4xl text-blue-800 rotate-[225deg]" />
        </div>
      </div>
    </section>
  );
}
