const GroupedStatsResults = ({ data }) => {
  if (!data || !data.frequencyTable || data.frequencyTable.length === 0) {
    return <div>No hay datos para mostrar</div>;
  }

  return (
    <div className="grouped-results">
      <h2>Resultados para Datos Agrupados</h2>
      
      <div className="basic-stats">
        <h3>Estadísticas Básicas</h3>
        <div className="stats-grid">
          <div>
            <p><strong>Número de datos:</strong> {data.numDataPoints}</p>
            <p><strong>Valor mínimo:</strong> {data.min.toFixed(4)}</p>
            <p><strong>Valor máximo:</strong> {data.max.toFixed(4)}</p>
          </div>
          <div>
            <p><strong>Rango:</strong> {data.range.toFixed(4)}</p>
            <p><strong>Número de clases (k):</strong> {data.k}</p>
            <p><strong>Amplitud:</strong> {data.amplitude.toFixed(4)}</p>
          </div>
        </div>
      </div>

      <div className="central-tendency">
        <h3>Medidas de Tendencia Central</h3>
        <div className="stats-grid">
          <p><strong>Media:</strong> {data.mean.toFixed(4)}</p>
          <p><strong>Mediana:</strong> {data.median.toFixed(4)}</p>
          <p><strong>Moda:</strong> {Array.isArray(data.mode) ? data.mode.map(m => m.toFixed(4)).join(', ') : data.mode.toFixed(4)}</p>
        </div>
      </div>

      <div className="dispersion">
        <h3>Medidas de Dispersión</h3>
        <div className="stats-grid">
          <p><strong>Varianza poblacional:</strong> {data.populationVariance.toFixed(4)}</p>
          <p><strong>Varianza muestral:</strong> {data.sampleVariance.toFixed(4)}</p>
          <p><strong>Desviación estándar poblacional:</strong> {data.populationStdDev.toFixed(4)}</p>
          <p><strong>Desviación estándar muestral:</strong> {data.sampleStdDev.toFixed(4)}</p>
        </div>
      </div>

      <div className="frequency-tables">
        <h3>Tabla de Frecuencias</h3>
        <table className="main-table">
          <thead>
            <tr>
              <th>Clase</th>
              <th>Lím. Inferior</th>
              <th>Lím. Superior</th>
              <th>Marca de Clase</th>
              <th>Frecuencia (fᵢ)</th>
              <th>Frec. Acumulada (Fᵢ)</th>
              <th>Frec. Relativa</th>
              <th>Frec. Rel. Acumulada</th>
            </tr>
          </thead>
          <tbody>
            {data.frequencyTable.map((row, i) => (
              <tr key={i}>
                <td>{row.class}</td>
                <td>{row.lower.toFixed(data.decimalPlaces)}</td>
                <td>{row.upper.toFixed(data.decimalPlaces)}</td>
                <td>{row.classMark.toFixed(data.decimalPlaces)}</td>
                <td>{row.frequency}</td>
                <td>{row.cumulativeFrequency}</td>
                <td>{row.relativeFrequency.toFixed(4)}</td>
                <td>{row.relativeCumulativeFrequency.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Tabla de Productos</h3>
        <table className="product-table">
          <thead>
            <tr>
              <th>Marca de Clase</th>
              <th>Frecuencia</th>
              <th>Producto (xᵢfᵢ)</th>
            </tr>
          </thead>
          <tbody>
            {data.frequencyTable.map((row, i) => (
              <tr key={i}>
                <td>{row.classMark.toFixed(data.decimalPlaces)}</td>
                <td>{row.frequency}</td>
                <td>{row.product.toFixed(data.decimalPlaces)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupedStatsResults;