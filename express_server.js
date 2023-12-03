const express = require("express");
const methodOverride = require("method-override");
const { getUserByEmail, generateRandomString } = require("./helpers");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

//MIDLEWARES
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "keys2"],
    maxAge: 24 * 60 * 60 * 1000, //24hours
  })
);
app.use(methodOverride("_method"));

//Get urls for specific user helper function
const urlsForUser = (id) => {
  const allObjects = {};
  const shortUrls = Object.keys(urlDatabase).filter(
    (element) => urlDatabase[element].userID === id
  );

  shortUrls.forEach((shortUrl) => {
    Object.assign(allObjects, {
      [shortUrl]: {
        longURL: urlDatabase[shortUrl].longURL,
        userID: urlDatabase[shortUrl].userID,
      },
    });
  });

  return allObjects;
};

//DATA
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
    totalVisitor: 0,
    uniqueVisitor: 0,
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// DATA USERS
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

//HOME
app.get("/urls", (req, res) => {
  const { user_id } = req.session;
  if (!user_id || !users) {
    req.session = null;
    return res.redirect("/login");
  }

  const myUrlDatabase = urlsForUser(user_id);

  const templateVars = {
    urls: myUrlDatabase,
    user: users[user_id],
  };

  res.render("urls_index", templateVars);
});

//CREATE NEW URL PAGE
app.get("/urls/new", (req, res) => {
  const { user_id } = req.session;

  if (!user_id) return res.redirect("/login");
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id],
  };
  res.render("urls_new", templateVars);
});

//REGISTER
app.get("/register", (req, res) => {
  const { user_id } = req.session;

  const templateVars = {
    urls: urlDatabase,
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
  if (getUserByEmail(email, users))
    return res.status(400).send("Email already exist");

  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!bcrypt.compareSync(password, hashedPassword)) {
    return res.status(400).send("Invalid password and email");
  }

  const newUser = { [id]: { id, email, password: hashedPassword } };

  Object.assign(users, newUser);

  req.session.user_id = id;

  res.redirect("/urls");
});

// EDIT PAGE
app.get("/urls/:id", (req, res) => {
  const { id } = req.params;
  const { user_id } = req.session;

  if (!urlDatabase[id]) {
    return res.status(404).send("ID CANT BE FOUND");
  }

  if (!user_id) return res.redirect("/login");

  const url = urlDatabase[id];

  const templateVars = {
    id,
    views: url.totalVisitor,
    uniqueVisitor: url.uniqueVisitor,
    longURL: url.longURL,
    urls: urlDatabase,
    user: users[user_id],
  };
  res.render("urls_show", templateVars);
});

//GO TO THE LINK PROVIDED
app.get("/u/:id", (req, res) => {
  const { id } = req.params;

  if (!urlDatabase[id]) {
    const { user_id } = req.session;
    const templateVars = {
      user: users[user_id],
    };
    return res.render("urls_notAvailable", templateVars);
  }

  const previousVisits = req.session[id];

  if (!previousVisits) {
    urlDatabase[id].uniqueVisitor++;
    req.session[id] = id;
  }
  urlDatabase[id].totalVisitor++;
  req.session.views = (req.session.views || 0) + 1;
  const { longURL } = urlDatabase[id];
  res.redirect(longURL);
});

//CREATE
app.post("/urls/", (req, res) => {
  const id = generateRandomString(6);
  const { user_id } = req.session;

  const { longURL } = req.body;
  const totalVisitor = 0;
  const uniqueVisitor = 0;
  Object.assign(urlDatabase, {
    [id]: { longURL, userID: user_id, totalVisitor, uniqueVisitor },
  });

  res.redirect(`/urls/${id}`);
});

//DELETE
app.delete("/urls/:id", (req, res) => {
  const { id: idToDelete } = req.params;
  delete urlDatabase[idToDelete];
  res.redirect("/urls");
});

//UPDATE OR EDIT
app.put("/urls/:id", (req, res) => {
  const { id } = req.params;
  const { editURL } = req.body;

  //Can't be empty
  if (!editURL) return res.redirect(`/urls/${id}`);

  urlDatabase[id].longURL = editURL;

  res.redirect("/urls");
});
//lOGIN
app.get("/login", (req, res) => {
  const { user_id } = req.session;

  const templateVars = {
    urls: urlDatabase,
    user: users[user_id],
  };

  res.render("urls_login", templateVars);
});

//lOGIN  REFACTOR
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).send("password and email cant be empty");

  const user = getUserByEmail(email, users);

  if (!user) return res.status(403).send("Invalid password and email");

  if (!bcrypt.compareSync(password, user.password))
    return res.status(403).send("Invalid password and email");

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
