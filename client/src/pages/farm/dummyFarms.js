/**
 * Dummy / Sample farm profiles for the Farm Management section.
 * Provides rich, realistic Sri Lankan agricultural scenarios with crops,
 * expenses, revenue records, and calculated agronomic insights.
 */

export const computeFarmInsights = (farm) => {
  const expenses = farm.expenses || [];
  const revenue = farm.revenue || [];
  const crops = farm.currentCrops || [];

  const totalRevenue = revenue.reduce((s, r) => s + (r.totalAmount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const revenuePerAcre = farm.landSize > 0 ? totalRevenue / farm.landSize : 0;
  const expensePerAcre = farm.landSize > 0 ? totalExpenses / farm.landSize : 0;

  const activeCrops = crops.filter((c) => c.status === 'growing').length;
  const totalCropArea = crops.reduce((s, c) => s + (Number(c.area) || 0), 0);
  const landUtilization = farm.landSize > 0 ? (totalCropArea / farm.landSize) * 100 : 0;

  const expenseMap = {};
  expenses.forEach((e) => {
    expenseMap[e.category] = (expenseMap[e.category] || 0) + (e.amount || 0);
  });
  const expenseBreakdown = Object.entries(expenseMap).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
  }));

  const topRevenueCrop = revenue.length
    ? revenue.reduce((best, r) => ((r.totalAmount || 0) > (best.totalAmount || 0) ? r : best), revenue[0])
    : null;

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin: Math.round(profitMargin * 100) / 100,
    revenuePerAcre: Math.round(revenuePerAcre),
    expensePerAcre: Math.round(expensePerAcre),
    activeCrops,
    totalCrops: crops.length,
    landUtilization: Math.round(landUtilization * 100) / 100,
    expenseBreakdown,
    topRevenueCrop,
  };
};

export const DUMMY_FARMS = [
  {
    _id: 'dummy-green-valley',
    isDummy: true,
    name: 'Green Valley Organic Estate',
    location: 'Nuwara Eliya',
    landSize: 14.5,
    tagline: 'High-altitude organic tea & cold-climate vegetable cultivation',
    description: 'A model hill-country agro-enterprise integrating certified organic Ceylon tea terraces with modern drip-irrigated root crops and greenhouse strawberries.',
    soilType: 'Mountain Red-Yellow Podzolic',
    climate: 'Cool Mountain (16°C • 1,800m ASL)',
    badges: ['Organic Certified', 'High Yield', 'Export Grade'],
    gradient: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 60%, #388e3c 100%)',
    avatarEmoji: '🍵',
    currentCrops: [
      {
        cropName: 'Ceylon Black Tea',
        variety: 'TRI 2025 Clone',
        area: 6.0,
        plantedDate: '2024-01-15T00:00:00.000Z',
        expectedYield: 4200,
        status: 'growing',
      },
      {
        cropName: 'Organic Carrots',
        variety: 'New Kuroda',
        area: 3.5,
        plantedDate: '2024-02-10T00:00:00.000Z',
        expectedYield: 2800,
        status: 'growing',
      },
      {
        cropName: 'Bell Peppers (Capsicum)',
        variety: 'Inspiration F1',
        area: 2.0,
        plantedDate: '2023-11-20T00:00:00.000Z',
        expectedYield: 1500,
        status: 'harvested',
      },
      {
        cropName: 'Fresh Strawberries',
        variety: 'Sweet Charlie',
        area: 1.5,
        plantedDate: '2024-03-01T00:00:00.000Z',
        expectedYield: 850,
        status: 'growing',
      },
    ],
    expenses: [
      { category: 'Organic Fertilizers & Compost', amount: 280000, date: '2024-02-15T00:00:00.000Z' },
      { category: 'Drip Irrigation Maintenance', amount: 140000, date: '2024-03-02T00:00:00.000Z' },
      { category: 'Harvest Labour & Plucking', amount: 220000, date: '2024-03-20T00:00:00.000Z' },
      { category: 'Seedlings & Nursery Care', amount: 80000, date: '2024-01-10T00:00:00.000Z' },
    ],
    revenue: [
      { label: 'Tea Factory Export Batch 04', totalAmount: 980000, date: '2024-03-25T00:00:00.000Z' },
      { label: 'Wholesale Carrots (Dambulla DEC)', totalAmount: 520000, date: '2024-03-28T00:00:00.000Z' },
      { label: 'Gourmet Bell Peppers & Berries', totalAmount: 350000, date: '2024-04-02T00:00:00.000Z' },
    ],
  },
  {
    _id: 'dummy-rajarata-heritage',
    isDummy: true,
    name: 'Rajarata Heritage Paddy Sanctuary',
    location: 'Anuradhapura',
    landSize: 25.0,
    tagline: 'Ancient cascade tank-fed traditional rice & legume fields',
    description: 'Preserving Sri Lankan heirloom grain biodiversity with regenerative zero-chemical farming practices, automated soil moisture monitors, and cooperative grain drying.',
    soilType: 'Reddish Brown Earth & Lowland Gley',
    climate: 'Dry Zone Tropical (29°C • Tank Irrigated)',
    badges: ['Heirloom Rice', 'Cascade Irrigation', 'Chemical-Free'],
    gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)',
    avatarEmoji: '🌾',
    currentCrops: [
      {
        cropName: 'Suwandel Traditional Rice',
        variety: 'Heirloom Aromatic',
        area: 12.0,
        plantedDate: '2023-12-05T00:00:00.000Z',
        expectedYield: 9800,
        status: 'growing',
      },
      {
        cropName: 'Keeri Samba Rice',
        variety: 'Bg 360 Certified',
        area: 7.0,
        plantedDate: '2023-12-12T00:00:00.000Z',
        expectedYield: 6200,
        status: 'harvested',
      },
      {
        cropName: 'Green Gram (Mung)',
        variety: 'MI-6 High-Protein',
        area: 3.5,
        plantedDate: '2024-02-20T00:00:00.000Z',
        expectedYield: 2100,
        status: 'growing',
      },
      {
        cropName: 'Finger Millet (Kurakkan)',
        variety: 'Oshadha Raw Grain',
        area: 1.5,
        plantedDate: '2024-01-25T00:00:00.000Z',
        expectedYield: 950,
        status: 'planned',
      },
    ],
    expenses: [
      { category: 'Tractor Ploughing & Land Prep', amount: 320000, date: '2023-11-28T00:00:00.000Z' },
      { category: 'Certified Bio-Inputs & Jeevamrutha', amount: 240000, date: '2024-01-14T00:00:00.000Z' },
      { category: 'Combine Harvester Rental', amount: 280000, date: '2024-03-10T00:00:00.000Z' },
      { category: 'Storage Bags & Moisture Control', amount: 140000, date: '2024-03-22T00:00:00.000Z' },
    ],
    revenue: [
      { label: 'Organic Suwandel Direct Mill Contract', totalAmount: 1420000, date: '2024-03-18T00:00:00.000Z' },
      { label: 'Keeri Samba Grain Board Delivery', totalAmount: 880000, date: '2024-03-25T00:00:00.000Z' },
      { label: 'Green Gram Wholesale Lot', totalAmount: 260000, date: '2024-04-05T00:00:00.000Z' },
    ],
  },
  {
    _id: 'dummy-lanka-spices',
    isDummy: true,
    name: 'Lanka Golden Coconut & Spice Groves',
    location: 'Kurunegala',
    landSize: 18.0,
    tagline: 'Multi-story agroforestry pairing tall coconuts and export spices',
    description: 'High-density multi-crop ecosystem utilizing canopy microclimates. Tall coconut palms provide shade for high-grade Ceylon cinnamon, black pepper vines, and intercropped papaya.',
    soilType: 'Intermediate Red-Yellow Latosols',
    climate: 'Sub-Humid Tropical (28°C • Bi-Modal Rain)',
    badges: ['Multi-Tier Agroforestry', 'Export Spices', 'Solar Pumped'],
    gradient: 'linear-gradient(135deg, #0f766e 0%, #0d9488 55%, #14b8a6 100%)',
    avatarEmoji: '🥥',
    currentCrops: [
      {
        cropName: 'Tall Coconut Palms',
        variety: 'CRIC 60 High Producer',
        area: 10.0,
        plantedDate: '2020-05-10T00:00:00.000Z',
        expectedYield: 18500,
        status: 'growing',
      },
      {
        cropName: 'Ceylon True Cinnamon',
        variety: 'Sri Gemunu Alba Grade',
        area: 4.5,
        plantedDate: '2022-09-15T00:00:00.000Z',
        expectedYield: 850,
        status: 'growing',
      },
      {
        cropName: 'Black Pepper Vines',
        variety: 'Panniyur-1 High Piperine',
        area: 2.0,
        plantedDate: '2023-04-18T00:00:00.000Z',
        expectedYield: 600,
        status: 'harvested',
      },
      {
        cropName: 'Red Lady Papaya',
        variety: 'F1 Hybrid Sweet',
        area: 1.5,
        plantedDate: '2023-10-01T00:00:00.000Z',
        expectedYield: 4200,
        status: 'growing',
      },
    ],
    expenses: [
      { category: 'Cinnamon Peeling & Curing Labor', amount: 195000, date: '2024-01-28T00:00:00.000Z' },
      { category: 'Organic Potassium & Husking', amount: 160000, date: '2024-02-14T00:00:00.000Z' },
      { category: 'Solar Pump Micro-Sprinklers', amount: 110000, date: '2024-03-05T00:00:00.000Z' },
      { category: 'Disease Scouting & Pheromone Traps', amount: 75000, date: '2024-03-20T00:00:00.000Z' },
    ],
    revenue: [
      { label: 'Fresh Husked Coconuts (10k lot)', totalAmount: 850000, date: '2024-02-10T00:00:00.000Z' },
      { label: 'Ceylon Alba Cinnamon Quills Export', totalAmount: 720000, date: '2024-03-15T00:00:00.000Z' },
      { label: 'Black Pepper & Sun-dried Papaya', totalAmount: 310000, date: '2024-04-01T00:00:00.000Z' },
    ],
  },
  {
    _id: 'dummy-kandy-greenhouse',
    isDummy: true,
    name: 'Kandy Mountain Spice & Greenhouse Haven',
    location: 'Kandy',
    landSize: 8.5,
    tagline: 'Precision climate-controlled poly-tunnels and stepped spice terraces',
    description: 'Precision horticulture combining sensor-driven greenhouse hydroponics with terraced hillside cardamom and clove plantings, producing year-round supermarket grade crops.',
    soilType: 'Mid-Country Latosolic & Organic Humus',
    climate: 'Mild Hilltop (23°C • Precision Controlled)',
    badges: ['Smart Greenhouse', 'Hydroponics', 'Precision Fed'],
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0284c7 100%)',
    avatarEmoji: '🌶️',
    currentCrops: [
      {
        cropName: 'Hydroponic Salad Tomatoes',
        variety: 'Cheramy F1 Indeterminate',
        area: 2.0,
        plantedDate: '2024-01-08T00:00:00.000Z',
        expectedYield: 5200,
        status: 'growing',
      },
      {
        cropName: 'Cardamom & Cloves',
        variety: 'Malabar Green Giant',
        area: 3.5,
        plantedDate: '2022-03-10T00:00:00.000Z',
        expectedYield: 550,
        status: 'growing',
      },
      {
        cropName: 'Export Green String Beans',
        variety: 'Topcrop Bush Variety',
        area: 1.5,
        plantedDate: '2024-02-15T00:00:00.000Z',
        expectedYield: 2400,
        status: 'growing',
      },
      {
        cropName: 'Exotic Oyster Mushrooms',
        variety: 'Pleurotus ostreatus (Grey)',
        area: 0.5,
        plantedDate: '2024-03-01T00:00:00.000Z',
        expectedYield: 900,
        status: 'harvested',
      },
    ],
    expenses: [
      { category: 'Hydroponic Nutrients & Solution A/B', amount: 145000, date: '2024-01-20T00:00:00.000Z' },
      { category: 'Poly-tunnel Climate & Evaporative Pads', amount: 95000, date: '2024-02-12T00:00:00.000Z' },
      { category: 'Trellising Lines & Pruning Equipment', amount: 65000, date: '2024-03-01T00:00:00.000Z' },
      { category: 'Bio-Fungicides & Yellow Sticky Traps', amount: 55000, date: '2024-03-18T00:00:00.000Z' },
    ],
    revenue: [
      { label: 'Supermarket Grade Hydroponic Tomatoes', totalAmount: 640000, date: '2024-03-05T00:00:00.000Z' },
      { label: 'Highland Cardamom & Cloves Parcel', totalAmount: 480000, date: '2024-03-22T00:00:00.000Z' },
      { label: 'Gourmet Oyster Mushrooms Daily Harvests', totalAmount: 190000, date: '2024-04-03T00:00:00.000Z' },
    ],
  },
];
