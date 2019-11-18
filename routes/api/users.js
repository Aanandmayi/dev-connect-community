const express = require('express');
const gravatar=require('gravatar');
const bcrypt=require('bcryptjs')
const router = express.Router();

//load user model
const User=require('../../models/User');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Users Works' }));

// @route   GET api/users/register
// @desc    Register users
// @access  Public

router.post('/register',(req, res)=>{
    User.findOne({ email:req.body.email })
    .then(user=>{
        if(user){
            return status(400).json({email:'email already exists'})
        }else{
            const avatar=gravatar.url(req.body.email,{
                s:'200',  //size
                r:'pg',  //rating
                d:'mm'  //default
            })
            const newUser= new User({
                name: req.body.name,
                email: req.body.email,
                avatar: avatar,
                password: req.body.password
            });
            
            bcrypt.genSalt(10,(err, salt)=>{
                bcrypt.hash(newUser.password,  salt, (err, hash)=>{
                    if(err) throw err;
                    newUser.password=hash;
                    newUser.save()
                    .then(user=> res.json(user))
                    .catch(err=> console.log(err));
                    
                })
            })
        }
    })

});

// @route   GET api/users/login
// @desc    Login existing user using JWT web tokens
// @access  Public


router.get('/login',(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;

    // find a user with email
    User.findOne({email})
    .then(user=>{
        //if email not registerd
        if(!user){
            return res.status(404).json({email:'Email not registerd'});
        }

        //ckeck password
        bcrypt.compare(password,user.password)
        .then(isMached=>{
            if(isMached){
                // on success
                res.json({msg:'success'})
            }else{
                // password not matched
                res.status(400).json({password:'Not correct'});
            }
        })
    });
});


module.exports = router;