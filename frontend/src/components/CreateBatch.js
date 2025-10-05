// frontend/src/components/CreateBatch.js
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useBlockchain } from '../utils/BlockchainContext';
import { createBatch as createBatchOnChain } from '../utils/blockchain';
import { toast } from 'react-toastify';

/**
 * Create Batch Component
 * 
 * Allows processors to create new product batches
 */
const CreateBatch = () => {
  const { contract, userRoles } = useBlockchain();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    productName: '',
    additionalDetails: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user has permission
  if (!userRoles.isProcessor && !userRoles.isAdmin) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <h5>Access Denied</h5>
          <p>You need Processor role to create batches. Please contact an administrator.</p>
        </Alert>
      </Container>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productName.trim()) {
      toast.error('Product name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const result = await createBatchOnChain(
        contract,
        formData.productName.trim(),
        formData.additionalDetails.trim()
      );
      
      if (result.success) {
        toast.success(`Batch #${result.batchId} created successfully!`);
        navigate(`/batch/${result.batchId}`);
      } else {
        throw new Error('Failed to create batch');
      }
      
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error('Failed to create batch: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h3 className="mb-0">Create New Batch</h3>
              <small className="text-muted">
                Initialize a new product batch for supply chain tracking
              </small>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="productName"
                        value={formData.productName}
                        onChange={handleInputChange}
                        placeholder="e.g., Frozen Peas"
                        required
                        disabled={isSubmitting}
                      />
                      <Form.Text className="text-muted">
                        Enter the name of the product being tracked
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Grade/Quality</Form.Label>
                      <Form.Select
                        name="grade"
                        onChange={(e) => {
                          const grade = e.target.value;
                          if (grade) {
                            setFormData(prev => ({
                              ...prev,
                              additionalDetails: prev.additionalDetails ? 
                                `${prev.additionalDetails}, Grade: ${grade}` : 
                                `Grade: ${grade}`
                            }));
                          }
                        }}
                        disabled={isSubmitting}
                      >
                        <option value="">Select Grade</option>
                        <option value="A">Grade A - Premium</option>
                        <option value="B">Grade B - Standard</option>
                        <option value="C">Grade C - Basic</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Additional Details</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="additionalDetails"
                    value={formData.additionalDetails}
                    onChange={handleInputChange}
                    placeholder="Enter additional product details, certifications, origin information, etc."
                    disabled={isSubmitting}
                  />
                  <Form.Text className="text-muted">
                    Optional: Include any relevant details about the product batch
                  </Form.Text>
                </Form.Group>

                <Alert variant="info">
                  <h6>What happens next?</h6>
                  <ul className="mb-0">
                    <li>A unique batch ID will be generated</li>
                    <li>Initial temperature will be set to safe (-18°C)</li>
                    <li>You will be set as the initial owner</li>
                    <li>The batch can then be tracked through the supply chain</li>
                  </ul>
                </Alert>

                <div className="d-flex justify-content-between">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={isSubmitting || !formData.productName.trim()}
                  >
                    {isSubmitting ? 'Creating Batch...' : 'Create Batch'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateBatch;
