const prisma = require('../lib/prisma');

// GET /api/lessons/:id — один урок (любой залогиненный)
async function getLessonById(req, res) {
  try {
    const { id } = req.params;
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          select: { id: true, title: true }
        }
      }
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json({ lesson });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/lessons — создать урок (только админ)
async function createLesson(req, res) {
  try {
    const { moduleId, title, content, videoUrl, order } = req.body;

    if (!moduleId || !title || order === undefined) {
      return res.status(400).json({
        error: 'moduleId, title and order are required'
      });
    }

    // Проверяем что модуль существует
    const module = await prisma.module.findUnique({
      where: { id: moduleId }
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const lesson = await prisma.lesson.create({
      data: { moduleId, title, content, videoUrl, order }
    });

    res.status(201).json({
      message: 'Lesson created successfully',
      lesson
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/lessons/:id — обновить урок (только админ)
async function updateLesson(req, res) {
  try {
    const { id } = req.params;
    const { title, content, videoUrl, order } = req.body;

    const existing = await prisma.lesson.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(order !== undefined && { order })
      }
    });

    res.json({
      message: 'Lesson updated successfully',
      lesson
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/lessons/:id — удалить урок (только админ)
async function deleteLesson(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.lesson.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    await prisma.lesson.delete({ where: { id } });

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson
};
