////---- REQUIRED ----////
const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { reset } = require("nodemon"); // is this being used as its dull?
// morgan? const morgan = require('morgan');

////---- MIDDLEWARE ----////
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// morgan? app.set(morgan('dev'));

////---- LISTEN TO PORT MESSAGE----////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

////---- URL DATABASE ----////
const urlDatabase = {
  b2xVn2: "http://lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

////---- GENERATE RANDOM STRING ----////
// this code generates a random string up to 6 characters long
const generateRandomString = function () {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 6);
};

////---- ROUTES ----////

////---- CREATE USERS DATABASE ----////
const users = {
  "testUser1": {
    id: "testUser1",
    email: "user1@example.com",
    password: "1234",
  },
  "testUser2": {
    id: "testUser2",
    email: "user2@example.com",
    password: "4321",
  },
};

////---- HELPER FUNCTIONS ----////
const findUserByEmail = (email) => {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

////---- NEW USER REGISTRATION HANDLER ----////
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Email and password cannot be blank.");
  }

  const user = findUserByEmail(email);
  if (user) {
    return res.status(400).send("User already exists with that email.");
  }

  const id = generateRandomString();

  users[id] = {
    id: id,
    email: email,
    password: password,
  };

  res.cookie("user_id", id); // should this be user_id?
  res.redirect("/urls");
});


// this code '/' requests the homepage
app.get("/", (req, res) => {
  res.send("Hello!\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.EditField;
  res.redirect("/urls");
});

////---- DELETE URL ----////
app.post("/urls/:shortURL/delete", (req, res) => {
  const idToDelete = req.params.shortURL;
  delete urlDatabase[idToDelete];
  res.redirect("/urls");
});


////---- USER LOGIN HANDLER----////
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  //let userEmail = findUserByEmail(users, email); // is this correct? it users the helper function from earlier

  if (!email || !password) {
    return res.status(403).send("Email and password cannot be blank.");
  }

  const user = findUserByEmail(email);

  if (!user) {
    return res.status(403).send("A user with that email does not exist.");
  }
  if (user.password !== password) {
    return res.status(403).send("User email or password does not match.");
  }
  res.cookie('user_id', user.id);
  res.redirect("/urls");
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render('login', templateVars);
});


////---- USER LOGOUT ----////
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
