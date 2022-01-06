import { PrismaClient } from '@prisma/client';
import { Application } from './declarations';

export default function (app: Application): void {
  const connectionString = app.get('<%= database %>');
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });
  prisma.$connect();
  app.set('prisma', prisma);
}
