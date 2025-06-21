//components/StatsResults.js
import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import BoxPlot from './BoxPlot';

const StatsResults = ({ data }) => {
  const histFreqRef = useRef(null);
  const histFreqAcumRef = useRef(null);
  const histFreqRelRef = useRef(null);
  const histFreqRelAcumRef = useRef(null);
  const freqPolygonRef = useRef(null);

  // Función para interpretar el coeficiente de asimetría
  const interpretSkewness = (skewness) => {
    const absSkew = Math.abs(skewness);
    if (absSkew < 0.5) {
      return "La distribución es aproximadamente simétrica";
    } else if (absSkew >= 0.5 && absSkew < 1) {
      return skewness > 0 
        ? "La distribución presenta una asimetría moderada positiva" 
        : "La distribución presenta una asimetría moderada negativa";
    } else {
      return skewness > 0 
        ? "La distribución presenta una asimetría fuerte positiva" 
        : "La distribución presenta una asimetría fuerte negativa";
    }
  };

  // Función para interpretar la curtosis
  const interpretKurtosis = (kurtosis) => {
    if (kurtosis > 0.5) {
      return "Distribución leptocúrtica (más puntiaguda que la normal)";
    } else if (kurtosis < -0.5) {
      return "Distribución platicúrtica (más aplanada que la normal)";
    } else {
      return "Distribución mesocúrtica (similar a la normal en curtosis)";
    }
  };

  // Función para calcular estadísticas de datos no agrupados
  const calculateUngroupedStats = (dataArray) => {
    const sortedData = [...dataArray].sort((a, b) => a - b);
    const n = sortedData.length;
    
    // Medidas de tendencia central
    const mean = sortedData.reduce((a, b) => a + b, 0) / n;
    const median = n % 2 === 0 
      ? (sortedData[n/2 - 1] + sortedData[n/2]) / 2 
      : sortedData[Math.floor(n/2)];
    
    // Moda
    const frequencyMap = {};
    sortedData.forEach(num => {
      frequencyMap[num] = (frequencyMap[num] || 0) + 1;
    });
    let modes = [];
    let maxFrequency = 0;
    for (const num in frequencyMap) {
      if (frequencyMap[num] > maxFrequency) {
        modes = [parseFloat(num)];
        maxFrequency = frequencyMap[num];
      } else if (frequencyMap[num] === maxFrequency) {
        modes.push(parseFloat(num));
      }
    }
    const mode = modes.length === 1 ? modes[0] : modes;

    // Medidas de dispersión
    const min = Math.min(...sortedData);
    const max = Math.max(...sortedData);
    const range = max - min;
    
    // Varianzas y desviaciones
    const populationVariance = sortedData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const sampleVariance = sortedData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
    const populationStdDev = Math.sqrt(populationVariance);
    const sampleStdDev = Math.sqrt(sampleVariance);

    // Medidas de forma
    const skewness = calculateSkewness(sortedData, mean, populationStdDev, n);
    const kurtosis = calculateKurtosis(sortedData, mean, populationStdDev, n);

    // Tabla de frecuencias
    const uniqueValues = [...new Set(sortedData)].sort((a, b) => a - b);
    let cumulativeFreq = 0;
    const frequencyTable = uniqueValues.map(value => {
      const freq = frequencyMap[value];
      cumulativeFreq += freq;
      return {
        value,
        frequency: freq,
        cumulativeFrequency: cumulativeFreq,
        relativeFrequency: freq / n,
        relativeCumulativeFrequency: cumulativeFreq / n
      };
    });

    return { 
      mean, median, mode, 
      populationVariance, sampleVariance, 
      populationStdDev, sampleStdDev,
      min, max, range,
      skewness, kurtosis,
      frequencyTable,
      totalData: n
    };
  };

  // Función para calcular asimetría
  const calculateSkewness = (data, mean, stdDev, n) => {
    if (stdDev === 0) return 0;
    const cubedDeviations = data.reduce((sum, x) => sum + Math.pow(x - mean, 3), 0);
    return (cubedDeviations / n) / Math.pow(stdDev, 3);
  };

  // Función para calcular curtosis
  const calculateKurtosis = (data, mean, stdDev, n) => {
    if (stdDev === 0) return 0;
    const fourthDeviations = data.reduce((sum, x) => sum + Math.pow(x - mean, 4), 0);
    return (fourthDeviations / n) / Math.pow(stdDev, 4) - 3;
  };

  // Función para calcular estadísticas de datos agrupados
  const calculateGroupedStats = (intervals) => {
    const classMarks = intervals.map(interval => (interval.lower + interval.upper) / 2);
    const frequencies = intervals.map(interval => interval.frequency);
    const products = classMarks.map((mark, i) => mark * frequencies[i]);
    
    const totalFreq = frequencies.reduce((a, b) => a + b, 0);
    const totalProduct = products.reduce((a, b) => a + b, 0);
    
    const mean = totalProduct / totalFreq;
    
    let cumulativeFreq = 0;
    const medianClassIndex = intervals.findIndex(interval => {
      cumulativeFreq += interval.frequency;
      return cumulativeFreq >= totalFreq / 2;
    });
    const medianClass = intervals[medianClassIndex];
    const F = cumulativeFreq - medianClass.frequency;
    const f = medianClass.frequency;
    const L = medianClass.lower;
    const c = medianClass.upper - medianClass.lower;
    const median = L + ((totalFreq/2 - F) / f) * c;
    
    const maxFreqIndex = frequencies.indexOf(Math.max(...frequencies));
    const modalClass = intervals[maxFreqIndex];
    const d1 = modalClass.frequency - (intervals[maxFreqIndex-1]?.frequency || 0);
    const d2 = modalClass.frequency - (intervals[maxFreqIndex+1]?.frequency || 0);
    const Lmodal = modalClass.lower;
    const mode = Lmodal + (d1 / (d1 + d2)) * c;
    
    const squaredDeviations = classMarks.map((mark, i) => 
      Math.pow(mark - mean, 2) * frequencies[i]
    );
    const totalSquaredDeviations = squaredDeviations.reduce((a, b) => a + b, 0);
    
    const populationVariance = totalSquaredDeviations / totalFreq;
    const sampleVariance = totalSquaredDeviations / (totalFreq - 1);
    const populationStdDev = Math.sqrt(populationVariance);
    const sampleStdDev = Math.sqrt(sampleVariance);
    
    const cubedDeviations = classMarks.map((mark, i) => 
      Math.pow(mark - mean, 3) * frequencies[i]
    );
    const totalCubedDeviations = cubedDeviations.reduce((a, b) => a + b, 0);
    const skewness = (totalCubedDeviations / totalFreq) / Math.pow(populationStdDev, 3);
    
    const fourthDeviations = classMarks.map((mark, i) => 
      Math.pow(mark - mean, 4) * frequencies[i]
    );
    const totalFourthDeviations = fourthDeviations.reduce((a, b) => a + b, 0);
    const kurtosis = (totalFourthDeviations / totalFreq) / Math.pow(populationStdDev, 4) - 3;
    
    const minValue = intervals[0].lower;
    const maxValue = intervals[intervals.length - 1].upper;
    const range = maxValue - minValue;
    const k = intervals.length;
    const amplitude = range / Math.round(k);
    
    let cumFreq = 0;
    const groupedFrequencyTable = intervals.map((interval, i) => {
      cumFreq += interval.frequency;
      return {
        class: `${interval.lower} - ${interval.upper}`,
        lower: interval.lower,
        upper: interval.upper,
        classMark: classMarks[i],
        frequency: interval.frequency,
        cumulativeFrequency: cumFreq,
        relativeFrequency: interval.frequency / totalFreq,
        relativeCumulativeFrequency: cumFreq / totalFreq,
        product: products[i]
      };
    });

    return { 
      mean, median, mode,
      populationVariance, sampleVariance,
      populationStdDev, sampleStdDev,
      skewness, kurtosis,
      minValue, maxValue, range, k, amplitude,
      frequencyTable: groupedFrequencyTable,
      totalData: totalFreq
    };
  };

  useEffect(() => {
    if (!data || !data.data || data.data.length === 0) return;

    const destroyCharts = () => {
      Chart.getChart(histFreqRef.current)?.destroy();
      Chart.getChart(histFreqAcumRef.current)?.destroy();
      Chart.getChart(histFreqRelRef.current)?.destroy();
      Chart.getChart(histFreqRelAcumRef.current)?.destroy();
      Chart.getChart(freqPolygonRef.current)?.destroy();
    };

    destroyCharts();

    let frequencyData, labels, classMarks;
    if (data.type === 'ungrouped') {
      const frequencyMap = {};
      data.data.forEach(num => {
        frequencyMap[num] = (frequencyMap[num] || 0) + 1;
      });
      
      labels = Object.keys(frequencyMap).sort((a, b) => a - b);
      frequencyData = labels.map(key => frequencyMap[key]);
      classMarks = labels.map(Number);
    } else {
      labels = data.data.map(item => item.class);
      frequencyData = data.data.map(item => item.frequency);
      classMarks = data.data.map(item => (item.lower + item.upper) / 2);
    }

    let cumulative = 0;
    const freqAcumData = frequencyData.map(freq => {
      cumulative += freq;
      return cumulative;
    });

    const total = data.type === 'ungrouped' ? data.data.length : 
                 data.type === 'grouped' ? data.stats.numDataPoints : 0;

    const freqRelData = frequencyData.map(freq => (freq / total));
    let relCumulative = 0;
    const freqRelAcumData = freqRelData.map(relFreq => {
      relCumulative += relFreq;
      return relCumulative;
    });

    const histConfig = {
      type: 'bar',
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    new Chart(histFreqRef.current.getContext('2d'), {
      ...histConfig,
      data: {
        labels,
        datasets: [{
          data: frequencyData,
          backgroundColor: 'rgba(54, 162, 235, 0.7)'
        }]
      },
      options: {
        ...histConfig.options,
        plugins: {
          title: {
            display: true,
            text: 'Histograma de Frecuencia'
          }
        }
      }
    });

    new Chart(histFreqAcumRef.current.getContext('2d'), {
      ...histConfig,
      data: {
        labels,
        datasets: [{
          data: freqAcumData,
          backgroundColor: 'rgba(75, 192, 192, 0.7)'
        }]
      },
      options: {
        ...histConfig.options,
        plugins: {
          title: {
            display: true,
            text: 'Histograma de Frecuencia Acumulada'
          }
        }
      }
    });

    new Chart(histFreqRelRef.current.getContext('2d'), {
      ...histConfig,
      data: {
        labels,
        datasets: [{
          data: freqRelData,
          backgroundColor: 'rgba(255, 159, 64, 0.7)'
        }]
      },
      options: {
        ...histConfig.options,
        plugins: {
          title: {
            display: true,
            text: 'Histograma de Frecuencia Relativa'
          }
        },
        scales: {
          y: {
            max: 1
          }
        }
      }
    });

    new Chart(histFreqRelAcumRef.current.getContext('2d'), {
      ...histConfig,
      data: {
        labels,
        datasets: [{
          data: freqRelAcumData,
          backgroundColor: 'rgba(153, 102, 255, 0.7)'
        }]
      },
      options: {
        ...histConfig.options,
        plugins: {
          title: {
            display: true,
            text: 'Histograma de Frecuencia Relativa Acumulada'
          }
        },
        scales: {
          y: {
            max: 1
          }
        }
      }
    });

    new Chart(freqPolygonRef.current.getContext('2d'), {
      type: 'line',
      data: {
        labels: data.type === 'ungrouped' ? labels : classMarks.map(mark => mark.toFixed(2)),
        datasets: [{
          label: 'Polígono de Frecuencias',
          data: frequencyData,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          tension: 0.1,
          fill: false,
          pointBackgroundColor: 'rgba(75, 192, 192, 1)',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Polígono de Frecuencias',
            font: {
              size: 16
            }
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Frecuencia: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Frecuencia'
            }
          },
          x: {
            title: {
              display: true,
              text: data.type === 'ungrouped' ? 'Valores' : 'Marcas de Clase'
            }
          }
        }
      }
    });

    return destroyCharts;
  }, [data]);

  function calculateBoxPlotData(groupedData) {
    const allValues = [];
    groupedData.forEach(group => {
      const midpoint = (group.lower + group.upper) / 2;
      for (let i = 0; i < group.frequency; i++) {
        allValues.push(midpoint);
      }
    });
    return allValues.sort((a, b) => a - b);
  }

  if (!data || !data.data || data.data.length === 0) {
    return <div>Ingresa datos para calcular estadísticas</div>;
  }

  const stats = data.type === 'ungrouped' 
    ? calculateUngroupedStats(data.data)
    : calculateGroupedStats(data.data);

  const boxPlotData = data.type === 'ungrouped' 
    ? data.data 
    : calculateBoxPlotData(data.data);

  return (
    <div className="stats-results">
      <h2>Resultados Estadísticos ({data.type === 'ungrouped' ? 'No Agrupados' : 'Agrupados'})</h2>
      
      <div className="frequency-table">
        <h3>Tabla de Frecuencias</h3>
        <table>
          <thead>
            <tr>
              {data.type === 'ungrouped' ? (
                <>
                  <th>Valor (xᵢ)</th>
                  <th>Frecuencia (fᵢ)</th>
                  <th>Frec. Acumulada (Fᵢ)</th>
                  <th>Frec. Relativa (frᵢ)</th>
                  <th>Frec. Rel. Acumulada (Frᵢ)</th>
                </>
              ) : (
                <>
                  <th>Clase</th>
                  <th>Lím. Inferior</th>
                  <th>Lím. Superior</th>
                  <th>Marca de Clase (xᵢ)</th>
                  <th>Frecuencia (fᵢ)</th>
                  <th>Frec. Acumulada (Fᵢ)</th>
                  <th>Frec. Relativa (frᵢ)</th>
                  <th>Frec. Rel. Acumulada (Frᵢ)</th>
                  <th>Producto (xᵢfᵢ)</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {stats.frequencyTable.map((row, i) => (
              <tr key={i}>
                {data.type === 'ungrouped' ? (
                  <>
                    <td>{row.value}</td>
                    <td>{row.frequency}</td>
                    <td>{row.cumulativeFrequency}</td>
                    <td>{row.relativeFrequency.toFixed(4)}</td>
                    <td>{row.relativeCumulativeFrequency.toFixed(4)}</td>
                  </>
                ) : (
                  <>
                    <td>{row.class}</td>
                    <td>{row.lower.toFixed(4)}</td>
                    <td>{row.upper.toFixed(4)}</td>
                    <td>{row.classMark.toFixed(4)}</td>
                    <td>{row.frequency}</td>
                    <td>{row.cumulativeFrequency}</td>
                    <td>{row.relativeFrequency.toFixed(4)}</td>
                    <td>{row.relativeCumulativeFrequency.toFixed(4)}</td>
                    <td>{row.product.toFixed(4)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <p>Total de datos: {stats.totalData}</p>
      </div>

      <div className="stats-values">
        <h3>Medidas Estadísticas</h3>
        
        {data.type === 'grouped' && (
          <div className="grouped-stats">
            <h4>Datos Básicos</h4>
            <p>Valor mínimo: {stats.minValue}</p>
            <p>Valor máximo: {stats.maxValue}</p>
            <p>Rango: {stats.range.toFixed(4)}</p>
            <p>Número de clases (k): {stats.k}</p>
            <p>Amplitud: {stats.amplitude.toFixed(4)}</p>
          </div>
        )}

        <h4>Medidas de Tendencia Central</h4>
        <p>Media: {stats.mean.toFixed(4)}</p>
        <p>Mediana: {stats.median.toFixed(4)}</p>
        <p>Moda: {Array.isArray(stats.mode) ? stats.mode.join(', ') : stats.mode.toFixed(4)}</p>
        
        <h4>Medidas de Dispersión</h4>
        <p>Varianza Poblacional: {stats.populationVariance.toFixed(4)}</p>
        <p>Varianza Muestral: {stats.sampleVariance.toFixed(4)}</p>
        <p>Desviación Estándar Poblacional: {stats.populationStdDev.toFixed(4)}</p>
        <p>Desviación Estándar Muestral: {stats.sampleStdDev.toFixed(4)}</p>
        
        {data.type === 'ungrouped' && (
          <>
            <p>Mínimo: {stats.min}</p>
            <p>Máximo: {stats.max}</p>
            <p>Rango: {stats.range}</p>
          </>
        )}
      </div>

      <div className="visualizations">
        <h3>Visualizaciones Estadísticas</h3>
        
        <div className="histograms-grid">
          <div className="chart-container">
            <canvas ref={histFreqRef} />
          </div>
          <div className="chart-container">
            <canvas ref={histFreqAcumRef} />
          </div>
          <div className="chart-container">
            <canvas ref={histFreqRelRef} />
          </div>
          <div className="chart-container">
            <canvas ref={histFreqRelAcumRef} />
          </div>
        </div>
        
        <div className="boxplot-container">
          <h4>Diagrama de Bigotes</h4>
          <BoxPlot 
            data={boxPlotData} 
            title={data.type === 'ungrouped' 
              ? 'Diagrama de Bigotes (Datos No Agrupados)' 
              : 'Diagrama de Bigotes (Datos Agrupados)'} 
          />
        </div>
        
        <div className="frequency-polygon-container">
          <h3>Medidas de Forma</h3>
            <div style={{ width: '100%', height: '400px' }}>
              <canvas ref={freqPolygonRef} />
            </div>
        <div className="shape-measures">
          <div className="measure-card">
            <h5>Coeficiente de Asimetría (Skewness)</h5>
            <p className="measure-value">{stats.skewness.toFixed(4)}</p>
            <p className="measure-interpretation">
              {interpretSkewness(stats.skewness)}
              {stats.skewness > 0 && " (Cola más larga hacia la derecha)"}
              {stats.skewness < 0 && " (Cola más larga hacia la izquierda)"}
            </p>
            <div className="measure-description">
              <p>El coeficiente de asimetría mide la falta de simetría en la distribución:</p>
              <ul>
                <li>Valor 0: Distribución perfectamente simétrica</li>
                <li>Valor positivo: Cola más larga hacia valores altos</li>
                <li>Valor negativo: Cola más larga hacia valores bajos</li>
              </ul>
            </div>
          </div>

          <div className="measure-card">
            <h5>Curtosis</h5>
            <p className="measure-value">{stats.kurtosis.toFixed(4)}</p>
            <p className="measure-interpretation">
              {interpretKurtosis(stats.kurtosis)}
            </p>
            <div className="measure-description">
              <p>La curtosis mide el grado de concentración de los datos:</p>
              <ul>
                <li>Valor 0: Similar a la distribución normal</li>
                <li>Valor positivo: Datos más concentrados (picos más altos)</li>
                <li>Valor negativo: Datos menos concentrados (picos más bajos)</li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default StatsResults;