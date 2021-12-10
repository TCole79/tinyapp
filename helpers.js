////---- HELPER FUNCTIONS ----////


////---- GENERATE RANDOM STRING ----////
const generateRandomString = function () {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 6);
};

////---- FIND USER BY EMAIL ----////
const findUserByEmail = (users, email) => {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// -------URLS FOR USER FUNCTION-------
const urlsForUser = (urlDatabase, userID) => { // should this be userID instead of id?
  let filteredList = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      filteredList[shortURL] = urlDatabase[shortURL].longURL; // added .longURL because we only want to access the longURL key, *not* the longURL *and* the userID
    }
  }
  return filteredList;
};


module.exports = {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
};