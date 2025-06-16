require('dotenv').config();
const nodemailer = require("nodemailer");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const userRoutes = require("./src/routes/userRoutes");
const authRoutes = require("./src/routes/authRouter");
const passwordRecoveryRoutes = require("./src/routes/passwordRecoveryRoutes");
const path = require("path");
const sequelize = require(path.join(__dirname, "src", "config", "db"));
// const open = require('open');

// dotenv.config();

const app = express();
const PORT = process.env.PORT || 3300;

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

app.use(
  "/controllers",
  express.static(
    path.join(__dirname, "src", "controller", "cadastrarControllet")
  )
);

// Rotas estáticas para as páginas HTML
app.get("/Email.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Email.html"));
});

app.get("/Cadastrar.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Cadastrar.html"));
});

app.get("/RecuperaSenha.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "RecuperaSenha.html"));
});

app.use("/api/auth", authRoutes);
app.use("/api/password-recovery", passwordRecoveryRoutes);
app.use("/api", userRoutes);

app.use("/src", express.static(path.join(__dirname, "src")));

sequelize
  .sync()
  .then(async () => {
    app.listen(PORT, async () => {
      const url = `http://localhost:${PORT}`;
      console.log(`Servidor rodando em: ${url}`);

      const open = (await import("open")).default;
      open(url);
    });
  })
  .catch((error) => {
    console.error("Erro ao sincronizar o banco de dados:", error);
  });
