import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist-min';

const BoxPlot = ({ data, title }) => {
  const plotRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setIsInitialized(true);
    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isInitialized || !data || !data.length) return;
    
    // Calcular estadísticas para mostrar
    const sortedData = [...data].sort((a, b) => a - b);
    const n = sortedData.length;
    
    const xmin = Math.min(...sortedData);
    const xmax = Math.max(...sortedData);
    
    // Calcular cuartiles
    const median = (arr) => {
      const mid = Math.floor(arr.length / 2);
      return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
    };
    
    const q1 = median(sortedData.slice(0, Math.floor(n / 2)));
    const q2 = median(sortedData);
    const q3 = median(sortedData.slice(Math.ceil(n / 2)));
    
    setStats({ xmin, q1, q2, q3, xmax });

    // Limpiar cualquier gráfico existente
    if (plotRef.current) {
      Plotly.purge(plotRef.current);
    }

    const plotData = [{
      type: 'box',
      y: data,
      name: title,
      boxpoints: 'all',
      jitter: 0.3,
      pointpos: -1.8,
      marker: {
        size: 4,
        color: 'rgb(75, 192, 192)'
      },
      line: {
        width: 1
      },
      boxmean: true
    }];

    const layout = {
      title: title,
      margin: { t: 40, b: 30, l: 40, r: 10 },
      showlegend: false,
      yaxis: {
        gridcolor: 'rgba(0,0,0,0.05)'
      },
      annotations: [
        {
          x: 0.5,
          y: xmin,
          xref: 'paper',
          yref: 'y',
          text: `Mín: ${xmin.toFixed(4)}`,
          showarrow: true,
          arrowhead: 0,
          ax: 0,
          ay: 20
        },
        {
          x: 0.5,
          y: q1,
          xref: 'paper',
          yref: 'y',
          text: `Q1: ${q1.toFixed(4)}`,
          showarrow: true,
          arrowhead: 0,
          ax: 0,
          ay: 20
        },
        {
          x: 0.5,
          y: q2,
          xref: 'paper',
          yref: 'y',
          text: `Q2: ${q2.toFixed(4)}`,
          showarrow: true,
          arrowhead: 0,
          ax: 0,
          ay: 20
        },
        {
          x: 0.5,
          y: q3,
          xref: 'paper',
          yref: 'y',
          text: `Q3: ${q3.toFixed(4)}`,
          showarrow: true,
          arrowhead: 0,
          ax: 0,
          ay: 20
        },
        {
          x: 0.5,
          y: xmax,
          xref: 'paper',
          yref: 'y',
          text: `Máx: ${xmax.toFixed(4)}`,
          showarrow: true,
          arrowhead: 0,
          ax: 0,
          ay: -20
        }
      ]
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false
    };

    Plotly.newPlot(plotRef.current, plotData, layout, config);

    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
    };
  }, [data, title, isInitialized]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div ref={plotRef} style={{ width: '100%', height: '400px' }} />
      {stats && (
        <div style={{ 
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '5px',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap'
        }}>
          <div><strong>Mínimo:</strong> {stats.xmin.toFixed(4)}</div>
          <div><strong>Q1:</strong> {stats.q1.toFixed(4)}</div>
          <div><strong>Mediana (Q2):</strong> {stats.q2.toFixed(4)}</div>
          <div><strong>Q3:</strong> {stats.q3.toFixed(4)}</div>
          <div><strong>Máximo:</strong> {stats.xmax.toFixed(4)}</div>
        </div>
      )}
    </div>
  );
};

export default BoxPlot;