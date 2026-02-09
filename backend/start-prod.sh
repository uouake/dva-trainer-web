#!/bin/bash
# Startup script for Render deployment

echo "🚀 Starting DVA Trainer Backend..."

# Run database schema creation
echo "📊 Setting up database schema..."
npm run db:schema

# Check if we need to seed (optional - only if questions don't exist)
echo "🌱 Checking if seeding is needed..."
node -e "
const { AppDataSource } = require('./src/infrastructure/db/data-source');

async function checkAndSeed() {
  await AppDataSource.initialize();
  const result = await AppDataSource.query('SELECT COUNT(*) as count FROM questions');
  await AppDataSource.destroy();
  
  if (result[0].count === '0') {
    console.log('No questions found, seeding required...');
    process.exit(1);
  } else {
    console.log('Database already seeded with', result[0].count, 'questions');
    process.exit(0);
  }
}

checkAndSeed().catch(() => process.exit(1));
"

if [ $? -ne 0 ]; then
  echo "📚 Seeding questions..."
  # Note: Seeding requires a question bank JSON file
  # For production, we'll need to handle this differently
  echo "⚠️  Please seed the database manually with your question bank"
fi

# Start the application
echo "🎯 Starting NestJS application..."
npm run start:prod
