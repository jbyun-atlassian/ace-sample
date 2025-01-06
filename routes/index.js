function get(httpClient, url) {
  return new Promise(function (resolve, reject) {
    httpClient.get(
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        url,
      },
      function (err, response, body) {
        if (err) {
          reject({
            statusCode: response.statusCode,
            message: err,
          });
        } else {
          resolve(body);
        }
      }
    );
  });
}

export default function routes(app, addon) {
    // Redirect root path to /atlassian-connect.json,
    // which will be served by atlassian-connect-express.
    app.get('/', (req, res) => {
        res.redirect('/atlassian-connect.json');
    });

    // This is an example route used by "generalPages" module (see atlassian-connect.json).
    // Verify that the incoming request is authenticated with Atlassian Connect.
    app.get('/hello-world', addon.authenticate(), async (req, res) => {
        // Rendering a template is easy; the render method takes two params: the name of the component or template file, and its props.
        // Handlebars and jsx are both supported, but please note that jsx changes require `npm run watch-jsx` in order to be picked up by the server.
        
        const apiSample = `/rest/atlassian-connect/1/addons/${addonKey}`;
        console.log("licenseApi url", licenseApi);
        const licApiResponse = await get(httpClient, licenseApi);

        
        res.render(
          'hello-world.hbs', // change this to 'hello-world.jsx' to use the Atlaskit & React version
          {
            title: 'Atlassian Connect'
            //, issueId: req.query['issueId']
            //, browserOnly: true // you can set this to disable server-side rendering for react views
          }
        );
    });



    // Add additional route handlers here...
}
