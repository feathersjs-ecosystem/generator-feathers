module.exports = function() {
  const config = {
    compilerOptions: {
      target: 'es5',
      module: 'commonjs',
      outDir: './lib',
      rootDir: './src',
      strict: true,
      esModuleInterop: true
    }
  };
  
  return config;
};
