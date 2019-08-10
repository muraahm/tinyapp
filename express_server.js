//server initialization
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const bcrypt = require('bcrypt');
const PORT = 8080; // default port 8080
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
const { checkEmail } = require('./helpers');


//Databases
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};


// generates the userID
function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// To filter the urls for the logged in user
const urlsForUser = function (id, objectToCheckIn) {
  const filteredURLs = {};
  for (let url in objectToCheckIn) {
    if (id === objectToCheckIn[url].userID) {
      filteredURLs[url] = objectToCheckIn[url];
    }
  }
  return filteredURLs;
};


//passing the cookie and userID to the endPoints
app.use((req, res, next) => {
  req.user_id = req.session.user_id
  req.user = users[req.user_id]
  next()
});



app.get("/register", (req, res) => {
  let templateVars = { user: req.user };
  res.render("urls_register", templateVars)
});


// registration urls
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400);
    return res.send('400 Bad Request');
  }
  if (checkEmail(req.body["email"], users)) {
    return res.status(400).send('email address has already been registered');
  }
  let newUserID = generateRandomString();
  users[newUserID] = {};
  users[newUserID].id = newUserID;
  users[newUserID].email = req.body["email"];
  users[newUserID].password = bcrypt.hashSync(req.body["password"], 10);
  req.session.user_id = newUserID
  res.redirect("/urls");
});



app.get("/urls/new", (req, res) => {
  if (req.user) {
    let templateVars = { user: req.user };
    res.render("urls_new", templateVars);
  }
  else {
    res.redirect("/login")
  }
});



app.get("/login", (req, res) => {
  let templateVars = { user: req.user };
  res.render("urls_login", templateVars);
});



app.post('/login', (req, res) => {
  let inputEmail = req.body["email"];
  let inputPassword = req.body["password"];
  let existingUserID = checkEmail(inputEmail, users);

  if (!inputEmail || !inputPassword) {
    res.status(403).send('Error: Both fields are required.');
  } else if (!existingUserID) {
    res.status(403).send('Error: Email address could not be found.');
  } else if (!bcrypt.compareSync(inputPassword, users[existingUserID].password)) {
    res.status(403).send('Error: Incorrect password.');
  } else {

    req.session.user_id = existingUserID;
    res.redirect('/urls');
  }
});



app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.user_id, urlDatabase), user: req.user
  };
  res.render("urls_index", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.user_id) {
    delete urlDatabase[req.params.shortURL]
    res.redirect('/urls/');
  }
  else {
    res.redirect('/urls/');
  }
});



app.get("/urls/:shortURL", (req, res) => {

  let templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,
    user: req.user
  };

  res.render("urls_show", templateVars);
});



app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id]["longURL"] = req.body.longURL;
  res.redirect("/urls");
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



app.post("/urls", (req, res) => {
  let generatedShortID = generateRandomString();
  urlDatabase[generatedShortID] = { longURL: req.body["longURL"], userID: req.session.user_id };
  res.redirect('/urls/' + generatedShortID);
});



app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


// run the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

