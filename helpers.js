// const getUserByEmail = (email) => {
//   const usersValues = Object.values(users);
//   const user = usersValues.filter((user) => user.email === email);
//   if (user.length === 0) return null;
//   return user[0];
// };

const getUserByEmail = (email, usersDatabase) => {
  const usersValues = Object.values(usersDatabase);
  const user = usersValues.filter((user) => user.email === email);
  if (user.length === 0) return null;
  return user[0];
};

const generateRandomString = (length) => {
  let result = Math.random().toString(36).substr(2, length);
  return result;
};

module.exports = { getUserByEmail, generateRandomString };
