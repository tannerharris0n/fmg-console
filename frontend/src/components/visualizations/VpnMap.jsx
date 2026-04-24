import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

/**
 * VPN topology map — IPsec tunnels and SSL-VPN user gateway.
 *
 * HQ hubs (hq-core + hq-dmz) sit in the left half. Remote endpoints on
 * the right. Tunnels are drawn as colored curves. Down tunnels flash.
 * SSL-VPN users are shown as a floating "users" bubble connected to
 * the HQ edge.
 */

const STATUS = {
  up:   { stroke: '#10B981', ring: 'rgba(16,185,129,0.35)' },
  down: { stroke: '#EF4444', ring: 'rgba(239,68,68,0.45)' },
};

const IPSEC_TOPOLOGY = [
  // Each tunnel: from = HQ hub, to = remote endpoint, status
  { id: 'br-sea-to-hq',       remote: 'br-sea-01',    hub: 'hq-core', status: 'up',   label: 'sea' },
  { id: 'br-tac-to-hq',       remote: 'br-tac-01',    hub: 'hq-core', status: 'up',   label: 'tac' },
  { id: 'br-spk-to-hq',       remote: 'br-spk-01',    hub: 'hq-core', status: 'up',   label: 'spk' },
  { id: 'br-boi-to-hq',       remote: 'br-boi-01',    hub: 'hq-core', status: 'down', label: 'boi' },
  { id: 'br-pdx-to-hq',       remote: 'br-pdx-01',    hub: 'hq-core', status: 'up',   label: 'pdx' },
  { id: 'ot-plant-01-to-dmz', remote: 'ot-plant-01a', hub: 'hq-dmz',  status: 'up',   label: 'P1' },
  { id: 'ot-plant-07a-to-dmz', remote: 'ot-plant-07a', hub: 'hq-dmz', status: 'down', label: 'P7' },
  { id: 'azure-wus2',          remote: 'azure-wus2',   hub: 'hq-core', status: 'up',  label: 'Azure wus2' },
];

const HUBS = {
  'hq-core': { x: 220, y: 220, label: 'HQ-Core', device: 'hq-core-01', color: '#378ADD' },
  'hq-dmz':  { x: 220, y: 420, label: 'HQ-DMZ',  device: 'hq-dmz-01',  color: '#8B5CF6' },
};

// Remote endpoint positions on the right side
function remotePos(i, total) {
  // Distribute along right side, y from 70 to 530
  const y = 70 + (i / (total - 1)) * 460;
  return { x: 800, y };
}

function HubNode({ hub, onClick }) {
  return (
    <g style={{ cursor: 'pointer' }} onClick={onClick}>
      <circle cx={hub.x} cy={hub.y} r={52} fill="#0B2644" stroke={hub.color} strokeWidth={2} />
      <circle cx={hub.x} cy={hub.y} r={58} fill="none" stroke={hub.color} strokeWidth={1} opacity={0.3} />
      <text x={hub.x} y={hub.y - 3} textAnchor="middle" fontSize="11" fontWeight="700" fill="#F5F7FA" letterSpacing="0.04em" fontFamily="Plus Jakarta Sans, sans-serif">
        {hub.label}
      </text>
      <text x={hub.x} y={hub.y + 11} textAnchor="middle" fontSize="9" fill="#8DB8E6" fontFamily="Plus Jakarta Sans, sans-serif">
        IPsec peer
      </text>
    </g>
  );
}

function RemoteNode({ pos, label, remote, status, onClick }) {
  const s = STATUS[status];
  const pulse = status === 'down';
  return (
    <g style={{ cursor: 'pointer' }} onClick={onClick}>
      {pulse && (
        <circle cx={pos.x} cy={pos.y} r={18} fill="none" stroke={s.stroke} strokeWidth={1.5} opacity={0.5} style={{ animation: 'nodePulse 2s ease-in-out infinite' }} />
      )}
      <rect x={pos.x - 52} y={pos.y - 13} width={104} height={26} rx={5} fill={status === 'up' ? '#0A2A1F' : '#2A0E0E'} stroke={s.stroke} strokeWidth={1.6} />
      <text x={pos.x} y={pos.y + 3.5} textAnchor="middle" fontSize="10" fontWeight="600" fill="#F5F7FA" fontFamily="Plus Jakarta Sans, sans-serif">
        {label}
      </text>
      <text x={pos.x} y={pos.y - 18} textAnchor="middle" fontSize="8.5" fill="#5A6169" fontFamily="JetBrains Mono, monospace">
        {remote}
      </text>
    </g>
  );
}

function Tunnel({ from, to, status }) {
  const s = STATUS[status];
  // Bezier curve — gentle S
  const ctrl1X = from.x + (to.x - from.x) * 0.4;
  const ctrl2X = from.x + (to.x - from.x) * 0.6;
  const d = `M ${from.x} ${from.y} C ${ctrl1X} ${from.y}, ${ctrl2X} ${to.y}, ${to.x} ${to.y}`;

  return (
    <g>
      <path
        d={d}
        stroke={s.stroke}
        strokeWidth={2}
        strokeOpacity={status === 'down' ? 0.5 : 0.75}
        strokeDasharray={status === 'down' ? '4 4' : 'none'}
        fill="none"
      />
      {status === 'up' && (
        <path
          d={d}
          stroke={s.stroke}
          strokeWidth={2.5}
          strokeOpacity={0.95}
          strokeDasharray="2 20"
          strokeLinecap="round"
          fill="none"
          style={{ animation: 'flowDash 2s linear infinite' }}
        />
      )}
    </g>
  );
}

function SslVpnBubble({ sessionCount, onClick }) {
  return (
    <g style={{ cursor: 'pointer' }} onClick={onClick}>
      <ellipse cx={400} cy={70} rx={70} ry={28} fill="#1E3A5F" stroke="#378ADD" strokeWidth={1.5} strokeDasharray="3 3" />
      <text x={400} y={62} textAnchor="middle" fontSize="10" fontWeight="600" fill="#8DB8E6" fontFamily="Plus Jakarta Sans, sans-serif">
        SSL-VPN
      </text>
      <text x={400} y={78} textAnchor="middle" fontSize="14" fontWeight="700" fill="#F5F7FA" fontFamily="Plus Jakarta Sans, sans-serif">
        {sessionCount}
      </text>
      <text x={400} y={90} textAnchor="middle" fontSize="8" fill="#8A919C" fontFamily="Plus Jakarta Sans, sans-serif">
        active sessions
      </text>
      {/* Line to HQ-Core */}
      <path d={`M 400 98 Q 320 140, 260 200`} stroke="#378ADD" strokeWidth={1.5} strokeOpacity={0.5} strokeDasharray="2 4" fill="none" />
      <path d={`M 400 98 Q 320 140, 260 200`} stroke="#378ADD" strokeWidth={2} strokeOpacity={0.9} strokeDasharray="2 20" strokeLinecap="round" fill="none" style={{ animation: 'flowDash 2.4s linear infinite' }} />
    </g>
  );
}

function Legend() {
  return (
    <g transform="translate(20, 545)">
      <rect x={0} y={0} width={220} height={40} rx={6} fill="rgba(17,20,26,0.85)" stroke="#2A3039" strokeWidth={0.5} />
      <g transform="translate(10, 13)" fontFamily="Plus Jakarta Sans, sans-serif">
        <g>
          <line x1={0} y1={5} x2={18} y2={5} stroke="#10B981" strokeWidth={2} />
          <text x={22} y={8.5} fontSize="10" fill="#C4CAD3">Tunnel up</text>
        </g>
        <g transform="translate(95, 0)">
          <line x1={0} y1={5} x2={18} y2={5} stroke="#EF4444" strokeWidth={2} strokeDasharray="3 3" />
          <text x={22} y={8.5} fontSize="10" fill="#C4CAD3">Tunnel down</text>
        </g>
        <g transform="translate(0, 18)">
          <line x1={0} y1={5} x2={18} y2={5} stroke="#378ADD" strokeWidth={1.5} strokeDasharray="2 2" />
          <text x={22} y={8.5} fontSize="10" fill="#C4CAD3">SSL-VPN session</text>
        </g>
      </g>
    </g>
  );
}

export function VpnMap({ ipsecTunnels = [], sslSessionCount = 0 }) {
  const navigate = useNavigate();
  const go = (name) => navigate(`/devices/${encodeURIComponent(name)}`);

  // Build topology view from live data when available, fall back to hardcoded topology
  const tunnels = IPSEC_TOPOLOGY.map((t, i) => {
    const live = ipsecTunnels.find((x) => x.id === t.id);
    return { ...t, status: live?.status || t.status, pos: remotePos(i, IPSEC_TOPOLOGY.length) };
  });

  const down = tunnels.filter((t) => t.status === 'down').length;
  const up = tunnels.length - down;

  return (
    <div className="relative">
      <style>{`
        @keyframes flowDash {
          to { stroke-dashoffset: -44; }
        }
        @keyframes nodePulse {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.7; }
        }
      `}</style>

      <svg viewBox="0 0 1000 600" className="w-full h-[460px]" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="gridV" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#171B22" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="1000" height="600" fill="url(#gridV)" />

        {/* Labels */}
        <text x={220} y={30} textAnchor="middle" fontSize="10" fill="#5A6169" letterSpacing="0.15em" fontFamily="Plus Jakarta Sans, sans-serif">
          HQ GATEWAYS
        </text>
        <text x={800} y={30} textAnchor="middle" fontSize="10" fill="#5A6169" letterSpacing="0.15em" fontFamily="Plus Jakarta Sans, sans-serif">
          REMOTE PEERS
        </text>

        {/* Tunnels drawn first */}
        {tunnels.map((t) => {
          const hub = HUBS[t.hub];
          return <Tunnel key={t.id} from={hub} to={t.pos} status={t.status} />;
        })}

        {/* HQ hubs */}
        <HubNode hub={HUBS['hq-core']} onClick={() => go('hq-core-01')} />
        <HubNode hub={HUBS['hq-dmz']}  onClick={() => go('hq-dmz-01')} />

        {/* Remote endpoints */}
        {tunnels.map((t) => (
          <RemoteNode key={t.id} pos={t.pos} label={t.label} remote={t.remote} status={t.status} onClick={() => go(t.remote)} />
        ))}

        {/* SSL-VPN user bubble */}
        <SslVpnBubble sessionCount={sslSessionCount} />

        <Legend />
      </svg>

      {/* Status pill */}
      <div className="absolute top-2 right-3 flex items-center gap-2">
        <div className="bg-surface-950/70 backdrop-blur ring-1 ring-surface-600/60 rounded-md px-2.5 py-1 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10.5px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-300 font-medium tabular-nums">{up} up</span>
          </span>
          {down > 0 && (
            <>
              <span className="text-ink-600">·</span>
              <span className="inline-flex items-center gap-1.5 text-[10.5px]">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-rose-300 font-medium tabular-nums">{down} down</span>
              </span>
            </>
          )}
          <span className="text-ink-600">·</span>
          <span className="inline-flex items-center gap-1.5 text-[10.5px] text-sky-300">
            <Users className="h-2.5 w-2.5" strokeWidth={2} />
            <span className="tabular-nums">{sslSessionCount} users</span>
          </span>
        </div>
      </div>
    </div>
  );
}
