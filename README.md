# generator-feathers

[![Build Status](https://travis-ci.org/feathersjs/generator-feathers.png?branch=master)](https://travis-ci.org/feathersjs/generator-feathers) [![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/generator-feathers.svg)](https://greenkeeper.io/)

> A Yeoman generator for a Feathers application

## Installation

First you need install [yeoman](http://yeoman.io/).

```bash
npm install -g yo
```

Then install the feathers generator.

```bash
npm install -g yo generator-feathers-ts
```

## Usage

Create a directory for your new app.

```bash
mkdir my-new-app; cd my-new-app/
```

Generate your app and follow the prompts.

```bash
yo feathers-ts
```

Start your brand new app! 💥

```bash
npm start
```

## Available commands

```bash
# short alias for generate new application
yo feathers-ts

# set up authentication
yo feathers-ts:authentication

# set up a database connection
yo feathers-ts:connection

# generate new hook
yo feathers-ts:hook

# generate new middleware
yo feathers-ts:middleware

# generate new service
yo feathers-ts:service
```

## Production
[feathers/feathers-configuration](https://github.com/feathersjs/feathers-configuration) uses `NODE_ENV` to find a configuration file under `config/`. After updating `config/production.js` you can run 

```bash
NODE_ENV=production npm start
```

## Contributing

To contribute PRs for these generators, you will need to clone the repo
then inside the repo's directory, run `npm link`. This sets up a global
link to your local package for running tests (`npm test`) and generating
new feathers apps/services/hooks/etc.

When finished testing, optionally run `npm uninstall generator-feathers-ts` to remove
the link.

## License

Copyright (c) 2017

Licensed under the [MIT license](LICENSE).
