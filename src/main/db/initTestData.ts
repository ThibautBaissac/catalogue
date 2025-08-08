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

    // Add some test artworks if none exist
    const existingArtworks = db.prepare('SELECT COUNT(*) as count FROM artworks').get() as any;
    if (existingArtworks.count === 0) {
      const insertArtwork = db.prepare(`
        INSERT INTO artworks (reference, title, description, owner, width, height, date, collection_id, type_id, place_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // Get collection IDs
      const collectionsResult = db.prepare('SELECT id, name FROM collections').all() as any[];
      const collections = collectionsResult.reduce((acc: any, col: any) => {
        acc[col.name] = col.id;
        return acc;
      }, {});

  insertArtwork.run('PAY001', 'Coucher de soleil sur la Loire', 'Aquarelle réalisée lors d\'une sortie en bord de Loire', null, 30, 40, '2024-02-15', collections['Série Paysages'], null, null);
  insertArtwork.run('PAY002', 'Forêt d\'automne', 'Paysage forestier aux couleurs chaudes', null, 25, 35, '2024-03-08', collections['Série Paysages'], null, null);
  insertArtwork.run('POR001', 'Portrait de Marie', 'Portrait d\'une amie, technique mixte', null, 20, 30, '2024-04-12', collections['Portraits'], null, null);
  insertArtwork.run('ABS001', 'Mouvement bleu', 'Composition abstraite en nuances de bleu', null, 40, 50, '2024-07-01', collections['Abstractions'], null, null);
  insertArtwork.run('ABS002', 'Formes en dialogue', 'Interaction de formes géométriques', null, 35, 45, '2024-07-15', collections['Abstractions'], null, null);
    }

    console.log('Test data initialized successfully');
  } catch (error) {
    console.error('Error initializing test data:', error);
  }
}
