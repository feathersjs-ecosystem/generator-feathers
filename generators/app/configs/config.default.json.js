module.exports = function(generator) {
  const { props } = generator;
  const config = {
    host: 'localhost',
    port: props.sandbox ? 3000 : 3030, // Glitch mandates port 3000
    public: '../public/',
    paginate: {
      default: 10,
      max: 50
    },
    helmet: {
      <% if (this.props.sandbox) { %>frameguard: false,<% } %>
      contentSecurityPolicy: false
    }
  };

  return config;
};
