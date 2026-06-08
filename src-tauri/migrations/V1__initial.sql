CREATE TABLE IF NOT EXISTS bots (
  id           TEXT    PRIMARY KEY,
  name         TEXT    NOT NULL,
  path         TEXT    NOT NULL,
  runtime      TEXT    NOT NULL CHECK(runtime IN ('node','python','custom')),
  entry_point  TEXT    NOT NULL,
  args         TEXT    NOT NULL DEFAULT '[]',
  auto_restart TEXT    NOT NULL DEFAULT 'never'
               CHECK(auto_restart IN ('never','on_crash','always')),
  crash_count  INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT    NOT NULL,
  updated_at   TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS env_vars (
  id           TEXT PRIMARY KEY,
  bot_id       TEXT NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  key          TEXT NOT NULL,
  value_enc    BLOB NOT NULL,
  nonce        BLOB NOT NULL,
  UNIQUE(bot_id, key)
);

CREATE TABLE IF NOT EXISTS logs (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  bot_id    TEXT    NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  ts        TEXT    NOT NULL,
  stream    TEXT    NOT NULL CHECK(stream IN ('stdout','stderr')),
  message   TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS logs_bot_ts ON logs(bot_id, ts DESC);

CREATE VIRTUAL TABLE IF NOT EXISTS logs_fts USING fts5(
  message, content=logs, content_rowid=id
);

CREATE TABLE IF NOT EXISTS restart_events (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  bot_id    TEXT    NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  reason    TEXT    NOT NULL CHECK(reason IN ('manual','crash','auto')),
  exit_code INTEGER,
  ts        TEXT    NOT NULL
);
