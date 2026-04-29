const prisma = require('../lib/prisma');

// POST /api/progress — отметить урок пройденным
async function markLessonCompleted(req, res) {
  try {
    const { lessonId } = req.body;
    const userId = req.user.userId;

    if (!lessonId) {
      return res.status(400).json({ error: 'lessonId is required' });
    }

    // Проверяем что урок существует
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // upsert: если запись уже есть — обновляем, если нет — создаём
    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: { userId, lessonId }
      },
      update: {
        completed: true,
        completedAt: new Date()
      },
      create: {
        userId,
        lessonId,
        completed: true,
        completedAt: new Date()
      }
    });

    res.status(201).json({
      message: 'Lesson marked as completed',
      progress
    });
  } catch (error) {
    console.error('Mark progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/progress/me — мой прогресс по всем урокам
async function getMyProgress(req, res) {
  try {
    const userId = req.user.userId;

    const progress = await prisma.progress.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            moduleId: true,
            module: { select: { id: true, title: true } }
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });

    res.json({ progress });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  markLessonCompleted,
  getMyProgress
};
