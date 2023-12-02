const express = require("express");
// const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const { getUserByEmail, generateRandomString } = require("./helpers");
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
    keys: ["key1", "keys2"],
    maxAge: 24 * 60 * 60 * 1000, //24hours
  })
);
app.use(methodOverride("_method"));

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
  // Object.assign(allObjects, [...shortUrl]{})
  // console.log(allObjects);
  return allObjects;
};

// const urlDatabase = {
//   b2xVn2: "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
// };

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
  console.log(myUrlDatabase);
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
    // users,
    user: users[user_id],
  };
  res.render("urls_new", templateVars);
});

//REGISTER
app.get("/register", (req, res) => {
  const { user_id } = req.session;
  // if (!user_id) return res.redirect("/urls");

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
    // users,
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
  // let uniqueVistors = 0;
  // let visitors = [];
  // if (!visitors.includes(id)) {
  //   visitors.push(id);
  // }

  if (!urlDatabase[id]) {
    const { user_id } = req.session;
    const templateVars = {
      user: users[user_id],
    };
    return res.render("urls_notAvailable", templateVars);
  }

  const previousVisits = req.session[id];
  console.log("+++++++", previousVisits, urlDatabase[id]);
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
  console.log(user_id);
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

  // if (!user_id) return res.redirect("/urls");
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
