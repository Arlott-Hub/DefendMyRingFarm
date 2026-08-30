// MutationData.ts
// Cada planta puede tener hasta 3 mutaciones activas a la vez (ver selects
// de mutación en el componente). Los % de mutaciones que compartan la misma
// stat se SUMAN entre sí y se aplican una sola vez (no se componen una sobre
// otra) — igual criterio que usamos para los niveles de mejora.

export interface MutationEffect {
  value: number;
  type: 'Percent' | 'PercentReduce';
}

export interface Mutation {
  name: string;
  color: string;
  chanceMultiply: number;
  stats: { [key: string]: MutationEffect };
}

export const MUTATIONS: { [key: string]: Mutation } = {
  Golden: {
    name: 'Golden',
    color: '#ffee07',
    chanceMultiply: 10,
    stats: {
      UnitHealth: { value: 0.25, type: 'Percent' },
      Damage: { value: 0.1, type: 'Percent' }
    }
  },
  Alien: {
    name: 'Alien',
    color: '#55ff7f',
    chanceMultiply: 8,
    stats: {
      Damage: { value: 0.5, type: 'Percent' }
    }
  },
  Shocked: {
    name: 'Shocked',
    color: '#fdff6b',
    chanceMultiply: 5,
    stats: {
      Damage: { value: 0.1, type: 'Percent' },
      Cooldown: { value: 0.1, type: 'PercentReduce' }
    }
  },
  Wet: {
    name: 'Wet',
    color: '#00aaff',
    chanceMultiply: 1.5,
    stats: {
      UnitHealth: { value: 0.1, type: 'Percent' }
    }
  },
  Undead: {
    name: 'Undead',
    color: '#4e6f44',
    chanceMultiply: 8,
    stats: {
      UnitHealth: { value: 0.1, type: 'Percent' },
      Damage: { value: 0.1, type: 'Percent' }
    }
  },
  Windstruck: {
    name: 'Windstruck',
    color: '#bababa',
    chanceMultiply: 2.25,
    stats: {
      WalkSpeed: { value: 0.1, type: 'Percent' },
      Cooldown: { value: 0.1, type: 'PercentReduce' }
    }
  },
  Bloodlit: {
    name: 'Bloodlit',
    color: '#b30000',
    chanceMultiply: 1, // Puedes ajustar este multiplicador según la probabilidad del juego
    stats: {
      Damage: { value: 0.15, type: 'Percent' },
      UnitHealth: { value: 0.1, type: 'Percent' }
    }
  },
};