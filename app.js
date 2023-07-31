const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const app = express();
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

// var Do=document.querySelectorAll(".do");

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret: 'tops Secret.',
    resave: false,
    saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/quizDB",{useNewUrlParser:true}).then(()=>{
    console.log("connection established")
})

// mongoose.connect("mongodb://127.0.0.1:27017/")

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    // quizdetails:quizSchema,
    // score:[String,String]
});

userSchema.plugin(passportLocalMongoose);

const quizSchema ={
    username:String,
    quizname:String,
    quest:String,
    options:[String,String,String,String],
    answer:String,
    description:String,
    score:Number,

}
// quizSchema.index({username:'text',quizname:'text'});
// quizSchema.createIndex({username:'text',quizname:'text'});
const scoreSchema ={
    othername:String,
    attendername:String,
    quizname:String,
    score:Number
}

const friendSchema={
    from:String,
    to:String,
    Status:String
}


const User = mongoose.model("User",userSchema);
const Quiz = mongoose.model("Quiz",quizSchema);
const Score = mongoose.model("Score",scoreSchema);
const Friend = mongoose.model("Friend",friendSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Quiz.index

Quiz.find()

app.get("/",function(req,res){
    res.render("Home.ejs");
})

app.get("/register",function(req,res){
    res.render("register.ejs");
})

app.get("/login",function(req,res){
    res.render("login.ejs");
})
app.get("/score", function(req, res){
    res.render("score.ejs")
})
app.post('/createdQuiz',function(req,res){
    res.render("login.ejs");
})
// app.post('/createdQuiz',function(req,res){
//     res.redirect('homepage.ejs');
// })

app.post("/register",function(req,res){
    User.register({username:req.body.username,name:req.body.name},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect('/register')
        }else{
            passport.authenticate("local")(req,res,function(){
                console.log("hi");
                res.redirect('/homepage')
            });
        }
       })
})

app.post("/login",function(req,res){
    // const Username = req.body.username;
    // const password = req.body.password;
    // const Name=req.body.name;
    const user = new User({
        name: req.body.name,
        username:req.body.username,
        password:req.body.password
    })
    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate('local')(req,res,function(){
                // User.findOne({name : req.body.name}).then(function(foundUser){
        
                //     if(foundUser){
                        
                //         if(foundUser.password === password){
                //             var quizname=[];
                            var quizname=[];
                            Quiz.find({username: req.body.name}).then(function(result){
                            
                                result.forEach(item =>{
                                    quizname.push(item.quizname);
                                    // console.log(item.quizname);
                                })
                                for(var j=0;j<=quizname.length+1;j++){
                                    for(var i=0;i<=j+1;i++){
                                        if(quizname[i]===quizname[i+1]){
                                            quizname.splice(i,1);
                                        }
                                    }
                                }
                                res.render("homepage.ejs",{
                                    Quizzz:quizname,
                                    Myname:req.user.name
                                });
                                console.log(req.user)
                            })
                           
                //         }
                //     }
                   
                // }).catch(function(err){
                //     console.log(err);
                // })
                // res.render('homepage.ejs')
            })
        }
    })
    
})
app.get('/logout', function(req, res){
    req.logOut(function(err){
        if(err){
            console.log(err);
        }else{
            
            res.redirect('/');
        }
    })
    
})

app.get('/homepage',function(req, res){
    if(req.isAuthenticated()){
        res.render("homepage.ejs",{
            Myname:req.user.name,
        });
    }else{
        res.redirect('/login');
    }
    
})
app.post('/createQuiz',function(req, res){
    res.render('createQuiz.ejs');
})
app.post('/homepage',function(req,res){
    const username =req.body.searched;
    var quizname =[];
    // console.log(req.user);
    Quiz.find({username:username}).then(function(result){
        result.forEach(item =>{
            quizname.push(item.quizname);
        })
        for(var j=0;j<=quizname.length+1;j++){
            for(var i=0;i<=j+1;i++){
                if(quizname[i]===quizname[i+1]){
                    quizname.splice(i,1);
                }
            }
        }
        if(quizname.length==0){
            text="Oops sorry, No such User or User haven't created any quiz"
        }
    res.render('Userquiz.ejs',{
        Userquiz: username,
        Quiznames:quizname,
        // Text: text,
    })});
})

// app.post('/Userquiz',function(req,res){
//     const username =req.body.searched;
//     var quizname =[];
//     // console.log(req.user);
//     Quiz.find({username:username}).then(function(result){
//         result.forEach(item =>{
//             quizname.push(item.quizname);
//         })
//         for(var j=0;j<=quizname.length+1;j++){
//             for(var i=0;i<=j+1;i++){
//                 if(quizname[i]===quizname[i+1]){
//                     quizname.splice(i,1);
//                 }
//             }
//         }
//         if(quizname.length==0){
//             text="Oops sorry, No such User or User haven't created any quiz"
//         }
    // res.render('homepage.ejs');
    // ,{
        // Userquiz: username,
        // Quiznames:quizname,
        // Text: text,
    // }
    
    // });
// })
app.post('/otherquiz',function(req,res){
    const searchbar = req.body.searchbar;
    const nameofquiz   = req.body.nameofquiz;
    Quiz.find({username:searchbar,quizname:nameofquiz}).then(function(result){
        // console.log(result);
        const questions =[];
        const options=[];
        const ans=[];
        var count=0;
        result.forEach(item =>{
            questions.push(item.quest);
            options.push(item.options);
            ans.push(item.answer);
        })
        
        // if(ans1===ans[0]){
        //     count++;
        // }else if(ans2===ans[1]){
        //     count++;
        // }else if(ans3===ans[2]){
        //     count++;
        // }else if(ans4===ans[3]){
        //     count++;
        // }else if(ans5===ans[4]){
        //     count++;
        // }
        // console.log(count);
        res.render('attendingQuiz.ejs',{
            QUEST1:questions[0],
            OPT11:options[0][0],
            OPT12:options[0][1],
            OPT13:options[0][2],
            OPT14:options[0][3],
            QUEST2:questions[1],
            OPT21:options[1][0],
            OPT22:options[1][1],
            OPT23:options[1][2],
            OPT24:options[1][3],
            QUEST3:questions[2],
            OPT31:options[2][0],
            OPT32:options[2][1],
            OPT33:options[2][2],
            OPT34:options[2][3],
            QUEST4:questions[3],
            OPT41:options[3][0],
            OPT42:options[3][1],
            OPT43:options[3][2],
            OPT44:options[3][3],
            QUEST5:questions[4],
            OPT51:options[4][0],
            OPT52:options[4][1],
            OPT53:options[4][2],
            OPT54:options[4][3],
        })}).catch(function(err) {
            console.error(err);
        })
})

app.get('/otherquiz',function(req,res){
    res.render('otherquiz.ejs');
})
app.get('/About',function(req,res){
    res.render('About.ejs');
})

app.post('/createQuiz', function(req, res){
    // res.render('createQuiz.ejs');
    const Quizname = req.body.quizname;
    var arr2=[];
    User.find({name:req.user.name}).then(function(result){
        
    
    // console.log(QuizName);
    const quiz1 = new Quiz({
        username:req.user.name,
        quizname:req.body.quizname,
        quest:req.body.q1,
        options:[req.body.opt1q1, req.body.opt2q1, req.body.opt3q1, req.body.opt4q1],
        answer:req.body.ans1,
    })
    const quiz2 = new Quiz({
        username:req.user.name,
        quizname:req.body.quizname,
        quest:req.body.q2,
        options:[req.body.opt1q2, req.body.opt2q2, req.body.opt3q2, req.body.opt4q2],
        answer:req.body.ans2,
        // details:result
    })
    const quiz3 = new Quiz({
        username:req.user.name,
        quizname:req.body.quizname,
        quest:req.body.q3,
        options:[req.body.opt1q3, req.body.opt2q3, req.body.opt3q3, req.body.opt4q3],
        answer:req.body.ans3,
        // details:result
    })
    const quiz4 = new Quiz({
        username:req.user.name,
        quizname:req.body.quizname,
        quest:req.body.q4,
        options:[req.body.opt1q4, req.body.opt2q4, req.body.opt3q4, req.body.opt4q4],
        answer:req.body.ans4,
        // details:result
    })
    const quiz5 = new Quiz({
        username:req.user.name,
        quizname:req.body.quizname,
        quest:req.body.q5,
        options:[req.body.opt1q5, req.body.opt2q5, req.body.opt3q5, req.body.opt4q5],
        answer:req.body.ans5,
        // details:result,
    })
    // quiz1.index({username:'text', quizname:'text'});
    
    quiz1.save();
    quiz2.save();
    quiz3.save();
    quiz4.save();
    console.log("hfhdhfjf")
    quiz5.save().then(function(){
        var arr=[];
        // Quiz.find({username:req.body.name}).then(function(quizz){
        //     quizz.forEach(item =>{
        //         // console.log("HI")
                
        //         if(arr.length===0){
        //             // console.log(arr.length)
        //                 arr.push(item.quizname);
        //                 // console.log(item.quizname);
        //         }else{
        //             arr.forEach(ton =>{
        //                 if(ton!=item.quizname){
        //                     arr.push(item.quizname);
        //                     // console.log(ton);
        //                     console.log(arr.length)
        //                 }
        //             })
        //         }
        //     })
        // })
        console.log("created")
        res.render('createdQuiz.ejs');
        
    })
}).catch(function(err){
    console.log(err)
})
})

app.post('/Userquiz',function(req,res){
    const NAME=req.body.searchbar;
    const QUIZNAME=req.body.QuizName;
    console.log(QUIZNAME);
    // const ans1=req.body.ANS1;
    // const ans2=req.body.ANS2;
    // const ans3=req.body.ANS3;
    // const ans4=req.body.ANS4;
    // const ans5=req.body.ANS5;
    //     console.log(ans1,ans2,ans3,ans4,ans5);
    Quiz.find({quizname:QUIZNAME}).then(function(result){
        // console.log(result);
        const questions =[];
        const options=[];
        const ans=[];
        var count=0;
        result.forEach(item =>{
            questions.push(item.quest);
            options.push(item.options);
            ans.push(item.answer);
        })
        
        // if(ans1===ans[0]){
        //     count++;
        // }else if(ans2===ans[1]){
        //     count++;
        // }else if(ans3===ans[2]){
        //     count++;
        // }else if(ans4===ans[3]){
        //     count++;
        // }else if(ans5===ans[4]){
        //     count++;
        // }
        // console.log(count);
        res.render('attendingQuiz.ejs',{
            QUEST1:questions[0],
            OPT11:options[0][0],
            OPT12:options[0][1],
            OPT13:options[0][2],
            OPT14:options[0][3],
            QUEST2:questions[1],
            OPT21:options[1][0],
            OPT22:options[1][1],
            OPT23:options[1][2],
            OPT24:options[1][3],
            QUEST3:questions[2],
            OPT31:options[2][0],
            OPT32:options[2][1],
            OPT33:options[2][2],
            OPT34:options[2][3],
            QUEST4:questions[3],
            OPT41:options[3][0],
            OPT42:options[3][1],
            OPT43:options[3][2],
            OPT44:options[3][3],
            QUEST5:questions[4],
            OPT51:options[4][0],
            OPT52:options[4][1],
            OPT53:options[4][2],
            OPT54:options[4][3],
        })
      
        // if(ans1===ans[0]){
        //     count++;
        // }else if(ans2===ans[1]){
        //     count++;
        // }else if(ans3===ans[2]){
        //     count++;
        // }else if(ans4===ans[3]){
        //     count++;
        // }else if(ans5===ans[4]){
        //     count++;
        // }
        // console.log(count);
        // res.render("/score.ejs")
    }).catch(function(err){
        console.log(err);
    })
})

app.post('/attendingQuiz', function(req,res){
    const ans1=req.body.ANS1;
    const ans2=req.body.ANS2;
    const ans3=req.body.ANS3;
    const ans4=req.body.ANS4;
    const ans5=req.body.ANS5;
    const attendername=req.body.attendername;
    var arr1=[];
    var count = 0;
    // console.log(req.user.name);
    Quiz.find({username:req.body.name,quizname:req.body.quizname}).then(function(result){
        result.forEach(item => {
            arr1.push(item.answer);
            console.log(item.answer);
            // console.log(item.answer);
        })
        if(ans1===arr1[0]){
            count++;
        }if(ans2===arr1[1]){
            count++;
        }if(ans3===arr1[2]){
            count++;
        }if(ans4===arr1[3]){
            count++;
        }if(ans5===arr1[4]){
            count++;
        }
        const scores = new Score({
            othername: req.body.name,
            attendername: req.body.attendername,
            quizname: req.body.quizname,
            score:count
        })
        scores.save();
        // console.log(count);
        // console.log(ans1,ans2,ans3,ans4,ans5);
        res.render('score.ejs',{
            SCORE:count
        });
    })
    // console.log(count);
   
    // ans.forEach(item =>{
    //     console.log(item);
    // })
    // Quiz.find({username:})
    
})


// app.get('/createdQuiz', function(req, res){
//     res.render('createdQuiz.ejs',);
// })
// alert("Quiz created successfully")

app.get('/confirmation', function(req, res){
   
    res.render('confirmation.ejs',)
})

app.get('/attemptedquiz',function(req, res){
    var author=[];
    var scores=[];
    var quiznames=[];
    // console.log(req.user);
    Score.find({attendername: req.user.name}).then(function(score){
        score.forEach(item =>{
            author.push(item.othername);
            scores.push(item.score);
            quiznames.push(item.quizname);
            console.log(item.score,item.othername,item.quizname);
        })
        res.render('attemptedquiz.ejs',{
            AUTHOR: author,
            QUIZNAMES: quiznames,
            SCORES:scores
        })
    })
  
})

app.post('/score',function(req,res){
    res.render('login.ejs')
})

app.get('/friends',function(req,res){
    var names=[];
    User.find().then(function(result){
        result.forEach(item =>{
            names.push(item.name);
        })
        res.render('friends.ejs',{
            NAMES:names,
        });
    })
    
})

app.post('/friends', function(req,res){
    const friendname=req.body.friendname;
    const status=req.body.status;
    console.log(req.user.name);
    const request = new Friend ({
        from:req.user.name,
        to:friendname,
        Status:status,
    })
    request.save();
    res.render('login.ejs')
})
app.get('/requests',function(req,res){
    var reqnames=[];
    Friend.find({to:req.user.name,Status:"request"}).then(function(result){
        result.forEach(item =>{
            reqnames.push(item.from);
            console.log(item.from)
        })
        res.render('requests.ejs',{
            REQUESTS:reqnames,
        })
    })
    
})

app.post('/requests', function(req, res){
    Friend.find({from:req.body.accept}).then(function(result){
        result.forEach(item =>{
            console.log(item)
            if(req.body.type==='accept'){
            item.Status="Accepted";
            item.save()
            console.log("hmmmm")
            }else{
                item.Status='';
            }
        })
        res.render('login.ejs')
    })
})

app.get('/your-friends',function(req,res){
    var friendnames=[];
    Friend.find({to:req.user.name,Status:"Accepted"}).then(function(result){
        // console.log(result)
        result.forEach(item =>{
            
            friendnames.push(item.from);
            // console.log("IM here")
            // console.log(item.from);
        })
        res.render('your-friends.ejs',{
            Friends: friendnames,
        })
    }).catch(function(err) {
        console.error(err);
    })
    
})




app.listen(3000,()=>{
    console.log("listening on port 3000");
})
