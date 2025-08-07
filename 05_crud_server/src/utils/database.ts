import { databaseConnection } from '../database/connection';
import { User, CreateUserInput, UpdateUserInput, UserFilters } from '../models/User';

const db = databaseConnection.getDatabase();

export class UserRepository {
  // Create a new user
  create(userData: CreateUserInput): User {
    const stmt = db.prepare(`
      INSERT INTO users (name, email, age, status)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      userData.name,
      userData.email,
      userData.age || null,
      userData.status || 'active'
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  // Find user by ID
  findById(id: number): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id) as User | undefined;
    return user || null;
  }

  // Find all users with optional filters
  findAll(filters: UserFilters = {}): User[] {
    let query = 'SELECT * FROM users WHERE 1=1';
    const params: any[] = [];

    // Apply filters
    if (filters.name) {
      query += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }

    if (filters.email) {
      query += ' AND email LIKE ?';
      params.push(`%${filters.email}%`);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.age_min !== undefined) {
      query += ' AND age >= ?';
      params.push(filters.age_min);
    }

    if (filters.age_max !== undefined) {
      query += ' AND age <= ?';
      params.push(filters.age_max);
    }

    // Add ordering
    query += ' ORDER BY created_at DESC';

    // Add pagination
    if (filters.limit !== undefined) {
      query += ' LIMIT ?';
      params.push(filters.limit);

      if (filters.offset !== undefined) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }
    }

    const stmt = db.prepare(query);
    return stmt.all(...params) as User[];
  }

  // Update user
  update(id: number, userData: UpdateUserInput): User | null {
    const existingUser = this.findById(id);
    if (!existingUser) {
      return null;
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (userData.name !== undefined) {
      updates.push('name = ?');
      params.push(userData.name);
    }

    if (userData.email !== undefined) {
      updates.push('email = ?');
      params.push(userData.email);
    }

    if (userData.age !== undefined) {
      updates.push('age = ?');
      params.push(userData.age);
    }

    if (userData.status !== undefined) {
      updates.push('status = ?');
      params.push(userData.status);
    }

    if (updates.length === 0) {
      return existingUser;
    }

    params.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(query);
    stmt.run(...params);

    return this.findById(id);
  }

  // Delete user
  delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Count total users (for pagination)
  count(filters: UserFilters = {}): number {
    let query = 'SELECT COUNT(*) as count FROM users WHERE 1=1';
    const params: any[] = [];

    // Apply same filters as findAll
    if (filters.name) {
      query += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }

    if (filters.email) {
      query += ' AND email LIKE ?';
      params.push(`%${filters.email}%`);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.age_min !== undefined) {
      query += ' AND age >= ?';
      params.push(filters.age_min);
    }

    if (filters.age_max !== undefined) {
      query += ' AND age <= ?';
      params.push(filters.age_max);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...params) as { count: number };
    return result.count;
  }
}

export const userRepository = new UserRepository();
