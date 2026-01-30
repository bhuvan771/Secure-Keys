// Quick script to insert admin user directly
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        console.log('Creating admin user...');

        const hashedPassword = await bcrypt.hash('admin123', 12);

        const admin = await prisma.user.create({
            data: {
                username: 'admin',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'ADMIN'
            }
        });

        console.log('✅ Admin user created successfully!');
        console.log('📧 Email:', admin.email);
        console.log('👤 Username:', admin.username);
        console.log('🔑 Password: admin123');
        console.log('🔑 Role:', admin.role);
        console.log('\n🎉 You can now login with these credentials!');

    } catch (error) {
        if (error.code === 'P2002') {
            console.log('⚠️  Admin user already exists!');
        } else {
            console.error('Error:', error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
