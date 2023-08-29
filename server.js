const express = require('express')
const dotenv = require('dotenv').config()
const app = express()
const cors = require('cors')
//database connection
const connectDb = require('./connectionDb')
const { errorHandler, notFound } = require('./middlewares/error')
connectDb()

//middleware json
app.use(express.json())

// cors Policy
app.use(cors({
    origin:"http://localhost:3000"
}))

//Routes
app.use('/api/auth',require('./router/authRouter'))
app.use('/api/users',require('./router/usersRouter'))
app.use('/api/posts',require('./router/postRouter'))
app.use('/api/comments',require('./router/commentRoute'))
app.use('/api/categories',require('./router/categoryRouter'))


// error route middlewar
app.use(notFound)

// error handler middleware
app.use(errorHandler)






//raning the server
const PORT = process.env.PORT 
app.listen(PORT,()=>console.log(`server raning in port ${PORT}`))