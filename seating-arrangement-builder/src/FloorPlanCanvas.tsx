import { useCallback } from 'react';
import type { RefObject } from 'react';
import { Stage, Layer, Group, Circle, Rect, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Stage as KonvaStage } from 'konva/lib/Stage';
import type { FloorPlan, FloorPlanElement } from './types';
import { ELEMENT_SPECS } from './elementDefaults';
import { PIXELS_PER_FOOT } from './constants';
import './FloorPlanCanvas.css';

interface FloorPlanCanvasProps {
  floorPlan: FloorPlan;
  selectedElementIds: string[];
  onSelectElement: (id: string | null) => void;
  onElementDragEnd: (id: string, x: number, y: number) => void;
  onCanvasClick: (x: number, y: number) => void;
  stageWidth: number;
  stageHeight: number;
  scale: number;
  stageRef?: RefObject<KonvaStage | null>;
}

function feetToPx(feet: number): number {
  return feet * PIXELS_PER_FOOT;
}

interface ElementShapeProps {
  el: FloorPlanElement;
  isSelected: boolean;
  scale: number;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
}

function ElementShape({ el, isSelected, scale, onSelect, onDragEnd }: ElementShapeProps) {
  const spec = ELEMENT_SPECS[el.type];
  const w = (el.properties.width ?? spec.widthFt) * PIXELS_PER_FOOT * scale;
  const h = (el.properties.length ?? spec.lengthFt) * PIXELS_PER_FOOT * scale;
  const x = el.x * PIXELS_PER_FOOT * scale;
  const y = el.y * PIXELS_PER_FOOT * scale;

  const handleDragEnd = useCallback(
    (e: { target: { x: () => number; y: () => number } }) => {
      const node = e.target;
      const newX = node.x() / (PIXELS_PER_FOOT * scale);
      const newY = node.y() / (PIXELS_PER_FOOT * scale);
      onDragEnd(newX, newY);
    },
    [scale, onDragEnd]
  );

  const fill = el.properties.color ?? (spec.shape === 'circle' ? '#e3f2fd' : '#f5f5f5');
  const stroke = isSelected ? '#1976d2' : '#90a4ae';
  const strokeWidth = isSelected ? 3 : 1;

  if (spec.shape === 'circle') {
    const r = Math.min(w, h) / 2;
    return (
      <Group
        x={x}
        y={y}
        draggable
        onDragEnd={handleDragEnd}
        onClick={(e) => {
          e.cancelBubble = true;
          onSelect();
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          onSelect();
        }}
        dragBoundFunc={(pos) => ({ x: pos.x, y: pos.y })}
      >
        <Circle radius={r} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        {el.properties.label && (
          <Text
            text={el.properties.label}
            fontSize={14}
            fontFamily="sans-serif"
            fill="#37474f"
            align="center"
            verticalAlign="middle"
            width={r * 2}
            height={r * 2}
            x={-r}
            y={-r}
            listening={false}
          />
        )}
      </Group>
    );
  }

  return (
    <Group
      x={x}
      y={y}
      offsetX={w / 2}
      offsetY={h / 2}
      draggable
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
      rotation={el.rotation}
      dragBoundFunc={(pos) => ({ x: pos.x, y: pos.y })}
    >
      <Rect width={w} height={h} fill={fill} stroke={stroke} strokeWidth={strokeWidth} cornerRadius={2} />
      {el.properties.label && (
        <Text
          text={el.properties.label}
          fontSize={12}
          fontFamily="sans-serif"
          fill="#37474f"
          align="center"
          verticalAlign="middle"
          width={w}
          height={h}
          x={0}
          y={0}
          listening={false}
        />
      )}
    </Group>
  );
}

export default function FloorPlanCanvas({
  floorPlan,
  selectedElementIds,
  onSelectElement,
  onElementDragEnd,
  onCanvasClick,
  stageWidth,
  stageHeight,
  scale,
  stageRef,
}: FloorPlanCanvasProps) {
  const venueW = feetToPx(floorPlan.venue.width) * scale;
  const venueH = feetToPx(floorPlan.venue.length) * scale;
  const stageX = (stageWidth - venueW) / 2;
  const stageY = (stageHeight - venueH) / 2;

  const handleStageClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const clicked = e.target;
      if (clicked.getClassName() === 'Stage' || clicked.getClassName() === 'Layer') {
        onSelectElement(null);
        const stage = clicked.getStage();
        if (stage) {
          const pos = stage.getPointerPosition();
          if (pos) {
            const transform = stage.getAbsoluteTransform().copy().invert();
            const point = transform.point(pos);
            const footX = (point.x - stageX) / (PIXELS_PER_FOOT * scale);
            const footY = (point.y - stageY) / (PIXELS_PER_FOOT * scale);
            if (footX >= 0 && footX <= floorPlan.venue.width && footY >= 0 && footY <= floorPlan.venue.length) {
              onCanvasClick(footX, footY);
            }
          }
        }
      }
    },
    [onSelectElement, onCanvasClick, stageX, stageY, scale, floorPlan.venue.width, floorPlan.venue.length]
  );

  return (
    <div className="sab-canvas-wrap">
      <Stage ref={stageRef as RefObject<KonvaStage>} width={stageWidth} height={stageHeight} onClick={handleStageClick} onTap={handleStageClick as (e: KonvaEventObject<Event>) => void}>
        <Layer x={stageX} y={stageY}>
          {/* Venue background */}
          <Rect width={venueW} height={venueH} fill="#fafafa" stroke="#b0bec5" strokeWidth={2} listening={false} />
          {/* Grid */}
          {floorPlan.settings.showGrid && (
            <>
              {Array.from({ length: Math.floor(floorPlan.venue.width / floorPlan.settings.gridSize) + 1 }, (_, i) => (
                <Rect
                  key={`v-${i}`}
                  x={i * feetToPx(floorPlan.settings.gridSize) * scale}
                  y={0}
                  width={1}
                  height={venueH}
                  fill="#e0e0e0"
                  listening={false}
                />
              ))}
              {Array.from({ length: Math.floor(floorPlan.venue.length / floorPlan.settings.gridSize) + 1 }, (_, i) => (
                <Rect
                  key={`h-${i}`}
                  x={0}
                  y={i * feetToPx(floorPlan.settings.gridSize) * scale}
                  width={venueW}
                  height={1}
                  fill="#e0e0e0"
                  listening={false}
                />
              ))}
            </>
          )}
          {/* Elements */}
          {floorPlan.elements.map((el) => (
            <ElementShape
              key={el.id}
              el={el}
              isSelected={selectedElementIds.includes(el.id)}
              scale={scale}
              onSelect={() => onSelectElement(el.id)}
              onDragEnd={(x, y) => onElementDragEnd(el.id, x, y)}
            />
          ))}
        </Layer>
      </Stage>
      <div className="sab-canvas-venue-info">
        Venue: {floorPlan.venue.width}' × {floorPlan.venue.length}' · {floorPlan.elements.length} elements
      </div>
    </div>
  );
}
