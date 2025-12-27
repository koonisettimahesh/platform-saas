const knex = require('../utils/db');
const { v4: uuid } = require('uuid');

const ALLOWED_STATUSES = ['active', 'archived', 'completed'];

/**
 * API 12: Create Project
 * POST /api/projects
 */
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, status = 'active' } = req.body;
    const { id: userId, tenantId } = req.user;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project status'
      });
    }

    // 🔒 Project limit check
    const tenant = await knex('tenants')
      .where({ id: tenantId })
      .first();

    const [{ count }] = await knex('projects')
      .where({ tenant_id: tenantId })
      .count();

    if (Number(count) >= tenant.max_projects) {
      return res.status(403).json({
        success: false,
        message: 'Project limit reached'
      });
    }

    const projectId = uuid();
    const now = new Date();

    await knex('projects').insert({
      id: projectId,
      tenant_id: tenantId,
      name: name.trim(),
      description,
      status,
      created_by: userId,
      created_at: now
    });

    // 📝 Audit log
    await knex('audit_logs').insert({
      id: uuid(),
      user_id: userId,
      tenant_id: tenantId,
      action: 'CREATE_PROJECT',
      entity_type: 'project',
      entity_id: projectId,
      created_at: now
    });

    res.status(201).json({
      success: true,
      data: {
        id: projectId,
        tenantId,
        name: name.trim(),
        description,
        status,
        createdBy: userId,
        createdAt: now
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 13: List Projects
 * GET /api/projects
 */
exports.listProjects = async (req, res, next) => {
  try {
    const { tenantId } = req.user;
    const { status, search, page = 1, limit = 20 } = req.query;

    const pageNum = Number(page);
    const limitNum = Math.min(Number(limit), 100);
    const offset = (pageNum - 1) * limitNum;

    const baseQuery = knex('projects')
      .leftJoin('users', 'projects.created_by', 'users.id')
      .where('projects.tenant_id', tenantId);

    if (status) {
      baseQuery.where('projects.status', status);
    }

    if (search) {
      baseQuery.whereILike('projects.name', `%${search}%`);
    }

    const projects = await baseQuery
      .clone()
      .select(
        'projects.id',
        'projects.name',
        'projects.description',
        'projects.status',
        'projects.created_at',
        'users.id as creator_id',
        'users.full_name as creator_name'
      )
      .orderBy('projects.created_at', 'desc')
      .limit(limitNum)
      .offset(offset);

    // 🔢 Task stats (single query)
    const taskStats = await knex('tasks')
      .select('project_id')
      .count('* as taskCount')
      .count({
        completedTaskCount: knex.raw(
          "CASE WHEN status = 'completed' THEN 1 END"
        )
      })
      .whereIn(
        'project_id',
        projects.map(p => p.id)
      )
      .groupBy('project_id');

    const statsMap = {};
    taskStats.forEach(s => {
      statsMap[s.project_id] = {
        taskCount: Number(s.taskCount),
        completedTaskCount: Number(s.completedTaskCount)
      };
    });

    const [{ count }] = await baseQuery
      .clone()
      .countDistinct('projects.id');

    res.json({
      success: true,
      data: {
        projects: projects.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status,
          createdBy: {
            id: p.creator_id,
            fullName: p.creator_name
          },
          taskCount: statsMap[p.id]?.taskCount || 0,
          completedTaskCount: statsMap[p.id]?.completedTaskCount || 0,
          createdAt: p.created_at
        })),
        total: Number(count),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(count / limitNum),
          limit: limitNum
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 14: Update Project
 * PUT /api/projects/:projectId
 */
exports.updateProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name, description, status } = req.body;
    const user = req.user;

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project status'
      });
    }

    const project = await knex('projects')
      .where({ id: projectId })
      .first();

    if (!project || project.tenant_id !== user.tenantId) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isAllowed =
      user.role === 'tenant_admin' ||
      project.created_by === user.id;

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updateData.updated_at = new Date();

    await knex('projects')
      .where({ id: projectId })
      .update(updateData);

    await knex('audit_logs').insert({
      id: uuid(),
      user_id: user.id,
      tenant_id: user.tenantId,
      action: 'UPDATE_PROJECT',
      entity_type: 'project',
      entity_id: projectId,
      created_at: new Date()
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: {
        id: projectId,
        ...updateData
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 15: Delete Project
 * DELETE /api/projects/:projectId
 */
exports.deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const user = req.user;

    const project = await knex('projects')
      .where({ id: projectId })
      .first();

    if (!project || project.tenant_id !== user.tenantId) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isAllowed =
      user.role === 'tenant_admin' ||
      project.created_by === user.id;

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // 🧹 Transactional delete
    await knex.transaction(async trx => {
      await trx('tasks').where({ project_id: projectId }).del();
      await trx('projects').where({ id: projectId }).del();
    });

    await knex('audit_logs').insert({
      id: uuid(),
      user_id: user.id,
      tenant_id: user.tenantId,
      action: 'DELETE_PROJECT',
      entity_type: 'project',
      entity_id: projectId,
      created_at: new Date()
    });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
