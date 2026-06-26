const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const generateToken = (id, role, jti) => {
    const payload = { id, role };
    if (jti) payload.jti = jti;
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

async function testAPI() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const member = await User.findOne({ email: 'shivamgupta.lfc.dtu@gmail.com' });
    if (!member) return console.log('User not found');
    
    const token = generateToken(member._id, member.role, member.activeSessionToken);
    console.log('Generated token for', member.email);

    try {
        const response = await fetch('http://localhost:5001/api/users/programs', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        console.log('GET /api/users/programs status:', response.status);
        if (response.status !== 200) {
            console.log('Error data:', data);
        } else {
            console.log('Success data length:', data.data?.length);
            // console.log(JSON.stringify(data.data, null, 2));
        }
    } catch (e) {
        console.log('Fetch error:', e);
    }
    
    process.exit(0);
}

testAPI().catch(console.error);
