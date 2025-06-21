import XRCharts from './XRCharts';

const XRChartResults = ({ data }) => {
  if (!data || !data.controlLimits || data.controlLimits.length === 0) {
    return <div>Ingrese datos y calcule los límites de control</div>;
  }

  return (
    <div className="xr-chart-results">
      <h3>Resultados de Gráficos de Control</h3>

      {data.message && (
        <div className="warning-message">
          <p>{data.message}</p>
        </div>
      )}

      <div className="constants-info">
        <h4>Constantes Utilizadas (n = {data.controlLimits[0]?.R_value !== undefined ? data.controlLimits.length : 'N/A'})</h4>
        <p>A₂ = {data.constants.A2.toFixed(3)}</p>
        <p>D₃ = {data.constants.D3.toFixed(3)}</p>
        <p>D₄ = {data.constants.D4.toFixed(3)}</p>
      </div>
      
      <div className="control-limits-table">
        <table>
          <thead>
            <tr>
              <th rowSpan="2">Muestra</th>
              <th colSpan="4">Gráfica X̄</th>
              <th colSpan="4">Gráfica R</th>
            </tr>
            <tr>
              <th>Media (X̄)</th>
              <th>LC</th>
              <th>LCS</th>
              <th>LCI</th>
              <th>Rango (R)</th>
              <th>LC</th>
              <th>LCS</th>
              <th>LCI</th>
            </tr>
          </thead>
          <tbody>
            {data.controlLimits.map((limits, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{limits.X_mean.toFixed(3)}</td>
                <td>{limits.X_LC.toFixed(3)}</td>
                <td>{limits.X_LCS.toFixed(3)}</td>
                <td>{limits.X_LCI.toFixed(3)}</td>
                <td>{limits.R_value.toFixed(3)}</td>
                <td>{limits.R_LC.toFixed(3)}</td>
                <td>{limits.R_LCS.toFixed(3)}</td>
                <td>{limits.R_LCI.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="averages">
        <h4>Promedios Generales</h4>
        <p>Media de las medias (X̄̄): {data.averages.X_double_bar.toFixed(3)}</p>
        <p>Media de los rangos (R̄): {data.averages.R_bar.toFixed(3)}</p>
      </div>
      <XRCharts data={data} />
    </div>
  );
};

export default XRChartResults;