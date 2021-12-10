////---- REQUIRE START ----////
const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { reset } = require("nodemon"); // is this being used as its dull?
const cookieSession = require("cookie-session"); // is this being used as its dull?
const bcrypt = require("bcryptjs"); // is this being used as its dull?
const {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
} = require("./helpers");
////---- REQUIRE END ----////


////---- MIDDLEWARE START ----////
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["cookie", "session"]
  }));
////---- MIDDLEWARE END ----////


////---- LISTEN TO PORT MESSAGE START ----////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
////---- LISTEN TO PORT MESSAGE END ----////


////---- URL DATABASE START ----////
const urlDatabase = {
  b6UTxQ: {
    longURL: "http://lighthouselabs.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
};
////---- URL DATABASE END ----////


////---- ROUTES ----////



////---- USERS DATABASE START ----////
const users = {
  "testUser1": {
    id: "testUser1",
    email: "user1@example.com",
    password: "$2a$10$YzUcDniy0G51xW0Uq6imMerjC2rfouxsWsgEa0SQiqHXWO5A78BNO",
  },
  "testUser2": {
    id: "testUser2",
    email: "user2@example.com",
    password: "$2a$10$YzUcDniy0G51xW0Uq6imMerjC2rfouxsWsgEa0SQiqHXWO5A78BNO",
  },
};
////---- USERS DATABASE END ----////



////---- NEW USER REGISTRATION HANDLER START ----////
app.get("/register", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    const templateVars = {
      urls: urlDatabase, // is this still needed?
      user: users[req.session["user_id"]], // changed session from cookies
    };
    res.render("register", templateVars);
  } else {
    res.redirect("/urls");
  }
});
// GET /register - requirements
//     if user is logged in:
//         (Minor) redirects to /urls
//     if user is not logged in:
//         returns HTML with:
//         a form which contains:
//             input fields for email and password
//             a register button that makes a POST request to /register

// create helper function for register below? - see createUser example in lecture notes
app.post("/register", (req, res) => {
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10); // added the bcrypt in

  if (!email || !hashedPassword) {
    return res.status(403).send("Email and password cannot be blank.");
  }

  const user = findUserByEmail(users, email);
  if (user) {
    return res.status(403).send("User already exists with that email.");
  } else {
    const id = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    users[id] = {
      id: id,
      email: email,
      password: hashedPassword
    };
    //res.cookie("user_id", id);
    req.session.user_id = id; // added this in - why is it saying camelcase?
    res.redirect("/urls");
  }
});
// POST /register - requirements
//     if email or password are empty:
//         returns HTML with a relevant error message
//     if email already exists:
//         returns HTML with a relevant error message
//     otherwise:
//         creates a new user
//         encrypts the new user's password with bcrypt
//         sets a cookie
//         redirects to /urls

////---- NEW USER REGISTRATION HANDLER END ----////


// this code '/' requests the homepage
app.get("/", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    res.redirect("/login");
  }
  res.redirect("/urls");
});


////---- MAIN TINY APP PAGE START ----////
app.get("/urls", (req, res) => {
  const userID = req.session["user_id"]; // changed session from cookies
  if (!userID) {
    res.status(401).send(`You must be logged in to create, view, or edit short URLs. <a href="/login">Log Into Your Account </a>`); // adding a <a> tag here allows you to go back to the login page
    return;
  }
  const userURLS = urlsForUser(urlDatabase, userID);
  const templateVars = {
    urls: userURLS, // is this needed?
    user: users[req.session["user_id"]], // changed session from cookies
  };
  res.render("urls_index", templateVars);
});
// GET /urls - requirments
//     if user is logged in:
//         returns HTML with:
//         the site header (see Display Requirements above)
//         a list (or table) of URLs the user has created, each list item containing:
//             a short URL
//             the short URL's matching long URL
//             an edit button which makes a GET request to /urls/:id
//             a delete button which makes a POST request to /urls/:id/delete
//             (Stretch) the date the short URL was created
//             (Stretch) the number of times the short URL was visited
//             (Stretch) the number number of unique visits for the short URL
//         (Minor) a link to "Create a New Short Link" which makes a GET request to /urls/new
//     if user is not logged in:
//         returns HTML with a relevant error message


////---- ADDING NEW URLS START ----////
app.get("/urls/new", (req, res) => {
  const userID = req.session["user_id"]; // changed session from cookies
  if (!userID) {
    res.redirect("/login");
  }
  
  const templateVars = {
    user: users[req.session["user_id"]], // changed session from cookies
    //users, is this needed?
    userID,
  };
  res.render("urls_new", templateVars);
  
});
// GET /urls/new - requirments
//     if user is logged in:
//         returns HTML with:
//         the site header (see Display Requirements above)
//         a form which contains:
//             a text input field for the original (long) URL
//             a submit button which makes a POST request to /urls
//     if user is not logged in:
//         redirects to the /login page

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    shortURL: shortURL, // is this needed?
    longURL: longURL,
    userID: req.session["user_id"], // changed session from cookies
  };
  res.redirect(`/urls/${shortURL}`);
});
// POST /urls - requirements
//     if user is logged in:
//         generates a short URL, saves it, and associates it with the user
//         redirects to /urls/:id, where :id matches the ID of the newly saved URL
//     if user is not logged in:
//         (Minor) returns HTML with a relevant error message

////---- ADDING NEW URLS END----////


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL; // added longURL on to the end to test the new structure
  // this is the bit where I need to add http:// onto all my long urls in order to make them actually work (if entered in shortform ie google.com) - how to do this?
  res.redirect(longURL);
});
// GET /u/:id (shortURL) - requirements
//     if URL for the given ID exists:
//         redirects to the corresponding long URL
//     if URL for the given ID does not exist:
//         (Minor) returns HTML with a relevant error message


////---- EDITING URLS START ----////
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session["user_id"]; // changed session from cookies
  const urlRecord = urlDatabase[req.params.shortURL];
  // in my url database, each object has a userID associated. If that does not = a current userID then throw an error
  if (!userID || userID !== urlRecord.userID) { // is this correct?
    res.status(401).send(`You must be logged in to edit short URLs you own. Please try again. <a href="/login">Log Into Your Account </a>`);
    return;
  }
  const templateVars = {
    user: users[req.session["user_id"]], // changed session from cookies
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL, // added longURL on to the end to test the new structure
  };
  res.render("urls_show", templateVars);
});
// GET /urls/:id - requirments
//     if user is logged in and owns the URL for the given ID:
//         returns HTML with:
//         the site header (see Display Requirements above)
//         the short URL (for the given ID)
//         a form which contains:
//             the corresponding long URL
//             an update button which makes a POST request to /urls/:id
//         (Stretch) the date the short URL was created
//         (Stretch) the number of times the short URL was visited
//         (Stretch) the number of unique visits for the short URL
//     if a URL for the given ID does not exist:
//         (Minor) returns HTML with a relevant error message
//     if user is not logged in:
//         returns HTML with a relevant error message
//     if user is logged it but does not own the URL with the given ID:
//         returns HTML with a relevant error message

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session["user_id"]; // changed session from cookies
  const urlRecord = urlDatabase[req.params.shortURL];
  // in my url database, each object has a userID associated. If that does not = a current userID then throw an error
  if (!userID || userID !== urlRecord.userID) { // is this correct?
    res.status(401).send(`You must be logged in to edit short URLs you own. Please try again. <a href="/login">Log Into Your Account </a>`);
    return;
  }
  urlDatabase[req.params.shortURL].longURL = req.body.EditField;
  res.redirect("/urls");
});
// POST /urls/:id (shortURL) - requirements
//     if user is logged in and owns the URL for the given ID:
//         updates the URL
//         redirects to /urls
//     if user is not logged in:
//         (Minor) returns HTML with a relevant error message
//     if user is logged it but does not own the URL for the given ID:
//         (Minor) returns HTML with a relevant error message

////---- EDITING URLS END----////


////---- DELETE URLS START ----////
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session["user_id"]; // changed session from cookies
  const urlRecord = urlDatabase[req.params.shortURL];
  const idToDelete = req.params.shortURL;

  if (!userID || userID !== urlRecord.userID) {
    res.status(401).send(`You must be logged in to delete short URLs you own. <a href="/login">Log Into Your Account </a>`);
    return; // is this needed?
  } else {
    delete urlDatabase[idToDelete];
  }
  res.redirect("/urls");
});
// POST /urls/:id/delete (shortURL) - requirements
// if user is logged in and owns the URL for the given ID:
//     deletes the URL
//     redirects to /urls
// if user is not logged in:
//     (Minor) returns HTML with a relevant error message
// if user is logged it but does not own the URL for the given ID:
//     (Minor) returns HTML with a relevant error message

////---- DELETE URLS END ----////



////---- USER LOGIN HANDLER START ----////
app.get("/login", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    const templateVars = {
      user: users[req.session["user_id"]], // changed to session from cookies
    };
    res.render("login", templateVars);
  } else {
    res.redirect("/urls");
  }
});
// GET /login - requirements
//     if user is logged in:
//         (Minor) redirects to /urls
//     if user is not logged in:
//         returns HTML with:
//         a form which contains:
//             input fields for email and password
//             submit button that makes a POST request to /login

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password; // removed () from around the variable
  const user = findUserByEmail(users, email); // is this correct? it users the helper function from earlier

  if (!email || !password) {
    return res.status(403).send(`Email and password cannot be blank. Please try again. <a href="/login">Log Into Your Account </a>`);
  }

  //const user = findUserByEmail(users, email);
  if (!user) {
    return res.status(403).send(`A user with that email does not exist. Please try again. <a href="/login">Log Into Your Account </a>`);
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send(`User email or password does not match. Please try again. <a href="/login">Log Into Your Account </a>`);
  }
  //res.cookie('user_id', user.id);
  req.session.user_id = user.id;
  res.redirect("/urls");
});
// POST /login - requirements
//     if email and password params match an existing user:
//         sets a cookie
//         redirects to /urls
//     if email and password params don't match an existing user:
//         returns HTML with a relevant error message

////---- USER LOGIN HANDLER END ----////


////---- USER LOGOUT START ----////
app.post("/logout", (req, res) => {
  //res.clearCookie("user_id");
  req.session = null; // this is one way to use, after implementing encryption
  //delete req.session.email; // this is one way to use, after implementing encryption
  res.redirect("/urls");
});
////---- USER LOGOUT END ----////