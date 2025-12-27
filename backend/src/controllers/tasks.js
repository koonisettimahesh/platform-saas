const knex = require("../utils/db");
const { v4: uuid } = require("uuid");

const VALID_STATUS = ["todo", "in_progress", "completed"];
const VALID_PRIORITY = ["low", "medium", "high"];

/* ============================
   API 16: CREATE TASK
   POST /api/projects/:projectId/tasks
============================ */
exports.createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const {
      title,
      description,
      assignedTo,
      priority = "medium",
      dueDate,
    } = req.body;

    const user = req.user;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    if (!VALID_PRIORITY.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority",
      });
    }

    // 🔒 Verify project belongs to tenant
    const project = await knex("projects")
      .where({
        id: projectId,
        tenant_id: user.tenantId,
      })
      .first();

    if (!project) {
      return res.status(403).json({
        success: false,
        message: "Project does not belong to your tenant",
      });
    }

    // 🔎 Validate assigned user (if provided)
    if (assignedTo) {
      const assignee = await knex("users")
        .where({
          id: assignedTo,
          tenant_id: user.tenantId,
        })
        .first();

      if (!assignee) {
        return res.status(400).json({
          success: false,
          message: "Assigned user not in same tenant",
        });
      }
    }

    const taskId = uuid();
    const now = new Date();

    await knex("tasks").insert({
      id: taskId,
      tenant_id: user.tenantId,
      project_id: projectId,
      title: title.trim(),
      description: description || null,
      status: "todo",
      priority,
      assigned_to: assignedTo || null,
      due_date: dueDate || null,
      created_at: now,
    });

    // 📝 Audit log
    await knex("audit_logs").insert({
      id: uuid(),
      user_id: user.id,
      tenant_id: user.tenantId,
      action: "CREATE_TASK",
      entity_type: "task",
      entity_id: taskId,
      created_at: now,
    });

    res.status(201).json({
      success: true,
      data: {
        id: taskId,
        projectId,
        title: title.trim(),
        description,
        status: "todo",
        priority,
        assignedTo,
        dueDate,
        createdAt: now,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ============================
   API 17: LIST PROJECT TASKS
   GET /api/projects/:projectId/tasks
============================ */
exports.listProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const user = req.user;

    const {
      status,
      assignedTo,
      priority,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Math.min(Number(limit), 100);
    const offset = (pageNum - 1) * limitNum;

    // 🔒 Verify project belongs to tenant
    const project = await knex("projects")
      .where({
        id: projectId,
        tenant_id: user.tenantId,
      })
      .first();

    if (!project) {
      return res.status(403).json({
        success: false,
        message: "Project does not belong to your tenant",
      });
    }

    /* ===============================
       DATA QUERY
    =============================== */
    const dataQuery = knex("tasks")
      .leftJoin("users", "tasks.assigned_to", "users.id")
      .where("tasks.project_id", projectId)
      .andWhere("tasks.tenant_id", user.tenantId)
      .select(
        "tasks.id",
        "tasks.title",
        "tasks.description",
        "tasks.status",
        "tasks.priority",
        "tasks.due_date",
        "tasks.created_at",
        "users.id as assignedUserId",
        "users.full_name as assignedUserName",
        "users.email as assignedUserEmail"
      );

    if (status) dataQuery.andWhere("tasks.status", status);
    if (priority) dataQuery.andWhere("tasks.priority", priority);
    if (assignedTo) dataQuery.andWhere("tasks.assigned_to", assignedTo);
    if (search) {
      dataQuery.andWhere("tasks.title", "ilike", `%${search}%`);
    }

    const tasks = await dataQuery
      .orderBy("tasks.created_at", "desc")
      .limit(limitNum)
      .offset(offset);

    /* ===============================
       COUNT QUERY (SEPARATE)
    =============================== */
    const countQuery = knex("tasks")
      .where("project_id", projectId)
      .andWhere("tenant_id", user.tenantId);

    if (status) countQuery.andWhere("status", status);
    if (priority) countQuery.andWhere("priority", priority);
    if (assignedTo) countQuery.andWhere("assigned_to", assignedTo);
    if (search) {
      countQuery.andWhere("title", "ilike", `%${search}%`);
    }

    const [{ count }] = await countQuery.count();

    res.json({
      success: true,
      data: {
        tasks: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          assignedTo: t.assignedUserId
            ? {
                id: t.assignedUserId,
                fullName: t.assignedUserName,
                email: t.assignedUserEmail,
              }
            : null,
          dueDate: t.due_date,
          createdAt: t.created_at,
        })),
        total: Number(count),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(count / limitNum),
          limit: limitNum,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ============================
   API 18: UPDATE TASK STATUS
   PATCH /api/tasks/:taskId/status
============================ */
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const user = req.user;

    if (!VALID_STATUS.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    const task = await knex("tasks")
      .where({
        id: taskId,
        tenant_id: user.tenantId,
      })
      .first();

    if (!task) {
      return res.status(403).json({
        success: false,
        message: "Task does not belong to your tenant",
      });
    }

    await knex("tasks").where({ id: taskId }).update({
      status,
      updated_at: new Date(),
    });

    res.json({
      success: true,
      data: {
        id: taskId,
        status,
        updatedAt: new Date(),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ============================
   API 19: UPDATE TASK
   PUT /api/tasks/:taskId
============================ */
exports.updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const user = req.user;

    const { title, description, status, priority, assignedTo, dueDate } =
      req.body;

    const task = await knex("tasks")
      .where({
        id: taskId,
        tenant_id: user.tenantId,
      })
      .first();

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (status && !VALID_STATUS.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    if (priority && !VALID_PRIORITY.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority",
      });
    }

    if (assignedTo !== undefined && assignedTo !== null) {
      const assignee = await knex("users")
        .where({
          id: assignedTo,
          tenant_id: user.tenantId,
        })
        .first();

      if (!assignee) {
        return res.status(400).json({
          success: false,
          message: "Assigned user not in same tenant",
        });
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assigned_to = assignedTo;
    if (dueDate !== undefined) updateData.due_date = dueDate;
    updateData.updated_at = new Date();

    await knex("tasks").where({ id: taskId }).update(updateData);

    // 📝 Audit log
    await knex("audit_logs").insert({
      id: uuid(),
      user_id: user.id,
      tenant_id: user.tenantId,
      action: "UPDATE_TASK",
      entity_type: "task",
      entity_id: taskId,
      created_at: new Date(),
    });

    res.json({
      success: true,
      message: "Task updated successfully",
      data: {
        id: taskId,
        ...updateData,
      },
    });
  } catch (err) {
    next(err);
  }
};
