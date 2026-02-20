/**
 * DATABASE CONNECTION MANAGER
 * 
 * DESIGN NOTE: Mongoose is a Node.js library. In this browser-based preview,
 * we simulate the connection. In a real Next.js project, you would uncomment 
 * the mongoose imports and connection logic for server-side execution.
 */

interface GlobalMongoose {
  conn: any | null;
  promise: Promise<any> | null;
}

// We use globalThis to safely access the global object in any environment (Browser or Node)
const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose: GlobalMongoose;
};

let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("🛠️ DATABASE ARCHITECTURE: Initializing MongoDB Atlas Singleton...");
    
    // Simulate connection delay for UI fidelity
    cached.promise = new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ DATABASE CONNECTED: Successfully established link to 'aauekpoma' cluster.");
        const mockMongoose = {
          connection: { 
            readyState: 1,
            db: { databaseName: 'aauekpoma' }
          }
        };
        resolve(mockMongoose);
      }, 800);
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}