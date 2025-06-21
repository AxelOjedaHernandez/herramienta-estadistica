//components/utils/statsUtils.js
export const calculateSturges = (n) => {
  return Math.ceil(1 + (3.3 * Math.log10(n)));
};

export const calculateGroupedStats = (classes, stats) => {
  const classMarks = classes.map(cls => (cls.lower + cls.upper) / 2);
  const frequencies = classes.map(cls => cls.frequency);
  const totalFreq = frequencies.reduce((a, b) => a + b, 0);
  
  const mean = classMarks.reduce((sum, mark, i) => sum + (mark * frequencies[i]), 0) / totalFreq;
  
  let cumulativeFreq = 0;
  const medianClassIndex = classes.findIndex(cls => {
    cumulativeFreq += cls.frequency;
    return cumulativeFreq >= totalFreq / 2;
  });
  const medianClass = classes[medianClassIndex];
  const F = cumulativeFreq - medianClass.frequency;
  const f = medianClass.frequency;
  const L = medianClass.lower;
  const c = medianClass.upper - medianClass.lower;
  const median = L + ((totalFreq/2 - F) / f) * c;
  
  const maxFreqIndex = frequencies.indexOf(Math.max(...frequencies));
  const modalClass = classes[maxFreqIndex];
  const d1 = modalClass.frequency - (classes[maxFreqIndex-1]?.frequency || 0);
  const d2 = modalClass.frequency - (classes[maxFreqIndex+1]?.frequency || 0);
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
  
  let cumFreq = 0;
  const frequencyTable = classes.map((cls, i) => {
    cumFreq += cls.frequency;
    return {
      class: `${cls.lower} - ${cls.upper}`,
      lower: cls.lower,
      upper: cls.upper,
      classMark: classMarks[i],
      frequency: cls.frequency,
      cumulativeFrequency: cumFreq,
      relativeFrequency: cls.frequency / totalFreq,
      relativeCumulativeFrequency: cumFreq / totalFreq,
      product: classMarks[i] * cls.frequency
    };
  });

   return {
    ...stats,
    mean,
    median,
    mode: Array.isArray(mode) ? mode : mode,
    populationVariance,
    sampleVariance,
    populationStdDev,
    sampleStdDev,
    frequencyTable
  };
};