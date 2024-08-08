import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import { AuthContext } from './context/AuthContext'; // Import AuthContext
import Logout from './Logout'; // Import Logout component

const MyNavbar = () => {
  const { auth, setAuth } = useContext(AuthContext); // Access auth and setAuth from context
  const { user } = auth;

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand as={Link} to="/">NeighborConnect</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link as={Link} to="/">Home</Nav.Link>
          {user ? (
            <>
              <Nav.Link as={Link} to="/submit_request">Submit A Help Request</Nav.Link>
              <Nav.Link as={Link} to="/map">Tasks</Nav.Link>
              <Nav.Link as={Link} to="/conversations">Messages</Nav.Link>
              <Nav.Link as={Link} to="/about">About</Nav.Link>
              <Logout setAuth={setAuth} /> {/* Show Logout button when user is logged in */}
            </>
          ) : (
            <>
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
              <Nav.Link as={Link} to="/signup">Signup</Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default MyNavbar;
