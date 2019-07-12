module.exports = () => {
  return function <%= camelName %>(req, res, next) {
    next();
  };
};
