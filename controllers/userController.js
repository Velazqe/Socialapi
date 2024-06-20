const { User, Thought } = require('../models');
const { Types } = require('mongoose');

module.exports = {
  getUsers(req, res) {
    User.find()
      .then((users) => res.json(users))
      .catch((err) => res.status(500).json(err));
  },
  getSingleUser(req, res) {
    console.log('Received request to get single user with ID:', req.params.userId);
    
    if (!Types.ObjectId.isValid(req.params.userId)) {
      console.log('Invalid user ID format:', req.params.userId);
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    User.findOne({ _id: req.params.userId })
      .populate('thoughts')
      .populate('friends')
      .then((user) => {
        if (!user) {
          console.log('No user found with that ID:', req.params.userId);
          return res.status(404).json({ message: 'No user with that ID' });
        }
        console.log('User found:', user);
        return res.json(user);
      })
      .catch((err) => {
        console.error('Error occurred while fetching user:', err);
        return res.status(500).json({ message: 'An error occurred while fetching user', error: err });
      });
  },
  createUser(req, res) {
    User.create(req.body)
      .then((user) => res.json(user))
      .catch((err) => res.status(500).json(err));
  },
  updateUser(req, res) {
    if (!Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    User.findOneAndUpdate(
      { _id: req.params.userId },
      { $set: req.body },
      { runValidators: true, new: true }
    )
      .then((user) => (!user ? res.status(404).json({ message: 'No user with this id!' }) : res.json(user)))
      .catch((err) => res.status(500).json(err));
  },
  deleteUser(req, res) {
    if (!Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    User.findByIdAndDelete({ _id: req.params.userId })
      .then((user) => (!user ? res.status(404).json({ message: 'No user with this id!' }) : Thought.deleteMany({ _id: { $in: user.thoughts } })))
      .then(() => res.json({ message: 'User and associated thoughts deleted!' }))
      .catch((err) => res.status(500).json(err));
  },
  addFriend(req, res) {
    if (!Types.ObjectId.isValid(req.params.userId) || !Types.ObjectId.isValid(req.params.friendId)) {
      return res.status(400).json({ message: 'Invalid user or friend ID format' });
    }
    
    User.findOneAndUpdate(
      { _id: req.params.userId },
      { $addToSet: { friends: req.params.friendId } },
      { new: true }
    )
      .then((user) => (!user ? res.status(404).json({ message: 'No user with this id!' }) : res.json(user)))
      .catch((err) => res.status(500).json(err));
  },
  removeFriend(req, res) {
    if (!Types.ObjectId.isValid(req.params.userId) || !Types.ObjectId.isValid(req.params.friendId)) {
      return res.status(400).json({ message: 'Invalid user or friend ID format' });
    }
    
    User.findOneAndUpdate(
      { _id: req.params.userId },
      { $pull: { friends: req.params.friendId } },
      { new: true }
    )
      .then((user) => (!user ? res.status(404).json({ message: 'No user with this id!' }) : res.json(user)))
      .catch((err) => res.status(500).json(err));
  }
};
