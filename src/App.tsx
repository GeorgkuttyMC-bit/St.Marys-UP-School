import { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import { testConnection } from './firebase';
import { Student } from './types';

export type ViewState = 'landing' | 'teacher_dashboard' | 'student_dashboard';

export default function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [studentUser, setStudentUser] = useState<Student | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const handleTeacherLogin = () => {
    setView('teacher_dashboard');
  };

  const handleStudentLogin = (student: Student) => {
    setStudentUser(student);
    setView('student_dashboard');
  };

  const handeLogout = async () => {
    try {
      const { auth } = await import('./firebase');
      await auth.signOut();
    } catch(e) {
      console.error(e);
    }
    setView('landing');
    setStudentUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header view={view} onLogout={handeLogout} studentUser={studentUser} />
      <main className="flex-grow flex flex-col">
        {view === 'landing' && (
          <LandingPage onTeacherLogin={handleTeacherLogin} onStudentLogin={handleStudentLogin} />
        )}
        {view === 'teacher_dashboard' && <TeacherDashboard />}
        {view === 'student_dashboard' && studentUser && <StudentDashboard student={studentUser} />}
      </main>
    </div>
  );
}
