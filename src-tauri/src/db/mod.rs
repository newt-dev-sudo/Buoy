pub mod bots;
pub mod env_vars;
pub mod logs;
pub mod schema;
pub mod settings;

use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::Mutex;

pub struct DbState {
    pub conn: Mutex<Connection>,
}

pub fn init_db(app_dir: &PathBuf) -> Result<DbState, Box<dyn std::error::Error>> {
    let db_path = app_dir.join("buoy.db");
    let mut conn = Connection::open(&db_path)?;
    schema::run_migrations(&mut conn)?;
    Ok(DbState {
        conn: Mutex::new(conn),
    })
}
