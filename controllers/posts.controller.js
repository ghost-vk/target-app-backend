const db = require('./../db')
const { postSchema } = require('./../utils/validation-schemes')
const removeUploadedFile = require('./../utils/removeUploadedFile')
const uploadFolder = '/public/uploads/img/'

class PostsController {
  async addPost(req, res) {
    try {
      const prepared = await this.prepareValuesForPosting(req)
      const dbResponse = await db.query(
        `INSERT INTO posts (posting_date, title, subtitle, thumbnail, content, recommended, category, tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          prepared.posting_date,
          prepared.title,
          prepared.subtitle,
          prepared.thumbnail,
          prepared.content,
          prepared.recommended || null,
          prepared.category || null,
          prepared.tags || null,
        ]
      )
      const createdPost = dbResponse.rows[0]
      res.status(200).json({ status: 'success', data: createdPost })
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
        if (
          !parsed.posting_date ||
          !parsed.title ||
          !parsed.subtitle ||
          !parsed.content
        ) {
          reject(
            'Not find "posting_date" or "title" or "subtitle" or "content" in "values"'
          )
        }
        const prepared = {
          posting_date: parsed.posting_date
            ? new Date(parsed.posting_date)
            : new Date(),
          title: parsed.title,
          subtitle: parsed.subtitle,
          thumbnail: image,
          content: parsed.content,
          recommended: parsed.recommended ? Number(parsed.recommended) : undefined,
          category: Number(parsed.category),
          tags: parsed.tags,
        }
        await postSchema.validate(prepared)
        resolve(prepared)
      } catch (err) {
        reject(err)
      }
    })
  }
  async getPosts(req, res) {
    let { category, limit, fullmode } = req.query
    try {
      const categoryFilter = Number(category)
        ? `WHERE category=${Number(category)}`
        : ''
      const limitNumber = Number(limit) ? Number(limit) : 10
      fullmode = fullmode ? fullmode : '1' // default all data
      const selectionData = fullmode === '1' ? '*' : 'id,posting_date,title,subtitle,thumbnail'
      const dbResponse = await db.query(
        `SELECT ${selectionData} FROM posts ${categoryFilter} ORDER BY posting_date DESC LIMIT ${limitNumber}`
      )
      const records = dbResponse.rows
      if (records.length) {
        res.status(200).json({ data: records })
      } else {
        res.status(404).json({ message: 'Records not found' })
      }
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Something going wrong' })
    }
  }
  async getPost(req, res) {
    const id = Number(req.params.id) || false
    if (!id) {
      res.status(400).json({ message: 'Not provided ID' })
    }
    try {
      const dbResponse = await db.query(`SELECT * FROM posts WHERE id=$1`, [id])
      const record = dbResponse.rows[0]
      if (record) {
        res.status(200).json(dbResponse.rows[0])
      } else {
        res.status(404).json({ message: 'Record not found' })
      }
    } catch (err) {
      console.log(err)
      res.status(500).end()
    }
  }
  async deletePost(req, res) {
    const id = Number(req.params.id) || false
    if (!id) {
      res.status(400).json({ message: 'Not provided ID' })
      return
    }
    try {
      const dbResponse = await db.query(
        `DELETE FROM posts WHERE id=$1 RETURNING *`,
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
  async updateField(req, res) {
    const id = Number(req.params.id) || false
    if (!id) {
      res.status(400).json({ message: 'Not provided ID' })
      return
    }
    const field = req.params.field
    if (
      ![
        'posting_date',
        'title',
        'subtitle',
        'content',
        'recommended',
        'category',
        'tags',
      ].includes(field)
    ) {
      res.status(400).json({ message: 'Not provided field' })
      return
    }
    let { value } = req.body
    if (['recommended', 'category'].includes(field)) {
      value = Number(value)
    }
    if (field === 'posting_date') {
      value = new Date(value)
    }
    try {
      let data = {}
      data[field] = value
      await postSchema.validateAt(field, data)
      const dbResponse = await db.query(
        `UPDATE posts SET ${field}=$1 WHERE id=$2 RETURNING *`,
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
        'UPDATE posts SET thumbnail=$1 WHERE id=$2 RETURNING *',
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
      res
        .status(500)
        .json({ message: '500 error: Something going wrong.' })
    }
  }
}

module.exports = new PostsController()
