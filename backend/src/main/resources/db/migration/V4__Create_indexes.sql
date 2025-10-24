-- Create indexes for better performance

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_verified ON users(is_verified);

-- Property indexes
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_district ON properties(district);
CREATE INDEX idx_properties_rent ON properties(monthly_rent);
CREATE INDEX idx_properties_available ON properties(is_available);
CREATE INDEX idx_properties_landlord ON properties(landlord_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_created_at ON properties(created_at);
CREATE INDEX idx_properties_featured ON properties(is_featured) WHERE is_featured = true;
CREATE INDEX idx_properties_location ON properties(latitude, longitude);

-- Composite indexes for common queries
CREATE INDEX idx_properties_type_city_rent ON properties(property_type, city, monthly_rent);
CREATE INDEX idx_properties_available_featured ON properties(is_available, is_featured);
CREATE INDEX idx_properties_status_created ON properties(status, created_at);

-- Property images indexes
CREATE INDEX idx_property_images_property ON property_images(property_id);
CREATE INDEX idx_property_images_primary ON property_images(property_id, is_primary);

-- Reviews indexes
CREATE INDEX idx_reviews_property ON reviews(property_id);
CREATE INDEX idx_reviews_tenant ON reviews(tenant_id);
CREATE INDEX idx_reviews_landlord ON reviews(landlord_id);
CREATE INDEX idx_reviews_rating ON reviews(overall_rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);

-- Inquiries indexes
CREATE INDEX idx_inquiries_property ON inquiries(property_id);
CREATE INDEX idx_inquiries_tenant ON inquiries(tenant_id);
CREATE INDEX idx_inquiries_landlord ON inquiries(landlord_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);

-- Messages indexes
CREATE INDEX idx_messages_inquiry ON messages(inquiry_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);

-- Property views indexes
CREATE INDEX idx_property_views_property ON property_views(property_id);
CREATE INDEX idx_property_views_user ON property_views(user_id);
CREATE INDEX idx_property_views_date ON property_views(viewed_at);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type);

-- Complaints indexes
CREATE INDEX idx_complaints_complainant ON complaints(complainant_id);
CREATE INDEX idx_complaints_landlord ON complaints(landlord_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);

-- Full-text search index
CREATE INDEX idx_properties_search ON properties USING GIN(search_vector);