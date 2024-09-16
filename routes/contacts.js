import express from 'express';

const router = express.Router();

// Get all contacts
router.get('/all', (req, res) => {
    res.send('All contacts');
  });
  
// Get a contact by id
router.get('/:id', (req, res) => {
    const id = req.params.id;
    res.send('Contact by id ' + id);
});
  
// Create a contact
router.post('/create', (req, res) => {
    res.send('create route');
});

// Update a contact
router.put('/update', (req, res) => {
    res.send('update route');
});

// Delete a contact
router.delete('/delete', (req, res) => {
    res.send('delete route');
});


export default router;
