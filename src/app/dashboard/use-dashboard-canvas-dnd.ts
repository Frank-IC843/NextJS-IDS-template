'use client';

import {
  closestCenter,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  type Modifier,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState, type RefObject } from 'react';
import type { DashboardWidget } from '@/app/dashboard/dashboard-builder-types';

interface UseDashboardCanvasDndOptions {
  pageRef: RefObject<HTMLDivElement | null>;
  canvasGridRef: RefObject<HTMLDivElement | null>;
  widgets: DashboardWidget[];
  onWidgetsChange: (widgets: DashboardWidget[]) => void;
}

export function useDashboardCanvasDnd({ pageRef, canvasGridRef, widgets, onWidgetsChange }: UseDashboardCanvasDndOptions) {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const collisionDetectionStrategy: CollisionDetection = args => {
    const pointerCollisions = pointerWithin(args);

    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    const intersectionCollisions = rectIntersection(args);

    if (intersectionCollisions.length > 0) {
      return intersectionCollisions;
    }

    return closestCenter(args);
  };

  const restrictToPageBounds: Modifier = ({ draggingNodeRect, activeNodeRect, transform }) => {
    const pageRect = pageRef.current?.getBoundingClientRect();
    const canvasGridRect = canvasGridRef.current?.getBoundingClientRect();
    const nodeRect = draggingNodeRect ?? activeNodeRect;

    if (!pageRect || !nodeRect) {
      return transform;
    }

    let x = transform.x;
    let y = transform.y;
    const leftBound = canvasGridRect?.left ?? pageRect.left;
    const rightBound = canvasGridRect?.right ?? pageRect.right;
    const topBound = canvasGridRect?.top ?? pageRect.top;

    const nextLeft = nodeRect.left + x;
    const nextRight = nodeRect.right + x;
    const nextTop = nodeRect.top + y;
    const nextBottom = nodeRect.bottom + y;

    if (nextLeft < leftBound) {
      x += leftBound - nextLeft;
    }

    if (nextRight > rightBound) {
      x -= nextRight - rightBound;
    }

    if (nextTop < topBound) {
      y += topBound - nextTop;
    }

    if (nextBottom > pageRect.bottom) {
      y -= nextBottom - pageRect.bottom;
    }

    return {
      ...transform,
      x,
      y,
    };
  };

  function clearDragState() {
    setActiveDragId(null);
    setDragOverWidgetId(null);
  }

  function handleDragStart(event: DragStartEvent) {
    const nextActiveId = String(event.active.id);
    setActiveDragId(nextActiveId);
    setDragOverWidgetId(nextActiveId);
  }

  function handleDragOver(event: DragOverEvent) {
    setDragOverWidgetId(event.over ? String(event.over.id) : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    clearDragState();

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = widgets.findIndex(widget => widget.id === active.id);
    const newIndex = widgets.findIndex(widget => widget.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    onWidgetsChange(arrayMove(widgets, oldIndex, newIndex));
  }

  return {
    activeDragId,
    dragOverWidgetId,
    isCanvasDragging: activeDragId !== null,
    sensors,
    collisionDetectionStrategy,
    restrictToPageBounds,
    clearDragState,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
