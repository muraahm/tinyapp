const { assert } = require('chai');

const { checkEmail } = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = checkEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
  });
});

it('should return false when given email not in the database', function() {
  const user = checkEmail("doesnotexist@example.com", testUsers);
  const expectedOutput = undefined;
  assert.equal(user, expectedOutput);
});