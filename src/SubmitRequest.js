import React, { useState } from 'react';
import { Form, Button, Card, Container } from 'react-bootstrap';

const SubmitRequest = ({ token }) => {
  const [title, setTitle] = useState('');
  const [requestType, setRequestType] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestData = {
      title,
      request_type: requestType,
      description,
      latitude,
      longitude,
      user_id: localStorage.getItem('user_id'), // Fetch user_id from localStorage
    };

    try {
      const response = await fetch('https://backend-aid-b83f0dba9cf5.herokuapp.com/submit_request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ help_request: requestData }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Request submitted successfully!');
        setMessageType('success');
        // Optionally clear form fields after successful submission
        setTitle('');
        setRequestType('');
        setDescription('');
        setLatitude('');
        setLongitude('');
      } else {
        throw new Error(data.error || 'Request submission failed');
      }
    } catch (error) {
      console.error('Request Submission Error:', error);
      setMessage(error.message || 'Request submission failed');
      setMessageType('error');
    }
  };

  return (
    <Container className="mt-5">
      <Card bg="light">
        <Card.Header className="text-center">
          <h2>Submit Request</h2>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="title">
              <Form.Label>Title:</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                required
              />
            </Form.Group>
            <Form.Group controlId="requestType">
              <Form.Label>Type of Request:</Form.Label>
              <Form.Select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                required
              >
                <option value="">Select Type</option>
                <option value="one-time-task">One Time Task</option>
                <option value="material-need">Material Need</option>
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="description">
              <Form.Label>Description:</Form.Label>
              <Form.Control
                as="textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                maxLength={300}
                required
              />
              <Form.Text muted>
                {description.length}/300
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="latitude">
              <Form.Label>Latitude:</Form.Label>
              <Form.Control
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Latitude"
                required
              />
            </Form.Group>
            <Form.Group controlId="longitude">
              <Form.Label>Longitude:</Form.Label>
              <Form.Control
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Longitude"
                required
              />
            </Form.Group>
            <div className="text-center mt-3">
              <Button variant="primary" type="submit">
                Submit Request
              </Button>
            </div>
          </Form>
          {message && (
            <div className="text-center mt-3" style={{ color: messageType === 'success' ? 'green' : 'red' }}>
              {message}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SubmitRequest;
