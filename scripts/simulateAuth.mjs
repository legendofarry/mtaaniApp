import { register, login } from '../src/services/auth.service.js';

const run = async () => {
  console.log('Simulating register...');
  const reg = await register('testuser+sim@example.com', 'password123', 'Sim User');
  console.log('Register result:', reg);

  console.log('\nSimulating login...');
  const log = await login('testuser+sim@example.com', 'password123');
  console.log('Login result:', log);
};

run().catch((e) => {
  console.error('Script error:', e);
  process.exit(1);
});
