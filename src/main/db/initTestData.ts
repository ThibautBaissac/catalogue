import db from './database';

export function initializeTestData() {
  try {
    // Check if data already exists
    const existingCollections = db.prepare('SELECT COUNT(*) as count FROM collections').get() as any;
    const existingPigments = db.prepare('SELECT COUNT(*) as count FROM pigments').get() as any;
    const existingPapers = db.prepare('SELECT COUNT(*) as count FROM papers').get() as any;

    if (existingCollections.count === 0) {
      // Insert test collections
      const insertCollection = db.prepare(`
        INSERT INTO collections (name, description, date)
        VALUES (?, ?, ?)
      `);

      insertCollection.run('Série Paysages', 'Collection de paysages peints en extérieur', '2024-01-15');
      insertCollection.run('Portraits', 'Série de portraits réalisés en atelier', '2024-03-10');
      insertCollection.run('Abstractions', 'Œuvres abstraites contemporaines', '2024-06-20');
    }

    if (existingPigments.count === 0) {
      // Insert test pigments
      const insertPigment = db.prepare(`
        INSERT INTO pigments (name, description)
        VALUES (?, ?)
      `);

      insertPigment.run('Bleu Outremer', 'Pigment bleu profond, stable à la lumière');
      insertPigment.run('Rouge Cadmium', 'Rouge vif et opaque, excellente permanence');
      insertPigment.run('Jaune Cadmium', 'Jaune lumineux et opaque');
      insertPigment.run('Terre de Sienne Brûlée', 'Brun chaud naturel');
      insertPigment.run('Blanc de Titane', 'Blanc opaque de haute qualité');
      insertPigment.run('Noir d\'Ivoire', 'Noir profond avec une pointe de brun');
      insertPigment.run('Vert Véronèse', 'Vert froid et lumineux');
      insertPigment.run('Ocre Jaune', 'Jaune terreux naturel');
    }

    if (existingPapers.count === 0) {
      // Insert test papers
      const insertPaper = db.prepare(`
        INSERT INTO papers (name, description)
        VALUES (?, ?)
      `);

      insertPaper.run('Arches 300g', 'Papier aquarelle grain fin, 100% coton');
      insertPaper.run('Canson Montval 270g', 'Papier aquarelle grain moyen');
      insertPaper.run('Fabriano Artistico 640g', 'Papier aquarelle très épais, grain torchon');
      insertPaper.run('Hahnemühle 425g', 'Papier premium grain satiné');
      insertPaper.run('Clairefontaine Maya', 'Papier coloré grain léger');
    }

    console.log('Test data initialized successfully');
  } catch (error) {
    console.error('Error initializing test data:', error);
  }
}
