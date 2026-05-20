import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { Student, MarkEntry, AttendanceEntry, ExamType, Subject } from './src/types.js';

// In-memory data store
let students: Student[] = [
  { id: '1', name: 'Aarav Kumar' },
  { id: '2', name: 'Lakshmi Nair' },
];

let marks: MarkEntry[] = [];
let attendance: AttendanceEntry[] = [];

const TEACHER_CODE = 'Renju';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Auth
  app.post('/api/auth/teacher', (req, res) => {
    const { code } = req.body;
    if (code === TEACHER_CODE) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Invalid teacher code' });
    }
  });

  app.post('/api/auth/student', (req, res) => {
    const { name } = req.body;
    const student = students.find((s) => s.name.toLowerCase() === name.toLowerCase().trim());
    if (student) {
      res.json({ success: true, student });
    } else {
      res.status(404).json({ success: false, message: 'Student not found in records' });
    }
  });

  // Students
  app.get('/api/students', (req, res) => {
    res.json(students);
  });

  app.post('/api/students', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: name.trim()
    };
    students.push(newStudent);
    res.json(newStudent);
  });

  app.delete('/api/students/:id', (req, res) => {
    const { id } = req.params;
    students = students.filter(s => s.id !== id);
    // Cashe cascade
    marks = marks.filter(m => m.studentId !== id);
    attendance = attendance.filter(a => a.studentId !== id);
    res.json({ success: true });
  });

  // Marks
  app.get('/api/marks', (req, res) => {
    const { studentId } = req.query;
    if (studentId) {
      const studentMarks = marks.filter(m => m.studentId === studentId);
      return res.json(studentMarks);
    }
    res.json(marks);
  });

  app.post('/api/marks', (req, res) => {
    const { studentId, examName, subject, mark, maxMark } = req.body;
    if (!studentId || !examName || !subject || mark == null || maxMark == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if entry already exists
    const existingIndex = marks.findIndex(
      m => m.studentId === studentId && m.examName === examName && m.subject === subject
    );

    if (existingIndex >= 0) {
      marks[existingIndex].mark = mark;
      marks[existingIndex].maxMark = maxMark;
      return res.json(marks[existingIndex]);
    }

    const newMark: MarkEntry = {
      id: crypto.randomUUID(),
      studentId,
      examName,
      subject,
      mark,
      maxMark
    };
    marks.push(newMark);
    res.json(newMark);
  });

  // Attendance
  app.get('/api/attendance', (req, res) => {
    const { studentId, month } = req.query; // month as 'YYYY-MM'
    let result = attendance;
    
    if (studentId) {
      result = result.filter(a => a.studentId === studentId);
    }
    if (month) {
      const monthPrefix = month as string;
      result = result.filter(a => a.date.startsWith(monthPrefix));
    }
    
    res.json(result);
  });

  app.post('/api/attendance', (req, res) => {
    const { date, studentId, status } = req.body;
    if (!date || !studentId || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingIndex = attendance.findIndex(
      a => a.studentId === studentId && a.date === date
    );

    if (existingIndex >= 0) {
      attendance[existingIndex].status = status;
      return res.json(attendance[existingIndex]);
    }

    const newEntry: AttendanceEntry = {
      id: crypto.randomUUID(),
      date,
      studentId,
      status
    };
    attendance.push(newEntry);
    res.json(newEntry);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
