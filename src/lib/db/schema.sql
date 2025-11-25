CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  auth0_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'free', -- 'free', 'premium', 'vip', 'developer'
  usage_count INTEGER DEFAULT 0,
  is_suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS generated_posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  input_url TEXT,
  input_text TEXT,
  purpose TEXT,
  titles JSONB, -- Array of strings
  headlines JSONB, -- Array of strings
  suggestions TEXT,
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
