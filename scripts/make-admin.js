const { MongoClient } = require('mongodb');

async function makeAdmin(email) {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('codearena');
    const users = db.collection('users');

    const result = await users.updateOne(
      { email: email },
      { $set: { role: 'admin' } }
    );

    if (result.matchedCount === 0) {
      console.log('No user found with that email');
    } else if (result.modifiedCount === 0) {
      console.log('User was already an admin');
    } else {
      console.log('Successfully made user an admin');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.log('Please provide an email address');
  process.exit(1);
}

makeAdmin(email); 