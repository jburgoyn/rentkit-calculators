import type { TentStyle } from '../calculator/types';
import { TENT_STYLE_LABELS } from '../calculator/constants';

interface TentPreferencesStepProps {
  preferences: { style?: TentStyle; enclosed: boolean; climateControl: boolean };
  onChange: (key: keyof { style?: TentStyle; enclosed: boolean; climateControl: boolean }, value: unknown) => void;
}

const TENT_STYLES: TentStyle[] = ['frame', 'pole', 'sailcloth', 'clear_span'];

export function TentPreferencesStep({ preferences, onChange }: TentPreferencesStepProps) {
  return (
    <div className="card">
      <h2 className="card-title">Tent preferences</h2>
      <div className="pref-row">
        <span className="element-label">Tent type</span>
        <div className="tent-style-buttons">
          {TENT_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              className={`tent-style-btn ${preferences.style === style ? 'active' : ''}`}
              onClick={() => onChange('style', style)}
              aria-pressed={preferences.style === style}
            >
              {TENT_STYLE_LABELS[style]}
            </button>
          ))}
        </div>
      </div>
      <div className="pref-row">
        <label className="element-check">
          <input
            type="checkbox"
            checked={preferences.enclosed}
            onChange={(e) => onChange('enclosed', e.target.checked)}
          />
          <span>Enclosed (sidewalls)</span>
        </label>
      </div>
      <div className="pref-row">
        <label className="element-check">
          <input
            type="checkbox"
            checked={preferences.climateControl}
            onChange={(e) => onChange('climateControl', e.target.checked)}
          />
          <span>Climate control (heating / AC)</span>
        </label>
      </div>
    </div>
  );
}
