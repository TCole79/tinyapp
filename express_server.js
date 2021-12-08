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


////---- LISTEN ----////
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
const generateRandomString = function() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 6);
};


////---- CREATE USERS OBJECT ----////
const users = {
  userRandomID: {
    id: "testUser1",
    email: "user1@example.com",
    password: "1234",
  },
  user2RandomID: {
    id: "testUser2",
    email: "user2@example.com",
    password: "4321",
  },
};
// class example below
// const findUserByEmail = (email) => {
//   for (const userID in users) {
//     const user = users[userID];
//     if (user.email === email) {
//       return user;
//     }
//   }
//   return null;
// };


////---- ROUTES ----////


////---- NEW USER REGISTRATION HANDLER ----////


app.post("/register"), (req, res) => {

};

app.get("/register", (req, res) => {
  // const email = req.body.email;
  // const password = req.body.password;

  // if (!email || !password) {
  //   return res.status(400).send("email and password cannot be blank");
  // }

  // const user = findUserByEmail(email);
  // if (user) {
  //   return res.status(400).send("User already exists with that email.");
  // }

  //const id = generateRandomString();

  // users[id] = {
  //   id: id,
  //   email: email,
  //   password: password
  // };

  // tinyapp will have us login them in immediately on registration

  // const userLoginID = something ["userLoginID"]?
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("register", templateVars);
  //res.redirect("/urls");
});


////---- USER LOGIN ----////
// example from the lecture
// app.post("/login"), (req, res) => {
//   const email = req.body.email;
//   const password = req.body.password;

//   if (!email || !password) {
//     return res.status(400).send("email and password cannot be blank");
//   }

//   const user = findUserByEmail(email);

//   if (!user) {
//     return res.status(400).send("A user with that email does not exist.");
//   }
//   if (user.password !== password) {
//     return res.status(400).send("Password does not match.");
//   }

//   res.cookie('user_id', user.id); // change this to reflect my example
//   res.redirect('/secrets');

//   app.get('/secrets', (req, res) => {
//     const userId = req.cookies.user_ID; // change this user bit to reflect mine

//     if (!userID) {
//       return res.status(400).send("You are not authorized to be here."); // change user bit
//     }

//     const user = users[userId]; // this should match the ejs file in croc code
//     const templateVars = {
//       user
//     }

//     //if (!user)
//   });
// };

// app.get("/login"), (req, res) => {

// };


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

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] }; // added this in order to render templates properly.
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"], // added this in order to render templates properly.
  };
  console.log("test 2 ", templateVars);
  res.render("urls_show", templateVars);
});

////---- DELETE URL ----////
app.post("/urls/:shortURL/delete", (req, res) => {
  const idToDelete = req.params.shortURL;
  delete urlDatabase[idToDelete];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  // this is the section that assigns a random string to shortURL, then saves the short/long key pairs to the database
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

////---- COOKIES ----////
app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie("username", username);
  console.log(req.body);
  res.redirect("/urls");
});

////---- LOGOUT ----////
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});
