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

const generateRandomString = (length) => {
  let result = Math.random().toString(36).substr(2, length);
  return result;
};

const getUserByEmail = (email) => {
  const usersValues = Object.values(users);
  const user = usersValues.filter((user) => user.email === email);
  if (user.length === 0) return null;
  return user[0];
};

//HOME
app.get("/urls", (req, res) => {
  const { user_id } = req.cookies;

  const templateVars = {
    urls: urlDatabase,
    users,
    user: users[user_id],
  };

  res.render("urls_index", templateVars);
});

//CREATE NEW URL PAGE
app.get("/urls/new", (req, res) => {
  const { user_id } = req.cookies;

  const templateVars = {
    urls: urlDatabase,
    users,
    user: users[user_id],
  };
  res.render("urls_new", templateVars);
});

//REGISTER
app.get("/register", (req, res) => {
  const { user_id } = req.cookies;

  const templateVars = {
    urls: urlDatabase,
    users,
    user: users[user_id],
  };
  res.render("urls_register", templateVars);
});

//CREATE USER
app.post("/register/", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).send("Invalid password and email");

  const id = generateRandomString(6);
  if (getUserByEmail(email)) return res.status(400).send("Email already exist");

  const newUser = { [id]: { id, email, password } };

  Object.assign(users, newUser);

  res.cookie("user_id", id);

  res.redirect("/urls");
});

// EDIT PAGE
app.get("/urls/:id", (req, res) => {
  const { id } = req.params;
  const { user_id } = req.cookies;

  if (!urlDatabase[id]) {
    return res.status(404).send("ID CANT BE FOUND");
  }

  const templateVars = {
    id,
    longURL: urlDatabase[id],
    urls: urlDatabase,
    users,
    user: users[user_id],
  };
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
  const { user_id } = req.cookies;

  const templateVars = {
    urls: urlDatabase,
    users,
    user: users[user_id],
  };
  res.render("urls_login", templateVars);
});

//lOGIN  REFACTOR
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).send("password and email cant be empty");

  const user = getUserByEmail(email);

  if (!user) return res.status(403).send("Invalid password and email");

  if (user.password !== password)
    return res.status(403).send("Invalid password and email");

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

//LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
