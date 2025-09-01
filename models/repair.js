import mongoose from "mongoose";

const repairSchema = new mongoose.Schema({

        deviceName : {
            type : String,
            required : true
        },

         serialNo : {
            type : String,
            required : true
        },

        progress : {
            type : String,
            required : true
        },

        notes : {
            type : String,
        },

        estimatedDate : {
            type : String,
            required : true
        },


        
})

const Repair = mongoose.model("repair",repairSchema)

export default Repair;