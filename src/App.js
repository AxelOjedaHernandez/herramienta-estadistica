import { useState } from 'react';
import DataTabs from './components/DataTabs';
import StatsResults from './components/StatsResults';
import XRChartInput from './components/DataInput/XRChartInput';
import XRChartResults from './components/XRChartResults';
import './App.css';
import 'chart.js/auto';

function App() {
  const [activeModule, setActiveModule] = useState('stats');
  const [statsData, setStatsData] = useState(null);
  const [xrData, setXRData] = useState(null);

  return (
    <div className="App">
      <h1>Herramienta Estadística Integral</h1>
      
      <div className="module-selector">
        <button 
          className={activeModule === 'stats' ? 'active' : ''}
          onClick={() => setActiveModule('stats')}
        >
          Análisis Estadístico
        </button>
        <button 
          className={activeModule === 'xr' ? 'active' : ''}
          onClick={() => setActiveModule('xr')}
        >
          Gráficos X-R
        </button>
      </div>
      
      <div className="module-content">
        {activeModule === 'stats' ? (
          <>
            <DataTabs onDataSubmit={setStatsData} />
            {statsData && <StatsResults data={statsData} />}
          </>
        ) : (
          <>
            <XRChartInput onDataSubmit={setXRData} />
            {xrData && <XRChartResults data={xrData} />}
          </>
        )}
      </div>
    </div>
  );
}

export default App;