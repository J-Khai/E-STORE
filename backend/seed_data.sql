-- Insert 10 customers
INSERT INTO users (email, password, role, first_name, last_name)
VALUES 
    ('customer1@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'One'),
    ('customer2@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Two'),
    ('customer3@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Three'),
    ('customer4@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Four'),
    ('customer5@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Five'),
    ('customer6@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Six'),
    ('customer7@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Seven'),
    ('customer8@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Eight'),
    ('customer9@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Nine'),
    ('customer10@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Ten')
ON CONFLICT (email) DO NOTHING;

-- Insert orders spread out over the last 30 days
-- Products chosen randomly assuming ID 1-5 exist
DO $$
DECLARE
    user_id_rec RECORD;
    order_id INT;
    random_days INT;
    order_date TIMESTAMP;
    random_total DECIMAL;
BEGIN
    FOR user_id_rec IN SELECT id FROM users WHERE email LIKE 'customer%@example.com' LOOP
        -- Generate 2-3 orders per user
        FOR i IN 1..3 LOOP
            random_days := floor(random() * 30);
            order_date := NOW() - (random_days || ' days')::interval;
            random_total := floor(random() * 200) + 50.99; -- Random total between 50 and 250
            
            INSERT INTO orders (created_at, status, total_amount, user_id)
            VALUES (order_date, 'PAID', random_total, user_id_rec.id)
            RETURNING id INTO order_id;
            
            -- Insert 1 item per order
            INSERT INTO order_items (price_at_purchase, product_brand, product_id, product_name, quantity, order_id)
            VALUES (random_total, 'Generic Brand', 1, 'Simulated Product', 1, order_id);
            
            -- Some days might get more sales
            IF random() > 0.5 THEN
                INSERT INTO orders (created_at, status, total_amount, user_id)
                VALUES (order_date - interval '2 hours', 'PAID', random_total * 0.8, user_id_rec.id)
                RETURNING id INTO order_id;
                
                INSERT INTO order_items (price_at_purchase, product_brand, product_id, product_name, quantity, order_id)
                VALUES (random_total * 0.8, 'Standard Brand', 2, 'Another Simulated Product', 2, order_id);
            END IF;
        END LOOP;
    END LOOP;
END $$;
