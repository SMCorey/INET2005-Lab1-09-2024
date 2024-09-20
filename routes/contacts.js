import express from 'express';
import multer from 'multer';

const router = express.Router();

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
router.get('/all', (req, res) => {
    res.send('All contacts');
});
  
// Get a contact by id
router.get('/:id', (req, res) => {
    const id = req.params.id;
    res.send('Contact by id ' + id);
});
  
// Create a contact (with multer)
router.post('/create',upload.single('image'), (req, res) => {
    const filename = req.file? req.file.filename : '';
    const {first_name, last_name, email, phone} = req.body

    console.log("Uploaded file :" + filename);
    console.log(`My contact's name: ${first_name} ${last_name}`);

    res.send('create route');
});

// Update a contact by ID (with Multer)
router.put('/update:id', upload.single('image'), (req, res) => {
    const id = req.params.id;
    res.send('update route');
});

// Delete a contact
router.delete('/delete:id', (req, res) => {
    res.send('delete route');
});


export default router;
