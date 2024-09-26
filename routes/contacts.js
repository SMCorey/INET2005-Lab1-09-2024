import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';


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

        // TODO: delete file // create method for deletion
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

    const id = req.params.id;
    // validate if ID is a number
    if (isNaN(id) ){
        res.status(400).json({message: "Invalid ID"});
        return;
    }

    let contact = await prisma.contact.findUnique({
        where: {
            id: parseInt(id),
        }
    })
    // let filename = contact.filename;
    // console.log(filename)
    // if (req.file){
    //     filename = req.file.filename;
    // }
//    const filename = req.file.filename && contact.filename;
    
    const {firstName, lastName,title, email, phone} = req.body;

    // capture inputs
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
            filename: req.filename || contact.filename
        },
    });
       // make blank filename variable.
    // if file is uploaded: get file name to save in db. delete old image file. Set the file name to new file name.
    // if image file NOT uploaded: when updating record with prisma, set the filename to old file name.
    
    // update record in the db.

    contact ? res.json(contact): res.status(404).json({message: "contact not found"});
});

// Delete a contact
router.delete('/delete/:id', (req, res) => {

    const id = req.params.id;
    // validate if ID is a number
    if (isNaN(id) ){
        res.status(400).json({message: "Invalid ID"});
        return;
    }

    // delete image
    // delete record from DB.

    res.send('delete route');
});


    


export default router;
