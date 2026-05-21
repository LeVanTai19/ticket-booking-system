const db = require('../../config/db');

class AdminService {

    //Lất danh sách bookings
    async getAllBookings() {
        const result = await db.query(`
            SELECT b.id, b.user_id, b.total_amount, b.status, b.created_at,
                   t.name as ticket_name, bt.quantity
            FROM bookings b
            JOIN booking_tickets bt ON b.id = bt.booking_id
            JOIN ticket_categories t ON bt.ticket_category_id = t.id
            ORDER BY b.created_at DESC
        `);
        return result.rows;
    }

    //cập nhật status thủ công
    async updateBookingStatus(bookingId, status) {
        const validStatuses = ['RESERVED', 'COMPLETED', 'FAILED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            throw new Error ('Invalid status');
        }

        const result = await db.query(`
            UPDATE bookings
            SET status = $1
            WHERE id = $2
            RETURNING id, status
        `,[status, bookingId]);
        
        if (result.rowCount === 0) {
            throw new Error('Booking not found')
        }
        return result.rows[0];
    }
}

module.exports = new AdminService();