// SeedsData.ts
// Data de plantas. Para agregar una nueva, copia un bloque dentro de SEEDS,
// cambia los valores y listo — no hay que tocar app.component.ts ni el html.
//
// CropHealth se ignora en toda la app aunque la incluyas acá.
// Solo se cargaron semillas de rareza Epic o superior (Epic, Legendary,
// Mythic, Divine, Celestial, Exclusive).

export interface RolledRange {
  min: number;
  max: number;
  lowerIsBetter?: boolean; // úsalo en stats donde un valor más bajo es mejor (ej. Cooldown)
}

export interface StatUpgrade {
  value: number;           // 0.15 = +15%
  type: 'Percent' | 'Flat';
}

export interface UpgradeInfo {
  cost: number;             // costo del primer nivel
  multiply: number;         // el costo se multiplica por esto en cada nivel siguiente
  stats: { [key: string]: StatUpgrade };
}

export interface Seed {
  name: string;
  rarity?: string;
  cost?: number;
  chance?: number;
  growTime?: number;
  water?: number;
  passive?: string;          // descripción corta de cómo ataca / su habilidad especial
  baseStats: { [key: string]: number };
  rolled: { [key: string]: RolledRange };
  upgrade?: UpgradeInfo;
}

// nombres en español para mostrar en el ledger, así el usuario sabe de qué stat se habla.
export const STAT_LABELS: { [key: string]: string } = {
  UnitHealth: 'Vida',
  Damage: 'Daño',
  Cooldown: 'Tiempo de recarga',
  Range: 'Alcance',
  WalkSpeed: 'Velocidad'
};

// color distintivo por rareza, usado en el selector y en la etiqueta de rareza.
export const RARITY_COLORS: { [key: string]: string } = {
  Epic: '#a78bfa',
  Legendary: '#fbbf24',
  Mythic: '#fb7185',
  Divine: '#38bdf8',
  Celestial: '#fde047',
  Exclusive: '#f472b6'
};

// peso de cada stat en la calificación final: Daño, Tiempo de recarga y
// Alcance pesan más (son las que definen qué tan letal es la unidad),
// Vida pesa un poco más que Velocidad, y Velocidad es lo que menos pesa.
export const STAT_WEIGHTS: { [key: string]: number } = {
  Damage: 2,
  Cooldown: 2,
  Range: 2,
  UnitHealth: 1,
  WalkSpeed: 0.5
};

// nivel mínimo y máximo que se pueden elegir en el selector de nivel
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 30;

// rango de reroll estándar que comparten todas las semillas (0.8–1.1 en
// Vida, 0.9–1.1 en el resto). Se reutiliza para no repetirlo 18 veces.
const STANDARD_ROLL = {
  UnitHealth: { min: 0.8, max: 1.1 } as RolledRange,
  Damage: { min: 0.9, max: 1.1 } as RolledRange,
  Cooldown: { min: 0.9, max: 1.1, lowerIsBetter: true } as RolledRange,
  Range: { min: 0.9, max: 1.1 } as RolledRange,
  WalkSpeed: { min: 0.9, max: 1.1 } as RolledRange
};

// bloque de mejora estándar (Vida +15%, Daño +15%) con costo propio.
function standardUpgrade(cost: number, damageValue = 0.15) {
  return {
    cost,
    multiply: 1.1,
    stats: {
      UnitHealth: { value: 0.15, type: 'Percent' as const },
      Damage: { value: damageValue, type: 'Percent' as const }
    }
  };
}

export const SEEDS: Seed[] = [
  {
    name: 'Pineapple',
    rarity: 'Epic',
    cost: 185000,
    chance: 50000,
    growTime: 200,
    water: 80,
    passive: 'Golpea un solo punto, no pega en área: rinde mejor contra un enemigo fuerte que contra grupos. Carga corta (0.25s), así que ataca casi de inmediato.',
    baseStats: { UnitHealth: 60, Damage: 175, Cooldown: 6, Range: 22, WalkSpeed: 5 },
    rolled: { ...STANDARD_ROLL },
    upgrade: standardUpgrade(750)
  },
  {
    name: 'Pumpkin',
    rarity: 'Epic',
    cost: 525000,
    chance: 135000,
    growTime: 260,
    water: 96,
    passive: 'No golpea directo: invoca hasta 4 Mini Pumpkins que pelean por su cuenta alrededor de la unidad. Es más generador de aliados que atacante, así que su propio Daño importa menos que en otras plantas.',
    baseStats: { UnitHealth: 65, Damage: 12, Cooldown: 12, Range: 18, WalkSpeed: 5 },
    rolled: { ...STANDARD_ROLL },
    upgrade: standardUpgrade(750)
  },
  {
    name: 'Coconut',
    rarity: 'Epic',
    cost: 300000,
    chance: 85000,
    growTime: 230,
    water: 92,
    passive: 'Golpea en línea recta hacia adelante: cualquier enemigo alineado frente a la unidad recibe el golpe. Sirve mejor contra filas de enemigos que avanzan por el mismo carril.',
    baseStats: { UnitHealth: 85, Damage: 35, Cooldown: 1, Range: 2, WalkSpeed: 3.75 },
    rolled: { ...STANDARD_ROLL },
    upgrade: standardUpgrade(750)
  },
  {
    name: 'Rose',
    rarity: 'Legendary',
    cost: 2000000,
    chance: 850000,
    growTime: 360,
    water: 115,
    passive: 'Golpea un solo punto sin alcanzar a los enemigos de al lado. Buena opción para eliminar objetivos puntuales rápido, floja contra oleadas grandes.',
    baseStats: { UnitHealth: 92, Damage: 45, Cooldown: 1, Range: 13, WalkSpeed: 5.5 },
    rolled: { ...STANDARD_ROLL },
    upgrade: standardUpgrade(3500)
  },
  {
    name: 'Banana',
    rarity: 'Legendary',
    cost: 4500000,
    chance: 1350000,
    growTime: 415,
    water: 135,
    passive: 'Ataca en un área grande alrededor del punto objetivo, golpeando a todos los enemigos agrupados ahí. Fuerte contra oleadas, pierde valor si el enemigo llega de a uno.',
    baseStats: { UnitHealth: 115, Damage: 300, Cooldown: 5.5, Range: 18, WalkSpeed: 5 },
    rolled: { ...STANDARD_ROLL },
    upgrade: standardUpgrade(3500)
  },
  {
    name: 'Cactus',
    rarity: 'Legendary',
    cost: 10000000,
    chance: 3000000,
    growTime: 450,
    water: 156,
    passive: 'Golpea un solo punto pero con la carga más corta de la lista (0.1s): su fuerte es la velocidad de reacción, no el alcance. Pega seguido, pero nunca a más de un enemigo por golpe.',
    baseStats: { UnitHealth: 150, Damage: 250, Cooldown: 3, Range: 18, WalkSpeed: 4.5 },
    rolled: { ...STANDARD_ROLL },
    upgrade: standardUpgrade(3500)
  },
  {
    name: 'Bamboo',
    rarity: 'Mythic',
    cost: 65000000,
    chance: 50000000,
    growTime: 550,
    water: 183,
    passive: 'Golpe frontal, pero más ancho que otros ataques en línea: puede tocar a más de un enemigo si vienen juntos por el mismo carril.',
    baseStats: { UnitHealth: 250, Damage: 135, Cooldown: 1.25, Range: 4, WalkSpeed: 5.25 },
    rolled: { ...STANDARD_ROLL },
    upgrade: standardUpgrade(10000)
  },
  {
    name: 'Chomper',
    rarity: 'Mythic',
    cost: 275000000,
    chance: 250000000,
    growTime: 620,
    water: 218,
    passive: 'Mordisco frontal de alcance corto, pensado para enemigos que ya están cerca. No es un ataque de área, así que golpea de a uno.',
    baseStats: { UnitHealth: 325, Damage: 285, Cooldown: 1.5, Range: 3, WalkSpeed: 4.1 },
    rolled: { ...STANDARD_ROLL },
    upgrade: standardUpgrade(10000)
  },
  {
    name: 'Dragon Fruit',
    rarity: 'Mythic',
    cost: 100000000,
    chance: 100000000,
    growTime: 580,
    water: 197,
    passive: 'Ataca en área sobre el objetivo, ideal contra grupos cercanos entre sí. Su Daño base ya es alto de por sí, así que el ataque en área lo hace aún más fuerte contra oleadas.',
    baseStats: { UnitHealth: 265, Damage: 565, Cooldown: 4.25, Range: 22, WalkSpeed: 5 },
    rolled: { ...STANDARD_ROLL },
    upgrade: standardUpgrade(10000)
  },
  {
    name: 'Frostberry',
    rarity: 'Divine',
    cost: 2850000000,
    chance: 20000000000,
    growTime: 850,
    water: 265,
    passive: 'Ataca en área y de paso ralentiza 30% durante 3 segundos a todo lo que golpea. Su valor no es solo el daño: sirve para frenar oleadas enteras y que otras unidades rematen.',
    baseStats: { UnitHealth: 425, Damage: 1100, Cooldown: 2, Range: 16.5, WalkSpeed: 6 },
    rolled: { ...STANDARD_ROLL },
    upgrade: standardUpgrade(75000)
  },
  {
    name: 'Kiwi',
    rarity: 'Divine',
    cost: 5250000000,
    chance: 55000000000,
    growTime: 920,
    water: 280,
    passive: 'Ataca en área amplia. Combinado con su Daño base altísimo, es de los golpes de área más fuertes disponibles contra grupos.',
    baseStats: { UnitHealth: 520, Damage: 2250, Cooldown: 1.5, Range: 18, WalkSpeed: 5.5 },
    rolled: { ...STANDARD_ROLL },
    upgrade: standardUpgrade(75000)
  },
  {
    name: 'Lemon',
    rarity: 'Divine',
    cost: 1500000000,
    chance: 5000000000,
    growTime: 800,
    water: 250,
    passive: 'Golpea en línea recta hacia adelante. Su Cooldown base es de solo 0.5, de los más bajos de la lista: ataca muy seguido aunque cada golpe individual no sea el más fuerte.',
    baseStats: { UnitHealth: 400, Damage: 235, Cooldown: 0.5, Range: 3.15, WalkSpeed: 7.5 },
    rolled: { ...STANDARD_ROLL },
    upgrade: standardUpgrade(75000)
  },
  {
    name: 'Orange',
    rarity: 'Celestial',
    cost: 30000000000,
    chance: 500000000000,
    growTime: 1200,
    water: 300,
    passive: 'Ataca en área sobre el objetivo. Tiene el Daño base más alto de toda la lista, así que incluso un roll mediocre en Daño sigue siendo devastador en números absolutos.',
    baseStats: { UnitHealth: 700, Damage: 12500, Cooldown: 4.25, Range: 21, WalkSpeed: 5.25 },
    rolled: { ...STANDARD_ROLL },
    upgrade: standardUpgrade(250000)
  },
  {
    name: 'Durian',
    rarity: 'Exclusive',
    cost: 999999999999999,
    chance: 1,
    growTime: 60,
    water: 65,
    passive: 'Explosión de área, de las más grandes disponibles: golpea casi cualquier cosa que esté cerca. Compensa un Cooldown y Velocidad bajos con esa cobertura tan amplia.',
    baseStats: { UnitHealth: 75, Damage: 50, Cooldown: 2.5, Range: 30, WalkSpeed: 1.5 },
    rolled: { ...STANDARD_ROLL },
    upgrade: standardUpgrade(40, 0.2) // Durian sube Daño +20% por nivel, no +15%
  },
  {
    name: 'Ignis Flytrap',
    rarity: 'Exclusive',
    cost: 50,
    chance: 75,
    growTime: 240,
    water: 78,
    passive: 'Mordisco frontal de corto alcance, similar al de Chomper: golpea de a uno y solo si el enemigo ya está cerca.',
    baseStats: { UnitHealth: 130, Damage: 100, Cooldown: 1.5, Range: 3, WalkSpeed: 5 },
    rolled: { ...STANDARD_ROLL },
    upgrade: standardUpgrade(1000)
  },
  {
    name: 'Lava Cactus',
    rarity: 'Exclusive',
    cost: 50,
    chance: 10,
    growTime: 75,
    water: 55,
    passive: 'Golpea un solo punto muy rápido (carga 0.1s) y además quema, aplicando daño extra durante 3 segundos. La quemadura ayuda a compensar que su Daño base es de los más bajos de la lista.',
    baseStats: { UnitHealth: 60, Damage: 64, Cooldown: 2.75, Range: 18, WalkSpeed: 4.85 },
    rolled: { ...STANDARD_ROLL },
    upgrade: standardUpgrade(500)
  },
  {
    name: 'Pyrewood',
    rarity: 'Exclusive',
    cost: 50,
    chance: 1000,
    growTime: 900,
    water: 400,
    passive: 'Ataque en área que cambia de tamaño según la distancia: golpea un área chica si el enemigo está cerca, y una más grande si está más lejos. Se adapta solo, no hay que posicionarla distinto.',
    baseStats: { UnitHealth: 950, Damage: 900, Cooldown: 1.25, Range: 20, WalkSpeed: 4 },
    rolled: { ...STANDARD_ROLL },
    upgrade: standardUpgrade(50000)
  },
  {
    name: 'Volcap-no',
    rarity: 'Exclusive',
    cost: 50,
    chance: 300,
    growTime: 420,
    water: 175,
    passive: 'Ataca en área amplia, con una carga algo más larga (0.75s) que el resto. Compensa esa lentitud con una cobertura de área generosa contra grupos.',
    baseStats: { UnitHealth: 350, Damage: 200, Cooldown: 1.5, Range: 18, WalkSpeed: 4.25 },
    rolled: { ...STANDARD_ROLL },
    upgrade: standardUpgrade(5000)
  }

  // --- agrega tus próximas plantas debajo de esta línea ---
];