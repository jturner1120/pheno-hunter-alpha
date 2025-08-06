// Mock/Demo data for Pheno Hunter testing

export const createDemoData = () => {
  const demoPlants = [
    {
      id: 'demo_plant_1',
      name: 'Blue Dream #1',
      strain: 'Blue Dream',
      origin: 'Seed',
      datePlanted: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
      image: null,
      diary: `Day 1: Planted Blue Dream seed in seedling mix. High hopes for this strain!

Day 7: First cotyledons appeared. Looking healthy and strong.

Day 14: First true leaves developing nicely. Transplanted to larger pot.

Day 30: Plant is bushing out beautifully. Started LST (Low Stress Training).

Day 45: Switched to flower nutrients. Expecting great things from this girl!`,
      generation: 1,
      originalMotherId: null,
      harvested: false,
      harvestStats: null,
      createdBy: 'demo_user_1',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo_plant_2',
      name: 'OG Kush Mother',
      strain: 'OG Kush',
      origin: 'Seed',
      datePlanted: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
      image: null,
      diary: `This OG Kush has been my pride and joy. Started from a premium seed and she's been a champion throughout.

Vegged for 8 weeks with perfect structure. Great candidate for cloning.

Week 6 of flower: Dense, frosty buds with that classic OG aroma.

Week 8: Ready for harvest! This will be my new mother plant after I take some clones.`,
      generation: 1,
      originalMotherId: null,
      harvested: true,
      harvestStats: {
        weight: '89g dried',
        potency: '22% THC',
        notes: 'Incredible bag appeal. Dense, sticky buds with perfect cure. Strong OG gas aroma. Top shelf quality.',
        harvestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      createdBy: 'demo_user_1',
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo_plant_3',
      name: 'OG Kush Clone #1',
      strain: 'OG Kush',
      origin: 'Clone',
      datePlanted: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
      image: null,
      diary: `Cloned from OG Kush Mother on ${new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toLocaleDateString()}

Day 1: Took cutting and placed in cloning dome with rooting gel.

Day 10: Roots showing! Strong white root development.

Day 14: Transplanted to small pot. Looking very healthy.

Day 21: Growing vigorously. This clone has great potential!`,
      generation: 2,
      originalMotherId: 'demo_plant_2',
      harvested: false,
      harvestStats: null,
      createdBy: 'demo_user_1',
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo_plant_4',
      name: 'White Widow Auto',
      strain: 'White Widow Autoflower',
      origin: 'Seed',
      datePlanted: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(), // 75 days ago
      image: null,
      diary: `Fast-growing autoflower experiment. Curious to see how she performs.

Week 2: Explosive growth as expected from auto genetics.

Week 5: Pre-flowers showing. Auto genetics kicking in right on schedule.

Week 8: Harvest time approaching. Compact but dense buds forming.`,
      generation: 1,
      originalMotherId: null,
      harvested: true,
      harvestStats: {
        weight: '45g dried',
        potency: '18% THC',
        notes: 'Great autoflower results. Quick harvest, decent yield for the size. Perfect for personal stash.',
        harvestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      createdBy: 'demo_user_1',
      createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  return demoPlants;
};

export const loadDemoData = () => {
  // Only load demo data if no plants exist
  const existingPlants = JSON.parse(localStorage.getItem('phenoHunter_plants') || '[]');
  
  if (existingPlants.length === 0) {
    const demoPlants = createDemoData();
    localStorage.setItem('phenoHunter_plants', JSON.stringify(demoPlants));
    console.log('Demo data loaded! You now have 4 sample plants to explore.');
    return demoPlants;
  }
  
  return existingPlants;
};

export const clearAllData = () => {
  localStorage.removeItem('phenoHunter_plants');
  localStorage.removeItem('phenoHunter_auth');
  console.log('All data cleared!');
};

export const resetWithDemoData = () => {
  clearAllData();
  return loadDemoData();
};
