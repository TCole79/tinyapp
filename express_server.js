////---- REQUIRE ----////
const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { reset } = require("nodemon"); // is this being used as its dull?
//const cookieSession = require("cookie-session"); // is this being used as its dull?
//const bcrypt = require("bcryptjs"); // is this being used as its dull?
const {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
} = require("./helpers");


////---- MIDDLEWARE ----////
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(cookieSession ( {
//   name: "session",
//   key: [cookie, session],
// }));


////---- LISTEN TO PORT MESSAGE----////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


////---- URL DATABASE ----////
const urlDatabase = {
  b6UTxQ: {
    longURL: "http://lighthouselabs.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  testNew: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};
// OLD VERSION
// const urlDatabase = {
//   b2xVn2: "http://lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
// };


////---- ROUTES ----////



////---- USERS DATABASE ----////
const users = {
  "testUser1": {
    id: "testUser1",
    email: "user1@example.com",
    password: "1234",
  },
  "testUser2": {
    id: "testUser2",
    email: "user2@example.com",
    password: "1234",
  },
};



////---- NEW USER REGISTRATION HANDLER ----////
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("register", templateVars);
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
  const password = req.body.password;

  if (!email || !password) {
    return res.status(403).send("Email and password cannot be blank.");
  }

  const user = findUserByEmail(users, email);
  if (user) {
    return res.status(403).send("User already exists with that email.");
  }

  const id = generateRandomString();

  users[id] = {
    id: id,
    email: email,
    password: password
    //password: bcrypt.hashsync(password, salt), // this code for adding the encryption
  };

  res.cookie("user_id", id);
  res.redirect("/urls");
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


// this code '/' requests the homepage
app.get("/", (req, res) => {
  // const something for the id here?
  // if (user) {
  //   res.redirect("/urls");
  // } else {
  //   res.redirect("/login");
  // }
  //res.send("Hello!\n");
});
// GET / - requirements
//     if user is logged in:
//         (Minor) redirect to /urls
//     if user is not logged in:
//         (Minor) redirect to /login


app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"]; // should this be something else?
  console.log('test 1 ', userID);
  if (!userID) {
    res.status(401).send(`You must be logged in to view short URLs you own. <a href="/login">Log Into Your Account </a>`); // adding a <a> tag here allows you to go back to the login page
    return;
  }
  const userURLS = urlsForUser(urlDatabase, userID);
  const templateVars = {
    urls: userURLS,
    user: users[req.cookies["user_id"]],
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


app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.cookies["user_id"]], // had to add this back in to fix 'user not defined' error
      //users,
      userID,
    };
    res.render("urls_new", templateVars);
  }
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


app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL; // added longURL on to the end to test the new structure
  res.redirect(longURL);
});
// GET /u/:id (shortURL) - requirements
//     if URL for the given ID exists:
//         redirects to the corresponding long URL
//     if URL for the given ID does not exist:
//         (Minor) returns HTML with a relevant error message


app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID) {
    res.status(401).send(`You must be logged in to edit short URLs you own. <a href="/login">Log Into Your Account </a>`);
  }
  // in my url database, each object has a userID associated. If that does not = a current userID then throw an error
  // the following code borks everything - Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
  // if (urlDatabase[userID] !== userID) {
  //   res.status(401).send(`You must be logged in to edit short URLs you own. <a href="/login">Log Into Your Account </a>`);
  // }
  
  const templateVars = {
    user: users[req.cookies["user_id"]],
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



////---- ADDING NEW URLS ----////
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.cookies["user_id"],
  };
  res.redirect(`/urls/${shortURL}`);
});
// POST /urls - requirements
//     if user is logged in:
//         generates a short URL, saves it, and associates it with the user
//         redirects to /urls/:id, where :id matches the ID of the newly saved URL
//     if user is not logged in:
//         (Minor) returns HTML with a relevant error message



app.post("/urls/:shortURL", (req, res) => {
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


////---- DELETE URLS ----////
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.cookies["user_id"];
  const idToDelete = req.params.shortURL;

  if (!userID) {
    res.status(401).send(`You must be logged in to delete short URLs you own. <a href="/login">Log Into Your Account </a>`);
    //res.redirect("/login");
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



////---- USER LOGIN HANDLER----////

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  //let userEmail = findUserByEmail(users, email); // is this correct? it users the helper function from earlier

  if (!email || !password) {
    return res.status(403).send("Email and password cannot be blank.");
  }

  const user = findUserByEmail(users, email);

  if (!user) {
    return res.status(403).send("A user with that email does not exist.");
  }
  if (user.password !== password) {
    return res.status(403).send("User email or password does not match.");
  }
  res.cookie('user_id', user.id);
  res.redirect("/urls");
});
// POST /login - requirements
//     if email and password params match an existing user:
//         sets a cookie
//         redirects to /urls
//     if email and password params don't match an existing user:
//         returns HTML with a relevant error message

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render('login', templateVars);
});
// GET /login - requirements
//     if user is logged in:
//         (Minor) redirects to /urls
//     if user is not logged in:
//         returns HTML with:
//         a form which contains:
//             input fields for email and password
//             submit button that makes a POST request to /login


////---- USER LOGOUT ----////

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  //req.session.email = null // this is one way to use, after implementing encryption
  //delete req.session.email; // this is one way to use, after implementing encryption
  res.redirect("/urls");
});
// POST /logout - requirements
//     deletes cookie
//     redirects to /urls
