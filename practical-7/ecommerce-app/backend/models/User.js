/**
 * In-memory User store.
 * Data resets when the server restarts — no database required for this practical.
 */

let users = [];
let nextId = 1;

const User = {
  /**
   * Find a user by email address (case-insensitive).
   */
  findByEmail(email) {
    return users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  },

  /**
   * Find a user by their ID.
   */
  findById(id) {
    return users.find((u) => u.id === id);
  },

  /**
   * Create and store a new user.
   * @param {Object} data - { name, email, hashedPassword }
   * @returns {Object} The created user (without password)
   */
  create({ name, email, hashedPassword }) {
    const newUser = {
      id: nextId++,
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    const { password, ...safeUser } = newUser;
    return safeUser;
  },

  /**
   * Get all users (without passwords) — for admin/debug purposes.
   */
  getAll() {
    return users.map(({ password, ...u }) => u);
  },
};

module.exports = User;
