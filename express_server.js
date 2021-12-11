////---- REQUIRE START ----////
const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { reset } = require("nodemon");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
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
    keys: ["cookie", "session"],
  })
);
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
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
////---- URL DATABASE END ----////

////---- USERS DATABASE START ----////
const users = {
  testUser1: {
    id: "testUser1",
    email: "user1@example.com",
    password: "$2a$10$YzUcDniy0G51xW0Uq6imMerjC2rfouxsWsgEa0SQiqHXWO5A78BNO",
  },
  testUser2: {
    id: "testUser2",
    email: "user2@example.com",
    password: "$2a$10$YzUcDniy0G51xW0Uq6imMerjC2rfouxsWsgEa0SQiqHXWO5A78BNO",
  },
};
////---- USERS DATABASE END ----////

////---- ROUTES ----////

app.get("/", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    res.redirect("/login");
  }
  res.redirect("/urls");
});

////---- NEW USER REGISTRATION HANDLER START ----////
app.get("/register", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    const templateVars = {
      urls: urlDatabase,
      user: users[req.session["user_id"]],
    };
    res.render("register", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const user = findUserByEmail(email, users);

  if (!email || !hashedPassword) {
    return res
      .status(403)
      .send(
        `Email and password cannot be blank. Please try again. <a href="/login">Log Into Your Account </a>`
      );
  }
  if (user) {
    return res
      .status(403)
      .send(
        `User already exists with that email. Please try again. <a href="/login">Log Into Your Account </a>`
      );
  }

  const id = generateRandomString();
  users[id] = {
    id: id,
    email: email,
    password: hashedPassword,
  };
  req.session.user_id = id;
  res.redirect("/urls");
});
////---- NEW USER REGISTRATION HANDLER END ----////

////---- MAIN TINY APP PAGE START ----////
app.get("/urls", (req, res) => {
  const userID = req.session["user_id"];
  const userURLS = urlsForUser(urlDatabase, userID);
  const templateVars = {
    urls: userURLS,
    user: users[req.session["user_id"]],
  };
  if (!userID) {
    res
      .status(401)
      .send(
        `You must be logged in to create, view, or edit short URLs. <a href="/login">Log Into Your Account </a>`
      );
    return;
  }
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    res
      .status(401)
      .send(
        `You must be logged in to create, view, or edit short URLs. <a href="/login">Log Into Your Account </a>`
      );
  }
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    shortURL: shortURL,
    longURL: longURL,
    userID: req.session["user_id"],
  };
  res.redirect(`/urls/${shortURL}`);
});
////---- MAIN TINY APP PAGE END ----////

////---- ADDING NEW URLS START ----////
app.get("/urls/new", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    res.redirect("/login");
  }

  const templateVars = {
    user: users[req.session["user_id"]],
    userID,
  };
  res.render("urls_new", templateVars);
});
////---- ADDING NEW URLS END----////

////---- EDITING URLS START ----////
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session["user_id"];
  const urlRecord = urlDatabase[req.params.shortURL];

  if (!userID || userID !== urlRecord.userID) {
    res
      .status(401)
      .send(
        `You must be logged in to edit short URLs you own. Please try again. <a href="/login">Log Into Your Account </a>`
      );
    return;
  }

  const templateVars = {
    user: users[req.session["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session["user_id"];
  const urlRecord = urlDatabase[req.params.shortURL];

  if (!userID || userID !== urlRecord.userID) {
    res
      .status(401)
      .send(
        `You must be logged in to edit short URLs you own. Please try again. <a href="/login">Log Into Your Account </a>`
      );
    return;
  }

  urlDatabase[req.params.shortURL].longURL = req.body.EditField;
  res.redirect("/urls");
});
////---- EDITING URLS END----////

////---- DELETE URLS START ----////
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session["user_id"];
  const urlRecord = urlDatabase[req.params.shortURL];
  const idToDelete = req.params.shortURL;

  if (!userID || userID !== urlRecord.userID) {
    res
      .status(401)
      .send(
        `You must be logged in to delete short URLs you own. <a href="/login">Log Into Your Account </a>`
      );
  } else {
    delete urlDatabase[idToDelete];
  }
  res.redirect("/urls");
});
////---- DELETE URLS END ----////

////---- USER LOGIN HANDLER START ----////
app.get("/login", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    const templateVars = {
      user: users[req.session["user_id"]],
    };
    res.render("login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, users);

  if (!email || !password) {
    return res
      .status(403)
      .send(
        `Email and password cannot be blank. Please try again. <a href="/login">Log Into Your Account </a>`
      );
  }
  if (!user) {
    return res
      .status(403)
      .send(
        `A user with that email does not exist. Please try again. <a href="/login">Log Into Your Account </a>`
      );
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res
      .status(403)
      .send(
        `User email or password does not match. Please try again. <a href="/login">Log Into Your Account </a>`
      );
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});
////---- USER LOGIN HANDLER END ----////

////---- USER LOGOUT START ----////
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});
////---- USER LOGOUT END ----////
