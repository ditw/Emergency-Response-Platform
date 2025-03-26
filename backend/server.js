/*** server.js (Node.js Backend with MySQL) ***/
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerConfig.cjs';
import pool  from './src/db.js';
import { getPanicRequests, getPanicRequestsByStatus, getPanicRequestById, updatePanicStatus, storePanicRequest, getPanicRequestFieldById } from './src/queries.js';
import { verifySWebHookSignature, verifyApiKey, isValidInput } from './src/utils.js';

const app = express();

const ioServer = http.createServer(app);
const io = new Server(ioServer, { cors: { origin: '*' }});

/**
 * Setting request body type and cors acceptance
 */
app.use(bodyParser.json());
app.use(cors());

/**
 * @swagger
 * tags:
 *   - name: Panic Management
 *     description: API endpoints for managing panic requests
 */

/**
 * Receive a panic request (submission from external source)
 */
/**
 * @swagger
 * /api/panic:
 *   post:
 *     summary: Receive panic requests from partner systems
 *     description: Receives emergency panic requests and stores them in the database, the severity field can be on of the values `low`, `medium`, `high`, or `critical`. 
 *     tags:
 *      - Panic Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_reporter:
 *                 type: string
 *               provider_name:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum:
 *                   - low
 *                   - medium
 *                   - high
 *                   - critical
 *                 description: |
 *                   The "severity" field is an enum that can be one of the following values:
 *                   (low, medium, high, critical)
 *               location:
 *                 type: string
 *               details:
 *                 type: string
 *     parameters:
 *       - name: x-api-key
 *         in: header
 *         schema:
 *           type: string
 *         description: API key for authentication
 *       - name: x-webhook-signature
 *         in: header
 *         schema:
 *           type: string
 *         description: Webhook signature for authentication
 *     responses:
 *       201:
 *         description: Panic request received and stored
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized request
 */
app.post('/api/panic', async(req, res) => {
  let { user_reporter, provider_name, severity, location, details } = req.body || {};
  
  try {
    /**
     * Verify the request signature (either Webhook secret or API key must be validated)
     */ 
    if (!verifySWebHookSignature(req) && !verifyApiKey(req)) {
      return res.status(401).json({ error: 'Unauthorized request!' });
    }
    /**
     * Ensure no parameter is undefined, empty or null (request body must be provided)
     */
    if(!isValidInput(user_reporter) || !isValidInput(provider_name) || !isValidInput(severity) 
      || !isValidInput(location) || !isValidInput(details)) {
        return res.status(400).json({ error: "request body cannot be undefined, null or empty!" });
    }

    const allowedStatuses = ['low', 'medium', 'high', 'critical'];
    severity = severity.toLowerCase();

    if (!allowedStatuses.includes(severity)) {
      return res.status(400).json({ error: 'Invalid severity name! Request severity must be in the list and have a valid name.'});
    }

    const storeAction = await storePanicRequest({ user_reporter, provider_name, severity, location, details }, res);
    /**
     * If no error received, check if an update has been found
     */
    if(Object.hasOwn(storeAction, 'changedRows')) {
      const newPanicId = storeAction.insertId;
      const result = await getPanicRequestFieldById(newPanicId, 'created_at');
      const created_at = result[0]?.created_at;
      const panic = { id: newPanicId, user_reporter, provider_name, severity, location, details, created_at, status: "active" };
      io.emit("new_panic", panic); // Notify frontend in real-time
      res.status(201).json({message: "success", panic: panic});
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update the status of a panic request if it is currently "active"
 */
/**
 * @swagger
 * /api/panic/{id}/status:
 *   put:
 *     summary: Update the status of a panic request
 *     description: Updates the status of a panic request if it is currently "active", the status can be either `resolved` or `cancelled`.
 *     tags:
 *      - Panic Management
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: 
 *                   - resolved 
 *                   - cancelled
 *                 description: |
 *                   **The status** field is an enum that can be one of the following values:
 *                   - `resolved`
 *                   - `cancelled`
 *     responses:
 *       200:
 *         description: Panic request status successfully updated
 *       400:
 *         description: Invalid input data or status
 *       406:
 *         description: Request Not Acceptable
 */
app.put('/api/panic/:id/status', async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  /**
   * Check for the allowed statuses
   */
  const allowedStatuses = ['resolved', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status! Request status must be in the list and have a valid status.'});
  }

  try {
    const updateAction = await updatePanicStatus(id, status, res);
    /**
     * If no error received, check if an update has been found
     */
    if(Object.hasOwn(updateAction, 'changedRows')) {
      res.status(200).json({ message: 'Panic request status successfully updated!' });
    }
  } catch (err) {
    next(err);
  }
}); 

/**
 * Fetch all active emergencies (order by date descending)
 */
/**
 * @swagger
 * /api/panics:
 *   get:
 *     summary: Fetch all panic requests
 *     description: Returns a list of all panic requests stored in the database
 *     tags:
 *      - Panic Management
 *     responses:
 *       200:
 *         description: A list of panic requests
 *       500:
 *         description: Internal server error
 */
app.get("/api/panics", async (req, res) => {
  try {
    const results = await getPanicRequests(req, res);
    res.status(200).json(results);
  } catch (error) { 
    res.status(500).json({ error: error.message });
  }
});

/**
 * Fetch all emergencies by status
 */
/**
 * @swagger
 * /api/panics/{status}:
 *   get:
 *     summary: Fetch all panic requests based on status
 *     description: Returns a list of all panic requests for the specific status stored in the database
 *     parameters:
 *       - name: status
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     tags:
 *      - Panic Management
 *     responses:
 *       200:
 *         description: A list of panic requests
 *       500:
 *         description: Internal server error
 */
app.get("/api/panics/:status", async (req, res) => {
  const { status } = req.params;

  /**
   * Check for the allowed statuses
   */
  const allowedStatuses = ['active', 'resolved', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status! Request must have a valid status.'});
  }

  try {
    const results = await getPanicRequestsByStatus(status, res);
    res.status(200).json(results);
  } catch (error) { 
    res.status(500).json({ error: error.message });
  }
});

/**
 * Fetch emergency by id
 */
/**
 * @swagger
 * /api/panic/{id}:
 *   get:
 *     summary: Fetch a panic request details for a given id
 *     description: Returns a details of panic request for the specific id stored in the database
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     tags:
 *      - Panic Management
 *     responses:
 *       200:
 *         description: A panic request details
 *       404:
 *         description: Panic request not found
 *       400:
 *         description: Invalid request panic id
 *       500:
 *         description: Internal server error
 */
app.get("/api/panic/:id", async (req, res) => {
  const { id } = req.params;

  /**
   * Check for the id value
   */
  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({ error: 'Invalid id! Request id must be an integer.'});
  }

  try {
    const [result] = await getPanicRequestById(id);

    if(result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ error: 'Panic request not found!'});
    }
  } catch (error) { 
    res.status(500).json({ error: error.message });
  }
});

/**
 * Swagger API documentation route
 */ 
app.use('/api/documentation', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * Global error handler to catch unexpected errors
 */
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'Internal Server Error' });
});

/**
 * Close the pool connection
 */
export const closeDatabaseConnection = () => {
  return pool.end();
}
/**
 * Export the app for use in tests (testing purposes)
 */
export default app;

// WebSocket connection event
io.on('connection', (socket) => {
  console.log('[WS] - A client connected:', socket.id);

  // Handle client disconnection
  socket.on('disconnect', (reason) => {
    console.log('[WS] A client disconnected:', socket.id, `Reason: ${reason || 'unknown'}`);
  });
});

/**
 * Server listenning on specific port
 */
const PORT = process.env.PORT || 3000;
const server = ioServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { server };