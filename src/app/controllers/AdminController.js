const AdminService = require('../services/AdminService');

class AdminController {

    //[Get] /api/v1/admin/bookings
    async getBookings(req, res) {
        try{
            const data = await AdminService.getAllBookings();
            res.status(200).json({success: true, data: data});

        } catch (error) {
            console.log("Debug: Error in getBookings:", error);
            res.status(500).json({success: false, message: "Internal Server Error"})
        }
    }

    //[Patch] /api/v1/admin/bookings/:id/status
    async updateStatus(req, res) {
        try {
            const bookingId = req.params.id;
            const {status} = req.body;

            if(!status) {
                return res.status(400).json({ success: false, message: "Status is required" });
            }

            const data = await AdminService.updateBookingStatus(bookingId, status);
            res.status(200).json({ success: true, message: "Status updated", data: data });

        } catch (error) {
            if (error.message === 'Invalid status' || error.message === 'Booking not found') {
                return res.status(400).json({ success: false, message: error.message });
            }
            console.error("Debug Error in updateStatus:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
}

module.exports = new AdminController();