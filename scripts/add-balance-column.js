const mysql = require('mysql2/promise');
require('dotenv').config();

async function addBalanceColumn() {
    try {
        // Create a connection to the database
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        console.log('Connected to MySQL database.');

        // Check if balance column exists
        const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'fbdownhub_smm' 
      AND TABLE_NAME = 'User' 
      AND COLUMN_NAME = 'balance'
    `);

        if (columns.length > 0) {
            console.log('Balance column already exists in User table.');
        } else {
            // Add balance column to User table
            await connection.execute(`
        ALTER TABLE fbdownhub_smm.User 
        ADD COLUMN balance FLOAT DEFAULT 0 NOT NULL
      `);

            console.log('Successfully added balance column to User table.');
        }

        // Add total_deposit and total_spent columns if they don't exist
        const [depositColumn] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'fbdownhub_smm' 
      AND TABLE_NAME = 'User' 
      AND COLUMN_NAME = 'total_deposit'
    `);

        if (depositColumn.length === 0) {
            await connection.execute(`
        ALTER TABLE fbdownhub_smm.User 
        ADD COLUMN total_deposit FLOAT DEFAULT 0 NOT NULL
      `);

            console.log('Successfully added total_deposit column to User table.');
        }

        const [spentColumn] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'fbdownhub_smm' 
      AND TABLE_NAME = 'User' 
      AND COLUMN_NAME = 'total_spent'
    `);

        if (spentColumn.length === 0) {
            await connection.execute(`
        ALTER TABLE fbdownhub_smm.User 
        ADD COLUMN total_spent FLOAT DEFAULT 0 NOT NULL
      `);

            console.log('Successfully added total_spent column to User table.');
        }

        // Add transaction_type field to AddFund table if it doesn't exist
        const [transactionTypeColumn] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'fbdownhub_smm' 
      AND TABLE_NAME = 'AddFund' 
      AND COLUMN_NAME = 'transaction_type'
    `);

        if (transactionTypeColumn.length === 0) {
            await connection.execute(`
        ALTER TABLE fbdownhub_smm.AddFund 
        ADD COLUMN transaction_type ENUM('deposit', 'withdrawal', 'purchase', 'refund') DEFAULT 'deposit'
      `);

            console.log('Successfully added transaction_type column to AddFund table.');
        }

        // Add reference_id field to AddFund table if it doesn't exist
        const [referenceIdColumn] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'fbdownhub_smm' 
      AND TABLE_NAME = 'AddFund' 
      AND COLUMN_NAME = 'reference_id'
    `);

        if (referenceIdColumn.length === 0) {
            await connection.execute(`
        ALTER TABLE fbdownhub_smm.AddFund 
        ADD COLUMN reference_id VARCHAR(255)
      `);

            console.log('Successfully added reference_id column to AddFund table.');
        }

        // Update Prisma schema to match the database
        console.log('All database columns added successfully.');
        console.log('Please run "npx prisma db pull" and "npx prisma generate" to update your Prisma schema.');

        // Close the connection
        await connection.end();

        console.log('Database connection closed.');
    } catch (error) {
        console.error('Error updating database schema:', error);
        process.exit(1);
    }
}

// Run the function
addBalanceColumn(); 