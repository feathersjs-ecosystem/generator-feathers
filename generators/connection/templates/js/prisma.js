const { PrismaClient } = require('@prisma/client');

module.exports = function (app) {
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
};
