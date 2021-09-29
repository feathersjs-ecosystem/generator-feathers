module.exports = function(generator) {
  const { props } = generator;
  const config = {
    host: props.sandbox ? '0.0.0.0' : 'localhost',
    port: props.sandbox ? 3000 : 3030, // Glitch mandates port 3000
    public: '../public/',
    paginate: {
      default: 10,
      max: 50
    },
    helmet: {
      contentSecurityPolicy: false
    }
  };
  
  if (props.sandbox) {
    config.helmet.frameguard = false // Sandbox embedded preview browser support
  }

  return config;
};
