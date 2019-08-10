const checkEmail = function (emailCheck, objCheck) { let result = undefined;
  for (let userID in objCheck) {
    if (emailCheck === objCheck[userID]["email"]) {
      result = userID;
    }
  }
  return result;
};

module.exports = { checkEmail };