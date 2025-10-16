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

// ✅ Checkpoint save karo (offline bhi hoga) - Only if not already exists
export const saveCheckpoint = (checkpoint) => {
  db.transaction(tx => {
    // First check if checkpoint already exists for this event
    tx.executeSql(
      `SELECT COUNT(*) as count FROM checkpoints WHERE checkpoint_id = ? AND event_id = ?`,
      [checkpoint.checkpoint_id, checkpoint.event_id],
      (txObj, result) => {
        const count = result.rows.item(0).count;
        if (count === 0) {
          // Checkpoint doesn't exist, insert new record
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
        } else {
          console.log(`🔄 [saveCheckpoint] Checkpoint "${checkpoint.checkpoint_id}" already exists in database - skipping insert`);
        }
      }
    );
  });
};

// ✅ Pending (unsynced) checkpoints fetch karo
export const getPendingCheckpoints = (callback) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM checkpoints WHERE synced = 0`,
        [],
        (txObj, { rows }) => {
          // Convert SQLite result set to array
          const _array = [];
          for (let i = 0; i < rows.length; i++) {
            _array.push(rows.item(i));
          }
          
          if (callback) {
            callback(_array);
          }
          resolve(_array);
        },
        (_, error) => {
          console.error("Error fetching pending checkpoints:", error);
          if (callback) {
            callback([]);
          }
          resolve([]);
        }
      );
    });
  });
};

// ✅ Checkpoint ko synced mark karo - updated to work with event_id and checkpoint_id
export const markSynced = (id, event_id = null, checkpoint_id = null) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      if (event_id && checkpoint_id) {
        // If event_id and checkpoint_id are provided, use those for more specific targeting
        tx.executeSql(
          `UPDATE checkpoints SET synced = 1 WHERE event_id = ? AND checkpoint_id = ?`,
          [event_id, checkpoint_id],
          (_, { rowsAffected }) => {
            const isSuccess = rowsAffected > 0;
            console.log(`🔄 Event ID "${event_id}" Checkpoint "${checkpoint_id}" synced & save to DB updated: ${isSuccess ? 'Success' : 'Failed'}`);
            resolve(isSuccess);
          },
          (_, error) => {
            console.error(`🔴 Checkpoint Update error for checkpoint "${checkpoint_id}":`, error);
            reject(error);
          }
        );
      } else {
        // Fallback to the original behavior using just id
        tx.executeSql(
          `UPDATE checkpoints SET synced = 1 WHERE id = ?`, 
          [id],
          (_, { rowsAffected }) => {
            const isSuccess = rowsAffected > 0;
            console.log(`🔄 [saveCheckpoint] id "${id}" updated: ${isSuccess ? 'Success' : 'Failed'}`);
            resolve(isSuccess);
          },
          (_, error) => {
            console.error(`🔴 [saveCheckpoint] Update error for id "${id}":`, error);
            reject(error);
          }
        );
      }
    });
  });
};

// ✅ Checkpoint update karo (by checkpoint_id)
export const updateCheckpoint = (checkpoint) => {
  db.transaction(tx => {
    tx.executeSql(
      `UPDATE checkpoints SET 
        event_id = ?, category_id = ?, checkpoint_name = ?, checkpoint_point = ?, latitude = ?, longitude = ?, 
        sequence_number = ?, description = ?, synced = ?, time_stamp = ?, status = ?
      WHERE checkpoint_id = ? AND event_id = ?`,
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
        checkpoint.time_stamp || '',
        checkpoint.status || 'not completed',
        checkpoint.checkpoint_id,
        checkpoint.event_id
      ]
    );
  });
  console.log(`🔄 [saveCheckpoint] update checkpoint data "${checkpoint}"`);
};

// ✅ Fetch checkpoint by checkpoint_id
export const getCheckpointById = (checkpoint_id, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM checkpoints WHERE checkpoint_id = ?`,
      [checkpoint_id],
      (txObj, { rows: { _array } }) => callback(_array && _array.length > 0 ? _array[0] : null)
    );
  });
};

// ✅ Get all completed checkpoints for a specific event
export const getCompletedCheckpointsForEvent = (event_id, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM checkpoints WHERE event_id = ? AND status = 'completed'`,
      [event_id],
      (txObj, { rows: { _array } }) => callback(_array || [])
    );
  });
};

// ✅ Check synced status for a specific checkpoint in an event
export const checkSyncStatus = (event_id, checkpoint_id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT synced, checkpoint_name FROM checkpoints WHERE event_id = ? AND checkpoint_id = ?`,
        [event_id, checkpoint_id],
        (_, { rows }) => {
          if (rows.length > 0) {
            const checkpoint = rows.item(0);
            const syncStatus = checkpoint.synced === 1 ? 'Synced' : 'Not Synced';
            console.log(`🔍 Checkpoint Name "${checkpoint.checkpoint_name}" (ID: ${checkpoint_id}) in Event ID ${event_id} - Sync Status: ${syncStatus}`);
            resolve({ 
              syncStatus: syncStatus, 
              synced: checkpoint.synced === 1,
              checkpoint: checkpoint
            });
          } else {
            console.log(`⚠️ Checkpoint ID "${checkpoint_id}" in Event ${event_id} not found`);
            resolve(null);
          }
        },
        (_, error) => {
          console.error(`🔴 Error checking sync status for checkpoint "${checkpoint_id}":`, error);
          reject(error);
        }
      );
    });
  });
};

