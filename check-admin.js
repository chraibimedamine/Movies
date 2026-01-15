import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const driver = neo4j.driver(
    process.env.NEO4J_URI || 'neo4j://127.0.0.1:7687',
    neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'moviesmovies'
    )
);

async function checkAdmin() {
    const session = driver.session();
    try {
        const result = await session.run(
            'MATCH (u:User {email: $email}) RETURN u',
            { email: 'admin@example.com' }
        );
        
        if (result.records.length > 0) {
            const user = result.records[0].get('u').properties;
            console.log('✅ Admin user exists!');
            console.log('   Username:', user.username);
            console.log('   Email:', user.email);
            console.log('   Role:', user.role);
            console.log('   Password hash exists:', !!user.password);
        } else {
            console.log('❌ Admin user NOT found in database');
            console.log('   Run: node server/seed/movies.js');
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await session.close();
        await driver.close();
    }
}

checkAdmin();
