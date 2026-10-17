import React, { useState, useCallback, useEffect } from 'react';
import { diagramApi } from '../api/DiagramApi';
import '../styles/diagram.css';

// Import diagram editor components
import { SidebarLeft } from '../components/diagram/SidebarLeft';
import { SidebarRight } from '../components/diagram/SidebarRight';
import { Canvas } from '../components/diagram/Canvas';

const getLoginUserId = (userIdProp) => {
  if (userIdProp) return String(userIdProp);
  try {
    const session = JSON.parse(localStorage.getItem('projectWaySession') || '{}');
    if (session.userId) return String(session.userId);
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    const part = token.split('.')[1];
    const padded = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded));
    return payload.id || payload._id || payload.userId || null;
  } catch (error) {
    return null;
  }
};

const DiagramEditor = ({ userName, userId }) => {
  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [currentDiagramId, setCurrentDiagramId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // History for Undo/Redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Helper to add state to history
  const addToHistory = (newShapes) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newShapes);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
  };

  // Load diagram on mount - check URL for diagramId first, then load by user
  useEffect(() => {
    const loadDiagram = async () => {
      // Get diagramId from URL query string
      const urlParams = new URLSearchParams(window.location.search);
      const diagramId = urlParams.get('diagramId');
      const loginUserId = getLoginUserId(userId);

      if (diagramId) {
        try {
          setIsLoading(true);
          const diagramRes = await diagramApi.getDiagram(diagramId);
          const diagram = diagramRes.data;
          const owner = diagram?.userId;
          
          // Check if user owns this diagram
          if (owner && loginUserId && owner !== loginUserId) {
            throw new Error('Diagram belongs to another user');
          }

          if (diagram && (diagram.shapes || diagram.diagramData)) {
            if (diagram.shapes) {
              setShapes(diagram.shapes);
            } else if (diagram.diagramData?.nodes) {
              setShapes(diagram.diagramData.nodes);
            }
            setCurrentDiagramId(diagramId);
            addToHistory(diagram.shapes || diagram.diagramData?.nodes || []);
          }
        } catch (error) {
          console.error("Failed to load diagram:", error);
          alert('Could not load diagram. It may belong to another user.');
        } finally {
          setIsLoading(false);
        }
      } else {
        // If no diagramId in URL, load the most recent diagram for this user
        try {
          if (loginUserId) {
            const userDiagrams = await diagramApi.getAllDiagrams(loginUserId);

            if (userDiagrams.data && userDiagrams.data.length > 0) {
              // Load the most recent diagram for this user
              const userDiagram = userDiagrams.data[0];
              if (userDiagram) {
                if (userDiagram.shapes) {
                  setShapes(userDiagram.shapes);
                } else if (userDiagram.diagramData?.nodes) {
                  setShapes(userDiagram.diagramData.nodes);
                }
                setCurrentDiagramId(userDiagram._id);
                addToHistory(userDiagram.shapes || userDiagram.diagramData?.nodes || []);
                // Update URL with diagramId
                const newUrl = `${window.location.pathname}?diagramId=${userDiagram._id}`;
                window.history.replaceState({}, "", newUrl);
              }
            }
          }
        } catch (error) {
          console.error("Failed to load diagram for user:", error);
        }
      }
    };
    
    loadDiagram();
  }, [userName, userId]);

  const handleAddShape = (shape) => {
    const newShapes = [...shapes, shape];
    setShapes(newShapes);
    addToHistory(newShapes);
  };

  const handleDragStart = (shape) => {
    // Handle drag start logic
    console.log('Dragging shape:', shape);
  };

  const handleUpdateShape = useCallback((id, updates) => {
    setShapes(prev => {
        const next = prev.map(s => s.id === id ? { ...s, ...updates } : s);
        return next;
    });
  }, []);

  // Save to history only on selection change or mouse up (debouncing for drag)
  // For simplicity in this demo, we update history explicitly in SidebarRight or when adding
  // Real app would debounce history updates for dragging properties
  const handleCommitUpdate = (updates) => {
      if (!selectedId) return;
      const newShapes = shapes.map(s => s.id === selectedId ? { ...s, ...updates } : s);
      setShapes(newShapes);
      addToHistory(newShapes);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const newShapes = shapes.filter(s => s.id !== selectedId);
    setShapes(newShapes);
    setSelectedId(null);
    addToHistory(newShapes);
  };

  const handleDuplicate = () => {
      if (!selectedId) return;
      const original = shapes.find(s => s.id === selectedId);
      if (!original) return;
      
      const newShape = {
          ...original,
          id: Date.now().toString(),
          x: original.x + 20,
          y: original.y + 20
      };
      
      const newShapes = [...shapes, newShape];
      setShapes(newShapes);
      setSelectedId(newShape.id);
      addToHistory(newShapes);
  };

  // Handle end of shape changes (drag/resize operations)
  const handleShapeChangeEnd = () => {
      // Commit the current shape state to history
      addToHistory(shapes);
  };

  const undo = () => {
      if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setShapes(history[newIndex]);
      }
  };

  const redo = () => {
      if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setShapes(history[newIndex]);
      }
  };

 const saveDiagram = async () => {
  try {
    const loginUserId = getLoginUserId(userId);
    if (!loginUserId) {
      alert('Login user id missing. Please log out and log in again, then save.');
      return;
    }

    const body = {
      userId: loginUserId,
      diagramId: currentDiagramId || undefined,
      title: `Diagram ${new Date().toLocaleString()}`,
      description: "Saved from React app",
      diagramData: {
        nodes: shapes,
        edges: [],
      },
      shapes: shapes,
    };

    let response;
    if (currentDiagramId) {
      response = await diagramApi.updateDiagram(currentDiagramId, body);
    } else {
      response = await diagramApi.saveDiagram(body);
      const saved = response.data || response;
      const id = saved.data?._id || saved._id;
      if (id) {
        setCurrentDiagramId(id);
        const newUrl = `${window.location.pathname}?diagramId=${id}`;
        window.history.replaceState({}, "", newUrl);
      }
    }

    alert("Diagram saved successfully");
  } catch (error) {
    console.error("Failed to save diagram to backend:", error);
    alert("Failed to save diagram. Please try again.");
  }
};

  const newDiagram = () => {
      if (confirm('Are you sure you want to create a new diagram? Unsaved changes will be lost.')) {
          setShapes([]);
          setSelectedId(null);
          setCurrentDiagramId(null);
          addToHistory([]);
          // Clear URL query string
          window.history.replaceState({}, '', window.location.pathname);
      }
  };

  const handleDownload = () => {
    // Find the canvas element
    const canvas = document.querySelector('.canv-render');
    if (!canvas) {
      alert('Canvas element not found');
      return;
    }

    // Use html2canvas library to capture the canvas
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = () => {
      window.html2canvas(canvas, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      }).then(canvasElement => {
        // Convert to PNG and download
        const link = document.createElement('a');
        link.download = 'diagram.png';
        link.href = canvasElement.toDataURL('image/png');
        link.click();
      }).catch(error => {
        console.error('Error capturing canvas:', error);
        alert('Failed to download diagram');
      });
    };
    document.head.appendChild(script);
  };

  const selectedShape = shapes.find(s => s.id === selectedId) || null;

  return (
    <div className="diagram-editor-container">
      {/* HEADER */}
      <header className="diagram-editor-header">
        <div className="diagram-editor-logo">
          <h2 className="diagram-editor-title">Diagram Editor </h2>
        </div>
        <div className="diagram-editor-controls">
          <div className="diagram-editor-controls-group">
            <button onClick={undo} disabled={historyIndex <= 0} className="diagram-editor-control-button" title="Undo">
              <span className="material-symbols-outlined diagram-editor-control-icon">undo</span>
            </button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="diagram-editor-control-button" title="Redo">
              <span className="material-symbols-outlined diagram-editor-control-icon">redo</span>
            </button>
          </div>
          <div className="diagram-editor-controls-divider"></div>
          <button onClick={newDiagram} className="diagram-editor-control-button diagram-editor-control-button-labeled">
            <span className="material-symbols-outlined diagram-editor-control-icon">add</span>
            <span className="diagram-editor-control-label">New diagram</span>
          </button>
          <button onClick={saveDiagram} disabled={isLoading} className="diagram-editor-control-button diagram-editor-control-button-labeled" title="Save to Backend">
            <span className="material-symbols-outlined diagram-editor-control-icon">save</span>
            <span className="diagram-editor-control-label">Save</span>
          </button>
          <button onClick={handleDownload} className="diagram-editor-control-button diagram-editor-control-button-labeled">
            <span className="material-symbols-outlined diagram-editor-control-icon">download</span>
            <span className="diagram-editor-control-label">Download</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="diagram-editor-main">
        <SidebarLeft onDragStart={handleDragStart} />
        <Canvas 
            shapes={shapes}
            onAddShape={handleAddShape}
            onSelectShape={setSelectedId}
            onUpdateShape={handleUpdateShape}
            onShapeChangeEnd={handleShapeChangeEnd}
            selectedId={selectedId}
            zoom={zoom}
        />
        <SidebarRight 
            selectedShape={selectedShape} 
            onUpdateShape={handleCommitUpdate}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
        />
      </main>
    </div>
  );
};

export default DiagramEditor;
