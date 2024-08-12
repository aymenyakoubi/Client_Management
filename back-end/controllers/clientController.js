const Client = require('../models/Client');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Use the created directory
  },
  filename: function (req, file, cb) {
    const fileName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
    cb(null, fileName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
}).single('image');

// Register Client
exports.registerClient = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: 'Error uploading image', error: err.message });
    }

    console.log('Uploaded file:', req.file);

    const newClient = new Client({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      image: req.file ? req.file.filename : null, // Store only the filename
    });

    newClient.save()
      .then(client => res.json(client))
      .catch(err => {
        console.error('Database error:', err);
        res.status(400).json({ error: err.message });
      });
  });
};


// Get All Clients
exports.getClients = (req, res) => {
  Client.find()
    .then(clients => res.json(clients))
    .catch(err => res.status(400).json({ error: err.message }));
};

// Get Client by ID
exports.getClientById = (req, res) => {
  Client.findById(req.params.id)
    .then(client => {
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      res.json(client);
    })
    .catch(err => res.status(400).json({ error: err.message }));
};

// Update Client
exports.updateClient = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: 'Error uploading image', error: err.message });
    }

    const updatedData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      // Store only the filename, not the full path
      image: req.file ? req.file.filename : req.body.image, // Update image if provided
    };

    Client.findByIdAndUpdate(req.params.id, updatedData, { new: true })
      .then(client => {
        if (!client) {
          return res.status(404).json({ message: 'Client not found' });
        }
        res.json(client);
      })
      .catch(err => res.status(400).json({ error: err.message }));
  });
};


// Delete Client
exports.deleteClient = (req, res) => {
  Client.findByIdAndDelete(req.params.id)
    .then(client => {
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      res.json({ message: 'Client deleted successfully' });
    })
    .catch(err => res.status(400).json({ error: err.message }));
};
