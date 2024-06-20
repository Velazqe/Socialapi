const mongoose = require('mongoose');
const User = require('./models/User.js');
const Thought = require('./models/Thought.js');

mongoose.connect('mongodb://localhost:27017/socialnetwork', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const users = [
  {
    username: 'john_doe',
    email: 'john@example.com',
  },
  {
    username: 'jane_doe',
    email: 'jane@example.com',
  },
  {
    username: 'sam_smith',
    email: 'sam@example.com',
  },
];

const thoughts = [
  {
    thoughtText: 'This is a thought by John.',
    username: 'john_doe',
  },
  {
    thoughtText: 'Jane thinks this is a great day!',
    username: 'jane_doe',
  },
  {
    thoughtText: 'Sam is learning MongoDB.',
    username: 'sam_smith',
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();

    const createdUsers = await User.insertMany(users);
    console.log('Users created:', createdUsers);

    const userIds = createdUsers.map(user => user._id);
    const thoughtsWithUserIds = thoughts.map((thought, index) => ({
      ...thought,
      userId: userIds[index % userIds.length],
    }));

    const createdThoughts = await Thought.insertMany(thoughtsWithUserIds);
    console.log('Thoughts created:', createdThoughts);

    for (let i = 0; i < createdUsers.length; i++) {
      await User.findByIdAndUpdate(createdUsers[i]._id, {
        $addToSet: {
          thoughts: createdThoughts[i % createdThoughts.length]._id,
        },
      });
    }

    console.log('Database seeded successfully.');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
};

seedDatabase();
