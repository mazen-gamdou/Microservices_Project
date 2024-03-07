const express = require("express");
const app = express();
const port = process.env.PORT || 3004; 
const cookieParser = require("cookie-parser");
const path = require("path");
const store = require("store2");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cors = require("cors");
app.use(cors());
store.set("test", { firstname: "test", lastname: "test", password: "test" });
app.use("/", express.static(path.join(__dirname, "www")));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Server initialization with proper error handling for port conflicts
const server = app.listen(0, () => {
  console.log(`Server is listening on port ${server.address().port}`);
});


function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1800s",
  });
}

app.get("*", (req, res, next) => {
  if (
    (req.query.client_id != process.env.CLIENT_ID) &
    (req.query.scope != "motus_app")
  ) {
    console.log("Non authorized to go here");
    res.status(403).send("Error 403: not authorized");
  } else {
    next();
  }
});

app.get("/authorize", (req, res) => {
  res.sendFile("/login.html", { root: __dirname + "/www" });
});

app.post("/authorize", (req, res) => {
  var userData = store.get(req.body.username);
  if (userData && userData.password === req.body.password) {
    const access_token = generateAccessToken({ username: req.body.username });
    console.log(access_token);
    console.log(req.query.redirect_uri);
    res.status(302).redirect(req.query.redirect_uri + "?token=" + access_token);
  } else {
    res.send("Invalid username or password");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/register", (req, res) => {
  res.sendFile("/register.html", { root: __dirname + "/www" });
});

app.post("/register", (req, res) => {
  var check = store.get(req.body.username);
  if (check) {
    res.status(201).json({
      erreur: "This username already exists",
    });
  } else {
    if (req.body.password != req.body.password2) {
      res.status(201).json({
        erreur: "Passwords do not match",
      });
    } else {
      store.set(req.body.username, {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password,
      });
      console.log(store.get(req.body.username));
      var urlconnexion =
        req.protocol +
        "://" +
        req.get("host") +
        "/authorize?client_id=" +
        process.env.CLIENT_ID +
        "&scope=motus_app" +
        "&redirect_uri=" +
        req.query["redirect_uri"];
      res.status(201).json({
        message: "You can log in ",
        Clique_Here: urlconnexion,
      });
    }
  }
});


app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}/authorize`);
});

app.get('/port', (req, res) => {
  const hostname = os.hostname();
  res.send(`MOTUS APP working on ${hostname} port ${port}`);
});

