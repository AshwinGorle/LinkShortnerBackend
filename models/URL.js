import mongoose from "mongoose";
const URLSchema = mongoose.Schema({
    shortURL : {
        type : String,
        require : true
    },
    redirectURL : {
        type : String,
        require : true
    },
    clicks : {
        type : Number,
    },
    availableDate : {
        type : Date,
    },
    ExpiryDate : {
        type : Date,
    },
    password : {
        type : String,
    },
    customLink : {
        type : Boolean
    },
    QRCode : {
        type : Boolean
    },
    userId : {
        type : String
    }
})

const Url = mongoose.model('Url', URLSchema);

export default Url;