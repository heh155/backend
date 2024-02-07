// nodejs basics
// import http from "http"
// import f from './f.js';

// // const f = require('./f')
// const server = http.createServer((req,res)=>{
// if(req.url==="/about"){
//     res.end(`random fuction call ${f()}`)
// }
// else if(req.url==="/contact"){
//     res.end("contact page")
// }
// else if(req.url==="/"){
//     res.end("Home page")
// }
// else{
//     res.end("page not found")
// }
// })

// server.listen(5000,()=>{
//     console.log("server is working")
// })

// express bsics

import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt"
mongoose.connect("mongodb://localhost:27017",{
    dbName:"backend",
}).then(()=>console.log("database connected")).catch((e)=>console.log(e))

const Userschema= new mongoose.Schema({
    name:String,
    email:String,
    password:String,
})

const users=mongoose.model("users",Userschema)

const app = express();
// const user =[];
// to get static file
app.use(express.static(path.join(path.resolve(),"public")))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());

const isauth= async(req,res,next)=>{
    const {token}=req.cookies;
    if(token){
        const decoded=jwt.verify(token,"wefgwfgu")
        req.user= await  users.findById(decoded._id)
        next()
    }else{

        res.redirect("/login")
    }
}
app.get("/login",(req,res)=>{
    res.render("login")
})

app.set("view engine","ejs")
app.get("/",isauth,(req,res)=>{
    // console.log(req.user)
    res.render("logout")
})
// {name:req.user.name}
// app.post('/login',async (req,res)=>{
//     const{name,email,password}=req.body;
//    let user = await users.findOne({email})
//    if(!user){
//     return res.redirect("/register")
//    }
//    user = await users.create({name,email,password})

//     const token = jwt.sign({_id:user._id},"wefgwfgu")
   
//     res.cookie("token",token,{
//         httpOnly:true,
//         expires:new Date(Date.now()+60*1000)
//     })
//     res.redirect("/")
// })

app.get("/register",(req,res)=>{
    res.render("register")
})


app.post("/login",async(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;
    console.log(email)
    // console.log(req.body)

    const user = await users.findOne({email});

    if(!user) return res.redirect("/register")
    const ismatch=await bcrypt.compare(password,user.password);
    
    // if(!req.body.password) return res.render("login")
    // if (!req.body.password) return res.redirect("login");
    if(!ismatch){
        return res.redirect("login");
    }

    const token = jwt.sign({_id:user._id},"wefgwfgu")
    
    
     res.cookie("token",token,{
         httpOnly:true,
         expires:new Date(Date.now()+60*1000)
     })
     res.redirect("/")
})


app.post("/register",async(req,res)=>{
    const{name,email,password}=req.body;

    const hpassed = await bcrypt.hash(password,10);

    let user = await users.findOne({email})
    if(user){
     return res.redirect("/login")
    }
    user = await users.create({name,email,password:hpassed})
 
     const token = jwt.sign({_id:user._id},"wefgwfgu")
    
     res.cookie("token",token,{
         httpOnly:true,
         expires:new Date(Date.now()+60*1000)
     })
     res.redirect("/login")
})
app.get('/logout',(req,res)=>{
    
    res.cookie("token",null,{
        httpOnly:true,
        expires:new Date(Date.now())
    })
    res.redirect("/")
})

// app.get("/add",async(req,res)=>{
//     await messages.create({name:"asutosh2",email:"sample2@gmail.com"})
//     res.send("nice")
    
// })
// app.post("/",async(req,res)=>{
// // we can destruct it to 
// const {name,email}=req.body
// await messages.create({name,email})
// res.redirect("/success")
// })
// app.get("/users",(req,res)=>{
// res.json({
//     user,
// })
// })
app.listen(5000,()=>{
    console.log("server is working")
})

// 2:15