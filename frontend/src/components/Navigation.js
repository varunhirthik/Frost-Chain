// frontend/src/components/Navigation.js
import React from 'react';
import { Navbar, Nav, Container, Badge, Button, Dropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useBlockchain } from '../utils/BlockchainContext';
import { useRole, FRONTEND_ROLES, ROLE_LABELS } from '../utils/RoleContext';
import { formatAddress } from '../utils/blockchain-clean';

/**
 * Navigation Component
 * 
 * Simple role-based navigation with frontend role switching
 */
const Navigation = () => {
  const { account, networkInfo, connectToWallet, disconnect, isLoading } = useBlockchain();
  const { currentRole, switchRole, canCreateBatch, canViewAdmin, roleLabel } = useRole();

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
                
                {canCreateBatch() && (
                  <LinkContainer to="/create-batch">
                    <Nav.Link>Create Batch</Nav.Link>
                  </LinkContainer>
                )}
                
                {canViewAdmin() && (
                  <LinkContainer to="/admin">
                    <Nav.Link>Admin Panel</Nav.Link>
                  </LinkContainer>
                )}
              </Nav>
              
              <Nav className="ms-auto">
                <Dropdown className="me-3">
                  <Dropdown.Toggle variant="info" size="sm">
                    Role: {roleLabel}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {Object.entries(ROLE_LABELS).map(([roleKey, label]) => (
                      <Dropdown.Item 
                        key={roleKey}
                        active={currentRole === roleKey}
                        onClick={() => switchRole(roleKey)}
                      >
                        {label}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
                
                <Navbar.Text className="me-3">
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
