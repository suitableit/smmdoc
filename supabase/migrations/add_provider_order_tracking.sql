-- Add provider order tracking columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS provider_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS provider_id INTEGER REFERENCES providers(id),
ADD COLUMN IF NOT EXISTS provider_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS provider_charge DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS provider_start_count INTEGER,
ADD COLUMN IF NOT EXISTS provider_remains INTEGER,
ADD COLUMN IF NOT EXISTS provider_currency VARCHAR(10) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS is_provider_order BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS provider_sync_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS provider_error_message TEXT;

-- Create index for provider order queries
CREATE INDEX IF NOT EXISTS idx_orders_provider_order_id ON orders(provider_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider_id ON orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_is_provider_order ON orders(is_provider_order);
CREATE INDEX IF NOT EXISTS idx_orders_provider_status ON orders(provider_status);

-- Create provider_order_logs table for tracking provider communications
CREATE TABLE IF NOT EXISTS provider_order_logs (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES providers(id),
    action VARCHAR(50) NOT NULL, -- 'create', 'status_check', 'sync'
    request_data JSONB,
    response_data JSONB,
    status VARCHAR(20) DEFAULT 'success', -- 'success', 'error'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for provider logs
CREATE INDEX IF NOT EXISTS idx_provider_order_logs_order_id ON provider_order_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_provider_order_logs_provider_id ON provider_order_logs(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_order_logs_action ON provider_order_logs(action);
CREATE INDEX IF NOT EXISTS idx_provider_order_logs_created_at ON provider_order_logs(created_at);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON provider_order_logs TO authenticated;
GRANT USAGE ON SEQUENCE provider_order_logs_id_seq TO authenticated;

-- Update RLS policies for orders table (if RLS is enabled)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'orders' AND n.nspname = 'public' 
        AND c.relrowsecurity = true
    ) THEN
        -- Create policy for provider order logs
        DROP POLICY IF EXISTS "Users can view their provider order logs" ON provider_order_logs;
        CREATE POLICY "Users can view their provider order logs" ON provider_order_logs
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM orders o 
                    WHERE o.id = provider_order_logs.order_id 
                    AND o.user_id = auth.uid()
                )
            );
        
        -- Allow admins to access all provider logs
        DROP POLICY IF EXISTS "Admins can manage all provider order logs" ON provider_order_logs;
        CREATE POLICY "Admins can manage all provider order logs" ON provider_order_logs
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users u 
                    WHERE u.id = auth.uid() 
                    AND u.role = 'admin'
                )
            );
    END IF;
END $$;

-- Enable RLS on provider_order_logs table
ALTER TABLE provider_order_logs ENABLE ROW LEVEL SECURITY;

-- Create function to automatically update provider sync timestamp
CREATE OR REPLACE FUNCTION update_provider_sync_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.provider_status IS DISTINCT FROM NEW.provider_status THEN
        NEW.provider_sync_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp update
DROP TRIGGER IF EXISTS trigger_update_provider_sync_timestamp ON orders;
CREATE TRIGGER trigger_update_provider_sync_timestamp
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_sync_timestamp();

-- Create function to log provider communications
CREATE OR REPLACE FUNCTION log_provider_communication(
    p_order_id INTEGER,
    p_provider_id INTEGER,
    p_action VARCHAR(50),
    p_request_data JSONB DEFAULT NULL,
    p_response_data JSONB DEFAULT NULL,
    p_status VARCHAR(20) DEFAULT 'success',
    p_error_message TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    log_id INTEGER;
BEGIN
    INSERT INTO provider_order_logs (
        order_id, provider_id, action, request_data, 
        response_data, status, error_message
    ) VALUES (
        p_order_id, p_provider_id, p_action, p_request_data,
        p_response_data, p_status, p_error_message
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Create view for provider order statistics
CREATE OR REPLACE VIEW provider_order_stats AS
SELECT 
    p.id as provider_id,
    p.name as provider_name,
    COUNT(o.id) as total_orders,
    COUNT(CASE WHEN o.provider_status = 'pending' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN o.provider_status = 'processing' THEN 1 END) as processing_orders,
    COUNT(CASE WHEN o.provider_status = 'completed' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN o.provider_status = 'failed' THEN 1 END) as failed_orders,
    SUM(o.provider_charge) as total_provider_cost,
    AVG(o.provider_charge) as avg_provider_cost,
    MAX(o.provider_sync_at) as last_sync_at
FROM providers p
LEFT JOIN orders o ON p.id = o.provider_id AND o.is_provider_order = true
GROUP BY p.id, p.name;

-- Grant access to the view
GRANT SELECT ON provider_order_stats TO authenticated;

COMMIT;