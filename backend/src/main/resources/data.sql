INSERT INTO users (email, password, first_name, last_name, role)
VALUES ('admin@estore.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password, first_name, last_name, role)
VALUES ('customer@estore.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Customer', 'User', 'CUSTOMER')
ON CONFLICT (email) DO NOTHING;
