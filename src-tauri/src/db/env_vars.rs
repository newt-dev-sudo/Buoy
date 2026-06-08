use rusqlite::{params, OptionalExtension};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EnvVar {
    pub id: String,
    pub bot_id: String,
    pub key: String,
    pub value_enc: Vec<u8>,
    pub nonce: Vec<u8>,
}

pub fn set(
    conn: &rusqlite::Connection,
    bot_id: &str,
    key: &str,
    value_enc: &[u8],
    nonce: &[u8],
) -> Result<usize, rusqlite::Error> {
    let id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO env_vars (id, bot_id, key, value_enc, nonce)
         VALUES (?1, ?2, ?3, ?4, ?5)
         ON CONFLICT(bot_id, key) DO UPDATE SET value_enc = excluded.value_enc, nonce = excluded.nonce",
        params![id, bot_id, key, value_enc, nonce],
    )
}

#[allow(dead_code)]
pub fn get(
    conn: &rusqlite::Connection,
    bot_id: &str,
    key: &str,
) -> Result<Option<EnvVar>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, bot_id, key, value_enc, nonce FROM env_vars WHERE bot_id = ?1 AND key = ?2"
    )?;
    stmt.query_row([bot_id, key], |row| {
        Ok(EnvVar {
            id: row.get(0)?,
            bot_id: row.get(1)?,
            key: row.get(2)?,
            value_enc: row.get(3)?,
            nonce: row.get(4)?,
        })
    }).optional()
}

pub fn list(
    conn: &rusqlite::Connection,
    bot_id: &str,
) -> Result<Vec<EnvVar>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, bot_id, key, value_enc, nonce FROM env_vars WHERE bot_id = ?1"
    )?;
    let rows = stmt.query_map([bot_id], |row| {
        Ok(EnvVar {
            id: row.get(0)?,
            bot_id: row.get(1)?,
            key: row.get(2)?,
            value_enc: row.get(3)?,
            nonce: row.get(4)?,
        })
    })?.collect::<Result<Vec<_>, _>>()?;
    Ok(rows)
}

pub fn delete(
    conn: &rusqlite::Connection,
    bot_id: &str,
    key: &str,
) -> Result<usize, rusqlite::Error> {
    conn.execute(
        "DELETE FROM env_vars WHERE bot_id = ?1 AND key = ?2",
        params![bot_id, key],
    )
}
