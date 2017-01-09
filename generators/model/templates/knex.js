module.exports = function(db) {
  db.schema.createTable('messages', function(table) {
    console.log('Creating messages table');
    table.increments('id');
    table.string('text');
    table.boolean('complete');
  });
};
