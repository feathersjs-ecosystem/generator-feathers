export default function(error, req, res, next) {
  let app = req.app;

  if (error) {
    console.error(`${error.code ? `(${error.code}) ` : '' }Route: ${req.url} - ${error.message}`);
    
    if (app.settings.env !== 'production') {
      console.trace(error.stack);
    }
  }

  next(error);
};