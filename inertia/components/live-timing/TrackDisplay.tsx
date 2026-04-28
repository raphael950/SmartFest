import "./live-timing.base.css";
import "./TrackDisplay.css";



interface TrackDisplayProps {
  circuitPath: string;
}

export default function TrackDisplay({ circuitPath }: TrackDisplayProps) {
  return (
    /*
     * lt-glass       → glassmorphism de base
     * lt-track-container → layout interne + overflow:visible
     *                      pour que le SVG ne soit JAMAIS rogné
     */
    <div className="lt-glass lt-track-container">

      <div />

      <div className="lt-track-svg-wrapper">
        <svg
          viewBox="0 0 500 300"
          className="lt-track-svg"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Circuit Bugatti — Le Mans"
        >
          <defs>
            {/* Dégradé rouge — illusion de profondeur sur le tracé */}
            <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#ff5544" />
              <stop offset="35%"  stopColor="#e8352a" />
              <stop offset="75%"  stopColor="#b82018" />
              <stop offset="100%" stopColor="#ff5544" />
            </linearGradient>


          </defs>

          {/* ── 1. Ombre portée décalée → effet sol / profondeur 3D ── */}
          <path
            d={circuitPath}
            fill="none"
            stroke="rgba(0,0,0,0.55)"
            strokeWidth="12"
            strokeLinejoin="round"
            strokeLinecap="round"
            transform="translate(4,6)"
          />

          {/* ── 3. Tracé principal coloré (sans glow) ── */}
          <path
            id="circuit"
            d={circuitPath}
            fill="none"
            stroke="url(#trackGrad)"
            strokeWidth="7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}