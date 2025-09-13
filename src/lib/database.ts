import initSqlJs from 'sql.js';
import { Transaction } from '@/types/transaction';

type SQLiteDB = initSqlJs.Database;

let db: SQLiteDB | null = null;

const DB_STORAGE_KEY = 'sqlite_db';

// Function to save the database to localStorage
const saveDatabase = () => {
  if (db) {
    const data = db.export();
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(Array.from(data)));
    console.log('Database saved to localStorage.');
  }
};

// Main function to initialize the database
export const initDB = async (): Promise<void> => {
  if (db) return;

  try {
    const SQL = await initSqlJs({
      locateFile: file => `/${file}`
    });

    const savedDb = localStorage.getItem(DB_STORAGE_KEY);

    if (savedDb) {
      console.log('Loading database from localStorage...');
      const dbArray = new Uint8Array(JSON.parse(savedDb));
      db = new SQL.Database(dbArray);
    } else {
      console.log('Creating a new database...');
      db = new SQL.Database();
      createTables(db);
    }

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Function to create necessary tables
const createTables = (dbInstance: SQLiteDB) => {
  const createTransactionTableQuery = `
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      notes TEXT,
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `;
  dbInstance.run(createTransactionTableQuery);
  console.log('Transactions table created successfully.');
  saveDatabase(); // Save after table creation
};

// Function to execute a query
export const executeQuery = (query: string, params?: (string | number)[]) => {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  const results = db.exec(query, params);
  saveDatabase(); // Save after every modification
  return results;
};

// Function to execute a select query and return typed results
export const selectQuery = <T>(query: string, params?: (string | number)[]): T[] => {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }

  const stmt = db.prepare(query, params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();

  return results;
};
