-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Create role_has_permissions table
CREATE TABLE IF NOT EXISTS role_has_permissions (
    permission_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (permission_id, role_id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Create model_has_roles table (morph equivalent for users)
CREATE TABLE IF NOT EXISTS model_has_roles (
    role_id BIGINT NOT NULL,
    model_type VARCHAR(255) NOT NULL,
    model_id INT NOT NULL,
    PRIMARY KEY (role_id, model_id, model_type),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin role
INSERT IGNORE INTO roles (name) VALUES ('admin');

-- Migrate existing users that have role='admin' to the model_has_roles table
INSERT IGNORE INTO model_has_roles (role_id, model_type, model_id)
SELECT r.id, 'User', u.id 
FROM users u
JOIN roles r ON r.name = 'admin'
WHERE u.role = 'admin';
