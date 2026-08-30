import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import { Seed, STAT_LABELS, SEEDS, MIN_LEVEL, MAX_LEVEL, RARITY_COLORS, STAT_WEIGHTS } from './plants/SeedsData';
import { MUTATIONS, Mutation } from './plants/MutationData';

interface Tier {
  id: string;
  min: number; // % mínimo para caer en este tramo
  color: string;
  holo?: boolean;
}

const MAX_MUTATION_SLOTS = 3;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  readonly statLabels = STAT_LABELS;
  readonly mutations = MUTATIONS;
  readonly mutationKeys: string[] = Object.keys(MUTATIONS);
  readonly mutationSlots = Array.from({ length: MAX_MUTATION_SLOTS }, (_, i) => i);

  readonly tiers: Tier[] = [
    { id: 'E',   min: 0,     color: 'var(--t-E)' },
    { id: 'D',   min: 11.11, color: 'var(--t-D)' },
    { id: 'C',   min: 22.22, color: 'var(--t-C)' },
    { id: 'B',   min: 33.33, color: 'var(--t-B)' },
    { id: 'A',   min: 44.44, color: 'var(--t-A)' },
    { id: 'S',   min: 55.56, color: 'var(--t-S)' },
    { id: 'SS',  min: 66.67, color: 'var(--t-SS)' },
    { id: 'SSS', min: 77.78, color: 'var(--t-SSS)' },
    { id: 'Z',   min: 88.89, color: 'var(--t-Z)', holo: true }
  ];

  // la data "de fábrica" vive en SeedsData.ts — para agregar plantas se edita ese archivo.
  seeds: Seed[] = SEEDS;

  // niveles disponibles en el selector: [MIN_LEVEL ... MAX_LEVEL], ej. 1 a 30
  readonly levels: number[] = Array.from(
    { length: MAX_LEVEL - MIN_LEVEL + 1 },
    (_, i) => i + MIN_LEVEL
  );

  currentIdx = 0;
  level = MIN_LEVEL;

  // hasta 3 mutaciones activas a la vez. null = slot vacío ("Sin mutación").
  selectedMutationKeys: (string | null)[] = Array(MAX_MUTATION_SLOTS).fill(null);

  // valores que el usuario escribe, por stat key
  values: { [key: string]: number | null } = {};

  // resultado por stat: porcentaje dentro del rango + tier asignado
  results: { [key: string]: { pct: number; tier: Tier } | null } = {};

  constructor() {
    this.resetValues();
  }

  get seed(): Seed {
    return this.seeds[this.currentIdx];
  }

  get statKeys(): string[] {
    // solo stats que tienen label + rango rolleable (CropHealth queda excluido siempre)
    return Object.keys(this.seed.rolled).filter(k => k !== 'CropHealth');
  }

  fmt(n: number | undefined | null): string {
    if (n == null) return '—';
    return n.toLocaleString('es-PE');
  }

  rarityColor(rarity: string | undefined): string {
    return (rarity && RARITY_COLORS[rarity]) || 'var(--blue-light)';
  }

  // --- mutaciones ---

  get selectedMutations(): Mutation[] {
    return this.selectedMutationKeys
      .filter((k): k is string => !!k)
      .map(k => this.mutations[k]);
  }

  // opciones disponibles para un slot: todas las mutaciones que no estén
  // elegidas ya en otro slot (para no repetir la misma mutación 2 veces).
  availableMutationsFor(slotIndex: number): string[] {
    const chosenElsewhere = this.selectedMutationKeys.filter((k, i) => i !== slotIndex && k !== null);
    return this.mutationKeys.filter(k => !chosenElsewhere.includes(k));
  }

  get totalChanceMultiplier(): number {
    return this.selectedMutations.reduce((acc, m) => acc * m.chanceMultiply, 1);
  }

  onMutationSlotChange(slotIndex: number, key: string | null): void {
    this.selectedMutationKeys[slotIndex] = key;
    this.statKeys.forEach(k => this.onInput(k));
  }

  // --- semilla / nivel ---

  onSeedChange(idx: number): void {
    this.currentIdx = idx;
    this.level = MIN_LEVEL;
    this.selectedMutationKeys = Array(MAX_MUTATION_SLOTS).fill(null);
    this.resetValues();
  }

  // el nivel cambia la base de cada stat, así que se recalculan los rolls
  // ya cargados sin borrar lo que el usuario escribió.
  onLevelChange(newLevel: number): void {
    this.level = newLevel;
    this.statKeys.forEach(k => this.onInput(k));
  }

  resetValues(): void {
    this.values = {};
    this.results = {};
    this.statKeys.forEach(k => {
      this.values[k] = null;
      this.results[k] = null;
    });
  }

  // stat base ya ajustado según nivel de mejora + mutaciones activas.
  effectiveBase(key: string): number {
    const base = this.seed.baseStats[key];
    const upg = this.seed.upgrade?.stats[key];
    const steps = this.level - MIN_LEVEL;

    let currentBase = base;
    if (upg && steps > 0) {
      currentBase = upg.type === 'Percent' ? base * (1 + upg.value * steps) : base + upg.value * steps;
    }

    let percentUp = 0;
    let percentDown = 0;
    for (const mut of this.selectedMutations) {
      const eff = mut.stats[key];
      if (!eff) continue;
      if (eff.type === 'Percent') percentUp += eff.value;
      else if (eff.type === 'PercentReduce') percentDown += eff.value;
    }
    if (percentUp !== 0) currentBase *= (1 + percentUp);
    if (percentDown !== 0) currentBase *= (1 - percentDown);

    return currentBase;
  }

  rangeLabel(key: string): string {
    const r = this.seed.rolled[key];
    const base = this.effectiveBase(key);
    const lo = +(base * r.min).toFixed(2);
    const hi = +(base * r.max).toFixed(2);
    return `${lo} – ${hi}`;
  }

  private computeStatPct(key: string, rawVal: number | null): number | null {
    if (rawVal === null || rawVal === undefined || isNaN(rawVal as any)) return null;
    const r = this.seed.rolled[key];
    const base = this.effectiveBase(key);
    const multiplier = Number(rawVal) / base;
    let pct = ((multiplier - r.min) / (r.max - r.min)) * 100;
    if (r.lowerIsBetter) pct = 100 - pct;
    return Math.max(0, Math.min(100, pct));
  }

  private tierFor(pct: number): Tier {
    let t = this.tiers[0];
    for (const tier of this.tiers) {
      if (pct >= tier.min) t = tier;
    }
    return t;
  }

  // se llama en cada tecla: actualiza la barra y el sello de esa fila en vivo
  onInput(key: string): void {
    const pct = this.computeStatPct(key, this.values[key]);
    this.results[key] = pct === null ? null : { pct, tier: this.tierFor(pct) };
  }

  barWidth(key: string): string {
    const r = this.results[key];
    return r ? `${r.pct.toFixed(1)}%` : '0%';
  }

  // sella (anima) todas las filas que tengan un valor cargado
  sealAll(): void {
    this.statKeys.forEach(k => this.onInput(k));
  }

  clearAll(): void {
    this.resetValues();
  }

  // --- EXPORTACIÓN DE IMAGEN ---

  // 1. Descargar la imagen
  exportAsImage(): void {
    const node = document.getElementById('export-card');
    if (!node) return;

    html2canvas(node, {
      backgroundColor: '#0b1424',
      scale: 2,
      logging: false,
      useCORS: true
    }).then((canvas: HTMLCanvasElement) => {
      const link = document.createElement('a');
      link.download = `ficha-${this.seed.name.toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }).catch((err: unknown) => console.error('Error al descargar la imagen:', err));
  }

  // 2. Copiar la imagen al portapapeles
  copyImage(): void {
    const node = document.getElementById('export-card');
    if (!node) return;

    html2canvas(node, {
      backgroundColor: '#0b1424',
      scale: 2,
      logging: false,
      useCORS: true
    }).then((canvas: HTMLCanvasElement) => {
      canvas.toBlob((blob: Blob | null) => {
        if (!blob) return;

        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item])
          .then(() => {
            alert('¡Imagen copiada al portapapeles! Ya puedes pegarla en Discord o WhatsApp.');
          })
          .catch((err: unknown) => {
            console.error('Error al copiar la imagen:', err);
            alert('Tu navegador no permitió copiar la imagen directamente.');
          });
      }, 'image/png');
    }).catch((err: unknown) => console.error('Error al generar la imagen:', err));
  }

  // 3. Compartir imagen mediante el menú nativo (WhatsApp, Discord, etc.)
  async shareImage(): Promise<void> {
    const node = document.getElementById('export-card');
    if (!node) return;

    try {
      const canvas: HTMLCanvasElement = await html2canvas(node, {
        backgroundColor: '#0b1424',
        scale: 2,
        logging: false,
        useCORS: true
      });

      canvas.toBlob(async (blob: Blob | null) => {
        if (!blob) return;

        const file = new File([blob], `ficha-${this.seed.name.toLowerCase()}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Ficha de ${this.seed.name}`,
            text: `¡Mira las estadísticas de mi ${this.seed.name} (Nivel ${this.level})!`
          });
        } else {
          // Si el navegador no soporta compartir directamente, copia la imagen
          this.copyImage();
        }
      }, 'image/png');
    } catch (err: unknown) {
      console.error('Error al compartir la imagen:', err);
    }
  }

  // --- MÉTRICAS FINALES Y VERDICTO ---

  get verdict(): string {
    const loaded = this.statKeys
      .map(k => ({ key: k, r: this.results[k] }))
      .filter(e => e.r !== null) as { key: string; r: { pct: number; tier: Tier } }[];

    if (loaded.length === 0) return '';

    const rank = (id: string) => this.tiers.findIndex(t => t.id === id);
    const label = (k: string) => this.statLabels[k] || k;

    const fuertes = loaded.filter(e => rank(e.r.tier.id) >= 5).map(e => label(e.key));
    const flojas = loaded.filter(e => rank(e.r.tier.id) <= 2).map(e => label(e.key));

    if (fuertes.length === 0 && flojas.length === 0) {
      return 'Tu planta salió pareja: ninguna stat destaca mucho, ni para bien ni para mal.';
    }

    let msg = '';
    if (fuertes.length > 0) {
      msg += `Bien, tu planta tiene ventaja en ${fuertes.join(', ')}.`;
    }
    if (flojas.length > 0) {
      msg += (msg ? ' Pero en ' : 'En ') + `${flojas.join(', ')} salió floja.`;
    }
    return msg;
  }

  get overallInfo(): { tier: Tier; pct: number; loadedCount: number; totalCount: number } | null {
    const totalCount = this.statKeys.length;
    const loaded = this.statKeys
      .map(k => ({ key: k, r: this.results[k] }))
      .filter(e => e.r !== null) as { key: string; r: { pct: number; tier: Tier } }[];

    if (loaded.length === 0) return null;

    let weightedSum = 0;
    let weightTotal = 0;
    loaded.forEach(e => {
      const w = STAT_WEIGHTS[e.key] ?? 1;
      weightedSum += e.r.pct * w;
      weightTotal += w;
    });

    const pct = weightedSum / weightTotal;
    const tier = this.tierFor(pct);

    return { tier, pct, loadedCount: loaded.length, totalCount };
  }

  get finalReasonText(): string {
    const info = this.overallInfo;
    if (!info) return '';
    let msg = `Promedio ponderado de tus stats (Daño, Tiempo de recarga y Alcance pesan más): ${info.pct.toFixed(1)}% → ${info.tier.id}.`;
    if (info.loadedCount < info.totalCount) {
      msg += ` (calculado con ${info.loadedCount} de ${info.totalCount} stats)`;
    }
    return msg;
  }

  get dps(): number | null {
    const dmg = this.values['Damage'];
    const cd = this.values['Cooldown'];
    if (dmg === null || dmg === undefined || isNaN(dmg as any)) return null;
    if (cd === null || cd === undefined || isNaN(cd as any) || cd <= 0) return null;
    return Number(dmg) / Number(cd);
  }
}