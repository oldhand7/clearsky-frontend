export const isAuthenticated = (): boolean => {
    // Replace this with your actual authentication logic
    return Boolean(localStorage.getItem('token'));
  };
  