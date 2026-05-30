// Map GeoJSON English province name -> Thai name + official region
export type ThaiRegion = "north" | "northeast" | "central" | "east" | "west" | "south";

export const REGION_COLORS: Record<ThaiRegion, string> = {
  north: "#22c55e",      // green
  northeast: "#f97316",  // orange
  central: "#3b82f6",    // blue
  east: "#06b6d4",       // cyan
  west: "#eab308",       // yellow
  south: "#a855f7",      // purple
};

export const REGION_LABEL: Record<ThaiRegion, string> = {
  north: "ภาคเหนือ",
  northeast: "ภาคตะวันออกเฉียงเหนือ",
  central: "ภาคกลาง",
  east: "ภาคตะวันออก",
  west: "ภาคตะวันตก",
  south: "ภาคใต้",
};

export const PROVINCE_META: Record<string, { th: string; region: ThaiRegion }> = {
  "Chiang Mai": { th: "เชียงใหม่", region: "north" },
  "Chiang Rai": { th: "เชียงราย", region: "north" },
  "Lampang": { th: "ลำปาง", region: "north" },
  "Lamphun": { th: "ลำพูน", region: "north" },
  "Mae Hong Son": { th: "แม่ฮ่องสอน", region: "north" },
  "Nan": { th: "น่าน", region: "north" },
  "Phayao": { th: "พะเยา", region: "north" },
  "Phrae": { th: "แพร่", region: "north" },
  "Uttaradit": { th: "อุตรดิตถ์", region: "north" },

  "Amnat Charoen": { th: "อำนาจเจริญ", region: "northeast" },
  "Bueng Kan": { th: "บึงกาฬ", region: "northeast" },
  "Buri Ram": { th: "บุรีรัมย์", region: "northeast" },
  "Chaiyaphum": { th: "ชัยภูมิ", region: "northeast" },
  "Kalasin": { th: "กาฬสินธุ์", region: "northeast" },
  "Khon Kaen": { th: "ขอนแก่น", region: "northeast" },
  "Loei": { th: "เลย", region: "northeast" },
  "Maha Sarakham": { th: "มหาสารคาม", region: "northeast" },
  "Mukdahan": { th: "มุกดาหาร", region: "northeast" },
  "Nakhon Phanom": { th: "นครพนม", region: "northeast" },
  "Nakhon Ratchasima": { th: "นครราชสีมา", region: "northeast" },
  "Nong Bua Lam Phu": { th: "หนองบัวลำภู", region: "northeast" },
  "Nong Khai": { th: "หนองคาย", region: "northeast" },
  "Roi Et": { th: "ร้อยเอ็ด", region: "northeast" },
  "Sakon Nakhon": { th: "สกลนคร", region: "northeast" },
  "Si Sa Ket": { th: "ศรีสะเกษ", region: "northeast" },
  "Surin": { th: "สุรินทร์", region: "northeast" },
  "Ubon Ratchathani": { th: "อุบลราชธานี", region: "northeast" },
  "Udon Thani": { th: "อุดรธานี", region: "northeast" },
  "Yasothon": { th: "ยโสธร", region: "northeast" },

  "Ang Thong": { th: "อ่างทอง", region: "central" },
  "Bangkok Metropolis": { th: "กรุงเทพมหานคร", region: "central" },
  "Chai Nat": { th: "ชัยนาท", region: "central" },
  "Kamphaeng Phet": { th: "กำแพงเพชร", region: "central" },
  "Lop Buri": { th: "ลพบุรี", region: "central" },
  "Nakhon Nayok": { th: "นครนายก", region: "central" },
  "Nakhon Pathom": { th: "นครปฐม", region: "central" },
  "Nakhon Sawan": { th: "นครสวรรค์", region: "central" },
  "Nonthaburi": { th: "นนทบุรี", region: "central" },
  "Pathum Thani": { th: "ปทุมธานี", region: "central" },
  "Phetchabun": { th: "เพชรบูรณ์", region: "central" },
  "Phichit": { th: "พิจิตร", region: "central" },
  "Phitsanulok": { th: "พิษณุโลก", region: "central" },
  "Phra Nakhon Si Ayutthaya": { th: "พระนครศรีอยุธยา", region: "central" },
  "Samut Prakan": { th: "สมุทรปราการ", region: "central" },
  "Samut Sakhon": { th: "สมุทรสาคร", region: "central" },
  "Samut Songkhram": { th: "สมุทรสงคราม", region: "central" },
  "Saraburi": { th: "สระบุรี", region: "central" },
  "Sing Buri": { th: "สิงห์บุรี", region: "central" },
  "Sukhothai": { th: "สุโขทัย", region: "central" },
  "Suphan Buri": { th: "สุพรรณบุรี", region: "central" },
  "Uthai Thani": { th: "อุทัยธานี", region: "central" },

  "Chachoengsao": { th: "ฉะเชิงเทรา", region: "east" },
  "Chanthaburi": { th: "จันทบุรี", region: "east" },
  "Chon Buri": { th: "ชลบุรี", region: "east" },
  "Prachin Buri": { th: "ปราจีนบุรี", region: "east" },
  "Rayong": { th: "ระยอง", region: "east" },
  "Sa Kaeo": { th: "สระแก้ว", region: "east" },
  "Trat": { th: "ตราด", region: "east" },

  "Kanchanaburi": { th: "กาญจนบุรี", region: "west" },
  "Phetchaburi": { th: "เพชรบุรี", region: "west" },
  "Prachuap Khiri Khan": { th: "ประจวบคีรีขันธ์", region: "west" },
  "Ratchaburi": { th: "ราชบุรี", region: "west" },
  "Tak": { th: "ตาก", region: "west" },

  "Chumphon": { th: "ชุมพร", region: "south" },
  "Krabi": { th: "กระบี่", region: "south" },
  "Nakhon Si Thammarat": { th: "นครศรีธรรมราช", region: "south" },
  "Narathiwat": { th: "นราธิวาส", region: "south" },
  "Pattani": { th: "ปัตตานี", region: "south" },
  "Phangnga": { th: "พังงา", region: "south" },
  "Phatthalung": { th: "พัทลุง", region: "south" },
  "Phuket": { th: "ภูเก็ต", region: "south" },
  "Ranong": { th: "ระนอง", region: "south" },
  "Satun": { th: "สตูล", region: "south" },
  "Songkhla": { th: "สงขลา", region: "south" },
  "Surat Thani": { th: "สุราษฎร์ธานี", region: "south" },
  "Trang": { th: "ตรัง", region: "south" },
  "Yala": { th: "ยะลา", region: "south" },
};

export const TH_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(PROVINCE_META).map(([en, m]) => [m.th, en])
);
