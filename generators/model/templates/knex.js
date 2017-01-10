module.exports = function(db) {
  return db.schema.createTable('messages', function(table) {
    console.log('Creating messages table');
    table.increments('id');
    table.string('text');
    table.boolean('complete');
  });
};
