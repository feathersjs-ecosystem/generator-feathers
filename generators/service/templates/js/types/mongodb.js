const { Service } = require('feathers-mongodb');

exports.<%= className %> = class <%= className %> extends Service {
  constructor(options, app) {
    super(options);
    
    app.get('mongoClient').then(db => {
      this.Model = db.collection('<%= kebabName %>');
    });
  }
};
