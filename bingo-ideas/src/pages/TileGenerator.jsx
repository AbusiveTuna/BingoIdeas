import { useMemo, useState } from 'react';
import eras from 'common/json/eras.json';
import TileGenTable from './TileGenTable';
import { bossesMaps, mobsMaps, raidsMaps, cluesMaps, combinedMaps } from './bossMaps';
import './TileGenerator.css';

const DATASETS = {
  all:    { label: 'Combined', ...combinedMaps },
  bosses:  { label: 'Bosses',   ...bossesMaps },
  clues:    { label: 'Clues', ...cluesMaps },
  mobs:    { label: 'Mobs',     ...mobsMaps },
  raids:   { label: 'Raids',    ...raidsMaps },
  
};

const eraOrder = eras.map(e => e.Era);
const eraSet   = new Set(eraOrder);

const TileGenerator = () => {
  const [src, setSrc]   = useState('all');
  const [view, setView] = useState({ mode: null, key: null });

  const { categoryMap, typeMap } = DATASETS[src];

  const normalCats = useMemo(
    () =>
      Object.keys(categoryMap)
        .filter(c => !eraSet.has(c))
        .sort((a, b) => a.localeCompare(b)),
    [categoryMap]
  );

  const eraCats = useMemo(
    () =>
      Object.keys(categoryMap)
        .filter(c => eraSet.has(c))
        .sort((a, b) => eraOrder.indexOf(a) - eraOrder.indexOf(b)),
    [categoryMap]
  );

  const { rows, cols } = useMemo(() => {
    if (view.mode === 'category' && categoryMap[view.key]) {
      const data = categoryMap[view.key].flatMap(b =>
        (b.Drops ?? []).map(d => ({
          boss: b.Boss,
          item: d.Item,
          type: d.Types?.join(', ') ?? '-',
          dropRate: d.DropRate ?? d.ConditionalDropRate,
          ehb: b.EHB,
          eff: d.eff ?? ((d.DropRate ?? d.ConditionalDropRate) / b.EHB).toFixed(1),
        }))
      );
      return {
        rows: data,
        cols: [
          { label: 'Boss', key: 'boss' },
          { label: 'Item', key: 'item' },
          { label: 'Type', key: 'type' },
          { label: 'Drop Rate', key: 'dropRate' },
          { label: 'EHB', key: 'ehb' },
          { label: 'Eff Rate', key: 'eff' },
        ],
      };
    }
    if (view.mode === 'type' && typeMap[view.key]) {
      return {
        rows: typeMap[view.key],
        cols: [
          { label: 'Item', key: 'item' },
          { label: 'Boss', key: 'boss' },
          { label: 'Drop Rate', key: 'dropRate' },
          { label: 'EHB', key: 'ehb' },
          { label: 'Eff Rate', key: 'eff' },
        ],
      };
    }
    return { rows: [], cols: [] };
  }, [view, categoryMap, typeMap]);

  const pill = (text, mode) => (
    <button
      key={text}
      className={
        'tileGen-btn' +
        (view.mode === mode && view.key === text ? ' active' : '')
      }
      onClick={() => setView({ mode, key: text })}
    >
      {text}
    </button>
  );

  return (
    <div className="tileGen-wrapper">
      <div className="tileGen-btnRow">
        {Object.entries(DATASETS).map(([k, v]) => (
          <button
            key={k}
            className={'tileGen-btn' + (src === k ? ' active' : '')}
            onClick={() => {
              setSrc(k);
              setView({ mode: null, key: null });
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      <h2 className="tileGen-sectionTitle">Categories</h2>
      <div className="tileGen-btnRow">{normalCats.map(c => pill(c, 'category'))}</div>

      <h2 className="tileGen-sectionTitle">Eras</h2>
      <div className="tileGen-btnRow">{eraCats.map(c => pill(c, 'category'))}</div>

      <h2 className="tileGen-sectionTitle">Drop Types</h2>
      <div className="tileGen-btnRow">
        {Object.keys(typeMap)
          .sort((a, b) => a.localeCompare(b))
          .map(t => pill(t, 'type'))}
      </div>

      {rows.length > 0 && <TileGenTable cols={cols} rows={rows} />}
    </div>
  );
};

export default TileGenerator;
