import React, { useRef, useState, useEffect } from 'react';
import { DEFAULT_SHAPE_PROPS } from '../../constants';
import { ShapeRenderer } from './ShapeRenderer';
import '../../styles/diagram.css';

// Utility functions for orthogonal routing
const getShapeCenter = (shape) => ({
  x: shape.x + shape.width / 2,
  y: shape.y + shape.height / 2
});

const getClosestConnectionPoint = (shape, fromPoint) => {
  const center = getShapeCenter(shape);
  const points = [
    { x: center.x, y: shape.y, side: 'top' },
    { x: shape.x + shape.width, y: center.y, side: 'right' },
    { x: center.x, y: shape.y + shape.height, side: 'bottom' },
    { x: shape.x, y: center.y, side: 'left' }
  ];

  return points.reduce((closest, point) => {
    const dist = Math.sqrt(Math.pow(point.x - fromPoint.x, 2) + Math.pow(point.y - fromPoint.y, 2));
    const closestDist = Math.sqrt(Math.pow(closest.x - fromPoint.x, 2) + Math.pow(closest.y - fromPoint.y, 2));
    return dist < closestDist ? point : closest;
  });
};

const calculateOrthogonalRoute = (start, end) => {
  const route = [start];

  const midX = start.x + (end.x - start.x) / 2;
  const midY = start.y + (end.y - start.y) / 2;

  if (Math.abs(end.x - start.x) > Math.abs(end.y - start.y)) {
    route.push({ x: midX, y: start.y });
    route.push({ x: midX, y: end.y });
  } else {
    route.push({ x: start.x, y: midY });
    route.push({ x: end.x, y: midY });
  }

  route.push(end);
  return route;
};

export const Canvas = ({ shapes, selectedId, onSelectShape, onUpdateShape, onAddShape, zoom, onShapeChangeEnd }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);
  const [resizingId, setResizingId] = useState(null);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    originX: 0,
    originY: 0,
    routePoints: null,
  });
  const [dragOffset, setDragOffset] = useState({
    x: 0,
    y: 0
  });

  const [dragStart, setDragStart] = useState(null);
  const [dragRouteStart, setDragRouteStart] = useState(null);

  const [docTextModeId, setDocTextModeId] = useState(null);
  const [canvasBounds, setCanvasBounds] = useState({ minX: 0, minY: 0, maxX: 800, maxY: 600 });
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });

  // Update canvas bounds based on content
  useEffect(() => {
    const bounds = getContentBounds();
    setCanvasBounds(bounds);
  }, [shapes]);

  // Track viewport size
  useEffect(() => {
    const updateViewportSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setViewportSize({ width: rect.width, height: rect.height });
      }
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const getContentBounds = () => {
    const scale = zoom / 100;
    const viewportW = viewportSize.width / scale;
    const viewportH = viewportSize.height / scale;
    
    if (shapes.length === 0) {
      return { minX: 0, minY: 0, maxX: viewportW, maxY: viewportH };
    }
    
    const xs = shapes.map(s => s.x);
    const ys = shapes.map(s => s.y);
    const rightEdges = shapes.map(s => s.x + s.width);
    const bottomEdges = shapes.map(s => s.y + s.height);
    
    // Also consider routePoints for connectors
    shapes.forEach(shape => {
      if (shape.routePoints && shape.routePoints.length > 0) {
        shape.routePoints.forEach(p => {
          xs.push(p.x);
          ys.push(p.y);
        });
      }
    });
    
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...rightEdges, ...xs);
    const maxY = Math.max(...bottomEdges, ...ys);
    
    // Add margin around content
    const margin = 100;
    
    return { 
      minX: Math.min(0, minX - margin), 
      minY: Math.min(0, minY - margin), 
      maxX: Math.max(viewportW, maxX + margin), 
      maxY: Math.max(viewportH, maxY + margin) 
    };
  };

  const getCanvasSize = () => {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const scale = zoom / 100;
    return { w: rect.width / scale, h: rect.height / scale };
  };

  const clampShapePositionToCanvas = (shape, proposedX, proposedY) => {
    // Allow shapes to be dragged beyond current canvas bounds
    // The canvas will expand dynamically based on content
    return { x: proposedX, y: proposedY };
  };

  const isConnector = (t) =>
    t.startsWith('arrow') ||
    ([
      'association',
      'aggregation',
      'composition',
      'inheritance',
      'dependency',
      'dotted-arrow',
      'erd-one-to-one',
      'erd-one-to-many',
      'erd-one-and-only-one',
      'erd-one-or-more',
      'erd-zero-or-one',
      'erd-zero-or-many',
    ]).includes(t);

  const getConnectorHandlePositions = (shape) => {
    const rp = shape.routePoints;
    if (!rp || rp.length < 2) {
      return {
        start: { x: 0, y: shape.height / 2 },
        end: { x: shape.width, y: shape.height / 2 },
      };
    }
    const sx = shape.x;
    const sy = shape.y;
    return {
      start: { x: rp[0].x - sx, y: rp[0].y - sy },
      end: { x: rp[rp.length - 1].x - sx, y: rp[rp.length - 1].y - sy },
    };
  };

  const moveEndpoint = (pts, endpointIndex, dx, dy) => {
    if (pts.length < 2) return pts;
    const idx = endpointIndex === 0 ? 0 : pts.length - 1;
    const adjIdx = endpointIndex === 0 ? 1 : pts.length - 2;
    const p = { ...pts[idx] };
    const adj = { ...pts[adjIdx] };

    if (p.x === adj.x) {
      p.y += dy;
      p.x += dx;
      adj.x += dx;
    } else if (p.y === adj.y) {
      p.x += dx;
      p.y += dy;
      adj.y += dy;
    } else {
      p.x += dx;
      p.y += dy;
    }

    const next = pts.slice();
    next[idx] = p;
    next[adjIdx] = adj;
    return next;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/react-diagram-type');
    if (!type || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scale = zoom / 100;

    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const isArrow =
      type.startsWith('arrow') ||
      [
        'association',
        'aggregation',
        'composition',
        'inheritance',
        'dependency',
        'dotted-arrow',
        'erd-one-to-one',
        'erd-one-to-many',
        'erd-one-and-only-one',
        'erd-one-or-more',
        'erd-zero-or-one',
        'erd-zero-or-many',
      ].includes(type);

    const newShape = {
      id: Date.now().toString(),
      type,
      x: x - (DEFAULT_SHAPE_PROPS.width / 2),
      y: y - (DEFAULT_SHAPE_PROPS.height / 2),
      ...DEFAULT_SHAPE_PROPS,
      text:
        type === 'list'
          ? 'List\nItem 1\nItem 2\nItem 3'
          : isArrow
          ? ''
          : 'Text',
      fill: isArrow ? DEFAULT_SHAPE_PROPS.stroke : DEFAULT_SHAPE_PROPS.fill,
    };

    if (isArrow) {
      newShape.height = 100;
      newShape.width = 100;
      newShape.fill = 'none';

      let start;
      let end;
      if (type === 'arrow-up') {
        start = { x: newShape.x + 50, y: newShape.y + newShape.height };
        end = { x: newShape.x + 50, y: newShape.y };
      } else if (type === 'arrow-down') {
        start = { x: newShape.x + 50, y: newShape.y };
        end = { x: newShape.x + 50, y: newShape.y + newShape.height };
      } else {
        start = { x: newShape.x, y: newShape.y + 50 };
        end = { x: newShape.x + newShape.width, y: newShape.y + 50 };
      }
      newShape.routePoints = calculateOrthogonalRoute(start, end);
      if (type === 'dependency') {
        newShape.lineStyle = 'medium-dashed';
      } else if (type === 'dotted-arrow') {
        newShape.lineStyle = 'dense-dotted';
      }
    } else if (
      [
        'circle',
        'square',
        'star',
        'triangle',
        'actor',
        'stickman',
        'cube',
        'cylinder',
        'start-node',
        'end-node',
      ].includes(type)
    ) {
      newShape.width = 80;
      newShape.height = 80;
    } else if (type === 'usecase-oval') {
      newShape.width = 140;
      newShape.height = 80;
    }

    onAddShape(newShape);
    onSelectShape(newShape.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const startDrag = (e, id) => {
    e.stopPropagation();
    const shape = shapes.find((s) => s.id === id);
    if (!shape) return;

    if (docTextModeId === id && shape.type === 'document') return;

    if ((e.target).classList.contains('rz-handle')) return;

    onSelectShape(id);
    setDraggingId(id);
    setDragStart({ x: shape.x, y: shape.y });
    setDragRouteStart(shape.routePoints ? shape.routePoints.map((p) => ({ ...p })) : null);

    const scale = zoom / 100;
    const rect = (containerRef.current ?? canvasRef.current).getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    setDragOffset({
      x: mouseX - shape.x,
      y: mouseY - shape.y,
    });
  };

  const startResize = (e, id, handle) => {
    e.stopPropagation();
    const shape = shapes.find((s) => s.id === id);
    if (!shape) return;

    if (docTextModeId === id && shape.type === 'document') return;

    const canResize = true;
    if (!canResize) return;

    onSelectShape(id);
    setResizingId(id);
    setResizeHandle(handle);

    const scale = zoom / 100;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    setResizeStart({
      x: mouseX,
      y: mouseY,
      width: shape.width,
      height: shape.height,
      originX: shape.x,
      originY: shape.y,
      routePoints: shape.routePoints ? shape.routePoints.map((p) => ({ ...p })) : null,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (draggingId && !resizingId && canvasRef.current) {
        const rect = (containerRef.current ?? canvasRef.current).getBoundingClientRect();
        const scale = zoom / 100;
        const mouseX = (e.clientX - rect.left) / scale;
        const mouseY = (e.clientY - rect.top) / scale;

        // Auto-scroll when cursor near edges
        const scrollThreshold = 50;
        const scrollSpeed = 10;
        
        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const scrollLeft = containerRef.current.scrollLeft || 0;
          const scrollTop = containerRef.current.scrollTop || 0;
          
          let newScrollLeft = scrollLeft;
          let newScrollTop = scrollTop;
          
          // Check horizontal edges
          if (e.clientX - containerRect.left < scrollThreshold) {
            newScrollLeft = Math.max(0, scrollLeft - scrollSpeed);
          } else if (containerRect.right - e.clientX < scrollThreshold) {
            newScrollLeft = scrollLeft + scrollSpeed;
          }
          
          // Check vertical edges
          if (e.clientY - containerRect.top < scrollThreshold) {
            newScrollTop = Math.max(0, scrollTop - scrollSpeed);
          } else if (containerRect.bottom - e.clientY < scrollThreshold) {
            newScrollTop = scrollTop + scrollSpeed;
          }
          
          if (newScrollLeft !== scrollLeft || newScrollTop !== scrollTop) {
            containerRef.current.scrollLeft = newScrollLeft;
            containerRef.current.scrollTop = newScrollTop;
          }
        }

        const proposedX = mouseX - dragOffset.x;
        const proposedY = mouseY - dragOffset.y;

        const draggingShape = shapes.find((s) => s.id === draggingId) || null;
        if (!draggingShape) return;

        if (draggingShape.routePoints && isConnector(draggingShape.type) && dragStart) {
          // Clamp connectors by their actual drawn path (routePoints),
          // so ERD/arrows can't be dragged visually outside the canvas.
          const size = getCanvasSize();
          if (!size) return;

          // Use the same offset-based drag behavior as other shapes,
          // but apply deltas to the routePoints snapshot from drag start
          // to avoid accumulating/jittery movement.
          const proposedX = mouseX - dragOffset.x;
          const proposedY = mouseY - dragOffset.y;

          const routeStart = dragRouteStart ?? draggingShape.routePoints;

          let dx = proposedX - dragStart.x;
          let dy = proposedY - dragStart.y;

          const bboxAfterShift = (shiftX, shiftY) => {
            const xs = routeStart.map((p) => p.x + shiftX);
            const ys = routeStart.map((p) => p.y + shiftY);
            return {
              minX: Math.min(...xs),
              maxX: Math.max(...xs),
              minY: Math.min(...ys),
              maxY: Math.max(...ys),
            };
          };

          const b1 = bboxAfterShift(dx, dy);
          if (b1.minX < 0) dx += -b1.minX;
          else if (b1.maxX > size.w) dx -= b1.maxX - size.w;

          const b2 = bboxAfterShift(dx, dy);
          if (b2.minY < 0) dy += -b2.minY;
          else if (b2.maxY > size.h) dy -= b2.maxY - size.h;

          const newX = dragStart.x + dx;
          const newY = dragStart.y + dy;
          const newRoute = routeStart.map((p) => ({ x: p.x + dx, y: p.y + dy }));
          onUpdateShape(draggingId, { x: newX, y: newY, routePoints: newRoute });
        } else {
          const { x: newX, y: newY } = clampShapePositionToCanvas(draggingShape, proposedX, proposedY);
          onUpdateShape(draggingId, { x: newX, y: newY });
        }
      } else if (resizingId && canvasRef.current) {
        const rect = (containerRef.current ?? canvasRef.current).getBoundingClientRect();
        const scale = zoom / 100;
        const mouseX = (e.clientX - rect.left) / scale;
        const mouseY = (e.clientY - rect.top) / scale;

        // Auto-scroll during resize as well
        const scrollThreshold = 50;
        const scrollSpeed = 10;
        
        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const scrollLeft = containerRef.current.scrollLeft || 0;
          const scrollTop = containerRef.current.scrollTop || 0;
          
          let newScrollLeft = scrollLeft;
          let newScrollTop = scrollTop;
          
          if (e.clientX - containerRect.left < scrollThreshold) {
            newScrollLeft = Math.max(0, scrollLeft - scrollSpeed);
          } else if (containerRect.right - e.clientX < scrollThreshold) {
            newScrollLeft = scrollLeft + scrollSpeed;
          }
          
          if (e.clientY - containerRect.top < scrollThreshold) {
            newScrollTop = Math.max(0, scrollTop - scrollSpeed);
          } else if (containerRect.bottom - e.clientY < scrollThreshold) {
            newScrollTop = scrollTop + scrollSpeed;
          }
          
          if (newScrollLeft !== scrollLeft || newScrollTop !== scrollTop) {
            containerRef.current.scrollLeft = newScrollLeft;
            containerRef.current.scrollTop = newScrollTop;
          }
        }

        const deltaX = mouseX - resizeStart.x;
        const deltaY = mouseY - resizeStart.y;

        if (resizeStart.routePoints) {
          let pts = resizeStart.routePoints.map((p) => ({ ...p }));
          
          if (resizeHandle === 'left' || resizeHandle === 'right') {
            pts =
              resizeHandle === 'left'
                ? moveEndpoint(pts, 0, deltaX, deltaY)
                : moveEndpoint(pts, 'last', deltaX, deltaY);
          } else {
            // Scale entire route for height and width changes from sidebar or center handle
            const centerY = resizeStart.originY + resizeStart.height / 2;
            const centerX = resizeStart.originX + resizeStart.width / 2;
            const newHeight = resizeStart.height + deltaY * 2;
            const newWidth = resizeStart.width + deltaX * 2;
            const scaleY = newHeight / resizeStart.height;
            const scaleX = newWidth / resizeStart.width;
            
            pts = pts.map((p) => ({
              x: centerX + (p.x - centerX) * scaleX,
              y: centerY + (p.y - centerY) * scaleY
            }));
          }

          const xs = pts.map((p) => p.x);
          const ys = pts.map((p) => p.y);
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);

          const resizingShape = shapes.find((s) => s.id === resizingId);
          onUpdateShape(resizingId, {
            routePoints: pts,
            x: minX,
            y: minY,
            width: Math.max(20, (resizeStart.width + deltaX * 2)),
            height: Math.max(20, (resizeStart.height + deltaY * 2)),
            strokeWidth: resizingShape?.strokeWidth || 2, // Maintain constant stroke width
          });
          return;
        }

        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = resizeStart.originX;
        let newY = resizeStart.originY;

        if (resizeHandle === 'bottom-right') {
          newWidth = Math.max(100, resizeStart.width + deltaX);
          newHeight = Math.max(80, resizeStart.height + deltaY);
        } else if (resizeHandle === 'bottom-left') {
          const minW = 100;
          const proposedWidth = resizeStart.width - deltaX;
          newWidth = Math.max(minW, proposedWidth);
          const rightEdge = resizeStart.originX + resizeStart.width;
          newX = rightEdge - newWidth;

          newHeight = Math.max(80, resizeStart.height + deltaY);
        } else if (resizeHandle === 'top-right') {
          const minH = 80;
          newWidth = Math.max(100, resizeStart.width + deltaX);

          const proposedHeight = resizeStart.height - deltaY;
          newHeight = Math.max(minH, proposedHeight);
          const bottomEdge = resizeStart.originY + resizeStart.height;
          newY = bottomEdge - newHeight;
        } else if (resizeHandle === 'top-left') {
          const minW = 100;
          const minH = 80;
          const proposedWidth = resizeStart.width - deltaX;
          const proposedHeight = resizeStart.height - deltaY;
          newWidth = Math.max(minW, proposedWidth);
          newHeight = Math.max(minH, proposedHeight);

          const rightEdge = resizeStart.originX + resizeStart.width;
          const bottomEdge = resizeStart.originY + resizeStart.height;
          newX = rightEdge - newWidth;
          newY = bottomEdge - newHeight;
        } else if (resizeHandle === 'left') {
          const minW = 100;
          const proposedWidth = resizeStart.width - deltaX;
          newWidth = Math.max(minW, proposedWidth);

          const rightEdge = resizeStart.originX + resizeStart.width;
          const newXLeft = rightEdge - newWidth;

          const newYLeft = resizeStart.originY + deltaY;

          onUpdateShape(resizingId, {
            x: newXLeft,
            y: newYLeft,
            width: newWidth,
            height: resizeStart.height,
          });
          return;
        } else if (resizeHandle === 'right') {
          const minW = 100;
          newWidth = Math.max(minW, resizeStart.width + deltaX);
          const newYRight = resizeStart.originY + deltaY;

          onUpdateShape(resizingId, {
            x: resizeStart.originX,
            y: newYRight,
            width: newWidth,
            height: resizeStart.height,
          });
          return;
        } else if (resizeHandle === 'center') {
          const minH = 40;
          const proposedHeight = resizeStart.height + deltaY * 2;
          newHeight = Math.max(minH, proposedHeight);
          const newYCenter = resizeStart.originY + (resizeStart.height - newHeight) / 2;

          if (resizeStart.routePoints && resizeStart.routePoints.length >= 2) {
            const cy = resizeStart.originY + resizeStart.height / 2;
            const scaleY = newHeight / resizeStart.height;
            const newRoute = resizeStart.routePoints.map((p) => ({
              x: p.x,
              y: cy + (p.y - cy) * scaleY,
            }));
            onUpdateShape(resizingId, {
              x: resizeStart.originX,
              y: newYCenter,
              width: resizeStart.width,
              height: newHeight,
              routePoints: newRoute,
            });
            return;
          }

          onUpdateShape(resizingId, {
            x: resizeStart.originX,
            y: newYCenter,
            width: resizeStart.width,
            height: newHeight,
          });
          return;
        }

        onUpdateShape(resizingId, { x: newX, y: newY, width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setDraggingId(null);
      setDragStart(null);
      setDragRouteStart(null);
      setResizingId(null);
      setResizeHandle(null);
      
      // Commit the final state to history when drag/resize ends
      if (onShapeChangeEnd) {
        onShapeChangeEnd();
      }
    };

    if (draggingId || resizingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    draggingId,
    resizingId,
    dragOffset,
    resizeStart,
    resizeHandle,
    onUpdateShape,
    onShapeChangeEnd,
    zoom,
    shapes,
    dragStart,
    dragRouteStart,
  ]);

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      onSelectShape(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="canv-cont"
      style={{
        backgroundSize: `${20 * (zoom / 100)}px ${20 * (zoom / 100)}px`,
      }}
    >
      <div
        ref={canvasRef}
        className="canv-render"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onMouseDown={handleCanvasClick}
        style={{
          transform: `scale(${zoom / 100})`,
          width: `${Math.max(canvasBounds.maxX - canvasBounds.minX, viewportSize.width / (zoom / 100))}px`,
          height: `${Math.max(canvasBounds.maxY - canvasBounds.minY, viewportSize.height / (zoom / 100))}px`,
          marginLeft: `${-canvasBounds.minX}px`,
          marginTop: `${-canvasBounds.minY}px`,
        }}
      >
        {shapes.map((shape) => (
          <div
            key={shape.id}
            className={`shp-cont ${selectedId === shape.id ? 'selected' : ''} ${
              draggingId === shape.id ? 'dragging' : ''
            }`}
            style={{
              left: shape.x,
              top: shape.y,
              width: shape.width,
              height: shape.height,
              transform: `rotate(${shape.rotation}deg)`,
            }}
            onMouseDown={(e) => startDrag(e, shape.id)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (shape.type !== 'document') return;
              onSelectShape(shape.id);
              setDocTextModeId(shape.id);
            }}
          >
            {docTextModeId === shape.id && shape.type === 'document' ? (
              <textarea
                value={shape.text}
                onChange={(e) => onUpdateShape(shape.id, { text: e.target.value })}
                onMouseDown={(e) => e.stopPropagation()}
                onBlur={() => {
                  setDocTextModeId(null);
                  // Commit text changes to history when exiting text edit mode
                  if (onShapeChangeEnd) {
                    onShapeChangeEnd();
                  }
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setDocTextModeId(null);
                  // Commit text changes to history
                  if (onShapeChangeEnd) {
                    onShapeChangeEnd();
                  }
                }}
                className="doc-ta"
                style={{
                  color: shape.stroke,
                  fontFamily: shape.fontFamily,
                  fontSize: `${shape.fontSize}px`,
                }}
              />
            ) : (
              <ShapeRenderer shape={shape} />
            )}

            {selectedId === shape.id && isConnector(shape.type) && (() => {
              const h = getConnectorHandlePositions(shape);
              const knob = (pos) => ({
                left: `${pos.x}px`,
                top: `${pos.y}px`,
              });
              return (
                <>
                  <div
                    className="rz-handle conn-handle"
                    style={knob(h.start)}
                    title="Path start"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      startResize(e, shape.id, 'left');
                    }}
                  />
                  <div
                    className="rz-handle conn-handle"
                    style={knob(h.end)}
                    title="Path end"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      startResize(e, shape.id, 'right');
                    }}
                  />
                </>
              );
            })()}

            {selectedId === shape.id && !isConnector(shape.type) && docTextModeId !== shape.id && (
              <div className="rz-cont">
                <div
                  className="rz-handle corner-tl"
                  onMouseDown={(e) => startResize(e, shape.id, 'top-left')}
                />
                <div
                  className="rz-handle corner-tr"
                  onMouseDown={(e) => startResize(e, shape.id, 'top-right')}
                />
                <div
                  className="rz-handle corner-bl"
                  onMouseDown={(e) => startResize(e, shape.id, 'bottom-left')}
                />
                <div
                  className="rz-handle corner-br"
                  onMouseDown={(e) => startResize(e, shape.id, 'bottom-right')}
                />
              </div>
            )}
          </div>
        ))}

        {shapes.length === 0 && (
          <div className="empty-canv" style={{ transform: `scale(${100 / zoom})` }}>
            <div className="empty-canv-cont">
              <span className="material-symbols-outlined empty-canv-ic">space_dashboard</span>
              <h3 className="empty-canv-title">Empty Canvas</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
