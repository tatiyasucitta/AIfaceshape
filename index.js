import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import User from "./models/user.js";
import Post from "./models/post.js";
import cookieParser from "cookie-parser";
import {format} from "date-fns"
import path from "path"
import job from "./models/job.js";
import savedpost from "./models/savedPost.js"
import savedjob from "./models/savedJobs.js"
import follower from "./models/follow.js";
import db from "./config/database.js";
import savedJobs from "./models/savedJobs.js";

const app = express();
const port = 3000;
const storage = multer.diskStorage({
  destination:(req, file , cb)=>{
    cb(null , 'public/postImages')
  },
  filename:(req ,file,cb)=>{
   
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
})
const upload = multer({storage: storage})
app.use(cookieParser());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const chekCookie = (req, res, next) => {
  try {
    const result = req.cookies["userId"];
    if (!result) {
      res.cookies.userId = result;
    }
    
  } catch (error) {}

  next();
};

app.get("/",async (req, res) => {
  try {
    const userId = req.cookies['userId']
    if(!userId){
      res.redirect("/login")
    }
    const result = await User.findOne({
      where:{
        UserId : userId
      }
    })
    const post = await db.query(`SELECT PostId , UserName , Content , MediaType, Image,Timestamp , profile FROM post p JOIN user u ON u.UserId = p.UserId WHERE p.postId NOT IN (SELECT postId FROM savedpost WHERE userId = ${userId} ) `)
   
    const recommendation = await db.query(`SELECT * FROM user  WHERE UserId != ${userId} AND UserId NOT IN (SELECT followeeId FROM follows WHERE followerId = ${userId})`)
   
    res.render("home.ejs" , {profile: result , data : post[0]  , recommendation: recommendation[0]} );

  } catch (error) {
    console.log(error)
  }
});
app.get("/home-job" , async(req, res)=>{
  try {
    const userId = req.cookies['userId']
    if(!userId){
      res.redirect("/login")
    }
    const result = await User.findOne({
      where:{
        UserId : userId
      }
    })
    const job = await db.query(`SELECT * FROM job j  WHERE j.jobId NOT IN (SELECT jobId FROM savedjob WHERE userId = ${userId}  ) `)
   
    const recommendation = await db.query(`SELECT * FROM user  WHERE UserId != ${userId} AND UserId NOT IN (SELECT followeeId FROM follows WHERE followerId = ${userId})`)
    res.render("homeJobPage.ejs" , {profile: result , data : job[0]  , recommendation: recommendation[0]} );

    
  } catch (error) {
    
  }
})
app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.get("/register", (req, res) => {
  res.render("register.ejs");
});
app.get("/activity", chekCookie, async (req, res) => {
 
  try {
    const userId = req.cookies["userId"];
    if (!userId) {
      res.render("login.ejs");
    }
    const result = await db.query("SELECT * FROM savedpost sj JOIN user u ON u.UserId = sj.userId JOIN post p ON p.PostId=sj.postId  ");
   
    res.render("activityPage.ejs", { data: result[0] });
  } catch (error) {
    console.log(error);
  }
});

app.get("/profile-page", async (req, res) => {
  try {
    const userId = req.cookies["userId"];
    if (!userId) {
      res.redirect('/');
    }
    const result = await User.findOne({
      where: {
        userId: userId,
      },
    });
    const post = await Post.findAll({
      where :{
        UserId : userId
      }
    })
    const following  = await db.query(`SELECT COUNT( f.followerId) as following FROM follows f JOIN user u ON u.UserId = f.followerId  WHERE f.followerId = ${userId} `)
    const follower = await db.query(`SELECT COUNT(followeeId) as follower FROM follows f 
JOIN user u ON u.UserId = f.followeeId  WHERE f.followeeId = ${userId}`)
   
    res.render("profilePage.ejs", { data: result  , post : post , following: following[0][0] , follower: follower[0][0]} );
  } catch (error) {
    console.log(error);
  }
});
app.get("/profile-job-page" , async(req ,res) =>{
  try {
    const userId = req.cookies["userId"];
    if (!userId) {
      res.redirect("/login");
    }
    const result = await User.findOne({
      where: {
        userId: userId,
      },
    });
    const jobs = await job.findAll({
      where :{
        UserId : userId
      }
    })
    const following  = await db.query(`SELECT COUNT( f.followerId) as following FROM follows f JOIN user u ON u.UserId = f.followerId  WHERE f.followerId = ${userId} `)
    const follower = await db.query(`SELECT COUNT(followeeId) as follower FROM follows f 
JOIN user u ON u.UserId = f.followeeId  WHERE f.followeeId = ${userId}`)
 
    res.render("profilePageJob.ejs", { data: result  , jobs: jobs , following: following[0][0] , follower: follower[0][0]});

  } catch (error) {
    console.log(error)
  }
})
app.get("/post-job", (req, res) => {

  res.render("postjob.ejs");
});
app.get("/explore", (req, res) => {
  res.render("explore.ejs");
});
app.get("/activity-job", async (req, res) => {
  try {
    const userId = req.cookies["userId"];
    if (!userId) {
      res.redirect("/login");
    }
    const result = await db.query(`SELECT * FROM savedjob sj JOIN user u ON u.UserId = sj.userId JOIN job j ON j.jobId=sj.jobId WHERE sj.userId = ${userId}`);
    
    res.render("activityPageJob.ejs", { data: result[0] });
  } catch (error) {
    console.log(error) ;
  }
});
app.post("/follow/:id" , async (req , res )=>{
  try {
    const userId = req.cookies['userId']
    if(!userId) {
      return res.status(400).json({message : "login first"})
    }
    const isFollow = await follower.findOne({
      where:{
        followerId : userId,
        followeeId : req.params.id
      }
    })
    
    if(isFollow){
      return res.status(400).json({message:"already follow"})
    }
    await follower.create({
      followerId : userId,
      followeeId : req.params.id
    })
    return res.status(200).json({
      message : "followed"
    })
    res.redirect('/')
  } catch (error) {
    console.log(error)
  }
} )
app.get("/activity-job/:id" ,async (req, res )=>{
  try {
  
    const result = await job.findOne({
      where :{
        jobId :req.params.id
      }
    })
    res.json(result)
  } catch (error) {
    console.log(error)
  }
})
app.patch("/activity-job/:id" , async (req, res)=>{
  try {
    const userId = req.cookies['userId']
    if(!userId){
      return res.status(400).json({message : "user Id not found"})
    }

 
    await savedJobs.destroy({
      where:{
        userId: userId,
        jobId : req.params.id
      }
    })

    return res.status(200).json({message: "unsaved"})
  } catch (error) {
    console.log(error)
  }
})
app.post("/upload-post" , upload.single("image") ,async (req , res) =>{
  try {
    const userId = req.cookies['userId']
   
    const formattedDate = format(Date.now(), "yyyy-MM-dd HH:mm:ss");
    await Post.create({
      UserId : userId,
      Content : req.body.content,
      Timestamp :formattedDate,
      MediaType : req.file.mimetype,
      Image : req.file.path.slice(6,req.file.path.length)

    })
   
    res.redirect("/activity")
  } catch (error) {
    console.log(error)
  }
})
app.post("/login", async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password must not empty" });
    }
    const result = await User.findOne({
      where: {
        UserEmail: email,
      },
    });
    if (!result) {
      return res.status(400).json({ message: "User Not Found" });
    }
    if (!result.password == password) {
      return res.status(400).json({ message: "User Not Found" });
    }
    res.cookie("userId", result.UserId);
    res.redirect("/");
    // return res.status(400).json(result.UserId);
  } catch (error) {
    console.log(error);
  }
});
app.post("/register", async (req, res) => {
  try {
    const { UserName, UserEmail, UserPassword } = req.body;
    console.log(UserName, UserEmail, UserPassword);
    if (!UserName || !UserEmail || !UserPassword) {
      return res
        .status(400)
        .json({ message: "email and password must not empty" });
    }
    const result = await User.create(req.body);

    // return res.status(201).json({ message: "User Created" });
    res.render("login.ejs");
  } catch (error) {
    console.log(error);
  }
});

app.post("/upload-job",upload.single('logo'), async (req, res) => {
 
  try {
    const {
      title,
      company,
      fee,
      location,
      duration_unit,
      duration_amount,
      description,
      requirements,
    } = req.body;
    console.log(title,
      company,
      fee,
      location,
      duration_unit,
      duration_amount,
      description,
      requirements)
    if (
      !title ||
      !company ||
      !fee ||
      !location ||
      !duration_unit ||
      !duration_amount ||
      !description ||
      !requirements
    ) {
      return;
    }
  
    const userId = req.cookies["userId"];
   
    await job.create({
      jobTitle: title,
      UserId: userId,
      company: company,
      fee: fee,
      jobLocation: location,
      durationUnit: duration_unit,
      durationAmount: duration_amount,
      jobDescription: description,
      jobRequirements: requirements,
      companyProfile : req.file.path.slice(6,req.file.path.length)  
    });
    res.redirect('/')
    
  } catch (error) {
    console.log(error);
  }
});
app.post("/edit-profile", upload.single('profile'),  async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      location,
      gender,
      bio,
      age,
      bust,
      height,
      waist,
      weight,
      hips,
    } = req.body;
    console.log(req.body);
    if (
      !first_name ||
      !last_name ||
      !location ||
      !gender ||
      !bio ||
      !age ||
      !bust ||
      !height ||
      !waist ||
      !weight ||
      !hips
    ) {
      return;
    }
    
    const userId = req.cookies["userId"];
    let path ;
    const result = await User.findOne({
      where: {
        UserId: userId,
      },
    });
    if(!req.file){
      path = result.profile
    }else{
      path = req.file.path.slice(6,req.file.path.length)
    }
    
    console.log(first_name + last_name  , location , bio , bust , waist, age , height , weight , gender , hips , path)
    result.UserName = first_name + last_name;
    result.UserAddress = location;
    result.AboutModel = bio;
    result.ModelBust = bust;
    result.ModelWaist = waist;
    result.UserDOB = age;
    result.UserHeight = height;
    result.UserWeight = weight;
    result.UserGender = gender;
    result.ModelHips = hips;
    result.profile = path
    // console.log(result)
    await result.save();
    res.redirect("/profile-page");
  } catch (error) {
    console.log(error);
  }
});
app.post("/saved-post/:id" , async (req, res) =>{
  try {
    const userId = req.cookies['userId']
    if(!userId){
      res.redirect('/login')
    }
    const isExist = await savedpost.findOne({
      where:{
        userId : userId,
      postId : req.params.id
      }
    })
    if(isExist){
      res.redirect("/")
    }
    await savedpost.create({
      userId : userId,
      postId : req.params.id
    })
    res.status(200).json({message:"saved post created"})
  } catch (error) {
    console.log(error)
  }
})
app.post("/save-face-shape" , async( req ,res) =>{
  try {
    console.log(req.body)
    const {faceShape} = req.body
    if(!faceShape){
      return res.status(400).json({message: "face shape must not be empty"})
    }

    const userId = req.cookies['userId']
    if(!userId){
      return res.status(400).json({
        message : "login first"
      })
    }
    const result = await  User.findOne({
      where :{
        UserId : userId
      }
    })
    if(!result){
      return res.status(400).json({message:"user not found"})
    }

    result.face_shape = faceShape

    await result.save();

    return res.status(200).json({message:"face shape saved"})
  } catch (error) {
    console.log(error)
  }
})
app.post("/saved-job/:id" , async (req , res )=>{
  try {
    const userId = req.cookies['userId']
    if(!userId){
      res.redirect('/login')
    }
    const isExist = await savedjob.findOne({
      where:{
        userId : userId,
        jobId : req.params.id
      }
    })
    if(isExist){
      res.redirect("/home-job")
    }
    await savedjob.create({
      userId : userId,
      jobId : req.params.id
    })
    res.status(200).json({message:"saved post created"})
  } catch (error) {
    console.log(error)
  }
})





app.post("/userpost", async (req, res) => {
  try {
    const result = await Post.findAll();
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
});
app.post("/post/:id", async (req, res) => {
  try {
    const result = await Post.findOne({
      where: {
        PostId: req.params.id,
      },
    });
    if (!result) {
      return res.status(400).json({ message: "post not found" });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
});

app.post("/post", async (req, res) => {
  try {
    const { UserId, Content, MediaType, Timestamp, Image } = req.body;
    console.log(UserId, Content, MediaType, Timestamp, Image);
    await Post.create(req.body);
    return res.status(201).json({ message: "post created" });
  } catch (error) {
    console.log(error);
  }
});
app.put("/post/:id", async (req, res) => {
  try {
    const result = await Post.findOne({
      where: {
        PostID: req.params.id,
      },
    });
    if (!result) {
      return res.status(400).json({ message: "post not found" });
    }
    result.Content = req.body.Content;
    result.MediaType = req.body.MediaType;
    result.Image = req.body.Image;

    await result.save();
  } catch (error) {
    console.log(error);
  }
});
app.delete("/post/:id", async (req, res) => {
  try {
    const result = await Post.destroy({
      where: {
        UserId: req.params.id,
      },
    });
    return res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.log(error);
  }
});
app.listen(port, () => {
  console.log(`Listen on port: ${port}.`);
});
