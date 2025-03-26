import { server , closeDatabaseConnection } from './../server.js';
import { 
    getPanicRequests, 
    getPanicRequestsByStatus, 
    getPanicRequestById, 
    getPanicRequestFieldById, 
    storePanicRequest, 
    updatePanicStatus 
  } from './queries.js';
  
  jest.mock('./db.js', () => ({
    query: jest.fn(),
    end: jest.fn().mockResolvedValue(), // Mock the end method
  }));
  
  import pool from './db.js';

  afterAll((done) => {
    server.close(() => {
      console.log('Server closed after testing');
  
      closeDatabaseConnection()
        .then(() => {
          console.log('Database connection closed');
          done();
        })
        .catch((error) => {
          console.error('Error closing database connection:', error);
          done(error); // Pass error to Jest if closing fails
        });
    });
  });  
  
  describe('Queries Module', () => {

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    // Test getPanicRequests
    test('getPanicRequests should return panic requests', async () => {
      pool.query.mockResolvedValue([[{ id: 1, status: 'active' }]]);
      
      const result = await getPanicRequests(null, mockRes);
      expect(result).toEqual([{ id: 1, status: 'active' }]);
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  
    // Test getPanicRequestsByStatus
    test('getPanicRequestsByStatus should return filtered requests', async () => {
      const status = 'active';
      pool.query.mockResolvedValue([[{ id: 1, status }]]);
      
      const result = await getPanicRequestsByStatus(status, mockRes);
      expect(result).toEqual([{ id: 1, status }]);
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT * FROM emergencies WHERE `status` = ?", [status]
      );
    });
  
    // Test getPanicRequestById
    test('getPanicRequestById should return a specific request by ID', async () => {
      const id = 1;
      pool.query.mockResolvedValue([[{ id, status: 'active' }]]);
      
      const result = await getPanicRequestById(id, mockRes);
      expect(result).toEqual([{ id, status: 'active' }]);
    });

    // Test getPanicRequestFieldById
    test('getPanicRequestFieldById should return the specified field for a given ID', async () => {
        const id = 1;
        const fieldname = 'status';
        const mockFieldResult = [{ status: 'active' }]; // Mock response
      
        pool.query.mockResolvedValue([mockFieldResult]); // Mock the database query response
      
        const result = await getPanicRequestFieldById(id, fieldname, mockRes);
      
        expect(result).toEqual(mockFieldResult); // Check if the result matches the mock response
    });
  
    // Test storePanicRequest
    test('storePanicRequest should insert a new record', async () => {
      const data = { user_reporter: 'John Tester', provider_name: 'Service SPN', severity: 'High', location: 'Johannesburg', details: 'A panic typically means something went unexpectedly wrong.' };
      
      const [[latestIdRow]] = await pool.query("SELECT MAX(`id`) as latestId FROM `emergencies`");
      const latestId = latestIdRow.latestId || 0;

      pool.query.mockResolvedValue([{ insertId: latestId + 1 }]);
      
      const result = await storePanicRequest(data, mockRes);
      expect(result).toEqual({ insertId: latestId + 1 });
    });
  
    // Test updatePanicStatus
    test('updatePanicStatus should update the status', async () => {
      const id = 1, status = 'resolved';
      pool.query
        .mockResolvedValueOnce([[{ id, status: 'active' }]]) // Mock getPanicRequestById
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Mock update
  
      const result = await updatePanicStatus(id, status, mockRes);
      expect(result).toEqual({ affectedRows: 1 });
    });
  });  