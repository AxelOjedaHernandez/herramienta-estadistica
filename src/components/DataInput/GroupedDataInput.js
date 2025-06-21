//components/DataInput/GroupedDataInput.js
import { useState, useEffect } from 'react';
import { calculateSturges } from '../utils/statsUtils';

const GroupedDataInput = ({ onDataSubmit }) => {
  const [inputMethod, setInputMethod] = useState('manual');
  const [numDataPoints, setNumDataPoints] = useState(0);
  const [dataPoints, setDataPoints] = useState([]);
  const [numClasses, setNumClasses] = useState(0);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    if (inputMethod === 'manual' && dataPoints.length > 0) {
      const cleanData = dataPoints.filter(val => val !== '').map(Number);
      if (cleanData.length > 0) {
        const min = Math.min(...cleanData);
        const max = Math.max(...cleanData);
        const range = max - min;
        const k = calculateSturges(cleanData.length);
        const amplitude = range / k;
        
        const calculatedClasses = [];
        let currentLower = min;
        
        for (let i = 0; i < k; i++) {
          const upper = i === k - 1 ? max : currentLower + amplitude;
          calculatedClasses.push({
            lower: currentLower,
            upper: upper,
            frequency: 0
          });
          currentLower = upper;
        }
        
        setNumClasses(k);
        setClasses(calculatedClasses);
      }
    }
  }, [dataPoints, inputMethod]);

  const handleNumDataChange = (e) => {
    const num = parseInt(e.target.value) || 0;
    setNumDataPoints(num);
    setDataPoints(Array(num).fill(''));
  };

  const handleDataChange = (index, value) => {
    const newDataPoints = [...dataPoints];
    newDataPoints[index] = value === '' ? '' : parseFloat(value);
    setDataPoints(newDataPoints);
  };

  const handleClassChange = (index, field, value) => {
    const newClasses = [...classes];
    newClasses[index] = {
      ...newClasses[index],
      [field]: field === 'frequency' ? parseInt(value) || 0 : parseFloat(value) || 0
    };
    setClasses(newClasses);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (inputMethod === 'manual') {
      const cleanData = dataPoints.filter(val => val !== '');
      if (cleanData.length === 0) return;
      
      const min = Math.min(...cleanData);
      const max = Math.max(...cleanData);
      const range = max - min;
      const k = classes.length;
      const amplitude = range / k;
      
      const updatedClasses = classes.map(cls => {
        const frequency = cleanData.filter(
          val => val >= cls.lower && (val < cls.upper || (val === max && val === cls.upper))
        ).length;
        return { ...cls, frequency };
      });
      
      onDataSubmit({
        type: 'grouped',
        data: updatedClasses,
        stats: {
          numDataPoints: cleanData.length,
          min,
          max,
          range,
          k,
          amplitude
        }
      });
    } else {
      const validClasses = classes.filter(
        cls => !isNaN(cls.lower) && !isNaN(cls.upper) && !isNaN(cls.frequency)
      );
      
      if (validClasses.length === 0) return;
      
      const totalData = validClasses.reduce((sum, cls) => sum + cls.frequency, 0);
      const min = validClasses[0].lower;
      const max = validClasses[validClasses.length - 1].upper;
      const range = max - min;
      const k = validClasses.length;
      const amplitude = validClasses[0].upper - validClasses[0].lower;
      
      onDataSubmit({
        type: 'grouped',
        data: validClasses,
        stats: {
          numDataPoints: totalData,
          min,
          max,
          range,
          k,
          amplitude
        }
      });
    }
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
                  value={dataPoints[index] || ''}
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

  const renderClassInputs = () => {
    return classes.map((cls, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>
          <input
            type="number"
            step="any"
            value={cls.lower}
            onChange={(e) => handleClassChange(index, 'lower', e.target.value)}
            disabled={inputMethod === 'manual'}
          />
        </td>
        <td>
          <input
            type="number"
            step="any"
            value={cls.upper}
            onChange={(e) => handleClassChange(index, 'upper', e.target.value)}
            disabled={inputMethod === 'manual'}
          />
        </td>
        <td>{((cls.lower + cls.upper) / 2).toFixed(4)}</td>
        <td>
          <input
            type="number"
            min="0"
            value={cls.frequency}
            onChange={(e) => handleClassChange(index, 'frequency', e.target.value)}
          />
        </td>
      </tr>
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="grouped-form">
      <div className="input-method">
        <label>
          <input
            type="radio"
            name="inputMethod"
            checked={inputMethod === 'manual'}
            onChange={() => setInputMethod('manual')}
          />
          Ingresar datos manualmente
        </label>
        <label>
          <input
            type="radio"
            name="inputMethod"
            checked={inputMethod === 'classes'}
            onChange={() => setInputMethod('classes')}
          />
          Ingresar clases directamente
        </label>
      </div>

      {inputMethod === 'manual' ? (
        <>
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
        </>
      ) : (
        <div className="form-group">
          <label>Número de clases:</label>
          <input
            type="number"
            min="1"
            value={numClasses}
            onChange={(e) => setNumClasses(parseInt(e.target.value) || 0)}
          />
          <button 
            type="button" 
            onClick={() => setClasses(Array(numClasses).fill({ lower: 0, upper: 0, frequency: 0 }))}
          >
            Generar Clases
          </button>
        </div>
      )}

      {classes.length > 0 && (
        <div className="classes-table">
          <h3>Tabla de Clases</h3>
          <table>
            <thead>
              <tr>
                <th>Clase</th>
                <th>Límite Inferior</th>
                <th>Límite Superior</th>
                <th>Marca de Clase</th>
                <th>Frecuencia</th>
              </tr>
            </thead>
            <tbody>
              {renderClassInputs()}
            </tbody>
          </table>
        </div>
      )}

      <button type="submit" disabled={classes.length === 0}>
        Calcular Estadísticas
      </button>
    </form>
  );
};

export default GroupedDataInput;