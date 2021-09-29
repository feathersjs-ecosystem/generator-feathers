# <%= name %>

> <%= description %>

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

<% if (sandbox) { %>

## Getting Started (sandbox)

The following works for CodeSandbox and Glitch. Save this shell script to `sandbox.sh` and run with `bash sandbox.sh`.  
Use the CodeSandbox Node HTTP Server Official template or the glitch-hello-node template.

```
#!/bin/bash 
set -euo pipefail

rm src/index.js >> /dev/null 2>&1 || :
rm server.js >> /dev/null 2>&1 || :
rm .gitignore >> /dev/null 2>&1 || :
rm README.md >> /dev/null 2>&1 || :
rm package.json
cd /tmp
git clone https://github.com/rayfoss/generator-feathers.git
cd generator-feathers
git checkout patch-1
npm install


cd /sandbox >> /dev/null 2>&1 || :
cd /app >> /dev/null 2>&1 || :
npx yo /tmp/generator-feathers

refresh >> /dev/null 2>&1 || :
pkill -9 -f yarn >> /dev/null 2>&1 || :
echo "Success, please REFRESH"
```
<% } %>

## Getting Started (local installation)

Getting up and running is as easy as 1, 2, 3.

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    ```
    cd path/to/<%= name %>
    npm install
    ```

3. Start your app

    ```
    npm start
    ```

## Testing

Simply run `npm test` and all your tests in the `test/` directory will be run.

## Scaffolding

Feathers has a powerful command line interface. Here are a few things it can do:

```
$ npm install -g @feathersjs/cli          # Install Feathers CLI

$ feathers generate service               # Generate a new Service
$ feathers generate hook                  # Generate a new Hook
$ feathers help                           # Show all commands
```

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).
