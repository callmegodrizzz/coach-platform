const prisma = require('../lib/prisma');

async function getAllModules(req, res) {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          select: { id: true, title: true, order: true }
        }
      }
    });
    res.json({ modules });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getModuleById(req, res) {
  try {
    const { id } = req.params;
    const module = await prisma.module.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { order: 'asc' } }
      }
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json({ module });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createModule(req, res) {
  try {
    const { title, description, order } = req.body;

    if (!title || order === undefined) {
      return res.status(400).json({ error: 'Title and order are required' });
    }

    const module = await prisma.module.create({
      data: { title, description, order }
    });

    res.status(201).json({
      message: 'Module created successfully',
      module
    });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateModule(req, res) {
  try {
    const { id } = req.params;
    const { title, description, order } = req.body;

    const existing = await prisma.module.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const module = await prisma.module.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order })
      }
    });

    res.json({
      message: 'Module updated successfully',
      module
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteModule(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.module.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Module not found' });
    }

    await prisma.module.delete({ where: { id } });

    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule
};
