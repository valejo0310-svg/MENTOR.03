CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE clans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  clan_id INTEGER REFERENCES clans(id) ON DELETE SET NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  biography TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_user_role
    CHECK (role IN ('CODER', 'MENTOR')),

  CONSTRAINT coder_requires_clan
    CHECK (role = 'MENTOR' OR clan_id IS NOT NULL)
);

CREATE TABLE mentorship_requests (
  id SERIAL PRIMARY KEY,
  coder_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  topic VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  scheduled_at TIMESTAMPTZ,
  observations TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_request_status
    CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_requests_coder ON mentorship_requests(coder_id);
CREATE INDEX idx_requests_mentor ON mentorship_requests(mentor_id);
CREATE INDEX idx_requests_status ON mentorship_requests(status);

CREATE UNIQUE INDEX unique_active_topic_per_coder
ON mentorship_requests (coder_id, LOWER(topic))
WHERE status IN ('PENDING', 'ACCEPTED');

CREATE TABLE personal_goals (
  id SERIAL PRIMARY KEY,

  user_id INTEGER NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  title VARCHAR(150) NOT NULL,

  description TEXT NOT NULL DEFAULT '',

  due_date DATE NOT NULL,

  completed BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_personal_goals_user_id
ON personal_goals(user_id);

CREATE INDEX idx_personal_goals_due_date
ON personal_goals(due_date);