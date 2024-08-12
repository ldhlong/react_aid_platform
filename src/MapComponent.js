import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJsApiLoader, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

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
      const response = await fetch('http://localhost:4000/help_requests', {
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

      const response = await fetch(`http://localhost:4000/help_requests/${requestCount}`, {
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

  const getColorStyle = (type) => {
    return {
      backgroundColor: type === 'one-time-task' ? 'blue' : 'red',
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      display: 'inline-block',
      marginRight: '10px'
    };
  };

  return isLoaded ? (
    <div>
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
          <InfoWindow
            position={{
              lat: parseFloat(selected.latitude),
              lng: parseFloat(selected.longitude),
            }}
            onCloseClick={() => setSelected(null)}
          >
            <div style={{ maxWidth: 200 }}>
              <h3>{selected.title}</h3>
              <p>{selected.description}</p>
              <p>Latitude: {selected.latitude}</p>
              <p>Longitude: {selected.longitude}</p>
              <p>Type: {selected.request_type}</p> {/* Display request type */}
              <button onClick={() => handleAssign(selected.request_count)}>Assign to Me</button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>List of Markers:</h2>
        <ul>
          {markers.map(marker => (
            <li key={marker.request_count} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={getColorStyle(marker.request_type)}></div>
              {marker.title} - Lat: {marker.latitude}, Lng: {marker.longitude}
              <button style={{ marginLeft: '10px' }} onClick={() => handleAssign(marker.request_count)}>Assign to Me</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  ) : (
    <div>Loading...</div>
  );
}

export default React.memo(MapComponent);