import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing environment variables. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- State FIPS codes ---
const STATE_FIPS: Record<string, string> = {
  TX: "48",
  CO: "08",
  FL: "12",
  NC: "37",
  TN: "47",
};

// --- County definitions with FIPS, realistic rural coords, and local flavor ---
interface CountyDef {
  name: string;
  fips: string;
  coords: Array<[number, number]>; // [lat, lng] pairs in rural areas
  features: string[];
}

const COUNTIES: Record<string, CountyDef[]> = {
  TX: [
    {
      name: "Travis",
      fips: "453",
      coords: [
        [30.542, -97.942],
        [30.385, -97.893],
      ],
      features: [
        "rolling Hill Country terrain with scattered live oaks and seasonal creek frontage",
        "open grassland pasture with views of the Balcones Escarpment and wildflower meadows",
      ],
    },
    {
      name: "Bexar",
      fips: "029",
      coords: [
        [29.283, -98.734],
        [29.195, -98.812],
      ],
      features: [
        "gently sloping mesquite brush country near the Medina River corridor",
        "level ranch land with mature pecan trees and a small stock pond",
      ],
    },
    {
      name: "Webb",
      fips: "479",
      coords: [
        [27.845, -99.612],
        [27.632, -99.478],
      ],
      features: [
        "semi-arid brush country with caliche roads and distant views of the Rio Grande valley",
        "open South Texas ranchland with native thornscrub habitat ideal for wildlife management",
      ],
    },
    {
      name: "Williamson",
      fips: "491",
      coords: [
        [30.782, -97.653],
        [30.845, -97.512],
      ],
      features: [
        "blackland prairie with fertile topsoil and frontage along the San Gabriel River",
        "lightly wooded farmland with old barn structures and fenced perimeter",
      ],
    },
    {
      name: "Llano",
      fips: "299",
      coords: [
        [30.812, -98.732],
        [30.695, -98.614],
      ],
      features: [
        "granite Hill Country terrain with native grasses and a seasonal spring-fed creek",
        "wooded hilltop acreage overlooking the Llano River valley with abundant deer habitat",
      ],
    },
  ],
  CO: [
    {
      name: "El Paso",
      fips: "041",
      coords: [
        [38.945, -104.692],
        [38.812, -104.823],
      ],
      features: [
        "high plains grassland with unobstructed Pikes Peak views to the west",
        "rolling shortgrass prairie near Black Forest with stands of ponderosa pine",
      ],
    },
    {
      name: "Pueblo",
      fips: "101",
      coords: [
        [38.142, -104.812],
        [38.056, -104.923],
      ],
      features: [
        "open rangeland along the Arkansas River basin with cottonwood-lined arroyos",
        "flat irrigated farmland with established water rights and mountain views",
      ],
    },
    {
      name: "Mesa",
      fips: "077",
      coords: [
        [39.145, -108.912],
        [39.023, -108.753],
      ],
      features: [
        "high desert terrain near the Colorado National Monument with red sandstone formations",
        "irrigated orchard country in the Grand Valley with peach and apple trees",
      ],
    },
    {
      name: "Fremont",
      fips: "043",
      coords: [
        [38.542, -105.412],
        [38.623, -105.312],
      ],
      features: [
        "mountainous terrain along the Arkansas River near the Royal Gorge with pinyon-juniper woodland",
        "alpine meadow acreage above 7,500 feet with aspen groves and seasonal elk migration",
      ],
    },
    {
      name: "Huerfano",
      fips: "055",
      coords: [
        [37.712, -105.123],
        [37.623, -105.234],
      ],
      features: [
        "Spanish Peaks foothill ranch country with mixed conifer forest and year-round stream",
        "open valley pasture below the Sangre de Cristo Mountains with panoramic views",
      ],
    },
  ],
  FL: [
    {
      name: "Marion",
      fips: "083",
      coords: [
        [29.312, -82.213],
        [29.185, -82.342],
      ],
      features: [
        "gently rolling horse country with fenced pastures and mature live oak canopy",
        "open agricultural land in central Florida's horse capital with spring-fed ponds",
      ],
    },
    {
      name: "Levy",
      fips: "075",
      coords: [
        [29.412, -82.812],
        [29.323, -82.723],
      ],
      features: [
        "coastal lowland near the Gulf of Mexico with mixed hardwood hammock and pine flatwoods",
        "secluded timberland along the Suwannee River corridor with hunting lease potential",
      ],
    },
    {
      name: "Putnam",
      fips: "107",
      coords: [
        [29.645, -81.812],
        [29.534, -81.723],
      ],
      features: [
        "mixed pine and oak forest near the St. Johns River with abundant wildlife",
        "former citrus grove land with rich sandy loam and established irrigation infrastructure",
      ],
    },
    {
      name: "Gilchrist",
      fips: "041",
      coords: [
        [29.745, -82.812],
        [29.812, -82.723],
      ],
      features: [
        "rural farmland near the Santa Fe River with limestone springs and kayak access",
        "quiet countryside with old-growth cypress stands and artesian well potential",
      ],
    },
    {
      name: "Columbia",
      fips: "023",
      coords: [
        [30.212, -82.712],
        [30.145, -82.612],
      ],
      features: [
        "longleaf pine savanna near Osceola National Forest with prescribed burn management history",
        "productive hay fields with seasonal pond and proximity to the Ichetucknee River",
      ],
    },
  ],
  NC: [
    {
      name: "Ashe",
      fips: "009",
      coords: [
        [36.412, -81.512],
        [36.345, -81.623],
      ],
      features: [
        "Blue Ridge mountain ridgeline with long-range layered mountain views and hardwood forest",
        "high-elevation pasture along the New River with Christmas tree farm potential",
      ],
    },
    {
      name: "Watauga",
      fips: "189",
      coords: [
        [36.245, -81.712],
        [36.178, -81.612],
      ],
      features: [
        "mountain cove land near the Watauga River with rhododendron thickets and trout streams",
        "sloping meadow with old apple orchard and views of Grandfather Mountain",
      ],
    },
    {
      name: "Buncombe",
      fips: "021",
      coords: [
        [35.712, -82.612],
        [35.645, -82.512],
      ],
      features: [
        "wooded mountain property in the Swannanoa Valley with elevation above 3,000 feet",
        "former tobacco farmland transitioning to organic agriculture with creek boundary",
      ],
    },
    {
      name: "Madison",
      fips: "115",
      coords: [
        [35.912, -82.712],
        [35.845, -82.812],
      ],
      features: [
        "secluded hollar property along the French Broad River with Appalachian hardwood forest",
        "hillside homestead site with natural spring and old stone foundation remnants",
      ],
    },
    {
      name: "Yancey",
      fips: "199",
      coords: [
        [35.912, -82.312],
        [35.845, -82.212],
      ],
      features: [
        "high-mountain acreage near Mount Mitchell with Fraser fir and rhododendron",
        "south-facing slope with garden potential and seasonal views of the Black Mountains",
      ],
    },
  ],
  TN: [
    {
      name: "Sevier",
      fips: "155",
      coords: [
        [35.812, -83.512],
        [35.745, -83.612],
      ],
      features: [
        "Smoky Mountain foothills property with mature poplar and hemlock forest along Little Pigeon River",
        "ridgetop acreage with panoramic views of the Great Smoky Mountains National Park",
      ],
    },
    {
      name: "Blount",
      fips: "009",
      coords: [
        [35.612, -83.912],
        [35.545, -83.812],
      ],
      features: [
        "rolling pasture near the Little Tennessee River with established fence lines and hay production",
        "wooded mountain tract bordering Great Smoky Mountains National Park with hiking trail access",
      ],
    },
    {
      name: "Monroe",
      fips: "123",
      coords: [
        [35.412, -84.212],
        [35.345, -84.123],
      ],
      features: [
        "fertile valley farmland near the Tellico River with bottom-ground soil and old dairy barn",
        "hardwood forest along the Cherohala Skyway corridor with abundant turkey and deer",
      ],
    },
    {
      name: "Polk",
      fips: "139",
      coords: [
        [35.145, -84.512],
        [35.078, -84.423],
      ],
      features: [
        "mountain property near the Ocoee River with whitewater recreation access and mixed timber",
        "rolling terrain in the Copper Basin area with reclaimed mining land and wildflower meadows",
      ],
    },
    {
      name: "McMinn",
      fips: "107",
      coords: [
        [35.412, -84.612],
        [35.345, -84.523],
      ],
      features: [
        "level agricultural bottom land along the Hiwassee River with alluvial soil",
        "mixed-use rural property with old farmhouse site, mature timber, and road frontage",
      ],
    },
  ],
};

// --- Helpers ---

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateAPN(): string {
  const a = randInt(1000, 9999);
  const b = randInt(100, 999);
  const c = randInt(100, 999);
  return `${a}-${b}-${c}`;
}

function generatePriceCents(acreage: number): number {
  // Price per acre varies: small lots cost more per acre
  const pricePerAcre =
    acreage < 5
      ? rand(3000, 12000)
      : acreage < 20
        ? rand(2000, 8000)
        : acreage < 100
          ? rand(800, 4000)
          : rand(200, 1500);

  let total = Math.round(pricePerAcre * acreage);
  // Clamp to $5,000 - $500,000
  total = Math.max(5000, Math.min(500000, total));
  // Round to nearest $500
  total = Math.round(total / 500) * 500;
  return total * 100; // store in cents
}

function generateAcreage(): number {
  // Weighted toward smaller parcels but some large ranches
  const r = Math.random();
  if (r < 0.3) return parseFloat(rand(1, 10).toFixed(2));
  if (r < 0.6) return parseFloat(rand(10, 50).toFixed(1));
  if (r < 0.85) return parseFloat(rand(50, 200).toFixed(1));
  return parseFloat(rand(200, 640).toFixed(0));
}

const ZONING_TYPES = ["agricultural", "residential", "commercial", "mixed-use"];

const STATE_NAMES: Record<string, string> = {
  TX: "Texas",
  CO: "Colorado",
  FL: "Florida",
  NC: "North Carolina",
  TN: "Tennessee",
};

interface ParcelInsert {
  parcel_id: string;
  apn: string;
  state: string;
  county: string;
  latitude: number;
  longitude: number;
  acreage: number;
  price_cents: number;
  zoning: string;
  road_access: boolean;
  water_access: boolean;
  utilities: boolean;
  description: string;
  photo_urls: string[];
  status: string;
  listed_at: string;
  created_at: string;
  updated_at: string;
}

function buildParcels(): ParcelInsert[] {
  const parcels: ParcelInsert[] = [];
  let photoIndex = 1;

  for (const [stateCode, counties] of Object.entries(COUNTIES)) {
    const stateFips = STATE_FIPS[stateCode];
    // We need 10 parcels per state, 2 per county (5 counties × 2 = 10)
    for (const county of counties) {
      for (let i = 0; i < 2; i++) {
        const [baseLat, baseLng] = county.coords[i];
        // Add small jitter so parcels aren't exactly on the same spot
        const lat = parseFloat((baseLat + rand(-0.02, 0.02)).toFixed(6));
        const lng = parseFloat((baseLng + rand(-0.02, 0.02)).toFixed(6));

        const apn = generateAPN();
        const parcelId = `${stateFips}${county.fips}_${apn}`;
        const acreage = generateAcreage();
        const priceCents = generatePriceCents(acreage);
        const zoning = pick(ZONING_TYPES);
        const roadAccess = Math.random() > 0.2;
        const waterAccess = Math.random() > 0.5;
        const utilities = Math.random() > 0.4;

        // Status: mostly active, some sold/pending
        let status: string;
        const statusRoll = Math.random();
        if (statusRoll < 0.75) status = "active";
        else if (statusRoll < 0.9) status = "pending";
        else status = "sold";

        const feature = county.features[i];
        const acreLabel = acreage >= 100 ? `${acreage}-acre` : `${acreage}-acre`;
        const description = `${acreLabel} ${zoning} parcel in ${county.name} County, ${STATE_NAMES[stateCode]}. ${feature}. ${
          roadAccess
            ? "County-maintained road provides year-round access."
            : "Accessed via seasonal dirt road or easement."
        }`;

        const numPhotos = randInt(2, 5);
        const photoUrls: string[] = [];
        for (let p = 0; p < numPhotos; p++) {
          photoUrls.push(
            `https://picsum.photos/seed/parcel${photoIndex}/800/600`
          );
          photoIndex++;
        }

        // Random listed date in the last 6 months
        const daysAgo = randInt(1, 180);
        const listedDate = new Date();
        listedDate.setDate(listedDate.getDate() - daysAgo);
        const listedAt = listedDate.toISOString();

        const now = new Date().toISOString();

        parcels.push({
          parcel_id: parcelId,
          apn,
          state: stateCode,
          county: county.name,
          latitude: lat,
          longitude: lng,
          acreage,
          price_cents: priceCents,
          zoning,
          road_access: roadAccess,
          water_access: waterAccess,
          utilities,
          description,
          photo_urls: photoUrls,
          status,
          listed_at: listedAt,
          created_at: now,
          updated_at: now,
        });
      }
    }
  }

  return parcels;
}

async function seed(): Promise<void> {
  console.log("Seeding 50 parcels into the database...\n");

  const parcels = buildParcels();

  // Log a summary before inserting
  const byState: Record<string, number> = {};
  for (const p of parcels) {
    byState[p.state] = (byState[p.state] ?? 0) + 1;
  }
  console.log("Distribution by state:");
  for (const [state, count] of Object.entries(byState)) {
    console.log(`  ${STATE_NAMES[state]}: ${count} parcels`);
  }

  const statusCounts: Record<string, number> = {};
  for (const p of parcels) {
    statusCounts[p.status] = (statusCounts[p.status] ?? 0) + 1;
  }
  console.log("\nDistribution by status:");
  for (const [status, count] of Object.entries(statusCounts)) {
    console.log(`  ${status}: ${count}`);
  }

  console.log("\nInserting into Supabase...");

  const { data, error } = await supabase.from("parcels").upsert(parcels, {
    onConflict: "parcel_id",
  });

  if (error) {
    console.error("Seed failed:", error.message);
    console.error("Details:", error);
    process.exit(1);
  }

  console.log(`\nSuccessfully seeded ${parcels.length} parcels.`);

  // Print a few examples
  console.log("\nSample parcels:");
  for (const p of parcels.slice(0, 3)) {
    console.log(`  ${p.parcel_id}`);
    console.log(`    ${p.county} County, ${STATE_NAMES[p.state]}`);
    console.log(`    ${p.acreage} acres — $${(p.price_cents / 100).toLocaleString()}`);
    console.log(`    ${p.description.slice(0, 100)}...`);
    console.log();
  }
}

seed();
