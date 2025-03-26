import { createConnection } from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create DB connection
 */
const connection = await createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

/**
 * Check if a table exists already in the database
 */
const checkTableExistence = async (tableName) => {
    try {            
        const query = `SHOW TABLES LIKE '${tableName}'`;
        const [rows] = await connection.execute(query);
        return rows.length > 0;
    } catch (error) {
        console.error('Error checking table existence:', error);
    }
};

async function migrate() {
    try {
        const emergenciesTableExists = await checkTableExistence('emergencies');

        if(!emergenciesTableExists) {
            
            const createTableQuery = `
            CREATE TABLE IF NOT EXISTS emergencies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_reporter VARCHAR(255) NOT NULL,
                provider_name VARCHAR(255) NOT NULL,
                severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
                location TEXT NOT NULL,
                details TEXT NOT NULL,
                status ENUM('active', 'resolved', 'cancelled') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;

            await connection.execute(createTableQuery);
            console.log("Table 'emergencies' has been created successfully!");

        } else {
            console.log("Table 'emergencies' already exists.");
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
      }
}

migrate().catch(console.error);