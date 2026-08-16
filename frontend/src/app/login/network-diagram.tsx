/**
 * The "every branch reports to HQ" network illustration from the real
 * Super Admin Portal design (extracted 1:1 from the client's Claude
 * Design prototype — exact coordinates, colors, and the sa-pulse
 * animation timing). Six regional branch nodes connect to a central HQ
 * hub, echoing the tenant → branch data model this console manages.
 */
const BRANCHES = [
  { code: "NJ", cx: 70, cy: 60, delay: "0s" },
  { code: "AB", cx: 70, cy: 150, delay: "0.5s" },
  { code: "XY", cx: 70, cy: 240, delay: "1s" },
  { code: "SR", cx: 390, cy: 60, delay: "1.5s" },
  { code: "PT", cx: 390, cy: 150, delay: "2s" },
  { code: "KL", cx: 390, cy: 240, delay: "2.5s" },
];

export function NetworkDiagram() {
  return (
    <svg
      viewBox="0 0 460 300"
      width="100%"
      height="300"
      style={{ maxWidth: 460, display: "block", marginBottom: 12 }}
      role="img"
      aria-label="Diagram of six branch offices connected to a central headquarters hub"
    >
      <g stroke="#3E6FB0" strokeWidth={1.2} opacity={0.55}>
        <line x1={230} y1={150} x2={70} y2={60} />
        <line x1={230} y1={150} x2={70} y2={150} />
        <line x1={230} y1={150} x2={70} y2={240} />
        <line x1={230} y1={150} x2={390} y2={60} />
        <line x1={230} y1={150} x2={390} y2={150} />
        <line x1={230} y1={150} x2={390} y2={240} />
      </g>

      {BRANCHES.map((b) => (
        <circle
          key={`dot-${b.code}`}
          className="sa-dot"
          cx={(b.cx + 230) / 2}
          cy={(b.cy + 150) / 2}
          r={3}
          fill="#7FB2FF"
          style={{ animationDelay: b.delay }}
        />
      ))}

      <g>
        {BRANCHES.map((b) => (
          <g key={b.code}>
            <circle cx={b.cx} cy={b.cy} r={20} fill="#0E3868" stroke="#3E6FB0" strokeWidth={1.5} />
            <text
              x={b.cx}
              y={b.cy + 5}
              textAnchor="middle"
              fontFamily="IBM Plex Mono"
              fontSize={13}
              fill="#CFE0FA"
            >
              {b.code}
            </text>
          </g>
        ))}
      </g>

      <circle cx={230} cy={150} r={30} fill="#2F6FED" />
      <text
        x={230}
        y={155}
        textAnchor="middle"
        fontFamily="IBM Plex Mono"
        fontSize={13}
        fontWeight={600}
        fill="#fff"
      >
        HQ
      </text>
    </svg>
  );
}
