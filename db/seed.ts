import 'dotenv/config';
import { db } from './index';
import { users } from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  const existingOwner = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.username, 'bryan'),
  });

  if (!existingOwner) {
    const passwordHash = await bcrypt.hash('199595b', 10);
    await db.insert(users).values({
      username: 'bryan',
      name: 'Bryan',
      passwordHash,
      role: 'OWNER',
      mustChangePassword: false,
    });
    console.log('Seeded owner user "bryan"');
  } else {
    console.log('Owner user "bryan" already exists');
  }
}

seed().catch(console.error);
