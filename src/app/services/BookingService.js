const db = require('../../config/db');

class BookingService {

    //Lấy danh sách concerts
    async getAllConcerts() {
        const result = await db.query(`
             SELECT c.id as concert_id, c.name as concert_name, c.start_time,
                   t.id as ticket_id, t.name as ticket_name, t.price, t.available_quantity
            FROM concerts c
            JOIN ticket_categories t ON c.id = t.concert_id
            WHERE c.status = 'PUBLISHED'
        `);
        return result.rows;
    }

    //Xử lý đặt vé transaction và locking
    async processBooking ({userId, idempotencyKey, ticketCategoryId, quantity, voucherId}) {

        //Kiểm tra idempotency key
        const checkExist = await db.query ('SELECT id FROM bookings WHERE idempotency_key = $1', [idempotencyKey]);
        if (checkExist.rows.length > 0) {
            throw new Error ('Duplicate request'); //Controller sẽ bắt cái message này
        }

        const client = await db.getPool().connect();
        try {
            await client.query('BEGIN'); //mở transaction

            let discountAmount = 0;

            //xử lý voucher, user có thể chọn hoặc ko 
            if (voucherId) {
                const voucherRes = await client.query(`
                    UPDATE vouchers
                    SET available_quantity = available_quantity - 1
                    WHERE id = $1 AND available_quantity >= 1
                    RETURNING discount_amount
                `, [voucherId]);

                if (voucherRes.rowCount === 0) {
                    throw new Error('Voucher is invalid or out of stock');
                }

                discountAmount = voucherRes.rows[0].discount_amount;
            }

            //xử lý trừ vé
            const ticketRes = await client.query(`
                UPDATE ticket_categories
                SET available_quantity = available_quantity - $1
                WHERE id = $2 AND available_quantity >= $1
                RETURNING price
            `, [quantity, ticketCategoryId]);

            if (ticketRes.rowCount === 0) {
                throw new Error('Not enough tickets available')
            }

            //tính tổng tiền phải trả
            const ticketPrice = ticketRes.rows[0].price;
            let totalAmount = (ticketPrice * quantity) - discountAmount;
            if (totalAmount < 0) {
                totalAmount = 0;
            }

            //tạo booking
            const bookingRes = await client.query(`
                INSERT INTO bookings (user_id, idempotency_key, total_amount, voucher_id, status)
                VALUES ($1, $2, $3, $4, 'RESERVED')
                RETURNING id
            `, [userId, idempotencyKey, totalAmount, voucherId || null]);
            const bookingId = bookingRes.rows[0].id;

            //tạo chi tiết booking
            await client.query(`
                INSERT INTO booking_tickets (booking_id, ticket_category_id, quantity, price_at_booking)
                VALUES ($1, $2, $3, $4)
            `, [bookingId, ticketCategoryId, quantity, ticketPrice]);

            await client.query('COMMIT'); //Tất cả thành công và lưu và DB
            return {bookingId, status: 'RESERVED'};

        } catch (error) {
            await client.query('ROLLBACK'); //Bắt được lỗi thì hoàn tác toàn bộ, trả lại vé
            throw error;
        } finally {
            client.release();
        }

    }
}

module.exports = new BookingService();