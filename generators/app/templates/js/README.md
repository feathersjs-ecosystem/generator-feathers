# <%= name %>

> <%= description %>

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

<% if (sandbox) { %>

## Getting Started (sandbox)

The following works for CodeSandbox and Glitch. Save this shell script to `sandbox.sh` and run with `sh sandbox.sh`

```
// save to sandbox.sh and run with `bash sandbox.sh`
cd /tmp
git clone https://github.com/feathersjs/generator-feathers.git
cd generator-feathers
git checkout master
npm install
cd /app || cd /sandbox
rm src/index.js && rm package.json
npx yo /tmp/generator-feathers
refresh || echo "PLEASE REFRESH"
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
