const { PrismaService } = require('feathers-prisma');

exports.<%= className %> = class <%= className %> extends PrismaService {
  constructor({ client, model, ...options }) {
    super({
      model,
      ...options,
    }, client);
  }
};
