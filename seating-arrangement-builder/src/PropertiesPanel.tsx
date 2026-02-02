import type { FloorPlanElement } from './types';
import { ELEMENT_SPECS } from './elementDefaults';
import './PropertiesPanel.css';

const TABLE_COLORS = [
  '#e3f2fd',
  '#f3e5f5',
  '#e8f5e9',
  '#fff3e0',
  '#fce4ec',
  '#e0f7fa',
  '#f1f8e9',
  '#ede7f6',
];

interface PropertiesPanelProps {
  element: FloorPlanElement | null;
  onUpdate: (updates: Partial<FloorPlanElement['properties']>) => void;
  onDelete: () => void;
}

export default function PropertiesPanel({ element, onUpdate, onDelete }: PropertiesPanelProps) {
  if (!element) {
    return (
      <div className="sab-props">
        <h3 className="sab-props-title">Properties</h3>
        <p className="sab-props-empty">Select an element to edit.</p>
      </div>
    );
  }

  const spec = ELEMENT_SPECS[element.type];
  const hasSeats = spec.defaultSeats != null;

  return (
    <div className="sab-props">
      <h3 className="sab-props-title">Properties</h3>
      <div className="sab-props-body">
        <div className="sab-props-row">
          <label className="sab-props-label">Type</label>
          <span className="sab-props-value">{spec.label}</span>
        </div>
        <div className="sab-props-row">
          <label className="sab-props-label">Label</label>
          <input
            type="text"
            className="sab-props-input"
            value={element.properties.label ?? ''}
            onChange={(e) => onUpdate({ label: e.target.value || undefined })}
            placeholder="e.g. Table 7"
          />
        </div>
        {hasSeats && (
          <div className="sab-props-row">
            <label className="sab-props-label">Seats</label>
            <input
              type="number"
              className="sab-props-input"
              min={0}
              max={24}
              value={element.properties.seats ?? spec.defaultSeats ?? 0}
              onChange={(e) => onUpdate({ seats: Math.max(0, parseInt(e.target.value, 10) || 0) })}
            />
          </div>
        )}
        <div className="sab-props-row">
          <label className="sab-props-label">Color</label>
          <div className="sab-props-colors">
            {TABLE_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`sab-props-color ${(element.properties.color ?? TABLE_COLORS[0]) === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => onUpdate({ color })}
                title={color}
                aria-label={`Set color to ${color}`}
              />
            ))}
          </div>
        </div>
        <button type="button" className="sab-props-delete" onClick={onDelete}>
          Delete element
        </button>
      </div>
    </div>
  );
}
