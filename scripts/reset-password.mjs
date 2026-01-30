import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
    try {
        console.log('Resetting admin password...');

        // Hash "admin123"
        const hashedPassword = await bcrypt.hash('admin123', 12);

        // Update the user
        const updatedUser = await prisma.user.update({
            where: { username: 'admin' },
            data: { password: hashedPassword }
        });

        console.log('\n✅ Password reset successfully!');
        console.log('👤 Username:', updatedUser.username);
        console.log('🔑 New Password: admin123');

    } catch (error) {
        if (error.code === 'P2025') {
            console.error('❌ User "admin" not found! verifying user existence...');
            const users = await prisma.user.findMany();
            console.log('Current users in DB:', users.map(u => u.username));
        } else {
            console.error('❌ Error:', error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
