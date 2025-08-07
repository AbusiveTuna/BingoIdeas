const TileGenTable = ({ cols, rows }) => {
  return (
    <table className="tileGen-table">
      <thead>
        <tr>{cols.map(c => <th key={c.label}>{c.label}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {cols.map(c => (
              <td key={c.label}>{r[c.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TileGenTable;