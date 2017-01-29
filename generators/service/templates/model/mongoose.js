'use strict';

// <%= name %>-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongoose = app.get('mongooseClient');
  const <%= camelName %> = new mongoose.Schema({
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  return mongoose.model('<%= camelName %>', <%= camelName %>);
};
