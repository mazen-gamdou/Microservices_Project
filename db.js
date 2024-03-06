async function setupDb() {
    const { default: low } = await import('lowdb');
    const { default: FileSync } = await import('lowdb/adapters/FileSync.js');
  
    const adapter = new FileSync('db.json');
    const db = low(adapter);
  
    await db.defaults({ users: [] }).write();
    return db;
  }
  
  let dbInstance;
  
  const getDb = async () => {
    if (!dbInstance) {
      dbInstance = await setupDb();
    }
    return dbInstance;
  };
  
  export { getDb };
  
  
