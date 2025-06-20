const mysql = require('mysql2/promise');
require('dotenv').config();

async function addCurrencyField() {
  try {
    // Create a connection to the database
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    console.log('Connected to MySQL database.');

    // Check if currency column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'fbdownhub_smm' 
      AND TABLE_NAME = 'AddFund' 
      AND COLUMN_NAME = 'currency'
    `);

    if (columns.length > 0) {
      console.log('Currency column already exists in AddFund table.');
    } else {
      // Add currency column to AddFund table
      await connection.execute(`
        ALTER TABLE fbdownhub_smm.AddFund 
        ADD COLUMN currency VARCHAR(3) DEFAULT 'BDT'
      `);

      console.log('Successfully added currency column to AddFund table.');
    }

    // Update existing records to have BDT currency (since most transactions are in BDT)
    const [updateResult] = await connection.execute(`
      UPDATE fbdownhub_smm.AddFund 
      SET currency = 'BDT' 
      WHERE currency IS NULL OR currency = ''
    `);

    console.log(`Updated ${updateResult.affectedRows} existing records with BDT currency.`);

    // Update admin-added funds to USD (if they exist)
    const [adminUpdateResult] = await connection.execute(`
      UPDATE fbdownhub_smm.AddFund 
      SET currency = 'USD' 
      WHERE method = 'admin' AND payment_method = 'admin'
    `);

    console.log(`Updated ${adminUpdateResult.affectedRows} admin-added records with USD currency.`);

    // Close the connection
    await connection.end();

    console.log('Database connection closed.');
    console.log('Currency field migration completed successfully.');
    console.log('Please run "npx prisma db pull" and "npx prisma generate" to update your Prisma schema.');
  } catch (error) {
    console.error('Error updating database schema:', error);
    process.exit(1);
  }
}

// Run the function
addCurrencyField();
