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
  app.get("/", (req, res) => {
    res.redirect("/atlassian-connect.json");
  });

  // This is an example route used by "generalPages" module (see atlassian-connect.json).
  // Verify that the incoming request is authenticated with Atlassian Connect.
  app.get("/hello-world", addon.authenticate(), async (req, res) => {
    // Rendering a template is easy; the render method takes two params: the name of the component or template file, and its props.
    // Handlebars and jsx are both supported, but please note that jsx changes require `npm run watch-jsx` in order to be picked up by the server.

    res.render(
      "hello-world.hbs", // change this to 'hello-world.jsx' to use the Atlaskit & React version
      {
        title: "Atlassian Connect",
        //, issueId: req.query['issueId']
        //, browserOnly: true // you can set this to disable server-side rendering for react views
      }
    );
  });

  app.get("/getUserData", addon.checkValidToken(), async function (req, res) {
    var httpClient = addon.httpClient(req);
    console.log("accountId from text box:", req.query.accountId);

    var selectedAccountId = req.query.accountId;
    if (req.query.accountId.length == 0) {
      console.log("no account Id detected, just using logged in user account");
      selectedAccountId = req.context.userAccountId;
    }

    console.log("selectedAccountId:", selectedAccountId);

    let mySelfRes;
    try {
      const mySelfApi = "/rest/api/user?accountId=" + selectedAccountId;
      mySelfRes = await get(
        httpClient.asUserByAccountId(selectedAccountId),
        mySelfApi
      );
      console.log("mySelf API Response (impersonating), ", mySelfRes);
    } catch (ex) {
      console.log("mySelf API Response error (impersonating), ", ex);
      mySelfRes = ex;
    }

    let searchApiRes;
    try {
      const searchApi = "/rest/api/search?cql=type=page&limit=2";
      searchApiRes = await get(
        httpClient.asUserByAccountId(selectedAccountId),
        searchApi
      );
      console.log("search API Response (impersonating), ", searchApiRes);
    } catch (ex) {
      console.log("mySelf API Response error (impersonating), ", ex);
      searchApiRes = ex;
    }

    res.send(mySelfRes + "**********" + searchApiRes);
  });

  app.get("/user-detail", addon.authenticate(), async (req, res) => {

    var httpClient = addon.httpClient(req);
    console.log("++++++++++++++++++ from page level");
    var selectedAccountId = req.context.userAccountId;
    console.log("selectedAccountId:", selectedAccountId);

    let mySelfRes;
    try {
      // selectedAccountId = '70121:c2450c44-d28c-4951-85ba-9243bd278635'
      const mySelfApi = '/rest/api/user?accountId=' + selectedAccountId;
      mySelfRes = await get(httpClient.asUserByAccountId(selectedAccountId), mySelfApi);
      console.log('mySelf API Response (impersonating page level), ', mySelfRes);

    } catch (ex) {
      console.log('mySelf API Response error (impersonating page level), ', ex.message);
      mySelfRes = ex.message;
    }

    let searchApiRes;
    try {
      // selectedAccountId = '70121:c2450c44-d28c-4951-85ba-9243bd278635' // prod JSM seeker
      // selectedAccountId = '62570a8bcdc24000704b6e84' // local Confluence JSM seeker
      const searchApi = '/rest/api/search?cql=type=page&limit=2';
      searchApiRes = await get(httpClient.asUserByAccountId(selectedAccountId), searchApi);
      console.log('search API Response (impersonating page level), ', searchApiRes);

    } catch (ex) {
      console.log('mySelf API Response error (impersonating page level), ', ex.message);
      searchApiRes = ex.message;
    }

    console.log("+++++++++++++++++ [end] from page level");

    res.render(
      "check-user-detail.hbs", // change this to 'hello-world.jsx' to use the Atlaskit & React version
      {
        title: "Check User detail by impersonation",
        userData: mySelfRes + '**********' + searchApiRes
        //, issueId: req.query['issueId']
        //, browserOnly: true // you can set this to disable server-side rendering for react views
      }
    );
  });

  // Add additional route handlers here...
}
