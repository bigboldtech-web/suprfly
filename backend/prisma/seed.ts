import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Suprfly DB...');

  // Demo user
  const passwordHash = await bcrypt.hash('suprfly123!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@suprfly.io' },
    update: {},
    create: {
      email: 'demo@suprfly.io',
      passwordHash,
      name: 'Demo User',
      plan: 'STARTER',
      emailVerified: true,
      maxAccounts: 2,
      maxWorkflowsPerAccount: 3,
      maxKeywordsPerWorkflow: 5,
      maxCreatorsPerWorkflow: 20,
      maxCommentsDayPerAccount: 50,
      maxCommentsDayGlobal: 100,
    },
  });
  console.log('User:', user.email);

  // Two tones
  const [professionalTone, boldTone] = await Promise.all([
    prisma.tone.upsert({
      where: { userId_name: { userId: user.id, name: 'Professional' } },
      update: {},
      create: {
        userId: user.id,
        name: 'Professional',
        interactionStyle: 'PROFESSIONAL',
        writingStyle: 'POLISHED',
      },
    }),
    prisma.tone.upsert({
      where: { userId_name: { userId: user.id, name: 'Bold & Sharp' } },
      update: {},
      create: {
        userId: user.id,
        name: 'Bold & Sharp',
        interactionStyle: 'BOLD_CHALLENGING',
        writingStyle: 'SHARP_FLOWING',
      },
    }),
  ]);
  console.log('Tones:', professionalTone.name, '+', boldTone.name);

  // Two accounts (seeded with fake session data — extension will overwrite on real connect)
  const fakeSession = 'aabbccdd:eeff0011:demoencrypted';

  const xAccount = await prisma.connectedAccount.upsert({
    where: {
      userId_platform_platformUserId_accountKind: {
        userId: user.id,
        platform: 'TWITTER',
        platformUserId: 'demo-x',
        accountKind: 'PERSONAL',
      },
    },
    update: {},
    create: {
      userId: user.id,
      platform: 'TWITTER',
      accountKind: 'PERSONAL',
      platformUserId: 'demo-x',
      platformUsername: 'demouser',
      profileUrl: 'https://x.com/demouser',
      sessionData: fakeSession,
      sessionValid: false, // false until real cookies come in
    },
  });

  const liAccount = await prisma.connectedAccount.upsert({
    where: {
      userId_platform_platformUserId_accountKind: {
        userId: user.id,
        platform: 'LINKEDIN',
        platformUserId: 'demo-li',
        accountKind: 'PERSONAL',
      },
    },
    update: {},
    create: {
      userId: user.id,
      platform: 'LINKEDIN',
      accountKind: 'PERSONAL',
      platformUserId: 'demo-li',
      platformUsername: 'Demo User',
      profileUrl: 'https://www.linkedin.com/in/demouser',
      sessionData: fakeSession,
      sessionValid: false,
    },
  });
  console.log('Accounts:', xAccount.platform, '+', liAccount.platform);

  // Two workflows
  const xWorkflow = await prisma.workflow.create({
    data: {
      userId: user.id,
      accountId: xAccount.id,
      toneId: boldTone.id,
      name: 'X Engagement — Tech',
      targetType: 'KEYWORD',
      timezone: 'Asia/Kolkata',
      autoPost: false,
      language: 'en-US',
      commentTone: 'ENERGETIC',
      emojiEnabled: false,
      commentLength: 'SHORT',
      dailyLimit: 10,
      isActive: true,
      keywords: {
        create: [
          { userId: user.id, keyword: 'AI agents' },
          { userId: user.id, keyword: 'developer tools' },
          { userId: user.id, keyword: 'startup' },
          { userId: user.id, keyword: 'SaaS pricing' },
          { userId: user.id, keyword: 'product launch' },
        ],
      },
    },
  });

  const liWorkflow = await prisma.workflow.create({
    data: {
      userId: user.id,
      accountId: liAccount.id,
      toneId: professionalTone.id,
      name: 'LinkedIn Engagement — Leadership',
      targetType: 'CREATOR',
      timezone: 'Asia/Kolkata',
      autoPost: false,
      language: 'en-US',
      commentTone: 'THOUGHTFUL',
      emojiEnabled: false,
      commentLength: 'MEDIUM',
      dailyLimit: 10,
      isActive: true,
      creators: {
        create: [
          { userId: user.id, platform: 'LINKEDIN', creatorProfileId: 'fakeid-1', creatorName: 'Jane Doe', creatorUsername: 'janedoe' },
          { userId: user.id, platform: 'LINKEDIN', creatorProfileId: 'fakeid-2', creatorName: 'John Smith', creatorUsername: 'johnsmith' },
          { userId: user.id, platform: 'LINKEDIN', creatorProfileId: 'fakeid-3', creatorName: 'Acme CEO', creatorUsername: 'acmeceo' },
          { userId: user.id, platform: 'LINKEDIN', creatorProfileId: 'fakeid-4', creatorName: 'Tech VP', creatorUsername: 'techvp' },
          { userId: user.id, platform: 'LINKEDIN', creatorProfileId: 'fakeid-5', creatorName: 'Startup Founder', creatorUsername: 'sufounder' },
        ],
      },
    },
  });

  console.log('Workflows:', xWorkflow.name, '+', liWorkflow.name);
  console.log('Seed complete. Login: demo@suprfly.io / suprfly123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
