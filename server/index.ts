import { app } from './app.js';
import { seedDatabase } from './db/seed.js';

const PORT = process.env.PORT || 3000;

// Initialize database tables and seed designer content
try {
  seedDatabase();
} catch (err) {
  console.error('Failed to seed database:', err);
}

const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`✨ Toufiq Motion Editorial Blog Server (Node.js 2026)`);
  console.log(`🚀 API & App Live at: http://localhost:${PORT}`);
  console.log(`📚 REST API Endpoints:`);
  console.log(`   - GET  http://localhost:${PORT}/api/health`);
  console.log(`   - GET  http://localhost:${PORT}/api/posts`);
  console.log(`   - GET  http://localhost:${PORT}/api/stats`);
  console.log(`   - POST http://localhost:${PORT}/api/newsletter`);
  console.log(`   - POST http://localhost:${PORT}/api/inquiries`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`======================================================\n`);
});

export default server;
