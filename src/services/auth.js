class AuthService {
    login(token) {
        localStorage.setItem('token', token);
    }

    logout() {
        localStorage.removeItem('token');
    }

    getToken() {
        return localStorage.getItem('token');
    }

    isAuthenticated() {
        return !!this.getToken();
    }
}

export default new AuthService();