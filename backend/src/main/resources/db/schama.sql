--# 🗄️ KhojDu Database Design

--## 📋 Database Schema Overview

--The KhojDu platform requires a comprehensive database design to handle users, properties, bookings, reviews, complaints, and analytics. Here's the complete schema design:

--## 🏗️ Core Entities

---### 1. **users** table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('TENANT', 'LANDLORD', 'ADMIN')),
    profile_image_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    date_of_birth DATE,
    occupation VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

--### 2. **user_profiles** table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    preferred_location VARCHAR(255),
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    preferred_property_type VARCHAR(20) CHECK (preferred_property_type IN ('ROOM', 'FLAT', 'HOUSE', 'APARTMENT')),
    family_size INTEGER DEFAULT 1,
    has_pets BOOLEAN DEFAULT FALSE,
    smoking_allowed BOOLEAN DEFAULT FALSE,
    drinking_allowed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ### 3. **landlord_verifications** table
CREATE TABLE landlord_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    citizenship_number VARCHAR(50),
    citizenship_front_image VARCHAR(500),
    citizenship_back_image VARCHAR(500),
    verification_status VARCHAR(20) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    verified_by UUID REFERENCES users(id),
    verification_notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

-- ### 4. **properties** table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('ROOM', 'FLAT', 'HOUSE', 'APARTMENT')),
    landlord_id UUID NOT NULL REFERENCES users(id),

    -- Location details
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    ward_number INTEGER,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Property details
    monthly_rent DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2),
    bedrooms INTEGER DEFAULT 1,
    bathrooms INTEGER DEFAULT 1,
    total_area INTEGER, -- in sq ft
    floor_number INTEGER,
    total_floors INTEGER,

    -- Property features
    is_furnished BOOLEAN DEFAULT FALSE,
    parking_available BOOLEAN DEFAULT FALSE,
    internet_included BOOLEAN DEFAULT FALSE,
    utilities_included BOOLEAN DEFAULT FALSE,
    pets_allowed BOOLEAN DEFAULT FALSE,
    smoking_allowed BOOLEAN DEFAULT FALSE,

    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    available_from DATE,

    -- Status
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'INACTIVE')),
    is_featured BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Search optimization
    search_vector TSVECTOR
);

CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_rent ON properties(monthly_rent);
CREATE INDEX idx_properties_available ON properties(is_available);
CREATE INDEX idx_properties_landlord ON properties(landlord_id);
CREATE INDEX idx_properties_search ON properties USING GIN(search_vector);
CREATE INDEX idx_properties_location ON properties(latitude, longitude);

-- ### 5. **property_images** table
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_property_images_property ON property_images(property_id);

-- ### 6. **amenities** table
CREATE TABLE amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(100),
    category VARCHAR(50) -- 'BASIC', 'LUXURY', 'SAFETY', 'CONNECTIVITY'
);

-- Insert default amenities
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
('Generator Backup', 'zap', 'BASIC');

-- ### 7. **property_amenities** table
CREATE TABLE property_amenities (
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (property_id, amenity_id)
);

-- ### 8. **nearby_places** table
CREATE TABLE nearby_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    place_type VARCHAR(50) NOT NULL, -- 'SCHOOL', 'HOSPITAL', 'MARKET', 'TRANSPORT'
    name VARCHAR(255) NOT NULL,
    distance_meters INTEGER,
    walking_time_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ## 💬 Communication & Reviews

-- ### 9. **inquiries** table
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    tenant_id UUID NOT NULL REFERENCES users(id),
    landlord_id UUID NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    contact_method VARCHAR(20) DEFAULT 'CHAT' CHECK (contact_method IN ('CHAT', 'WHATSAPP', 'PHONE')),
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESPONDED', 'CLOSED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ### 10. **messages** table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ### 11. **reviews** table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    tenant_id UUID NOT NULL REFERENCES users(id),
    landlord_id UUID NOT NULL REFERENCES users(id),

    -- Ratings (1-5 scale)
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    landlord_rating INTEGER CHECK (landlord_rating >= 1 AND landlord_rating <= 5),

    review_text TEXT,
    pros TEXT,
    cons TEXT,

    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    stay_duration_months INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_property ON reviews(property_id);
CREATE INDEX idx_reviews_rating ON reviews(overall_rating);

--n ## 🚨 Complaints & Moderation

-- ### 12. **complaints** table
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complainant_id UUID NOT NULL REFERENCES users(id),
    property_id UUID REFERENCES properties(id),
    landlord_id UUID REFERENCES users(id),
    complaint_type VARCHAR(50) NOT NULL, -- 'FRAUD', 'OVERCHARGING', 'FAKE_LISTING', 'HARASSMENT'
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT[], -- Array of image/document URLs

    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED')),
    priority VARCHAR(10) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),

    assigned_to UUID REFERENCES users(id), -- Admin who handles the complaint
    resolution_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- ## ❤️ User Preferences & Wishlist

--### 13. **wishlists** table
CREATE TABLE wishlists (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, property_id)
);

-- ### 14. **search_preferences** table
CREATE TABLE search_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- "My Dream Apartment"

    -- Search criteria
    property_type VARCHAR(20),
    city VARCHAR(100),
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    min_bedrooms INTEGER,
    max_bedrooms INTEGER,
    amenity_ids UUID[],

    -- Notification settings
    notify_new_matches BOOLEAN DEFAULT TRUE,
    notify_price_drops BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ## 📊 Analytics & Tracking

-- ### 15. **property_views** table
CREATE TABLE property_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    user_id UUID REFERENCES users(id), -- NULL for anonymous users
    user_ip VARCHAR(45),
    user_agent TEXT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_property_views_property ON property_views(property_id);
CREATE INDEX idx_property_views_date ON property_views(viewed_at);

-- ### 16. **notifications** table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'NEW_MATCH', 'PRICE_DROP', 'INQUIRY_RECEIVED', 'REVIEW_RECEIVED'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data for the notification

    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE, -- For push notifications

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ## 🔧 System Configuration

-- ### 17. **app_settings** table
CREATE TABLE app_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

-- Insert default settings
INSERT INTO app_settings (key, value, description) VALUES
('max_property_images', '10', 'Maximum images per property'),
('review_moderation', 'true', 'Enable review moderation'),
('auto_approve_verified_landlords', 'true', 'Auto-approve listings from verified landlords'),
('featured_property_price', '500', 'Price for featuring a property (NPR)');

-- ## 🔍 Indexes for Performance

-- Additional performance indexes
CREATE INDEX idx_properties_created_at ON properties(created_at);
CREATE INDEX idx_properties_featured ON properties(is_featured) WHERE is_featured = true;
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_messages_inquiry ON messages(inquiry_id);
CREATE INDEX idx_complaints_status ON complaints(status);

-- Composite indexes for common queries
CREATE INDEX idx_properties_type_city_rent ON properties(property_type, city, monthly_rent);
CREATE INDEX idx_properties_available_featured ON properties(is_available, is_featured);

-- ## 🔄 Database Functions & Triggers

-- ### Update search vector for full-text search
CREATE OR REPLACE FUNCTION update_property_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.address, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_property_search_vector
    BEFORE INSERT OR UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_property_search_vector();

-- ### Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ## 📈 Views for Analytics

-- ### Property statistics view
CREATE VIEW property_stats AS
SELECT
    p.id,
    p.title,
    p.monthly_rent,
    COUNT(pv.id) as view_count,
    COUNT(r.id) as review_count,
    AVG(r.overall_rating) as avg_rating,
    COUNT(w.user_id) as wishlist_count
FROM properties p
LEFT JOIN property_views pv ON p.id = pv.property_id
LEFT JOIN reviews r ON p.id = r.property_id
LEFT JOIN wishlists w ON p.id = w.property_id
GROUP BY p.id, p.title, p.monthly_rent;

-- ### Landlord performance view
CREATE VIEW landlord_performance AS
SELECT
    u.id,
    u.full_name,
    COUNT(p.id) as total_properties,
    COUNT(CASE WHEN p.is_available = true THEN 1 END) as available_properties,
    AVG(r.landlord_rating) as avg_landlord_rating,
    COUNT(r.id) as total_reviews,
    COUNT(c.id) as total_complaints
FROM users u
LEFT JOIN properties p ON u.id = p.landlord_id
LEFT JOIN reviews r ON u.id = r.landlord_id
LEFT JOIN complaints c ON u.id = c.landlord_id
WHERE u.role = 'LANDLORD'
GROUP BY u.id, u.full_name;

--## 🎯 Database Design Summary

-- This database design provides:
--
-- 1. **Complete user management** with roles and verification
-- 2. **Rich property data** with location, amenities, and media
-- 3. **Communication system** for tenant-landlord interaction
-- 4. **Review and rating system** for transparency
-- 5. **Complaint handling** for platform moderation
-- 6. **Analytics tracking** for business insights
-- 7. **Search optimization** with full-text search
-- 8. **Notification system** for user engagement
--
-- The schema is designed to be scalable, with proper indexing for performance and referential integrity for data consistency.