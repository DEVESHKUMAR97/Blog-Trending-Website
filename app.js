var bodyParser = require("body-parser"),
methodOverride = require("method-override"),
mongoose       = require("mongoose"),
express        = require("express"),
app            = express(),
expressSanitizer= require("express-sanitizer");

// APP CONFIGURATION
mongoose.connect("mongodb://localhost/restful_blog_app", { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);// not by colt, for use of function findByIdAndRemove and findByIdAndUpdate
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());//must be after parser code
app.use(methodOverride("_method"));

// MONGOOSE/MODEL CONFIGURATION
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body:  String,
  created: {type:Date, default:Date.now}
});
var Blog = mongoose.model("Blog",blogSchema);

// Blog.create({
//   title:"test blog",
//   image:"https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
//   body:"to test"
// });


// RESTFUL ROUTES

// root route that redirect to /blogs
app.get("/",function(req,res){
  res.redirect("/blogs");
});

// index route: to show all blogs
app.get("/blogs",function(req,res){
  // to retrieve all blogs from database and send it to index for rendering
  Blog.find({},function(err,blogs){
    if(err){
      console.log(err);
    }
    else{
      res.render("index",{blogs:blogs});
    }
  })
});

// new route : shows a form to create new blog
app.get("/blogs/new",function(req,res){
  res.render("new");
});

// create route : add new dog to the db and redirect to home
app.post("/blogs",function(req,res){
  // create blog
  // console.log(req.body);
  req.body.blog.body = req.sanitize(req.body.blog.body);
  // console.log(req.body);
  Blog.create(req.body.blog,function(err,newBlog){
    if(err){
      res.redirect("/blogs/new");
    }
    else{
      // redirect to index
      res.redirect("/blogs");
    }
  });
});

// show route:  show a particular blog
app.get("/blogs/:id",function(req,res){
   Blog.findById(req.params.id,function(err,foundBlog){
     if(err){
       res.redirect("/blogs");
     }
     else{
       res.render("show",{blog:foundBlog});
     }
   });
});

// EDIT ROUTE : SHOWS A FORM TO EDIT A PARTICULAR Blog
app.get("/blogs/:id/edit",function(req,res){
  Blog.findById(req.params.id,function(err,foundBlog){
    if(err){
      res.redirect("/blogs");
    }
    else{
      res.render("edit",{blog:foundBlog});
    }
  });
});

// Update route : to update a blog
app.put("/blogs/:id",function(req,res){
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id,req.body.blog, function(err,updatedBlog){
    if(err){
      res.redirect("/blogs");
    }else{
      res.redirect("/blogs/"+req.params.id);
    }
  });
});

// delete route:  delete a particular blog
app.delete("/blogs/:id",function(req,res){
  // destroy blog
  Blog.findByIdAndRemove(req.params.id,function(err){
    if(err){
      res.redirect("/blogs");
    }
    else{
      res.redirect("/blogs");
    }
  });
});

app.listen(3000,function(){
  console.log("SERVER IS RUNNING");
});
