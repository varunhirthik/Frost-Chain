// frontend/src/components/AdminPanel.js
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Form, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useBlockchain } from '../utils/BlockchainContext';
import { grantRole, revokeRole, getAllBatches } from '../utils/blockchain-clean';
import { toast } from 'react-toastify';

/**
 * Admin Panel Component
 * 
 * Administrative interface for role management and system overview
 */
const AdminPanel = () => {
  const navigate = useNavigate();
  const { contract, userRoles, account } = useBlockchain();
  
  const [allBatches, setAllBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleAction, setRoleAction] = useState({ type: '', address: '', role: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // Role mappings
  const roles = {
    'ADMIN_ROLE': { name: 'Administrator', color: 'danger' },
    'PROCESSOR_ROLE': { name: 'Processor', color: 'primary' },
    'DISTRIBUTOR_ROLE': { name: 'Distributor', color: 'info' },
    'RETAILER_ROLE': { name: 'Retailer', color: 'warning' }
  };

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load all batches for overview
      const batches = await getAllBatches(contract);
      setAllBatches(batches);
      
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    if (contract && userRoles.isAdmin) {
      loadAdminData();
    }
  }, [contract, userRoles.isAdmin, loadAdminData]);

  // Check admin access - render after hooks
  if (!userRoles.isAdmin) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <h5>Access Denied</h5>
          <p>You need Administrator privileges to access this panel.</p>
          <Button variant="outline-primary" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </Alert>
      </Container>
    );
  }

  const handleRoleAction = async () => {
    if (!roleAction.address || !roleAction.role) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsProcessing(true);
      
      let result;
      if (roleAction.type === 'grant') {
        result = await grantRole(contract, roleAction.role, roleAction.address);
      } else {
        result = await revokeRole(contract, roleAction.role, roleAction.address);
      }
      
      if (result.success) {
        toast.success(`Role ${roleAction.type === 'grant' ? 'granted' : 'revoked'} successfully!`);
        setShowRoleModal(false);
        setRoleAction({ type: '', address: '', role: '' });
      }
      
    } catch (error) {
      console.error('Error managing role:', error);
      toast.error(`Failed to ${roleAction.type} role: ` + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const openRoleModal = (type) => {
    setRoleAction({ type, address: '', role: '' });
    setShowRoleModal(true);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
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

  const getSystemStats = () => {
    const stats = {
      totalBatches: allBatches.length,
      activeBatches: allBatches.filter(b => b.status !== 4).length,
      compromisedBatches: allBatches.filter(b => b.status === 4).length,
      recentBatches: allBatches.filter(b => 
        (Date.now() / 1000) - Number(b.timestamp) < 86400 * 7
      ).length
    };
    return stats;
  };

  const stats = getSystemStats();

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading admin panel...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Administration Panel</h2>
        <Button variant="outline-secondary" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </div>

      {/* System Statistics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{stats.totalBatches}</h3>
              <p className="mb-0">Total Batches</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{stats.activeBatches}</h3>
              <p className="mb-0">Active Batches</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-danger">{stats.compromisedBatches}</h3>
              <p className="mb-0">Compromised</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">{stats.recentBatches}</h3>
              <p className="mb-0">This Week</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          {/* All Batches Overview */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">System Batches Overview</h5>
              <Badge bg="secondary">{allBatches.length} Total</Badge>
            </Card.Header>
            <Card.Body>
              {allBatches.length === 0 ? (
                <Alert variant="info">
                  No batches in the system yet.
                </Alert>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Batch #</th>
                      <th>Product</th>
                      <th>Status</th>
                      <th>Owner</th>
                      <th>Created</th>
                      <th>Temperature</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBatches.slice(0, 10).map((batch) => (
                      <tr key={batch.id}>
                        <td><strong>#{batch.id}</strong></td>
                        <td>{batch.productName}</td>
                        <td>{getStatusBadge(batch.status)}</td>
                        <td>
                          <code className="small">
                            {batch.currentOwner.slice(0, 6)}...{batch.currentOwner.slice(-4)}
                          </code>
                        </td>
                        <td>{formatTimestamp(batch.timestamp)}</td>
                        <td>
                          <Badge bg={batch.temperature > -10 ? 'danger' : 'success'}>
                            {batch.temperature}°C
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/batch/${batch.id}`)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              
              {allBatches.length > 10 && (
                <div className="text-center mt-3">
                  <Alert variant="info">
                    Showing first 10 batches. Use the dashboard search for specific batches.
                  </Alert>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Role Management */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Role Management</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button
                  variant="success"
                  onClick={() => openRoleModal('grant')}
                  disabled={isProcessing}
                >
                  Grant Role
                </Button>
                <Button
                  variant="danger"
                  onClick={() => openRoleModal('revoke')}
                  disabled={isProcessing}
                >
                  Revoke Role
                </Button>
              </div>

              <hr />

              <h6>Available Roles:</h6>
              <div className="d-flex flex-column gap-2">
                {Object.entries(roles).map(([roleKey, roleInfo]) => (
                  <div key={roleKey} className="d-flex align-items-center">
                    <Badge bg={roleInfo.color} className="me-2">
                      {roleInfo.name}
                    </Badge>
                    <small className="text-muted">{roleKey}</small>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* System Information */}
          <Card>
            <Card.Header>
              <h6 className="mb-0">System Information</h6>
            </Card.Header>
            <Card.Body>
              <p className="mb-2">
                <strong>Contract Address:</strong><br />
                <code className="small">{contract?.address || 'Not available'}</code>
              </p>
              <p className="mb-2">
                <strong>Your Address:</strong><br />
                <code className="small">{account}</code>
              </p>
              <p className="mb-0">
                <strong>Network:</strong> Local Development
              </p>
              
              <hr />
              
              <div className="text-center">
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={loadAdminData}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh Data'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Role Management Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {roleAction.type === 'grant' ? 'Grant Role' : 'Revoke Role'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Ethereum Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="0x..."
                value={roleAction.address}
                onChange={(e) => setRoleAction(prev => ({ ...prev, address: e.target.value }))}
                disabled={isProcessing}
              />
              <Form.Text className="text-muted">
                The Ethereum address to {roleAction.type} the role {roleAction.type === 'grant' ? 'to' : 'from'}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={roleAction.role}
                onChange={(e) => setRoleAction(prev => ({ ...prev, role: e.target.value }))}
                disabled={isProcessing}
              >
                <option value="">Select a role...</option>
                {Object.entries(roles).map(([roleKey, roleInfo]) => (
                  <option key={roleKey} value={roleKey}>
                    {roleInfo.name} ({roleKey})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRoleModal(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant={roleAction.type === 'grant' ? 'success' : 'danger'}
            onClick={handleRoleAction}
            disabled={isProcessing || !roleAction.address || !roleAction.role}
          >
            {isProcessing ? 'Processing...' : (roleAction.type === 'grant' ? 'Grant Role' : 'Revoke Role')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPanel;
