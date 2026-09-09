ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number varchar(32);
UPDATE orders SET order_number = 'RR-' || LPAD(id::text, 6, '0') WHERE order_number IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_key ON orders(order_number);
