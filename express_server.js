const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

app.get("/register", (req, res) => {
  let templateVars = {username: req.cookies["username"]};
res.render("urls_register", templateVars);
});


const checkEmail = function(emailCheck, objCheck) {
  for (let userID in objCheck) {
    if (emailCheck === objCheck[userID]["email"]) {
      return true;
    }
  }
  return false;
};

app.post("/register", (req, res) => {
  if (!req.body["password"] || !req.body["email"]) {
    res.status(400).send('fill out all fields');
  }
  if (checkEmail(req.body["email"], users)) {
    res.status(400).send('email address has already been registered');
  }
  let newUserID = generateRandomString();
  users[newUserID] = {};
  users[newUserID].id = newUserID;
  users[newUserID].email = req.body["email"];
  users[newUserID].password = req.body["password"];
  //console.log(users);
  res.cookie('user_id', newUserID);
  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.post('/login', (req, res) => {
  res.cookie("username", req.body["username"]);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
}); 

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase, username: req.cookies["username"]
};
  res.render("urls_index", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls/');
});

app.get("/urls/:shortURL", (req, res) => {
  //console.log("hello");
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  let generatedShortID = generateRandomString();
  urlDatabase[generatedShortID] = req.body["longURL"];
  res.redirect('/urls/' + generatedShortID);
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
  console.log(req.params.shortURL);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

