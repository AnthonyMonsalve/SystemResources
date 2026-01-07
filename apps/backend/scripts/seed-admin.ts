import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../src/users/entities/user.entity';
import { Group } from '../src/groups/entities/group.entity';
import { GroupMember } from '../src/groups/entities/group-member.entity';
import { Post } from '../src/posts/entities/post.entity';
import { MediaFile } from '../src/media/entities/media-file.entity';

const DEFAULT_DB_URL =
  'postgres://system_resources:system_resources@localhost:5432/system_resources';

function getArgValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return undefined;
  }
  return process.argv[index + 1];
}

async function run() {
  const email =
    getArgValue('--email') ||
    process.env.ADMIN_EMAIL ||
    'admin@example.com';
  const password =
    getArgValue('--password') ||
    process.env.ADMIN_PASSWORD ||
    'ChangeMe123';
  const name = getArgValue('--name') || process.env.ADMIN_NAME || 'Admin';
  const databaseUrl = process.env.DATABASE_URL || DEFAULT_DB_URL;

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    entities: [User, Group, GroupMember, Post, MediaFile],
  });

  await dataSource.initialize();
  const usersRepository = dataSource.getRepository(User);
  const normalizedEmail = email.toLowerCase();

  const existing = await usersRepository.findOne({
    where: { email: normalizedEmail },
  });

  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    existing.role = UserRole.ADMIN;
    existing.name = name;
    existing.passwordHash = passwordHash;
    await usersRepository.save(existing);
    await dataSource.destroy();
    console.log(`Updated admin user: ${normalizedEmail}`);
    return;
  }

  const user = usersRepository.create({
    email: normalizedEmail,
    name,
    passwordHash,
    role: UserRole.ADMIN,
  });
  await usersRepository.save(user);
  await dataSource.destroy();
  console.log(`Created admin user: ${normalizedEmail}`);
}

run().catch((error) => {
  console.error('Failed to seed admin user:', error);
  process.exit(1);
});
