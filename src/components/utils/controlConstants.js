export const getControlConstants = (n) => {
  // Tabla completa de constantes para gráficos X-R
  const constantsTable = {
    2: { A2: 1.880, D3: 0, D4: 3.267 },
    3: { A2: 1.023, D3: 0, D4: 2.574 },
    4: { A2: 0.729, D3: 0, D4: 2.282 },
    5: { A2: 0.577, D3: 0, D4: 2.114 },
    6: { A2: 0.483, D3: 0, D4: 2.004 },
    7: { A2: 0.419, D3: 0.076, D4: 1.924 },
    8: { A2: 0.373, D3: 0.136, D4: 1.864 },
    9: { A2: 0.337, D3: 0.184, D4: 1.816 },
    10: { A2: 0.308, D3: 0.223, D4: 1.777 },
    // Podemos extender esta tabla según sea necesario
  };

  // Para n > 10 usamos aproximaciones
  if (n > 10 && n <= 20) {
    return {
      A2: 0.266, // Valor aproximado para n=11-20
      D3: Math.max(0, 0.26 - (n - 10) * 0.01), // Aproximación
      D4: 1.734 + (20 - n) * 0.003 // Aproximación
    };
  }

  // Si n no está en la tabla, devolvemos valores por defecto o mostramos error
  return constantsTable[n] || { 
    A2: 0.308, 
    D3: 0.223, 
    D4: 1.777,
    message: n > 20 ? 'Advertencia: n > 20, usando valores para n=10' : 'Valor no encontrado'
  };
};