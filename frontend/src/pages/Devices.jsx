import { Server } from 'lucide-react';
import { useDevices } from '../hooks/useDevices';
import { Tile } from '../components/common/Tile';
import { StatusDot } from '../components/common/StatusDot';

export default function Devices() {
  const { data = [], isLoading } = useDevices();

  return (
    <div className="space-y-3 animate-fade-in">
      <Tile title="All devices" subtitle={`${data.length} total`} icon={Server}>
        {isLoading ? (
          <div className="py-6 text-center text-ink-400 text-sm">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="text-ink-400 text-[11px] border-b border-surface-600/60">
                <tr>
                  <th className="py-2 px-2 font-medium">Status</th>
                  <th className="py-2 px-2 font-medium">Name</th>
                  <th className="py-2 px-2 font-medium">Platform</th>
                  <th className="py-2 px-2 font-medium">Firmware</th>
                  <th className="py-2 px-2 font-medium">Site</th>
                  <th className="py-2 px-2 font-medium">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800">
                {data.map((d) => (
                  <tr key={d.name} className="hover:bg-surface-800/50 transition">
                    <td className="py-2 px-2"><StatusDot status={d.status} /></td>
                    <td className="py-2 px-2 font-medium">{d.name}</td>
                    <td className="py-2 px-2 text-ink-400">{d.platform}</td>
                    <td className="py-2 px-2"><span className="code">{d.firmware}</span></td>
                    <td className="py-2 px-2 text-ink-400">{d.site || '—'}</td>
                    <td className="py-2 px-2 text-ink-400">{d.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Tile>
    </div>
  );
}
