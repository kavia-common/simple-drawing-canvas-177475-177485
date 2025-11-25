import React, { useEffect, useRef, useState, useCallback } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * App provides a simple drawing interface:
 * - A centered high-DPI canvas
 * - Color palette, brush size slider, and Clear Canvas button above the canvas
 * - Supports mouse and touch drawing with proper pointer event handling
 */
function App() {
  // Basic theme (light/dark) toggle retained for visual preference
  const [theme, setTheme] = useState('light');

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);

  // Ensure document theme attribute is set
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Setup canvas size to handle high-DPI displays and keep the canvas centered and responsive
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;

    // Define intended CSS pixel size for the canvas based on container size
    const maxWidth = Math.min(container.clientWidth, 900);
    const maxHeight = Math.min(window.innerHeight - 220, 600); // leave room for controls
    const cssWidth = Math.max(280, maxWidth);
    const cssHeight = Math.max(240, maxHeight);

    // Set canvas internal size scaled by device pixel ratio
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);

    // Set CSS display size (unscaled)
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale drawing operations
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;

    ctxRef.current = ctx;
  }, [brushSize, color]);

  useEffect(() => {
    resizeCanvas();
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resizeCanvas]);

  // Update drawing context when color or size changes
  useEffect(() => {
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }
  }, [color, brushSize]);

  // Helper to get coordinates relative to canvas
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const isTouch = e.touches && e.touches.length > 0;
    let clientX, clientY;
    if (isTouch) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const pos = getPos(e);
    isDrawingRef.current = true;
    lastPointRef.current = pos;
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;

    const newPos = getPos(e);
    const { x: lastX, y: lastY } = lastPointRef.current;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(newPos.x, newPos.y);
    ctx.stroke();

    lastPointRef.current = newPos;
  };

  const endDrawing = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    isDrawingRef.current = false;
  };

  // Clear canvas contents
  // PUBLIC_INTERFACE
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset to default for clearRect across scaled canvases
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  // Prevent scrolling while drawing on touch devices
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventTouchScroll = (e) => e.preventDefault();

    canvas.addEventListener('touchstart', preventTouchScroll, { passive: false });
    canvas.addEventListener('touchmove', preventTouchScroll, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', preventTouchScroll);
      canvas.removeEventListener('touchmove', preventTouchScroll);
    };
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  const colors = ['#000000', '#ff3b30', '#007aff', '#34c759']; // black, red, blue, green

  return (
    <div className="App">
      <header className="App-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <div className="container" ref={containerRef} style={{ maxWidth: 980, width: '100%', padding: '20px' }}>
          <h1 className="title" style={{ marginBottom: 8 }}>Simple Drawing Canvas</h1>
          <p className="subtitle" style={{ marginTop: 0, marginBottom: 20, fontSize: 14, opacity: 0.8 }}>
            Draw with your mouse or finger. Choose a color, adjust brush size, and clear when needed.
          </p>

          <div className="controls" aria-label="drawing controls" style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div className="palette" role="group" aria-label="color palette" style={{ display: 'flex', gap: 8 }}>
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={`Select color ${c}`}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: color === c ? '2px solid var(--text-secondary)' : '2px solid var(--border-color)',
                    backgroundColor: c,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                />
              ))}
            </div>

            <div className="brush" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label htmlFor="brushSize" style={{ fontSize: 14 }}>Brush</label>
              <input
                id="brushSize"
                type="range"
                min="1"
                max="32"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                aria-label="brush size"
              />
              <div
                aria-hidden="true"
                title={`Brush size: ${brushSize}px`}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: color,
                  boxShadow: '0 0 0 1px var(--border-color) inset',
                  transform: `scale(${Math.max(brushSize / 10, 0.3)})`,
                }}
              />
            </div>

            <button
              className="btn"
              onClick={clearCanvas}
              style={{
                backgroundColor: 'var(--button-bg)',
                color: 'var(--button-text)',
                border: 'none',
                borderRadius: 8,
                padding: '8px 14px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Clear Canvas
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <canvas
              ref={canvasRef}
              role="img"
              aria-label="drawing canvas"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                touchAction: 'none', // disable gestures interfering with drawing
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
            />
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
