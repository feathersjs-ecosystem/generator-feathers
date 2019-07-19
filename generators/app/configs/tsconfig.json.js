module.exports = function(generator) {
  const { props } = generator;
  const config = {
    compilerOptions: {
      target: 'es2018',
      module: 'commonjs',
      outDir: './lib',
      rootDir: `./${props.src}`,
      strict: true,
      esModuleInterop: true
    },
    exclude: ['test']
  };
  
  return config;
};
