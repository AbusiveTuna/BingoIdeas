import { useEffect, useMemo, useState, useRef } from 'react';
import tileSet from 'common/json/previousTiles/battleship2Tiles.json';
import './TileOrdering.css';

const download = (filename, text) => {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const TileCard = ({ tile, index, onDragStart, onDragOver, onDrop }) => {
  return (
    <div
      className="TileOrdering-card"
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      data-index={index}
      title={tile.LongDescription || tile.Description}
    >
      <div className="TileOrdering-cardHeader">
        <span className="TileOrdering-index">{index + 1}</span>
        <span className={`TileOrdering-pill TileOrdering-pill-${(tile.Type || '').toLowerCase()}`}>{tile.Type || 'Unknown'}</span>
      </div>
      <div className="TileOrdering-thumbWrap">
        {tile.Image ? (
          <img
            className="TileOrdering-thumb"
            src={tile.Image}
            alt={tile.Name}
            onError={(e) => {
              e.currentTarget.style.visibility = 'hidden';
            }}
          />
        ) : (
          <div className="TileOrdering-thumb TileOrdering-thumb--missing">No Image</div>
        )}
      </div>
      <div className="TileOrdering-name">{tile.Name}</div>
      <div className="TileOrdering-meta">
        <span>ID: {tile.Id}</span>
        {tile.Shots != null && <span>Shots: {tile.Shots}</span>}
        {tile.Goal != null && <span>Goal: {tile.Goal}</span>}
      </div>
    </div>
  );
};

const TileOrdering = () => {
  const [tiles, setTiles] = useState(() => {
    // try restore from localStorage first
    const saved = localStorage.getItem('TileOrdering.reordered');
    return saved ? JSON.parse(saved) : tileSet;
  });

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const dragFrom = useRef(null);
  const dragOver = useRef(null);

  const filtered = useMemo(() => {
    let data = tiles;
    if (typeFilter !== 'ALL') {
      data = data.filter((t) => (t.Type || '').toLowerCase() === typeFilter.toLowerCase());
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (t) =>
          (t.Name || '').toLowerCase().includes(q) ||
          (t.Description || '').toLowerCase().includes(q) ||
          String(t.Id).toLowerCase().includes(q)
      );
    }
    return data;
  }, [tiles, query, typeFilter]);

  // Map filtered indices back to original indices for drops inside filtered views.
  const visibleToAbsoluteIndex = (visibleIndex) => {
    const tile = filtered[visibleIndex];
    return tiles.findIndex((t) => t === tile);
  };

  const onDragStart = (e, visibleIndex) => {
    dragFrom.current = visibleToAbsoluteIndex(visibleIndex);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const onDrop = (e, visibleIndex) => {
    e.preventDefault();
    const from = dragFrom.current;
    const to = visibleToAbsoluteIndex(visibleIndex);
    if (from == null || to == null || from === to) return;
    setTiles((prev) => {
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    dragFrom.current = null;
  };

  useEffect(() => {
    localStorage.setItem('TileOrdering.reordered', JSON.stringify(tiles));
  }, [tiles]);

  const exportJSON = () => {
    download('reorderedTiles.json', JSON.stringify(tiles, null, 2));
  };

  const copyJSON = async () => {
    const text = JSON.stringify(tiles, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      alert('JSON copied');
    } catch {
      // fallback
      download('reorderedTiles.json', text);
    }
  };

  const resetToSource = () => setTiles(tileSet);

  const moveSelected = (dir) => {
    // keyboard reordering: uses the first card in filtered as "selected"
    const list = document.querySelectorAll('.TileOrdering-card');
    if (!list.length) return;
    const el = document.activeElement?.classList?.contains('TileOrdering-card') ? document.activeElement : list[0];
    const visibleIndex = Number(el.getAttribute('data-index'));
    const absIndex = visibleToAbsoluteIndex(visibleIndex);
    const target = absIndex + (dir === 'up' ? -1 : 1);
    if (target < 0 || target >= tiles.length) return;
    setTiles((prev) => {
      const next = prev.slice();
      const [m] = next.splice(absIndex, 1);
      next.splice(target, 0, m);
      return next;
    });
    // focus stays roughly in place
  };

  const importJSON = async (file) => {
    const text = await file.text();
    try {
      const arr = JSON.parse(text);
      if (!Array.isArray(arr)) throw new Error('Root must be an array');
      setTiles(arr);
    } catch (e) {
      alert('Invalid JSON file');
    }
  };

  return (
    <div className="TileOrdering-wrap">
      <header className="TileOrdering-toolbar">
        <input
          className="TileOrdering-search"
          placeholder="Filter by name, desc, or ID…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="TileOrdering-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All types</option>
          <option value="Early">Early</option>
          <option value="Mid">Mid</option>
          <option value="Late">Late</option>
          <option value="Passive">Passive</option>
        </select>

        <div className="TileOrdering-spacer" />

        <button className="TileOrdering-btn" onClick={() => moveSelected('up')} title="Move up (focus a card)">
          ↑
        </button>
        <button className="TileOrdering-btn" onClick={() => moveSelected('down')} title="Move down (focus a card)">
          ↓
        </button>

        <button className="TileOrdering-btn" onClick={exportJSON}>Export JSON</button>
        <button className="TileOrdering-btn" onClick={copyJSON}>Copy JSON</button>
        <label className="TileOrdering-fileBtn">
          Import JSON
          <input
            type="file"
            accept="application/json"
            onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])}
            hidden
          />
        </label>
        <button className="TileOrdering-btn" onClick={resetToSource}>Reset</button>
      </header>

      <div className="TileOrdering-grid">
        {filtered.map((tile, i) => (
          <TileCard
            key={`${tile.Id}-${i}`}
            tile={tile}
            index={i}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
          />
        ))}
      </div>
    </div>
  );
};

export default TileOrdering;
