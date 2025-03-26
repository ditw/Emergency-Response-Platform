/*** queries.js (Queries script for DB interaction) ***/
import pool  from './db.js';

/**
 * Function to get panic requests
 */
export const getPanicRequests = async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM emergencies");
    return result;
  } catch (error) {
    return res.status(500).json({ error: error.message});
  }
};

/**
 * Function to get panic records based on status
 */
export const getPanicRequestsByStatus = async (status, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM emergencies WHERE `status` = ?", [status]);
    return result;
  } catch (error) {
    return res.status(500).json({ error: error.message});
  }
};

/**
 * Function to select panic record based on id
 */
export const getPanicRequestById = async (id, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM emergencies WHERE `id` = ?", [id]);
    return result;
  } catch (error) {
    return res.status(500).json({ error: error.message});
  }
};

/**
 * Function to select a specific panic request field based on id
 */
export const getPanicRequestFieldById = async (id, fieldname, res) => {
  try {
    const [result] = await pool.query("SELECT ?? FROM emergencies WHERE `id` = ?", [fieldname, id]);
    return result;
  } catch (error) {
    return res.status(500).json({ error: error.message});
  }
};

/**
 * Function to store (insert) panic request
 */
export const storePanicRequest = async (data, res) => {
  /**
   * Store the panic details in the relevant storage table
   */
  try {
    const [result] = await pool.query(
      "INSERT INTO emergencies (user_reporter, provider_name, severity, location, details) VALUES (?, ?, ?, ?, ?)",
      [data.user_reporter, data.provider_name, data.severity, data.location, data.details]
    );
    return result;
  } catch (error) {
    return res.status(500).json({ error: error.message});
  }
};

/**
 * Function to update panic request status
 */
export const updatePanicStatus = async (id, status, res) => {
  try {
    /**
     * Prepare the update statement
     */
    const updateQuery = 'UPDATE emergencies SET status = ? WHERE `id` = ? AND `status` = \'active\'';
    /**
     * Check if panic record exists
     */
    const [rows] = await getPanicRequestById(id);
    /**
     * Request (record) not found
     */
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Panic request not found!' });
    }
  
    /**
     * Status error
     */
    const currentStatus = rows.status;
    if (currentStatus !== 'active') {
      return res.status(406).json({ error: 'Status cannot be updated if it\'s not currently active!'});
    }
  
    const [result] = await pool.query(updateQuery, [status, id]);
    return result;
  } catch (error) {
    return res.status(500).json({ error: error.message});
  }
};