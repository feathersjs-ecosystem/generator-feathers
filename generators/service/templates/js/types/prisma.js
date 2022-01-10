const { PrismaService } = require('feathers-prisma');

exports.<%= className %> = class <%= className %> extends PrismaService {
  constructor({ model, ...options }, app) {
    super({
      model,
      ...options,
    }, app.get('prisma'));
  }
};
