import { signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { auth } from '../src/config/firebase.js';

const email = 'testuser+sim@example.com';
const password = 'password123';

const run = async () => {
  console.log('Signing in as', email);
  await signInWithEmailAndPassword(auth, email, password);

  const user = auth.currentUser;
  if (!user) {
    console.error('No current user after sign-in');
    process.exit(1);
  }

  console.log('Deleting user:', user.uid);
  await deleteUser(user);
  console.log('User deleted');
};

run().catch((e) => {
  console.error('Cleanup error:', e);
  process.exit(1);
});
