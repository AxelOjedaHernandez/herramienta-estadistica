import React from 'react';
import { Chart } from 'chart.js/auto';

class XRCharts extends React.Component {
  chartRefX = React.createRef();
  chartRefR = React.createRef();
  
  componentDidMount() {
    this.renderCharts();
  }
  
  componentDidUpdate() {
    this.renderCharts();
  }

  renderCharts() {
    const { controlLimits, averages } = this.props.data;
    
    if (!controlLimits || controlLimits.length === 0) return;
    
    // Preparar datos para los gráficos
    const samples = controlLimits.map((_, i) => i + 1);
    const xValues = controlLimits.map(item => item.X_mean);
    const rValues = controlLimits.map(item => item.R_value);
    
    // Configuración común
    const commonOptions = {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Número de Muestra'
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.raw.toFixed(3)}`;
            }
          }
        }
      }
    };

    // Destruir gráficos anteriores si existen
    if (this.chartX) this.chartX.destroy();
    if (this.chartR) this.chartR.destroy();
    
    // Gráfico X
    const ctxX = this.chartRefX.current.getContext('2d');
    this.chartX = new Chart(ctxX, {
      type: 'line',
      data: {
        labels: samples,
        datasets: [
          {
            label: 'Media (X̄)',
            data: xValues,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            pointRadius: 5,
            pointHoverRadius: 7
          },
          {
            label: 'Línea Central (LC)',
            data: Array(samples.length).fill(averages.X_double_bar),
            borderColor: 'rgb(54, 162, 235)',
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 0
          },
          {
            label: 'Límite Superior (LCS)',
            data: Array(samples.length).fill(controlLimits[0].X_LCS),
            borderColor: 'rgb(255, 99, 132)',
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 0
          },
          {
            label: 'Límite Inferior (LCI)',
            data: Array(samples.length).fill(controlLimits[0].X_LCI),
            borderColor: 'rgb(153, 102, 255)',
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 0
          }
        ]
      },
      options: {
        ...commonOptions,
        scales: {
          ...commonOptions.scales,
          y: {
            title: {
              display: true,
              text: 'Valor de X̄'
            }
          }
        }
      }
    });

    // Gráfico R
    const ctxR = this.chartRefR.current.getContext('2d');
    this.chartR = new Chart(ctxR, {
      type: 'line',
      data: {
        labels: samples,
        datasets: [
          {
            label: 'Rango (R)',
            data: rValues,
            borderColor: 'rgb(255, 159, 64)',
            backgroundColor: 'rgba(255, 159, 64, 0.5)',
            pointRadius: 5,
            pointHoverRadius: 7
          },
          {
            label: 'Línea Central (LC)',
            data: Array(samples.length).fill(averages.R_bar),
            borderColor: 'rgb(54, 162, 235)',
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 0
          },
          {
            label: 'Límite Superior (LCS)',
            data: Array(samples.length).fill(controlLimits[0].R_LCS),
            borderColor: 'rgb(255, 99, 132)',
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 0
          },
          {
            label: 'Límite Inferior (LCI)',
            data: Array(samples.length).fill(controlLimits[0].R_LCI),
            borderColor: 'rgb(153, 102, 255)',
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 0
          }
        ]
      },
      options: {
        ...commonOptions,
        scales: {
          ...commonOptions.scales,
          y: {
            title: {
              display: true,
              text: 'Valor de R'
            }
          }
        }
      }
    });
  }

  componentWillUnmount() {
    if (this.chartX) this.chartX.destroy();
    if (this.chartR) this.chartR.destroy();
  }

  render() {
    return (
      <div className="xr-charts-container">
        <h3>Gráficos de Control</h3>
        <div className="charts-grid">
          <div className="chart-container">
            <h4>Gráfico X (Medias)</h4>
            <canvas ref={this.chartRefX} />
          </div>
          <div className="chart-container">
            <h4>Gráfico R (Rangos)</h4>
            <canvas ref={this.chartRefR} />
          </div>
        </div>
      </div>
    );
  }
}

export default XRCharts;