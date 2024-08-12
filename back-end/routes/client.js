const express = require('express');
const { registerClient, loginClient, getClients, getClientById,updateClient,deleteClient } = require('../controllers/clientController');
const router = express.Router();
const auth = require('../middleware/auth')




// authentication and authorization mechanisms

// router.post('/login', loginClient);
router.post('/register', auth, registerClient);
router.get('/', auth, getClients);
router.get('/:id', auth, getClientById);
router.put('/:id', auth, updateClient);
router.delete('/:id', auth, deleteClient);
module.exports = router;
