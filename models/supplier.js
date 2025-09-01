import mongoose from "mongoose";

const supplierSchema= new mongoose.Schema({

        firstName : {
            type : String,
            required : true
        },
        lastName : {
            type : String,
            required : true
        },

        email : {
            type : String,
            required : true,
            unique : true
        },

        password:  { 
            type: String, 
            required: true 
        },

        phone :{
            type : String,
            default : " Not Given"
        },

        item :{
            type: String,
            required : false
        }
})

const Supplier = mongoose.model("supplier",supplierSchema)

export default Supplier;