const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Program = require('./models/Program');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function debug() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Check member user
    const member = await User.findOne({ email: 'member@adyom.org' }).populate('enrolledPrograms.program');
    if (!member) {
        console.log('❌ member@adyom.org NOT FOUND in database!');
        process.exit(1);
    }

    console.log('👤 Member found:', member.name, '|', member.email);
    console.log('📚 Enrolled Programs count:', member.enrolledPrograms?.length || 0);
    console.log('');

    if (member.enrolledPrograms?.length > 0) {
        member.enrolledPrograms.forEach((ep, i) => {
            console.log(`--- Enrollment ${i + 1} ---`);
            console.log('program ref:', ep.program?._id || ep.program, '(type:', typeof ep.program, ')');
            console.log('program title:', ep.program?.title);
            console.log('program category:', ep.program?.category);
            console.log('program programType:', ep.program?.programType);
            console.log('status:', ep.status);
            console.log('progress:', ep.progress);
            console.log('attendance count:', ep.attendance?.length);
            console.log('');
        });
    } else {
        console.log('⚠️  No enrolled programs found for this user!');
    }

    // 2. Check all programs
    const allPrograms = await Program.find({}).select('title slug category programType status');
    console.log('\n📋 All Programs in DB:');
    allPrograms.forEach(p => {
        console.log(`  - ${p.title} | slug: ${p.slug} | category: ${p.category} | programType: ${p.programType} | status: ${p.status}`);
    });

    // 3. Simulate getMyPrograms API response
    console.log('\n🔌 Simulated API response (user.enrolledPrograms):');
    console.log(JSON.stringify(member.enrolledPrograms.map(ep => ({
        _id: ep._id,
        status: ep.status,
        progress: ep.progress,
        programId: ep.program?._id,
        programTitle: ep.program?.title,
        programSlug: ep.program?.slug,
        programCategory: ep.program?.category,
        programType: ep.program?.programType,
        enrolledModulesCount: ep.enrolledModules?.length,
        attendanceCount: ep.attendance?.length,
    })), null, 2));

    process.exit(0);
}

debug().catch(e => { console.error(e); process.exit(1); });
