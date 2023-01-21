const db = require('./../db');
const { dbSchema } = require('./../config');

class MagnetsController {

  async getMagnets(req, res) {
    try {
      const dbResponse = await db.query(`SELECT * FROM ${dbSchema}.magnets ORDER BY id DESC`);
      const records = dbResponse.rows;
      if (records.length) {
        res.status(200).json(records);
      } else {
        res.status(404).json({ message: 'Records not found' });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Something going wrong' });
    }
  }

  async getMagnet(req, res) {
    const id = Number(req.params.id) || false;
    if (!id) {
      res.status(400).json({ message: 'Not provided ID' });
    }
    try {
      const requestedFields = req.query.link === '1' ? 'link' : '*';
      const dbResponse = await db.query(`SELECT ${requestedFields} FROM ${dbSchema}.magnets WHERE id=$1`, [id]);
      const records = dbResponse.rows;
      if (records.length) {
        res.status(200).json(records[0]);
      } else {
        res.status(404).json({ message: 'Records not found' });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Something going wrong' });
    }
  }
}

module.exports = new MagnetsController();
