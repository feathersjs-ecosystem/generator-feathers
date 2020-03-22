module.exports = generator => {
  const { props } = generator;
  const isTypescript = props.language === 'ts';
  const config = {
    env: {
      es6: true,
      node: true
    },
    rules: {
      'indent': [
        'error',
        2
      ],
      'linebreak-style': [
        'error',
        'unix'
      ],
      'quotes': [
        'error',
        'single'
      ],
      'semi': [
        'error',
        'always'
      ]
    }
  };
  config.env[props.tester] = true;

  if (isTypescript) {
    config.parserOptions = {
      parser: '@typescript-eslint/parser',
      ecmaVersion: 2018,
      sourceType: 'module'
    };

    config.plugins = ['@typescript-eslint'];
    config.extends = [
      'plugin:@typescript-eslint/recommended'
    ];
  } else {
    config.parserOptions = {
      ecmaVersion: 2018
    };
    config.extends = 'eslint:recommended';
  }
  
  return config;
};
