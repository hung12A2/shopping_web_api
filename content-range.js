module.exports = (req, res, next) => {
    res.header('Access-Control-Expose-Headers', 'Content-Range')
    res.header('Content-Range', 'categories 0-20/20')
  
    next()
  }