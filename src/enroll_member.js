const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Program = require('./models/Program');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function enroll() {
    await mongoose.connect(process.env.MONGODB_URI);
    const member = await User.findOne({ email: 'member@adyom.org' });
    const kalapath = await Program.findOne({ slug: 'kalapath-online' });
    const pratibimb = await Program.findOne({ slug: 'pratibimb-sadhana' });

    if (!member || !kalapath || !pratibimb) {
        console.log('Could not find member or programs');
        process.exit(1);
    }

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
    console.log('Member enrolled successfully in KalaPath and Pratibimb!');
    process.exit(0);
}
enroll().catch(console.error);
