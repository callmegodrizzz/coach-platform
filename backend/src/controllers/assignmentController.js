const prisma = require('../lib/prisma');

// POST /api/assignments — сдать домашку
async function submitAssignment(req, res) {
  try {
    const { lessonId, content } = req.body;
    const userId = req.user.userId;

    if (!lessonId || !content) {
      return res.status(400).json({ error: 'lessonId and content are required' });
    }

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const assignment = await prisma.assignment.create({
      data: { userId, lessonId, content }
    });

    res.status(201).json({
      message: 'Assignment submitted successfully',
      assignment
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/assignments/me — мои сданные домашки
async function getMyAssignments(req, res) {
  try {
    const userId = req.user.userId;

    const assignments = await prisma.assignment.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: { select: { id: true, title: true } }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.json({ assignments });
  } catch (error) {
    console.error('Get my assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/assignments — все домашки (только админ)
async function getAllAssignments(req, res) {
  try {
    const { status } = req.query;

    const where = status ? { status } : {};

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        lesson: {
          select: {
            id: true,
            title: true,
            module: { select: { id: true, title: true } }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.json({ assignments });
  } catch (error) {
    console.error('Get all assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/assignments/:id — поставить статус и фидбек (только админ)
async function reviewAssignment(req, res) {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({
        error: 'status must be APPROVED, REJECTED or PENDING'
      });
    }

    const existing = await prisma.assignment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        status,
        ...(feedback !== undefined && { feedback })
      },
      include: {
        user: { select: { name: true, email: true } },
        lesson: { select: { title: true } }
      }
    });

    res.json({
      message: 'Assignment reviewed successfully',
      assignment
    });
  } catch (error) {
    console.error('Review assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  submitAssignment,
  getMyAssignments,
  getAllAssignments,
  reviewAssignment
};
