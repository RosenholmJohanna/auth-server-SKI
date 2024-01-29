const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();
const bcrypt = require('bcrypt');

const router = express.Router();

const saltRounds = 10;

const plainPassword = 'password';
const adminPassword = 'admin2024';

const hashedPassword = bcrypt.hashSync(plainPassword, saltRounds);
const adminHashed = bcrypt.hashSync(adminPassword, saltRounds);

const secretKey = process.env.SECRET_ACCESS_TOKEN;
const hashedSecret = crypto.createHash('sha256').update(secretKey).digest('hex'); 


// användarens roll baserad på email
const userData = {
  'user@example.com': { hashedPassword: hashedPassword, role: 'user' },
  'admin@example.com': { hashedPassword: adminHashed, role: 'admin' },
};

const getUserData = (email) => {
  return userData[email];
};

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (isValidUser(email, password)) {
    const userRole = getUserRole(email);
    const accessToken = jwt.sign({email, role: userRole}, hashedSecret, { expiresIn: '1h'});
  
    if (userRole === 'admin') {
      res.json({ 
        accessToken, 
        message: 'Welcome Admin!'
       // SECRET_ACCESS_TOKEN,
       //hashedSecret,
       });
    } else {
      res.json({ 
        accessToken,
        message: 'Welcome User' });
    }
  } else {
    res.status(401).json({ error: 'Invalid login' });
  }
});

const isValidUser = (email, password) => {
  const userData = getUserData(email);

  if (userData) {
    return bcrypt.compareSync(password, userData.hashedPassword);
  }
  return false;
};

const getUserRole = (email) => {
  const userData = getUserData(email);
  return userData ? userData.role : null;
};


console.log('Hashed Password:', hashedPassword);
console.log('admin Password: ', adminHashed );

console.log('SECRET_ACCESS_TOKEN:', process.env.SECRET_ACCESS_TOKEN);
console.log('secretKey:', secretKey);
console.log('hashedSecret:', hashedSecret);


module.exports = router;







// const express = require('express');
// const jwt = require('jsonwebtoken');

// const router = express.Router();

// router.post('/login', (req, res) => {
//   const { email, password } = req.body;

//   if (isValidUser(email, password)) {
//     const token = jwt.sign({ email, role: getUserRole(email) }, 'secretKey', { expiresIn: '1h' });
//     res.json({ token });
//   } else {
//     res.status(401).json({ error: 'Invalid login' });
//   }
// });

// const isValidUser = (email, password) => {
//   return email === 'user@example.com' && password === 'password';
// };

// const getUserRole = (email) => {
//   return email === 'admin@example.com' ? 'admin' : 'user';
// };

// module.exports = router;
