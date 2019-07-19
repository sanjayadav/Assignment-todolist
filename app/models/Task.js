const mongoose = require('mongoose');
const time = require('../libs/timeLib');
const Schema = mongoose.Schema;

let taskSchema = new Schema({

    taskId:{
        type:String,
        unique:true
    },
    title:{
        type:String,
        default:''
    },
    submitterFirstName:{
        type:String,
        default:''
    },
    submitterLastName:{
        type:String,
        default:''
    },
    created:{
        type:String,
        default:time.standardFormat()
    },
    email:{
        type:String,
        default:''
    }
});

module.exports = mongoose.model('Task',taskSchema);