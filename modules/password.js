const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/pms', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
var conn = mongoose.Collection;
var passSchema = new mongoose.Schema({
    password_cate: {
        type: String,
        required: true,
        
    },
 project_name: {
        type: String,
        required: true,
        
    },
    password_Details: {
        type: String,
        required: true,
       },
    
    date: {
        type: Date,
        default:Date.now
    }

});

var passDetModel = mongoose.model('password_details', passSchema);
module.exports = passDetModel;