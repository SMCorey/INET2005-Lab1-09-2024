import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { existsSync, unlink } from 'node:fs';

const router = express.Router();

//PRISMA Setup
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

//Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/'); // save uploaded files in `public/images` folder
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.').pop(); // get file extension
        const uniqueFilename = Date.now() + '-' + Math.round(Math.random() * 1000) + '.' + ext; // generate unique filename - current timestamp + random number between 0 and 1000.
        cb(null, uniqueFilename);
    }
});
const upload = multer({ storage: storage });


/// ROUTES ////

// Get all contacts
router.get('/all', async (req, res) => {
    const contacts = await prisma.contact.findMany();
    res.json(contacts);
});
  
// Get a contact by id
router.get('/get/:id', async (req, res) => {
    const id = req.params.id;

    // validate if ID is a number
    if (isNaN(id) ){
        res.status(400).json({message: "Invalid ID"});
        return;
    }
    const contact = await prisma.contact.findUnique({
        where: {
            id: parseInt(id),
        }
    })
    contact ? res.json(contact): res.status(404).json({message: "contact not found"});
});
  
// Create a contact (with multer)
router.post('/create',upload.single('image'), async (req, res) => {
    const filename = req.file? req.file.filename : null;
    const {firstName, lastName,title, email, phone} = req.body

    // verify required fields have value
    if(!firstName || !lastName || !email || !phone){
        return res.status(400).json({message: "Required fields must have a value."});
    }

    const contact = await prisma.contact.create({
        data: {
            firstName: firstName,
            lastName: lastName,
            title: title,
            email: email,
            phone: phone,
            filename: filename
        },
    });

    res.json(contact);
});

// Update a contact by ID (with Multer)
router.put('/update/:id', upload.single('image'), async (req, res) => {
    const filename = req.file? req.file.filename : null;
    const id = req.params.id;

    // validate if ID is a number
    if (isNaN(id) ){
        res.status(400).json({message: "Invalid ID"});
        return;
    }

    // get previously store contact info
    let contact = await prisma.contact.findUnique({
        where: {
            id: parseInt(id),
        }
    })

   // old file deletion
    if (filename && contact.filename != '') { 
        fileDel(contact.filename)
    }
    
    const {firstName, lastName,title, email, phone} = req.body;

    // capture relevant inputs
    contact = await prisma.contact.update({
        where: {
            id: parseInt(id)
        },
        data: {
            firstName: firstName || contact.firstName ,
            lastName: lastName || contact.lastName,
            title: title || contact.title,
            email: email || contact.email,
            phone: phone || contact.phone,
            filename: filename || contact.filename
        },
    });

    contact ? res.json(contact): res.status(404).json({message: "contact not found"});
});

// Delete a contact
router.delete('/delete/:id', async (req, res) => {

    const id = req.params.id;
    // validate if ID is a number
    if (isNaN(id) ){
        res.status(400).json({message: "Invalid ID"});
        return;
    }
    
    let deleteContact = await prisma.contact.findUnique({
        where: {
            id: parseInt(id),
        }
    })
    // deleteContact? 
    // if (deleteContact.filename && deleteContact.filename != ''){
    //     fileDel(deleteContact.filename)
    // }

    deleteContact = await prisma.contact.delete({
        where: {
            id: parseInt(id),
        }
    })

    res.json('Contact deleted');
});


function fileDel(filename){
    // old file deletion   // code pulled and modified from https://nodejs.org/api/fs.html#fs_file_system and https://stackoverflow.com/questions/17699599/node-js-check-if-file-exists

   const toDelete = `public/images/${filename}`
   if (existsSync(toDelete)) {
    unlink(`${toDelete}`,
        (err) => {
            if (err) res.status(400).json("Could not delete image. " + err);
        })
   }
}


export default router;
