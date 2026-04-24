import { Tile } from '../components/common/Tile';
import { Construction } from 'lucide-react';

/**
 * Placeholder used by any route that isn't fully built yet. Gives a
 * coherent "coming in v0.2" surface so nav doesn't dead-end.
 */
export default function Placeholder({ title, note }) {
  return (
    <div className="animate-fade-in">
      <Tile title={title} icon={Construction}>
        <p className="text-[13px] text-ink-200">
          This view is on the v0.2 roadmap.
        </p>
        {note && <p className="text-[12px] text-ink-400 mt-2">{note}</p>}
      </Tile>
    </div>
  );
}
