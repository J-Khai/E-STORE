-- 20 new customers (11-30)
INSERT INTO users (email, password, role, first_name, last_name)
VALUES 
    ('customer11@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Eleven'),
    ('customer12@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Twelve'),
    ('customer13@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Thirteen'),
    ('customer14@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Fourteen'),
    ('customer15@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Fifteen'),
    ('customer16@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Sixteen'),
    ('customer17@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Seventeen'),
    ('customer18@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Eighteen'),
    ('customer19@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Nineteen'),
    ('customer20@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Twenty'),
    ('customer21@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'TwentyOne'),
    ('customer22@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'TwentyTwo'),
    ('customer23@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'TwentyThree'),
    ('customer24@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'TwentyFour'),
    ('customer25@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'TwentyFive'),
    ('customer26@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'TwentySix'),
    ('customer27@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'TwentySeven'),
    ('customer28@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'TwentyEight'),
    ('customer29@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'TwentyNine'),
    ('customer30@example.com', '$2a$10$xyz', 'CUSTOMER', 'Customer', 'Thirty')
ON CONFLICT (email) DO NOTHING;

-- Generate a realistic 6-month order history for ALL customers (1-30)
-- Uses actual product IDs and prices from the catalog
DO $$
DECLARE
    user_id_rec RECORD;
    order_id BIGINT;
    order_date TIMESTAMP;
    orders_per_user INT;
    num_items INT;
    i INT;
    j INT;
    -- Arrays of real product data [id, price, name, brand]
    product_ids INT[] := ARRAY[2,6,7,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26];
    product_prices NUMERIC[] := ARRAY[19.99,49.99,129.99,79.99,1899.99,2499.99,299.99,499.99,799.99,1.99,12.99,8.99,9.99,4.99,1.49,10.99,2.99,14.99,1.29,0.99];
    product_names TEXT[] := ARRAY['Eyeshadow Palette','Calvin Klein CK One','Chanel Coco Noir','Gucci Bloom','Annibale Colombo Bed','Annibale Colombo Sofa','Bedside Table','Conference Chair','Bathroom Sink Mirror','Apple','Beef Steak','Cat Food','Chicken Meat','Cooking Oil','Cucumber','Dog Food','Eggs','Fish Steak','Green Bell Pepper','Green Chili Pepper'];
    product_brands TEXT[] := ARRAY['Essence','Calvin Klein','Chanel','Gucci','Annibale Colombo','Annibale Colombo','Annibale Colombo','Knoll','Generic','Fresh','Farm Fresh','Whiskas','Farm Fresh','Generic','Fresh','Pedigree','Farm Fresh','Ocean Fresh','Fresh','Fresh'];
    rand_prod_idx INT;
    rand_pid INT;
    rand_price NUMERIC;
    rand_name TEXT;
    rand_brand TEXT;
    rand_qty INT;
    line_total NUMERIC;
    order_total NUMERIC;
    rand_days_ago INT;
BEGIN
    FOR user_id_rec IN SELECT id FROM users WHERE email LIKE 'customer%@example.com' LOOP
        -- each customer places between 4 and 12 orders over 6 months
        orders_per_user := 4 + floor(random() * 9)::INT;

        FOR i IN 1..orders_per_user LOOP
            -- random day within the last 182 days (6 months back from Apr 2 2026)
            rand_days_ago := floor(random() * 182)::INT;
            order_date := TIMESTAMP '2026-04-02 23:59:59' - (rand_days_ago || ' days')::INTERVAL
                          - (floor(random() * 86400) || ' seconds')::INTERVAL;

            order_total := 0;

            -- create the order first with a placeholder total
            INSERT INTO orders (created_at, status, total_amount, user_id)
            VALUES (order_date, 'PAID', 0, user_id_rec.id)
            RETURNING id INTO order_id;

            -- add 1-4 random items per order
            num_items := 1 + floor(random() * 4)::INT;
            FOR j IN 1..num_items LOOP
                rand_prod_idx := 1 + floor(random() * array_length(product_ids, 1))::INT;
                -- clamp to array bounds
                IF rand_prod_idx > array_length(product_ids, 1) THEN
                    rand_prod_idx := array_length(product_ids, 1);
                END IF;

                rand_pid   := product_ids[rand_prod_idx];
                rand_price := product_prices[rand_prod_idx];
                rand_name  := product_names[rand_prod_idx];
                rand_brand := product_brands[rand_prod_idx];
                rand_qty   := 1 + floor(random() * 3)::INT;
                line_total := rand_price * rand_qty;
                order_total := order_total + line_total;

                INSERT INTO order_items (price_at_purchase, product_brand, product_id, product_name, quantity, order_id)
                VALUES (rand_price, rand_brand, rand_pid, rand_name, rand_qty, order_id);
            END LOOP;

            -- patch the real total back onto the order
            UPDATE orders SET total_amount = order_total WHERE id = order_id;

        END LOOP;
    END LOOP;
END $$;

SELECT COUNT(*) AS total_orders FROM orders;
SELECT COUNT(*) AS total_customers FROM users WHERE email LIKE 'customer%@example.com';
