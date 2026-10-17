import React from 'react';
import { getConnectorLinePresentation, getEffectiveLineStyle } from '../../constants';
import '../../styles/diagram.css';

// Utility functions for orthogonal routing
const getShapeCenter = (shape) => ({
  x: shape.x + shape.width / 2,
  y: shape.y + shape.height / 2,
});

const getClosestConnectionPoint = (shape, fromPoint) => {
  const center = getShapeCenter(shape);
  const points = [
    { x: center.x, y: shape.y, side: 'top' },
    { x: shape.x + shape.width, y: center.y, side: 'right' },
    { x: center.x, y: shape.y + shape.height, side: 'bottom' },
    { x: shape.x, y: center.y, side: 'left' },
  ];

  return points.reduce((closest, point) => {
    const dist = Math.sqrt(
      Math.pow(point.x - fromPoint.x, 2) + Math.pow(point.y - fromPoint.y, 2)
    );
    const closestDist = Math.sqrt(
      Math.pow(closest.x - fromPoint.x, 2) + Math.pow(closest.y - fromPoint.y, 2)
    );
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

const connectorTypes = [
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
];

const isConnectorType = (t) => connectorTypes.includes(t);

const renderOrthogonalArrow = (shape) => {
  const isArrow = shape.type.startsWith('arrow') || isConnectorType(shape.type);
  if (!isArrow) return null;

  let route = shape.routePoints;
  if (!route || route.length < 2) {
    route = [
      { x: 0, y: 50 },
      { x: 100, y: 50 },
    ];
  } else {
    const sx = shape.x;
    const sy = shape.y;
    const sw = Math.max(shape.width, 1e-6);
    const sh = Math.max(shape.height, 1e-6);
    route = route.map((point) => ({
      x: ((point.x - sx) / sw) * 100,
      y: ((point.y - sy) / sh) * 100,
    }));
  }

  const linePresentation = getConnectorLinePresentation(getEffectiveLineStyle(shape));
  const tipPoint = route[route.length - 1];
  const secondLastPoint = route[route.length - 2];

  const isERD = shape.type.startsWith('erd-');
  const erdHasStartMarker = shape.type === 'erd-one-to-one' || shape.type === 'erd-one-to-many';

  const getErdEndOffset = () => {
    switch (shape.type) {
      case 'erd-one-to-one':
      case 'erd-one-to-many':
      case 'erd-one-and-only-one':
      case 'erd-one-or-more':
      case 'erd-zero-or-one':
      case 'erd-zero-or-many':
        return 6;
      default:
        return 12;
    }
  };

  const routeForPath = (() => {
    if (!tipPoint || !secondLastPoint) return route;

    const clipped = route.slice();

    const endDx = tipPoint.x - secondLastPoint.x;
    const endDy = tipPoint.y - secondLastPoint.y;
    const endLen = Math.sqrt(endDx * endDx + endDy * endDy) || 1;
    const endUx = endDx / endLen;
    const endUy = endDy / endLen;

    let endOffset = 0;
    if (shape.type === 'aggregation' || shape.type === 'composition') endOffset = 24;
    else if (shape.type === 'inheritance') endOffset = 18;
    else if (shape.type === 'dependency' || shape.type === 'dotted-arrow') endOffset = 14;
    else if (isERD) endOffset = getErdEndOffset();

    if (endOffset > 0) {
      clipped[clipped.length - 1] = {
        x: tipPoint.x - endUx * endOffset,
        y: tipPoint.y - endUy * endOffset,
      };
    }

    if (isERD && erdHasStartMarker && clipped.length >= 2) {
      const startTip = clipped[0];
      const startNext = clipped[1];
      const sDx = startTip.x - startNext.x;
      const sDy = startTip.y - startNext.y;
      const sLen = Math.sqrt(sDx * sDx + sDy * sDy) || 1;
      const sUx = sDx / sLen;
      const sUy = sDy / sLen;
      const startOffset = 6;
      clipped[0] = { x: startTip.x - sUx * startOffset, y: startTip.y - sUy * startOffset };
    }

    return clipped;
  })();

  const pathData = routeForPath.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `${path} L ${point.x} ${point.y}`;
  }, '');

  const renderERDEnd = (kind, end, prev) => {
    const dx = end.x - prev.x;
    const dy = end.y - prev.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;

    const bar = (offset, w) => {
      const cx = end.x - ux * offset;
      const cy = end.y - uy * offset;
      return (
        <line
          x1={cx + px * (w / 2)}
          y1={cy + py * (w / 2)}
          x2={cx - px * (w / 2)}
          y2={cy - py * (w / 2)}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
        />
      );
    };

    const crow = (offset, spread, length) => {
      const cx = end.x - ux * offset;
      const cy = end.y - uy * offset;
      return (
        <>
          <line
            x1={cx}
            y1={cy}
            x2={cx - ux * length + px * spread}
            y2={cy - uy * length + py * spread}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
          />
          <line
            x1={cx}
            y1={cy}
            x2={cx - ux * length}
            y2={cy - uy * length}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
          />
          <line
            x1={cx}
            y1={cy}
            x2={cx - ux * length - px * spread}
            y2={cy - uy * length - py * spread}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
          />
        </>
      );
    };

    const zero = (offset, r) => {
      const cx = end.x - ux * offset;
      const cy = end.y - uy * offset;
      return (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="white"
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
        />
      );
    };

    switch (kind) {
      case 'one':
        return bar(10, 14);
      case 'oneOnlyOne':
        return (
          <>
            {bar(6, 14)}
            {bar(14, 14)}
          </>
        );
      case 'many':
        return crow(10, 6, 12);
      case 'oneOrMore':
        return (
          <>
            {crow(6, 6, 12)}
            {bar(16, 14)}
          </>
        );
      case 'zeroOne':
        return (
          <>
            {zero(6, 6)}
            {bar(16, 14)}
          </>
        );
      case 'zeroMany':
        return (
          <>
            {zero(6, 6)}
            {crow(16, 6, 12)}
          </>
        );
      default:
        return null;
    }
  };

  const marker = (() => {
    if (!tipPoint || !secondLastPoint) return null;

    const dx = tipPoint.x - secondLastPoint.x;
    const dy = tipPoint.y - secondLastPoint.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;

    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;

    const L = 14;
    const W = 12;

    const renderCustomMarkerAt = (markerType, end, prev) => {
      const mdx = end.x - prev.x;
      const mdy = end.y - prev.y;
      const mlen = Math.sqrt(mdx * mdx + mdy * mdy) || 1;
      const mux = mdx / mlen;
      const muy = mdy / mlen;
      const mpx = -muy;
      const mpy = mux;
      const mbase = { x: end.x - mux * L, y: end.y - muy * L };
      const mback = { x: end.x - mux * (2 * L), y: end.y - muy * (2 * L) };
      const mleft = { x: mbase.x + mpx * (W / 2), y: mbase.y + mpy * (W / 2) };
      const mright = { x: mbase.x - mpx * (W / 2), y: mbase.y - mpy * (W / 2) };
      const openA = {
        x: end.x - mux * L + mpx * (W / 2),
        y: end.y - muy * L + mpy * (W / 2),
      };
      const openB = {
        x: end.x - mux * L - mpx * (W / 2),
        y: end.y - muy * L - mpy * (W / 2),
      };

      switch (markerType) {
        case 'none':
          return null;
        case 'arrow':
        case 'triangle':
          return (
            <polygon
              points={`${end.x},${end.y} ${openA.x},${openA.y} ${openB.x},${openB.y}`}
              fill={shape.stroke}
            />
          );
        case 'open-arrow':
          return (
            <>
              <line
                x1={end.x}
                y1={end.y}
                x2={openA.x}
                y2={openA.y}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <line
                x1={end.x}
                y1={end.y}
                x2={openB.x}
                y2={openB.y}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            </>
          );
        case 'open-triangle':
          return (
            <polygon
              points={`${end.x},${end.y} ${openA.x},${openA.y} ${openB.x},${openB.y}`}
              fill="#ffffff"
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
            />
          );
        case 'diamond':
          return (
            <polygon
              points={`${end.x},${end.y} ${mleft.x},${mleft.y} ${mback.x},${mback.y} ${mright.x},${mright.y}`}
              fill="#ffffff"
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
            />
          );
        case 'filled-diamond':
          return (
            <polygon
              points={`${end.x},${end.y} ${mleft.x},${mleft.y} ${mback.x},${mback.y} ${mright.x},${mright.y}`}
              fill={shape.stroke}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
            />
          );
        case 'circle':
          return (
            <circle
              cx={end.x - mux * 7}
              cy={end.y - muy * 7}
              r={5}
              fill="#ffffff"
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
            />
          );
        case 'bar':
          return (
            <line
              x1={end.x + mpx * 6}
              y1={end.y + mpy * 6}
              x2={end.x - mpx * 6}
              y2={end.y - mpy * 6}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
            />
          );
        case 'double-bar':
          return (
            <>
              <line
                x1={end.x - mux * 5 + mpx * 6}
                y1={end.y - muy * 5 + mpy * 6}
                x2={end.x - mux * 5 - mpx * 6}
                y2={end.y - muy * 5 - mpy * 6}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <line
                x1={end.x - mux * 12 + mpx * 6}
                y1={end.y - muy * 12 + mpy * 6}
                x2={end.x - mux * 12 - mpx * 6}
                y2={end.y - muy * 12 - mpy * 6}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            </>
          );
        case 'crowfoot':
          return (
            <>
              <line
                x1={end.x}
                y1={end.y}
                x2={end.x - mux * 10 + mpx * 6}
                y2={end.y - muy * 10 + mpy * 6}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <line
                x1={end.x}
                y1={end.y}
                x2={end.x - mux * 10}
                y2={end.y - muy * 10}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <line
                x1={end.x}
                y1={end.y}
                x2={end.x - mux * 10 - mpx * 6}
                y2={end.y - muy * 10 - mpy * 6}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            </>
          );
        case 'circle-crowfoot':
          return (
            <>
              <circle
                cx={end.x - mux * 5}
                cy={end.y - muy * 5}
                r={4}
                fill="#ffffff"
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <line
                x1={end.x - mux * 10}
                y1={end.y - muy * 10}
                x2={end.x - mux * 18 + mpx * 6}
                y2={end.y - muy * 18 + mpy * 6}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <line
                x1={end.x - mux * 10}
                y1={end.y - muy * 10}
                x2={end.x - mux * 18}
                y2={end.y - muy * 18}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <line
                x1={end.x - mux * 10}
                y1={end.y - muy * 10}
                x2={end.x - mux * 18 - mpx * 6}
                y2={end.y - muy * 18 - mpy * 6}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            </>
          );
        case 'x':
          return (
            <>
              <line
                x1={end.x - mux * 7 + mpx * 5}
                y1={end.y - muy * 7 + mpy * 5}
                x2={end.x - mux * 7 - mpx * 5}
                y2={end.y - muy * 7 - mpy * 5}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <line
                x1={end.x - mux * 7 + mpx * 5}
                y1={end.y - muy * 7 + mpy * 5}
                x2={end.x - mux * 7 - mpx * 5}
                y2={end.y - muy * 7 - mpy * 5}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
                transform={`rotate(90 ${end.x - mux * 7} ${end.y - muy * 7})`}
              />
            </>
          );
        case 'dot':
          return (
            <circle
              cx={end.x - mux * 5}
              cy={end.y - muy * 5}
              r={4}
              fill={shape.stroke}
            />
          );
        default:
          return null;
      }
    };

    const customRight = shape.endMarker ?? 'default';
    const customLeft = shape.startMarker ?? 'default';
    const startPoint = route[0];
    const startNext = route[1] ?? route[0];

    if (customRight !== 'default' || customLeft !== 'default') {
      return (
        <>
          {customLeft !== 'default'
            ? renderCustomMarkerAt(customLeft, startPoint, startNext)
            : shape.type === 'erd-one-to-one' || shape.type === 'erd-one-to-many'
            ? renderERDEnd('oneOnlyOne', startPoint, startNext)
            : shape.type === 'arrow-bidirectional'
            ? (() => {
                const sdx = startPoint.x - startNext.x;
                const sdy = startPoint.y - startNext.y;
                const sang = Math.atan2(sdy, sdx);
                const sx1 = startPoint.x - L * Math.cos(sang - Math.PI / 6);
                const sy1 = startPoint.y - L * Math.sin(sang - Math.PI / 6);
                const sx2 = startPoint.x - L * Math.cos(sang + Math.PI / 6);
                const sy2 = startPoint.y - L * Math.sin(sang + Math.PI / 6);
                return (
                  <polygon
                    points={`${startPoint.x},${startPoint.y} ${sx1},${sy1} ${sx2},${sy2}`}
                    fill={shape.stroke}
                  />
                );
              })()
            : shape.type === 'arrow-left'
            ? (() => {
                const sdx = startPoint.x - startNext.x;
                const sdy = startPoint.y - startNext.y;
                const sang = Math.atan2(sdy, sdx);
                const sx1 = startPoint.x - L * Math.cos(sang - Math.PI / 6);
                const sy1 = startPoint.y - L * Math.sin(sang - Math.PI / 6);
                const sx2 = startPoint.x - L * Math.cos(sang + Math.PI / 6);
                const sy2 = startPoint.y - L * Math.sin(sang + Math.PI / 6);
                return (
                  <polygon
                    points={`${startPoint.x},${startPoint.y} ${sx1},${sy1} ${sx2},${sy2}`}
                    fill={shape.stroke}
                  />
                );
              })()
            : null}
          {customRight !== 'default'
            ? renderCustomMarkerAt(customRight, tipPoint, secondLastPoint)
            : (() => {
                const dx2 = tipPoint.x - secondLastPoint.x;
                const dy2 = tipPoint.y - secondLastPoint.y;
                const angle = Math.atan2(dy2, dx2);

                if (shape.type === 'arrow-left') return null;
                if (shape.type.startsWith('arrow')) {
                  const x1 = tipPoint.x - L * Math.cos(angle - Math.PI / 6);
                  const y1 = tipPoint.y - L * Math.sin(angle - Math.PI / 6);
                  const x2 = tipPoint.x - L * Math.cos(angle + Math.PI / 6);
                  const y2 = tipPoint.y - L * Math.sin(angle + Math.PI / 6);
                  return (
                    <polygon
                      points={`${tipPoint.x},${tipPoint.y} ${x1},${y1} ${x2},${y2}`}
                      fill={shape.stroke}
                    />
                  );
                }

                if (shape.type === 'aggregation' || shape.type === 'composition') {
                  const tip = tipPoint;
                  const base = {
                    x: tipPoint.x - ux * L,
                    y: tipPoint.y - uy * L,
                  };
                  const back = {
                    x: tipPoint.x - ux * (2 * L),
                    y: tipPoint.y - uy * (2 * L),
                  };
                  const left = {
                    x: base.x + px * (W / 2),
                    y: base.y + py * (W / 2),
                  };
                  const right = {
                    x: base.x - px * (W / 2),
                    y: base.y - py * (W / 2),
                  };
                  return (
                    <polygon
                      points={`${tip.x},${tip.y} ${left.x},${left.y} ${back.x},${back.y} ${right.x},${right.y}`}
                      fill={shape.type === 'composition' ? shape.stroke : '#ffffff'}
                      stroke={shape.stroke}
                      strokeWidth={shape.strokeWidth}
                      strokeLinejoin="round"
                    />
                  );
                }

                if (shape.type === 'inheritance') {
                  const base = {
                    x: tipPoint.x - ux * (1.4 * L),
                    y: tipPoint.y - uy * (1.4 * L),
                  };
                  const left = {
                    x: base.x + px * (W / 1.2),
                    y: base.y + py * (W / 1.2),
                  };
                  const right = {
                    x: base.x - px * (W / 1.2),
                    y: base.y - py * (W / 1.2),
                  };
                  return (
                    <polygon
                      points={`${tipPoint.x},${tipPoint.y} ${left.x},${left.y} ${right.x},${right.y}`}
                      fill="#ffffff"
                      stroke={shape.stroke}
                      strokeWidth={shape.strokeWidth}
                      strokeLinejoin="round"
                    />
                  );
                }

                if (shape.type === 'dependency' || shape.type === 'dotted-arrow') {
                  const a = {
                    x: tipPoint.x - ux * L + px * (W / 2),
                    y: tipPoint.y - uy * L + py * (W / 2),
                  };
                  const b = {
                    x: tipPoint.x - ux * L - px * (W / 2),
                    y: tipPoint.y - uy * L - py * (W / 2),
                  };
                  return (
                    <>
                      <line
                        x1={tipPoint.x}
                        y1={tipPoint.y}
                        x2={a.x}
                        y2={a.y}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                      />
                      <line
                        x1={tipPoint.x}
                        y1={tipPoint.y}
                        x2={b.x}
                        y2={b.y}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                      />
                    </>
                  );
                }

                if (shape.type === 'erd-one-to-one')
                  return renderERDEnd('oneOnlyOne', tipPoint, secondLastPoint);
                if (shape.type === 'erd-one-to-many')
                  return renderERDEnd('oneOrMore', tipPoint, secondLastPoint);
                if (shape.type === 'erd-one-and-only-one')
                  return renderERDEnd('oneOnlyOne', tipPoint, secondLastPoint);
                if (shape.type === 'erd-one-or-more')
                  return renderERDEnd('oneOrMore', tipPoint, secondLastPoint);
                if (shape.type === 'erd-zero-or-one')
                  return renderERDEnd('zeroOne', tipPoint, secondLastPoint);
                if (shape.type === 'erd-zero-or-many')
                  return renderERDEnd('zeroMany', tipPoint, secondLastPoint);

                return null;
              })()}
        </>
      );
    }

    if (shape.type.startsWith('arrow')) {
      const arrowPolyAt = (tip, towardLine) => {
        const tdx = tip.x - towardLine.x;
        const tdy = tip.y - towardLine.y;
        const angle = Math.atan2(tdy, tdx);
        const x1 = tip.x - L * Math.cos(angle - Math.PI / 6);
        const y1 = tip.y - L * Math.sin(angle - Math.PI / 6);
        const x2 = tip.x - L * Math.cos(angle + Math.PI / 6);
        const y2 = tip.y - L * Math.sin(angle + Math.PI / 6);
        return (
          <polygon
            points={`${tip.x},${tip.y} ${x1},${y1} ${x2},${y2}`}
            fill={shape.stroke}
          />
        );
      };

      if (shape.type === 'arrow-bidirectional') {
        return (
          <>
            {arrowPolyAt(route[0], route[1])}
            {arrowPolyAt(tipPoint, secondLastPoint)}
          </>
        );
      }

      if (shape.type === 'arrow-left') {
        return arrowPolyAt(route[0], route[1]);
      }

      return arrowPolyAt(tipPoint, secondLastPoint);
    }

    if (!isConnectorType(shape.type)) return null;

    switch (shape.type) {
      case 'association':
        return null;

      case 'aggregation':
      case 'composition': {
        const tip = tipPoint;
        const base = { x: tipPoint.x - ux * L, y: tipPoint.y - uy * L };
        const back = { x: tipPoint.x - ux * (2 * L), y: tipPoint.y - uy * (2 * L) };
        const left = { x: base.x + px * (W / 2), y: base.y + py * (W / 2) };
        const right = { x: base.x - px * (W / 2), y: base.y - py * (W / 2) };
        const points = `${tip.x},${tip.y} ${left.x},${left.y} ${back.x},${back.y} ${right.x},${right.y}`;
        return (
          <polygon
            points={points}
            fill={shape.type === 'composition' ? shape.stroke : '#ffffff'}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            strokeLinejoin="round"
          />
        );
      }

      case 'inheritance': {
        const tip = tipPoint;
        const base = { x: tipPoint.x - ux * (1.4 * L), y: tipPoint.y - uy * (1.4 * L) };
        const left = { x: base.x + px * (W / 1.2), y: base.y + py * (W / 1.2) };
        const right = { x: base.x - px * (W / 1.2), y: base.y - py * (W / 1.2) };
        const points = `${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`;
        return (
          <polygon
            points={points}
            fill="#ffffff"
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            strokeLinejoin="round"
          />
        );
      }

      case 'dependency':
      case 'dotted-arrow': {
        const a = {
          x: tipPoint.x - ux * L + px * (W / 2),
          y: tipPoint.y - uy * L + py * (W / 2),
        };
        const b = {
          x: tipPoint.x - ux * L - px * (W / 2),
          y: tipPoint.y - uy * L - py * (W / 2),
        };
        return (
          <>
            <line
              x1={tipPoint.x}
              y1={tipPoint.y}
              x2={a.x}
              y2={a.y}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
            />
            <line
              x1={tipPoint.x}
              y1={tipPoint.y}
              x2={b.x}
              y2={b.y}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
            />
          </>
        );
      }

      case 'erd-one-to-one': {
        const start = route[0];
        const startNext = route[1] ?? route[0];
        return (
          <>
            {renderERDEnd('oneOnlyOne', start, startNext)}
            {renderERDEnd('oneOnlyOne', tipPoint, secondLastPoint)}
          </>
        );
      }

      case 'erd-one-to-many': {
        const start = route[0];
        const startNext = route[1] ?? route[0];
        return (
          <>
            {renderERDEnd('oneOnlyOne', start, startNext)}
            {renderERDEnd('oneOrMore', tipPoint, secondLastPoint)}
          </>
        );
      }

      case 'erd-one-and-only-one':
        return renderERDEnd('oneOnlyOne', tipPoint, secondLastPoint);

      case 'erd-one-or-more':
        return renderERDEnd('oneOrMore', tipPoint, secondLastPoint);

      case 'erd-zero-or-one':
        return renderERDEnd('zeroOne', tipPoint, secondLastPoint);

      case 'erd-zero-or-many':
        return renderERDEnd('zeroMany', tipPoint, secondLastPoint);

      default:
        return null;
    }
  })();

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}
    >
      <path
        d={pathData}
        stroke={shape.stroke}
        strokeWidth={shape.strokeWidth}
        fill="none"
        strokeLinecap={linePresentation.strokeLinecap}
        strokeDasharray={linePresentation.strokeDasharray}
      />
      {marker}
    </svg>
  );
};

export const ShapeRenderer = ({ shape }) => {
  const isConnectorShape =
    shape.type.startsWith('arrow') ||
    isConnectorType(shape.type) ||
    shape.type === 'actor' ||
    shape.type === 'transition';

  const getShapeClasses = () => {
    let classes = 'shp-base';
    if (isConnectorShape) {
      classes += ' shp-conn';
    }
    return classes;
  };

  const commonStyle = {
    backgroundColor: isConnectorShape ? 'transparent' : shape.fill,
    borderColor: shape.stroke,
    borderWidth: isConnectorShape ? 0 : shape.strokeWidth,
    color: shape.stroke,
    fontFamily: shape.fontFamily,
    fontSize: `${shape.fontSize}px`,
  };

  const renderContent = () => {
    switch (shape.type) {
      case 'process':
      case 'square':
        return (
          <div className={`${getShapeClasses()} shp-sq`} style={commonStyle}>
            {shape.text}
          </div>
        );

      case 'rounded-rect':
        return (
          <div className={`${getShapeClasses()} shp-rnd`} style={commonStyle}>
            {shape.text}
          </div>
        );

      case 'terminator':
        return (
          <div className={`${getShapeClasses()} shp-term`} style={commonStyle}>
            {shape.text}
          </div>
        );

      case 'circle':
        return (
          <div className={`${getShapeClasses()} shp-circ`} style={commonStyle}>
            {shape.text}
          </div>
        );

      case 'usecase-oval':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet">
              <ellipse
                cx="50"
                cy="35"
                rx="46"
                ry="28"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <text
                x="50"
                y="38"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily={shape.fontFamily}
                fontSize={shape.fontSize}
                fill={shape.stroke}
              >
                {shape.text}
              </text>
            </svg>
          </div>
        );

      case 'uml-module':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 140 90" preserveAspectRatio="none">
              <rect
                x="20"
                y="10"
                width="110"
                height="70"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <rect
                x="6"
                y="28"
                width="14"
                height="12"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <rect
                x="6"
                y="50"
                width="14"
                height="12"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <text
                x="75"
                y="45"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily={shape.fontFamily}
                fontSize={shape.fontSize}
                fill={shape.stroke}
              >
                {shape.text}
              </text>
            </svg>
          </div>
        );

      case 'uml-component':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 140 90" preserveAspectRatio="none">
              <rect
                x="10"
                y="10"
                width="110"
                height="70"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <rect
                x="120"
                y="28"
                width="14"
                height="12"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <rect
                x="120"
                y="50"
                width="14"
                height="12"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <text
                x="65"
                y="45"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily={shape.fontFamily}
                fontSize={shape.fontSize}
                fill={shape.stroke}
              >
                {shape.text}
              </text>
            </svg>
          </div>
        );

      case 'start-node':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              <circle cx="50" cy="50" r="18" fill={shape.stroke} />
            </svg>
          </div>
        );

      case 'end-node':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              <circle
                cx="50"
                cy="50"
                r="22"
                fill="white"
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <circle cx="50" cy="50" r="12" fill={shape.stroke} />
            </svg>
          </div>
        );

      case 'decision':
      case 'diamond':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon
                points="50,0 100,50 50,100 0,50"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            </svg>
            <div className="shp-text" style={{ inset: '20%' }}>
              {shape.text}
            </div>
          </div>
        );

      case 'data':
      case 'parallelogram':
        return (
          <div className={`${getShapeClasses()} shp-para`} style={commonStyle}>
            <div className="shp-para-content">{shape.text}</div>
          </div>
        );

      case 'trapezoid':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon
                points="20,0 80,0 100,100 0,100"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            </svg>
            <div className="shp-text" style={{ inset: '20%' }}>
              {shape.text}
            </div>
          </div>
        );

      case 'hexagon':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon
                points="25,0 75,0 100,50 75,100 25,100 0,50"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            </svg>
            <div className="shp-text" style={{ inset: '10%' }}>
              {shape.text}
            </div>
          </div>
        );

      case 'cylinder':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d="M0,15 v70 a50,15 0 0 0 100,0 v-70"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <ellipse
                cx="50"
                cy="15"
                rx="50"
                ry="15"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            </svg>
            <div
              className="shp-text"
              style={{ top: '25%', left: '0', width: '100%', height: '60%' }}
            >
              {shape.text}
            </div>
          </div>
        );

      case 'cloud':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d="M25,60 a20,20 0 0 1 0,-40 a30,30 0 0 1 50,0 a20,20 0 0 1 0,40 a10,10 0 0 1 -5,0 h-40 a10,10 0 0 1 -5,0"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
                strokeLinejoin="round"
              />
            </svg>
            <div className="shp-text" style={{ inset: '15%' }}>
              {shape.text}
            </div>
          </div>
        );

      case 'document':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d="M0,0 h100 v80 c-20,20 -40,-20 -50,0 c-10,-20 -30,20 -50,0 z"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            </svg>
            <div className="shp-text" style={{ top: 0, left: 0, width: '100%', height: '80%' }}>
              {shape.text}
            </div>
          </div>
        );

      case 'cube':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d="M0,25 l25,-25 h75 l-25,25 h-75 z"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <path
                d="M75,25 l25,-25 v75 l-25,25 z"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <rect
                x="0"
                y="25"
                width="75"
                height="75"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            </svg>
            <div
              className="shp-text"
              style={{ top: '25%', left: '0', width: '75%', height: '75%' }}
            >
              {shape.text}
            </div>
          </div>
        );

      case 'callout':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d="M0,0 h100 v70 h-30 l-20,30 l0,-30 h-50 z"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            </svg>
            <div
              className="shp-text"
              style={{ top: '0', left: '0', width: '100%', height: '70%' }}
            >
              {shape.text}
            </div>
          </div>
        );

      case 'list': {
        const lines = (shape.text ?? '').split('\n');
        const title = lines[0] || 'List';
        const items = lines.slice(1);
        const fallbackItems = ['Item 1', 'Item 2', 'Item 3'];

        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect
                x="5"
                y="10"
                width="90"
                height="85"
                rx="0"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <line
                x1="5"
                y1="30"
                x2="95"
                y2="30"
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            </svg>

            <div className="shp-list-title">{title}</div>

            <div
              className="shp-list-items"
              style={{
                fontSize: `${Math.max(10, shape.fontSize * 0.95)}px`,
              }}
            >
              {(items.length ? items : fallbackItems).map((it, idx) => (
                <div key={`${it}-${idx}`}>{it}</div>
              ))}
            </div>
          </div>
        );
      }

      case 'triangle':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon
                points="50,0 100,100 0,100"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            </svg>
            <div
              className="shp-text"
              style={{ top: '30%', left: '10%', right: '10%', bottom: '0' }}
            >
              {shape.text}
            </div>
          </div>
        );

      case 'star': {
        const starPoints =
          '50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35';
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon
                points={starPoints}
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            </svg>
            <div className="shp-text" style={{ inset: '25%' }}>
              {shape.text}
            </div>
          </div>
        );
      }

      case 'state':
        return (
          <div className={`${getShapeClasses()} shp-st`} style={commonStyle}>
            <div className="shp-st-container">
              <div
                className="shp-st-div"
                style={{ borderBottomColor: shape.stroke }}
              ></div>
              <div className="shp-st-content">{shape.text}</div>
            </div>
          </div>
        );

      case 'transition':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line
                x1="0"
                y1="50"
                x2="85"
                y2="50"
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <polygon points="100,50 85,40 85,60" fill={shape.stroke} />
            </svg>
            <div className="shp-trans-text">{shape.text}</div>
          </div>
        );

      case 'actor':
      case 'stickman':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg
              className="shp-svg"
              viewBox="0 0 100 100"
              fill="none"
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              preserveAspectRatio="xMidYMid meet"
            >
              <circle cx="50" cy="20" r="15"></circle>
              <line x1="50" y1="35" x2="50" y2="70"></line>
              <line x1="20" y1="50" x2="80" y2="50"></line>
              <line x1="50" y1="70" x2="20" y2="100"></line>
              <line x1="50" y1="70" x2="80" y2="100"></line>
            </svg>
            <div className="shp-actor-text">{shape.text}</div>
          </div>
        );

      case 'arrow-right':
      case 'arrow-left':
      case 'arrow-up':
      case 'arrow-down':
      case 'arrow-bidirectional':
      case 'dotted-arrow':
        return renderOrthogonalArrow(shape);

      case 'uml-class':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect
                x="0"
                y="0"
                width="100"
                height="100"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <line
                x1="0"
                y1="33"
                x2="100"
                y2="33"
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <line
                x1="0"
                y1="66"
                x2="100"
                y2="66"
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            </svg>
            <div
              className="shp-uml-title"
              style={{ fontSize: `${shape.fontSize * 1.1}px` }}
            >
              {shape.text.split('\n')[0] || 'ClassName'}
            </div>
            <div
              className="shp-uml-attr"
              style={{ fontSize: `${shape.fontSize * 0.9}px` }}
            >
              {shape.text.split('\n')[1] || '+attribute: type'}
            </div>
            <div
              className="shp-uml-methods"
              style={{ fontSize: `${shape.fontSize * 0.9}px` }}
            >
              {shape.text.split('\n')[2] || '+method(): type'}
            </div>
          </div>
        );

      case 'association':
      case 'aggregation':
      case 'composition':
      case 'inheritance':
      case 'dependency':
      case 'erd-one-to-one':
      case 'erd-one-to-many':
      case 'erd-one-and-only-one':
      case 'erd-one-or-more':
      case 'erd-zero-or-one':
      case 'erd-zero-or-many':
        return renderOrthogonalArrow(shape);

      case 'execution-occurrence':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect
                x="45"
                y="10"
                width="10"
                height="80"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            </svg>
            <div
              className="shp-exec-text"
              style={{ fontSize: `${shape.fontSize * 0.8}px` }}
            >
              {shape.text}
            </div>
          </div>
        );

      case 'database':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <ellipse
                cx="50"
                cy="20"
                rx="40"
                ry="15"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <rect x="10" y="20" width="80" height="60" fill={shape.fill} stroke="none" />
              <ellipse
                cx="50"
                cy="80"
                rx="40"
                ry="15"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <line
                x1="10"
                y1="20"
                x2="10"
                y2="80"
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <line
                x1="90"
                y1="20"
                x2="90"
                y2="80"
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            </svg>
            <div className="shp-text" style={{ top: '35%', left: '10%', right: '10%' }}>
              {shape.text}
            </div>
          </div>
        );

      case 'multi-value-attribute':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <ellipse
                cx="50"
                cy="50"
                rx="45"
                ry="30"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <ellipse
                cx="50"
                cy="50"
                rx="35"
                ry="20"
                fill="none"
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            </svg>
            <div className="shp-text" style={{ top: '40%', left: '20%', right: '20%' }}>
              {shape.text}
            </div>
          </div>
        );

      case 'weak-entity':
        return (
          <div
            className={getShapeClasses()}
            style={{ ...commonStyle, backgroundColor: 'transparent', borderWidth: 0 }}
          >
            <svg className="shp-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect
                x="10"
                y="20"
                width="80"
                height="60"
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
              <rect
                x="20"
                y="30"
                width="60"
                height="40"
                fill="none"
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
              />
            </svg>
            <div className="shp-text" style={{ top: '45%', left: '25%', right: '25%' }}>
              {shape.text}
            </div>
          </div>
        );

      default:
        return (
          <div className={`${getShapeClasses()} shp-sq`} style={commonStyle}>
            {shape.text}
          </div>
        );
    }
  };

  return renderContent();
};
