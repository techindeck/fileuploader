/**
 * Author: Amit Das (@spducumentad)
 * This is a TypeScript server code that handles file uploads to Amazon S3 using Express, Multer, and
 * Multer-S3.
 * @param {any} file - The `file` parameter represents the file object that you want to check the file
 * type for. It should contain the following properties:
 * @param {any} cb - The `cb` parameter is a callback function that is passed as an argument to the
 * `checkFileType` function. It is used to handle the result of the file type check. The `cb` function
 * takes two arguments: an error object (or null if there is no error) and a boolean
 * @returns The code is not returning anything. It is setting up the server, defining routes, and
 * configuring middleware, but there are no return statements in the code.
 */

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { DeleteObjectCommand, DeleteObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';

dotenv.config();

/* The line `const port = process.env.APP_PORT || 5000;` is setting the port number for the server to
listen on. It is using the value of the `APP_PORT` environment variable, but if that variable is not
set, it will default to port 5000. */
const port = Number(process.env.APP_PORT) || 5000;

/* This code is creating a new instance of the `S3Client` class from the `@aws-sdk/client-s3` package.
It is used to interact with the Amazon S3 (Simple Storage Service) API. */
const s3 = new S3Client({
    credentials: {
        accessKeyId: String(process.env.AWS_ACCESS_KEY_ID),
        secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY)
    },
    region: process.env.AWS_REGION
});

/* `const app = express();` is creating a new instance of the Express application. This instance will
be used to define the routes and middleware for the server. */
const app = express();

/* `app.use(cors())` enables Cross-Origin Resource Sharing (CORS) for the Express application. CORS is
a mechanism that allows resources (e.g., fonts, JavaScript, etc.) on a web page to be requested from
another domain outside the domain from which the resource originated. It is used to prevent web
pages from making requests to a different domain, which can be a security risk. */
app.use(cors());
/* `app.use(express.json());` is setting up middleware in the Express application to parse JSON data in
the request body. */
app.use(express.json());
/* `app.use(express.urlencoded({ extended: true }));` is setting up middleware in the Express
application to parse URL-encoded data in the request body. */
app.use(express.urlencoded({ extended: true }));

/* `app.listen(port, () => {
    console.log(`Server is running on port `);
});` is starting the server and making it listen on the specified port. When the server starts
successfully, it will log a message to the console indicating that the server is running and on
which port it is listening. */
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

/* `app.get('/', (req, res) => {
    res.send('Express + TypeScript Server');
});` is defining a route for the GET request to the root URL ("/") of the server. When a client
makes a GET request to the root URL, the server will respond with the string "Express + TypeScript
Server". */
app.get('/', (req, res) => {
    res.send('Express + TypeScript Server');
});

// setup file upload route
/* This code is defining a route for the POST request to the "/upload" URL of the server. When a client
makes a POST request to this URL, the server will execute the callback function specified in the
code. */
app.post('/upload', (req, res) => {
    upload(req, res, (error: unknown) => {
        if (error) {
            res.json({ error: error });
        } else {
            // If File not found
            if (req.file === undefined) {
                res.json({ error: 'No File Selected' });
            } else {
                // If Success

                /* `res.json()` is a method in Express that sends a JSON response to the client. In
                this case, it is sending a JSON object with two properties: `response` and
                `fileUrl`. */
                res.json({
                    response: 'Image Uploaded Successfully!',
                    fileUrl: `${process.env.AWS_BUCKET_PATH}/${req.file.key}` // if file.key not work then send back the key as a response and use it in the frontend
                });
            }
        }
    });
});

// setup file delete route
/* This code is defining a route for the DELETE request to the "/delete" URL of the server. When a
// client makes a DELETE request to this URL, the server will execute the callback function specified
// in the code. */
app.delete('/delete', (req, res) => {
    const { key } = req.body;
    const params = {
        Bucket: String(process.env.AWS_BUCKET_NAME),
        Key: key
    };

    s3.send(new DeleteObjectCommand(params))
        .then((ress: DeleteObjectCommandOutput) => {
            console.log(ress);

            res.json({ message: 'File deleted successfully' });
        })
        .catch((error) => {
            console.error('Error deleting file:', error);
            res.status(500).json({ error: 'Failed to delete file from S3' });
        });
});

// multer config
/* The `const upload` variable is creating a multer middleware instance with specific configurations.
Multer is a middleware for handling file uploads in Express. */
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: String(process.env.AWS_BUCKET_NAME),
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, `saskengallery/${getRandomFileName(file)}`);
        }
    }),
    limits: { fileSize: 11000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('image');

// Middleware
/**
 * The function checks if a file has an allowed image extension and mimetype, and returns an error if
 * it doesn't.
 * @param {any} file - The `file` parameter represents the file object that you want to check the file
 * type for. It should contain the following properties:
 * @param {any} cb - The `cb` parameter is a callback function that is passed as an argument to the
 * `checkFileType` function. It is used to handle the result of the file type check.
 * @returns either `null, true` if the file is of an allowed image type, or an error message `'Error:
 * Images Only!'` if the file is not of an allowed image type.
 */
function checkFileType(file: any, cb: any) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

/**
 * The function generates a random file name by combining two random strings and the original file
 * extension.
 * @param file - The `file` parameter is an object of type `Express.Multer.File`. It represents a file
 * that has been uploaded through a form submission. It contains information about the uploaded file,
 * such as its original name, size, and MIME type.
 * @returns a randomly generated file name. The file name consists of two random strings generated
 * using `Math.random().toString(36).substring(2, 15)`, concatenated with the file extension obtained
 * from `path.extname(file.originalname)`.
 */
function getRandomFileName(file: Express.Multer.File) {
    return `${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + path.extname(file.originalname)}`;
}
