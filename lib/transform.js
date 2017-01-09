const j = require('jscodeshift');

j.registerMethods({
  insertInArray(ast) {
    this.forEach(node => {
      const elements = node.value.elements;
      elements.push(ast);
      j(node).replaceWith(j.arrayExpression(elements));
    });

    return this;
  }
}, j.ArrayExpression);

j.registerMethods({
  findDeclaration(name) {
    return this.findVariableDeclarators(name)
      .closest(j.VariableDeclaration);
  },
  
  findIdentifier(name) {
    const result = this.find(j.Identifier);

    if(name) {
      return result.filter(i => i.value.name === name);
    }

    return result;
  },

  findConfigure(name = '') {
    let result = this.findIdentifier('configure')
      .closest(j.ExpressionStatement);

    if (name) {
      result = result.findIdentifier(name)
        .closest(j.ExpressionStatement);
    }

    return result;
  },

  last() {
    if (this.length === 0) {
      return this;
    }

    return this.at(this.length - 1);
  },

  findModuleExports() {
    return this.filter(node => node.value.name === 'exports')
      .closest(j.ExpressionStatement);
  }
});

module.exports = j;
