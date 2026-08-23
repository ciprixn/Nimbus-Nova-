interface Props {
  size?: number;
  className?: string;
}

/**
 * Nimbus Nova brand mark: NN monogram wrapped by an orbital signal ring.
 * Monochrome - inherits color via currentColor.
 */
export function Logo({ size = 28, className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <g transform="rotate(-26 32 32)">
        <ellipse cx="32" cy="33" rx="28" ry="12.5" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" transform="translate(0 -2)" />
      </g>
      <text
        x="32"
        y="40"
        textAnchor="middle"
        fill="currentColor"
        style={{
          fontFamily: "'Outfit Variable', sans-serif",
          fontWeight: 900,
          fontSize: "24px",
          letterSpacing: "-0.5px",
        }}
      >
        NN
      </text>
      <g transform="rotate(-26 32 32)">
        <ellipse cx="32" cy="33" rx="27" ry="11.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" pathLength={100} strokeDasharray="42 58" strokeDashoffset="-34" />
      </g>
    </svg>
  );
}
