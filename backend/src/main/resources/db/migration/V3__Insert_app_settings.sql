-- Insert default app settings

INSERT INTO app_settings (key, value, description) VALUES
    ('max_property_images', '10', 'Maximum images per property'),
    ('review_moderation', 'true', 'Enable review moderation'),
    ('auto_approve_verified_landlords', 'true', 'Auto-approve listings from verified landlords'),
    ('featured_property_price', '500', 'Price for featuring a property (NPR)'),
    ('max_file_size_mb', '10', 'Maximum file size in MB'),
    ('supported_image_types', 'jpeg,jpg,png,webp', 'Supported image file types'),
    ('min_password_length', '8', 'Minimum password length'),
    ('session_timeout_minutes', '60', 'Session timeout in minutes')
ON CONFLICT (key) DO NOTHING;
