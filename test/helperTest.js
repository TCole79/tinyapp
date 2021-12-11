const { assert } = require("chai");

const { generateRandomString, findUserByEmail } = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

////---- findUserByEmail TEST ----////
describe("findUserByEmail", () => {
  it("should return a user with valid email", () => {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
    //assert.isTrue(user.id === expectedOutput); // this also works as a check condition
  });
});

describe("findUserByEmail", () => {
  it("should return undefined with a non-existent email", () => {
    const user = findUserByEmail("user123@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

////--- generateRandomString TEST ----////
describe("generateRandomString", () => {
  it("should return a random string (userID) with 6 characters", () => {
    const userID = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(userID, expectedOutput);
  });
});
