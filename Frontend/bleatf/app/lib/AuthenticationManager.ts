// AuthenticationManager - Singleton pattern for authentication
class AuthenticationManager {
  private static instance: AuthenticationManager;
  private loggedInUser: { userId: number; role: 'parent' | 'admin' | 'child'; email: string; parentId?: number } | null = null;

  private constructor() {}

  static getInstance(): AuthenticationManager {
    if (!AuthenticationManager.instance) {
      AuthenticationManager.instance = new AuthenticationManager();
    }
    return AuthenticationManager.instance;
  }

  authenticate(email: string, password: string): boolean {
    // Hardcoded validation for demo
    if (email === 'parent@example.com' && password === 'password') {
      this.loggedInUser = { userId: 1, role: 'parent', email };
      return true;
    } else if (email === 'admin@example.com' && password === 'password') {
      this.loggedInUser = { userId: 100, role: 'admin', email };
      return true;
    }
    return false;
  }

  setLoggedInUser(user: { userId: number; role: 'parent' | 'admin' | 'child'; email: string; parentId?: number }): void {
    this.loggedInUser = user;
  }

  getLoggedInUser() {
    return this.loggedInUser;
  }

  logout(): void {
    this.loggedInUser = null;
  }

  isAuthenticated(): boolean {
    return this.loggedInUser !== null;
  }
}

export default AuthenticationManager.getInstance();
