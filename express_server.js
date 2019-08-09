const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');
app.use(cookieParser());
//const cookieSession = require('cookie-session');
//app.use(cookieSession({ name: 'name', keys: ["keys"] }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};

app.use((req, res, next) => {
  req.user_id = req.cookies["user_id"]
  req.user = users[req.user_id]
  next()
});

app.get("/register", (req, res) => {
  //console.log('register GET route');
  let templateVars = { user: req.user };
  res.render("urls_register", templateVars)
});

const checkEmail = function (emailCheck, objCheck) {
  for (let userID in objCheck) {
    if (emailCheck === objCheck[userID]["email"]) {
      return objCheck[userID];
    }
  }
  return false;
};

app.post("/register", (req, res) => {
  //console.log('register POST route');
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
  users[newUserID].password = req.body["password"];
  res.cookie('user_id', newUserID);
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  //console.log('/urls/new GET route');
  if (req.cookies["user_id"]) {
    let templateVars = { user: req.cookies["user_id"] };
    res.render("urls_new", templateVars);
  }
  else {
    res.redirect("/login")
  }
});

app.get("/login", (req, res) => {
  //console.log("app.get('/login', (req, res) => {");

  let templateVars = { user: req.user };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  //console.log("app.post('/login', (req, res) => {");
  if (!req.body.email || !req.body.password) {
    res.status(400);
    return res.send('400 Bad Request');
  }

  let user = checkEmail(req.body["email"], users)

  if (user && user.password === req.body["password"]) {
    res.cookie('user_id', user.id);
    res.redirect("/urls");
  } else {
    let templateVars = { user: undefined };
    res.render("urls_login", templateVars);
  }
});

app.post('/logout', (req, res) => {
  //console.log("app.post('/logout', (req, res) => {");
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  //console.log("app.get(['/urls', (req, res) => {");

  let templateVars = {
    urls: urlDatabase, user: req.user
  };
  res.render("urls_index", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  //console.log("app.post('/urls/:shortURL/delete', (req, res) => {");
  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls/');
});

app.get("/urls/:shortURL", (req, res) => {
  //console.log("app.get('/urls/:shortURL', (req, res) => {");

  let templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],
    user: req.user
  };
  res.render("urls_show", templateVars);
});


app.get("/", (req, res) => {
  //console.log("app.get('/', (req, res) => {");
  res.send("Hello!");
});

app.listen(PORT, () => {
  //console.log("app.listen(PORT, () => {");
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  //console.log("app.get('/urls.json', (req, res) => {");
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  //console.log("app.get('/hello', (req, res) => {");
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  let generatedShortID = generateRandomString();
  urlDatabase[generatedShortID] = { longURL: req.body["longURL"], userID: req.cookies["user_id"] };
  //console.log(urlDatabase[generatedShortID]);
  res.redirect('/urls/' + urlDatabase[generatedShortID]);
});

function generateRandomString() { // from stackoverflow
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

app.get("/u/:shortURL", (req, res) => {
  //console.log("app.get('/u/:shortURL', (req, res) => {");
  console.log(req.params.shortURL);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

