import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const VIEW_ROOT = path.join(process.cwd(), "views");
const ROOT = path.join(process.cwd(), "public");
const app = express()
const port = process.env.PORT || 3344
let result = {}

// Cretae folder
if (!fs.existsSync('./public/file')) fs.mkdirSync('./public/file')

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
} 


app.all('/file/:oke', async (req, res, next) => {
var already = result.hasOwnProperty(req.params.oke)
if (!already) return next()
 var nais = result[req.params.oke]
res.setHeader("Content-Disposition", `filename="${nais.originalname}"`)
next()
})
app.set('json spaces', 2)
app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.static(ROOT));
app.set("view engine", "ejs");
app.use(express.urlencoded({
    extended: false
}))
app.use(cookieParser())
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

const storage = multer.diskStorage({
    destination: 'public/file',
    filename: (req, file, cb) => {
        cb(null, makeid(10) +
            path.extname(file.originalname))
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: Infinity // 50 MB
    }
})

app.get('/', (req, res) => {
    res.status(200).render('index')
})

app.post('/backend/upload.php', upload.single('file'), (req, res) => {
    if (!req.file.path) return res.status(400).json({
        status: false,
        message: "No file uploaded"
    })
    result[req.file.filename] = req.file
    res.status(200).render('result', {
        status: true,
        result: {
            originalname: req.file.originalname,
            encoding: req.file.encoding,
            mimetype: req.file.mimetype,
            filesize: formatBytes(req.file.size),
            url: "/file/" + req.file.filename
        }
    })
}, (error, req, res, next) => {
    res.status(400).json({
        error: error.message
    })
})


// Handling 404
app.use(function (req, res, next) {
    res.status(404).send()
})

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})
