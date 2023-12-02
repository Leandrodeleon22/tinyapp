const express = require("express");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

//MIDLEWARE
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 24 * 60 * 60 * 1000, //24hours
  })
);

// const urlDatabase = {
//   b2xVn2: "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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

const urlsForUser = (id) => {
  const allObjects = {};
  const shortUrls = Object.keys(urlDatabase).filter(
    (element) => urlDatabase[element].userID === id
  );
  console.log(shortUrls);
  shortUrls.forEach((shortUrl) => {
    Object.assign(allObjects, {
      [shortUrl]: {
        longURL: urlDatabase[shortUrl].longURL,
        userID: urlDatabase[shortUrl].userID,
      },
    });
  });
  // Object.assign(allObjects, [...shortUrl]{})
  console.log(allObjects);
  return allObjects;
};

// urlsForUser("aJ48lW");

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
  const { user_id } = req.session;
  if (!user_id) return res.redirect("/login");

  const myUrlDatabase = urlsForUser(user_id);
  console.log(myUrlDatabase);
  const templateVars = {
    urls: myUrlDatabase,
    users,

    user: users[user_id],
    user_id,
  };

  res.render("urls_index", templateVars);
});

//CREATE NEW URL PAGE
app.get("/urls/new", (req, res) => {
  const { user_id } = req.session;
  console.log(user_id);
  if (!user_id) return res.redirect("/login");
  const templateVars = {
    urls: urlDatabase,
    users,
    user: users[user_id],
  };
  res.render("urls_new", templateVars);
});

//REGISTER
app.get("/register", (req, res) => {
  const { user_id } = req.session;
  console.log(user_id);
  if (user_id) res.redirect("/urls");

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

  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword);

  if (!bcrypt.compareSync(password, hashedPassword)) {
    return res.status(400).send("Invalid password and email");
  }

  const newUser = { [id]: { id, email, password: hashedPassword } };

  Object.assign(users, newUser);

  // res.cookie("user_id", id);
  req.session.user_id = id;

  res.redirect("/urls");
});

// EDIT PAGE
app.get("/urls/:id", (req, res) => {
  const { id } = req.params;
  const { user_id } = req.session;
  console.log(user_id);
  if (!urlDatabase[id]) {
    return res.status(404).send("ID CANT BE FOUND");
  }

  if (!user_id) return res.redirect("/login");

  const templateVars = {
    id,
    longURL: urlDatabase[id].longURL,
    urls: urlDatabase,
    users,
    user: users[user_id],
  };
  res.render("urls_show", templateVars);
});

//EDIT
// app.post("/urls/", (req, res) => {
//   const id = generateRandomString(6);
//   const { longURL } = req.body;
//   Object.assign(urlDatabase, { [id]: longURL });

//   console.log(urlDatabase);
//   res.redirect(`/urls/${id}`);
// });

//GO TO THE LINK PROVIDED
app.get("/u/:id", (req, res) => {
  const { id } = req.params;

  // if (!user_id) return res.send("no user id");
  const { longURL } = urlDatabase[id];
  if (longURL === undefined) {
    const { user_id } = req.cookies;
    const templateVars = {
      id,
      longURL: urlDatabase[id],
      urls: urlDatabase,
      users,
      user: users[user_id],
    };
    return res.render("urls_notAvailable", templateVars);
  }
  res.redirect(longURL);
});

//CREATE
app.post("/urls/", (req, res) => {
  const id = generateRandomString(6);
  const { user_id } = req.session;
  console.log(user_id);
  const { longURL } = req.body;
  Object.assign(urlDatabase, { [id]: { longURL, userID: user_id } });

  console.log(urlDatabase);
  res.redirect(`/urls/${id}`);
});

//DELETE
app.post("/urls/:id/delete", (req, res) => {
  const { id: idToDelete } = req.params;
  delete urlDatabase[idToDelete];
  res.redirect("/urls");
});

//UPDATE OR EDIT
app.post("/urls/:id", (req, res) => {
  const { id } = req.params;
  const { editURL } = req.body;
  urlDatabase[id].longURL = editURL;

  res.redirect("/urls");
});
//lOGIN
app.get("/login", (req, res) => {
  const { user_id } = req.session;
  console.log(req.session);
  if (user_id) res.redirect("/urls");
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

  if (!bcrypt.compareSync(password, user.password))
    return res.status(403).send("Invalid password and email");
  console.log(users);
  // res.cookie("user_id", user.id);
  req.session.user_id = user.id;
  res.redirect("/urls");
});

//LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
