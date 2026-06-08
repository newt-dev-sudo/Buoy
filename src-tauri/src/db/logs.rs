use rusqlite::params;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LogEntry {
    pub id: i64,
    pub bot_id: String,
    pub ts: String,
    pub stream: String,
    pub message: String,
}

pub fn insert(
    conn: &rusqlite::Connection,
    bot_id: &str,
    ts: &str,
    stream: &str,
    message: &str,
) -> Result<i64, rusqlite::Error> {
    conn.execute(
        "INSERT INTO logs (bot_id, ts, stream, message) VALUES (?1, ?2, ?3, ?4)",
        params![bot_id, ts, stream, message],
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn get_recent(
    conn: &rusqlite::Connection,
    bot_id: &str,
    limit: i64,
    cursor: Option<i64>,
) -> Result<Vec<LogEntry>, rusqlite::Error> {
    let sql = if let Some(_c) = cursor {
        "SELECT id, bot_id, ts, stream, message FROM logs
         WHERE bot_id = ?1 AND id < ?2 ORDER BY id DESC LIMIT ?3"
    } else {
        "SELECT id, bot_id, ts, stream, message FROM logs
         WHERE bot_id = ?1 ORDER BY id DESC LIMIT ?2"
    };

    let mut stmt = conn.prepare(sql)?;
    let rows = if let Some(c) = cursor {
        stmt.query_map(params![bot_id, c, limit], |row| {
            Ok(LogEntry {
                id: row.get(0)?,
                bot_id: row.get(1)?,
                ts: row.get(2)?,
                stream: row.get(3)?,
                message: row.get(4)?,
            })
        })?.collect::<Result<Vec<_>, _>>()?
    } else {
        stmt.query_map(params![bot_id, limit], |row| {
            Ok(LogEntry {
                id: row.get(0)?,
                bot_id: row.get(1)?,
                ts: row.get(2)?,
                stream: row.get(3)?,
                message: row.get(4)?,
            })
        })?.collect::<Result<Vec<_>, _>>()?
    };
    Ok(rows)
}

#[allow(dead_code)]
pub fn search(
    conn: &rusqlite::Connection,
    bot_id: &str,
    query: &str,
    limit: i64,
) -> Result<Vec<LogEntry>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT l.id, l.bot_id, l.ts, l.stream, l.message FROM logs l
         JOIN logs_fts fts ON l.id = fts.rowid
         WHERE l.bot_id = ?1 AND logs_fts MATCH ?2
         ORDER BY l.ts DESC LIMIT ?3"
    )?;
    let rows = stmt.query_map(params![bot_id, query, limit], |row| {
        Ok(LogEntry {
            id: row.get(0)?,
            bot_id: row.get(1)?,
            ts: row.get(2)?,
            stream: row.get(3)?,
            message: row.get(4)?,
        })
    })?.collect::<Result<Vec<_>, _>>()?;
    Ok(rows)
}

#[allow(dead_code)]
pub fn rotate(
    conn: &rusqlite::Connection,
    bot_id: &str,
    keep: i64,
) -> Result<usize, rusqlite::Error> {
    let deleted = conn.execute(
        "DELETE FROM logs WHERE bot_id = ?1 AND id NOT IN (
            SELECT id FROM logs WHERE bot_id = ?1 ORDER BY ts DESC LIMIT ?2
        )",
        params![bot_id, keep],
    )?;
    Ok(deleted)
}

pub fn clear(conn: &rusqlite::Connection, bot_id: &str) -> Result<usize, rusqlite::Error> {
    conn.execute(
        "DELETE FROM logs WHERE bot_id = ?1",
        params![bot_id],
    )
}
