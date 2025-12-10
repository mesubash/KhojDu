INSERT INTO amenities (name, icon, category) VALUES
    ('WiFi', 'wifi', 'CONNECTIVITY'),
    ('Parking', 'car', 'BASIC'),
    ('Kitchen', 'chef', 'BASIC'),
    ('Laundry', 'washing-machine', 'BASIC'),
    ('Balcony', 'home', 'BASIC'),
    ('Security Guard', 'shield', 'SAFETY'),
    ('CCTV', 'camera', 'SAFETY'),
    ('Gym', 'dumbbell', 'LUXURY'),
    ('Swimming Pool', 'waves', 'LUXURY'),
    ('Generator Backup', 'zap', 'BASIC'),
    ('Air Conditioning', 'wind', 'BASIC'),
    ('Water Tank', 'droplets', 'BASIC'),
    ('Garden', 'trees', 'BASIC'),
    ('Elevator', 'move', 'BASIC'),
    ('Intercom', 'phone', 'SAFETY')
ON CONFLICT (name) DO NOTHING;
