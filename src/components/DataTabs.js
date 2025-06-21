import { useState } from 'react';
import UngroupedDataInput from './DataInput/UngroupedDataInput';
import GroupedDataInput from './DataInput/GroupedDataInput';

const DataTabs = ({ onDataSubmit }) => {
  const [activeTab, setActiveTab] = useState('ungrouped');

  return (
    <div className="data-tabs">
      <div className="tab-buttons">
        <button 
          className={activeTab === 'ungrouped' ? 'active' : ''}
          onClick={() => setActiveTab('ungrouped')}
        >
          Datos No Agrupados
        </button>
        <button 
          className={activeTab === 'grouped' ? 'active' : ''}
          onClick={() => setActiveTab('grouped')}
        >
          Datos Agrupados
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'ungrouped' ? 
          <UngroupedDataInput onDataSubmit={onDataSubmit} /> : 
          <GroupedDataInput onDataSubmit={onDataSubmit} />
        }
      </div>
    </div>
  );
};

export default DataTabs;