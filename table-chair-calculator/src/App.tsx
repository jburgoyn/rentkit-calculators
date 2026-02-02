import { useMemo, useState } from 'react';
import type {
  EventStyle,
  TableType,
  ChairType,
  AdditionalTables,
  CalculatorInput,
} from './types';
import { calculateTablesAndChairs } from './calculator';
import type { EmbedConfig } from './embed-config';
import './App.css';

const EVENT_STYLES: { value: EventStyle; label: string }[] = [
  { value: 'seated_dinner', label: 'Seated Dinner' },
  { value: 'buffet', label: 'Buffet' },
  { value: 'cocktail', label: 'Cocktail/Standing' },
  { value: 'ceremony', label: 'Ceremony Only' },
  { value: 'mixed', label: 'Mixed (Ceremony + Reception)' },
];

const CHAIR_TYPES: { value: ChairType; label: string }[] = [
  { value: 'folding', label: 'Folding chairs' },
  { value: 'chiavari', label: 'Chiavari chairs' },
  { value: 'crossback', label: 'Cross-back chairs' },
  { value: 'ghost', label: 'Ghost chairs' },
  { value: 'banquet_padded', label: 'Padded banquet chairs' },
];

const TABLE_DISPLAY_ORDER: TableType[] = [
  'round_48',
  'round_60',
  'round_72',
  'banquet_6ft',
  'banquet_8ft',
  'square_36',
  'square_48',
  'farm',
];

function getTableShortLabel(type: TableType): string {
  const m: Record<TableType, string> = {
    round_48: '48"',
    round_60: '60"',
    round_72: '72"',
    banquet_6ft: '6ft',
    banquet_8ft: '8ft',
    square_36: '36"',
    square_48: '48"',
    cocktail: 'Cocktail',
    sweetheart: 'Sweetheart',
    farm: 'Farm',
  };
  return m[type] || type;
}

function getTableSubLabel(type: TableType): string {
  const m: Record<TableType, string> = {
    round_48: 'Round',
    round_60: 'Round',
    round_72: 'Round',
    banquet_6ft: 'Rect',
    banquet_8ft: 'Rect',
    square_36: 'Square',
    square_48: 'Square',
    cocktail: 'Highboy',
    sweetheart: 'Table',
    farm: 'Table',
  };
  return m[type] || '';
}

interface AppProps {
  config: EmbedConfig;
}

export default function App({ config }: AppProps) {
  const [guestCount, setGuestCount] = useState(150);
  const [eventStyle, setEventStyle] = useState<EventStyle>('seated_dinner');
  const [primaryTable, setPrimaryTable] = useState<TableType>('round_60');
  const [chairStyle, setChairStyle] = useState<ChairType>('chiavari');
  const [additionalTables, setAdditionalTables] = useState<AdditionalTables>({
    headTable: { seats: 12 },
    sweetheartTable: true,
    giftTable: true,
    djTable: true,
  });
  const [headTableSeats, setHeadTableSeats] = useState(12);
  const [quoteEmail, setQuoteEmail] = useState('');

  const input: CalculatorInput = useMemo(
    () => ({
      guestCount: Math.max(1, guestCount),
      eventStyle,
      tablePreferences: { primary: primaryTable, allowMixed: false },
      additionalTables: {
        ...additionalTables,
        headTable:
          additionalTables.headTable != null
            ? { seats: headTableSeats }
            : undefined,
      },
      chairStyle,
    }),
    [
      guestCount,
      eventStyle,
      primaryTable,
      chairStyle,
      additionalTables,
      headTableSeats,
    ]
  );

  const result = useMemo(() => calculateTablesAndChairs(input), [input]);

  const toggleAdditional = (key: keyof AdditionalTables, value?: unknown) => {
    setAdditionalTables((prev) => {
      const next = { ...prev };
      if (value === undefined) {
        if (key === 'headTable') {
          next.headTable = next.headTable ? undefined : { seats: 8 };
          setHeadTableSeats(8);
        } else {
          (next as Record<string, unknown>)[key] = !(prev as Record<string, unknown>)[key];
        }
      } else {
        (next as Record<string, unknown>)[key] = value;
      }
      return next;
    });
  };

  const chairLabel =
    CHAIR_TYPES.find((c) => c.value === chairStyle)?.label ?? 'Chairs';

  return (
    <div
      className="tcc"
      style={
        {
          '--tcc-primary': config.primaryColor,
        } as React.CSSProperties
      }
    >
      <header className="tcc-header">
        <h1 className="tcc-title">
          <span className="tcc-title-icon" aria-hidden>
            🪑
          </span>
          Table & Chair Calculator
        </h1>
      </header>

      <div className="tcc-grid">
        <div>
          <section className="tcc-section">
            <h2 className="tcc-section-title">How many guests?</h2>
            <input
              type="number"
              className="tcc-input"
              min={1}
              max={2000}
              value={guestCount}
              onChange={(e) =>
                setGuestCount(Math.max(1, parseInt(e.target.value, 10) || 1))
              }
              aria-label="Total guest count"
            />
            <span style={{ marginLeft: 8, color: 'rgba(0,0,0,0.6)' }}>
              guests
            </span>
          </section>

          <section className="tcc-section">
            <h2 className="tcc-section-title">What type of event?</h2>
            <div className="tcc-options">
              {EVENT_STYLES.map(({ value, label }) => (
                <label
                  key={value}
                  className={`tcc-option ${eventStyle === value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="eventStyle"
                    value={value}
                    checked={eventStyle === value}
                    onChange={() => setEventStyle(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>

          <section className="tcc-section">
            <h2 className="tcc-section-title">Preferred table style?</h2>
            <div className="tcc-table-cards">
              {TABLE_DISPLAY_ORDER.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`tcc-table-card ${primaryTable === type ? 'selected' : ''}`}
                  onClick={() => setPrimaryTable(type)}
                >
                  <div className="tcc-table-card-size">
                    {getTableShortLabel(type)}
                  </div>
                  <div className="tcc-table-card-type">
                    {getTableSubLabel(type)}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="tcc-section">
            <h2 className="tcc-section-title">Chair style (for quote)</h2>
            <select
              className="tcc-select"
              value={chairStyle}
              onChange={(e) => setChairStyle(e.target.value as ChairType)}
              aria-label="Chair style"
            >
              {CHAIR_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </section>

          <section className="tcc-section">
            <h2 className="tcc-section-title">Additional needs?</h2>
            <div className="tcc-checkboxes">
              <label className="tcc-checkbox-label">
                <input
                  type="checkbox"
                  checked={additionalTables.headTable != null}
                  onChange={() => toggleAdditional('headTable')}
                />
                Head table
                {additionalTables.headTable != null && (
                  <input
                    type="number"
                    className="tcc-checkbox-inline"
                    min={2}
                    max={30}
                    value={headTableSeats}
                    onChange={(e) =>
                      setHeadTableSeats(
                        Math.max(2, parseInt(e.target.value, 10) || 2)
                      )
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                seats
              </label>
              <label className="tcc-checkbox-label">
                <input
                  type="checkbox"
                  checked={!!additionalTables.sweetheartTable}
                  onChange={() => toggleAdditional('sweetheartTable')}
                />
                Sweetheart table
              </label>
              <label className="tcc-checkbox-label">
                <input
                  type="checkbox"
                  checked={!!additionalTables.giftTable}
                  onChange={() => toggleAdditional('giftTable')}
                />
                Gift table
              </label>
              <label className="tcc-checkbox-label">
                <input
                  type="checkbox"
                  checked={!!additionalTables.signInTable}
                  onChange={() => toggleAdditional('signInTable')}
                />
                Sign-in table
              </label>
              <label className="tcc-checkbox-label">
                <input
                  type="checkbox"
                  checked={!!additionalTables.cakeTable}
                  onChange={() => toggleAdditional('cakeTable')}
                />
                Cake table
              </label>
              <label className="tcc-checkbox-label">
                <input
                  type="checkbox"
                  checked={!!additionalTables.djTable}
                  onChange={() => toggleAdditional('djTable')}
                />
                DJ/band table
              </label>
              <label className="tcc-checkbox-label">
                <input
                  type="checkbox"
                  checked={!!additionalTables.photoBoothTable}
                  onChange={() => toggleAdditional('photoBoothTable')}
                />
                Photo booth
              </label>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <label className="tcc-checkbox-label">
                Food stations
                <input
                  type="number"
                  className="tcc-checkbox-inline"
                  min={0}
                  max={20}
                  value={additionalTables.foodStations ?? 0}
                  onChange={(e) =>
                    setAdditionalTables((prev) => ({
                      ...prev,
                      foodStations: Math.max(0, parseInt(e.target.value, 10) || 0),
                    }))
                  }
                />
              </label>
              <label className="tcc-checkbox-label">
                Bar stations
                <input
                  type="number"
                  className="tcc-checkbox-inline"
                  min={0}
                  max={20}
                  value={additionalTables.barStations ?? 0}
                  onChange={(e) =>
                    setAdditionalTables((prev) => ({
                      ...prev,
                      barStations: Math.max(0, parseInt(e.target.value, 10) || 0),
                    }))
                  }
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="tcc-preview">
          <div className="tcc-preview-visual" aria-hidden>
            🪑
          </div>
          <p style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.6)', margin: 0 }}>
            Your results update as you change options below.
          </p>
        </aside>
      </div>

      <section className="tcc-results">
        <h2 className="tcc-results-title">Your results</h2>
        <div className="tcc-results-summary">
          <div className="tcc-results-stat">
            <span className="tcc-results-stat-icon" aria-hidden>
              🪑
            </span>
            <span>
              <strong>{result.totalTables}</strong> tables
            </span>
          </div>
          <div className="tcc-results-stat">
            <span className="tcc-results-stat-icon" aria-hidden>
              💺
            </span>
            <span>
              <strong>{result.totalChairs}</strong> {chairLabel}
            </span>
          </div>
          <div className="tcc-results-stat">
            <span className="tcc-results-stat-icon" aria-hidden>
              📏
            </span>
            <span>
              <strong>~{result.estimatedSquareFootage.toLocaleString()} sq ft</strong>{' '}
              needed
            </span>
          </div>
        </div>
        <ul className="tcc-results-breakdown">
          {result.tables.map((t) => (
            <li key={t.type}>
              {t.quantity} {t.label}
              {t.seatsPerTable > 0
                ? ` (${t.seatsPerTable} per table = ${t.quantity * t.seatsPerTable} seats)`
                : ''}
            </li>
          ))}
        </ul>
        {result.notes.length > 0 && (
          <div className="tcc-results-notes">
            {result.notes.map((note, i) => (
              <p key={i}>💡 {note}</p>
            ))}
          </div>
        )}

        <div className="tcc-quote">
          <input
            type="email"
            className="tcc-quote-input"
            placeholder="Enter your email"
            value={quoteEmail}
            onChange={(e) => setQuoteEmail(e.target.value)}
            aria-label="Email for quote"
          />
          <button
            type="button"
            className="tcc-quote-btn"
            onClick={() => {
              if (config.ctaUrl && quoteEmail) {
                const params = new URLSearchParams({
                  email: quoteEmail,
                  guestCount: String(guestCount),
                  totalTables: String(result.totalTables),
                  totalChairs: String(result.totalChairs),
                  tableType: primaryTable,
                  eventStyle,
                });
                window.open(
                  `${config.ctaUrl}?${params.toString()}`,
                  '_blank',
                  'noopener'
                );
              }
            }}
          >
            {config.ctaText}
          </button>
        </div>
      </section>
    </div>
  );
}
