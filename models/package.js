import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({

    packageId : {
            type : String,
            required : true,
            unique : true
        },

     packageName : {
            type : String,
            required : true
        },

        price : {
            type : String,
            required : true
        },

       details : {
            type : String,
            required : true
        },
})

const Packages = mongoose.model("package",packageSchema)

export default Packages;