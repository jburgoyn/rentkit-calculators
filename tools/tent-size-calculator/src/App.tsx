import { useMemo, useState } from 'react';
import { calculateTentSize } from './calculator/calculate';
import type { TentCalculationInput } from './calculator/types';
import { GuestCountStep } from './components/GuestCountStep';
import { EventStyleStep } from './components/EventStyleStep';
import { ElementsStep } from './components/ElementsStep';
import { TentPreferencesStep } from './components/TentPreferencesStep';
import { ResultsSection } from './components/ResultsSection';
import './components/styles.css';
import './App.css';

const defaultInput: TentCalculationInput = {
  guestCount: 150,
  eventStyle: 'reception_seated',
  elements: {
    danceFloor: true,
    danceFloorPercentage: 50,
    danceLevel: 'moderate',
    barStations: 2,
    buffetStations: 1,
    djBand: 'dj',
    photoBooth: false,
    cakeTable: true,
    giftTable: true,
    loungeArea: 'none',
    cateringPrep: false,
  },
  tentPreferences: {
    style: 'frame',
    enclosed: false,
    climateControl: false,
  },
};

export default function App() {
  const [input, setInput] = useState<TentCalculationInput>(defaultInput);

  const result = useMemo(() => calculateTentSize(input), [input]);

  const updateInput = <K extends keyof TentCalculationInput>(key: K, value: TentCalculationInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const updateElements = (key: keyof TentCalculationInput['elements'], value: unknown) => {
    setInput((prev) => ({
      ...prev,
      elements: { ...prev.elements, [key]: value },
    }));
  };

  const updatePreferences = (key: keyof TentCalculationInput['tentPreferences'], value: unknown) => {
    setInput((prev) => ({
      ...prev,
      tentPreferences: { ...prev.tentPreferences, [key]: value },
    }));
  };

  return (
    <div className="tent-calculator">
      <header className="tent-header">
        <h1 className="tent-title">
          <span className="tent-icon" aria-hidden>⛺</span>
          Tent Size Calculator
        </h1>
        <p className="tent-subtitle">Find the right tent size for your event</p>
      </header>

      <main className="tent-main">
        <section className="tent-form">
          <GuestCountStep
            guestCount={input.guestCount}
            onChange={(n) => updateInput('guestCount', n)}
          />
          <EventStyleStep
            eventStyle={input.eventStyle}
            onChange={(s) => updateInput('eventStyle', s)}
          />
          <ElementsStep
            elements={input.elements}
            onChange={updateElements}
          />
          <TentPreferencesStep
            preferences={input.tentPreferences}
            onChange={updatePreferences}
          />
        </section>

        <ResultsSection input={input} result={result} />
      </main>
    </div>
  );
}
