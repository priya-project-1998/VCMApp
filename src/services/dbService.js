import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'events.db', location: 'default' });

// ✅ Table banane ka function
export const createTables = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS checkpoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT,
        category_id TEXT,
        checkpoint_id TEXT,
        checkpoint_name TEXT,
        checkpoint_point TEXT,
        latitude TEXT,
        longitude TEXT,
        sequence_number TEXT,
        description TEXT,
        synced INTEGER,
        time_stamp TEXT, // new column
        status TEXT // new column
      );`
    );
  });
};

// ✅ Checkpoint save karo (offline bhi hoga)
export const saveCheckpoint = (checkpoint) => {
  db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO checkpoints (
        event_id, category_id, checkpoint_id, checkpoint_name, checkpoint_point, latitude, longitude, sequence_number, description, synced, time_stamp, status
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        checkpoint.event_id,
        checkpoint.category_id,
        checkpoint.checkpoint_id,
        checkpoint.checkpoint_name,
        checkpoint.checkpoint_point,
        checkpoint.latitude,
        checkpoint.longitude,
        checkpoint.sequence_number,
        checkpoint.description,
        0,
        checkpoint.time_stamp || '',
        checkpoint.status || 'not completed'
      ]
    );
  });
};

// ✅ Pending (unsynced) checkpoints fetch karo
export const getPendingCheckpoints = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM checkpoints WHERE synced = 0`,
      [],
      (txObj, { rows: { _array } }) => callback(_array)
    );
  });
};

// ✅ Checkpoint ko synced mark karo
export const markSynced = (id) => {
  db.transaction(tx => {
    tx.executeSql(`UPDATE checkpoints SET synced = 1 WHERE id = ?`, [id]);
  });
};

// ✅ Checkpoint update karo (by checkpoint_id)
export const updateCheckpoint = (checkpoint) => {
  db.transaction(tx => {
    tx.executeSql(
      `UPDATE checkpoints SET 
        event_id = ?, category_id = ?, checkpoint_name = ?, checkpoint_point = ?, latitude = ?, longitude = ?, sequence_number = ?, description = ?, synced = ?
      WHERE checkpoint_id = ?`,
      [
        checkpoint.event_id,
        checkpoint.category_id,
        checkpoint.checkpoint_name,
        checkpoint.checkpoint_point,
        checkpoint.latitude,
        checkpoint.longitude,
        checkpoint.sequence_number,
        checkpoint.description,
        checkpoint.synced || 0,
        checkpoint.checkpoint_id
      ]
    );
  });
};
