var express = require('express');
var router = express.Router();
var userModule = require('../modules/user');
var passCatModule = require('../modules/category');
var passDetModule = require('../modules/password');
var bcrytpjs = require('bcryptjs');
var jwt = require('jsonwebtoken');

const { check, validationResult } = require('express-validator');

var getPassCat = passCatModule.find({});
var getAllPass = passDetModule.find({});

//local storage import
if (typeof localStorage === "undefined" || localStorage === null) {

    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

/* GET home page. */



//Login In System
router.get('/login', function (req, res, next) {
    var loggedInUser = localStorage.getItem('loginUser');
    if (loggedInUser) {
        res.redirect('./')
    } else {
        res.render('login', { title: 'Password Management System', msg: '' });
    }
});

router.post('/login', function (req, res, next) {

    var username = req.body.username;
    var password = req.body.password;

    var checkuser = userModule.findOne({ username: username });

    checkuser.exec((err, data) => {
        if (err)  throw err;

        var getPassword = data.password;
        var getUserID = data._id;

        if (bcrytpjs.compareSync(password, getPassword)) {

            var token = jwt.sign({ userID: getUserID }, 'loginToken');
            localStorage.setItem('userToken', token);
            localStorage.setItem('loginUser', username);

            res.redirect('/');

        } else {

            res.render('login', { title: 'Password Management System', msg: 'Username and Password Invalid!' });

        }

    });

   
});
router.get('/', checkLoginUser, function (req, res, next) {

    var loggedInUser = localStorage.getItem('loginUser');
    res.render('dashboard', { title: 'User Dashboard System', msg: '', loggedInUser: loggedInUser });
});

//Registraion in System
router.get('/signup', function (req, res, next) {
    var loggedInUser = localStorage.getItem('loginUser');
    if (loggedInUser) {
        res.redirect('./')
    } else {
        res.render('signup', { title: 'Password Management System', msg: '' });
    }
});

function checkEmail(req, res, next){
    var email = req.body.email;
    var checkitem = userModule.findOne({ email: email });

    checkitem.exec((err, data)=>{
        if (err) throw err;
        if (data) {

            return res.render('signup', { title: 'Password Management System', msg: 'Email Already Exist' })
        }
        next();
    });


};
function checkUsername(req, res, next) {
    var username = req.body.username;
    var checkitem = userModule.findOne({ username: username });

    checkitem.exec((err, data) => {
        if (err) throw err;
        if (data) {

            return res.render('signup', { title: 'Password Management System', msg: 'username Already Exist' })
        }
        next();
    });


};
router.post('/signup', checkUsername, checkEmail,function (req, res, next) {

    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var cpassword = req.body.cpassword;

    if (password != cpassword) {
        res.render('signup', { title: 'Password Management System', msg: 'Password not match with confirm-Password!' });
    
    } else {

        var Enc_pass = bcrytpjs.hashSync(password,10);
        var userDetails = new userModule({

            username: username,
            email: email,
            password: Enc_pass,
        });

        userDetails.save((err, doc) => {
            if (err) throw err;
            res.render('signup', { title: 'Password Management System', msg: 'User Register Successfully' });
        });
    }


   
});

// Display Category List
router.get('/passCategory', checkLoginUser, function (req, res, next) {
    var loggedInUser = localStorage.getItem('loginUser');

    getPassCat.exec(function (err, data) {
        if (err) throw err;

        res.render('password_category', { title: 'Password Category List', loggedInUser: loggedInUser,records:data });
    });

    
});

//Delete Category Record
router.get('/passCategory/delete/:id', checkLoginUser, function (req, res, next) {
    var loggedInUser = localStorage.getItem('loginUser');

    var passCatId = req.params.id;


    
    var passCatDelete = passCatModule.findByIdAndDelete(passCatId);

    passCatDelete.exec(function (err) {
        if (err) throw err;
        res.redirect('/passCategory')
   

    getPassCat.exec(function (err, data) {
        if (err) throw err;

        res.render('password_category', { title: 'Password Category List', loggedInUser: loggedInUser, records: data });
    });

    });

});
//update Category
router.get('/passCategory/edit/:id', checkLoginUser, function (req, res, next) {
    var loggedInUser = localStorage.getItem('loginUser');

    var passCatId = req.params.id;

    var passCatUpdate = passCatModule.findById(passCatId);

    

    passCatUpdate.exec(function (err,data) {
        if (err) throw err;
        console.log(data);
        res.render('edit_pass_Category', { title: 'Edit Password Category', loggedInUser: loggedInUser, errors: '', success: '', records:data, id:passCatId});
    });

});
router.post('/passCategory/edit/', checkLoginUser, function (req, res, next) {
    var loggedInUser = localStorage.getItem('loginUser');

    var passCatId = req.body.id;
    var passCatname = req.body.passwordcategory;


    var UpdateCategory = passCatModule.findByIdAndUpdate(passCatId, { password_category: passCatname});

    UpdateCategory.exec(function (err, doc) {
        if (err) throw err;
        res.redirect('/passCategory');
    });

});

//Add Password Category 
router.get('/addNewCategory', checkLoginUser, function (req, res, next) {
    var loggedInUser = localStorage.getItem('loginUser');
    res.render('addCategory', { title: 'Add new Password Category', loggedInUser: loggedInUser, errors: '', success:'' });
});

router.post('/addNewCategory', checkLoginUser, [ check('passwordcategory', 'Enter Password Category Name').isLength({ min: 1 })],function (req, res, next) {

        var loggedInUser = localStorage.getItem('loginUser');

        const errors = validationResult(req);
        if (!errors.isEmpty()) {

            

            res.render('addCategory', { title: 'Add new Password Category', loggedInUser: loggedInUser, errors: errors.mapped(), success:''});
        } else
        {

            var passCat = req.body.passwordcategory;
            var passCatDetails = new passCatModule({

                password_category: passCat
            });
            passCatDetails.save(function (err, data) {
                if (err) throw err;
                res.render('addCategory', { title: 'Add new Password Category', loggedInUser: loggedInUser, errors: '',success:'Password Category inserted successfully' });

            });
           

        }
       
});

//Add New Password 
router.get('/addNewPassword', checkLoginUser, function (req, res, next) {
    var loggedInUser = localStorage.getItem('loginUser');

    getPassCat.exec(function (err, data) {
        if (err) throw err;

        res.render('addPassword', { title: 'Add New Password Details', loggedInUser: loggedInUser, records: data,errors:'', success:'' });
    });

    
});

router.post('/addNewPassword', [check('pass_details', 'Enter Password Details').isLength({ min: 1 }),
], checkLoginUser, function (req, res, next) {
    var loggedInUser = localStorage.getItem('loginUser');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        getPassCat.exec(function (err, data) {
            if (err) throw err;


            res.render('addPassword', { title: 'Add new Password Details', loggedInUser: loggedInUser, errors: errors.mapped(), records: data, success: '' });
        
        });
    } else {
        var passcat = req.body.pass_category;
        var projname = req.body.project_name;
        var passdet = req.body.pass_details;

        var passDetails = new passDetModule({

            password_cate: passcat,
            password_Details: passdet,
            project_name: projname

        });

        getPassCat.exec(function (err, data) {
            if (err) throw err;

            passDetails.save(function (err, doc) {
                if (err) throw err;
                res.render('addPassword', { title: 'Add new Password Details', loggedInUser: loggedInUser, records: data, errors: '', success: 'Password Details Added successfully' });

            });




        });
    }

});

//Get All Password
router.get('/viewAllPassword', checkLoginUser, function (req, res, next) {
    var loggedInUser = localStorage.getItem('loginUser');

    getAllPass.exec(function (err, data) {
        if (err) throw err;
        res.render('viewPassword', { title: 'view All Password Details', loggedInUser: loggedInUser, records: data, msg: '', successmsg:'' });


    });
   
});
//Delete Password 
router.get('/UpdateDetails/delete/:id', checkLoginUser, function (req, res, next) {
    var loggedInUser = localStorage.getItem('loginUser');

    var passCatId = req.params.id;



    var passDetDelete = passDetModule.findByIdAndDelete(passCatId);

    passDetDelete.exec(function (err) {
        if (err) throw err;
        res.redirect('/viewAllPassword')


        getAllPass.exec(function (err, data) {
            if (err) throw err;

            res.render('viewPassword', { title: 'view All Password Details', loggedInUser: loggedInUser, records: data, msg: 'password Details Deleted successfully', successmsg:'' });
        });

    });
});


//update Password

router.get('/UpdateDetails', checkLoginUser, function (req, res, next) {

    res.redirect('/viewAllPassword');

});
router.get('/UpdateDetails/edit/:id', checkLoginUser, function (req, res, next) {
    var loggedInUser = localStorage.getItem('loginUser');

    var passCatId = req.params.id;



    var passDetUpdate = passDetModule.findById(passCatId);

    passDetUpdate.exec(function (err, data) {
        if (err) throw err;
        getPassCat.exec(function (err, doc) {
            if (err) throw err;
        res.render('edit_Password', { title: 'Edit Password Details', loggedInUser: loggedInUser, errors: '', success: '', records: doc, record:data ,id: passCatId });
        });
    });

});
router.post('/UpdateDetails/edit/', checkLoginUser, function (req, res, next) {
    var loggedInUser = localStorage.getItem('loginUser');

    var passCatId = req.body.id;
    var passcat = req.body.pass_category;
    var projname = req.body.project_name;
    var passdet = req.body.pass_details;


    var UpdateCategory = passDetModule.findByIdAndUpdate(passCatId, {
        
        password_cate: passcat,
        password_Details: passdet,
        project_name: projname
    });

    UpdateCategory.exec(function (err, doc) {
        if (err) throw err;
        var passDetUpdate = passDetModule.findById(passCatId);

        passDetUpdate.exec(function (err, data) {
            if (err) throw err;

            res.redirect('/UpdateDetails');
       // res.render('viewPassword', { title: 'view All Password Details', loggedInUser: loggedInUser, records: data, msg: '', successmsg: 'Password Details Updated Successfully..' });
        });
    });

});




//LogOut System
router.get('/logout', function (req, res, next) {
    localStorage.removeItem('userToken');
    localStorage.removeItem('loginUser');
    res.redirect('/login');
});

function checkLoginUser(req, res, next) {

    var userToken = localStorage.getItem('userToken');
    try {
        var decoded = jwt.verify(userToken, 'loginToken');
    } catch (err) {
        res.redirect('/login');
    }
    next();
}
module.exports = router;
