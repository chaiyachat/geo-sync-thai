import { createServerFn } from "@tanstack/react-start";

const SHEET_ID = "1c-mNHXcBNRZcDjsVkE9adSByAptdMkrxHMHIkFIFFt4";
const GID = "502215408";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID}`;

// Canonical 77 Thai provinces (official)
const THAI_PROVINCES = [
  "กรุงเทพมหานคร","กระบี่","กาญจนบุรี","กาฬสินธุ์","กำแพงเพชร","ขอนแก่น",
  "จันทบุรี","ฉะเชิงเทรา","ชลบุรี","ชัยนาท","ชัยภูมิ","ชุมพร","เชียงราย","เชียงใหม่",
  "ตรัง","ตราด","ตาก","นครนายก","นครปฐม","นครพนม","นครราชสีมา","นครศรีธรรมราช",
  "นครสวรรค์","นนทบุรี","นราธิวาส","น่าน","บึงกาฬ","บุรีรัมย์","ปทุมธานี",
  "ประจวบคีรีขันธ์","ปราจีนบุรี","ปัตตานี","พระนครศรีอยุธยา","พังงา","พัทลุง",
  "พิจิตร","พิษณุโลก","เพชรบุรี","เพชรบูรณ์","แพร่","พะเยา","ภูเก็ต","มหาสารคาม",
  "มุกดาหาร","แม่ฮ่องสอน","ยโสธร","ยะลา","ร้อยเอ็ด","ระนอง","ระยอง","ราชบุรี",
  "ลพบุรี","ลำปาง","ลำพูน","เลย","ศรีสะเกษ","สกลนคร","สงขลา","สตูล","สมุทรปราการ",
  "สมุทรสงคราม","สมุทรสาคร","สระแก้ว","สระบุรี","สิงห์บุรี","สุโขทัย","สุพรรณบุรี",
  "สุราษฎร์ธานี","สุรินทร์","หนองคาย","หนองบัวลำภู","อ่างทอง","อำนาจเจริญ",
  "อุดรธานี","อุตรดิตถ์","อุทัยธานี","อุบลราชธานี",
];

// Sort by length desc so longer names match first (e.g. นครราชสีมา before นคร...)
const PROVINCE_MATCHERS = [...THAI_PROVINCES].sort((a, b) => b.length - a.length);

export type TrsRecord = {
  email: string;
  name: string;
  surname: string;
  subject: string;
  school: string;
  area: string;
  target: string;
  status: string;
};

export type TrsStats = {
  total: number;
  active: number;
  subjects: number;
  provinces: number;
  topTargetAreas: { name: string; count: number }[];
  topTargetProvinces: { name: string; count: number }[];
  provinceList: string[];
  /** Map of canonical Thai province name -> count of users targeting that province */
  provinceCounts: Record<string, number>;
  /** Number of mutual teacher matches (A.area==B.target && B.area==A.target, same subject, different school) */
  matches: number;
  fetchedAt: string;
};

// Normalize school name — treat "โรงเรียนX" and "X" as same school
function normalizeSchool(raw: string): string {
  return (raw || "")
    .replace(/^โรงเรียน\s*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// Strip "สพป./สพม." prefix, "เขต N", whitespace
function normalizeArea(raw: string): string {
  return raw
    .replace(/^(สพป\.|สพม\.|สพป|สพม)\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Extract canonical province(s) from an area / target string.
// Returns array (สพม. entries can list multiple provinces).
function extractProvinces(raw: string): string[] {
  if (!raw) return [];
  const text = raw;
  const found = new Set<string>();
  for (const p of PROVINCE_MATCHERS) {
    if (text.includes(p)) {
      found.add(p);
    }
  }
  return [...found];
}

// Minimal CSV parser (handles quoted fields with embedded quotes/newlines/commas)
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
      else if (c === "\r") { /* skip */ }
      else cur += c;
    }
  }
  if (cur.length > 0 || row.length > 0) { row.push(cur); rows.push(row); }
  return rows;
}

let cache: { stats: TrsStats; at: number } | null = null;
const TTL_MS = 5 * 60 * 1000;

export const getTrsStats = createServerFn({ method: "GET" }).handler(async () => {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.stats;

  const res = await fetch(SHEET_URL, { headers: { "cache-control": "no-cache" } });
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
  const csv = await res.text();
  const rows = parseCSV(csv);
  // Row 0 in this sheet is metadata; real records start at row 1.
  const data = rows.slice(1).filter((r) => r.length >= 8 && (r[0] || r[5] || r[6]));

  const total = data.length;
  const active = data.filter((r) => (r[7] || "").trim().toLowerCase() === "on").length;

  const subjectSet = new Set<string>();
  const targetAreaCounts = new Map<string, number>();
  const targetProvinceCounts = new Map<string, number>();
  const allProvinces = new Set<string>();

  for (const r of data) {
    const subject = (r[3] || "").trim();
    const area = (r[5] || "").trim();
    const target = (r[6] || "").trim();
    if (subject) subjectSet.add(subject);

    // provinces from BOTH area and target — overall province coverage
    for (const p of extractProvinces(area)) allProvinces.add(p);
    for (const p of extractProvinces(target)) allProvinces.add(p);

    if (target) {
      const norm = normalizeArea(target);
      const key = norm || target;
      targetAreaCounts.set(key, (targetAreaCounts.get(key) || 0) + 1);
      for (const p of extractProvinces(target)) {
        targetProvinceCounts.set(p, (targetProvinceCounts.get(p) || 0) + 1);
      }
    }
  }

  const topN = (m: Map<string, number>, n: number) =>
    [...m.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "th"))
      .slice(0, n);

  const stats: TrsStats = {
    total,
    active,
    subjects: subjectSet.size,
    provinces: allProvinces.size,
    topTargetAreas: topN(targetAreaCounts, 10),
    topTargetProvinces: topN(targetProvinceCounts, 10),
    provinceList: [...allProvinces].sort((a, b) => a.localeCompare(b, "th")),
    provinceCounts: Object.fromEntries(targetProvinceCounts),
    fetchedAt: new Date().toISOString(),
  };

  cache = { stats, at: Date.now() };
  return stats;
});
