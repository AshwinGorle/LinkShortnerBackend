
import Url from "../models/URL.js";
// const uuid = require('uuid')
import { v1 as uuid } from 'uuid';

async function handleGetAllUrl(req, res){
     const AllUrls = await Url.find({userId : req.user._id});
     res.send({allUrls : AllUrls});
}

async function handleShortUrl(req,res){
    const body = req.body;
    const redirectUrl = body.redirectUrl;
    const shortUrl = body.customLink == null ? uuid().slice(0,5) : body.customLink;
   
    console.log(redirectUrl);
    console.log(shortUrl);
    const URL = {
         shortURL : shortUrl,
         redirectURL : redirectUrl,
         clicks : 0,
         availableDate : body.availableDate,
         expiryDate : body.expiryDate,
         password : body.password,
         userId : req.user._id
    } 
    const result = await Url.create(URL);
    res.json(result);
}

async function handleGetRedirectUrl(req, res){
    const id = String(req.params.id);
    console.log(id);
    try{ 
    const URL = await Url.findOne({shortURL : id})
    console.log(URL);

    if(!URL){
        throw new Error('Network response was not ok');
    }
    
    if(new Date(Date.now()) < URL.availableDate ){
        res.render("availability", {availableDate : URL.availableDate, expiryDate : URL.expiryDate, expired : false})
    }

    if(new Date(Date.now()) > URL.expiryDate ){
        res.render("availability", {availableDate : URL.availableDate, expiryDate : URL.expiryDate, expired : true})
    }

    
    if(URL.password != null){
        console.log("password in req",req.headers['password']);
        console.log("password of URL",URL.password);
        if (req.headers['password'] === URL.password){
            console.log("redirectiong")
            res.redirect(URL.redirectURL);
        }else{
            res.render('password', {shortId : URL.shortURL});
        } 
    }
    await Url.findOneAndUpdate({shortURL : id}, {clicks : URL.clicks + 1});
    res.redirect(URL.redirectURL);

    }catch(err){
        console.log("error in fetching the redirect URL", err)
    }

}
async function handleDeleteUrl(req, res){
    const id = req.params.id;
    await Url.deleteOne({shortURL : id});
    res.json({msg : "deleted successfully"})
}

async function handleGetUrlData (req, res){
    try{
    const URL = await Url.findOne({shortURL : req.params.id})

    if(!URL){
        throw new Error('Network response was not ok');
    }

    res.json(URL);
    }catch(err){
        console.log(err)
    }
}

export {
    handleGetAllUrl,
    handleShortUrl,
    handleGetRedirectUrl,
    handleDeleteUrl,
    handleGetUrlData
};