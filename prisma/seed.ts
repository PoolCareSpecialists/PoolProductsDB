import { PrismaClient, ProductStatus, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  console.log("Seeding database...");

  // --- Manufacturers ---
  const hayward = await prisma.manufacturer.upsert({
    where: { name: "Hayward Industries" },
    update: {},
    create: { name: "Hayward Industries", website: "https://www.hayward-pool.com", country: "USA" },
  });

  const pentair = await prisma.manufacturer.upsert({
    where: { name: "Pentair" },
    update: {},
    create: { name: "Pentair", website: "https://www.pentair.com", country: "USA" },
  });

  const jandy = await prisma.manufacturer.upsert({
    where: { name: "Zodiac / Jandy" },
    update: {},
    create: { name: "Zodiac / Jandy", website: "https://www.jandy.com", country: "USA" },
  });

  // --- Brands (compound unique: manufacturerId + name) ---
  const haywardBrand = await prisma.brand.upsert({
    where: { manufacturerId_name: { manufacturerId: hayward.id, name: "Hayward" } },
    update: {},
    create: { name: "Hayward", manufacturerId: hayward.id },
  });

  const pentairBrand = await prisma.brand.upsert({
    where: { manufacturerId_name: { manufacturerId: pentair.id, name: "Pentair" } },
    update: {},
    create: { name: "Pentair", manufacturerId: pentair.id },
  });

  const jandyBrand = await prisma.brand.upsert({
    where: { manufacturerId_name: { manufacturerId: jandy.id, name: "Jandy" } },
    update: {},
    create: { name: "Jandy", manufacturerId: jandy.id },
  });

  // --- Categories ---
  const pumps = await prisma.category.upsert({
    where: { slug: "pumps" },
    update: {},
    create: { name: "Pumps", slug: "pumps" },
  });

  const variableSpeedPumps = await prisma.category.upsert({
    where: { slug: "variable-speed-pumps" },
    update: {},
    create: { name: "Variable Speed Pumps", slug: "variable-speed-pumps", parentId: pumps.id },
  });

  const filters = await prisma.category.upsert({
    where: { slug: "filters" },
    update: {},
    create: { name: "Filters", slug: "filters" },
  });

  const sandFilters = await prisma.category.upsert({
    where: { slug: "sand-filters" },
    update: {},
    create: { name: "Sand Filters", slug: "sand-filters", parentId: filters.id },
  });

  const heaters = await prisma.category.upsert({
    where: { slug: "heaters" },
    update: {},
    create: { name: "Heaters", slug: "heaters" },
  });

  const gasHeaters = await prisma.category.upsert({
    where: { slug: "gas-heaters" },
    update: {},
    create: { name: "Gas Heaters", slug: "gas-heaters", parentId: heaters.id },
  });

  const robotics = await prisma.category.upsert({
    where: { slug: "robotic-cleaners" },
    update: {},
    create: { name: "Robotic Cleaners", slug: "robotic-cleaners" },
  });

  const saltSystems = await prisma.category.upsert({
    where: { slug: "salt-chlorine-generators" },
    update: {},
    create: { name: "Salt Chlorine Generators", slug: "salt-chlorine-generators" },
  });

  // --- Admin user ---
  await prisma.user.upsert({
    where: { email: "admin@poolproductsdb.local" },
    update: {},
    create: { email: "admin@poolproductsdb.local", name: "Admin", role: UserRole.ADMIN },
  });

  // --- Products (upsert on upc which is @unique) ---

  // 1. Hayward TriStar VS
  const tristarVS = await prisma.product.upsert({
    where: { upc: "610377132829" },
    update: {},
    create: {
      brandId: haywardBrand.id,
      categoryId: variableSpeedPumps.id,
      name: "TriStar VS Variable Speed Pump",
      modelNumber: "SP3202VSP",
      upc: "610377132829",
      description:
        "The Hayward TriStar VS is a variable-speed pump that delivers significant energy savings compared to single-speed pumps. Features a totally enclosed fan-cooled (TEFC) motor, built-in timer, and speed memory. ENERGY STAR certified.",
      status: ProductStatus.ACTIVE,
    },
  });

  await prisma.productSpec.createMany({
    skipDuplicates: true,
    data: [
      { productId: tristarVS.id, specKey: "Horsepower", specValue: "1.85", unit: "THP" },
      { productId: tristarVS.id, specKey: "Speed Range", specValue: "600–3450", unit: "RPM" },
      { productId: tristarVS.id, specKey: "Max Flow Rate", specValue: "120", unit: "GPM" },
      { productId: tristarVS.id, specKey: "Voltage", specValue: "230", unit: "V" },
      { productId: tristarVS.id, specKey: "Amperage", specValue: "11.8", unit: "A (max)" },
      { productId: tristarVS.id, specKey: "Inlet/Outlet", specValue: "2", unit: "inch" },
      { productId: tristarVS.id, specKey: "Certifications", specValue: "ENERGY STAR", unit: "" },
    ],
  });

  await prisma.maintenanceSchedule.createMany({
    skipDuplicates: true,
    data: [
      { productId: tristarVS.id, taskName: "Clean strainer basket", intervalValue: 1, intervalUnit: "weeks", notes: "More frequently during heavy use or after storms" },
      { productId: tristarVS.id, taskName: "Inspect O-rings and seals", intervalValue: 6, intervalUnit: "months", notes: "Replace if cracked or damaged" },
      { productId: tristarVS.id, taskName: "Check shaft seal for leaks", intervalValue: 1, intervalUnit: "years" },
      { productId: tristarVS.id, taskName: "Lubricate lid O-ring", intervalValue: 6, intervalUnit: "months", notes: "Use Teflon-based lubricant only" },
    ],
  });

  // 2. Pentair IntelliFlo3 VSF
  const intelliflo = await prisma.product.upsert({
    where: { upc: "787721230557" },
    update: {},
    create: {
      brandId: pentairBrand.id,
      categoryId: variableSpeedPumps.id,
      name: "IntelliFlo3 VSF Variable Speed & Flow Pump",
      modelNumber: "023055",
      upc: "787721230557",
      description:
        "The Pentair IntelliFlo3 VSF combines variable speed and flow technology to deliver precise GPM control. Integrated with IntelliConnect and EasyTouch automation systems. Up to 90% energy savings vs. traditional pumps.",
      status: ProductStatus.ACTIVE,
    },
  });

  await prisma.productSpec.createMany({
    skipDuplicates: true,
    data: [
      { productId: intelliflo.id, specKey: "Horsepower", specValue: "3.0", unit: "HP" },
      { productId: intelliflo.id, specKey: "Speed Range", specValue: "450–3450", unit: "RPM" },
      { productId: intelliflo.id, specKey: "Max Flow Rate", specValue: "160", unit: "GPM" },
      { productId: intelliflo.id, specKey: "Voltage", specValue: "208–230", unit: "V" },
      { productId: intelliflo.id, specKey: "Certifications", specValue: "ENERGY STAR", unit: "" },
      { productId: intelliflo.id, specKey: "Communication", specValue: "RS-485", unit: "" },
    ],
  });

  await prisma.maintenanceSchedule.createMany({
    skipDuplicates: true,
    data: [
      { productId: intelliflo.id, taskName: "Clean strainer basket", intervalValue: 1, intervalUnit: "weeks" },
      { productId: intelliflo.id, taskName: "Inspect lid O-ring", intervalValue: 6, intervalUnit: "months" },
      { productId: intelliflo.id, taskName: "Check for leaks around unions", intervalValue: 3, intervalUnit: "months" },
    ],
  });

  // 3. Hayward ProSeries Sand Filter
  const proSeries = await prisma.product.upsert({
    where: { upc: "610377033690" },
    update: {},
    create: {
      brandId: haywardBrand.id,
      categoryId: sandFilters.id,
      name: "ProSeries Top-Mount Sand Filter",
      modelNumber: "S244T",
      upc: "610377033690",
      description:
        "The Hayward ProSeries sand filter features a corrosion-proof tank, self-cleaning lateral system, and easy-to-use 7-position valve. Ideal for pools up to 30,000 gallons.",
      status: ProductStatus.ACTIVE,
    },
  });

  await prisma.productSpec.createMany({
    skipDuplicates: true,
    data: [
      { productId: proSeries.id, specKey: "Tank Diameter", specValue: "24", unit: "inch" },
      { productId: proSeries.id, specKey: "Sand Capacity", specValue: "300", unit: "lbs" },
      { productId: proSeries.id, specKey: "Max Flow Rate", specValue: "60", unit: "GPM" },
      { productId: proSeries.id, specKey: "Working Pressure", specValue: "50", unit: "PSI" },
      { productId: proSeries.id, specKey: "Valve Positions", specValue: "7", unit: "" },
      { productId: proSeries.id, specKey: "Connection Size", specValue: "2", unit: "inch" },
    ],
  });

  await prisma.maintenanceSchedule.createMany({
    skipDuplicates: true,
    data: [
      { productId: proSeries.id, taskName: "Backwash filter", intervalValue: 4, intervalUnit: "weeks", notes: "Or when pressure rises 8–10 PSI above clean starting pressure" },
      { productId: proSeries.id, taskName: "Check and clean laterals", intervalValue: 1, intervalUnit: "years" },
      { productId: proSeries.id, taskName: "Replace filter sand", intervalValue: 5, intervalUnit: "years", notes: "Or when water clarity cannot be maintained despite backwashing" },
      { productId: proSeries.id, taskName: "Lubricate multiport valve O-ring", intervalValue: 1, intervalUnit: "years" },
    ],
  });

  // 4. Pentair MasterTemp 400
  const masterTemp = await prisma.product.upsert({
    where: { upc: "787721461660" },
    update: {},
    create: {
      brandId: pentairBrand.id,
      categoryId: gasHeaters.id,
      name: "MasterTemp 400 High Performance Gas Heater",
      modelNumber: "461166",
      upc: "787721461660",
      description:
        "The Pentair MasterTemp 400 is a high-efficiency natural gas pool and spa heater with a compact design. Features include a digital display, automatic pilot, and diagnostic system. Heats up to 8°F per hour in a typical residential pool.",
      status: ProductStatus.ACTIVE,
    },
  });

  await prisma.productSpec.createMany({
    skipDuplicates: true,
    data: [
      { productId: masterTemp.id, specKey: "BTU Input", specValue: "400,000", unit: "BTU/hr" },
      { productId: masterTemp.id, specKey: "Fuel Type", specValue: "Natural Gas / Propane", unit: "" },
      { productId: masterTemp.id, specKey: "Thermal Efficiency", specValue: "84", unit: "%" },
      { productId: masterTemp.id, specKey: "Voltage", specValue: "120", unit: "V" },
      { productId: masterTemp.id, specKey: "Max Pool Size", specValue: "100,000", unit: "gallons" },
      { productId: masterTemp.id, specKey: "Inlet/Outlet", specValue: "2", unit: "inch" },
      { productId: masterTemp.id, specKey: "Weight", specValue: "120", unit: "lbs" },
    ],
  });

  await prisma.maintenanceSchedule.createMany({
    skipDuplicates: true,
    data: [
      { productId: masterTemp.id, taskName: "Inspect burner tray and combustion chamber", intervalValue: 1, intervalUnit: "years" },
      { productId: masterTemp.id, taskName: "Check flue and vent for obstructions", intervalValue: 6, intervalUnit: "months" },
      { productId: masterTemp.id, taskName: "Clean heat exchanger fins", intervalValue: 1, intervalUnit: "years" },
      { productId: masterTemp.id, taskName: "Test high limit switches", intervalValue: 1, intervalUnit: "years" },
      { productId: masterTemp.id, taskName: "Check gas pressure", intervalValue: 1, intervalUnit: "years", notes: "Should be performed by a licensed technician" },
    ],
  });

  // 5. Jandy AquaPure Salt System
  const aquaPure = await prisma.product.upsert({
    where: { upc: "012456789035" },
    update: {},
    create: {
      brandId: jandyBrand.id,
      categoryId: saltSystems.id,
      name: "AquaPure Salt Chlorine Generator",
      modelNumber: "APURE35",
      upc: "012456789035",
      description:
        "The Jandy AquaPure is a whole-home water purification system that uses salt electrolysis to generate chlorine continuously. Produces up to 1.5 lbs of chlorine per day and includes a self-cleaning reversing cell.",
      status: ProductStatus.ACTIVE,
    },
  });

  await prisma.productSpec.createMany({
    skipDuplicates: true,
    data: [
      { productId: aquaPure.id, specKey: "Pool Capacity", specValue: "35,000", unit: "gallons" },
      { productId: aquaPure.id, specKey: "Chlorine Output", specValue: "1.5", unit: "lbs/day" },
      { productId: aquaPure.id, specKey: "Salt Level (ideal)", specValue: "3200", unit: "PPM" },
      { productId: aquaPure.id, specKey: "Voltage", specValue: "120/240", unit: "V" },
      { productId: aquaPure.id, specKey: "Cell Type", specValue: "Self-cleaning reversing", unit: "" },
      { productId: aquaPure.id, specKey: "Flow Rate (min)", specValue: "20", unit: "GPM" },
    ],
  });

  await prisma.maintenanceSchedule.createMany({
    skipDuplicates: true,
    data: [
      { productId: aquaPure.id, taskName: "Check salt level", intervalValue: 2, intervalUnit: "weeks" },
      { productId: aquaPure.id, taskName: "Inspect cell for scale buildup", intervalValue: 3, intervalUnit: "months" },
      { productId: aquaPure.id, taskName: "Clean cell with acid wash if needed", intervalValue: 6, intervalUnit: "months", notes: "Use 4:1 water to muriatic acid solution" },
      { productId: aquaPure.id, taskName: "Replace cell", intervalValue: 5, intervalUnit: "years", notes: "Average cell life 3–7 years depending on use" },
    ],
  });

  // 6. Hayward TigerShark Robotic Cleaner
  const tigerShark = await prisma.product.upsert({
    where: { upc: "610377095605" },
    update: {},
    create: {
      brandId: haywardBrand.id,
      categoryId: robotics.id,
      name: "TigerShark Robotic Pool Cleaner",
      modelNumber: "RC9740CUB",
      upc: "610377095605",
      description:
        "The Hayward TigerShark robotic cleaner scrubs and vacuums pool floors and walls automatically. Features a built-in cartridge filter, 2-hour auto-clean cycle, and works independently from the pool filtration system.",
      status: ProductStatus.ACTIVE,
    },
  });

  await prisma.productSpec.createMany({
    skipDuplicates: true,
    data: [
      { productId: tigerShark.id, specKey: "Cleaning Area", specValue: "Floor + walls", unit: "" },
      { productId: tigerShark.id, specKey: "Cycle Time", specValue: "2", unit: "hours" },
      { productId: tigerShark.id, specKey: "Filter Type", specValue: "Cartridge", unit: "" },
      { productId: tigerShark.id, specKey: "Voltage (supply)", specValue: "120", unit: "V" },
      { productId: tigerShark.id, specKey: "Power Supply Output", specValue: "29", unit: "VDC" },
      { productId: tigerShark.id, specKey: "Cable Length", specValue: "60", unit: "ft" },
      { productId: tigerShark.id, specKey: "Max Pool Length", specValue: "50", unit: "ft" },
    ],
  });

  await prisma.maintenanceSchedule.createMany({
    skipDuplicates: true,
    data: [
      { productId: tigerShark.id, taskName: "Clean filter cartridge", intervalValue: 1, intervalUnit: "weeks", notes: "Rinse with garden hose after each use" },
      { productId: tigerShark.id, taskName: "Inspect drive tracks and brushes", intervalValue: 1, intervalUnit: "months" },
      { productId: tigerShark.id, taskName: "Check swivel on cable", intervalValue: 3, intervalUnit: "months" },
      { productId: tigerShark.id, taskName: "Replace filter cartridge", intervalValue: 1, intervalUnit: "years" },
    ],
  });

  console.log("✅ Seed complete!");
  console.log("   Manufacturers: 3 (Hayward, Pentair, Zodiac/Jandy)");
  console.log("   Brands: 3");
  console.log("   Categories: 8");
  console.log("   Products: 6");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
