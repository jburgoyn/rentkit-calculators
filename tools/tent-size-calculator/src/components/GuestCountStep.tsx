interface GuestCountStepProps {
  guestCount: number;
  onChange: (n: number) => void;
}

const MIN = 10;
const MAX = 500;
const STEP = 10;

export function GuestCountStep({ guestCount, onChange }: GuestCountStepProps) {
  return (
    <div className="card">
      <h2 className="card-title">Step 1: Guest count</h2>
      <div className="guest-count-row">
        <label htmlFor="guest-count" className="sr-only">
          Number of guests
        </label>
        <input
          id="guest-count"
          type="number"
          min={MIN}
          max={MAX}
          value={guestCount}
          onChange={(e) => onChange(Math.min(MAX, Math.max(MIN, Number(e.target.value) || MIN)))}
          className="guest-input"
        />
        <span className="guest-label">guests</span>
      </div>
      <input
        type="range"
        min={MIN}
        max={MAX}
        step={STEP}
        value={guestCount}
        onChange={(e) => onChange(Number(e.target.value))}
        className="guest-slider"
        aria-label="Guest count slider"
      />
      <div className="slider-labels">
        <span>50</span>
        <span>{guestCount}</span>
        <span>300</span>
      </div>
    </div>
  );
}
