import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({

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

        salary :{
            type : String,
            required: true
        }
})

const Employee = mongoose.model("employees",employeeSchema)

export default Employee;