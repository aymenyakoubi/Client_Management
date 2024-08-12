const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

exports.registerAdmin = async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      let admin = await Admin.findOne({ email });
      if (admin) {
        return res.status(400).json({ msg: 'Admin already exists' });
      }
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      admin = new Admin({
        name,
        email,
        password: hashedPassword, // Store hashed password
      });
  
      await admin.save();
  
      const payload = {
        admin: {
          id: admin.id,
        },
      };
  
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };

// Login Admin
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(400).json({ message: 'Admin not found' });
      }
  
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const payload = {
        admin: {
          id: admin.id,
        },
      };
  
      jwt.sign(
        payload,
        process.env.JWT_SECRET, // This should be defined in your .env file
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
