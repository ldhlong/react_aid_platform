// src/components/AboutPage.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const AboutPage = () => {
  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
        <h1 className="text-center">About NeighborConnect</h1>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <h2>About Us</h2>
          <p>
            NeighborConnect is an innovative platform designed to bring neighbors closer together.
            Our application facilitates local communication, community events, and mutual assistance,
            fostering a stronger and more connected neighborhood.
          </p>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <h2>Our Mission</h2>
          <p>
            Our mission is to empower communities by providing a platform that encourages interaction,
            support, and collaboration among neighbors. We believe in the power of local connections
            to create a safer, more engaged, and happier community.
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>Follow Us</h2>
          <p>Connect with us on social media:</p>
          <a href="https://facebook.com/NeighborConnect" className="btn btn-outline-primary mr-2">
            <i className="fab fa-facebook-f"></i> Facebook
          </a>
          <a href="https://twitter.com/NeighborConnect" className="btn btn-outline-info mr-2">
            <i className="fab fa-twitter"></i> Twitter
          </a>
          <a href="https://instagram.com/NeighborConnect" className="btn btn-outline-danger">
            <i className="fab fa-instagram"></i> Instagram
          </a>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutPage;
