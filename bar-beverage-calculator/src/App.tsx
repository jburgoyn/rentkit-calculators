import { useMemo, useState } from 'react';
import { calculateBar, BAR_STYLE_LABELS, POPULAR_COCKTAILS } from './calculator';
import { getEmbedConfig } from './embed-config';
import type {
  BarCalculation,
  BarResult,
  BarStyle,
  DrinkPreferences,
  DrinkerProfile,
  BarFactors,
} from './types';
import './styles.css';

const CONTAINER_ID = 'rentkit-bar-calculator';

const defaultDrinkerProfile: DrinkerProfile = {
  heavy: 20,
  moderate: 50,
  light: 25,
  nonDrinker: 5,
};

const defaultDrinkPreferences: DrinkPreferences = {
  beerPercent: 40,
  winePercent: 30,
  cocktailPercent: 30,
};

const defaultFactors: BarFactors = {
  season: 'summer',
  setting: 'indoor',
  timeOfDay: 'evening',
};

function normalizeDrinkerProfile(values: DrinkerProfile): DrinkerProfile {
  const keys = ['heavy', 'moderate', 'light', 'nonDrinker'] as const;
  const sum = keys.reduce((s, k) => s + values[k], 0);
  if (sum === 0) return values;
  const factor = 100 / sum;
  let remainder = 100;
  const out: DrinkerProfile = { heavy: 0, moderate: 0, light: 0, nonDrinker: 0 };
  const sorted = [...keys].sort((a, b) => values[b] - values[a]);
  for (let i = 0; i < sorted.length - 1; i++) {
    const k = sorted[i];
    out[k] = Math.round(values[k] * factor);
    remainder -= out[k];
  }
  out[sorted[sorted.length - 1]] = remainder;
  return out;
}

function normalizeDrinkPreferences(values: DrinkPreferences): DrinkPreferences {
  const keys = ['beerPercent', 'winePercent', 'cocktailPercent'] as const;
  const sum = keys.reduce((s, k) => s + values[k], 0);
  if (sum === 0) return values;
  const factor = 100 / sum;
  let remainder = 100;
  const out: DrinkPreferences = {
    beerPercent: 0,
    winePercent: 0,
    cocktailPercent: 0,
  };
  const sorted = [...keys].sort((a, b) => values[b] - values[a]);
  for (let i = 0; i < sorted.length - 1; i++) {
    const k = sorted[i];
    out[k] = Math.round(values[k] * factor);
    remainder -= out[k];
  }
  out[sorted[sorted.length - 1]] = remainder;
  return out;
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
  suffix = '',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  return (
    <div className="bar-slider-row">
      <label className="bar-slider-label">
        <span>{label}</span>
        <span className="bar-slider-value">
          {value}{suffix}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bar-slider"
      />
    </div>
  );
}

export default function App() {
  const root = typeof document !== 'undefined' ? document.getElementById(CONTAINER_ID) : null;
  const config = root ? getEmbedConfig(root) : { theme: 'light' as const, primaryColor: '#6b21a8', ctaText: 'Get Glassware & Bar Rental Quote', showCost: true };

  const [guestCount, setGuestCount] = useState(100);
  const [drinkerProfile, setDrinkerProfile] = useState<DrinkerProfile>(defaultDrinkerProfile);
  const [cocktailHour, setCocktailHour] = useState(true);
  const [receptionHours, setReceptionHours] = useState(4);
  const [afterPartyHours, setAfterPartyHours] = useState<number | undefined>(undefined);
  const [barStyle, setBarStyle] = useState<BarStyle>('full_bar');
  const [drinkPreferences, setDrinkPreferences] = useState<DrinkPreferences>(defaultDrinkPreferences);
  const [signatureCocktails, setSignatureCocktails] = useState<string[]>(['Margarita', 'Vodka Soda', 'Whiskey Sour']);
  const [factors, setFactors] = useState<BarFactors>(defaultFactors);

  const input: BarCalculation = useMemo(
    () => ({
      guestCount: Math.max(1, guestCount),
      drinkerProfile: normalizeDrinkerProfile(drinkerProfile),
      eventDuration: {
        cocktailHour,
        receptionHours: Math.max(0, receptionHours),
        afterPartyHours: afterPartyHours ?? undefined,
      },
      barStyle,
      drinkPreferences: normalizeDrinkPreferences(drinkPreferences),
      signatureCocktails: signatureCocktails.length ? signatureCocktails : undefined,
      factors,
    }),
    [
      guestCount,
      drinkerProfile,
      cocktailHour,
      receptionHours,
      afterPartyHours,
      barStyle,
      drinkPreferences,
      signatureCocktails,
      factors,
    ]
  );

  const result: BarResult = useMemo(() => calculateBar(input), [input]);

  const toggleCocktail = (name: string) => {
    setSignatureCocktails((prev) => {
      if (prev.includes(name)) return prev.filter((x) => x !== name);
      if (prev.length >= 5) return prev;
      return [...prev, name];
    });
  };

  const hasLiquor = Object.values(result.liquor).some((q) => q.bottles > 0);
  const hasWine = Object.values(result.wine).some((w) => w.bottles > 0);
  const hasBeer = Object.values(result.beer).some((b) => b.cases > 0);

  return (
    <div className={`bar-calc bar-calc--${config.theme}`} style={{ ['--bar-primary' as string]: config.primaryColor }}>
      <header className="bar-calc-header">
        <h1 className="bar-calc-title">Bar & Beverage Calculator</h1>
      </header>

      <section className="bar-calc-section">
        <h2 className="bar-calc-section-title">How many guests?</h2>
        <input
          type="number"
          min={1}
          max={2000}
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value) || 1)}
          className="bar-input bar-input--guest"
        />
      </section>

      <section className="bar-calc-section">
        <h2 className="bar-calc-section-title">Drinking habits</h2>
        <Slider
          label="Heavy drinkers"
          value={drinkerProfile.heavy}
          min={0}
          max={100}
          onChange={(n) => setDrinkerProfile((p) => ({ ...p, heavy: n }))}
          suffix="%"
        />
        <Slider
          label="Moderate drinkers"
          value={drinkerProfile.moderate}
          min={0}
          max={100}
          onChange={(n) => setDrinkerProfile((p) => ({ ...p, moderate: n }))}
          suffix="%"
        />
        <Slider
          label="Light drinkers"
          value={drinkerProfile.light}
          min={0}
          max={100}
          onChange={(n) => setDrinkerProfile((p) => ({ ...p, light: n }))}
          suffix="%"
        />
        <Slider
          label="Non-drinkers"
          value={drinkerProfile.nonDrinker}
          min={0}
          max={100}
          onChange={(n) => setDrinkerProfile((p) => ({ ...p, nonDrinker: n }))}
          suffix="%"
        />
      </section>

      <section className="bar-calc-section">
        <h2 className="bar-calc-section-title">Event timeline</h2>
        <label className="bar-checkbox">
          <input
            type="checkbox"
            checked={cocktailHour}
            onChange={(e) => setCocktailHour(e.target.checked)}
          />
          Cocktail hour (1 hour)
        </label>
        <div className="bar-number-row">
          <label>Reception/party</label>
          <div className="bar-stepper">
            <button
              type="button"
              onClick={() => setReceptionHours((h) => Math.max(0, h - 1))}
              aria-label="Decrease hours"
            >
              −
            </button>
            <span>{receptionHours} hours</span>
            <button
              type="button"
              onClick={() => setReceptionHours((h) => h + 1)}
              aria-label="Increase hours"
            >
              +
            </button>
          </div>
        </div>
        <label className="bar-checkbox">
          <input
            type="checkbox"
            checked={afterPartyHours !== undefined}
            onChange={(e) =>
              setAfterPartyHours(e.target.checked ? 2 : undefined)
            }
          />
          After-party
        </label>
        {afterPartyHours !== undefined && (
          <div className="bar-number-row">
            <label>After-party hours</label>
            <input
              type="number"
              min={0}
              max={8}
              value={afterPartyHours}
              onChange={(e) =>
                setAfterPartyHours(Number(e.target.value) || 0)
              }
              className="bar-input bar-input--small"
            />
          </div>
        )}
      </section>

      <section className="bar-calc-section">
        <h2 className="bar-calc-section-title">Bar style</h2>
        <div className="bar-style-grid">
          {(
            [
              'full_bar',
              'beer_wine',
              'signature_cocktails',
              'beer_only',
              'wine_only',
              'non_alcoholic',
            ] as BarStyle[]
          ).map((style) => (
            <button
              key={style}
              type="button"
              className={`bar-style-card ${barStyle === style ? 'bar-style-card--active' : ''}`}
              onClick={() => setBarStyle(style)}
            >
              {BAR_STYLE_LABELS[style]}
            </button>
          ))}
        </div>
      </section>

      {(barStyle === 'full_bar' || barStyle === 'signature_cocktails' || barStyle === 'beer_wine') && (
        <>
          <section className="bar-calc-section">
            <h2 className="bar-calc-section-title">Drink preferences</h2>
            <Slider
              label="Beer"
              value={drinkPreferences.beerPercent}
              min={0}
              max={100}
              onChange={(n) =>
                setDrinkPreferences((p) => ({ ...p, beerPercent: n }))
              }
              suffix="%"
            />
            <Slider
              label="Wine"
              value={drinkPreferences.winePercent}
              min={0}
              max={100}
              onChange={(n) =>
                setDrinkPreferences((p) => ({ ...p, winePercent: n }))
              }
              suffix="%"
            />
            <Slider
              label="Cocktails"
              value={drinkPreferences.cocktailPercent}
              min={0}
              max={100}
              onChange={(n) =>
                setDrinkPreferences((p) => ({ ...p, cocktailPercent: n }))
              }
              suffix="%"
            />
          </section>

          {(barStyle === 'full_bar' || barStyle === 'signature_cocktails') && (
            <section className="bar-calc-section">
              <h2 className="bar-calc-section-title">
                Popular cocktails (select up to 5)
              </h2>
              <div className="bar-cocktails-grid">
                {POPULAR_COCKTAILS.map((name) => (
                  <label key={name} className="bar-checkbox bar-checkbox--inline">
                    <input
                      type="checkbox"
                      checked={signatureCocktails.includes(name)}
                      onChange={() => toggleCocktail(name)}
                    />
                    {name}
                  </label>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <section className="bar-calc-section">
        <h2 className="bar-calc-section-title">Time & setting</h2>
        <div className="bar-factors">
          <div>
            <label>Season</label>
            <select
              value={factors.season}
              onChange={(e) =>
                setFactors((f) => ({
                  ...f,
                  season: e.target.value as BarFactors['season'],
                }))
              }
              className="bar-select"
            >
              <option value="summer">Summer</option>
              <option value="fall">Fall</option>
              <option value="winter">Winter</option>
              <option value="spring">Spring</option>
            </select>
          </div>
          <div>
            <label>Setting</label>
            <select
              value={factors.setting}
              onChange={(e) =>
                setFactors((f) => ({
                  ...f,
                  setting: e.target.value as BarFactors['setting'],
                }))
              }
              className="bar-select"
            >
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
            </select>
          </div>
          <div>
            <label>Time of day</label>
            <select
              value={factors.timeOfDay}
              onChange={(e) =>
                setFactors((f) => ({
                  ...f,
                  timeOfDay: e.target.value as BarFactors['timeOfDay'],
                }))
              }
              className="bar-select"
            >
              <option value="daytime">Daytime</option>
              <option value="evening">Evening</option>
            </select>
          </div>
        </div>
      </section>

      <hr className="bar-divider" />

      <section className="bar-calc-section bar-results">
        <h2 className="bar-results-title">Your bar shopping list</h2>

        {hasLiquor && (
          <div className="bar-result-block">
            <h3>Liquor (750ml bottles)</h3>
            <ul>
              {Object.entries(result.liquor).map(
                ([key, q]) =>
                  q.bottles > 0 && (
                    <li key={key}>
                      {q.bottles} {key.charAt(0).toUpperCase() + key.slice(1)}
                    </li>
                  )
              )}
            </ul>
          </div>
        )}

        {hasWine && (
          <div className="bar-result-block">
            <h3>Wine</h3>
            <ul>
              {result.wine.red.bottles > 0 && (
                <li>{result.wine.red.bottles} bottles Red</li>
              )}
              {result.wine.white.bottles > 0 && (
                <li>{result.wine.white.bottles} bottles White</li>
              )}
              {result.wine.sparkling.bottles > 0 && (
                <li>{result.wine.sparkling.bottles} bottles Sparkling</li>
              )}
            </ul>
          </div>
        )}

        {hasBeer && (
          <div className="bar-result-block">
            <h3>Beer</h3>
            <ul>
              {result.beer.domestic.cases > 0 && (
                <li>
                  {result.beer.domestic.cases} cases Domestic (
                  {result.beer.domestic.quantity})
                </li>
              )}
              {result.beer.craft.cases > 0 && (
                <li>
                  {result.beer.craft.cases} cases Craft (
                  {result.beer.craft.quantity})
                </li>
              )}
              {result.beer.light.cases > 0 && (
                <li>
                  {result.beer.light.cases} cases Light (
                  {result.beer.light.quantity})
                </li>
              )}
            </ul>
          </div>
        )}

        {Object.keys(result.mixers).length > 0 && (
          <div className="bar-result-block">
            <h3>Mixers</h3>
            <ul>
              {Object.entries(result.mixers).map(([name, q]) => (
                <li key={name}>
                  {q.quantity} {q.unit} {name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.garnishes.length > 0 && (
          <div className="bar-result-block">
            <h3>Garnishes</h3>
            <ul>
              {result.garnishes.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bar-result-block">
          <h3>Ice</h3>
          <ul>
            <li>{result.ice.pounds} lbs</li>
          </ul>
        </div>

        <div className="bar-result-block">
          <h3>Glassware needed</h3>
          <ul>
            {result.glassware.wineGlasses > 0 && (
              <li>{result.glassware.wineGlasses} Wine Glasses</li>
            )}
            {result.glassware.champagneFlutes > 0 && (
              <li>{result.glassware.champagneFlutes} Champagne Flutes</li>
            )}
            {result.glassware.highballGlasses > 0 && (
              <li>{result.glassware.highballGlasses} Highball Glasses</li>
            )}
            {result.glassware.rocksGlasses > 0 && (
              <li>{result.glassware.rocksGlasses} Rocks Glasses</li>
            )}
            {result.glassware.beerGlasses > 0 && (
              <li>{result.glassware.beerGlasses} Beer Glasses</li>
            )}
          </ul>
        </div>

        {result.barSupplies.length > 0 && (
          <div className="bar-result-block">
            <h3>Bar supplies</h3>
            <ul>
              {result.barSupplies.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {config.showCost && result.estimatedCost && (
          <p className="bar-estimated-cost">
            Estimated cost: ${result.estimatedCost.low.toLocaleString()} – $
            {result.estimatedCost.high.toLocaleString()}
          </p>
        )}

        <div className="bar-tips">
          <h3>Tips</h3>
          <ul>
            <li>Buy 10–15% extra for spillage and heavy pours</li>
            <li>Chill white wine and beer at least 4 hours before</li>
            <li>Plan for 1 bartender per 50 guests</li>
          </ul>
        </div>

        <div className="bar-cta">
          <p className="bar-cta-title">{config.ctaText}</p>
          <div className="bar-cta-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="bar-input bar-cta-email"
            />
            <button type="button" className="bar-cta-btn">
              Get Quote
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
