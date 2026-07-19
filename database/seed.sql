INSERT INTO clans (name)
VALUES
  ('Magdalena'),
  ('Cayena'),
  ('Micaela'),
  ('Esthercita')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (
  clan_id,
  first_name,
  last_name,
  email,
  password_hash,
  role,
  biography
)
VALUES (
  (SELECT id FROM clans WHERE name = 'Magdalena'),
  'Alex',
  'Coder',
  'coder@mentor.test',
  crypt('123456', gen_salt('bf', 10)),
  'CODER',
  'Coder que quiere reforzar JavaScript y PostgreSQL con algo de APIs.'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (
  clan_id,
  first_name,
  last_name,
  email,
  password_hash,
  role,
  biography
)
VALUES (
  NULL,
  'María',
  'Mentora',
  'mentor@mentor.test',
  crypt('123456', gen_salt('bf', 10)),
  'MENTOR',
  'Mentora de JavaScript, Express y bases de datos.'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO mentorship_requests (
  coder_id,
  topic,
  description,
  status
)
SELECT
  coder.id,
  'JavaScript Vanilla',
  'Necesito comprender mejor los eventos del DOM y fetch y el funcionamiento del SPA.',
  'PENDING'
FROM users coder
WHERE coder.email = 'coder@mentor.test'
  AND NOT EXISTS (
    SELECT 1
    FROM mentorship_requests request
    WHERE request.coder_id = coder.id
      AND request.topic = 'JavaScript Vanilla'
  );
