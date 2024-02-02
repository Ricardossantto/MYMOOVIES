const db = require("../db");

const CategoryController = {
  async findAll(req, res) {
    try {
      const category = await db.query("SELECT * FROM category");
      res.json(category.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async find(req, res) {
    const { id } = req.params;

    try {
      const category = await db.query("SELECT * FROM category WHERE id = $1", [
        id,
      ]);

      if (category.rows.length > 0) {
        res.json(category.rows[0]);
      } else {
        res.status(404).json({ error: "Categoria não encontrada" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    const { name, description } = req.body;

    try {
      const newCategory = await db.query(
        "INSERT INTO category (name, description) VALUES ($1, $2) RETURNING *",
        [name, description]
      );

      res.status(201).json(newCategory.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: "O campo nome é obrigatório." });
      }

      // Verificar se uma categoria com o mesmo nome já existe, excluindo a categoria que está sendo atualizada
      const checkCategoryExists = await db.query(
        "SELECT * FROM category WHERE name = $1 AND id <> $2",
        [name, id]
      );

      if (checkCategoryExists.rows.length > 0) {
        return res
          .status(400)
          .json({ message: "Já existe, Uma categoria com esse nome." });
      }

      // Agora, atualize a categoria apenas se o nome não estiver em uso
      const updateQuery =
        "UPDATE category SET name = $1 WHERE id = $2 RETURNING *";
      const updatedCategory = await db.query(updateQuery, [name, id]);

      if (updatedCategory.rows.length > 0) {
        return res
          .status(200)
          .json({ message: "Categoria atualizada com sucesso!" });
      } else {
        return res.status(404).json({ message: "Categoria não encontrada." });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Erro ao atualizar categoria: " + error.message });
    }
  },
  async delete(req, res) {
    const { id } = req.params;

    try {
      const result = await db.query(
        "DELETE FROM category WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rowCount > 0) {
        res.status(204).json({});
      }

      res.status(304).json({});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = CategoryController;
