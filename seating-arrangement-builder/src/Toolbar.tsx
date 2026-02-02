import type { ElementType } from './types';
import { ELEMENT_SPECS } from './elementDefaults';
import './Toolbar.css';

const TABLE_TYPES: ElementType[] = [
  'table_round_48',
  'table_round_60',
  'table_round_72',
  'table_rect_6ft',
  'table_rect_8ft',
  'table_square',
  'table_cocktail',
  'table_sweetheart',
];

const OTHER_TYPES: ElementType[] = [
  'dance_floor',
  'stage',
  'bar',
  'buffet',
  'photo_booth',
  'cake_table',
  'gift_table',
  'lounge',
];

interface ToolbarProps {
  selectedElementType: ElementType | null;
  onSelectElementType: (type: ElementType | null) => void;
}

export default function Toolbar({ selectedElementType, onSelectElementType }: ToolbarProps) {
  return (
    <div className="sab-toolbar">
      <div className="sab-toolbar-section">
        <h3 className="sab-toolbar-title">Tables</h3>
        <div className="sab-toolbar-palette">
          {TABLE_TYPES.map((type) => {
            const spec = ELEMENT_SPECS[type];
            const isSelected = selectedElementType === type;
            return (
              <button
                key={type}
                type="button"
                className={`sab-toolbar-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectElementType(isSelected ? null : type)}
                title={spec.label}
              >
                <span className="sab-toolbar-icon" aria-hidden>
                  {spec.icon}
                </span>
                <span className="sab-toolbar-label">{spec.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="sab-toolbar-section">
        <h3 className="sab-toolbar-title">Other</h3>
        <div className="sab-toolbar-palette">
          {OTHER_TYPES.map((type) => {
            const spec = ELEMENT_SPECS[type];
            const isSelected = selectedElementType === type;
            return (
              <button
                key={type}
                type="button"
                className={`sab-toolbar-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectElementType(isSelected ? null : type)}
                title={spec.label}
              >
                <span className="sab-toolbar-icon" aria-hidden>
                  {spec.icon}
                </span>
                <span className="sab-toolbar-label">{spec.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
      {selectedElementType && (
        <p className="sab-toolbar-hint">Click on the canvas to place a {ELEMENT_SPECS[selectedElementType].label}</p>
      )}
    </div>
  );
}
