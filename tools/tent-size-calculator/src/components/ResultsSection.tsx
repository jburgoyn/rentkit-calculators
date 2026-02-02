import type { TentCalculationInput, TentCalculationResult, TentSizeResult } from '../calculator/types';
import { TENT_STYLE_LABELS } from '../calculator/constants';

interface ResultsSectionProps {
  input: TentCalculationInput;
  result: TentCalculationResult;
}

function LayoutDiagram({ width, length }: { width: number; length: number }) {
  const aspect = length / width;
  const boxW = 280;
  const boxH = Math.min(200, boxW * aspect);
  return (
    <div
      className="layout-diagram"
      style={{
        width: boxW,
        height: boxH,
        maxWidth: '100%',
      }}
      aria-hidden
    >
      <div className="layout-inner">
        <div className="layout-bar" title="Bar">Bar</div>
        <div className="layout-dj" title="DJ/Band">DJ</div>
        <div className="layout-dance" title="Dance floor">Dance</div>
        <div className="layout-buffet" title="Buffet">Buffet</div>
        <div className="layout-tables" title="Tables">Tables</div>
      </div>
    </div>
  );
}

function BreakdownBar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="breakdown-row">
      <div className="breakdown-top">
        <span className="breakdown-label">{label}</span>
        <span className="breakdown-value">{value.toLocaleString()} sq ft</span>
      </div>
      <div className="breakdown-bar-wrap">
        <div className="breakdown-bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ResultsSection({ input, result }: ResultsSectionProps) {
  const { recommendedSize, alternativeSizes, squareFootageBreakdown, totalNeeded, tips, warnings } = result;
  const b = squareFootageBreakdown;
  const maxBreakdown = Math.max(
    b.seating,
    b.danceFloor,
    b.bars,
    b.buffet,
    b.entertainment,
    b.other,
    b.circulation,
    1
  );

  return (
    <section className="results-section card results-card">
      <h2 className="results-title">Your recommended tent size</h2>

      {recommendedSize ? (
        <>
          <div className="recommended-block">
            <div className="recommended-header">
              <span className="tent-emoji" aria-hidden>⛺</span>
              <div>
                <strong className="tent-size-text">
                  {recommendedSize.width}&apos; × {recommendedSize.length}&apos; {TENT_STYLE_LABELS[recommendedSize.style]}
                </strong>
                <p className="tent-sqft">{recommendedSize.sqFt.toLocaleString()} square feet</p>
              </div>
            </div>
            <LayoutDiagram width={recommendedSize.width} length={recommendedSize.length} />
          </div>

          <div className="breakdown-section">
            <h3 className="breakdown-title">Space breakdown</h3>
            {b.seating > 0 && (
              <BreakdownBar label={`Seating (${input.guestCount} guests)`} value={b.seating} total={maxBreakdown} />
            )}
            {b.danceFloor > 0 && <BreakdownBar label="Dance floor" value={b.danceFloor} total={maxBreakdown} />}
            {b.bars > 0 && (
              <BreakdownBar
                label={`Bar${input.elements.barStations > 1 ? 's' : ''} (${input.elements.barStations})`}
                value={b.bars}
                total={maxBreakdown}
              />
            )}
            {b.buffet > 0 && (
              <BreakdownBar
                label={`Buffet${input.elements.buffetStations > 1 ? ' stations' : ''}`}
                value={b.buffet}
                total={maxBreakdown}
              />
            )}
            {b.entertainment > 0 && <BreakdownBar label="DJ / Band" value={b.entertainment} total={maxBreakdown} />}
            {b.other > 0 && <BreakdownBar label="Other (cake, gift, lounge, etc.)" value={b.other} total={maxBreakdown} />}
            <BreakdownBar label="Circulation" value={b.circulation} total={maxBreakdown} />
            <div className="breakdown-totals">
              <span className="total-label">Total needed</span>
              <span className="total-value">{totalNeeded.toLocaleString()} sq ft</span>
            </div>
            <div className="breakdown-totals">
              <span className="total-label">Tent provides</span>
              <span className="total-value">
                {recommendedSize.usableSqFt.toLocaleString()} sq ft
                {recommendedSize.fits && (
                  <span className="buffer-badge">
                    ✓ {Math.round(((recommendedSize.usableSqFt - totalNeeded) / totalNeeded) * 100)}% buffer
                  </span>
                )}
              </span>
            </div>
          </div>

          {alternativeSizes.length > 0 && (
            <div className="alternatives">
              <h3 className="alternatives-title">Alternative options</h3>
              <ul className="alternatives-list">
                {alternativeSizes.slice(0, 3).map((tent: TentSizeResult) => (
                  <li key={`${tent.width}x${tent.length}`}>
                    {tent.width}&apos; × {tent.length}&apos; ({tent.sqFt.toLocaleString()} sq ft)
                    {tent.snugness === 'tight' && ' — Would be tight'}
                    {tent.snugness === 'comfortable' && ' — More breathing room'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="warnings-block">
              <h3 className="warnings-title">⚠️ Notes</h3>
              <ul className="tips-list">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {tips.length > 0 && (
            <div className="tips-block">
              <h3 className="tips-title">💡 Tips</h3>
              <ul className="tips-list">
                {tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="quote-cta">
            <h3 className="quote-title">Get a quote for this tent setup</h3>
            <form
              className="quote-form"
              onSubmit={(e) => {
                e.preventDefault();
                const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement)?.value;
                if (email) {
                  // Placeholder: analytics.track('tent_quote_requested', { email, ... })
                  alert(`Quote request received for ${email}. This is a demo—connect to your backend to send quotes.`);
                }
              }}
            >
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="quote-input"
                required
                aria-label="Email for quote"
              />
              <button type="submit" className="quote-btn">
                Get quote
              </button>
            </form>
          </div>
        </>
      ) : (
        <p className="no-result">Adjust your options above to see a recommended tent size.</p>
      )}
    </section>
  );
}
