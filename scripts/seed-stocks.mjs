import { createReadStream } from "fs";
import { createInterface } from "readline";
import { db, stocksTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const SECTOR_MAP = [
  { sector: "Banking", keywords: ["BANK", "FINANCE BANK", "CO-OP BANK", "COOPERATIVE BANK"] },
  { sector: "Information Technology", keywords: ["TECH", "SOFTWARE", "INFOTECH", "INFOSYSTEMS", "IT LTD", "DIGITAL", "COMPUTER", "DATA"] },
  { sector: "Pharmaceuticals", keywords: ["PHARMA", "PHARMACEUT", "DRUG", "BIOTECH", "MEDICINE", "MEDICIN"] },
  { sector: "FMCG", keywords: ["HINDUSTAN UNILEVER", "ITC LTD", "NESTLE", "DABUR", "MARICO", "COLGATE", "BRITANNIA", "GODREJ CONSUMER", "EMAMI", "VARUN BEVERAGES", "BIKAJI"] },
  { sector: "Automobile", keywords: ["MOTOR", "AUTOMOBILES", "VEHICLES LTD", "MARUTI", "BAJAJ AUTO", "EICHER MOTORS", "ASHOK LEYLAND", "FORCE MOTORS", "TVS MOTOR"] },
  { sector: "Energy", keywords: ["PETROLEUM", "OIL AND", "OIL &", "NATURAL GAS", "POWER CORP", "POWER LTD", "GREEN ENERGY", "SOLAR ENERGY", "WIND ENERGY"] },
  { sector: "Metals & Mining", keywords: ["STEEL", "IRON AND", "COPPER", "ALUMINIUM", "ZINC", "COALFIELDS", "MINING", "MINERAL"] },
  { sector: "Real Estate", keywords: ["REALTY", "REAL ESTATE", "PROPERTIES LTD", "HOUSING LTD", "BUILDERS", "DEVELOPERS", "INFRA LTD"] },
  { sector: "Financial Services", keywords: ["CAPITAL LTD", "INVESTMENTS LTD", "ASSET MANAGEMENT", "INSURANCE", "LEASING", "CREDIT", "BAJAJ FINANCE", "MUTHOOT"] },
  { sector: "Telecom", keywords: ["TELECOM", "AIRTEL", "VODAFONE", "IDEA CELLULAR", "INDUS TOWER", "COMMUNICATIONS LTD"] },
  { sector: "Healthcare", keywords: ["HOSPITAL", "HEALTHCARE", "HEALTH CARE", "MEDICARE", "DIAGNOSTIC", "MEDICAL LTD"] },
  { sector: "Cement", keywords: ["CEMENT LTD", "CEMENTS LTD", "CEMENT CO", "LIME AND", "ULTRATECH", "AMBUJA", "SHREE CEMENT", "RAMCO CEMENT"] },
  { sector: "Chemicals", keywords: ["CHEMICAL", "PETROCHEM", "SPECIALTY CHEM", "PAINT", "PIGMENT", "FERTILIZER", "FERTILISER", "AGROCHEMICAL", "PESTICIDE", "PLASTIC"] },
  { sector: "Textile", keywords: ["TEXTILE", "COTTON", "FABRIC", "YARN", "GARMENT", "APPAREL", "LINEN", "SILK", "WOOL", "SPINNING"] },
  { sector: "Consumer Goods", keywords: ["CONSUMER", "RETAIL", "JEWELLERY", "JEWELRY", "OPTICAL", "WATCHES", "TITAN", "TRENT", "AVENUE SUPERMARTS"] },
];

function getSector(name) {
  const upper = name.toUpperCase();
  for (const { sector, keywords } of SECTOR_MAP) {
    if (keywords.some((k) => upper.includes(k))) return sector;
  }
  return "Equities";
}

async function parseCsv(path) {
  return new Promise((resolve) => {
    const stocks = [];
    const rl = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
    let headerSkipped = false;
    rl.on("line", (line) => {
      if (!headerSkipped) { headerSkipped = true; return; }
      if (!line.trim()) return;
      const parts = line.split(",");
      if (parts.length < 2) return;
      const symbol = parts[0].trim();
      const name = parts[1].trim();
      if (!symbol || !name || symbol.length > 20) return;
      stocks.push({ symbol, name, sector: getSector(name) });
    });
    rl.on("close", () => resolve(stocks));
  });
}

async function main() {
  console.log("Parsing NSE equity list...");
  const newStocks = await parseCsv("/tmp/nse_equity_list.csv");
  console.log(`Parsed ${newStocks.length} stocks`);

  // Get existing symbols to avoid duplicates
  const existing = await db.execute(sql`SELECT symbol FROM stocks`);
  const existingSet = new Set(existing.rows.map((r) => r.symbol));
  console.log(`Already in DB: ${existingSet.size}`);

  const toInsert = newStocks.filter((s) => !existingSet.has(s.symbol));
  console.log(`To insert: ${toInsert.length}`);

  if (toInsert.length === 0) {
    console.log("Nothing to insert.");
    process.exit(0);
  }

  // Insert in batches of 100
  const BATCH = 100;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH).map((s) => ({
      symbol: s.symbol,
      name: s.name,
      exchange: "NSE",
      sector: s.sector,
      currentPrice: "0",
      previousClose: "0",
      high: "0",
      low: "0",
      volume: 0,
      marketCap: "0",
    }));
    await db.insert(stocksTable).values(batch).onConflictDoNothing();
    inserted += batch.length;
    if (i % 500 === 0) process.stdout.write(`  Inserted ${inserted}/${toInsert.length}...\r`);
  }
  console.log(`\nDone. Inserted ${inserted} new stocks.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
