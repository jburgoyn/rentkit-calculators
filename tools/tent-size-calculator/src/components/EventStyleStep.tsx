import type { EventStyle } from '../calculator/types';
import { EVENT_STYLE_LABELS } from '../calculator/constants';

interface EventStyleStepProps {
  eventStyle: EventStyle;
  onChange: (s: EventStyle) => void;
}

const STYLES: EventStyle[] = [
  'reception_seated',
  'reception_buffet',
  'cocktail',
  'ceremony_only',
  'ceremony_and_reception',
  'corporate',
];

const ICONS: Record<EventStyle, string> = {
  ceremony_only: '💒',
  reception_seated: '🍽️',
  reception_buffet: '🍴',
  cocktail: '🥂',
  ceremony_and_reception: '💒',
  corporate: '🏢',
};

export function EventStyleStep({ eventStyle, onChange }: EventStyleStepProps) {
  return (
    <div className="card">
      <h2 className="card-title">Step 2: Event style</h2>
      <div className="event-style-grid">
        {STYLES.map((style) => (
          <button
            key={style}
            type="button"
            className={`event-style-card ${eventStyle === style ? 'active' : ''}`}
            onClick={() => onChange(style)}
            aria-pressed={eventStyle === style}
          >
            <span className="event-style-icon" aria-hidden>
              {ICONS[style]}
            </span>
            <span className="event-style-label">{EVENT_STYLE_LABELS[style]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
