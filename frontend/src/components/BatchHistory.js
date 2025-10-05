// frontend/src/components/BatchHistory.js
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Badge, Alert, Spinner, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../utils/BlockchainContext';
import { getBatchHistory } from '../utils/blockchain';

/**
 * Batch History Component
 * 
 * Displays detailed chronological history of a batch
 */
const BatchHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contract } = useBlockchain();
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batchInfo, setBatchInfo] = useState(null);

  const loadBatchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const historyData = await getBatchHistory(contract, id);
      setHistory(historyData.events || []);
      setBatchInfo(historyData.batch);
    } catch (error) {
      console.error('Error loading batch history:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [contract, id]);

  useEffect(() => {
    loadBatchHistory();
  }, [loadBatchHistory]);

  const formatTimestamp = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const getEventTypeColor = (eventType) => {
    const colorMap = {
      'BatchCreated': 'success',
      'BatchTransferred': 'primary',
      'TemperatureUpdated': 'warning',
      'StatusChanged': 'info',
      'QualityCompromised': 'danger'
    };
    return colorMap[eventType] || 'secondary';
  };

  const getRoleColor = (role) => {
    const roleMap = {
      1: { color: 'primary', text: 'Processor' },
      2: { color: 'info', text: 'Distributor' },
      3: { color: 'warning', text: 'Retailer' },
      0: { color: 'secondary', text: 'Unknown' }
    };
    return roleMap[role] || { color: 'secondary', text: 'Unknown' };
  };

  const getTemperatureColor = (temp) => {
    if (temp > -10) return 'danger';
    if (temp > -15) return 'warning';
    return 'success';
  };

  const getEventIcon = (eventType) => {
    const iconMap = {
      'BatchCreated': '🆕',
      'BatchTransferred': '🔄',
      'TemperatureUpdated': '🌡️',
      'StatusChanged': '📊',
      'QualityCompromised': '⚠️'
    };
    return iconMap[eventType] || '📝';
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading batch history...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <h5>Error Loading History</h5>
          <p>{error}</p>
          <Button variant="outline-primary" onClick={() => navigate(`/batch/${id}`)}>
            Back to Batch Details
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Batch #{id} History</h2>
          {batchInfo && (
            <p className="text-muted mb-0">
              Product: {batchInfo.productName} | 
              Created: {formatTimestamp(batchInfo.timestamp)}
            </p>
          )}
        </div>
        <div>
          <Button 
            variant="outline-secondary" 
            className="me-2"
            onClick={() => navigate(`/batch/${id}`)}
          >
            Batch Details
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={() => navigate('/')}
          >
            Dashboard
          </Button>
        </div>
      </div>

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Complete Event Timeline</h5>
              <small className="text-muted">
                Chronological record of all batch activities
              </small>
            </Card.Header>
            <Card.Body>
              {history.length === 0 ? (
                <Alert variant="info">
                  <h6>No History Available</h6>
                  <p>This batch has no recorded events yet, or they are still being indexed.</p>
                </Alert>
              ) : (
                <div className="timeline">
                  {history.map((event, index) => (
                    <div key={index} className="timeline-item mb-4">
                      <Card className="border-start border-3" 
                            style={{ borderColor: `var(--bs-${getEventTypeColor(event.eventType)})` }}>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <h6 className="mb-2">
                                <span className="me-2">{getEventIcon(event.eventType)}</span>
                                <Badge bg={getEventTypeColor(event.eventType)}>
                                  {event.eventType}
                                </Badge>
                              </h6>
                              
                              <div className="row">
                                <div className="col-md-6">
                                  <p className="mb-1">
                                    <strong>Time:</strong> {formatTimestamp(event.timestamp)}
                                  </p>
                                  
                                  {event.actor && (
                                    <p className="mb-1">
                                      <strong>Actor:</strong> 
                                      <code className="ms-1">{event.actor}</code>
                                    </p>
                                  )}
                                  
                                  {event.role !== undefined && (
                                    <p className="mb-1">
                                      <strong>Role:</strong> 
                                      <Badge bg={getRoleColor(event.role).color} className="ms-1">
                                        {getRoleColor(event.role).text}
                                      </Badge>
                                    </p>
                                  )}
                                </div>
                                
                                <div className="col-md-6">
                                  {event.temperature !== undefined && (
                                    <p className="mb-1">
                                      <strong>Temperature:</strong> 
                                      <Badge bg={getTemperatureColor(event.temperature)} className="ms-1">
                                        {event.temperature}°C
                                      </Badge>
                                    </p>
                                  )}
                                  
                                  {event.newOwner && (
                                    <p className="mb-1">
                                      <strong>New Owner:</strong>
                                      <code className="ms-1">{event.newOwner}</code>
                                    </p>
                                  )}
                                  
                                  {event.blockNumber && (
                                    <p className="mb-1">
                                      <strong>Block:</strong> #{event.blockNumber}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {event.details && (
                                <div className="mt-2">
                                  <small className="text-muted">
                                    <strong>Details:</strong> {event.details}
                                  </small>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Summary Statistics */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">History Summary</h6>
            </Card.Header>
            <Card.Body>
              <div className="row text-center">
                <div className="col-6">
                  <h4 className="text-primary">{history.length}</h4>
                  <small className="text-muted">Total Events</small>
                </div>
                <div className="col-6">
                  <h4 className="text-info">
                    {history.filter(e => e.eventType === 'BatchTransferred').length}
                  </h4>
                  <small className="text-muted">Transfers</small>
                </div>
              </div>
              
              <hr />
              
              <div className="row text-center">
                <div className="col-6">
                  <h4 className="text-warning">
                    {history.filter(e => e.eventType === 'TemperatureUpdated').length}
                  </h4>
                  <small className="text-muted">Temp Updates</small>
                </div>
                <div className="col-6">
                  <h4 className="text-danger">
                    {history.filter(e => e.eventType === 'QualityCompromised').length}
                  </h4>
                  <small className="text-muted">Alerts</small>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Event Types Legend */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Event Types</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center">
                  <span className="me-2">🆕</span>
                  <Badge bg="success" className="me-2">Created</Badge>
                  <small className="text-muted">Batch initialization</small>
                </div>
                <div className="d-flex align-items-center">
                  <span className="me-2">🔄</span>
                  <Badge bg="primary" className="me-2">Transferred</Badge>
                  <small className="text-muted">Ownership change</small>
                </div>
                <div className="d-flex align-items-center">
                  <span className="me-2">🌡️</span>
                  <Badge bg="warning" className="me-2">Temperature</Badge>
                  <small className="text-muted">Temp monitoring</small>
                </div>
                <div className="d-flex align-items-center">
                  <span className="me-2">📊</span>
                  <Badge bg="info" className="me-2">Status</Badge>
                  <small className="text-muted">Status updates</small>
                </div>
                <div className="d-flex align-items-center">
                  <span className="me-2">⚠️</span>
                  <Badge bg="danger" className="me-2">Alert</Badge>
                  <small className="text-muted">Quality issues</small>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Export Options */}
          <Card>
            <Card.Header>
              <h6 className="mb-0">Export History</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => {
                    const dataStr = JSON.stringify(history, null, 2);
                    const dataBlob = new Blob([dataStr], {type: 'application/json'});
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `batch-${id}-history.json`;
                    link.click();
                  }}
                >
                  Download JSON
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => window.print()}
                >
                  Print History
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BatchHistory;
