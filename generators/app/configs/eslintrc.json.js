module.exports = generator => {
  const { props } = generator;
  const isTypescript = props.language === 'ts';

  const config = {
    env: {
      es6: true,
      node: true
    },
    parserOptions: {
      ecmaVersion: 2018
    },
    plugins: null,
    extends: ['eslint:recommended'],
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

    // rules
    config.rules['@typescript-eslint/no-explicit-any'] = 'off';
    config.rules['@typescript-eslint/no-empty-interface'] = 'off';
  } else {
    delete config.plugins;
  }
  
  return config;
};
