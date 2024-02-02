const db = require("../db");

const MooviesController = {
  async findAll(req, res) {
    try {
      const moovies = await db.query(`
        SELECT 
          m.*,
          c.name AS category_name,
          c.description AS category_description
        FROM moovie m 
        INNER JOIN category c ON c.id = m.category_id
      `);

      res.json(moovies.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async find(req, res) {
    const { id } = req.params;

    try {
      const moovies = await db.query(
        `
        SELECT 
          m.*,
          c.name AS category_name,
          c.description AS category_description
        FROM moovie m 
        INNER JOIN category c ON c.id = m.category_id
        WHERE m.id = $1
      `,
        [id]
      );

      if (moovies.rows.length > 0) {
        res.json(moovies.rows[0]);
      } else {
        res.status(404).json({ error: "Filme não encontrado" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    const { title, description, category_id, release_date } = req.body;

    // Validação dos campos
    if (!title || !description || !category_id || !release_date) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    try {
      // Verifica se o nome do filme já está em uso
      const existingMoovie = await db.query(
        "SELECT * FROM moovie WHERE title = $1",
        [title]
      );

      if (existingMoovie.rows.length > 0) {
        return res
          .status(409)
          .json({ error: "O nome do filme já está em uso" });
      }

      // Verifica se a categoria existe
      const category = await db.query("SELECT * FROM category WHERE id = $1", [
        category_id,
      ]);

      if (category.rows.length === 0) {
        return res.status(404).json({ error: "Categoria não cadastrada" });
      }

      // Insere o novo filme
      const newMoovie = await db.query(
        `INSERT INTO moovie (title, description, category_id, release_date)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [title, description, category_id, release_date]
      );

      res.status(201).json(newMoovie.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    const { id } = req.params;
    const { title, description, category_id, release_date } = req.body;

    // Validação dos campos
    if (!title || !description || !category_id || !release_date) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    try {
      // Verifica se o nome do filme já está em uso por outro filme
      const existingMoovie = await db.query(
        "SELECT * FROM moovie WHERE title = $1 AND id != $2",
        [title, id]
      );

      if (existingMoovie.rows.length > 0) {
        return res
          .status(409)
          .json({ error: "O nome do filme já está em uso" });
      }

      // Verifica se a categoria existe
      const category = await db.query("SELECT * FROM category WHERE id = $1", [
        category_id,
      ]);

      if (category.rows.length === 0) {
        return res.status(404).json({ error: "Categoria não cadastrada" });
      }

      // Atualiza o filme
      const updatedMoovie = await db.query(
        `UPDATE moovie
         SET title = $1, description = $2, category_id = $3, release_date = $4
         WHERE id = $5
         RETURNING *`,
        [title, description, category_id, release_date, id]
      );

      if (updatedMoovie.rows.length > 0) {
        res.json(updatedMoovie.rows[0]);
      } else {
        res
          .status(404)
          .json({ error: "Filme não encontrado para atualização" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async delete(req, res) {
    const { id } = req.params;

    try {
      const result = await db.query(
        "DELETE FROM moovie WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rowCount > 0) {
        res.status(204).json({});
      } else {
        res.status(304).json({});
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = MooviesController;
