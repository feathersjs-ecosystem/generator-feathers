module.exports = function(generator) {
  const { props } = generator;
  const config = {
    host: 'localhost',
    port: 3030,
    public: '../public/',
    paginate: {
      default: 10,
      max: 50
    }
  };
  if (props.language === 'ts') {
    config.ts = true;
  }

  return config;
};
