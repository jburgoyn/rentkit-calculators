import type { TentCalculationInput, DjBand, LoungeSize, DanceLevel } from '../calculator/types';

interface ElementsStepProps {
  elements: TentCalculationInput['elements'];
  onChange: (key: keyof TentCalculationInput['elements'], value: unknown) => void;
}

const DANCE_LEVELS: { value: DanceLevel; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'heavy', label: 'Heavy' },
];

const DJ_OPTIONS: { value: DjBand; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'dj', label: 'DJ' },
  { value: 'small_band', label: 'Small band' },
  { value: 'large_band', label: 'Large band' },
];

const LOUNGE_OPTIONS: { value: LoungeSize; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export function ElementsStep({ elements, onChange }: ElementsStepProps) {
  return (
    <div className="card">
      <h2 className="card-title">Step 3: What&apos;s under the tent?</h2>

      <div className="element-row">
        <label className="element-check">
          <input
            type="checkbox"
            checked={elements.danceFloor}
            onChange={(e) => onChange('danceFloor', e.target.checked)}
          />
          <span>Dance floor</span>
        </label>
        {elements.danceFloor && (
          <div className="element-sub">
            <span className="element-sub-label">How much dancing?</span>
            <div className="radio-group" role="radiogroup" aria-label="Dance level">
              {DANCE_LEVELS.map(({ value, label }) => (
                <label key={value} className="radio-option">
                  <input
                    type="radio"
                    name="danceLevel"
                    checked={elements.danceLevel === value}
                    onChange={() => onChange('danceLevel', value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="element-row">
        <label className="element-check">
          <input
            type="checkbox"
            checked={elements.barStations > 0}
            onChange={(e) => onChange('barStations', e.target.checked ? 1 : 0)}
          />
          <span>Bar stations</span>
        </label>
        {elements.barStations > 0 && (
          <div className="element-sub counter-row">
            <span className="element-sub-label">How many?</span>
            <div className="counter">
              <button
                type="button"
                onClick={() => onChange('barStations', Math.max(0, elements.barStations - 1))}
                aria-label="Decrease bar stations"
              >
                −
              </button>
              <span>{elements.barStations}</span>
              <button
                type="button"
                onClick={() => onChange('barStations', elements.barStations + 1)}
                aria-label="Increase bar stations"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="element-row">
        <label className="element-check">
          <input
            type="checkbox"
            checked={elements.buffetStations > 0}
            onChange={(e) => onChange('buffetStations', e.target.checked ? 1 : 0)}
          />
          <span>Buffet stations</span>
        </label>
        {elements.buffetStations > 0 && (
          <div className="element-sub counter-row">
            <span className="element-sub-label">How many?</span>
            <div className="counter">
              <button
                type="button"
                onClick={() => onChange('buffetStations', Math.max(0, elements.buffetStations - 1))}
                aria-label="Decrease buffet stations"
              >
                −
              </button>
              <span>{elements.buffetStations}</span>
              <button
                type="button"
                onClick={() => onChange('buffetStations', elements.buffetStations + 1)}
                aria-label="Increase buffet stations"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="element-row">
        <span className="element-label">DJ / Band</span>
        <div className="radio-group inline" role="radiogroup" aria-label="DJ or band">
          {DJ_OPTIONS.map(({ value, label }) => (
            <label key={value} className="radio-option">
              <input
                type="radio"
                name="djBand"
                checked={elements.djBand === value}
                onChange={() => onChange('djBand', value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="element-row">
        <label className="element-check">
          <input
            type="checkbox"
            checked={elements.photoBooth}
            onChange={(e) => onChange('photoBooth', e.target.checked)}
          />
          <span>Photo booth</span>
        </label>
      </div>

      <div className="element-row">
        <label className="element-check">
          <input
            type="checkbox"
            checked={elements.cakeTable}
            onChange={(e) => onChange('cakeTable', e.target.checked)}
          />
          <span>Cake table</span>
        </label>
      </div>

      <div className="element-row">
        <label className="element-check">
          <input
            type="checkbox"
            checked={elements.giftTable}
            onChange={(e) => onChange('giftTable', e.target.checked)}
          />
          <span>Gift table</span>
        </label>
      </div>

      <div className="element-row">
        <span className="element-label">Lounge area</span>
        <div className="radio-group inline" role="radiogroup" aria-label="Lounge size">
          {LOUNGE_OPTIONS.map(({ value, label }) => (
            <label key={value} className="radio-option">
              <input
                type="radio"
                name="loungeArea"
                checked={elements.loungeArea === value}
                onChange={() => onChange('loungeArea', value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="element-row">
        <label className="element-check">
          <input
            type="checkbox"
            checked={elements.cateringPrep}
            onChange={(e) => onChange('cateringPrep', e.target.checked)}
          />
          <span>Catering prep area</span>
        </label>
      </div>
    </div>
  );
}
