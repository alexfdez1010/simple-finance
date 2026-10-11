/** Deterministic statistics for the snapshot-change histogram. */
interface SnapshotValue {
  date: string;
  value: number;
}

const BIN_COUNT = 51;

interface Bin {
  label: string;
  count: number;
  mid: number;
}

/** Day-over-day arithmetic % returns from a value series. */
function dailyPcts(series: Array<{ date: string; value: number }>): number[] {
  const out: number[] = [];
  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1].value;
    if (prev > 0) out.push(((series[i].value - prev) / prev) * 100);
  }
  return out;
}

/** Below this |%| the symlog scale is ~linear; beyond it grows logarithmic. */
const LINTHRESH = 0.5;
/** Maps percentage changes onto the symmetric log axis. */
function fwd(r: number): number {
  return Math.asinh(r / LINTHRESH);
}
/** Converts a symmetric log coordinate back to a percentage. */
function inv(t: number): number {
  return LINTHRESH * Math.sinh(t);
}

/** Format a return midpoint compactly: 1 dp under 10%, 0 dp above. */
function fmtPct(v: number): string {
  const sign = v >= 0 ? '+' : '';
  return `${sign}${Math.abs(v) >= 10 ? v.toFixed(0) : v.toFixed(1)}%`;
}

/** Symmetric symlog binning: edges uniform in asinh-space, labels in real %. */
function toBins(pcts: number[]): Bin[] {
  if (pcts.length === 0) return [];
  const tMax = Math.max(...pcts.map((p) => Math.abs(fwd(p))), fwd(0.01));
  const width = (tMax * 2) / BIN_COUNT;
  const counts = new Array<number>(BIN_COUNT).fill(0);
  for (const p of pcts) {
    let idx = Math.floor((fwd(p) + tMax) / width);
    if (idx < 0) idx = 0;
    if (idx >= BIN_COUNT) idx = BIN_COUNT - 1;
    counts[idx] += 1;
  }
  return Array.from({ length: BIN_COUNT }, (_, i) => {
    const tMid = -tMax + (i + 0.5) * width;
    const mid = inv(tMid);
    return { label: fmtPct(mid), count: counts[i], mid };
  });
}

/** Percentile (linear, 0..1) from an unsorted sample. */
function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(
    Math.max(Math.floor(sorted.length * p), 0),
    sorted.length - 1,
  );
  return sorted[idx];
}

/**
 * Computes a symlog histogram and descriptive statistics from ordered valuations.
 * @param data - Snapshot values; input is never mutated.
 * @returns Bins, arithmetic mean, lower-tail percentile, positive share, and sample count.
 * Non-positive prior balances skip percentage changes; an empty sample returns zero statistics.
 * Snapshot changes include cash flows and are not adjusted investment returns.
 */
export function computeReturnDistribution(data: SnapshotValue[]) {
  const pcts = dailyPcts(data);
  if (pcts.length === 0) {
    return { bins: [], mean: 0, var5: 0, hitRate: 0, sample: 0 };
  }
  const m = pcts.reduce((s, x) => s + x, 0) / pcts.length;
  const v = percentile(pcts, 0.05);
  const up = pcts.filter((x) => x > 0).length;
  return {
    bins: toBins(pcts),
    mean: m,
    var5: v,
    hitRate: (up / pcts.length) * 100,
    sample: pcts.length,
  };
}
