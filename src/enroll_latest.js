const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Program = require('./models/Program');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function fixLatestUser() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Get the most recently created user
    const member = await User.findOne().sort({ createdAt: -1 });
    
    if (!member) {
        console.log('No users found in database');
        process.exit(1);
    }
    
    console.log(`Found newest user: ${member.email} (${member.name})`);

    const kalapath = await Program.findOne({ slug: 'kalapath-online' });
    const pratibimb = await Program.findOne({ slug: 'pratibimb-sadhana' });

    if (!kalapath || !pratibimb) {
        console.log('Could not find KalaPath or Pratibimb programs in DB');
        process.exit(1);
    }

    // Enroll them
    member.enrolledPrograms = [
        {
            program: kalapath._id,
            enrolledModules: [kalapath.modules[0]._id, kalapath.modules[1]._id],
            status: 'active',
            progress: 30
        },
        {
            program: pratibimb._id,
            enrolledModules: [pratibimb.modules[0]._id],
            status: 'active',
            progress: 10
        }
    ];

    await member.save();
    console.log(`Successfully enrolled ${member.email} in KalaPath and Pratibimb!`);
    process.exit(0);
}

fixLatestUser().catch(console.error);
