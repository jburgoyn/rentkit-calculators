import React, { useMemo, useState } from 'react';
import {
  calculateLinens,
  TABLE_OPTIONS,
  PURPOSE_OPTIONS,
} from './calculations';
import type {
  TableEntry,
  TablePurpose,
  DropLength,
  LinenCalculation,
  LinenList,
} from './types';

const DEFAULT_TABLE: TableEntry = {
  type: 'round_60',
  shape: 'round',
  size: '60inch',
  quantity: 10,
  purpose: 'guest',
};

function getTableOption(type: TableEntry['type']) {
  return TABLE_OPTIONS.find((o) => o.type === type) ?? TABLE_OPTIONS[1];
}

export default function App() {
  const [tables, setTables] = useState<TableEntry[]>([
    { ...DEFAULT_TABLE, quantity: 17 },
  ]);
  const [guestCount, setGuestCount] = useState(150);
  const [dropLength, setDropLength] = useState<DropLength>('floor');
  const [useOverlays, setUseOverlays] = useState(true);
  const [overlayStyle, setOverlayStyle] = useState<'square' | 'round'>('square');
  const [extraVendors, setExtraVendors] = useState(10);
  const [extraBar, setExtraBar] = useState(20);
  const [extraRestrooms, setExtraRestrooms] = useState(0);
  const [chairCount, setChairCount] = useState(150);
  const [chairCovers, setChairCovers] = useState(false);
  const [chairSashes, setChairSashes] = useState(false);
  const [cushions, setCushions] = useState(false);
  const [tableRunners, setTableRunners] = useState(false);
  const [chargerPlates, setChargerPlates] = useState(false);
  const [quoteEmail, setQuoteEmail] = useState('');
  const [quoteSent, setQuoteSent] = useState(false);

  const input: LinenCalculation = useMemo(
    () => ({
      tables,
      guestCount,
      tableclothPreferences: {
        dropLength,
        useOverlays,
        overlayStyle,
      },
      napkinPreferences: {
        extraForVendors: extraVendors,
        extraForBar: extraBar,
        extraForRestrooms: extraRestrooms,
      },
      chairAccessories: {
        chairCovers,
        chairSashes,
        cushions,
        chairCount,
      },
      additionalItems: {
        tableRunners,
        tableSkirts: [],
        chargerPlates,
      },
    }),
    [
      tables,
      guestCount,
      dropLength,
      useOverlays,
      overlayStyle,
      extraVendors,
      extraBar,
      extraRestrooms,
      chairCount,
      chairCovers,
      chairSashes,
      cushions,
      tableRunners,
      chargerPlates,
    ]
  );

  const results: LinenList = useMemo(() => calculateLinens(input), [input]);

  const addTable = () => {
    setTables((prev) => [...prev, { ...DEFAULT_TABLE }]);
  };

  const updateTable = (index: number, updates: Partial<TableEntry>) => {
    setTables((prev) => {
      const next = [...prev];
      const entry = next[index];
      if (updates.type != null) {
        const opt = getTableOption(updates.type);
        next[index] = {
          ...entry,
          ...updates,
          type: opt.type,
          shape: opt.shape,
          size: opt.size,
        };
      } else {
        next[index] = { ...entry, ...updates };
      }
      return next;
    });
  };

  const removeTable = (index: number) => {
    if (tables.length <= 1) return;
    setTables((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGetQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (quoteEmail.trim()) setQuoteSent(true);
  };

  const previewCaption = useMemo(() => {
    const first = tables[0];
    if (!first) return 'Add tables to see preview';
    const dropLabel =
      dropLength === 'floor'
        ? 'floor-length'
        : dropLength === 'mid'
          ? 'mid-length'
          : 'lap-length';
    let text = `${first.size} ${first.shape} with ${dropLabel} cloth`;
    if (useOverlays) text += ` + ${overlayStyle} overlay`;
    return text;
  }, [tables, dropLength, useOverlays, overlayStyle]);

  return (
    <div className="linen-calc">
      <header className="linen-header">
        <h1>Linen Calculator</h1>
      </header>

      <section className="linen-section">
        <h2 className="linen-section-title">Your Tables</h2>
        <p style={{ marginBottom: 12, fontSize: 13, color: 'var(--linen-text-muted)' }}>
          Import from Table &amp; Chair Calculator (coming soon) or enter manually:
        </p>
        {tables.map((table, i) => (
          <div key={i} className="linen-table-entry">
            <select
              className="linen-select"
              value={table.type}
              onChange={(e) =>
                updateTable(i, {
                  type: e.target.value as TableEntry['type'],
                })
              }
            >
              {TABLE_OPTIONS.map((opt) => (
                <option key={opt.type} value={opt.type}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="linen-input"
              min={1}
              value={table.quantity}
              onChange={(e) =>
                updateTable(i, { quantity: parseInt(e.target.value, 10) || 1 })
              }
            />
            <select
              className="linen-select"
              value={table.purpose}
              onChange={(e) =>
                updateTable(i, { purpose: e.target.value as TablePurpose })
              }
            >
              {PURPOSE_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="linen-remove"
              onClick={() => removeTable(i)}
              disabled={tables.length <= 1}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="linen-btn linen-btn-secondary linen-add-table"
          onClick={addTable}
        >
          + Add another table
        </button>
      </section>

      <section className="linen-section">
        <h2 className="linen-section-title">Tablecloth Style</h2>
        <div className="linen-drop-options">
          {(['floor', 'mid', 'lap'] as const).map((d) => (
            <button
              key={d}
              type="button"
              className={`linen-drop-option ${dropLength === d ? 'selected' : ''}`}
              onClick={() => setDropLength(d)}
            >
              <div className="label">
                {d === 'floor' ? 'Floor' : d === 'mid' ? 'Mid' : 'Lap'} length
              </div>
              <div className="sublabel">
                {d === 'floor'
                  ? 'Formal'
                  : d === 'mid'
                    ? '30" drop'
                    : 'Casual'}
              </div>
            </button>
          ))}
        </div>
        <div className="linen-checkbox-row">
          <input
            type="checkbox"
            id="overlays"
            className="linen-checkbox"
            checked={useOverlays}
            onChange={(e) => setUseOverlays(e.target.checked)}
          />
          <label htmlFor="overlays">Add overlays</label>
        </div>
        {useOverlays && (
          <div className="linen-row" style={{ marginTop: 8 }}>
            <span className="linen-label">Style</span>
            <select
              className="linen-select"
              value={overlayStyle}
              onChange={(e) =>
                setOverlayStyle(e.target.value as 'square' | 'round')
              }
            >
              <option value="square">Square</option>
              <option value="round">Round</option>
            </select>
          </div>
        )}
      </section>

      <div className="linen-grid-2">
        <section className="linen-section">
          <h2 className="linen-section-title">Napkins</h2>
          <div className="linen-row">
            <label className="linen-label">Guest count</label>
            <input
              type="number"
              className="linen-input"
              min={0}
              value={guestCount}
              onChange={(e) =>
                setGuestCount(Math.max(0, parseInt(e.target.value, 10) || 0))
              }
            />
          </div>
          <div className="linen-checkbox-row">
            <input
              type="number"
              className="linen-input"
              min={0}
              style={{ width: 56 }}
              value={extraVendors}
              onChange={(e) =>
                setExtraVendors(Math.max(0, parseInt(e.target.value, 10) || 0))
              }
            />
            <label>Extra for vendors</label>
          </div>
          <div className="linen-checkbox-row">
            <input
              type="number"
              className="linen-input"
              min={0}
              style={{ width: 56 }}
              value={extraBar}
              onChange={(e) =>
                setExtraBar(Math.max(0, parseInt(e.target.value, 10) || 0))
              }
            />
            <label>Extra for bar</label>
          </div>
          <div className="linen-checkbox-row">
            <input
              type="number"
              className="linen-input"
              min={0}
              style={{ width: 56 }}
              value={extraRestrooms}
              onChange={(e) =>
                setExtraRestrooms(
                  Math.max(0, parseInt(e.target.value, 10) || 0)
                )
              }
            />
            <label>Restroom baskets</label>
          </div>
        </section>

        <section className="linen-section">
          <h2 className="linen-section-title">Preview</h2>
          <div className="linen-preview">
            <div>
              <div className="linen-preview-inner" />
              <div className="linen-preview-caption">{previewCaption}</div>
            </div>
          </div>
        </section>
      </div>

      <section className="linen-section">
        <h2 className="linen-section-title">Chair Accessories</h2>
        <div className="linen-row">
          <label className="linen-label">Chair count</label>
          <input
            type="number"
            className="linen-input"
            min={0}
            value={chairCount}
            onChange={(e) =>
              setChairCount(Math.max(0, parseInt(e.target.value, 10) || 0))
            }
          />
        </div>
        <div className="linen-checkbox-row">
          <input
            type="checkbox"
            id="chairCovers"
            className="linen-checkbox"
            checked={chairCovers}
            onChange={(e) => setChairCovers(e.target.checked)}
          />
          <label htmlFor="chairCovers">Chair covers</label>
        </div>
        <div className="linen-checkbox-row">
          <input
            type="checkbox"
            id="chairSashes"
            className="linen-checkbox"
            checked={chairSashes}
            onChange={(e) => setChairSashes(e.target.checked)}
          />
          <label htmlFor="chairSashes">Chair sashes</label>
        </div>
        <div className="linen-checkbox-row">
          <input
            type="checkbox"
            id="cushions"
            className="linen-checkbox"
            checked={cushions}
            onChange={(e) => setCushions(e.target.checked)}
          />
          <label htmlFor="cushions">Chiavari cushions</label>
        </div>
      </section>

      <section className="linen-section">
        <h2 className="linen-section-title">Additional Items</h2>
        <div className="linen-checkbox-row">
          <input
            type="checkbox"
            id="tableRunners"
            className="linen-checkbox"
            checked={tableRunners}
            onChange={(e) => setTableRunners(e.target.checked)}
          />
          <label htmlFor="tableRunners">Table runners</label>
        </div>
        <div className="linen-checkbox-row">
          <input
            type="checkbox"
            id="chargerPlates"
            className="linen-checkbox"
            checked={chargerPlates}
            onChange={(e) => setChargerPlates(e.target.checked)}
          />
          <label htmlFor="chargerPlates">Charger plates</label>
        </div>
      </section>

      <div className="linen-results">
        <h2>Your Linen List</h2>

        {results.tablecloths.length > 0 && (
          <div className="linen-results-section">
            <div className="linen-results-section-title">Tablecloths</div>
            <ul className="linen-results-list">
              {results.tablecloths.map((t, i) => (
                <li key={i}>
                  {t.quantity}× {t.size} — {t.forTableType}
                </li>
              ))}
            </ul>
          </div>
        )}

        {results.overlays.length > 0 && (
          <div className="linen-results-section">
            <div className="linen-results-section-title">Overlays</div>
            <ul className="linen-results-list">
              {results.overlays.map((o, i) => (
                <li key={i}>
                  {o.quantity}× {o.size}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="linen-results-section">
          <div className="linen-results-section-title">Napkins</div>
          <ul className="linen-results-list">
            <li>
              {results.napkins.quantity}× Dinner napkins
              <ul style={{ marginTop: 6, paddingLeft: 16, fontSize: 13, color: 'var(--linen-text-muted)' }}>
                <li>{results.napkins.breakdown.guests} for guests</li>
                {results.napkins.breakdown.vendors > 0 && (
                  <li>{results.napkins.breakdown.vendors} for vendors</li>
                )}
                {results.napkins.breakdown.bar > 0 && (
                  <li>{results.napkins.breakdown.bar} for bar</li>
                )}
                {results.napkins.breakdown.restroom > 0 && (
                  <li>{results.napkins.breakdown.restroom} for restrooms</li>
                )}
                <li>{results.napkins.breakdown.buffer} buffer (5%)</li>
              </ul>
            </li>
          </ul>
        </div>

        {(results.chairCovers > 0 ||
          results.chairSashes > 0 ||
          results.tableRunners > 0 ||
          results.chargerPlates > 0) && (
          <div className="linen-results-section">
            <div className="linen-results-section-title">Other</div>
            <ul className="linen-results-list">
              {results.chairCovers > 0 && (
                <li>{results.chairCovers} chair covers</li>
              )}
              {results.chairSashes > 0 && (
                <li>{results.chairSashes} chair sashes</li>
              )}
              {results.tableRunners > 0 && (
                <li>{results.tableRunners} table runners</li>
              )}
              {results.chargerPlates > 0 && (
                <li>{results.chargerPlates} charger plates</li>
              )}
            </ul>
          </div>
        )}

        <div className="linen-tips">
          <strong>Tips</strong>
          <ul>
            <li>132" round cloths provide a 36" drop on 60" tables</li>
            <li>Order 5–10% extra napkins for spills and replacements</li>
            <li>Cocktail tables look best with floor-length cloths</li>
          </ul>
        </div>

        <div className="linen-cta">
          {quoteSent ? (
            <p style={{ color: 'var(--linen-primary)' }}>
              Thanks! We&apos;ll send your quote to {quoteEmail}.
            </p>
          ) : (
            <>
              <p>Get a Quote for These Linens</p>
              <form onSubmit={handleGetQuote}>
                <div className="linen-cta-input-row">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={quoteEmail}
                    onChange={(e) => setQuoteEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="linen-btn linen-btn-primary">
                    Get Quote
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
