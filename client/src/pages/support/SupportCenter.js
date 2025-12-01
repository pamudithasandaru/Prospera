import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add,
  CheckCircle,
  Pending,
  Cancel,
  ExpandMore,
  Search,
  HelpOutline,
  ContactSupport,
  Phone,
} from '@mui/icons-material';
import api from '../../services/api';

const SupportCenter = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    description: '',
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/support/tickets');
      setTickets(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    try {
      await api.post('/support/tickets', newTicket);
      setDialogOpen(false);
      setNewTicket({ subject: '', category: '', description: '' });
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle color="success" />;
      case 'pending':
        return <Pending color="warning" />;
      case 'open':
        return <ContactSupport color="info" />;
      default:
        return <HelpOutline />;
    }
  };

  const faqData = [
    {
      question: 'How do I register my farm?',
      answer: 'Go to Farm Management > Register Farm and fill in your farm details including location, size, and crop types.',
    },
    {
      question: 'How can I list my products on the market?',
      answer: 'Navigate to Wholesale Market > My Listings > Create New Listing. Upload product images and set your pricing.',
    },
    {
      question: 'How do I apply for government schemes?',
      answer: 'Visit Government Portal, browse available schemes, check eligibility, and click "Apply Now" on eligible schemes.',
    },
    {
      question: 'How does AI disease detection work?',
      answer: 'Upload clear images of affected crops in the AI Tools section. Our AI will analyze and provide disease identification and treatment recommendations.',
    },
    {
      question: 'How can I track my loan application?',
      answer: 'Go to AgriFinTech > My Loans to view all your loan applications and their current status.',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Community Support Center
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Get help and support for your farming needs
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <ContactSupport sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {tickets.filter(t => t.status === 'open').length}
              </Typography>
              <Typography variant="body2">Open Tickets</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {tickets.filter(t => t.status === 'resolved').length}
              </Typography>
              <Typography variant="body2">Resolved</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Pending sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {tickets.filter(t => t.status === 'pending').length}
              </Typography>
              <Typography variant="body2">Pending</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Phone sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                24/7
              </Typography>
              <Typography variant="body2">Hotline Support</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* My Support Tickets */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold">
            My Support Tickets
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Create Ticket
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ticket ID</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket._id}>
                  <TableCell>#{ticket._id?.substring(0, 8)}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>
                    <Chip label={ticket.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getStatusIcon(ticket.status)}
                      <Typography variant="body2">{ticket.status}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {tickets.length === 0 && !loading && (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary">
              No support tickets yet
            </Typography>
          </Box>
        )}
      </Paper>

      {/* FAQ Section */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Frequently Asked Questions
        </Typography>
        <Box mt={2}>
          {faqData.map((faq, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight="medium">{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Paper>

      {/* Emergency Contacts */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Emergency Hotlines
        </Typography>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Phone color="primary" sx={{ mb: 1 }} />
                <Typography variant="subtitle2" fontWeight="bold">
                  Agricultural Department
                </Typography>
                <Typography variant="h6" color="primary.main">
                  1920
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Phone color="primary" sx={{ mb: 1 }} />
                <Typography variant="subtitle2" fontWeight="bold">
                  Pest Control Hotline
                </Typography>
                <Typography variant="h6" color="primary.main">
                  011-2345678
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Phone color="primary" sx={{ mb: 1 }} />
                <Typography variant="subtitle2" fontWeight="bold">
                  Veterinary Services
                </Typography>
                <Typography variant="h6" color="primary.main">
                  011-8765432
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Create Ticket Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Support Ticket</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              fullWidth
              label="Subject"
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
            />
            <TextField
              select
              fullWidth
              label="Category"
              value={newTicket.category}
              onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value=""></option>
              <option value="technical">Technical Issue</option>
              <option value="account">Account</option>
              <option value="payment">Payment</option>
              <option value="farming">Farming Question</option>
              <option value="other">Other</option>
            </TextField>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateTicket}
            disabled={!newTicket.subject || !newTicket.category || !newTicket.description}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SupportCenter;
