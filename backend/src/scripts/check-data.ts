import { AppDataSource } from '../infrastructure/db/data-source';
import { FlashcardEntity } from '../infrastructure/db/flashcard.entities';
import { ChapterEntity } from '../infrastructure/db/chapter.entities';

async function checkData() {
  console.log('🔍 Checking database data...\n');
  
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');

    // Check flashcards
    const flashcardRepo = AppDataSource.getRepository(FlashcardEntity);
    const flashcardCount = await flashcardRepo.count();
    console.log(`🎴 Flashcards: ${flashcardCount} found`);
    if (flashcardCount > 0) {
      const sample = await flashcardRepo.find({ take: 3 });
      sample.forEach(f => {
        console.log(`   - ${f.conceptKey}: ${f.front.substring(0, 50)}...`);
      });
    } else {
      console.log('   ⚠️  No flashcards found! Run: npm run db:seed-flashcards');
    }

    console.log('');

    // Check chapters
    const chapterRepo = AppDataSource.getRepository(ChapterEntity);
    const chapterCount = await chapterRepo.count();
    console.log(`📚 Chapters: ${chapterCount} found`);
    
    if (chapterCount > 0) {
      const chapters = await chapterRepo.find({ order: { number: 'ASC' } });
      const s1Count = chapters.filter(c => c.season === 1).length;
      const s2Count = chapters.filter(c => c.season === 2).length;
      
      console.log(`   - Season 1: ${s1Count} chapters`);
      console.log(`   - Season 2: ${s2Count} chapters`);
      
      if (s2Count === 0) {
        console.log('   ⚠️  No Season 2 chapters found! Run: npm run db:seed-chapters');
      }
      
      chapters.forEach(c => {
        console.log(`   [S${c.season || 1}] #${c.number}: ${c.title}`);
      });
    } else {
      console.log('   ⚠️  No chapters found! Run: npm run db:seed-chapters');
    }

    console.log('\n📋 Summary:');
    if (flashcardCount === 0) {
      console.log('   ❌ Flashcards are EMPTY');
    } else {
      console.log('   ✅ Flashcards OK');
    }
    
    if (chapterCount === 0) {
      console.log('   ❌ Chapters are EMPTY');
    } else {
      console.log('   ✅ Chapters OK');
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

checkData();
