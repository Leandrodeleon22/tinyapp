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

//GET RANDOM ID
const generateRandomString = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

//HOMEPAGE
app.get("/urls", (req, res) => {
  // console.log(req.cookies.username);
  const { username } = req.cookies;
  const templateVars = {
    username,
    urls: urlDatabase,
  };

  res.render("urls_index", templateVars);
});

//CREATE NEW URL PAGE
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
  // res.redirect("/urls");
});

//EDIT PAGE
app.get("/urls/:id", (req, res) => {
  const { id } = req.params;
  const templateVars = { id, longURL: urlDatabase[id] };
  res.render("urls_show", templateVars);
});

//CREATE PAGE
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

  // res.redirect(`urls/${id}`);
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
  // urlDatabase[id] =
});

//LOGIN
app.post("/login", (req, res) => {
  const { username: usernameValue } = req.body;

  res.cookie("username", usernameValue);
  res.redirect("/urls");
});

//LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
