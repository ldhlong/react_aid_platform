import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

const Logout = ({ setAuth }) => {
  const navigate = useNavigate(); // Hook to navigate programmatically

  const logout = async () => {
    try {
      const response = await fetch("http://localhost:4000/logout", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("token"),
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      // Clear local storage and update auth context
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("user_id");
      setAuth({ user: null }); // Clear user context

      navigate('/'); // Redirect to home page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <button onClick={logout}>Logout</button>
  );
};

export default Logout;
