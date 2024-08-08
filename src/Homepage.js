import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';

const HomePage = () => {
  const [completedRequestsCount, setCompletedRequestsCount] = useState(0);

  useEffect(() => {
    const fetchCompletedRequestsCount = async () => {
      try {
        console.log('Attempting to fetch completed requests count...');
        
        const response = await fetch('http://localhost:4000/api/completed_requests_count', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Fetched completed requests count:', data.count);
        setCompletedRequestsCount(data.count);
      } catch (error) {
        console.error('Failed to fetch completed requests count:', error);
      }
    };

    fetchCompletedRequestsCount(); // Fetch initially

    const intervalId = setInterval(fetchCompletedRequestsCount, 5000); // Fetch every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  const countDigits = completedRequestsCount.toString().split('');

  return (
    <Container className="text-center mt-5">
      <h1 className="display-1 fw-bold">Small Acts, Big Impact</h1>
      <div className="d-flex justify-content-center align-items-center mt-4">
        {countDigits.map((digit, index) => (
          <div key={index} className="bg-primary text-white d-inline-flex align-items-center justify-content-center rounded-square fs-1 me-1" style={{ width: '80px', height: '80px' }}>
            {digit}
          </div>
        ))}
      </div>
      <p className="fs-4 mt-4">Help Requests Completed</p>
      <p className="fs-4"><Link to="/signup">Sign Up Today!</Link></p>
    </Container>
  );
}

export default HomePage;
