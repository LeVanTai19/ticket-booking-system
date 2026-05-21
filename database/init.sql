DROP TABLE IF EXISTS booking_tickets;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS vouchers;
DROP TABLE IF EXISTS ticket_categories;
DROP TABLE IF EXISTS concerts;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE concerts (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name VARCHAR(255) NOT NULL,
	description TEXT,
	start_time TIMESTAMP NOT NULL,
	status VARCHAR(50) DEFAULT 'PUBLICSHED'
);

CREATE TABLE ticket_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concert_id UUID REFERENCES concerts(id),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total_quantity INT NOT NULL,
    available_quantity INT NOT NULL CHECK (available_quantity >= 0)
);

CREATE TABLE vouchers (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	code VARCHAR(50) UNIQUE NOT NULL,
	discount_amount DECIMAL(10,2) NOT NULL,
	total_quantity INT NOT NULL,
	available_quantity INT NOT NULL CHECK (available_quantity >= 0)
);

CREATE TABLE bookings (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID REFERENCES users(id) DEFAULT '99999999-9999-9999-9999-999999999999',
	idempotency_key VARCHAR (255) UNIQUE NOT NULL,
	total_amount DECIMAL(10,2) NOT NULL,
	voucher_id UUID REFERENCES vouchers(id) NULL,
	status VARCHAR(50) NOT NULL, --'RESERVED', 'COMPLETED', 'FAILED', 'CANCELLED'
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE booking_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    ticket_category_id UUID REFERENCES ticket_categories(id),
    quantity INT NOT NULL,
    price_at_booking DECIMAL(10, 2) NOT NULL
);

-- ===================================================
--                      SEED DATA
INSERT INTO users (id, name, email)
VALUES ('99999999-9999-9999-9999-999999999999', 'Intern chăm chỉ', 'abc123@gmail.com');

INSERT INTO concerts (id, name, description, start_time, status)
VALUES ('11111111-1111-1111-1111-111111111111', 'Son Tung MTP - TP Bank', 'Flash Sale ticket opening', '2026-11-05 10:00:00', 'PUBLISHED');

INSERT INTO ticket_categories (id, concert_id, name, price, total_quantity, available_quantity)
VALUES 
('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'VIP', 500000, 20, 20),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'STANDARD', 200000, 100, 100);

INSERT INTO vouchers (id, code, discount_amount, total_quantity, available_quantity)
VALUES ('33333333-3333-3333-3333-333333333333', 'FLASH50', 50000, 50, 50);

