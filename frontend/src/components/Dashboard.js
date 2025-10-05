// frontend/src/components/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Badge, Button, Table, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiPackage, FiThermometer, FiUsers, FiAlertTriangle } from 'react-icons/fi';
import { useBlockchain } from '../utils/BlockchainContext';
import { getAllBatches, getBatchInfo, formatAddress, formatTimestamp, getStatusText, getStatusBadgeClass } from '../utils/blockchain-clean';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-toastify';

/**
 * Dashboard Component
 * 
 * Main dashboard showing:
 * - System statistics
 * - Recent batches
 * - Role-specific actions
 * - Quick access to key functions
 */
const Dashboard = () => {
  const { contract, userRoles, account } = useBlockchain();
  const [stats, setStats] = useState({
    totalBatches: 0,
    compromisedBatches: 0,
    userBatches: 0
  });
  const [recentBatches, setRecentBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    console.log('📊 [DASHBOARD] Starting dashboard data load...');
    console.log('📄 [DASHBOARD] Contract available:', !!contract);
    console.log('👤 [DASHBOARD] Account:', account);
    
    if (!contract) {
      console.warn('⚠️ [DASHBOARD] No contract available, skipping data load');
      return;
    }
    
    if (!account) {
      console.warn('⚠️ [DASHBOARD] No account available, skipping data load');
      return;
    }
    
    try {
      setLoading(true);
      console.log('⏳ [DASHBOARD] Loading state set to true');
      
      // Get all batches
      console.log('📦 [DASHBOARD] Fetching all batches...');
      const batches = await getAllBatches(contract);
      console.log('✅ [DASHBOARD] Batches fetched:', batches.length, 'batches');
      
      // Calculate statistics
      let compromisedCount = 0;
      let userBatchCount = 0;
      
      console.log('🔍 [DASHBOARD] Processing batch details...');
      const batchesWithDetails = await Promise.all(
        batches.slice(0, 10).map(async (batch) => {
          try {
            console.log('📋 [DASHBOARD] Loading details for batch:', batch.batchId);
            const batchInfo = await getBatchInfo(contract, batch.batchId);
            
            if (batchInfo.isCompromised) {
              compromisedCount++;
            }
            
            if (batchInfo.currentOwner.toLowerCase() === account.toLowerCase() ||
                batchInfo.processor.toLowerCase() === account.toLowerCase()) {
              userBatchCount++;
            }
            
            return {
              ...batch,
              ...batchInfo
            };
          } catch (error) {
            console.error(`❌ [DASHBOARD] Error loading batch ${batch.batchId}:`, error);
            return batch;
          }
        })
      );
      
      const finalStats = {
        totalBatches: batches.length,
        compromisedBatches: compromisedCount,
        userBatches: userBatchCount
      };
      
      console.log('📈 [DASHBOARD] Final statistics:', finalStats);
      setStats(finalStats);
      
      console.log('📦 [DASHBOARD] Setting recent batches:', batchesWithDetails.length, 'items');
      setRecentBatches(batchesWithDetails);
      
      console.log('✅ [DASHBOARD] Dashboard data loaded successfully');
      
    } catch (error) {
      console.error('❌ [DASHBOARD] Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      console.log('✅ [DASHBOARD] Loading state set to false');
    }
  }, [contract, account]);

  useEffect(() => {
    console.log('🔄 [DASHBOARD] useEffect triggered');
    console.log('📄 [DASHBOARD] Contract state:', !!contract);
    console.log('👤 [DASHBOARD] Account state:', account);
    
    if (contract) {
      console.log('✅ [DASHBOARD] Contract available, calling loadDashboardData');
      loadDashboardData();
    } else {
      console.log('⏳ [DASHBOARD] Waiting for contract...');
    }
  }, [contract, loadDashboardData]);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <Container className="py-4">
      {/* Welcome Section */}
      <Row className="mb-4">
        <Col>
          <h1>Dashboard</h1>
          <p className="text-muted">
            Welcome to FROST-CHAIN. Monitor your supply chain operations and track product batches.
          </p>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FiPackage size={32} className="text-primary mb-2" />
              <h3 className="mb-1">{stats.totalBatches}</h3>
              <small className="text-muted">Total Batches</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FiThermometer size={32} className="text-success mb-2" />
              <h3 className="mb-1">{stats.totalBatches - stats.compromisedBatches}</h3>
              <small className="text-muted">Safe Batches</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FiAlertTriangle size={32} className="text-danger mb-2" />
              <h3 className="mb-1">{stats.compromisedBatches}</h3>
              <small className="text-muted">Compromised</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FiUsers size={32} className="text-info mb-2" />
              <h3 className="mb-1">{stats.userBatches}</h3>
              <small className="text-muted">Your Batches</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {(userRoles.isProcessor || userRoles.isAdmin) && (
                  <Col md={4} className="mb-2">
                    <Link to="/create-batch">
                      <Button variant="primary" className="w-100">
                        Create New Batch
                      </Button>
                    </Link>
                  </Col>
                )}
                {userRoles.isAdmin && (
                  <Col md={4} className="mb-2">
                    <Link to="/admin">
                      <Button variant="warning" className="w-100">
                        Admin Panel
                      </Button>
                    </Link>
                  </Col>
                )}
                <Col md={4} className="mb-2">
                  <Button variant="outline-primary" className="w-100" onClick={loadDashboardData}>
                    Refresh Data
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Batches */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Batches</h5>
              <Badge bg="secondary">{recentBatches.length} shown</Badge>
            </Card.Header>
            <Card.Body>
              {recentBatches.length === 0 ? (
                <Alert variant="info">
                  No batches found. {(userRoles.isProcessor || userRoles.isAdmin) && (
                    <>
                      <Link to="/create-batch">Create the first batch</Link> to get started.
                    </>
                  )}
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Batch ID</th>
                        <th>Status</th>
                        <th>Current Owner</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBatches.map((batch) => (
                        <tr key={batch.batchId}>
                          <td>
                            <strong>#{batch.batchId}</strong>
                            {batch.isCompromised && (
                              <Badge bg="danger" className="ms-2">COMPROMISED</Badge>
                            )}
                          </td>
                          <td>
                            <Badge className={getStatusBadgeClass(batch.status)}>
                              {getStatusText(batch.status)}
                            </Badge>
                          </td>
                          <td>{formatAddress(batch.currentOwner || batch.actor)}</td>
                          <td>{formatTimestamp(batch.timestamp)}</td>
                          <td>
                            <Link to={`/batch/${batch.batchId}`}>
                              <Button variant="outline-primary" size="sm">
                                View Details
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
