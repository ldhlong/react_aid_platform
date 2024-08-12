import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJsApiLoader, GoogleMap, Marker, InfoWindowF } from '@react-google-maps/api';
import { Button, Container, Row, Col, ListGroup } from 'react-bootstrap';

const oneTimeTaskIcon = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'; // Blue dot for one-time tasks
const materialNeedIcon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'; // Red dot for material needs

const containerStyle = {
  width: '100%',
  height: '600px'
};

const center = {
  lat: 40.440624,
  lng: -79.995888
};

function MapComponent() {
  const [markers, setMarkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded) {
      fetchMarkers();
    }
  }, [isLoaded]);

  const fetchMarkers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('https://backend-aid-b83f0dba9cf5.herokuapp.com/help_requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch markers');
      }
      const data = await response.json();
      setMarkers(data.filter(marker => marker.visible));  // Adjust filtering as needed
    } catch (error) {
      console.error('Error fetching markers:', error);
    }
  };

  const handleAssign = async (requestCount) => {
    try {
      const token = localStorage.getItem("token");
      const user_id = localStorage.getItem("user_id");

      const requestBody = {
        help_request: {
          completion_status: false,
          accepted_by_user: user_id
        }
      };

      const response = await fetch(`https://backend-aid-b83f0dba9cf5.herokuapp.com/help_requests/${requestCount}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to assign marker');
      }

      const result = await response.json();

      // Extract conversation_id from the response
      const conversationId = result.conversation_id;
      if (!conversationId) {
        console.error('No conversation_id returned from PATCH request');
        return;
      }

      // Fetch the updated list of markers
      fetchMarkers();

      // Navigate to the correct conversation ID
      navigate(`/messages/${conversationId}`);

    } catch (error) {
      console.error('Error assigning marker:', error);
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  return isLoaded ? (
    <Container>
      <Row className="mb-3">
        <Col>
          <h2 className="text-center">Help Requests</h2>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
          >
            {markers.map(marker => (
              <Marker
                key={marker.request_count}
                position={{
                  lat: parseFloat(marker.latitude),
                  lng: parseFloat(marker.longitude),
                }}
                icon={marker.request_type === 'one-time-task' ? oneTimeTaskIcon : materialNeedIcon}
                onClick={() => setSelected(marker)}
              />
            ))}
            {selected && (
              <InfoWindowF
                position={{
                  lat: parseFloat(selected.latitude),
                  lng: parseFloat(selected.longitude),
                }}
                onCloseClick={() => setSelected(null)}
              >
                <div style={{ maxWidth: 200 }}>
                  <h3>Title: {selected.title}</h3>
                  <p>Description: {selected.description}</p>
                  <p>Latitude: {selected.latitude}</p>
                  <p>Longitude: {selected.longitude}</p>
                  <p>Type: {selected.request_type}</p>
                  <Button variant="primary" onClick={() => handleAssign(selected.request_count)}>Accept Task</Button>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <div className="p-3 border bg-light">
            <h4 className="mb-3">Legend:</h4>
            <div className="d-flex align-items-center mb-2">
              <div className="me-2" style={{ backgroundColor: 'blue', width: '15px', height: '15px', borderRadius: '50%' }}></div>
              <span>One-time Task</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="me-2" style={{ backgroundColor: 'red', width: '15px', height: '15px', borderRadius: '50%' }}></div>
              <span>Material Need</span>
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <div className="p-3 border">
            <h4 className="mb-3">Available Help Requests:</h4>
            <ListGroup>
              {markers.map(marker => (
                <ListGroup.Item key={marker.request_count} className="d-flex align-items-center">
                  <div className="me-2" style={{ backgroundColor: marker.request_type === 'one-time-task' ? 'blue' : 'red', width: '15px', height: '15px', borderRadius: '50%' }}></div>
                  <span className="me-2">Title: {marker.title}, Description: {marker.description}, Lat: {marker.latitude}, Lng: {marker.longitude}</span>
                  <Button variant="primary" onClick={() => handleAssign(marker.request_count)}>Accept Task</Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </Col>
      </Row>
    </Container>
  ) : (
    <div>Loading...</div>
  );
}

export default React.memo(MapComponent);
