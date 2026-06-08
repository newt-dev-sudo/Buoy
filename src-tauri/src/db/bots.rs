use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Bot {
    pub id: String,
    pub name: String,
    pub path: String,
    pub runtime: String,
    pub entry_point: String,
    pub args: String,
    pub auto_restart: String,
    pub crash_count: i32,
    pub running: i32,
    pub created_at: String,
    pub updated_at: String,
}

pub fn create(conn: &Connection, bot: &Bot) -> Result<usize, rusqlite::Error> {
    conn.execute(
        "INSERT INTO bots (id, name, path, runtime, entry_point, args, auto_restart, crash_count, running, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        params![
            bot.id, bot.name, bot.path, bot.runtime, bot.entry_point,
            bot.args, bot.auto_restart, bot.crash_count, bot.running, bot.created_at, bot.updated_at
        ],
    )
}

pub fn list(conn: &Connection) -> Result<Vec<Bot>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, name, path, runtime, entry_point, args, auto_restart, crash_count, running, created_at, updated_at
         FROM bots ORDER BY created_at DESC"
    )?;
    let bots = stmt.query_map([], |row| {
        Ok(Bot {
            id: row.get(0)?,
            name: row.get(1)?,
            path: row.get(2)?,
            runtime: row.get(3)?,
            entry_point: row.get(4)?,
            args: row.get(5)?,
            auto_restart: row.get(6)?,
            crash_count: row.get(7)?,
            running: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    })?.collect::<Result<Vec<_>, _>>()?;
    Ok(bots)
}

pub fn get(conn: &Connection, id: &str) -> Result<Option<Bot>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, name, path, runtime, entry_point, args, auto_restart, crash_count, running, created_at, updated_at
         FROM bots WHERE id = ?1"
    )?;
    stmt.query_row([id], |row| {
        Ok(Bot {
            id: row.get(0)?,
            name: row.get(1)?,
            path: row.get(2)?,
            runtime: row.get(3)?,
            entry_point: row.get(4)?,
            args: row.get(5)?,
            auto_restart: row.get(6)?,
            crash_count: row.get(7)?,
            running: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    }).optional()
}

pub fn update(conn: &Connection, id: &str, bot: &Bot) -> Result<usize, rusqlite::Error> {
    conn.execute(
        "UPDATE bots SET name = ?2, path = ?3, runtime = ?4, entry_point = ?5, args = ?6,
         auto_restart = ?7, crash_count = ?8, running = ?9, updated_at = ?10 WHERE id = ?1",
        params![
            id, bot.name, bot.path, bot.runtime, bot.entry_point,
            bot.args, bot.auto_restart, bot.crash_count, bot.running, bot.updated_at
        ],
    )
}

pub fn delete(conn: &Connection, id: &str) -> Result<usize, rusqlite::Error> {
    conn.execute("DELETE FROM bots WHERE id = ?1", [id])
}

pub fn set_running(conn: &Connection, id: &str, running: i32) -> Result<usize, rusqlite::Error> {
    conn.execute(
        "UPDATE bots SET running = ?2, updated_at = ?3 WHERE id = ?1",
        params![id, running, chrono::Utc::now().to_rfc3339()],
    )
}

pub fn get_running(conn: &Connection) -> Result<Vec<Bot>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, name, path, runtime, entry_point, args, auto_restart, crash_count, running, created_at, updated_at
         FROM bots WHERE running = 1 ORDER BY created_at DESC"
    )?;
    let bots = stmt.query_map([], |row| {
        Ok(Bot {
            id: row.get(0)?,
            name: row.get(1)?,
            path: row.get(2)?,
            runtime: row.get(3)?,
            entry_point: row.get(4)?,
            args: row.get(5)?,
            auto_restart: row.get(6)?,
            crash_count: row.get(7)?,
            running: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    })?.collect::<Result<Vec<_>, _>>()?;
    Ok(bots)
}
