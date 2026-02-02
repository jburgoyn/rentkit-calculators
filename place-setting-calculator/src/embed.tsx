import React, { useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { PlaceSettingCalculation, PlaceSettingResult } from './types';
import {
  calculatePlaceSettings,
  DEFAULT_CALCULATION,
} from './calculator';

const ROOT_ID = 'rentkit-place-setting-calculator';

const LABELS: Record<string, string> = {
  dinnerPlate: 'Dinner Plates',
  saladPlate: 'Salad Plates',
  breadPlate: 'Bread Plates',
  soupBowl: 'Soup Bowls',
  dessertPlate: 'Dessert Plates',
  dinnerFork: 'Dinner Forks',
  saladFork: 'Salad Forks',
  dessertFork: 'Dessert Forks',
  dinnerKnife: 'Dinner Knives',
  butterKnife: 'Butter Knives',
  soupSpoon: 'Soup Spoons',
  teaspoon: 'Teaspoons',
  waterGlass: 'Water Glasses',
  wineGlass: 'Wine Glasses',
  champagneFlute: 'Champagne Flutes',
  beerGlass: 'Beer Glasses',
  coffeeCup: 'Coffee Cups',
  coffeeSaucer: 'Saucers',
};

const SERVICE_STYLES: { id: PlaceSettingCalculation['serviceStyle']; label: string; icon: string }[] = [
  { id: 'plated', label: 'Plated', icon: '🍽️' },
  { id: 'buffet', label: 'Buffet', icon: '🍴' },
  { id: 'family_style', label: 'Family Style', icon: '🥘' },
  { id: 'cocktail', label: 'Cocktail', icon: '🥂' },
];

function PlaceSettingDiagram({ input }: { input: PlaceSettingCalculation }) {
  const { courses, beverages } = input;
  return (
    <div style={styles.diagram}>
      <div style={styles.diagramTitle}>Place Setting</div>
      <div style={styles.diagramInner}>
        {/* Top: bread plate */}
        {courses.bread && (
          <div style={{ ...styles.diagramItem, gridArea: 'bread' }}>
            <span style={styles.diagramEmoji}>🍞</span>
            <span style={styles.diagramLabel}>Bread</span>
          </div>
        )}
        {/* Left: forks */}
        <div style={{ ...styles.diagramItem, gridArea: 'salad-fork' }}>
          {(courses.salad || courses.appetizer) && (
            <>
              <span style={styles.diagramEmoji}>🍴</span>
              <span style={styles.diagramLabel}>Salad</span>
            </>
          )}
        </div>
        <div style={{ ...styles.diagramItem, gridArea: 'dinner-fork' }}>
          <span style={styles.diagramEmoji}>🍴</span>
          <span style={styles.diagramLabel}>Dinner</span>
        </div>
        {courses.dessert && (
          <div style={{ ...styles.diagramItem, gridArea: 'dessert-fork' }}>
            <span style={styles.diagramEmoji}>🍴</span>
            <span style={styles.diagramLabel}>Dessert</span>
          </div>
        )}
        {/* Center: plates */}
        <div style={{ ...styles.diagramItem, gridArea: 'dinner-plate' }}>
          <span style={styles.diagramEmoji}>🍽️</span>
          <span style={styles.diagramLabel}>Dinner Plate</span>
        </div>
        {courses.soup && (
          <div style={{ ...styles.diagramItem, gridArea: 'soup' }}>
            <span style={styles.diagramEmoji}>🥣</span>
            <span style={styles.diagramLabel}>Soup</span>
          </div>
        )}
        {/* Right: knife, spoon */}
        <div style={{ ...styles.diagramItem, gridArea: 'knife' }}>
          <span style={styles.diagramEmoji}>🔪</span>
          <span style={styles.diagramLabel}>Knife</span>
        </div>
        {courses.soup && (
          <div style={{ ...styles.diagramItem, gridArea: 'spoon' }}>
            <span style={styles.diagramEmoji}>🥄</span>
            <span style={styles.diagramLabel}>Soup</span>
          </div>
        )}
        {(courses.bread || beverages.coffee || beverages.tea) && (
          <div style={{ ...styles.diagramItem, gridArea: 'butter-tea' }}>
            {courses.bread && <span style={styles.diagramEmoji}>🧈</span>}
            {(beverages.coffee || beverages.tea) && (
              <span style={styles.diagramEmoji}>☕</span>
            )}
          </div>
        )}
        {/* Glasses */}
        <div style={{ ...styles.diagramItem, gridArea: 'glasses' }}>
          {beverages.water && <span style={styles.diagramEmoji}>💧</span>}
          {(beverages.redWine || beverages.whiteWine) && (
            <span style={styles.diagramEmoji}>🍷</span>
          )}
          {beverages.champagne && (
            <span style={styles.diagramEmoji}>🥂</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultsSection({
  result,
  totalGuests,
  ctaText,
  primaryColor,
}: {
  result: PlaceSettingResult;
  totalGuests: number;
  ctaText: string;
  primaryColor: string;
}) {
  const plateKeys = [
    'dinnerPlate',
    'saladPlate',
    'breadPlate',
    'soupBowl',
    'dessertPlate',
  ].filter((k) => (result.totals[k] ?? 0) > 0);
  const flatwareKeys = [
    'dinnerFork',
    'saladFork',
    'dessertFork',
    'dinnerKnife',
    'butterKnife',
    'soupSpoon',
    'teaspoon',
  ].filter((k) => (result.totals[k] ?? 0) > 0);
  const glassKeys = [
    'waterGlass',
    'wineGlass',
    'champagneFlute',
    'beerGlass',
  ].filter((k) => (result.totals[k] ?? 0) > 0);
  const coffeeKeys = ['coffeeCup', 'coffeeSaucer'].filter(
    (k) => (result.totals[k] ?? 0) > 0
  );

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleCta = useCallback(() => {
    if (email.trim()) setSubmitted(true);
  }, [email]);

  return (
    <div style={styles.resultsSection}>
      <h2 style={styles.resultsTitle}>
        Your tableware needs ({totalGuests} guests)
      </h2>

      <div style={styles.resultsGrid}>
        <div style={styles.resultsColumn}>
          <h3 style={styles.resultsSubtitle}>Plates</h3>
          <ul style={styles.resultsList}>
            {plateKeys.map((key) => (
              <li key={key} style={styles.resultsItem}>
                {result.totals[key]} {LABELS[key]}
              </li>
            ))}
          </ul>
        </div>
        <div style={styles.resultsColumn}>
          <h3 style={styles.resultsSubtitle}>Flatware</h3>
          <ul style={styles.resultsList}>
            {flatwareKeys.map((key) => (
              <li key={key} style={styles.resultsItem}>
                {result.totals[key]} {LABELS[key]}
              </li>
            ))}
          </ul>
        </div>
        <div style={styles.resultsColumn}>
          <h3 style={styles.resultsSubtitle}>Glassware</h3>
          <ul style={styles.resultsList}>
            {glassKeys.map((key) => (
              <li key={key} style={styles.resultsItem}>
                {result.totals[key]} {LABELS[key]}
              </li>
            ))}
          </ul>
        </div>
        {coffeeKeys.length > 0 && (
          <div style={styles.resultsColumn}>
            <h3 style={styles.resultsSubtitle}>Coffee service</h3>
            <ul style={styles.resultsList}>
              {coffeeKeys.map((key) => (
                <li key={key} style={styles.resultsItem}>
                  {result.totals[key]} {LABELS[key]}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {result.servingPieces.length > 0 && (
        <div style={styles.servingSection}>
          <h3 style={styles.resultsSubtitle}>Serving pieces</h3>
          <ul style={styles.resultsList}>
            {result.servingPieces.map((p, i) => (
              <li key={i} style={styles.resultsItem}>
                {p.quantity} {p.item}
                {p.notes && (
                  <span style={styles.servingNote}> — {p.notes}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p style={styles.bufferNote}>
        Includes 5% buffer for breakage and replacements.
      </p>

      <div style={styles.ctaBox}>
        <h3 style={styles.ctaTitle}>Get a quote for complete tableware</h3>
        {!submitted ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.emailInput}
            />
            <button
              type="button"
              onClick={handleCta}
              style={{ ...styles.ctaButton, backgroundColor: primaryColor }}
            >
              {ctaText}
            </button>
          </>
        ) : (
          <p style={styles.ctaSuccess}>
            Thanks! We'll send your quote to {email}.
          </p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    maxWidth: 720,
    margin: '0 auto',
    padding: 24,
    color: '#1a1a1a',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: '1px solid #e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#555',
    marginBottom: 12,
  },
  guestRow: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  guestField: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  guestLabel: {
    fontSize: 14,
    color: '#555',
  },
  input: {
    width: 72,
    padding: '8px 12px',
    fontSize: 16,
    border: '1px solid #ccc',
    borderRadius: 8,
  },
  styleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
  },
  styleCard: {
    padding: 16,
    border: '2px solid #e0e0e0',
    borderRadius: 12,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
  },
  styleCardSelected: {
    borderColor: '#1976d2',
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
  },
  styleIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  styleLabel: {
    fontSize: 13,
    fontWeight: 600,
  },
  checkGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 8,
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
  },
  checkbox: {
    width: 18,
    height: 18,
    accentColor: '#1976d2',
  },
  diagram: {
    border: '1px solid #e0e0e0',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#fafafa',
  },
  diagramTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 16,
    textAlign: 'center',
  },
  diagramInner: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gridTemplateRows: 'auto auto auto auto',
    gridTemplateAreas: `
      "bread bread bread ."
      "salad-fork dinner-fork dinner-plate knife"
      "dessert-fork . soup spoon"
      ". . butter-tea glasses"
    `,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 360,
    margin: '0 auto',
  },
  diagramItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  diagramEmoji: {
    fontSize: 20,
  },
  diagramLabel: {
    fontSize: 11,
    color: '#666',
  },
  resultsSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTop: '2px solid #e0e0e0',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 20,
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 24,
    marginBottom: 20,
  },
  resultsColumn: {},
  resultsSubtitle: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#555',
    marginBottom: 8,
  },
  resultsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  resultsItem: {
    fontSize: 14,
    padding: '4px 0',
  },
  servingSection: {
    marginBottom: 16,
  },
  servingNote: {
    color: '#666',
    fontSize: 13,
  },
  bufferNote: {
    fontSize: 13,
    color: '#666',
    marginBottom: 24,
  },
  ctaBox: {
    border: '1px solid #e0e0e0',
    borderRadius: 12,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    alignItems: 'stretch',
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: 600,
    margin: 0,
  },
  emailInput: {
    padding: '10px 14px',
    fontSize: 16,
    border: '1px solid #ccc',
    borderRadius: 8,
  },
  ctaButton: {
    padding: '12px 20px',
    fontSize: 16,
    fontWeight: 600,
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  ctaSuccess: {
    margin: 0,
    color: '#2e7d32',
    fontWeight: 500,
  },
};

function App() {
  const rootEl = document.getElementById(ROOT_ID);
  const ctaText =
    rootEl?.getAttribute('data-cta-text') ?? 'Get Your Quote';
  const primaryColor =
    rootEl?.getAttribute('data-primary-color') ?? '#1976d2';

  const dynamicStyles = useMemo(
    () => ({
      styleCardSelected: {
        ...styles.styleCardSelected,
        borderColor: primaryColor,
        backgroundColor: `${primaryColor}14`,
      },
    }),
    [primaryColor]
  );

  const [input, setInput] =
    useState<PlaceSettingCalculation>(DEFAULT_CALCULATION);

  const result = useMemo(
    () => calculatePlaceSettings(input),
    [input]
  );

  const totalGuests =
    input.guestCount + input.childCount + input.vendorCount;

  const update = useCallback(
    <K extends keyof PlaceSettingCalculation>(
      key: K,
      value: PlaceSettingCalculation[K]
    ) => {
      setInput((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const updateCourses = useCallback(
    (key: keyof PlaceSettingCalculation['courses'], value: boolean) => {
      setInput((prev) => ({
        ...prev,
        courses: { ...prev.courses, [key]: value },
      }));
    },
    []
  );

  const updateBeverages = useCallback(
    (key: keyof PlaceSettingCalculation['beverages'], value: boolean) => {
      setInput((prev) => ({
        ...prev,
        beverages: { ...prev.beverages, [key]: value },
      }));
    },
    []
  );

  return (
    <div style={{ ...styles.root, ['--primary' as string]: primaryColor }}>
      <header style={styles.header}>
        <h1 style={styles.title}>
          <span aria-hidden>🍽️</span> Place Setting Calculator
        </h1>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>How many guests?</h2>
        <div style={styles.guestRow}>
          <div style={styles.guestField}>
            <label htmlFor="guest-count" style={styles.guestLabel}>
              Adults
            </label>
            <input
              id="guest-count"
              type="number"
              min={0}
              value={input.guestCount}
              onChange={(e) =>
                update('guestCount', Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              style={styles.input}
            />
          </div>
          <div style={styles.guestField}>
            <label htmlFor="child-count" style={styles.guestLabel}>
              Children
            </label>
            <input
              id="child-count"
              type="number"
              min={0}
              value={input.childCount}
              onChange={(e) =>
                update('childCount', Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              style={styles.input}
            />
          </div>
          <div style={styles.guestField}>
            <label htmlFor="vendor-count" style={styles.guestLabel}>
              Vendors
            </label>
            <input
              id="vendor-count"
              type="number"
              min={0}
              value={input.vendorCount}
              onChange={(e) =>
                update('vendorCount', Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              style={styles.input}
            />
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Service style</h2>
        <div style={styles.styleGrid}>
          {SERVICE_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              style={{
                ...styles.styleCard,
                ...(input.serviceStyle === s.id
                  ? dynamicStyles.styleCardSelected
                  : {}),
              }}
              onClick={() => update('serviceStyle', s.id)}
            >
              <div style={styles.styleIcon}>{s.icon}</div>
              <div style={styles.styleLabel}>{s.label}</div>
            </button>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Courses (select all that apply)</h2>
        <div style={styles.checkGrid}>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={input.courses.appetizer}
              onChange={(e) => updateCourses('appetizer', e.target.checked)}
              style={styles.checkbox}
            />
            Appetizer / Salad
          </label>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={input.courses.salad}
              onChange={(e) => updateCourses('salad', e.target.checked)}
              style={styles.checkbox}
            />
            Salad course
          </label>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={input.courses.soup}
              onChange={(e) => updateCourses('soup', e.target.checked)}
              style={styles.checkbox}
            />
            Soup course
          </label>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={input.courses.main}
              onChange={(e) => updateCourses('main', e.target.checked)}
              style={styles.checkbox}
            />
            Main course
          </label>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={input.courses.dessert}
              onChange={(e) => updateCourses('dessert', e.target.checked)}
              style={styles.checkbox}
            />
            Dessert
          </label>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={input.courses.bread}
              onChange={(e) => updateCourses('bread', e.target.checked)}
              style={styles.checkbox}
            />
            Bread service
          </label>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Beverages</h2>
        <div style={styles.checkGrid}>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={input.beverages.water}
              onChange={(e) => updateBeverages('water', e.target.checked)}
              style={styles.checkbox}
            />
            Water
          </label>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={input.beverages.redWine}
              onChange={(e) => updateBeverages('redWine', e.target.checked)}
              style={styles.checkbox}
            />
            Red wine
          </label>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={input.beverages.whiteWine}
              onChange={(e) => updateBeverages('whiteWine', e.target.checked)}
              style={styles.checkbox}
            />
            White wine
          </label>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={input.beverages.champagne}
              onChange={(e) => updateBeverages('champagne', e.target.checked)}
              style={styles.checkbox}
            />
            Champagne toast
          </label>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={input.beverages.beer}
              onChange={(e) => updateBeverages('beer', e.target.checked)}
              style={styles.checkbox}
            />
            Beer
          </label>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={input.beverages.coffee}
              onChange={(e) => updateBeverages('coffee', e.target.checked)}
              style={styles.checkbox}
            />
            Coffee
          </label>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={input.beverages.tea}
              onChange={(e) => updateBeverages('tea', e.target.checked)}
              style={styles.checkbox}
            />
            Tea
          </label>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={input.beverages.cocktails}
              onChange={(e) => updateBeverages('cocktails', e.target.checked)}
              style={styles.checkbox}
            />
            Cocktails
          </label>
        </div>
      </section>

      {(input.serviceStyle === 'family_style' ||
        input.serviceStyle === 'buffet') && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Setup</h2>
          <div style={styles.guestRow}>
            {input.serviceStyle === 'family_style' && (
              <div style={styles.guestField}>
                <label htmlFor="family-tables" style={styles.guestLabel}>
                  Number of tables
                </label>
                <input
                  id="family-tables"
                  type="number"
                  min={1}
                  value={input.familyStyleTables ?? 15}
                  onChange={(e) =>
                    update(
                      'familyStyleTables',
                      Math.max(1, parseInt(e.target.value, 10) || 1)
                    )
                  }
                  style={styles.input}
                />
              </div>
            )}
            {input.serviceStyle === 'buffet' && (
              <div style={styles.guestField}>
                <label htmlFor="buffet-stations" style={styles.guestLabel}>
                  Buffet stations
                </label>
                <input
                  id="buffet-stations"
                  type="number"
                  min={1}
                  value={input.buffetStations ?? 2}
                  onChange={(e) =>
                    update(
                      'buffetStations',
                      Math.max(1, parseInt(e.target.value, 10) || 1)
                    )
                  }
                  style={styles.input}
                />
              </div>
            )}
          </div>
        </section>
      )}

      <PlaceSettingDiagram input={input} />

      <ResultsSection
        result={result}
        totalGuests={totalGuests}
        ctaText={ctaText}
        primaryColor={primaryColor}
      />
    </div>
  );
}

const container = document.getElementById(ROOT_ID);
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
