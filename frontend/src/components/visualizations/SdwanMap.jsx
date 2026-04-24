import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Tooltip } from '../common/Tooltip';

/**
 * SD-WAN topology map — hub-and-spoke visualization.
 *
 * Layout is a central HQ hub with three groups of endpoints radiating outward:
 *   - Branches on a top arc
 *   - OT plants on a bottom arc
 *   - Cloud providers on the right
 *
 * Connection lines are colored by aggregate overlay health affecting that
 * destination. Healthy links carry animated dash-offset "traffic dots" so
 * you can tell at a glance which paths are live. Problem endpoints pulse.
 *
 * Click any node to drill into its device detail page.
 */

const rad = (deg) => (deg * Math.PI) / 180;

// Hand-picked status for the 12 branches. Matches the mock fleet data.
const BRANCHES = [
  { short: 'sea', full: 'br-sea-01', status: 'warning' },  // drift
  { short: 'tac', full: 'br-tac-01', status: 'ok' },
  { short: 'spk', full: 'br-spk-01', status: 'ok' },
  { short: 'boi', full: 'br-boi-01', status: 'danger' },   // offline
  { short: 'pdx', full: 'br-pdx-01', status: 'ok' },
  { short: 'med', full: 'br-med-01', status: 'ok' },
  { short: 'eug', full: 'br-eug-01', status: 'ok' },
  { short: 'bza', full: 'br-bza-01', status: 'ok' },
  { short: 'hlv', full: 'br-hlv-01', status: 'ok' },
  { short: 'pas', full: 'br-pas-01', status: 'warning' },  // drift
  { short: 'tri', full: 'br-tri-01', status: 'ok' },
  { short: 'wsv', full: 'br-wsv-01', status: 'ok' },
];

const OT_PLANTS = [
  { short: 'P1',  full: 'ot-plant-01a', status: 'ok' },
  { short: 'P2',  full: 'ot-plant-02a', status: 'warning' }, // pending
  { short: 'P3',  full: 'ot-plant-03a', status: 'ok' },
  { short: 'P4',  full: 'ot-plant-04a', status: 'ok' },
  { short: 'P5',  full: 'ot-plant-05a', status: 'warning' }, // drift
  { short: 'P6',  full: 'ot-plant-06a', status: 'ok' },
  { short: 'P7',  full: 'ot-plant-07a', status: 'danger' },  // offline
  { short: 'P8',  full: 'ot-plant-08a', status: 'ok' },
];

const STATUS = {
  ok:      { stroke: '#10B981', fill: '#064E3B', ring: 'rgba(16,185,129,0.35)', flow: true,  dim: false },
  warning: { stroke: '#F59E0B', fill: '#78350F', ring: 'rgba(245,158,11,0.40)', flow: true,  dim: false },
  danger:  { stroke: '#EF4444', fill: '#7F1D1D', ring: 'rgba(239,68,68,0.45)',  flow: false, dim: false },
  standby: { stroke: '#64748B', fill: '#334155', ring: 'rgba(100,116,139,0.3)', flow: false, dim: true  },
};

function branchPos(i) {
  // Arc from 200° to 340° across the top
  const theta = 200 + i * (140 / 11);
  return {
    x: 500 + 250 * Math.cos(rad(theta)),
    y: 300 + 250 * Math.sin(rad(theta)),
    theta,
  };
}

function plantPos(i) {
  // Arc from 20° to 160° across the bottom
  const theta = 20 + i * (140 / 7);
  return {
    x: 500 + 230 * Math.cos(rad(theta)),
    y: 300 + 230 * Math.sin(rad(theta)),
    theta,
  };
}

function Link({ from, to, status, overlay, thickness = 1.5 }) {
  const s = STATUS[status] || STATUS.ok;
  // Curved path from HQ to endpoint — slight bow outward for visual interest
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  // Add perpendicular offset for curvature
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const perpX = -dy / len;
  const perpY = dx / len;
  const curveAmount = Math.min(18, len * 0.06);
  const ctrlX = midX + perpX * curveAmount;
  const ctrlY = midY + perpY * curveAmount;
  const d = `M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`;

  return (
    <g>
      {/* Base line */}
      <path
        d={d}
        stroke={s.stroke}
        strokeWidth={thickness}
        strokeOpacity={s.dim ? 0.35 : 0.7}
        strokeDasharray={s.dim ? '3 3' : 'none'}
        fill="none"
      />
      {/* Animated flow overlay on healthy links */}
      {s.flow && (
        <path
          d={d}
          stroke={s.stroke}
          strokeWidth={thickness + 1}
          strokeOpacity={0.9}
          strokeDasharray="2 16"
          strokeLinecap="round"
          fill="none"
          style={{ animation: 'flowDash 1.8s linear infinite' }}
        />
      )}
    </g>
  );
}

function EndpointNode({ pos, label, short, status, radius = 15, onClick, devices }) {
  const s = STATUS[status] || STATUS.ok;
  const pulse = status === 'danger' || status === 'warning';
  const labelY = pos.theta >= 180 ? pos.y - radius - 8 : pos.y + radius + 14;

  return (
    <g style={{ cursor: 'pointer' }} onClick={onClick}>
      {/* Pulse halo for problem nodes */}
      {pulse && (
        <circle
          cx={pos.x}
          cy={pos.y}
          r={radius + 6}
          fill="none"
          stroke={s.stroke}
          strokeWidth={1.5}
          opacity={0.4}
          style={{ animation: 'nodePulse 2s ease-in-out infinite' }}
        />
      )}
      {/* Outer ring */}
      <circle cx={pos.x} cy={pos.y} r={radius} fill={s.fill} stroke={s.stroke} strokeWidth={1.8} />
      {/* Label inside */}
      <text x={pos.x} y={pos.y + 3} textAnchor="middle" fontSize="9" fontWeight="600" fill="#F5F7FA" fontFamily="Plus Jakarta Sans, sans-serif">
        {short}
      </text>
      {/* Label outside */}
      <text x={pos.x} y={labelY} textAnchor="middle" fontSize="10" fill="#8A919C" fontFamily="Plus Jakarta Sans, sans-serif">
        {label}
      </text>
      {devices != null && (
        <text x={pos.x} y={labelY + 11} textAnchor="middle" fontSize="9" fill="#5A6169" fontFamily="JetBrains Mono, monospace">
          {devices}
        </text>
      )}
    </g>
  );
}

function HqNode({ onClick, hoverSet }) {
  return (
    <g style={{ cursor: 'pointer' }} onClick={onClick}>
      <circle cx={500} cy={300} r={55} fill="#0B2644" stroke="#378ADD" strokeWidth={2} />
      <circle cx={500} cy={300} r={62} fill="none" stroke="#378ADD" strokeWidth={1} opacity={0.25} />
      <text x={500} y={293} textAnchor="middle" fontSize="11" fontWeight="700" fill="#F5F7FA" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="0.04em">
        HQ SEATTLE
      </text>
      <text x={500} y={307} textAnchor="middle" fontSize="9.5" fill="#8DB8E6" fontFamily="Plus Jakarta Sans, sans-serif">
        hub · 7 devices
      </text>
      <text x={500} y={321} textAnchor="middle" fontSize="8.5" fill="#5A6169" fontFamily="JetBrains Mono, monospace">
        10.0.0.0/8
      </text>
    </g>
  );
}

function CloudNode({ pos, label, sub, status, onClick }) {
  const s = STATUS[status] || STATUS.ok;
  return (
    <g style={{ cursor: 'pointer' }} onClick={onClick}>
      {status === 'danger' && (
        <rect x={pos.x - 42} y={pos.y - 22} width={84} height={44} rx={10} fill="none" stroke={s.stroke} strokeWidth={1.5} opacity={0.4} style={{ animation: 'nodePulse 2s ease-in-out infinite' }} />
      )}
      <rect x={pos.x - 38} y={pos.y - 18} width={76} height={36} rx={8} fill={s.fill} stroke={s.stroke} strokeWidth={1.8} />
      <text x={pos.x} y={pos.y - 3} textAnchor="middle" fontSize="10" fontWeight="600" fill="#F5F7FA" fontFamily="Plus Jakarta Sans, sans-serif">
        {label}
      </text>
      <text x={pos.x} y={pos.y + 9} textAnchor="middle" fontSize="8.5" fill="#8A919C" fontFamily="JetBrains Mono, monospace">
        {sub}
      </text>
    </g>
  );
}

function Legend() {
  return (
    <g transform="translate(20, 540)">
      <rect x={0} y={0} width={320} height={44} rx={6} fill="rgba(17,20,26,0.85)" stroke="#2A3039" strokeWidth={0.5} />
      <g transform="translate(10, 12)" fontFamily="Plus Jakarta Sans, sans-serif">
        <g transform="translate(0, 0)">
          <line x1={0} y1={6} x2={18} y2={6} stroke="#10B981" strokeWidth={2} />
          <text x={22} y={9.5} fontSize="10" fill="#C4CAD3">Healthy</text>
        </g>
        <g transform="translate(80, 0)">
          <line x1={0} y1={6} x2={18} y2={6} stroke="#F59E0B" strokeWidth={2} />
          <text x={22} y={9.5} fontSize="10" fill="#C4CAD3">SLA warning</text>
        </g>
        <g transform="translate(175, 0)">
          <line x1={0} y1={6} x2={18} y2={6} stroke="#EF4444" strokeWidth={2} />
          <text x={22} y={9.5} fontSize="10" fill="#C4CAD3">Failing</text>
        </g>
        <g transform="translate(0, 20)">
          <line x1={0} y1={6} x2={18} y2={6} stroke="#64748B" strokeWidth={2} strokeDasharray="3 3" />
          <text x={22} y={9.5} fontSize="10" fill="#C4CAD3">Standby</text>
        </g>
        <g transform="translate(80, 20)">
          <circle cx={9} cy={6} r={5} fill="none" stroke="#EF4444" strokeWidth={1.2} opacity={0.6} />
          <text x={22} y={9.5} fontSize="10" fill="#C4CAD3">Needs attention</text>
        </g>
      </g>
    </g>
  );
}

export function SdwanMap({ overlays }) {
  const navigate = useNavigate();

  const go = (name) => navigate(`/devices/${encodeURIComponent(name)}`);
  const hq = { x: 500, y: 300 };

  // Aggregate status per overlay ring
  const criticalOverlays = overlays?.filter((o) => o.status === 'danger').length || 0;
  const warningOverlays = overlays?.filter((o) => o.status === 'warning').length || 0;

  return (
    <div className="relative">
      <style>{`
        @keyframes flowDash {
          to { stroke-dashoffset: -36; }
        }
        @keyframes nodePulse {
          0%, 100% { opacity: 0.2; transform-origin: center; }
          50% { opacity: 0.6; }
        }
      `}</style>

      <svg viewBox="0 0 1000 600" className="w-full h-[440px]" preserveAspectRatio="xMidYMid meet">
        {/* Subtle grid in background */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#171B22" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="hqGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#378ADD" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#378ADD" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1000" height="600" fill="url(#grid)" />

        {/* Ambient glow around HQ */}
        <circle cx={500} cy={300} r={140} fill="url(#hqGlow)" />

        {/* Region labels */}
        <text x={500} y={30} textAnchor="middle" fontSize="10" fill="#5A6169" letterSpacing="0.15em" fontFamily="Plus Jakarta Sans, sans-serif">
          BRANCHES · 12 SITES
        </text>
        <text x={500} y={580} textAnchor="middle" fontSize="10" fill="#5A6169" letterSpacing="0.15em" fontFamily="Plus Jakarta Sans, sans-serif">
          OT PLANTS · 8 SITES
        </text>
        <text x={875} y={30} textAnchor="middle" fontSize="10" fill="#5A6169" letterSpacing="0.15em" fontFamily="Plus Jakarta Sans, sans-serif">
          CLOUD
        </text>

        {/* Links first (underneath nodes) */}
        {BRANCHES.map((b, i) => {
          const pos = branchPos(i);
          return <Link key={`bl-${i}`} from={hq} to={pos} status={b.status} thickness={1.5} />;
        })}
        {OT_PLANTS.map((p, i) => {
          const pos = plantPos(i);
          return <Link key={`pl-${i}`} from={hq} to={pos} status={p.status} thickness={1.5} />;
        })}
        {/* Cloud links */}
        <Link from={hq} to={{ x: 870, y: 180 }} status="danger"  thickness={2} />
        <Link from={hq} to={{ x: 870, y: 420 }} status="ok"      thickness={2} />

        {/* HQ hub */}
        <HqNode />

        {/* Branch nodes */}
        {BRANCHES.map((b, i) => (
          <EndpointNode
            key={b.full}
            pos={branchPos(i)}
            label={b.short}
            short=""
            status={b.status}
            radius={12}
            onClick={() => go(b.full)}
          />
        ))}

        {/* OT nodes */}
        {OT_PLANTS.map((p, i) => (
          <EndpointNode
            key={p.full}
            pos={plantPos(i)}
            label={p.short}
            short=""
            status={p.status}
            radius={12}
            onClick={() => go(p.full)}
          />
        ))}

        {/* Cloud endpoints */}
        <CloudNode pos={{ x: 870, y: 180 }} label="Azure"        sub="wus2 · IPsec-ovl-a" status="danger" onClick={() => {}} />
        <CloudNode pos={{ x: 870, y: 420 }} label="AWS"          sub="us-w-2 · ovl-b"     status="ok"     onClick={() => {}} />

        <Legend />
      </svg>

      {/* Status pill in top-right corner */}
      <div className="absolute top-2 right-3 flex items-center gap-2">
        <div className="bg-surface-950/70 backdrop-blur ring-1 ring-surface-600/60 rounded-md px-2.5 py-1 flex items-center gap-2">
          {criticalOverlays > 0 ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10.5px] text-rose-300 font-medium">{criticalOverlays} failing</span>
            </>
          ) : warningOverlays > 0 ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10.5px] text-amber-300 font-medium">{warningOverlays} SLA warning</span>
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10.5px] text-emerald-300 font-medium">All healthy</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
