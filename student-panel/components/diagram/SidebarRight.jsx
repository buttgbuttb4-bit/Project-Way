// Import React for creating UI components
import React from 'react';
// Import helper function to get effective line style from constants
import { getEffectiveLineStyle } from '../../constants';
// Import CSS styles for the diagram editor
import '../../styles/diagram.css';

/**
 * SidebarRight Component
 * 
 * This component displays the right sidebar in the diagram editor.
 * It shows properties of the currently selected shape and allows users to:
 * - Edit fill and stroke colors
 * - Modify text content and font settings
 * - Adjust dimensions (width/height)
 * - Configure line properties for connectors (line style, markers)
 * - Duplicate or delete the selected shape
 * 
 * Props:
 * - selectedShape: The currently selected shape object (null if nothing selected)
 * - onUpdateShape: Callback function to update shape properties
 * - onDelete: Callback function to delete the selected shape
 * - onDuplicate: Callback function to duplicate the selected shape
 */
export const SidebarRight = ({ selectedShape, onUpdateShape, onDelete, onDuplicate }) => {
  // If no shape is selected, show empty state message
  if (!selectedShape) {
    return (
      <aside className="sb-right">
          <div className="sb-header">
            <div className="sb-tabs">
                <button className="sb-tab active">Properties</button>
            </div>
          </div>
          <div className="sb-empty">
             <span className="material-symbols-outlined sb-empty-icon">touch_app</span>
             <p className="sb-empty-text">Select a shape to edit properties</p>
          </div>
      </aside>
    );
  }

  /**
   * Helper function to validate and return hex color
   * 
   * Why: Color inputs expect hex format (#RRGGBB or #RGB). This function
   * ensures the value is a valid hex color before passing it to the input.
   * If invalid, it returns a fallback color.
   * 
   * @param {string} value - The color value to validate
   * @param {string} fallback - The fallback color if validation fails
   * @returns {string} Valid hex color or fallback
   */
  const toHexColorOr = (value, fallback) => {
    if (typeof value !== 'string') return fallback;
    const v = value.trim();
    // Check if value matches hex color pattern (6 or 3 digits)
    if (/^#[0-9a-fA-F]{6}$/.test(v) || /^#[0-9a-fA-F]{3}$/.test(v)) return v;
    return fallback;
  };

  /**
   * Handle property changes for the selected shape
   * 
   * Why: This function centralizes all property updates. It:
   * 1. Parses numeric values for dimension properties
   * 2. Handles special scaling logic for connector shapes
   * 3. Calls the parent's onUpdateShape callback with the updated properties
   * 
   * For connectors (arrows, ERD lines), when width/height changes:
   * - It scales the route points proportionally to maintain the line's appearance
   * - Uses the bounding box of route points instead of shape center for stable positioning
   * - This prevents the line from visually "jumping" when resized
   * 
   * @param {string} key - The property name to update (e.g., 'width', 'fill', 'text')
   * @param {any} value - The new value for the property
   */
  const handleChange = (key, value) => {
    let parsedValue = value;
    
    // Parse numeric values for dimension and size properties
    if (key === 'width' || key === 'height' || key === 'x' || key === 'y' || key === 'strokeWidth' || key === 'fontSize') {
        parsedValue = parseInt(value, 10);
        if (isNaN(parsedValue)) parsedValue = 0;
    }
    
    // Handle connector scaling for height/width changes
    // Why: Connectors (arrows, lines) have route points that define their path.
    // When resizing, we need to scale these points proportionally to maintain
    // the line's visual structure.
    if (isConnector && (key === 'height' || key === 'width') && selectedShape.routePoints) {
      // Keep connectors visually fixed while resizing from sidebar:
      // We use the route points bounding box as the reference for scaling
      // instead of the shape's center or current dimensions.
      
      // Extract all x and y coordinates from route points
      const xs0 = selectedShape.routePoints.map((p) => p.x);
      const ys0 = selectedShape.routePoints.map((p) => p.y);
      
      // Calculate bounding box of route points
      const minX0 = Math.min(...xs0);
      const maxX0 = Math.max(...xs0);
      const minY0 = Math.min(...ys0);
      const maxY0 = Math.max(...ys0);

      // Calculate current bounding box dimensions
      const bboxW0 = Math.max(1, maxX0 - minX0);
      const bboxH0 = Math.max(1, maxY0 - minY0);

      // Determine new dimensions (minimum 20px to prevent too small)
      const nextW = key === 'width' ? Math.max(20, parsedValue) : Math.max(20, selectedShape.width);
      const nextH = key === 'height' ? Math.max(20, parsedValue) : Math.max(20, selectedShape.height);

      // Calculate scale factors for x and y axes
      const scaleX = key === 'width' ? nextW / bboxW0 : 1;
      const scaleY = key === 'height' ? nextH / bboxH0 : 1;

      // Scale all route points proportionally
      const scaledRoutePoints = selectedShape.routePoints.map((p) => ({
        x: minX0 + (p.x - minX0) * scaleX,
        y: minY0 + (p.y - minY0) * scaleY,
      }));

      // Update shape with scaled route points and new dimensions
      onUpdateShape({
        // Set position to bounding box top-left (ensures stable rendering)
        x: minX0,
        y: minY0,
        width: nextW,
        height: nextH,
        routePoints: scaledRoutePoints,
        strokeWidth: selectedShape.strokeWidth || 2, // Maintain constant stroke width
      });
    } else {
      // For non-connector shapes or non-dimension properties, simple update
      onUpdateShape({ [key]: parsedValue });
    }
  };

  /**
   * Check if the selected shape is a connector (line/arrow)
   * 
   * Why: Connectors have special properties (route points, markers, line styles)
   * that regular shapes don't have. We need to identify them to show/hide
   * the appropriate property controls.
   * 
   * Connector types include:
   * - Arrows (arrow-* types)
   * - UML relationships (association, aggregation, composition, etc.)
   * - ERD relationships (erd-one-to-one, erd-one-to-many, etc.)
   */
  const isConnector =
    selectedShape.type.startsWith('arrow') ||
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
    ].includes(selectedShape.type);

  // Render the right sidebar with property controls
  return (
    <aside className="sb-right">
      {/* Header with Properties tab */}
      <div className="sb-header">
        <div className="sb-tabs">
          <button className="sb-tab active">Properties</button>
        </div>
      </div>

      {/* Main content area with property controls */}
      <div className="sb-content">
        <div className="sb-props">
          
          {/* FILL COLOR SECTION */}
          {/* Why: Allows users to change the background/fill color of shapes */}
          <div className="prop-sec">
            <h4 className="prop-title">Fill</h4>
            <div className="prop-group">
              {/* Color picker input - uses HTML5 color input */}
              <input 
                type="color" 
                value={toHexColorOr(selectedShape.fill, '#ffffff')} 
                onChange={(e) => handleChange('fill', e.target.value)}
                className="prop-color-in"
              />
              {/* Display current color value text */}
              <div className="prop-color-info">
                <p className="prop-color-lbl">Color</p>
                <p className="prop-color-val">{selectedShape.fill}</p>
              </div>
            </div>
          </div>

          {/* STROKE COLOR SECTION */}
          {/* Why: Allows users to change the border/outline color of shapes */}
          <div className="prop-sec">
            <h4 className="prop-title">Stroke</h4>
            <div className="prop-group">
               <input 
                type="color" 
                value={toHexColorOr(selectedShape.stroke, '#000000')} 
                onChange={(e) => handleChange('stroke', e.target.value)}
                className="prop-color-in"
              />
              <div className="prop-color-info">
                <p className="prop-color-lbl">Color</p>
                <p className="prop-color-val">{selectedShape.stroke}</p>
              </div>
            </div>
          </div>

          {/* LINE PROPERTIES SECTION (only shown for connectors) */}
          {/* Why: Connectors (arrows, lines) have special properties like line style and markers
              that regular shapes don't have. This section is conditionally rendered. */}
          {isConnector && (
            <div className="prop-sec">
              <h4 className="prop-title">Line</h4>
              
              {/* Line style selector - controls the dash pattern of the line */}
              <select
                className="prop-sel"
                value={getEffectiveLineStyle(selectedShape)}
                onChange={(e) => handleChange('lineStyle', e.target.value)}
              >
                <option value="solid">Solid</option>
                <option value="fine-dashed">Fine dashed</option>
                <option value="medium-dashed">Medium dashed</option>
                <option value="long-dashed">Long dashed</option>
                <option value="double-dashed">Double dashed</option>
                <option value="dash-dot">Dash–dot</option>
                <option value="dense-dotted">Dense dotted</option>
                <option value="double-dotted">Double dotted</option>
                <option value="square-dotted">Square dotted</option>
                <option value="spaced-dotted">Spaced dotted</option>
              </select>
              <p className="prop-desc">Stroke pattern for arrows and ERD connectors.</p>

              {/* Left/Start marker selector - controls the symbol at the line's start */}
              {/* Why: Different relationship types need different markers (e.g., inheritance needs an arrow,
                  composition needs a filled diamond, aggregation needs a hollow diamond) */}
              <h4 className="prop-title">Left Hand Symbol</h4>
              <select
                className="prop-sel"
                value={selectedShape.startMarker ?? 'default'}
                onChange={(e) => handleChange('startMarker', e.target.value)}
              >
                <option value="default">Default (by line type)</option>
                <option value="none">None</option>
                <option value="arrow">Arrow</option>
                <option value="open-arrow">Open Arrow</option>
                <option value="triangle">Triangle</option>
                <option value="open-triangle">Open Triangle</option>
                <option value="diamond">Diamond (Hollow)</option>
                <option value="filled-diamond">Diamond (Filled)</option>
                <option value="circle">Circle</option>
                <option value="bar">Bar</option>
                <option value="double-bar">Double Bar</option>
                <option value="crowfoot">Crowfoot</option>
                <option value="circle-crowfoot">Circle + Crowfoot</option>
                <option value="x">X</option>
                <option value="dot">Dot</option>
              </select>
              <p className="prop-desc">Applies symbol to left-side endpoint of selected line.</p>

              {/* Right/End marker selector - controls the symbol at the line's end */}
              <h4 className="prop-title">Right End Symbol</h4>
              <select
                className="prop-sel"
                value={selectedShape.endMarker ?? 'default'}
                onChange={(e) => handleChange('endMarker', e.target.value)}
              >
                <option value="default">Default (by line type)</option>
                <option value="none">None</option>
                <option value="arrow">Arrow</option>
                <option value="open-arrow">Open Arrow</option>
                <option value="triangle">Triangle</option>
                <option value="open-triangle">Open Triangle</option>
                <option value="diamond">Diamond (Hollow)</option>
                <option value="filled-diamond">Diamond (Filled)</option>
                <option value="circle">Circle</option>
                <option value="bar">Bar</option>
                <option value="double-bar">Double Bar</option>
                <option value="crowfoot">Crowfoot</option>
                <option value="circle-crowfoot">Circle + Crowfoot</option>
                <option value="x">X</option>
                <option value="dot">Dot</option>
              </select>
              <p className="prop-desc">Applies symbol to right-side endpoint of selected line.</p>
            </div>
          )}

          {/* TEXT SECTION */}
          {/* Why: Most shapes can have text labels. UML classes have special structured text
              (class name, attributes, methods), while other shapes have simple text. */}
          <div className="prop-sec">
            <h4 className="prop-title">Text</h4>
            
            {/* Special UML class editor - shows three separate fields for class structure */}
            {selectedShape.type === 'uml-class' ? (
              <div className="uml-sec">
                {/* Class name field (first line of text) */}
                <div>
                  <label className="prop-lbl uml-fld">Class Name</label>
                  <input 
                    className="prop-in" 
                    type="text"
                    value={selectedShape.text.split('\n')[0] || ''}
                    onChange={(e) => {
                      // Update only the first line (class name)
                      const lines = selectedShape.text.split('\n');
                      lines[0] = e.target.value;
                      handleChange('text', lines.join('\n'));
                    }}
                    placeholder="ClassName"
                  />
                </div>
                
                {/* Attributes field (second line of text) */}
                <div>
                  <label className="prop-lbl uml-fld">Attributes</label>
                  <textarea 
                    className="prop-ta"
                    rows={3}
                    value={selectedShape.text.split('\n')[1] || ''}
                    onChange={(e) => {
                      // Update only the second line (attributes)
                      const lines = selectedShape.text.split('\n');
                      lines[1] = e.target.value;
                      handleChange('text', lines.join('\n'));
                    }}
                    placeholder="+attribute: type&#10;-privateAttr: type&#10;#protectedAttr: type"
                  />
                </div>
                
                {/* Methods field (third line of text) */}
                <div>
                  <label className="prop-lbl uml-fld">Methods</label>
                  <textarea 
                    className="prop-ta"
                    rows={3}
                    value={selectedShape.text.split('\n')[2] || ''}
                    onChange={(e) => {
                      // Update only the third line (methods)
                      const lines = selectedShape.text.split('\n');
                      lines[2] = e.target.value;
                      handleChange('text', lines.join('\n'));
                    }}
                    placeholder="+method(): type&#10;-privateMethod(): void&#10;#protectedMethod(): string"
                  />
                </div>
              </div>
            ) : (
              // Simple text editor for non-UML shapes
              <div className="prop-sec">
                <textarea
                    className="prop-ta"
                    rows={2}
                    value={selectedShape.text}
                    onChange={(e) => handleChange('text', e.target.value)}
                    placeholder="Enter text..."
                />
            </div>
            )}
            
            {/* Font settings - family and size */}
            <div className="prop-font-grid">
              <div>
                <label className="prop-lbl">Font</label>
                <select 
                    className="prop-sel"
                    value={selectedShape.fontFamily}
                    onChange={(e) => handleChange('fontFamily', e.target.value)}
                >
                  <option value="Inter">Inter</option>
                  <option value="Arial">Arial</option>
                  <option value="Courier New">Courier</option>
                  <option value="Times New Roman">Times</option>
                </select>
              </div>
              <div>
                <label className="prop-lbl">Size</label>
                 <div className="prop-in-wrap">
                    <input 
                        className="prop-in" 
                        type="number" 
                        value={selectedShape.fontSize}
                        onChange={(e) => handleChange('fontSize', e.target.value)}
                    />
                    <span className="prop-in-suf">px</span>
                </div>
              </div>
            </div>
          </div>

          {/* DIMENSIONS SECTION */}
          {/* Why: Allows precise control over shape size */}
          <div className="prop-sec">
            <h4 className="prop-title">Dimensions</h4>
            <div className="trans-grid">
              <div>
                <label className="prop-lbl">Width</label>
                <input 
                    className="prop-in" 
                    type="number" 
                    value={selectedShape.width}
                    onChange={(e) => handleChange('width', e.target.value)}
                />
              </div>
              <div>
                <label className="prop-lbl">Height</label>
                <input 
                    className="prop-in" 
                    type="number" 
                    value={selectedShape.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer with action buttons */}
      {/* Why: Provides quick access to common operations (duplicate, delete) */}
      <div className="sb-footer">
        <div className="sb-actions">
          {/* Duplicate button - creates a copy of the selected shape */}
          <button onClick={onDuplicate} className="sb-btn">
            <span className="material-symbols-outlined sb-icon">content_copy</span>
            <span className="sb-text">Duplicate</span>
          </button>
          
          {/* Delete button - removes the selected shape */}
          <button onClick={onDelete} className="sb-btn delete">
            <span className="material-symbols-outlined sb-icon">delete</span>
            <span className="sb-text">Delete</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
