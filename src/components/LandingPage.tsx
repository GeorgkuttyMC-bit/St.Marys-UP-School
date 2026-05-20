import { useState } from 'react';
import { GraduationCap, BookOpenCheck, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface LandingPageProps {
  onTeacherLogin: () => void;
  onStudentLogin: (student: any) => void;
}

export default function LandingPage({ onTeacherLogin, onStudentLogin }: LandingPageProps) {
  const [teacherCode, setTeacherCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherCode.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: teacherCode.trim() })
      });
      const data = await res.json();
      
      if (data.success) {
        onTeacherLogin();
      } else {
        setError(data.message || 'Invalid Teacher Code');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: studentName.trim() })
      });
      const data = await res.json();
      
      if (data.success) {
        onStudentLogin(data.student);
      } else {
        setError(data.message || 'Student not found. Please check your name as per records.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 gap-8">
        
        {/* Student Login Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-amber-400 transform transition hover:-translate-y-1 duration-300">
          <div className="p-8">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
              <GraduationCap className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Portal</h2>
            <p className="text-gray-600 mb-8">Access your academic records, exam marks, and daily attendance.</p>
            
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  id="studentName"
                  type="text"
                  placeholder="E.g. Aarav Kumar"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || !studentName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-lg flex items-center justify-center transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>View My Results</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Teacher Login Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-blue-600 transform transition hover:-translate-y-1 duration-300">
          <div className="p-8">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <BookOpenCheck className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher Admin</h2>
            <p className="text-gray-600 mb-8">Manage student records, enter exam marks, and record attendance.</p>
            
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div>
                <label htmlFor="teacherCode" className="block text-sm font-medium text-gray-700 mb-1">Authorization Code</label>
                <input
                  id="teacherCode"
                  type="password"
                  placeholder="Enter access code"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors"
                  value={teacherCode}
                  onChange={(e) => setTeacherCode(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || !teacherCode.trim()}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium py-3 rounded-lg flex items-center justify-center transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>Login as Admin</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

      {error && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg flex items-center z-50">
          <AlertCircle className="w-5 h-5 mr-3" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
