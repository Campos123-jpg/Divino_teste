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
    database: "divino"
});

// Testa a conexão
db.connect((err) => {
    if (err) {
        console.error("❌ Erro ao conectar com o MySQL:", err.message);
    } else {
        console.log("✅ Conectado ao MySQL!");
    }
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


app.get("/produtos", (req, res) => {
    const sql = `
        SELECT
            p.id,
            p.nome,
            p.descricao,
            p.preco,
            p.imagem,
            p.categoria_id,
            p.ativo,
            c.nome AS categoria
        FROM produtos p
        LEFT JOIN categorias c
            ON p.categoria_id = c.id
        WHERE p.ativo = TRUE
        ORDER BY p.nome ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erro ao buscar produtos:", err);

            return res.status(500).json({
                erro: "Erro ao buscar produtos"
            });
        }

        res.json(results);
    });
});


app.get("/acompanhamentos", (req, res) => {
    const sql = `
        SELECT id, nome, grupo, preco
        FROM acompanhamentos
        WHERE ativo = 1
        ORDER BY id
    `;

    db.query(sql, (erro, resultados) => {
        if (erro) {
            console.error("Erro ao buscar acompanhamentos:", erro);

            return res.status(500).json({
                erro: "Não foi possível carregar os acompanhamentos."
            });
        }

        res.json(resultados);
    });
});

app.post("/produtos", (req, res) => {
    const {
        nome,
        descricao,
        preco,
        imagem,
        categoria_id
    } = req.body;

    if (
        !nome ||
        preco === undefined ||
        !Number.isFinite(Number(preco)) ||
        Number(preco) < 0 ||
        !Number.isInteger(Number(categoria_id)) ||
        Number(categoria_id) <= 0
    ) {
        return res.status(400).json({
            erro: "Informe nome, preço válido e categoria_id válido."
        });
    }

    const sql = `
        INSERT INTO produtos
        (nome, descricao, preco, imagem, categoria_id, ativo)
        VALUES (?, ?, ?, ?, ?, TRUE)
    `;

    const valores = [
        nome,
        descricao || null,
        Number(preco),
        imagem || null,
        Number(categoria_id)
    ];

    db.query(sql, valores, (err, resultado) => {
        if (err) {
            console.error("Erro ao cadastrar produto:", err);

            if (err.code === "ER_NO_REFERENCED_ROW_2") {
                return res.status(400).json({
                    erro: "A categoria informada não existe."
                });
            }

            return res.status(500).json({
                erro: "Erro ao cadastrar produto."
            });
        }

        res.status(201).json({
            mensagem: "Produto cadastrado com sucesso!",
            id: resultado.insertId
        });
    });
});

app.put("/produtos/:id", (req, res) => {
    const { id } = req.params;
    const { nome, descricao, preco, imagem, categoria_id } = req.body;

    if (
        !Number.isInteger(Number(id)) ||
        Number(id) <= 0 ||
        !nome ||
        preco === undefined ||
        !Number.isFinite(Number(preco)) ||
        Number(preco) < 0 ||
        !Number.isInteger(Number(categoria_id)) ||
        Number(categoria_id) <= 0
    ) {
        return res.status(400).json({
            erro: "Informe ID, nome, preço válido e categoria_id válido."
        });
    }

    const sql = `
        UPDATE produtos
        SET nome = ?,
            descricao = ?,
            preco = ?,
            imagem = ?,
            categoria_id = ?
        WHERE id = ?
    `;

    const valores = [
        nome,
        descricao || null,
        Number(preco),
        imagem || null,
        Number(categoria_id),
        Number(id)
    ];

    db.query(sql, valores, (err, resultado) => {
        if (err) {
            console.error("Erro ao editar produto:", err);

            if (err.code === "ER_NO_REFERENCED_ROW_2") {
                return res.status(400).json({
                    erro: "A categoria informada não existe."
                });
            }

            return res.status(500).json({
                erro: "Erro ao editar produto."
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                erro: "Produto não encontrado."
            });
        }

        res.json({
            mensagem: "Produto atualizado com sucesso!"
        });
    });
});


app.delete("/produtos/:id", (req, res) => {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            erro: "Informe um ID válido."
        });
    }

    const sql = "DELETE FROM produtos WHERE id = ?";

    db.query(sql, [Number(id)], (err, resultado) => {
        if (err) {
            console.error("Erro ao excluir produto:", err);

            if (err.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({
                    erro: "Não é possível excluir este produto porque ele está vinculado a um pedido."
                });
            }

            return res.status(500).json({
                erro: "Erro ao excluir produto."
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                erro: "Produto não encontrado."
            });
        }

        res.json({
            mensagem: "Produto excluído com sucesso!"
        });
    });
});


// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});