import Database from 'better-sqlite3';
import path from 'path';

class DatabaseConnection {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(process.cwd(), 'database.sqlite');
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  private initializeTables(): void {
    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        age INTEGER,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.exec(createUsersTable);

    // Create trigger to update updated_at timestamp
    const updateTrigger = `
      CREATE TRIGGER IF NOT EXISTS update_users_updated_at
      AFTER UPDATE ON users
      FOR EACH ROW
      BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `;

    this.db.exec(updateTrigger);
  }

  public getDatabase(): Database.Database {
    return this.db;
  }

  public close(): void {
    this.db.close();
  }
}

// Export singleton instance
const databaseConnection = new DatabaseConnection();

export { databaseConnection };
export default databaseConnection;
