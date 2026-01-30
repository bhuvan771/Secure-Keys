import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'readline';

// Log to verify env is loaded
console.log('DATABASE_URL loaded:', !!process.env.DATABASE_URL);

// Initialize Prisma - it will read DATABASE_URL from environment
const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
    console.log('\n🔐 Secer Keys - Admin User Setup\n');
    console.log('This script will create the first admin user.\n');

    try {
        // Check if admin already exists
        const existingAdmin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (existingAdmin) {
            console.log('⚠️  An admin user already exists!');
            console.log(`   Username: ${existingAdmin.username}`);
            console.log(`   Email: ${existingAdmin.email}\n`);

            const confirm = await question('Do you want to create another admin? (yes/no): ');
            if (confirm.toLowerCase() !== 'yes') {
                console.log('\nSetup cancelled.');
                rl.close();
                await prisma.$disconnect();
                process.exit(0);
            }
        }

        // Get user inputs
        const username = await question('\nEnter username: ');
        const email = await question('Enter email: ');
        const password = await question('Enter password: ');
        const confirmPassword = await question('Confirm password: ');

        // Validate inputs
        if (!username || !email || !password) {
            console.error('\n❌ All fields are required!');
            rl.close();
            await prisma.$disconnect();
            process.exit(1);
        }

        if (password !== confirmPassword) {
            console.error('\n❌ Passwords do not match!');
            rl.close();
            await prisma.$disconnect();
            process.exit(1);
        }

        if (password.length < 8) {
            console.error('\n❌ Password must be at least 8 characters long!');
            rl.close();
            await prisma.$disconnect();
            process.exit(1);
        }

        // Check if username or email already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            console.error('\n❌ Username or email already exists!');
            rl.close();
            await prisma.$disconnect();
            process.exit(1);
        }

        // Hash password
        console.log('\n🔒 Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create admin user
        console.log('👤 Creating admin user...');
        const admin = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role: 'ADMIN'
            }
        });

        console.log('\n✅ Admin user created successfully!\n');
        console.log('📧 Email:', admin.email);
        console.log('👤 Username:', admin.username);
        console.log('🔑 Role:', admin.role);
        console.log('\n🎉 You can now login with these credentials!\n');

    } catch (error) {
        console.error('\n❌ Error creating admin user:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

createAdmin();
