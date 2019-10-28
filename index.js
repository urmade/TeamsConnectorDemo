//Create a basic Node.js server
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const request = require("request");

dotenv.config();

app.get("/", (req,res) => {
    //Send out the configuration page of the connector
    res.sendFile(__dirname + "/config.html");
})

//This demo implements server-side login and doesn't pass any information to the client
app.get("/login", (req,res) => {
    res.redirect(
        //[Tenant ID] Can be "common" to support multi-tenant login (meaning every person with every Microsoft-Account can log into the app) or a specific tenant ID to only allow logins from that tenant
        //[Version] Currently v1.0 and v2.0 exist. v1.0 only allows login from organizational accounts, v2.0 allows login from organizational and personal accounts
        "https://login.microsoftonline.com/" + process.env.TENANT_ID + "/oauth2/v2.0/authorize?" +
        //[client_id] Enter the ID of the enterprise application or application registration you want to use
        "client_id=" + process.env.CLIENT_ID +
        //[response_type] Specifies what Active Directory will return after a successful login action. Must at least be "code" for the OAuth 2.0 flow and "id_token" for the OpenIdConnect flow and can have "token" as an additional value
        "&response_type=code" +
        //[redirect_uri] The URL which will be called with the registration code as a query parameter
        "&redirect_uri=" + process.env.BASE_URL + process.env.REDIRECT_URL +
        //[response_mode] Specifies with which method the code should be returned to the application. Can be query, form_post or fragment
        "&response_mode=query" +
        //[state] The state parameter gets passed through the whole authorization workflow and can be used to store information that is important for your own application
        "&state= " +
        //[scope] The scope parameter specifies the permissions that the token received has to call different Microsoft services
        "&scope=" + process.env.SCOPE 
        //Optional parameters
        //[Prompt] Can has the values "login", "consent" and "none" and determines which prompt will be shown to the user when he logs in
        //[Login_hint] Can be used to auto fill-in the email adress or user name of the user who wants to authenticate
        //[Domain_hint] Can has the values "consumers" or "organizations" and determines which type of account can log in
      );
})

//This endpoint will receive the code with which it can request user information
app.get(process.env.REDIRECT_URL, (req, res) => {
    //The authentification code is passed to the redirect url as a query parameter called 'code'
    const authCode = req.query.code;
    //Simple check if the url was called with an authentification code to prevent unnecessary HTTP calls
    if (!authCode) {
      res.status(500).send("There was no authorization code provided in the query. No Bearer token can be requested");
      return;
    }
    //Options for the HTTP call (necessary for the request module call)
    const options = {
      method: "POST",
      //[url] Tenant and version must match the code retrieval parameters
      url: "https://login.microsoftonline.com/" + process.env.TENANT_ID + "/oauth2/v2.0/token",
      form: {
        //TODO: Used to specify that we want a Bearer token
        grant_type: "authorization_code",
        //[code] The code we got from the authorize-call which will be traded for a bearer token
        code: authCode,
        //[client_id] Enter the ID of the enterprise application or application registration you want to use
        client_id: process.env.CLIENT_ID,
        //[client_secret] Secret string that is used to prove your app has admin access to the application you want to log in, only necessary for Web Apps
        client_secret: process.env.CLIENT_SECRET,
        //[redirect_uri] The URL which was called with the authorization code (aka usually the current URL)
        redirect_uri: process.env.BASE_URL + process.env.REDIRECT_URL
      }
    };
    //Execute the HTTP Post call with the options set above
    request(options, function (error, response, body) {
      //Basic check to abort if the call itself couldn't be executed
      if (error) throw new Error(error);
      //Safety check to ensure that if the HTTP call didn't return a JSON (what usually shouldn't happen) the server doesn't crash at trying to parse
      try {
        //Parse JSON string from HTTP response to JSON object
        const json = JSON.parse(body);
        //If Active Directory couldn't hand out a Bearer token it will return a JSON object containing an error description
        if (json.error) res.status(500).send("Error occured: " + json.error + "\n" + json.error_description);
        else {
          //In this example only the Bearer token will be used. If you requested additional information, e.g. an ID-Token, you may have to send this as well
          res.sendFile(__dirname + "/callbackFrontend.html");
        }
      }
      catch (e) {
        res.status(500).send("The token acquirement did not return a JSON. Instead: \n" + body);
      }
    });
  });

app.listen(8000, () => {
    console.log("Server running!");
})