import { useState, useEffect } from 'react';
import { BookOpen, CalendarDays, Loader2, Award, Target } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Student, MarkEntry, AttendanceEntry, ExamType } from '../types';

interface StudentDashboardProps {
  student: Student;
}

const EXAMS: ExamType[] = ['Term 1', 'Term 2', 'Annual Exam'];

export default function StudentDashboard({ student }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'marks' | 'attendance'>('marks');
  const [marks, setMarks] = useState<MarkEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<ExamType>('Term 1');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));

  useEffect(() => {
    fetchData();
  }, [student.id]);

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchAttendance();
    }
  }, [activeTab, selectedMonth, student.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'marks'), where('studentId', '==', student.id));
      const snap = await getDocs(q).catch(e => handleFirestoreError(e, OperationType.LIST, 'marks'));
      const marksData = snap ? snap.docs.map(d => ({id: d.id, ...d.data()} as MarkEntry)) : [];
      setMarks(marksData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      // Basic filtering for month client-side (to avoid complex queries matching substring in firebase)
      const q = query(collection(db, 'attendance'), where('studentId', '==', student.id));
      const snap = await getDocs(q).catch(e => handleFirestoreError(e, OperationType.LIST, 'attendance'));
      const attData = snap ? snap.docs.map(d => ({id: d.id, ...d.data()} as AttendanceEntry)).filter(a => a.date.startsWith(selectedMonth)) : [];
      setAttendance(attData);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const examMarks = marks.filter(m => m.examName === selectedExam);
  const totalMarks = examMarks.reduce((sum, m) => sum + m.mark, 0);
  const totalMax = examMarks.reduce((sum, m) => sum + m.maxMark, 0);
  const percentage = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : 0;

  const presentDays = attendance.filter(a => a.status === 'present').length;
  const totalDays = attendance.length;
  const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome, {student.name}</h2>
          <p className="text-gray-500 mt-1">View your academic progress and attendance records here.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
           <button 
            onClick={() => setActiveTab('marks')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'marks' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            My Marks
          </button>
          <button 
            onClick={() => setActiveTab('attendance')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'attendance' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Attendance
          </button>
        </div>
      </div>

      {activeTab === 'marks' && (
         <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-amber-500" /> Exam Results
              </h3>
              <select 
                value={selectedExam}
                onChange={e => setSelectedExam(e.target.value as ExamType)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none font-medium shadow-sm"
              >
                {EXAMS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
              </select>
            </div>

            {examMarks.length === 0 ? (
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                Marks have not been published for this exam yet.
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b border-gray-100">
                    <div className="p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 bg-amber-50/30">
                       <div className="text-center">
                         <div className="text-sm font-medium text-amber-800 mb-1 uppercase tracking-wider">Total Score</div>
                         <div className="text-3xl font-bold text-amber-600">{totalMarks} <span className="text-lg text-amber-400 font-normal">/ {totalMax}</span></div>
                       </div>
                    </div>
                    <div className="p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 bg-blue-50/30">
                       <div className="text-center">
                         <div className="text-sm font-medium text-blue-800 mb-1 uppercase tracking-wider">Percentage</div>
                         <div className="text-3xl font-bold text-blue-600">{percentage}%</div>
                       </div>
                    </div>
                    <div className="p-6 flex items-center justify-center bg-purple-50/30">
                       <div className="text-center">
                         <div className="text-sm font-medium text-purple-800 mb-1 uppercase tracking-wider">Performance</div>
                         <div className="text-xl font-bold text-purple-600 flex items-center justify-center">
                           {Number(percentage) >= 90 ? <><Award className="w-6 h-6 mr-1"/> Excellent</> : Number(percentage) >= 75 ? 'Good' : Number(percentage) >= 50 ? 'Average' : 'Needs Improvement'}
                         </div>
                       </div>
                    </div>
                 </div>

                 <div className="p-6">
                    <div className="space-y-4">
                      {examMarks.map(m => (
                        <div key={m.id} className="flex justify-between items-center p-4 rounded-xl border border-gray-100 hover:border-amber-200 transition-colors bg-gray-50/50">
                          <div className="font-medium text-gray-800">{m.subject}</div>
                          <div className="flex items-center gap-4">
                             <div className="w-48 bg-gray-200 rounded-full h-2.5 hidden sm:block">
                               <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${(m.mark / m.maxMark) * 100}%` }}></div>
                             </div>
                             <div className="font-bold text-lg text-gray-900 w-16 text-right">{m.mark} <span className="text-sm text-gray-500 font-normal">/ {m.maxMark}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>
            )}
         </div>
      )}

      {activeTab === 'attendance' && (
         <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <CalendarDays className="w-6 h-6 mr-2 text-emerald-500" /> Monthly Attendance
              </h3>
              <input 
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-400 outline-none font-medium shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="md:col-span-1 border border-gray-100 shadow-sm rounded-2xl bg-white p-6 self-start">
                  <div className="text-center pb-6 border-b border-gray-100 mb-6">
                     <Target className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
                     <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Attendance Rate</div>
                     <div className="text-4xl font-bold text-gray-900">{String(attendancePercentage)}%</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Total Days Recorded</span>
                      <span className="font-bold text-gray-900">{totalDays}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-emerald-600 font-medium">Days Present</span>
                      <span className="font-bold text-emerald-700">{presentDays}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-red-500 font-medium">Days Absent</span>
                      <span className="font-bold text-red-600">{totalDays - presentDays}</span>
                    </div>
                  </div>
               </div>

               <div className="md:col-span-2">
                 {attendance.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500 h-full flex items-center justify-center">
                      No attendance records found for this month.
                    </div>
                 ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                      {attendance.sort((a,b) => b.date.localeCompare(a.date)).map(record => (
                        <div key={record.id} className="flex justify-between items-center p-4 hover:bg-gray-50">
                           <div className="font-medium text-gray-800">
                             {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                           </div>
                           <div>
                             {record.status === 'present' ? (
                               <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wide">Present</span>
                             ) : (
                               <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wide">Absent</span>
                             )}
                           </div>
                        </div>
                      ))}
                    </div>
                 )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
