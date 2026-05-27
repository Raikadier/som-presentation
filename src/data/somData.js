// SOM 2x2 Neurons after training
export const neurons = [
  {
    id: 'N1',
    grid: [0, 0],
    weights: [0.15, 0.20],
    label: 'A',
    color: '#10b981',
    position3d: [-2, 2, 0],
  },
  {
    id: 'N2',
    grid: [1, 0],
    weights: [0.80, 0.85],
    label: 'B',
    color: '#f43f5e',
    position3d: [2, 2, 0],
  },
  {
    id: 'N3',
    grid: [0, 1],
    weights: [0.55, 0.45],
    label: 'B',
    color: '#f43f5e',
    position3d: [-2, -2, 0],
    note: 'Tie → B',
  },
  {
    id: 'N4',
    grid: [1, 1],
    weights: [0.30, 0.60],
    label: null,
    color: '#475569',
    position3d: [2, -2, 0],
    isDead: true,
  },
]

// Sample data
export const samples = [
  { id: 'm1', x1: 0.1, x2: 0.2, class: 'A', bmu: 'N1', dist: 0.050, correct: true },
  { id: 'm2', x1: 0.2, x2: 0.1, class: 'A', bmu: 'N1', dist: 0.112, correct: true },
  { id: 'm3', x1: 0.1, x2: 0.3, class: 'A', bmu: 'N1', dist: 0.112, correct: true },
  { id: 'm4', x1: 0.8, x2: 0.9, class: 'B', bmu: 'N2', dist: 0.050, correct: true },
  { id: 'm5', x1: 0.9, x2: 0.8, class: 'B', bmu: 'N2', dist: 0.112, correct: true },
  { id: 'm6', x1: 0.7, x2: 0.9, class: 'B', bmu: 'N2', dist: 0.112, correct: true },
  { id: 'm7', x1: 0.5, x2: 0.5, class: 'A', bmu: 'N3', dist: 0.071, correct: false },
  { id: 'm8', x1: 0.6, x2: 0.4, class: 'B', bmu: 'N3', dist: 0.071, correct: true },
]

// Calculated metrics
export const QE = 0.086

export const purity = 0.875 // 87.5% = 7/8

// Entropy per neuron
export const neuronEntropy = {
  N1: 0,
  N2: 0,
  N3: 1.0,
  N4: null, // dead
}

// Confusion Matrix
// Rows = Real class, Cols = Predicted class
// [Real A vs Pred A, Real A vs Pred B]
// [Real B vs Pred A, Real B vs Pred B]
export const confusionMatrix = {
  TP: 3, // Real A → Pred A (VP)
  FN: 1, // Real A → Pred B (FN) — m7
  FP: 0, // Real B → Pred A (FP)
  TN: 4, // Real B → Pred B (VN)
}

export const metrics = {
  accuracy: 0.875,
  precisionA: 1.00,
  recallA: 0.75,
  f1A: 0.857,
  precisionB: 0.80,
  recallB: 1.00,
  f1B: 0.889,
  f1Avg: 0.873,
  purity: 0.875,
  qe: 0.086,
}

// Neuron adjacency (for Topographic Error)
export const adjacentPairs = [
  ['N1', 'N2'], // horizontal
  ['N1', 'N3'], // vertical
  ['N2', 'N4'], // vertical
  ['N3', 'N4'], // horizontal
]

// Non-adjacent (diagonal)
export const nonAdjacentPairs = [
  ['N1', 'N4'],
  ['N2', 'N3'],
]

// Samples per neuron
export const neuronSamples = {
  N1: ['m1', 'm2', 'm3'],
  N2: ['m4', 'm5', 'm6'],
  N3: ['m7', 'm8'],
  N4: [],
}

// Distance calculations for QE step by step
export const distanceCalcs = samples.map(s => {
  const n = neurons.find(n => n.id === s.bmu)
  return {
    sample: s.id,
    neuron: s.bmu,
    formula: `√[(${s.x1}−${n.weights[0]})² + (${s.x2}−${n.weights[1]})²]`,
    result: s.dist,
  }
})
