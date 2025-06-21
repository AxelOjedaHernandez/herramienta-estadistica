import { useState } from 'react';
import { getControlConstants } from '../utils/controlConstants';

const XRChartInput = ({ onDataSubmit }) => {
  const [numRows, setNumRows] = useState(0);
  const [numCols, setNumCols] = useState(0);
  const [data, setData] = useState([]);

  const handleRowsChange = (e) => {
    const rows = parseInt(e.target.value) || 0;
    setNumRows(rows);
    initializeData(rows, numCols);
  };

  const handleColsChange = (e) => {
    const cols = Math.min(parseInt(e.target.value) || 0, 20);
    setNumCols(cols);
    initializeData(numRows, cols);
  };

  const initializeData = (rows, cols) => {
    if (rows > 0 && cols > 0) {
      const newData = Array(rows).fill().map(() => Array(cols).fill(''));
      setData(newData);
    } else {
      setData([]);
    }
  };

  const handleDataChange = (row, col, value) => {
    const newData = [...data];
    newData[row][col] = value === '' ? '' : parseFloat(value);
    setData(newData);
  };

  const calculateControlLimits = () => {
    const cleanData = data.map(row => 
      row.map(val => val === '' ? 0 : val)
    );

    // Calcular medias y rangos por muestra
    const sampleStats = cleanData.map(sample => {
      const validValues = sample.filter(val => val !== 0);
      const sampleMean = validValues.reduce((a, b) => a + b, 0) / validValues.length;
      const sampleRange = validValues.length > 0 ? Math.max(...validValues) - Math.min(...validValues) : 0;
      return { mean: sampleMean, range: sampleRange };
    });

    // Obtener constantes basadas en el número de columnas (n)
    const { A2, D3, D4, message } = getControlConstants(numCols);

    // Calcular promedios generales
    const X_double_bar = sampleStats.reduce((sum, stat) => sum + stat.mean, 0) / sampleStats.length;
    const R_bar = sampleStats.reduce((sum, stat) => sum + stat.range, 0) / sampleStats.length;

    // Calcular límites de control
    const controlLimits = sampleStats.map(stat => ({
      X_mean: stat.mean,
      X_LC: X_double_bar,
      X_LCS: X_double_bar + (A2 * R_bar),
      X_LCI: X_double_bar - (A2 * R_bar),
      R_value: stat.range,
      R_LC: R_bar,
      R_LCS: D4 * R_bar,
      R_LCI: D3 * R_bar
    }));

    return {
      controlLimits,
      averages: {
        X_double_bar,
        R_bar
      },
      constants: { A2, D3, D4 },
      message
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const results = calculateControlLimits();
    onDataSubmit(results);
  };

  return (
    <div className="xr-chart-input">
      <h2>Gráficos X-R</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Número de muestras (filas):</label>
          <input
            type="number"
            min="1"
            value={numRows}
            onChange={handleRowsChange}
          />
        </div>
        <div className="form-group">
          <label>Número de observaciones por muestra (columnas, máx 20):</label>
          <input
            type="number"
            min="1"
            max="20"
            value={numCols}
            onChange={handleColsChange}
          />
        </div>

        {numRows > 0 && numCols > 0 && (
          <>
            <div className="data-table">
              <h3>Tabla de Datos</h3>
              <table>
                <thead>
                  <tr>
                    <th>Muestra</th>
                    {Array.from({ length: numCols }).map((_, col) => (
                      <th key={col}>Obs {col + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td>{rowIndex + 1}</td>
                      {row.map((value, colIndex) => (
                        <td key={colIndex}>
                          <input
                            type="number"
                            step="any"
                            value={value}
                            onChange={(e) => 
                              handleDataChange(rowIndex, colIndex, e.target.value)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="submit" disabled={numRows === 0 || numCols === 0}>
              Calcular Límites de Control
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default XRChartInput;