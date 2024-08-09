// src/api/auth.js

const API_URL = 'https://frontend-aid-25b7d93d6106.herokuapp.com'; // Update with your backend URL

export const logout = async (token) => {
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to logout');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};
