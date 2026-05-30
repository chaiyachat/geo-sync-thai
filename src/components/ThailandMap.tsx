import { useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";

import geo from "@/data/thailand-provinces.json";
import {
  PROVINCE_META,
  REGION_COLORS,
  REGION_LABEL,
  type ThaiRegion,
} from "@/data/provinces-meta";

type Props = {
  provinceCounts: Record<string, number>;
  width?: number;
  height?: number;
};

const WIDTH = 520;
const HEIGHT = 760;

const fc = geo as unknown as FeatureCollection<Geometry, { name: string }>;

// Pre-compute projection (fit to viewbox)
const projection = geoMercator().fitSize([WIDTH, HEIGHT], fc);
const pathGen = geoPath(projection);

// Hex with alpha helper
function withAlpha(hex: string, alpha: number) {
  const a = Math.round(Math.min(1, Math.max(0.12, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${a}`;
}

export function ThailandMap({ provinceCounts }: Props) {
  const [hover, setHover] = useState<{ th: string; en: string; count: number; region: ThaiRegion; x: number; y: number } | null>(null);

  // Per-region max for relative intensity scale
  const regionMax = useMemo(() => {
    const m: Record<ThaiRegion, number> = {
      north: 0, northeast: 0, central: 0, east: 0, west: 0, south: 0,
    };
    for (const f of fc.features) {
      const meta = PROVINCE_META[f.properties.name];
      if (!meta) continue;
      const c = provinceCounts[meta.th] || 0;
      if (c > m[meta.region]) m[meta.region] = c;
    }
    return m;
  }, [provinceCounts]);

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        style={{ maxHeight: "78vh" }}
      >
        <g>
          {fc.features.map((f, i) => {
            const en = f.properties.name;
            const meta = PROVINCE_META[en];
            const region: ThaiRegion = meta?.region ?? "central";
            const count = meta ? provinceCounts[meta.th] || 0 : 0;
            const max = regionMax[region] || 1;
            const intensity = count === 0 ? 0.15 : 0.35 + (count / max) * 0.65;
            const fill = withAlpha(REGION_COLORS[region], intensity);
            const d = pathGen(f) || "";
            return (
              <path
                key={i}
                d={d}
                fill={fill}
                stroke="#0b1226"
                strokeWidth={0.5}
                onMouseEnter={(e) => {
                  const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                  setHover({
                    th: meta?.th || en,
                    en,
                    count,
                    region,
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }}
                onMouseMove={(e) => {
                  const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                  setHover((h) => h && { ...h, x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer", transition: "fill 200ms" }}
              />
            );
          })}
        </g>
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border border-slate-700 bg-slate-950/95 px-3 py-2 text-xs text-slate-100 shadow-xl"
          style={{ left: hover.x + 12, top: hover.y + 12 }}
        >
          <div className="font-semibold text-cyan-300">{hover.th}</div>
          <div className="text-slate-400">{REGION_LABEL[hover.region]}</div>
          <div className="mt-1">
            ผู้ต้องการย้ายไป:{" "}
            <span className="font-bold text-white">{hover.count}</span> คน
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-300 sm:grid-cols-3">
        {(Object.keys(REGION_COLORS) as ThaiRegion[]).map((r) => (
          <div key={r} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ background: REGION_COLORS[r] }}
            />
            <span>{REGION_LABEL[r]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
