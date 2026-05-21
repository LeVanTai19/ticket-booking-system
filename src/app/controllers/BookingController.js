const BookingService = require('../services/BookingService');

class BookingController {

    //[Get] /api/v1/concerts
    async getConcerts(req,res){
        try {
            const data = await BookingService.getAllConcerts();
            res.status(200).json({success: true, data: data});
        } catch {
            res.status(500).json({success: false, message: error.message});
        }
    }

    //[Post] /api/v1/bookings
    async createBooking(req, res) {
        try{
            //Vì em giảm lược phần login nên sẽ tạm fix cứng userId
            const userId = req.headers['x-user-id'] || '99999999-9999-9999-9999-999999999999';

            const { idempotencyKey, ticketCategoryId, quantity, voucherId } = req.body;

            //Phải có đủ thông tin ko thì sẽ báo lỗi
            if (!idempotencyKey || !ticketCategoryId || !quantity) {
                return res.status(400).json({ success: false, message: "Missing required fields" });
            }

            //Đẩy xuống service xử lý
            const result = await BookingService.processBooking({
                userId, idempotencyKey, ticketCategoryId, quantity, voucherId
            });

            res.status(200).json({ success: true, message: "Booking successful", data: result });

        } catch (error) {
            //Báo lỗi Duplicate
            if (error.message.includes('Duplicate request')) {
                return res.status(409).json({success: false, message: "This booking request is already processing or completed"});
            }

            //Báo hết vé hoặc voucher
            if (error.message.includes('Not enough tickets available') || error.message.includes('Voucher is invalid or out of stock')) {
                return res.status(400).json({success: false, message: error.messageessage});
            }
            console.error("Debug: ERROR in createBooking:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
}

module.exports = new BookingController();