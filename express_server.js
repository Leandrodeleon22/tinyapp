const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

//MIDLEWARE
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
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

//GET RANDOM ID
// const generateRandomString = (length) => {
//   let result = "";
//   const characters =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   const charactersLength = characters.length;
//   let counter = 0;
//   while (counter < length) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
//     counter += 1;
//   }
//   return result;
// };

const generateRandomString = (length) => {
  let result = Math.random().toString(36).substr(2, length);
  return result;
};

const checkExistingEmail = (email) => {
  for (const key in users) {
    console.log(users[key].email, email);
    if (users[key].email === email) {
      return true;
    }
  }
};

//HOME
app.get("/urls", (req, res) => {
  const { username, user_id } = req.cookies;
  console.log(req.cookies);

  const templateVars = {
    username,
    urls: urlDatabase,
    users,
    user: users[user_id],
  };

  res.render("urls_index", templateVars);
});

//CREATE NEW URL PAGE
app.get("/urls/new", (req, res) => {
  const { username, users } = req.cookies;

  const templateVars = {
    username,
    users,
  };
  res.render("urls_new", templateVars);
});

//REGISTER
app.get("/register", (req, res) => {
  res.render("urls_register");
});

//CREATE USER
app.post("/register/", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).send("Invalid password and email");

  if (checkExistingEmail(email))
    return res.status(400).send("Email already exist");

  const id = generateRandomString(6);

  const newUser = { [id]: { user_id: id, email, password } };

  Object.assign(users, newUser);

  res.cookie("user_id", id);

  res.redirect("/urls");
});

// EDIT PAGE
app.get("/urls/:id", (req, res) => {
  const { id } = req.params;
  const { username, users } = req.cookies;

  if (!urlDatabase[id]) {
    return res.status(404).send("ID CANT BE FOUND");
  }

  const templateVars = { id, longURL: urlDatabase[id], username, users };
  res.render("urls_show", templateVars);
});

//GO TO THE LINK PROVIDED
app.get("/u/:id", (req, res) => {
  const { id } = req.params;
  const longURL = urlDatabase[id];

  res.redirect(longURL);
});

//EDIT
app.post("/urls/", (req, res) => {
  const id = generateRandomString(6);
  const { longURL } = req.body;
  Object.assign(urlDatabase, { [id]: longURL });

  res.redirect(`/urls/${id}`);
});

//CREATE
app.post("/urls/", (req, res) => {
  const id = generateRandomString(6);
  const { longURL } = req.body;
  Object.assign(urlDatabase, { [id]: longURL });

  res.redirect(`/urls/${id}`);
});

//DELETE
app.post("/urls/:id/delete", (req, res) => {
  const { id: idToDelete } = req.params;
  delete urlDatabase[idToDelete];
  res.redirect("/urls");
});

//UPDATE
app.post("/urls/:id", (req, res) => {
  const { id } = req.params;
  const { editURL } = req.body;
  urlDatabase[id] = editURL;

  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

//LOGIN 1
// app.post("/login", (req, res) => {
//   const { username: usernameValue } = req.body;
//   if (!usernameValue) res.send("username cant be empty");
//   res.cookie("username", usernameValue);
//   res.redirect("/urls");
// });

//login 2
app.post("/login", (req, res) => {
  const { email, password } = req.body;
});

//LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
