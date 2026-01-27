const volunteer = require('../models/userModel');
const attendance = require('../models/attendanceModel');
const event = require('../models/eventModel');

exports.getVolunteerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Get volunteer info
    const volunteer = await Volunteer.findById(id)
      .select('name email phone role createdAt')
      .lean();

    if (!volunteer) {
      return res.status(404).json({ error: "Volunteer not found" });
    }

    // Get attendance records with event details
    const attendanceRecords = await Attendance.find({ user: id })
      .populate({
        path: 'event',
        select: 'header date location'
      })
      .sort({ checkInTime: -1 })
      .lean();

    // Format response
    const formattedAttendance = attendanceRecords.map(record => ({
      event: record.event,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
      status: record.status,
      hours: record.hours
    }));

    res.json({
      success: true,
      volunteer: {
        ...volunteer,
        totalEvents: attendanceRecords.length,
        totalHours: attendanceRecords.reduce((sum, record) => sum + (record.hours || 0), 0)
      },
      attendance: formattedAttendance
    });

  } catch (err) {
    console.error("Admin view error:", err);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
};

// Additional endpoints you might want to add
exports.updateVolunteerRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const volunteer = await Volunteer.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('name email role');

    res.json({
      success: true,
      message: "Volunteer role updated",
      volunteer
    });
  } catch (err) {
    console.error("Update role error:", err);
    res.status(500).json({ error: "Failed to update role" });
  }
};