import { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { BuffetConfig, CateringCalculation, CateringResult, ServiceStyle } from './types';
import { calculateCateringEquipment } from './calculations';
import { getEmbedConfig } from './embed-config';
import './App.css';

const SERVICE_STYLES: { value: ServiceStyle; label: string; icon: string }[] = [
  { value: 'buffet', label: 'Buffet', icon: '🍛' },
  { value: 'plated', label: 'Plated', icon: '🍽️' },
  { value: 'stations', label: 'Stations', icon: '🥘' },
  { value: 'family_style', label: 'Family Style', icon: '🍲' },
];

const defaultBuffet: BuffetConfig = {
  lines: 1,
  doubleSided: false,
  hotItems: 4,
  coldItems: 3,
  hasSaladBar: true,
  hasDessertStation: true,
};

function App() {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const config = root ? getEmbedConfig(root) : null;

  const [guestCount, setGuestCount] = useState(150);
  const [serviceStyle, setServiceStyle] = useState<ServiceStyle>('buffet');
  const [courses, setCourses] = useState(3);
  const [buffet, setBuffet] = useState<BuffetConfig>(defaultBuffet);
  const [coffee, setCoffee] = useState(true);
  const [coffeePercent, setCoffeePercent] = useState(60);
  const [decaf, setDecaf] = useState(true);
  const [hotTea, setHotTea] = useState(true);
  const [icedBeverages, setIcedBeverages] = useState(2);
  const [soupCourse, setSoupCourse] = useState(false);
  const [carving, setCarving] = useState(false);
  const [omelette, setOmelette] = useState(false);
  const [pasta, setPasta] = useState(false);
  const [quoteEmail, setQuoteEmail] = useState('');

  const input: CateringCalculation = useMemo(
    () => ({
      guestCount,
      serviceStyle,
      courses,
      buffetConfig: serviceStyle === 'buffet' ? buffet : undefined,
      beverageService: {
        coffee,
        coffeePercent,
        decaf,
        hotTea,
        icedBeverages,
      },
      specialNeeds: {
        soupCourse,
        carving,
        omelette,
        pasta,
      },
    }),
    [
      guestCount,
      serviceStyle,
      courses,
      buffet,
      coffee,
      coffeePercent,
      decaf,
      hotTea,
      icedBeverages,
      soupCourse,
      carving,
      omelette,
      pasta,
    ]
  );

  const result: CateringResult = useMemo(
    () => calculateCateringEquipment(input),
    [input]
  );

  useEffect(() => {
    const el = document.getElementById('rentkit-catering-calculator');
    if (el) setRoot(el);
  }, []);

  useEffect(() => {
    if (!config?.primaryColor || !document.documentElement) return;
    document.documentElement.style.setProperty('--cec-primary', config.primaryColor);
  }, [config?.primaryColor]);

  const handleGetQuote = () => {
    const url = config?.ctaUrl;
    if (url) {
      window.open(url, '_blank');
      return;
    }
    const email = quoteEmail.trim();
    if (email) {
      const mailto = `mailto:?subject=Catering%20Equipment%20Quote%20(${guestCount}%20guests)&body=Guest%20count:%20${guestCount}%0AService:%20${serviceStyle}%0APlease%20send%20a%20quote%20for%20catering%20equipment.`;
      window.location.href = mailto;
    }
  };

  if (!config) return null;

  return (
    <div className="cec">
      <header className="cec-header">
        <h1 className="cec-title">
          <span className="cec-title-icon" aria-hidden>🍽️</span>
          Catering Equipment Calculator
        </h1>
      </header>

      <section className="cec-section">
        <h2 className="cec-section-title">Event basics</h2>
        <div className="cec-number-row">
          <label htmlFor="cec-guests">Guests</label>
          <input
            id="cec-guests"
            type="number"
            min={1}
            max={5000}
            className="cec-input"
            value={guestCount}
            onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
          />
        </div>
        <div className="cec-section-title" style={{ marginTop: 12 }}>Service style</div>
        <div className="cec-options">
          {SERVICE_STYLES.map(({ value, label, icon }) => (
            <label key={value} className={`cec-option ${serviceStyle === value ? 'selected' : ''}`}>
              <input
                type="radio"
                name="serviceStyle"
                value={value}
                checked={serviceStyle === value}
                onChange={() => setServiceStyle(value)}
              />
              <span>{icon}</span>
              <span>{label}</span>
            </label>
          ))}
        </div>
        <div className="cec-number-row" style={{ marginTop: 12 }}>
          <label htmlFor="cec-courses">Number of courses</label>
          <input
            id="cec-courses"
            type="number"
            min={1}
            max={10}
            className="cec-input"
            value={courses}
            onChange={(e) => setCourses(Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1)))}
          />
        </div>
      </section>

      {serviceStyle === 'buffet' && (
        <section className="cec-section">
          <h2 className="cec-section-title">Buffet configuration</h2>
          <div className="cec-buffet-box">
            <div className="cec-radio-group">
              <span className="cec-section-title" style={{ width: '100%', marginBottom: 4 }}>Buffet lines</span>
              <label className="cec-radio-label">
                <input
                  type="radio"
                  name="lines"
                  checked={buffet.lines === 1}
                  onChange={() => setBuffet((b) => ({ ...b, lines: 1 }))}
                />
                One
              </label>
              <label className="cec-radio-label">
                <input
                  type="radio"
                  name="lines"
                  checked={buffet.lines === 2}
                  onChange={() => setBuffet((b) => ({ ...b, lines: 2 }))}
                />
                Two
              </label>
            </div>
            <div className="cec-radio-group">
              <span className="cec-section-title" style={{ width: '100%', marginBottom: 4 }}>Double-sided</span>
              <label className="cec-radio-label">
                <input
                  type="radio"
                  name="doubleSided"
                  checked={buffet.doubleSided === true}
                  onChange={() => setBuffet((b) => ({ ...b, doubleSided: true }))}
                />
                Yes
              </label>
              <label className="cec-radio-label">
                <input
                  type="radio"
                  name="doubleSided"
                  checked={buffet.doubleSided === false}
                  onChange={() => setBuffet((b) => ({ ...b, doubleSided: false }))}
                />
                No
              </label>
            </div>
            <div className="cec-number-row">
              <label>Hot food items</label>
              <div className="cec-stepper">
                <button type="button" onClick={() => setBuffet((b) => ({ ...b, hotItems: Math.max(1, b.hotItems - 1) }))}>−</button>
                <span>{buffet.hotItems}</span>
                <button type="button" onClick={() => setBuffet((b) => ({ ...b, hotItems: b.hotItems + 1 }))}>+</button>
              </div>
            </div>
            <div className="cec-number-row">
              <label>Cold food items</label>
              <div className="cec-stepper">
                <button type="button" onClick={() => setBuffet((b) => ({ ...b, coldItems: Math.max(0, b.coldItems - 1) }))}>−</button>
                <span>{buffet.coldItems}</span>
                <button type="button" onClick={() => setBuffet((b) => ({ ...b, coldItems: b.coldItems + 1 }))}>+</button>
              </div>
            </div>
            <div className="cec-checkboxes" style={{ marginTop: 12 }}>
              <label className="cec-checkbox-label">
                <input
                  type="checkbox"
                  checked={buffet.hasSaladBar}
                  onChange={(e) => setBuffet((b) => ({ ...b, hasSaladBar: e.target.checked }))}
                />
                Salad bar
              </label>
              <label className="cec-checkbox-label">
                <input
                  type="checkbox"
                  checked={buffet.hasDessertStation}
                  onChange={(e) => setBuffet((b) => ({ ...b, hasDessertStation: e.target.checked }))}
                />
                Dessert station
              </label>
            </div>
          </div>
        </section>
      )}

      <section className="cec-section">
        <h2 className="cec-section-title">Specialty stations</h2>
        <div className="cec-checkboxes">
          <label className="cec-checkbox-label">
            <input type="checkbox" checked={soupCourse} onChange={(e) => setSoupCourse(e.target.checked)} />
            Soup course
          </label>
          <label className="cec-checkbox-label">
            <input type="checkbox" checked={carving} onChange={(e) => setCarving(e.target.checked)} />
            Carving station
          </label>
          <label className="cec-checkbox-label">
            <input type="checkbox" checked={omelette} onChange={(e) => setOmelette(e.target.checked)} />
            Omelette station
          </label>
          <label className="cec-checkbox-label">
            <input type="checkbox" checked={pasta} onChange={(e) => setPasta(e.target.checked)} />
            Pasta station
          </label>
        </div>
      </section>

      <section className="cec-section">
        <h2 className="cec-section-title">Beverage service</h2>
        <div className="cec-checkboxes">
          <label className="cec-checkbox-label">
            <input type="checkbox" checked={coffee} onChange={(e) => setCoffee(e.target.checked)} />
            Coffee (regular)
            {coffee && (
              <input
                type="number"
                min={1}
                max={100}
                className="cec-inline-percent"
                value={coffeePercent}
                onChange={(e) => setCoffeePercent(Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 60)))}
              />
            )}
            {coffee && <span>% of guests</span>}
          </label>
          <label className="cec-checkbox-label">
            <input type="checkbox" checked={decaf} onChange={(e) => setDecaf(e.target.checked)} />
            Decaf coffee
          </label>
          <label className="cec-checkbox-label">
            <input type="checkbox" checked={hotTea} onChange={(e) => setHotTea(e.target.checked)} />
            Hot tea
          </label>
        </div>
        <div className="cec-number-row" style={{ marginTop: 12 }}>
          <label>Iced beverages (lemonade, etc.)</label>
          <div className="cec-stepper">
            <button type="button" onClick={() => setIcedBeverages((n) => Math.max(0, n - 1))}>−</button>
            <span>{icedBeverages}</span>
            <button type="button" onClick={() => setIcedBeverages((n) => n + 1)}>+</button>
          </div>
        </div>
      </section>

      <div className="cec-results">
        <h2 className="cec-results-title">Equipment list</h2>
        <div className="cec-results-grid">
          <div className="cec-result-block">
            <h4>Food warming</h4>
            <ul className="cec-result-list">
              {result.warmingEquipment.chafingDishes.map((c) => (
                <li key={c.size}>{c.quantity}× Full chafing dishes (8qt)</li>
              ))}
              {result.warmingEquipment.sternoCans > 0 && (
                <li>{result.warmingEquipment.sternoCans}× Sterno cans</li>
              )}
              {result.warmingEquipment.heatLamps > 0 && (
                <li>{result.warmingEquipment.heatLamps}× Heat lamps</li>
              )}
              {result.warmingEquipment.warmingCabinets > 0 && (
                <li>{result.warmingEquipment.warmingCabinets}× Warming cabinet(s)</li>
              )}
              {result.warmingEquipment.soupKettles > 0 && (
                <li>{result.warmingEquipment.soupKettles}× Soup kettle(s)</li>
              )}
            </ul>
          </div>
          <div className="cec-result-block">
            <h4>Serving equipment</h4>
            <ul className="cec-result-list">
              {result.servingEquipment.platters.filter((p) => p.quantity > 0).map((p) => (
                <li key={p.size}>{p.quantity}× {p.size} platter(s)</li>
              ))}
              {result.servingEquipment.bowls.filter((b) => b.quantity > 0).map((b) => (
                <li key={b.size}>{b.quantity}× {b.size} bowl(s)</li>
              ))}
              {result.servingEquipment.utensils.map((u) => (
                <li key={u.type}>{u.quantity}× {u.type}</li>
              ))}
              {result.servingEquipment.sneezeGuards > 0 && (
                <li>{result.servingEquipment.sneezeGuards}× Sneeze guard(s)</li>
              )}
              {result.servingEquipment.risers > 0 && (
                <li>{result.servingEquipment.risers}× Buffet riser(s)</li>
              )}
            </ul>
          </div>
          <div className="cec-result-block">
            <h4>Beverage equipment</h4>
            <ul className="cec-result-list">
              {result.beverageEquipment.coffeeUrns.map((u) => (
                <li key={u.size}>{u.quantity}× {u.size} coffee urn(s)</li>
              ))}
              {result.beverageEquipment.hotWaterDispensers > 0 && (
                <li>{result.beverageEquipment.hotWaterDispensers}× Hot water dispenser(s)</li>
              )}
              {result.beverageEquipment.beverageDispensers > 0 && (
                <li>{result.beverageEquipment.beverageDispensers}× Beverage dispenser(s)</li>
              )}
              {result.beverageEquipment.creamSugarSets > 0 && (
                <li>{result.beverageEquipment.creamSugarSets}× Cream & sugar set(s)</li>
              )}
            </ul>
          </div>
          <div className="cec-result-block">
            <h4>Cold service</h4>
            <ul className="cec-result-list">
              {result.coldEquipment.iceBins > 0 && (
                <li>{result.coldEquipment.iceBins}× Ice bin(s)</li>
              )}
              {result.coldEquipment.iceDisplays > 0 && (
                <li>{result.coldEquipment.iceDisplays}× Ice display(s)</li>
              )}
            </ul>
          </div>
        </div>

        <div className="cec-safety">
          <h4>Food safety reminders</h4>
          <ul>
            <li>Replace sterno cans every 2–3 hours</li>
            <li>Keep hot foods above 140°F, cold foods below 40°F</li>
            <li>Use separate utensils for each food item</li>
          </ul>
        </div>

        <div className="cec-quote">
          <input
            type="email"
            className="cec-quote-input"
            placeholder="Enter your email"
            value={quoteEmail}
            onChange={(e) => setQuoteEmail(e.target.value)}
          />
          <button type="button" className="cec-quote-btn" onClick={handleGetQuote}>
            {config.ctaText}
          </button>
        </div>
      </div>
    </div>
  );
}

const mountEl = document.getElementById('rentkit-catering-calculator');
if (mountEl) {
  const root = createRoot(mountEl);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
