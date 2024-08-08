import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { Button, Card, Badge } from 'react-bootstrap';

function ConversationsList() {
  const { auth } = useContext(AuthContext);
  const { user } = auth;
  const [conversations, setConversations] = useState([]);
  const [republishedConversations, setRepublishedConversations] = useState(new Set());
  const [assignedUserCount, setAssignedUserCount] = useState({});
  const navigate = useNavigate();

  const fetchConversations = async () => {
    if (user) {
      try {
        const response = await fetch(`http://localhost:4000/conversations?user_id=${user.user_id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch conversations: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched conversations data:', data); // Log data to inspect
  
        // Process the data
        const republishedSet = new Set(data.filter(conversation => !conversation.visible).map(conversation => conversation.id));
        setRepublishedConversations(republishedSet);
        setConversations(data);
  
        // Count assigned users for each help request
        const counts = {};
        data.forEach(conversation => {
          if (!counts[conversation.help_request_id]) {
            counts[conversation.help_request_id] = 0;
          }
          counts[conversation.help_request_id]++;
        });
        setAssignedUserCount(counts);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  const handleConversationSelect = (conversationId) => {
    if (!republishedConversations.has(conversationId)) {
      navigate(`/messages/${conversationId}`);
    }
  };

  const markHelpRequestComplete = async (helpRequestId) => {
    try {
      const response = await fetch(`http://localhost:4000/help_requests/${helpRequestId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completion_status: true, visible: false }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark help request as complete: ${response.statusText}`);
      }

      // Refresh conversations to ensure UI is in sync with the backend
      fetchConversations();
    } catch (error) {
      console.error('Error marking help request as complete:', error);
    }
  };

  const republishHelpRequest = async (helpRequestId, conversationId) => {
    try {
      const response = await fetch(`http://localhost:4000/help_requests/${helpRequestId}/republish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversation_id: conversationId, request_count: helpRequestId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to republish help request: ${response.statusText}`);
      }

      // Refresh conversations to reflect changes
      fetchConversations();
    } catch (error) {
      console.error('Error republishing help request:', error);
    }
  };

  // Helper function to get badge class based on request_type
  const getBadgeClass = (requestType) => {
    switch (requestType) {
      case 'one-time-task':
        return 'bg-primary'; // Bootstrap primary color (blue)
      case 'material-need':
        return 'bg-danger'; // Bootstrap danger color (red/pink)
      default:
        return 'bg-secondary'; // Default color if unknown type
    }
  };

  return (
    <div className="conversationsList">
      <h2>Messages</h2>
      <div className="row">
        {Array.isArray(conversations) && conversations.length > 0 ? (
          conversations.map((conversation) => {
            const helpRequestId = conversation.help_request_id;
            const assignedCount = assignedUserCount[helpRequestId] || 0;
            const canRepublish = assignedCount === 5;
            const isComplete = conversation.completion_status;

            return (
              <div className="col-md-4 mb-3" key={conversation.id}>
                <Card
                  onClick={() => handleConversationSelect(conversation.id)}
                  className={`conversation-card ${!conversation.visible || republishedConversations.has(conversation.id) ? 'disabled' : ''}`}
                  style={{
                    cursor: (!conversation.visible || republishedConversations.has(conversation.id)) ? 'not-allowed' : 'pointer',
                    opacity: (!conversation.visible || republishedConversations.has(conversation.id)) ? 0.5 : 1,
                    backgroundColor: republishedConversations.has(conversation.id) ? 'grey' : 'white'
                  }}
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="mb-0">{conversation.title || 'N/A'}</h5>
                      <Badge className={`p-2 ${getBadgeClass(conversation.request_type)}`}>
                        {conversation.request_type || 'N/A'}
                      </Badge>
                    </div>
                    <Card.Text>
                      Description: {conversation.description || 'N/A'}
                    </Card.Text>
                    <Card.Text>
                      Last Message: {conversation.last_message || 'No messages'}
                    </Card.Text>
                    <Card.Text>
                      Sent at: {new Date(conversation.updated_at).toLocaleString()}
                    </Card.Text>
                    <Card.Text>
                      Help Request ID: {conversation.help_request_id}
                    </Card.Text>
                    {conversation.user_id === user.user_id && (
                      <>
                        {canRepublish && !isComplete && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              republishHelpRequest(helpRequestId, conversation.id);
                            }}
                            disabled={!conversation.visible}
                            variant={republishedConversations.has(conversation.id) ? 'secondary' : 'primary'}
                            className="me-2"
                          >
                            {republishedConversations.has(conversation.id) ? 'Republished' : 'Republish'}
                          </Button>
                        )}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            markHelpRequestComplete(helpRequestId);
                          }}
                          disabled={isComplete}
                          variant={isComplete ? 'secondary' : 'primary'}
                        >
                          {isComplete ? 'Completed' : 'Mark as Complete'}
                        </Button>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </div>
            );
          })
        ) : (
          <div className="col-12">
            <Card>
              <Card.Body>No conversations found.</Card.Body>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConversationsList;
