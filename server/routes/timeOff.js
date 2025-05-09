const express = require('express');
const router = express.Router();
const TimeOff = require('../models/TimeOff');
const { authMiddleware, restrictToBoss, restrictToAdmin } = require('../middleware/authMiddleware');

// Submit a time-off request (employee)
router.post('/request', authMiddleware, async (req, res) => {
  const { startDate, endDate, reason } = req.body;
  try {
    console.log('Time-off request received:', { userId: req.user.userId, startDate, endDate, reason });
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const timeOff = new TimeOff({
      userId: req.user.userId,
      startDate,
      endDate,
      reason,
      status: 'pending'
    });
    await timeOff.save();
    console.log('Time-off request saved:', timeOff);
    res.status(201).json({ message: 'Request submitted', timeOff });
  } catch (error) {
    console.error('Time-off request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all time-off requests (boss or admin)
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching all time-off requests for:', req.user.role);
    if (req.user.role !== 'boss' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const requests = await TimeOff.find()
      .populate('userId', 'username name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Fetch requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve or reject a time-off request (admin)
router.patch('/:id/:action', authMiddleware, restrictToAdmin, async (req, res) => {
  const { id, action } = req.params;
  try {
    console.log(`Processing ${action} for request ID: ${id}`);
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const status = action === 'approve' ? 'approved' : 'rejected';
    const timeOff = await TimeOff.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!timeOff) {
      return res.status(404).json({ message: 'Request not found' });
    }

    console.log(`Request ${action}ed:`, timeOff);
    res.json({ message: `Request ${action}ed`, timeOff });
  } catch (error) {
    console.error(`${action} request error:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Manually add time-off (admin)
router.post('/add', authMiddleware, restrictToAdmin, async (req, res) => {
  const { employeeName, startDate, endDate, reason, status } = req.body;
  try {
    console.log('Manual time-off add:', { employeeName, startDate, endDate, reason, status });
    if (!employeeName || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const timeOff = new TimeOff({
      employeeName,
      startDate,
      endDate,
      reason,
      status: status || 'approved' // Default to approved for manual entries
    });
    await timeOff.save();
    console.log('Manual time-off saved:', timeOff);
    res.status(201).json({ message: 'Time-off added', timeOff });
  } catch (error) {
    console.error('Manual time-off error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;