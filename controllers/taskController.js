const Task = require("../models/Task");

const createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    if (!title || !description)
      return res.status(400).json({ message: "Title and description are required" });

    if (status && !["Pending", "Completed"].includes(status))
      return res.status(400).json({ message: 'Status must be "Pending" or "Completed"' });

    const task = await Task.create({
      title,
      description,
      status: status || "Pending",
      user: req.user._id,
    });

    res.status(201).json({ data: task });
  } catch (err) {
    next(err);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 9, status, search, sort } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const filter = { user: req.user._id };

    if (status && ["Pending", "Completed"].includes(status)) filter.status = status;

    if (search?.trim()) filter.title = { $regex: search.trim(), $options: "i" };

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      title_asc: { title: 1 },
      title_desc: { title: -1 },
    };

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sortMap[sort] || sortMap.newest).skip(skip).limit(limitNum),
      Task.countDocuments(filter),
    ]);

    res.json({
      data: tasks,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalTasks: total,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    if (status && !["Pending", "Completed"].includes(status))
      return res.status(400).json({ message: 'Status must be "Pending" or "Completed"' });

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    const updated = await task.save();
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};

const completeTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = "Completed";
    await task.save();

    res.json({ message: "Marked as completed" });
  } catch (err) {
    next(err);
  }
};

const getTaskStats = async (req, res, next) => {
  try {
    const uid = req.user._id;
    const [total, completed, pending] = await Promise.all([
      Task.countDocuments({ user: uid }),
      Task.countDocuments({ user: uid, status: "Completed" }),
      Task.countDocuments({ user: uid, status: "Pending" }),
    ]);

    res.json({ data: { total, completed, pending } });
  } catch (err) {
    next(err);
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask, completeTask, getTaskStats };
