const db = require('./../db')
const removeUploadedFile = require('./../utils/removeUploadedFile')
const uploadFolder = '/public/uploads/img/'

class ReviewsController {
  async addReview(req, res) {
    const data = JSON.parse(req.body.values)
    const values = {
      name: data.name || null,
      link: data.link || null,
      profession: data.profession || null,
      content: data.content || null,
      category: data.category || null,
      review_order: Number(data.review_order) || 10,
    }
    let image = req.file ? uploadFolder + req.file.filename : null
    if (!image) {
      image = req.linkToExistsReviewImage ? req.linkToExistsReviewImage : null
    }
    try {
      await db.query(
        `INSERT INTO reviews(full_name, link, profession, image, content, category, review_order) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          values.name,
          values.link,
          values.profession,
          image,
          values.content,
          values.category,
          values.review_order,
        ]
      )
      res.status(200).json({ status: 'success' })
    } catch (e) {
      if (req.file) {
        await removeUploadedFile(req.file)
      }
      res.status(500).json({ status: 'error' })
    }
  }
  async deleteReview(req, res) {
    let { id } = req.params
    if (!id) {
      res.status(400).end({ status: 'error', message: 'Please provide ID' })
    }
    id = Number(id)

    try {
      await db.query('DELETE FROM reviews WHERE id=$1', [id])
      res.status(200).json({ status: 'success' })
    } catch (err) {
      res.status(500).json({ status: 'error' })
    }
  }
  async updateReview(req, res) {
    let { id } = req.params
    id = Number(id)
    if (!id || id < 1) {
      res
        .status(400)
        .json({ status: 'error', message: 'Provide ID for updating' })
    }
    let { values, touchedFields } = req.body
    if (!values || !touchedFields) {
      res.status(400).json({
        status: 'error',
        message: 'Provide "touchedFields" and "values" for updating',
      })
    }
    values = JSON.parse(values)
    touchedFields = JSON.parse(touchedFields)
    let image = req.file ? uploadFolder + req.file.filename : null
    if (!image) {
      image = req.linkToExistsReviewImage ? req.linkToExistsReviewImage : null
    }
    // console.log(values)
    // console.log(touchedFields)

    if (typeof touchedFields === 'string') {
      touchedFields = touchedFields.split(',')
      if (!Array.isArray(touchedFields)) {
        touchedFields = [touchedFields]
      }
    }

    if (!Array.isArray(touchedFields)) {
      res.status(400).json({
        status: 'error',
        message: '"touchedFields" should be an Array',
      })
    }

    try {
      if (touchedFields.includes('full_name')) {
        const name = values.full_name || null
        await this.updateName(id, name)
      }

      if (touchedFields.includes('link')) {
        const link = values.link || null
        await this.updateLink(id, link)
      }

      if (touchedFields.includes('profession')) {
        const profession = values.profession || null
        await this.updateProfession(id, profession)
      }

      if (touchedFields.includes('image')) {
        await this.updateImage(id, image)
      }

      if (touchedFields.includes('content')) {
        const content = values.content || null
        await this.updateContent(id, content)
      }

      if (touchedFields.includes('category')) {
        const category = values.category || null
        await this.updateCategory(id, category)
      }

      if (touchedFields.includes('review_order')) {
        const review_order = values.review_order || null
        await this.updateOrder(id, review_order)
      }

      res
        .status(200)
        .json({ status: 'success', message: `Review with ID=${id} updated.` })
    } catch (err) {
      if (req.file) {
        await removeUploadedFile(req.file)
      }
      console.log(err)
      res.status(500).end()
    }
  }
  updateName(id, name) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!name) {
          reject('Error: "name" should be String')
        }
        const dbResponse = await db.query(
          'UPDATE reviews SET full_name=$2 WHERE id=$1',
          [id, name]
        )
        resolve(dbResponse)
      } catch (err) {
        reject(err)
      }
    })
  }
  updateLink(id, link) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!link) {
          reject('Link should be String value')
        }
        const dbResponse = await db.query(
          'UPDATE reviews SET link=$2 WHERE id=$1 RETURNING *',
          [id, link]
        )
        resolve(dbResponse)
      } catch (err) {
        reject(err)
      }
    })
  }
  updateProfession(id, profession) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!profession) {
          reject('Profession should be String value')
        }
        const dbResponse = await db.query(
          'UPDATE reviews SET profession=$2 WHERE id=$1 RETURNING *',
          [id, profession]
        )
        resolve(dbResponse)
      } catch (err) {
        reject(err)
      }
    })
  }
  updateImage(id, image) {
    return new Promise(async (resolve, reject) => {
      try {
        const dbResponse = await db.query(
          'UPDATE reviews SET image=$2 WHERE id=$1 RETURNING *',
          [id, image]
        )
        resolve(dbResponse)
      } catch (err) {
        reject(err)
      }
    })
  }
  updateContent(id, content) {
    return new Promise(async (resolve, reject) => {
      if (!content) {
        reject('Content should be String value')
      }
      try {
        const dbResponse = await db.query(
          'UPDATE reviews SET content=$2 WHERE id=$1 RETURNING *',
          [id, content]
        )
        resolve(dbResponse)
      } catch (err) {
        reject(err)
      }
    })
  }
  updateCategory(id, category) {
    return new Promise(async (resolve, reject) => {
      if (
        !category ||
        !['target-setup', 'consultation', 'education', 'telegram-chat', 'free-products'].includes(category)
      ) {
        reject(
          'Category should be String value, one of "target-setup", "consultation", "education", "telegram-chat", "free-products"'
        )
      }
      try {
        const dbResponse = await db.query(
          'UPDATE reviews SET category=$2 WHERE id=$1 RETURNING *',
          [id, category]
        )
        resolve(dbResponse.rows[0])
      } catch (err) {
        reject(err)
      }
    })
  }
  updateOrder(id, review_order) {
    return new Promise(async (resolve, reject) => {
      let order =
        typeof review_order === 'string' ? Number(review_order) : review_order
      if (!order) {
        reject('Review order should be Number value')
      }
      try {
        const dbResponse = await db.query(
          'UPDATE reviews SET review_order=$2 WHERE id=$1 RETURNING *',
          [id, order]
        )
        resolve(dbResponse.rows[0])
      } catch (err) {
        reject(err)
      }
    })
  }
  async getReviews(req, res) {
    const category = req.query.category
    const limit = Number(req.query.limit) || 10
    const orderBy = req.query.ordered === '1' ? 'review_order' : 'id DESC'
    const catFilter = ['target-setup', 'consultation', 'education'].includes(
      category
    )
      ? 'WHERE category=$2'
      : ''
    const query = `SELECT * FROM reviews ${catFilter} ORDER BY ${orderBy} LIMIT $1`
    const params = catFilter ? [limit, category] : [limit]
    try {
      const reviews = await db.query(query, params)
      res.status(200).json(reviews.rows)
    } catch (err) {
      res.status(500).json({ status: 'error' })
    }
  }
}

module.exports = new ReviewsController()
