import { createRoot } from 'react-dom/client';
import { useMemo, useState } from 'react';
import { calculateDanceFloor, DANCER_PERCENTAGE } from './calculator';
import { getEmbedConfig } from './embed-config';
import type { DanceFloorCalculation, EventType, DancingStyle, TimeOfEvent } from './types';

const EVENT_OPTIONS: { value: EventType; label: string; icon: string }[] = [
  { value: 'wedding', label: 'Wedding', icon: '💒' },
  { value: 'corporate', label: 'Corporate', icon: '🏢' },
  { value: 'birthday', label: 'Birthday', icon: '🎂' },
  { value: 'nightclub', label: 'Club Night', icon: '🎵' },
  { value: 'school', label: 'School Dance', icon: '🎓' },
];

const DANCING_OPTIONS: { value: DancingStyle; label: string }[] = [
  { value: 'light', label: 'Light (background music)' },
  { value: 'moderate', label: 'Moderate (some dancing)' },
  { value: 'heavy', label: 'Heavy (dance party focus)' },
  { value: 'line_dancing', label: 'Line dancing' },
  { value: 'ballroom', label: 'Swing / ballroom' },
];

const TIME_OPTIONS: { value: TimeOfEvent; label: string }[] = [
  { value: 'daytime', label: 'Daytime' },
  { value: 'evening', label: 'Evening' },
  { value: 'late_night', label: 'Late night' },
];

const ROOT_ID = 'rentkit-dance-floor-calculator';

function DanceFloorCalculator() {
  const rootEl = document.getElementById(ROOT_ID);
  const config = rootEl ? getEmbedConfig(rootEl) : { theme: 'light' as const, primaryColor: '#70C58C', ctaText: 'Get a Quote for Your Dance Floor' };

  const [guestCount, setGuestCount] = useState(150);
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [dancingStyle, setDancingStyle] = useState<DancingStyle>('moderate');
  const [timeOfEvent, setTimeOfEvent] = useState<TimeOfEvent>('evening');
  const [dancerPercentageOverride, setDancerPercentageOverride] = useState<number | null>(null);
  const [email, setEmail] = useState('');

  const input: DanceFloorCalculation = useMemo(
    () => ({
      guestCount: Math.max(1, guestCount),
      dancerPercentage: dancerPercentageOverride ?? undefined,
      eventType,
      dancingStyle,
      timeOfEvent,
    }),
    [guestCount, dancerPercentageOverride, eventType, dancingStyle, timeOfEvent]
  );

  const result = useMemo(() => calculateDanceFloor(input), [input]);

  const isDark = config.theme === 'dark';
  const bg = isDark ? '#1a1a1a' : '#F2F0EA';
  const cardBg = isDark ? '#2d2d2d' : '#fff';
  const text = isDark ? '#e0e0e0' : '#0F281E';
  const muted = isDark ? '#9e9e9e' : '#5a6a64';
  const border = isDark ? '#444' : '#CEAF97';
  const primary = config.primaryColor || '#70C58C';
  const primaryHover = '#0F281E';

  const styles: Record<string, React.CSSProperties> = {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: 560,
      margin: '0 auto',
      padding: 24,
      background: bg,
      color: text,
      borderRadius: 12,
      boxSizing: 'border-box',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
      paddingBottom: 16,
      borderBottom: `1px solid ${border}`,
    },
    title: {
      fontSize: 22,
      fontWeight: 700,
      margin: 0,
    },
    section: {
      marginBottom: 24,
    },
    label: {
      display: 'block',
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: muted,
      marginBottom: 8,
    },
    input: {
      width: '100%',
      maxWidth: 120,
      padding: '10px 12px',
      fontSize: 18,
      border: `1px solid ${border}`,
      borderRadius: 8,
      background: cardBg,
      color: text,
      boxSizing: 'border-box',
    },
    optionGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 10,
    },
    optionIcon: {
      fontSize: 20,
      marginBottom: 4,
    },
    sliderRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flexWrap: 'wrap',
    },
    slider: {
      flex: '1 1 200px',
      minWidth: 0,
      height: 8,
      borderRadius: 4,
      background: border,
      appearance: 'none',
      outline: 'none',
    },
    sliderLabel: {
      fontSize: 14,
      color: muted,
      minWidth: 140,
    },
    resultCard: {
      background: cardBg,
      border: `1px solid ${border}`,
      borderRadius: 12,
      padding: 20,
      marginTop: 8,
    },
    resultTitle: {
      fontSize: 14,
      color: muted,
      marginBottom: 4,
    },
    resultSize: {
      fontSize: 24,
      fontWeight: 700,
      marginBottom: 8,
      color: primary,
    },
    resultMeta: {
      fontSize: 14,
      color: muted,
      marginBottom: 12,
    },
    density: {
      fontSize: 14,
      fontStyle: 'italic',
      color: text,
      marginBottom: 16,
    },
    alternatives: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      marginTop: 16,
    },
    altCard: {
      padding: 12,
      border: `1px solid ${border}`,
      borderRadius: 8,
      background: isDark ? '#252525' : '#f5f5f5',
    },
    altSize: {
      fontWeight: 600,
      fontSize: 15,
    },
    altSqFt: {
      fontSize: 13,
      color: muted,
    },
    tips: {
      marginTop: 20,
      paddingTop: 16,
      borderTop: `1px solid ${border}`,
    },
    tipsList: {
      margin: 0,
      paddingLeft: 20,
      fontSize: 14,
      color: muted,
      lineHeight: 1.6,
    },
    ctaBox: {
      marginTop: 24,
      padding: 20,
      background: isDark ? '#252525' : '#f0f4f8',
      borderRadius: 12,
      border: `1px solid ${border}`,
    },
    ctaRow: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
      marginTop: 12,
    },
    ctaInput: {
      flex: '1 1 200px',
      minWidth: 0,
      padding: '12px 14px',
      fontSize: 15,
      border: `1px solid ${border}`,
      borderRadius: 8,
      background: cardBg,
      color: text,
      boxSizing: 'border-box',
    },
    ctaButton: {
      padding: '12px 20px',
      fontSize: 15,
      fontWeight: 600,
      border: 'none',
      borderRadius: 8,
      background: primary,
      color: primaryHover,
      cursor: 'pointer',
    },
  };

  const optionBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '12px 16px',
    fontSize: 14,
    border: `2px solid ${active ? primary : border}`,
    borderRadius: 8,
    background: active ? (isDark ? `${primary}33` : `${primary}18`) : cardBg,
    color: text,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 80,
  });

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>💃 Dance Floor Calculator</h1>
      </header>

      <section style={styles.section}>
        <label style={styles.label}>How many guests?</label>
        <input
          type="number"
          min={1}
          max={2000}
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value) || 1)}
          style={styles.input}
        />
        <span style={{ marginLeft: 8, color: muted }}>guests</span>
      </section>

      <section style={styles.section}>
        <label style={styles.label}>What type of event?</label>
        <div style={styles.optionGrid}>
          {EVENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              style={optionBtnStyle(eventType === opt.value)}
              onClick={() => setEventType(opt.value)}
            >
              <span style={styles.optionIcon}>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <label style={styles.label}>How much dancing do you expect?</label>
        <div style={styles.optionGrid}>
          {DANCING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              style={optionBtnStyle(dancingStyle === opt.value)}
              onClick={() => setDancingStyle(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <label style={styles.label}>What time is your event?</label>
        <div style={styles.optionGrid}>
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              style={optionBtnStyle(timeOfEvent === opt.value)}
              onClick={() => setTimeOfEvent(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <label style={styles.label}>Dancer % override (optional)</label>
        <div style={styles.sliderRow}>
          <input
            type="range"
            min={10}
            max={90}
            step={5}
            value={dancerPercentageOverride ?? DANCER_PERCENTAGE[eventType][timeOfEvent]}
            onChange={(e) => setDancerPercentageOverride(Number(e.target.value))}
            style={{ ...styles.slider, accentColor: primary }}
          />
          <span style={styles.sliderLabel}>
            {dancerPercentageOverride != null
              ? `${dancerPercentageOverride}% dancing`
              : `~${DANCER_PERCENTAGE[eventType][timeOfEvent]}% (from event type & time)`}
          </span>
        </div>
      </section>

      <div style={styles.resultCard}>
        <div style={styles.resultTitle}>Expected dancers</div>
        <div style={styles.resultMeta}>
          ~{result.expectedDancers} people
          {dancerPercentageOverride == null && (
            <> ({Math.round((result.expectedDancers / input.guestCount) * 100)}% of guests)</>
          )}
        </div>

        <div style={styles.resultTitle}>Recommended size</div>
        <div style={styles.resultSize}>
          {result.recommendedSize.width}' × {result.recommendedSize.length}'
        </div>
        <div style={styles.resultMeta}>
          {result.recommendedSize.sqFt} sq ft ({result.recommendedSize.panels} panels of 3'×3')
        </div>
        <div style={styles.density}>💡 "{result.densityDescription}"</div>

        <div style={styles.resultTitle}>Alternatives</div>
        <div style={styles.alternatives}>
          <div style={styles.altCard}>
            <div style={styles.altSize}>
              {result.alternatives.smaller.width}' × {result.alternatives.smaller.length}'
            </div>
            <div style={styles.altSqFt}>{result.alternatives.smaller.sqFt} sq ft – Cozy but ok</div>
          </div>
          <div style={styles.altCard}>
            <div style={styles.altSize}>
              {result.alternatives.larger.width}' × {result.alternatives.larger.length}'
            </div>
            <div style={styles.altSqFt}>{result.alternatives.larger.sqFt} sq ft – More spacious</div>
          </div>
        </div>

        <div style={styles.tips}>
          <div style={styles.label}>Tips</div>
          <ul style={styles.tipsList}>
            {result.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={styles.ctaBox}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>📧 {config.ctaText}</div>
        <div style={styles.ctaRow}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.ctaInput}
          />
          <button type="button" style={styles.ctaButton}>
            Get Quote
          </button>
        </div>
      </div>
    </div>
  );
}

const rootEl = document.getElementById(ROOT_ID);
if (rootEl) {
  createRoot(rootEl).render(<DanceFloorCalculator />);
}
