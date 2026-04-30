CREATE TABLE IF NOT EXISTS maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    log_type VARCHAR(50) DEFAULT 'maintenance',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    odometer_at_log INTEGER,
    cost NUMERIC,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
