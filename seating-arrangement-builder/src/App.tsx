import { useCallback, useEffect, useRef, useState } from 'react';
import type { Stage as KonvaStage } from 'konva/lib/Stage';
import type { FloorPlan, FloorPlanElement, ElementType } from './types';
import { createEmptyFloorPlan, createFloorPlanElement } from './createFloorPlan';
import { validateFloorPlan } from './validation';
import { STORAGE_KEY } from './constants';
import FloorPlanCanvas from './FloorPlanCanvas';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import './App.css';

const DEFAULT_SCALE = 0.9;

function loadStored(): FloorPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FloorPlan;
    if (parsed?.venue && Array.isArray(parsed.elements)) return parsed;
  } catch {
    // ignore
  }
  return null;
}

function saveToStorage(floorPlan: FloorPlan) {
  try {
    const toSave = { ...floorPlan, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

export default function App() {
  const [floorPlan, setFloorPlan] = useState<FloorPlan>(() => loadStored() ?? createEmptyFloorPlan());
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [addingElementType, setAddingElementType] = useState<ElementType | null>(null);
  const [venueSize, setVenueSize] = useState({ width: floorPlan.venue.width, length: floorPlan.venue.length });
  const [showGrid, setShowGrid] = useState(floorPlan.settings.showGrid);
  const scale = DEFAULT_SCALE;
  const stageRef = useRef<KonvaStage | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? { width: 800, height: 600 };
      setCanvasSize({ width: Math.max(400, width), height: Math.max(400, height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const selectedElement = selectedElementIds[0]
    ? floorPlan.elements.find((e) => e.id === selectedElementIds[0]) ?? null
    : null;

  const warnings = validateFloorPlan(floorPlan);

  const updateFloorPlan = useCallback((updater: (prev: FloorPlan) => FloorPlan) => {
    setFloorPlan((prev) => {
      const next = updater(prev);
      saveToStorage(next);
      return next;
    });
  }, []);

  const applyVenueSize = useCallback(() => {
    updateFloorPlan((prev) => ({
      ...prev,
      venue: { ...prev.venue, width: venueSize.width, length: venueSize.length },
    }));
  }, [venueSize.width, venueSize.length, updateFloorPlan]);

  const toggleGrid = useCallback(() => {
    const next = !showGrid;
    setShowGrid(next);
    updateFloorPlan((prev) => ({
      ...prev,
      settings: { ...prev.settings, showGrid: next },
    }));
  }, [showGrid, updateFloorPlan]);

  const handleSelectElement = useCallback((id: string | null) => {
    setSelectedElementIds(id ? [id] : []);
  }, []);

  const handleCanvasClick = useCallback(
    (x: number, y: number) => {
      if (!addingElementType) return;
      updateFloorPlan((prev) => ({
        ...prev,
        elements: [...prev.elements, createFloorPlanElement(addingElementType, x, y)],
      }));
      setAddingElementType(null);
    },
    [addingElementType, updateFloorPlan]
  );

  const handleElementDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      const gridSize = floorPlan.settings.gridSize;
      const snap = floorPlan.settings.snapToGrid;
      const nx = snap ? Math.round(x / gridSize) * gridSize : x;
      const ny = snap ? Math.round(y / gridSize) * gridSize : y;
      updateFloorPlan((prev) => ({
        ...prev,
        elements: prev.elements.map((e) => (e.id === id ? { ...e, x: nx, y: ny } : e)),
      }));
    },
    [floorPlan.settings.gridSize, floorPlan.settings.snapToGrid, updateFloorPlan]
  );

  const handleUpdateProperties = useCallback(
    (updates: Partial<FloorPlanElement['properties']>) => {
      if (!selectedElement) return;
      updateFloorPlan((prev) => ({
        ...prev,
        elements: prev.elements.map((e) =>
          e.id === selectedElement.id ? { ...e, properties: { ...e.properties, ...updates } } : e
        ),
      }));
    },
    [selectedElement, updateFloorPlan]
  );

  const handleDeleteElement = useCallback(() => {
    if (!selectedElement) return;
    updateFloorPlan((prev) => ({
      ...prev,
      elements: prev.elements.filter((e) => e.id !== selectedElement.id),
    }));
    setSelectedElementIds([]);
  }, [selectedElement, updateFloorPlan]);

  const handleExport = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const dataUrl = stage.toDataURL({ pixelRatio: 2, mimeType: 'image/png' });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `floor-plan-${floorPlan.name.replace(/\s+/g, '-')}.png`;
    a.click();
  }, [floorPlan.name]);

  const totalSeats = floorPlan.elements.reduce(
    (sum, el) => sum + (el.properties.seats ?? 0),
    0
  );

  return (
    <div className="sab">
      <header className="sab-header">
        <h1 className="sab-title">
          <span className="sab-title-icon" aria-hidden>
            🪑
          </span>
          Seating Arrangement Builder
        </h1>
        <div className="sab-header-actions">
          <button type="button" className="sab-btn sab-btn-secondary" onClick={handleExport}>
            Export PNG
          </button>
        </div>
      </header>

      <div className="sab-venue-bar">
        <label className="sab-venue-label">
          Width (ft)
          <input
            type="number"
            className="sab-venue-input"
            min={20}
            max={200}
            value={venueSize.width}
            onChange={(e) => setVenueSize((p) => ({ ...p, width: Math.max(20, parseInt(e.target.value, 10) || 20) }))}
          />
        </label>
        <label className="sab-venue-label">
          Length (ft)
          <input
            type="number"
            className="sab-venue-input"
            min={20}
            max={200}
            value={venueSize.length}
            onChange={(e) => setVenueSize((p) => ({ ...p, length: Math.max(20, parseInt(e.target.value, 10) || 20) }))}
          />
        </label>
        <button type="button" className="sab-btn sab-btn-small" onClick={applyVenueSize}>
          Apply
        </button>
        <label className="sab-venue-toggle">
          <input type="checkbox" checked={showGrid} onChange={toggleGrid} />
          Grid
        </label>
      </div>

      <div className="sab-layout">
        <aside className="sab-sidebar sab-sidebar-left">
          <Toolbar selectedElementType={addingElementType} onSelectElementType={setAddingElementType} />
        </aside>

        <main className="sab-main">
          <div className="sab-canvas-container" ref={canvasContainerRef}>
            <FloorPlanCanvas
              stageRef={stageRef}
              floorPlan={{ ...floorPlan, venue: { ...floorPlan.venue, width: venueSize.width, length: venueSize.length }, settings: { ...floorPlan.settings, showGrid } }}
              selectedElementIds={selectedElementIds}
              onSelectElement={handleSelectElement}
              onElementDragEnd={handleElementDragEnd}
              onCanvasClick={handleCanvasClick}
              stageWidth={canvasSize.width}
              stageHeight={canvasSize.height}
              scale={scale}
            />
          </div>
        </main>

        <aside className="sab-sidebar sab-sidebar-right">
          <PropertiesPanel
            element={selectedElement}
            onUpdate={handleUpdateProperties}
            onDelete={handleDeleteElement}
          />
          {warnings.length > 0 && (
            <div className="sab-warnings">
              <h3 className="sab-warnings-title">Warnings</h3>
              <ul className="sab-warnings-list">
                {warnings.map((w, i) => (
                  <li key={i}>⚠️ {w.message}</li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <footer className="sab-footer">
        {floorPlan.elements.length} elements · {totalSeats} seats total
      </footer>
    </div>
  );
}
