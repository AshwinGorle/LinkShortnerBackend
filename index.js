import express from 'express';
import connectMongoDb from './connection.js'
import path from 'path'
import ejs from 'ejs'
const app = express();
import cors from 'cors'
import urlRouter from './routes/url.js' 
import userRouter from './routes/userRoutes.js'


connectMongoDb(`${process.env.DATABASE_URL}`)
.then(()=>console.log("mongoDb connected...."))

app.use(cors());
app.use(express.urlencoded({extended : false}))
app.use(express.json());

app.use('/user' , userRouter );
app.use('/url', urlRouter );

app.set("view engine" , "ejs");
app.set("views", path.resolve('./views'));

app.listen(process.env.PORT, ()=>{
    console.log("server started.....")
})