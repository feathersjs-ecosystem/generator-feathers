// <%= hookPath %>.js
// 
// Use this hook to manipulate incoming data or params before it is sent to the database.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

export default function(options) {
  return function(hook) {
    // manipulating data after a service method call
    if (hook.data) {
      hook.data.feathers = 'awesome';  
    }
  }
}