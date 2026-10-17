import React from 'react';

export const COLORS = {
  primary: '#137fec',
  slate800: '#1e293b',
  slate200: '#e2e8f0',
};

export const DEFAULT_SHAPE_PROPS = {
  width: 100,
  height: 60,
  fill: '#ffffff',
  stroke: '#1e293b',
  strokeWidth: 2,
  text: 'Text',
  fontSize: 14,
  fontFamily: 'Inter',
  rotation: 0,
};

// Category definitions
export const LIBRARY_CATEGORIES = [
  {
    name: 'Basic',
    items: [
      { type: 'rectangle', name: 'Rectangle', icon: '▭' },
      { type: 'square', name: 'Square', icon: '□' },
      { type: 'circle', name: 'Circle', icon: '○' },
      { type: 'triangle', name: 'Triangle', icon: '△' },
      { type: 'hexagon', name: 'Hexagon', icon: '⬡' },
      { type: 'star', name: 'Star', icon: '★' },
      { type: 'parallelogram', name: 'Parallelogram', icon: '▱' },
      { type: 'trapezoid', name: 'Trapezoid', icon: '▴' },
      { type: 'diamond', name: 'Diamond', icon: '◆' },
      { type: 'cloud', name: 'Cloud', icon: '☁' },
      { type: 'document', name: 'Document', icon: '📄' },
      { type: 'cube', name: 'Cube', icon: '⬚' },
      { type: 'cylinder', name: 'Cylinder', icon: '⬭' },
      { type: 'list', name: 'List', icon: '≡' },
    ],
  },
  {
    name: 'Sequence',
    items: [
      { type: 'start-node', name: 'Start Node', icon: '●' },
      { type: 'end-node', name: 'End Node', icon: '◎' },
    ],
  },
  {
    name: 'Arrows',
    items: [
      { type: 'arrow-right', name: 'Right', icon: '→' },
      { type: 'arrow-left', name: 'Left', icon: '←' },
      { type: 'arrow-up', name: 'Up', icon: '↑' },
      { type: 'arrow-down', name: 'Down', icon: '↓' },
      { type: 'arrow-bidirectional', name: 'Bi-Direct', icon: '↔' },
      { type: 'dotted-arrow', name: 'Dotted', icon: '⇢' },
      { type: 'association', name: 'Association', icon: '—' },
      { type: 'aggregation', name: 'Aggregation', icon: '◇—' },
      { type: 'composition', name: 'Composition', icon: '◆—' },
      { type: 'inheritance', name: 'Inheritance', icon: '△—' },
      { type: 'dependency', name: 'Dependency', icon: '..>' },
    ],
  },
  {
    name: 'ERD',
    items: [
      { type: 'erd-one-to-one', name: 'One-to-One', icon: '||—||' },
      { type: 'erd-one-to-many', name: 'One-to-Many', icon: '|—< ' },
      { type: 'erd-one-and-only-one', name: 'One and Only One', icon: '||' },
      { type: 'erd-one-or-more', name: 'One or More', icon: '|<' },
      { type: 'erd-zero-or-one', name: 'Zero or One', icon: 'o|' },
      { type: 'erd-zero-or-many', name: 'Zero or Many', icon: 'o<' },
    ],
  },
  {
    name: 'UML/Class',
    items: [
      { type: 'uml-class', name: 'UML Class', icon: '▭' },
      { type: 'uml-module', name: 'Module', icon: '▭▭' },
      { type: 'uml-component', name: 'Component', icon: '▭▭' },
      { type: 'execution-occurrence', name: 'Execution Occurrence', icon: '⬚' },
      { type: 'database', name: 'Database', icon: '🗄' },
      { type: 'multi-value-attribute', name: 'Multi-Value Attribute', icon: '⬭' },
      { type: 'weak-entity', name: 'Weak Entity', icon: '▭' },
    ],
  },
  {
    name: 'State',
    items: [
      { type: 'state', name: 'State', icon: '⭕' },
      { type: 'transition', name: 'Transition', icon: '●' },
    ],
  },
  {
    name: 'Use Case',
    items: [
      { type: 'usecase-oval', name: 'Use Case', icon: '⬭' },
      { type: 'actor', name: 'Actor', icon: '🚶' },
    ],
  },
];

/** Default dash when `lineStyle` is unset (legacy shapes). */
export function getEffectiveLineStyle(shape) {
  if (shape.lineStyle) return shape.lineStyle;
  if (shape.type === 'dependency') return 'medium-dashed';
  if (shape.type === 'dotted-arrow') return 'dense-dotted';
  return 'solid';
}

export function getConnectorLinePresentation(style) {
  switch (style) {
    case 'solid':
      return { strokeDasharray: undefined, strokeLinecap: 'butt' };
    case 'fine-dashed':
      return { strokeDasharray: '4 4', strokeLinecap: 'butt' };
    case 'medium-dashed':
      return { strokeDasharray: '8 6', strokeLinecap: 'butt' };
    case 'long-dashed':
      return { strokeDasharray: '16 12', strokeLinecap: 'butt' };
    case 'double-dashed':
      // Two short dashes close together, then a larger gap.
      // Example pattern: dash(4) gap(2) dash(4) gap(6)
      return { strokeDasharray: '4 2 4 6', strokeLinecap: 'butt' };
    case 'dash-dot':
      return { strokeDasharray: '12 4 2 4', strokeLinecap: 'butt' };
    case 'dense-dotted':
      return { strokeDasharray: '1 4', strokeLinecap: 'round' };
    case 'double-dotted':
      // Two dots close together, then a larger gap.
      // dash(1) gap(2) dash(1) gap(5)
      return { strokeDasharray: '1 2 1 5', strokeLinecap: 'round' };
    case 'square-dotted':
      return { strokeDasharray: '2 6', strokeLinecap: 'square' };
    case 'spaced-dotted':
      return { strokeDasharray: '2 12', strokeLinecap: 'round' };
    default:
      return { strokeDasharray: undefined, strokeLinecap: 'butt' };
  }
}
