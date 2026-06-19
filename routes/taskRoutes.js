const express = require("express");
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  completeTask,
  getTaskStats,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// protected routes
router.use(protect);

router.get("/stats", getTaskStats);
router.route("/").get(getTasks).post(createTask);
router.route("/:id").put(updateTask).delete(deleteTask);
router.patch("/:id/complete", completeTask);

module.exports = router;
