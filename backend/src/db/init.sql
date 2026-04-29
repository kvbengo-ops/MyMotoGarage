-- Database initialization script for Digital Garage

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    category VARCHAR(100),
    odometer INTEGER DEFAULT 0,
    nickname VARCHAR(100),
    image_url VARCHAR(255),
    status VARCHAR(50) DEFAULT 'needsSetup',
    last_oil_change_date DATE,
    oil_interval INTEGER,
    chain_cleaning_interval INTEGER,
    tire_age_months INTEGER,
    tire_lifespan_months INTEGER,
    engine_displacement INTEGER,
    weight INTEGER,
    fuel_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert a dummy user for testing
INSERT INTO users (id, email, name)
VALUES ('00000000-0000-0000-0000-000000000000', 'testrider@digitalgarage.com', 'Test Rider')
ON CONFLICT (email) DO NOTHING;
