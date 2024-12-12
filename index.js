import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "library",
    password: "rogut.elena",
    port: 5432
  });
  db.connect();
  
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: async (req, file, cb) => {
        const title = req.body.title;
        const description = req.body.description;
        const notes = req.body.notes;
        const author= req.body.author;
        cb(null, req.body.title + path.extname(file.originalname));
        try {
            await db.query("INSERT INTO books (title, description, notes, src, author) values($1, $2, $3, $4, $5);",
            [title, description, notes, path.extname(file.originalname), author])
        } catch(err){
            console.log(err);
        }
        //console.log(file);
        //console.log(Date.now());
        //console.log(path.extname(file.originalname))
    }

})

const upload = multer({storage: storage});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.json());



app.get("/", async (req, res) => {
    try{
       const result = await db.query("SELECT * FROM books ORDER BY id ASC;");
       //console.log(result.rows);
       const books = result.rows;
       res.render("index.ejs", {books});
    } catch (err) {
        console.log(err);
    }
    
});

app.get("/add", (req, res) => {
    const books = null;
    res.render("index.ejs", {books})
});

app.post('/upload', upload.single('image') , async (req, res) => {
    res.redirect("/");
    });

// app.get("/update", (req, res) => {
//     console.log(req.body)
// });

app.get("/edit/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    //console.log(req.body.id)
    try{
        const result = await db.query("SELECT * FROM books WHERE id = $1;", [id]);
        //console.log(result.rows);
        const book = result.rows[0];
        //console.log(book);
        res.render("update.ejs", {book});
     } catch (err) {
         console.log(err);
     }
   
});

app.post("/update/:id", async(req, res) => {
        const id = parseInt(req.params.id);
        const description = req.body.description;
        const notes = req.body.notes;
        const author= req.body.author;
       
       
        try {
            await db.query("UPDATE books SET description = $1, notes = $2, author = $3 WHERE id = $4; ",
            [description, notes, author, id]);
            res.redirect("/");
        } catch(err){
            console.log(err);
        }
 });

 app.get("/delete/:id", async (req, res) => {
    
    //console.log(parseInt(req.params.id));
    const id = parseInt(req.params.id);
    
        try {
            await db.query("DELETE FROM books WHERE id = $1; ",
            [id]);
            res.redirect("/");
        } catch(err){
            console.log(err);
        }
 });

 app.get("/book/:id", async (req, res) => {
    const id = parseInt(req.params.id)
    try{
        const result = await db.query("SELECT * FROM books WHERE id = $1;", [id]);
        //console.log(result.rows);
        const book = result.rows[0];
        res.render("book.ejs", {book});
     } catch (err) {
         console.log(err);
     }

 })

app.listen(port, () => {
    console.log(`The app is listening on port ${port}`)
});