// frontend/src/components/Navigation.js
import React from 'react';
import { Navbar, Nav, Container, Badge, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useBlockchain } from '../utils/BlockchainContext';
import { formatAddress } from '../utils/blockchain';

/**
 * Navigation Component
 * 
 * Role-aware navigation that shows different options based on user permissions
 */
const Navigation = () => {
  const { account, userRoles, networkInfo, connectToWallet, disconnect, isLoading } = useBlockchain();

  const getRoleText = () => {
    const roles = [];
    if (userRoles.isAdmin) roles.push('Admin');
    if (userRoles.isProcessor) roles.push('Processor');
    if (userRoles.isDistributor) roles.push('Distributor');
    if (userRoles.isRetailer) roles.push('Retailer');
    if (userRoles.isOracle) roles.push('Oracle');
    return roles.length > 0 ? roles.join(', ') : 'No Role';
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand href="/">
          <strong>FROST-CHAIN</strong>
          <Badge bg="primary" className="ms-2">v2.0</Badge>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          {account ? (
            <>
              <Nav className="me-auto">
                <LinkContainer to="/">
                  <Nav.Link>Dashboard</Nav.Link>
                </LinkContainer>
                
                {(userRoles.isProcessor || userRoles.isAdmin) && (
                  <LinkContainer to="/create-batch">
                    <Nav.Link>Create Batch</Nav.Link>
                  </LinkContainer>
                )}
                
                {userRoles.isAdmin && (
                  <LinkContainer to="/admin">
                    <Nav.Link>Admin Panel</Nav.Link>
                  </LinkContainer>
                )}
              </Nav>
              
              <Nav className="ms-auto">
                <Navbar.Text className="me-3">
                  <Badge bg="info" className="me-2">{getRoleText()}</Badge>
                  {formatAddress(account)}
                </Navbar.Text>
                
                {networkInfo && (
                  <Navbar.Text className="me-3">
                    <Badge bg={networkInfo.chainId === 31337 ? 'warning' : 'success'}>
                      {networkInfo.name || `Chain ${networkInfo.chainId}`}
                    </Badge>
                  </Navbar.Text>
                )}
                
                <Button variant="outline-light" size="sm" onClick={disconnect}>
                  Disconnect
                </Button>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto">
              <Button 
                variant="primary" 
                onClick={connectToWallet}
                disabled={isLoading}
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
