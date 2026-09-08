const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Conexão com o MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "divino_acai"
});

// Testa a conexão
db.connect((err) => {
    if (err) {
        console.error("❌ Erro ao conectar com o MySQL:", err.message);
        return;
    }

    console.log("✅ Conectado ao MySQL!");
});

// Rota principal
app.get("/", (req, res) => {
    res.json({
        mensagem: "Servidor do Divino Açaí funcionando!"
    });
});

// Buscar categorias
app.get("/categorias", (req, res) => {
    const sql = "SELECT * FROM categorias";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erro ao buscar categorias:", err);
            return res.status(500).json({
                erro: "Erro ao buscar categorias"
            });
        }

        res.json(results);
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});