-- Initial database schema for KhojDu

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table
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

-- User profiles table
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

-- Landlord verifications table
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

-- Properties table
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

-- Property images table
CREATE TABLE property_images (
                                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
                                 image_url VARCHAR(500) NOT NULL,
                                 alt_text VARCHAR(255),
                                 is_primary BOOLEAN DEFAULT FALSE,
                                 display_order INTEGER DEFAULT 0,
                                 uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Amenities table
CREATE TABLE amenities (
                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           name VARCHAR(100) NOT NULL UNIQUE,
                           icon VARCHAR(100),
                           category VARCHAR(50)
);

-- Property amenities junction table
CREATE TABLE property_amenities (
                                    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
                                    amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE,
                                    PRIMARY KEY (property_id, amenity_id)
);

-- Nearby places table
CREATE TABLE nearby_places (
                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
                               place_type VARCHAR(50) NOT NULL,
                               name VARCHAR(255) NOT NULL,
                               distance_meters INTEGER,
                               walking_time_minutes INTEGER,
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inquiries table
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

-- Messages table
CREATE TABLE messages (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
                          sender_id UUID NOT NULL REFERENCES users(id),
                          message TEXT NOT NULL,
                          is_read BOOLEAN DEFAULT FALSE,
                          sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
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

-- Complaints table
CREATE TABLE complaints (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            complainant_id UUID NOT NULL REFERENCES users(id),
                            property_id UUID REFERENCES properties(id),
                            landlord_id UUID REFERENCES users(id),
                            complaint_type VARCHAR(50) NOT NULL,
                            subject VARCHAR(255) NOT NULL,
                            description TEXT NOT NULL,

                            status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED')),
                            priority VARCHAR(10) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),

                            assigned_to UUID REFERENCES users(id),
                            resolution_notes TEXT,

                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            resolved_at TIMESTAMP
);
CREATE TABLE complaint_evidence (
                                    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
                                    evidence_url VARCHAR(500) NOT NULL
);

CREATE INDEX idx_complaint_evidence_complaint ON complaint_evidence(complaint_id);

-- Complaint evidence table
CREATE TABLE complaint_evidence (
                                    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
                                    evidence_url VARCHAR(500) NOT NULL
);

-- Wishlists table
CREATE TABLE wishlists (
                           user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                           property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
                           added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           PRIMARY KEY (user_id, property_id)
);

-- Search preferences table
CREATE TABLE search_preferences (
                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                    name VARCHAR(100) NOT NULL,

    -- Search criteria
                                    property_type VARCHAR(20),
                                    city VARCHAR(100),
                                    min_price DECIMAL(10,2),
                                    max_price DECIMAL(10,2),
                                    min_bedrooms INTEGER,
                                    max_bedrooms INTEGER,

    -- Notification settings
                                    notify_new_matches BOOLEAN DEFAULT TRUE,
                                    notify_price_drops BOOLEAN DEFAULT TRUE,

                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Search preference amenities table
CREATE TABLE search_preference_amenities (
                                             search_preference_id UUID REFERENCES search_preferences(id) ON DELETE CASCADE,
                                             amenity_id UUID NOT NULL
);

-- Property views table
CREATE TABLE property_views (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                property_id UUID NOT NULL REFERENCES properties(id),
                                user_id UUID REFERENCES users(id),
                                user_ip VARCHAR(45),
                                user_agent TEXT,
                                viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                               type VARCHAR(50) NOT NULL,
                               title VARCHAR(255) NOT NULL,
                               message TEXT NOT NULL,

                               is_read BOOLEAN DEFAULT FALSE,
                               is_sent BOOLEAN DEFAULT FALSE,

                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               read_at TIMESTAMP
);

-- Notification data table
CREATE TABLE notification_data (
                                   notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
                                   data_key VARCHAR(100) NOT NULL,
                                   data_value TEXT NOT NULL
);

-- App settings table
CREATE TABLE app_settings (
                              key VARCHAR(100) PRIMARY KEY,
                              value TEXT NOT NULL,
                              description TEXT,
                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              updated_by UUID REFERENCES users(id)
);
