// Add any common hooks you want to share across services in here.
// 
// Below is an example of how a hook is written and exported. Please
// see http://docs.feathersjs.com/hooks/readme.html for more details
// on hooks.

var myHook = function(options) {
  return function(hook) {
    // Setting a custom property
    hook.awesome = 'feathers';
    console.log('My custom hook ran. Feathers is awesome!');
  }
}

export default { myHook };