import React, { useState } from 'react';
import { LIBRARY_CATEGORIES } from '../../constants';
import '../../styles/diagram.css';

export const SidebarLeft = ({ onDragStart }) => {
  const toCategoryId = (name) =>
    name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

  const [openCategories, setOpenCategories] = useState(
    () => LIBRARY_CATEGORIES.map((c) => toCategoryId(c.name))
  );

  const toggleCategory = (id) => {
    setOpenCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('application/react-diagram-type', type);
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart(type);
  };

  const renderIcon = (type, fallback, stroke = 'currentColor', fill = 'none') => {
    const sProps = { stroke, fill, strokeWidth: 2 };

    switch (type) {
      case 'rectangle':
        return <div className="shp-icon shp-rect" />;
      case 'pill':
        return <div className="shp-icon shp-pill" />;
      case 'rect':
        return <div className="shp-icon shp-box" />;
      case 'rounded-rect':
        return <div className="shp-icon shp-round" />;
      case 'diamond':
        return <div className="shp-icon shp-diamond" />;
      case 'parallelogram':
        return <div className="shp-icon shp-para" />;
      case 'skew':
        return <div className="shp-icon shp-skew" />;
      case 'state':
        return (
          <div className="shp-icon shp-state">
            <div className="shp-state-div"></div>
          </div>
        );
      case 'actor':
        return (
          <svg
            viewBox="0 0 24 24"
            className="shp-icon shp-actor"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="5" r="4" />
            <line x1="12" y1="9" x2="12" y2="16" />
            <line x1="8" y1="11" x2="16" y2="11" />
            <line x1="12" y1="16" x2="9" y2="21" />
            <line x1="12" y1="16" x2="15" y2="21" />
          </svg>
        );
      case 'transition':
        return (
          <svg viewBox="0 0 50 20" className="shp-icon shp-arrow">
            <line
              x1="0"
              y1="10"
              x2="40"
              y2="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <polygon points="50,10 40,5 40,15" fill="currentColor" />
          </svg>
        );
      case 'square':
        return <div className="shp-icon shp-square" />;
      case 'circle':
        return <div className="shp-icon shp-circle" />;
      case 'usecase-oval':
        return <div className="shp-icon shp-oval" />;
      case 'uml-module':
        return (
          <svg
            viewBox="0 0 60 40"
            className="shp-icon shp-hex"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="18" y="8" width="36" height="24" rx="2" />
            <rect x="10" y="14" width="8" height="6" />
            <rect x="10" y="22" width="8" height="6" />
          </svg>
        );
      case 'uml-component':
        return (
          <svg
            viewBox="0 0 60 40"
            className="shp-icon shp-hex"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="6" y="8" width="36" height="24" rx="2" />
            <rect x="42" y="14" width="8" height="6" />
            <rect x="42" y="22" width="8" height="6" />
          </svg>
        );
      case 'start-node':
        return (
          <div className="shp-icon shp-start">
            <div className="shp-start-circle" />
          </div>
        );
      case 'end-node':
        return (
          <div className="shp-icon shp-end">
            <div className="shp-end-outer">
              <div className="shp-end-inner" />
            </div>
          </div>
        );
      case 'triangle':
        return (
          <div className="shp-icon shp-tri">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,1 99,99 1,99"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
              />
            </svg>
          </div>
        );
      case 'hexagon':
        return (
          <svg
            viewBox="0 0 100 100"
            className="shp-icon shp-hex"
          >
            <polygon
              points="25,5 75,5 95,50 75,95 25,95 5,50"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
          </svg>
        );
      case 'cylinder':
        return (
          <svg
            viewBox="0 0 100 100"
            className="shp-icon shp-cyl"
          >
            <ellipse
              cx="50"
              cy="15"
              rx="35"
              ry="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              d="M15,15 v70 a35,10 0 0 0 70,0 v-70"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
          </svg>
        );
      case 'cloud':
        return (
          <svg
            viewBox="0 0 24 24"
            className="shp-icon shp-cloud"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
          </svg>
        );
      case 'document':
        return (
          <svg
            viewBox="0 0 24 24"
            className="shp-icon shp-doc"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
            <path d="M14 2v6h6" />
          </svg>
        );
      case 'cube':
        return (
          <svg
            viewBox="0 0 24 24"
            className="shp-icon shp-cube"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 16.5L9 22L2.5 19l11.5-6l12 3.5L21 16.5z" />
            <path d="M9 22v-12L21 4.5v12" />
            <path d="M9 10L2.5 7.5v11.5L9 22" />
            <path d="M9 10l12-5.5" />
          </svg>
        );
      case 'trapezoid':
        return (
          <div className="shp-icon shp-trap">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="20,0 80,0 100,100 0,100"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
              />
            </svg>
          </div>
        );
      case 'callout':
        return (
          <svg
            viewBox="0 0 24 24"
            className="shp-icon shp-call"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        );
      case 'list':
        return (
          <svg
            viewBox="0 0 24 24"
            className="shp-icon shp-list"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
            <line x1="8" y1="9" x2="16" y2="9" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="14" y2="17" />
          </svg>
        );
      case 'star':
        return (
          <div className="shp-icon shp-star">
            <span className="material-symbols-outlined">star</span>
          </div>
        );
      case 'arrow-right':
        return (
          <svg viewBox="0 0 50 50" className="shp-icon shp-arrow">
            <line
              x1="5"
              y1="25"
              x2="35"
              y2="25"
              stroke="currentColor"
              strokeWidth="2"
            />
            <polygon points="45,25 35,20 35,30" fill="currentColor" />
          </svg>
        );
      case 'arrow-left':
        return (
          <svg viewBox="0 0 50 50" className="shp-icon shp-arrow">
            <line
              x1="45"
              y1="25"
              x2="15"
              y2="25"
              stroke="currentColor"
              strokeWidth="2"
            />
            <polygon points="5,25 15,20 15,30" fill="currentColor" />
          </svg>
        );
      case 'arrow-up':
        return (
          <svg viewBox="0 0 50 50" className="shp-icon shp-arrow">
            <line
              x1="25"
              y1="45"
              x2="25"
              y2="15"
              stroke="currentColor"
              strokeWidth="2"
            />
            <polygon points="25,5 20,15 30,15" fill="currentColor" />
          </svg>
        );
      case 'arrow-down':
        return (
          <svg viewBox="0 0 50 50" className="shp-icon shp-arrow">
            <line
              x1="25"
              y1="5"
              x2="25"
              y2="35"
              stroke="currentColor"
              strokeWidth="2"
            />
            <polygon points="25,45 20,35 30,35" fill="currentColor" />
          </svg>
        );
      case 'arrow-bidirectional':
      case 'arrow-bi':
        return (
          <svg viewBox="0 0 50 50" className="shp-icon shp-arrow">
            <line
              x1="15"
              y1="25"
              x2="35"
              y2="25"
              stroke="currentColor"
              strokeWidth="2"
            />
            <polygon points="45,25 35,20 35,30" fill="currentColor" />
            <polygon points="5,25 15,20 15,30" fill="currentColor" />
          </svg>
        );
      case 'dotted-arrow':
      case 'arrow-dotted':
        return (
          <svg viewBox="0 0 50 50" className="shp-icon shp-arrow">
            <line
              x1="5"
              y1="25"
              x2="35"
              y2="25"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
            <polygon points="45,25 35,20 35,30" fill="currentColor" />
          </svg>
        );
      case 'erd-one-to-one':
        return (
          <svg viewBox="0 0 60 20" className="shp-icon shp-arrow">
            <line
              x1="10"
              y1="10"
              x2="50"
              y2="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="10"
              y1="4"
              x2="10"
              y2="16"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="50"
              y1="4"
              x2="50"
              y2="16"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        );
      case 'erd-one-to-many':
        return (
          <svg viewBox="0 0 60 20" className="shp-icon shp-arrow">
            <line
              x1="10"
              y1="10"
              x2="46"
              y2="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="10"
              y1="4"
              x2="10"
              y2="16"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="46"
              y1="10"
              x2="54"
              y2="4"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="46"
              y1="10"
              x2="54"
              y2="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="46"
              y1="10"
              x2="54"
              y2="16"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        );
      case 'erd-one-and-only-one':
        return (
          <svg viewBox="0 0 60 20" className="shp-icon shp-arrow">
            <line
              x1="10"
              y1="10"
              x2="50"
              y2="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="10"
              y1="4"
              x2="10"
              y2="16"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="50"
              y1="4"
              x2="50"
              y2="16"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        );
      case 'erd-one-or-more':
        return (
          <svg viewBox="0 0 60 20" className="shp-icon shp-arrow">
            <line
              x1="10"
              y1="10"
              x2="46"
              y2="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="10"
              y1="4"
              x2="10"
              y2="16"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="46"
              y1="10"
              x2="54"
              y2="4"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="46"
              y1="10"
              x2="54"
              y2="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="46"
              y1="10"
              x2="54"
              y2="16"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        );
      case 'erd-zero-or-one':
        return (
          <svg viewBox="0 0 60 20" className="shp-icon shp-arrow">
            <line
              x1="14"
              y1="10"
              x2="50"
              y2="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="50"
              y1="4"
              x2="50"
              y2="16"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle
              cx="10"
              cy="10"
              r="3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        );
      case 'erd-zero-or-many':
        return (
          <svg viewBox="0 0 60 20" className="shp-icon shp-arrow">
            <line
              x1="14"
              y1="10"
              x2="46"
              y2="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle
              cx="10"
              cy="10"
              r="3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="46"
              y1="10"
              x2="54"
              y2="4"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="46"
              y1="10"
              x2="54"
              y2="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="46"
              y1="10"
              x2="54"
              y2="16"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        );
      default:
        return (
          <div className="shp-icon shp-fallback">
            <span className="shp-fallback-text">{fallback ?? '▢'}</span>
          </div>
        );
    }
  };

  return (
    <aside className="sb-left">
      <div className="sb-header">
        <h2 className="sb-title">Shapes Library</h2>
      </div>

      <div className="sb-content">
        {LIBRARY_CATEGORIES.map((category) => {
          const categoryId = toCategoryId(category.name);
          return (
            <div key={categoryId} className="sb-cat">
              <div
                className="sb-cat-head"
                onClick={() => toggleCategory(categoryId)}
              >
                <p className="sb-cat-name">{category.name}</p>
                <span
                  className={`material-symbols-outlined sb-cat-icon ${
                    openCategories.includes(categoryId) ? 'open' : ''
                  }`}
                >
                  expand_more
                </span>
              </div>

              {openCategories.includes(categoryId) && (
                <div className={`sb-grid ${categoryId}`}>
                  {category.items.map((item) => (
                    <div
                      key={item.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.type)}
                      className="sb-item"
                    >
                      <div className={`sb-icon ${categoryId}`}>
                        {renderIcon(item.type, item.icon)}
                      </div>
                      {categoryId !== 'arrows' && (
                        <p className="sb-item-name">{item.name}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </aside>
  );
};
