const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const SECRET_KEY = "seu_segredo_super_secreto"; // 🔹 Altere para um valor seguro

// ✅ Rota de Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin") {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    return res.json({ token });
  }

  return res.status(401).json({ error: "Usuário ou senha incorretos!" });
});

module.exports = router;
