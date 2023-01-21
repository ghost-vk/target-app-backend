const db = require('./../db');
const { dbSchema } = require('./../config');

class PostsController {

  async getPosts(req, res) {
    let { category, limit, fullmode } = req.query;
    try {
      const categoryFilter = Number(category) ? `WHERE category=${Number(category)}` : '';
      const limitNumber = Number(limit) ? Number(limit) : 10;
      fullmode = fullmode ? fullmode : '1'; // default all data
      const selectionData = fullmode === '1' ? '*' : 'id,posting_date,title,subtitle,thumbnail';
      const dbResponse = await db.query(
        `SELECT ${selectionData} FROM ${dbSchema}.posts ${categoryFilter} ORDER BY posting_date DESC LIMIT ${limitNumber}`,
      );
      const records = dbResponse.rows;
      if (records.length) {
        res.status(200).json({ data: records });
      } else {
        res.status(404).json({ message: 'Records not found' });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Something going wrong' });
    }
  }

  async getPost(req, res) {
    const id = Number(req.params.id) || false;
    if (!id) {
      res.status(400).json({ message: 'Not provided ID' });
    }
    try {
      const dbResponse = await db.query(`SELECT * FROM ${dbSchema}.posts WHERE id=$1`, [id]);
      const record = dbResponse.rows[0];
      if (record) {
        res.status(200).json(dbResponse.rows[0]);
      } else {
        res.status(404).json({ message: 'Record not found' });
      }
    } catch (err) {
      console.log(err);
      res.status(500).end();
    }
  }
}

module.exports = new PostsController();
