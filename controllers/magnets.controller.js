const { magnetSchema } = require('./../utils/validation-schemes')
const db = require('./../db')
const removeUploadedFile = require('./../utils/removeUploadedFile')
const uploadFolder = '/public/uploads/img/'

class MagnetsController {
  async add(req, res) {
    try {
      const prepared = await this.prepareValuesForPosting(req)
      const dbResponse = await db.query(
        `INSERT INTO magnets (name, link, image, description) VALUES ($1, $2, $3, $4) RETURNING *`,
        [prepared.name, prepared.link, prepared.image, prepared.description]
      )
      const created = dbResponse.rows[0]
      res.status(200).json(created)
    } catch (err) {
      console.error('❌ Ошибка при сохранении записи в БД\n', err)
      if (req.file) {
        await removeUploadedFile(req.file)
      }
      res
        .status(500)
        .json({ status: 'error', message: 'Something going wrong' })
    }
  }
  prepareValuesForPosting(req) {
    return new Promise(async (resolve, reject) => {
      let image = req.file ? uploadFolder + req.file.filename : null
      if (!image) {
        image = req.linkToExistsFile ? req.linkToExistsFile : null
      }
      try {
        const { values } = req.body
        const parsed = JSON.parse(values)
        if (!parsed.name || !parsed.link) {
          reject('Not find "name" or "link" in "values"')
        }
        let prepared = { ...parsed, image: image }
        await magnetSchema.validate(prepared)
        prepared.description = prepared.description ? prepared.description : null
        resolve(prepared)
      } catch (err) {
        reject(err)
      }
    })
  }
  async updateField(req, res) {
    const id = Number(req.params.id) || false
    if (!id) {
      res.status(400).json({ message: 'Not provided ID' })
      return
    }
    const field = req.params.field
    const available = ['name', 'link', 'description']
    if (!available.includes(field)) {
      res.status(400).json({ message: 'Not provided field' })
      return
    }
    let { value } = req.body
    try {
      let data = {}
      data[field] = value
      await magnetSchema.validateAt(field, data)
      const dbResponse = await db.query(
        `UPDATE magnets SET ${field}=$1 WHERE id=$2 RETURNING *`,
        [value, id]
      )
      if (dbResponse.rowCount > 0) {
        res.status(200).json(dbResponse.rows[0])
      } else {
        res.status(404).json({ message: 'Record not found' })
      }
    } catch (err) {
      console.log(err)
      res.status(500).end()
    }
  }
  async updateThumbnail(req, res) {
    const id = Number(req.params.id) || false
    if (!id) {
      res.status(400).json({ message: 'Not provided ID' })
      return
    }
    const isFileUploaded = !!req.file
    let image = isFileUploaded ? uploadFolder + req.file.filename : null
    if (!image) {
      image = req.linkToExistsReviewImage ? req.linkToExistsReviewImage : null
    }
    try {
      const dbResponse = await db.query(
        'UPDATE magnets SET image=$1 WHERE id=$2 RETURNING *',
        [image, id]
      )
      if (dbResponse.rowCount) {
        res.status(200).json(dbResponse.rows[0])
      } else {
        res.status(404).json({ message: '404 error: Record not found.' })
      }
    } catch (err) {
      if (isFileUploaded) {
        await removeUploadedFile(req.file)
      }
      res.status(500).json({ message: '500 error: Something going wrong.' })
    }
  }
  async getMagnets(req, res) {
    try {
      const dbResponse = await db.query(
        `SELECT * FROM magnets ORDER BY id DESC`
      )
      const records = dbResponse.rows
      if (records.length) {
        res.status(200).json(records)
      } else {
        res.status(404).json({ message: 'Records not found' })
      }
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Something going wrong' })
    }
  }
  async getMagnet(req, res) {
    const id = Number(req.params.id) || false
    if (!id) {
      res.status(400).json({ message: 'Not provided ID' })
    }
    try {
      const requestedFields = req.query.link === '1' ? 'link' : '*'
      const dbResponse = await db.query(
        `SELECT ${requestedFields} FROM magnets WHERE id=$1`,
        [id]
      )
      const records = dbResponse.rows
      if (records.length) {
        res.status(200).json(records[0])
      } else {
        res.status(404).json({ message: 'Records not found' })
      }
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Something going wrong' })
    }
  }
  async delete(req, res) {
    const id = Number(req.params.id) || false
    if (!id) {
      res.status(400).json({ message: 'Not provided ID' })
      return
    }
    try {
      const dbResponse = await db.query(
        `DELETE FROM magnets WHERE id=$1 RETURNING *`,
        [id]
      )
      if (dbResponse.rowCount > 0) {
        res.status(200).json(dbResponse.rows[0])
      } else {
        res.status(404).json({ message: 'Record not found' })
      }
    } catch (err) {
      console.log(err)
      res.status(500).end()
    }
  }
}

module.exports = new MagnetsController()
