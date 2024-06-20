const { Thought, User } = require('../models');
const { Types } = require('mongoose');

module.exports = {
  getThoughts(req, res) {
    Thought.find()
      .then((thoughts) => res.json(thoughts))
      .catch((err) => res.status(500).json(err));
  },
  getSingleThought(req, res) {
    if (!Types.ObjectId.isValid(req.params.thoughtId)) {
      return res.status(400).json({ message: 'Invalid thought ID format' });
    }
    
    Thought.findOne({ _id: req.params.thoughtId })
      .then((thought) => (!thought ? res.status(404).json({ message: 'No thought with that ID' }) : res.json(thought)))
      .catch((err) => res.status(500).json(err));
  },
  createThought(req, res) {
    if (!Types.ObjectId.isValid(req.body.userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    Thought.create(req.body)
      .then((thought) => {
        return User.findOneAndUpdate(
          { _id: req.body.userId },
          { $addToSet: { thoughts: thought._id } },
          { new: true }
        );
      })
      .then((user) => (!user ? res.status(404).json({ message: 'Thought created, but found no user with that ID' }) : res.json('Created the thought 🎉')))
      .catch((err) => res.status(500).json(err));
  },
  updateThought(req, res) {
    if (!Types.ObjectId.isValid(req.params.thoughtId)) {
      return res.status(400).json({ message: 'Invalid thought ID format' });
    }
    
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $set: req.body },
      { runValidators: true, new: true }
    )
      .then((thought) => (!thought ? res.status(404).json({ message: 'No thought with this id!' }) : res.json(thought)))
      .catch((err) => res.status(500).json(err));
  },
  deleteThought(req, res) {
    if (!Types.ObjectId.isValid(req.params.thoughtId)) {
      return res.status(400).json({ message: 'Invalid thought ID format' });
    }
    
    Thought.findOneAndRemove({ _id: req.params.thoughtId })
      .then((thought) => (!thought ? res.status(404).json({ message: 'No thought with this id!' }) : User.findOneAndUpdate(
        { thoughts: req.params.thoughtId },
        { $pull: { thoughts: req.params.thoughtId } },
        { new: true }
      )))
      .then((user) => (!user ? res.status(404).json({ message: 'Thought deleted but no user with this id!' }) : res.json({ message: 'Thought successfully deleted!' })))
      .catch((err) => res.status(500).json(err));
  },
  addReaction(req, res) {
    if (!Types.ObjectId.isValid(req.params.thoughtId)) {
      return res.status(400).json({ message: 'Invalid thought ID format' });
    }
    
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $addToSet: { reactions: req.body } },
      { new: true }
    )
      .then((thought) => (!thought ? res.status(404).json({ message: 'No thought with this id!' }) : res.json(thought)))
      .catch((err) => res.status(500).json(err));
  },
  removeReaction(req, res) {
    if (!Types.ObjectId.isValid(req.params.thoughtId) || !Types.ObjectId.isValid(req.params.reactionId)) {
      return res.status(400).json({ message: 'Invalid thought or reaction ID format' });
    }
    
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $pull: { reactions: { reactionId: req.params.reactionId } } },
      { new: true }
    )
      .then((thought) => (!thought ? res.status(404).json({ message: 'No thought with this id!' }) : res.json(thought)))
      .catch((err) => res.status(500).json(err));
  }
};
