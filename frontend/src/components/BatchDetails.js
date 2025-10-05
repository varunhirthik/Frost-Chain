// frontend/src/components/BatchDetails.js
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Badge, Table, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../utils/BlockchainContext';
import { getBatchDetails, updateTemperature } from '../utils/blockchain-clean';
import { toast } from 'react-toastify';

/**
 * Batch Details Component
 * 
 * Displays comprehensive information about a specific batch
 */
const BatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contract, userRoles, account } = useBlockchain();
  
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTemperature, setNewTemperature] = useState('');
  const [isUpdatingTemp, setIsUpdatingTemp] = useState(false);

  const loadBatchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const batchData = await getBatchDetails(contract, id);
      setBatch(batchData);
    } catch (error) {
      console.error('Error loading batch details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [contract, id]);

  useEffect(() => {
    loadBatchDetails();
  }, [loadBatchDetails]);

  // Transfer functionality (for future use)
  // const handleTransfer = async (newOwner, newRole) => {
  //   try {
  //     setIsTransferring(true);
  //     const result = await transferBatch(contract, id, newOwner, newRole);
      
  //     if (result.success) {
  //       toast.success('Batch transferred successfully!');
  //       loadBatchDetails(); // Reload to show updated data
  //     }
  //   } catch (error) {
  //     console.error('Error transferring batch:', error);
  //     toast.error('Failed to transfer batch: ' + error.message);
  //   } finally {
  //     setIsTransferring(false);
  //   }
  // };

  const handleTemperatureUpdate = async () => {
    if (!newTemperature || isNaN(parseFloat(newTemperature))) {
      toast.error('Please enter a valid temperature');
      return;
    }

    try {
      setIsUpdatingTemp(true);
      const result = await updateTemperature(contract, id, parseFloat(newTemperature));
      
      if (result.success) {
        toast.success('Temperature updated successfully!');
        setNewTemperature('');
        loadBatchDetails();
      }
    } catch (error) {
      console.error('Error updating temperature:', error);
      toast.error('Failed to update temperature: ' + error.message);
    } finally {
      setIsUpdatingTemp(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { variant: 'primary', text: 'Created' },
      1: { variant: 'info', text: 'In Transit' },
      2: { variant: 'warning', text: 'At Distributor' },
      3: { variant: 'success', text: 'At Retailer' },
      4: { variant: 'danger', text: 'Compromised' }
    };
    
    const statusInfo = statusMap[status] || { variant: 'secondary', text: 'Unknown' };
    return <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  const getTemperatureColor = (temp) => {
    if (temp > -10) return 'danger';
    if (temp > -15) return 'warning';
    return 'success';
  };

  const canUserModify = () => {
    return batch && (
      batch.currentOwner.toLowerCase() === account?.toLowerCase() ||
      userRoles.isAdmin
    );
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading batch details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <h5>Error Loading Batch</h5>
          <p>{error}</p>
          <Button variant="outline-primary" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!batch) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <h5>Batch Not Found</h5>
          <p>Batch #{id} could not be found.</p>
          <Button variant="outline-primary" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Batch #{id}</h2>
        <Button variant="outline-secondary" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </div>

      <Row>
        <Col lg={8}>
          {/* Basic Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Batch Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Product:</strong> {batch.productName}</p>
                  <p><strong>Status:</strong> {getStatusBadge(batch.status)}</p>
                  <p><strong>Created:</strong> {formatTimestamp(batch.timestamp)}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Current Owner:</strong> <code>{batch.currentOwner}</code></p>
                  <p>
                    <strong>Temperature:</strong> 
                    <Badge bg={getTemperatureColor(batch.temperature)} className="ms-2">
                      {batch.temperature}°C
                    </Badge>
                  </p>
                  <p><strong>Batch ID:</strong> {id}</p>
                </Col>
              </Row>
              
              {batch.additionalDetails && (
                <div className="mt-3">
                  <strong>Additional Details:</strong>
                  <p className="text-muted">{batch.additionalDetails}</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Transfer History */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Transfer History</h5>
            </Card.Header>
            <Card.Body>
              {batch.transferHistory && batch.transferHistory.length > 0 ? (
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Role</th>
                      <th>Temperature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batch.transferHistory.map((transfer, index) => (
                      <tr key={index}>
                        <td>{formatTimestamp(transfer.timestamp)}</td>
                        <td><code>{transfer.from}</code></td>
                        <td><code>{transfer.to}</code></td>
                        <td>
                          <Badge bg="info">
                            {['Unknown', 'Processor', 'Distributor', 'Retailer'][transfer.newRole] || 'Unknown'}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={getTemperatureColor(transfer.temperature)}>
                            {transfer.temperature}°C
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">
                  No transfers recorded for this batch yet.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Temperature Update */}
          {canUserModify() && (
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Update Temperature</h6>
              </Card.Header>
              <Card.Body>
                <div className="input-group mb-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Temperature (°C)"
                    value={newTemperature}
                    onChange={(e) => setNewTemperature(e.target.value)}
                    step="0.1"
                    disabled={isUpdatingTemp}
                  />
                  <Button
                    variant="primary"
                    onClick={handleTemperatureUpdate}
                    disabled={isUpdatingTemp || !newTemperature}
                  >
                    {isUpdatingTemp ? 'Updating...' : 'Update'}
                  </Button>
                </div>
                <small className="text-muted">
                  Safe range: -18°C to -10°C
                </small>
              </Card.Body>
            </Card>
          )}

          {/* Quick Transfer Actions */}
          {canUserModify() && (
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Quick Transfer</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  {/* Transfer functionality temporarily disabled
                  <Button
                    variant="outline-info"
                    size="sm"
                    onClick={() => navigate(`/batch/${id}/transfer`)}
                  >
                    Transfer to Next Stage
                  </Button>
                  */}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => navigate(`/batch/${id}/history`)}
                  >
                    View Full History
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Batch Statistics */}
          <Card>
            <Card.Header>
              <h6 className="mb-0">Batch Statistics</h6>
            </Card.Header>
            <Card.Body>
              <div className="row text-center">
                <div className="col-6">
                  <h4 className="text-primary">{batch.transferHistory?.length || 0}</h4>
                  <small className="text-muted">Transfers</small>
                </div>
                <div className="col-6">
                  <h4 className={`text-${getTemperatureColor(batch.temperature)}`}>
                    {batch.temperature}°C
                  </h4>
                  <small className="text-muted">Current Temp</small>
                </div>
              </div>
              
              <hr />
              
              <div className="row text-center">
                <div className="col-12">
                  <small className="text-muted">
                    Batch Age: {Math.floor((Date.now() / 1000 - batch.timestamp) / 86400)} days
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BatchDetails;
