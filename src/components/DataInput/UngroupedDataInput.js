import { useState } from 'react';

const UngroupedDataInput = ({ onDataSubmit }) => {
  const [numDataPoints, setNumDataPoints] = useState(0);
  const [dataPoints, setDataPoints] = useState([]);

  const handleNumDataChange = (e) => {
    const num = parseInt(e.target.value) || 0;
    setNumDataPoints(num);
    setDataPoints(Array(num).fill(''));
  };

  const handleDataChange = (index, value) => {
    const newDataPoints = [...dataPoints];
    // Permitir 0 como valor válido
    newDataPoints[index] = value === '' ? '' : parseFloat(value);
    setDataPoints(newDataPoints);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filtrar solo los campos vacíos (no los ceros)
    const cleanData = dataPoints.filter(val => val !== '');
    onDataSubmit({
      type: 'ungrouped',
      data: cleanData
    });
  };

  const renderDataInputs = () => {
    const inputs = [];
    const rows = Math.ceil(numDataPoints / 5);
    
    for (let i = 0; i < rows; i++) {
      inputs.push(
        <div key={i} className="data-row">
          {Array.from({ length: 5 }).map((_, j) => {
            const index = i * 5 + j;
            if (index >= numDataPoints) return null;
            
            return (
              <div key={index} className="data-input-cell">
                <label>Dato {index + 1}</label>
                <input
                  type="number"
                  step="any"
                  value={dataPoints[index]}
                  onChange={(e) => handleDataChange(index, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      );
    }
    
    return inputs;
  };

  return (
    <form onSubmit={handleSubmit} className="ungrouped-form">
      <div className="form-group">
        <label>Número de datos:</label>
        <input
          type="number"
          min="1"
          value={numDataPoints}
          onChange={handleNumDataChange}
        />
      </div>
      
      <div className="data-grid">
        {numDataPoints > 0 && renderDataInputs()}
      </div>
      
      <button type="submit" disabled={numDataPoints === 0}>
        Calcular Estadísticas
      </button>
    </form>
  );
};

export default UngroupedDataInput;
