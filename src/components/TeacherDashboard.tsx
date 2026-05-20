import { useState, useEffect } from 'react';
import { Users, FileSpreadsheet, CalendarDays, Plus, Trash2, CheckCircle2, UserCheck, UserX, Save, Loader2 } from 'lucide-react';
import { Student, Subject, ExamType, MarkEntry, AttendanceEntry } from '../types';
import { api } from '../lib/mockApi';

const SUBJECTS: Subject[] = ['Malayalam', 'English', 'Hindi', 'Mathematics', 'Basic Science', 'Social Science'];
const EXAMS: ExamType[] = ['Term 1', 'Term 2', 'Annual Exam'];

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<'students' | 'marks' | 'attendance'>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Error/Success feedback
  const [notification, setNotification] = useState<{message: string, type: 'success'|'error'} | null>(null);

  // Students Tab State
  const [newStudentName, setNewStudentName] = useState('');

  // Marks Tab State
  const [selectedExam, setSelectedExam] = useState<ExamType>('Term 1');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [marksForm, setMarksForm] = useState<Record<string, {mark: string, maxMark: string}>>({});
  
  // Attendance Tab State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'present'|'absent'>>({});

  useEffect(() => {
    fetchStudents();
  }, []);

  const showNotification = (message: string, type: 'success'|'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await api.getStudents();
      setStudents(data);
      if (data.length > 0 && !selectedStudent) {
        setSelectedStudent(data[0].id);
      }
    } catch (e) {
      console.error(e);
      showNotification('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Students Actions ---
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    
    try {
      await api.addStudent(newStudentName);
      setNewStudentName('');
      fetchStudents();
      showNotification('Student added successfully', 'success');
    } catch (e) {
      console.error(e);
      showNotification('Failed to add student', 'error');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure? This will delete all marks and attendance for this student.')) return;
    try {
      await api.deleteStudent(id);
      fetchStudents();
      showNotification('Student deleted', 'success');
    } catch (e) {
      console.error(e);
      showNotification('Failed to delete student', 'error');
    }
  };

  // --- Marks Actions ---
  useEffect(() => {
    if (activeTab === 'marks' && selectedStudent) {
      loadMarksForStudent(selectedStudent);
    }
  }, [selectedStudent, selectedExam, activeTab]);

  const loadMarksForStudent = async (studentId: string) => {
    try {
      const data = await api.getMarks(studentId);
      
      const formState: Record<string, {mark: string, maxMark: string}> = {};
      SUBJECTS.forEach(sub => {
        const existing = data.find((m: any) => m.examName === selectedExam && m.subject === sub);
        formState[sub] = existing 
          ? { mark: existing.mark.toString(), maxMark: existing.maxMark.toString() }
          : { mark: '', maxMark: '50' }; // Default 50 max marks
      });
      setMarksForm(formState);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveMarks = async () => {
    try {
      const promises = Object.entries(marksForm).map(async ([subject, values]) => {
        if (!values.mark.trim()) return;
        return api.saveMark(selectedStudent, selectedExam, subject, Number(values.mark), Number(values.maxMark));
      });
      
      await Promise.all(promises);
      showNotification('Marks saved successfully', 'success');
      // Reload to get generated IDs if any
      loadMarksForStudent(selectedStudent);
    } catch (e) {
        console.error(e);
      showNotification('Failed to save marks', 'error');
    }
  };

  const handleMarkChange = (subject: string, field: 'mark'|'maxMark', value: string) => {
    setMarksForm(prev => ({
      ...prev,
      [subject]: { ...prev[subject], [field]: value }
    }));
  };

  // --- Attendance Actions ---
  useEffect(() => {
    if (activeTab === 'attendance') {
      loadAttendanceForDate(attendanceDate);
    }
  }, [attendanceDate, activeTab, students]);

  const loadAttendanceForDate = async (date: string) => {
    try {
      const data = await api.getAttendance({ month: date.substring(0, 7) });
      
      const dayData = data.filter((a: any) => a.date === date);
      const state: Record<string, 'present'|'absent'> = {};
      
      dayData.forEach((a: any) => {
        state[a.studentId] = a.status;
      });
      
      // Default unset to empty string so buttons look unselected
      setAttendanceRecords(state);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAttendance = async (studentId: string, status: 'present'|'absent') => {
    try {
      await api.saveAttendance(studentId, attendanceDate, status);
      setAttendanceRecords(prev => ({ ...prev, [studentId]: status }));
      showNotification('Attendance recorded', 'success');
    } catch (e) {
        console.error(e);
      showNotification('Failed to record attendance', 'error');
    }
  };


  if (loading && students.length === 0) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      {notification && (
        <div className={`fixed top-20 right-4 px-4 py-3 rounded-lg shadow-lg text-white z-50 flex items-center transition-all ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-500'
        }`}>
           {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
           {notification.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row mb-8 space-y-4 md:space-y-0 md:space-x-4">
        <button 
          onClick={() => setActiveTab('students')}
          className={`flex-1 flex items-center justify-center p-4 rounded-xl border-2 transition-all ${activeTab === 'students' ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-transparent bg-white text-gray-600 hover:bg-gray-50 shadow-sm'}`}
        >
          <Users className="w-5 h-5 mr-2" /> Manage Students
        </button>
        <button 
          onClick={() => setActiveTab('marks')}
          className={`flex-1 flex items-center justify-center p-4 rounded-xl border-2 transition-all ${activeTab === 'marks' ? 'border-amber-400 bg-amber-50 text-amber-700 font-semibold' : 'border-transparent bg-white text-gray-600 hover:bg-gray-50 shadow-sm'}`}
        >
          <FileSpreadsheet className="w-5 h-5 mr-2" /> Enter Marks
        </button>
        <button 
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 flex items-center justify-center p-4 rounded-xl border-2 transition-all ${activeTab === 'attendance' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold' : 'border-transparent bg-white text-gray-600 hover:bg-gray-50 shadow-sm'}`}
        >
          <CalendarDays className="w-5 h-5 mr-2" /> Daily Attendance
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Student Directory</h2>
            
            <form onSubmit={handleAddStudent} className="flex gap-4 mb-8 max-w-xl">
              <input 
                type="text" 
                placeholder="New Student Name"
                value={newStudentName}
                onChange={e => setNewStudentName(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
              />
              <button disabled={!newStudentName.trim()} type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg flex items-center transition-colors">
                <Plus className="w-5 h-5 mr-1" /> Add
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map(st => (
                <div key={st.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="font-medium text-gray-800">{st.name}</div>
                  <button onClick={() => handleDeleteStudent(st.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {students.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500">
                  No students in records. Add your first student above.
                </div>
              )}
            </div>
          </div>
        )}

        {/* MARKS TAB */}
        {activeTab === 'marks' && (
          <div className="p-6 md:p-8">
             <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h2 className="text-xl font-bold text-gray-900">Academic Marks Entry</h2>
              <div className="flex gap-4">
                <select 
                  value={selectedExam}
                  onChange={e => setSelectedExam(e.target.value as ExamType)}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none font-medium"
                >
                  {EXAMS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                </select>
                <select 
                  value={selectedStudent}
                  onChange={e => setSelectedStudent(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                >
                   {students.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                </select>
              </div>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border"> Please add students first.</div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <div className="bg-amber-50/50 p-6 rounded-xl border border-amber-100 shadow-sm">
                  <div className="grid grid-cols-12 gap-4 pb-4 border-b border-amber-200 mb-4 font-semibold text-gray-700 text-sm">
                    <div className="col-span-6">Subject</div>
                    <div className="col-span-3 text-center">Marks Obtained</div>
                    <div className="col-span-3 text-center">Max Marks</div>
                  </div>
                  
                  <div className="space-y-4">
                    {SUBJECTS.map(sub => (
                      <div key={sub} className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-6 font-medium text-gray-800 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">{sub}</div>
                        <div className="col-span-3">
                           <input 
                            type="number" 
                            min="0"
                            placeholder="-"
                            value={marksForm[sub]?.mark || ''}
                            onChange={(e) => handleMarkChange(sub, 'mark', e.target.value)}
                            className="w-full px-3 py-2 text-center rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 outline-none bg-white font-mono"
                          />
                        </div>
                        <div className="col-span-3 w-full">
                          <input 
                            type="number" 
                            min="1"
                            value={marksForm[sub]?.maxMark || '50'}
                            onChange={(e) => handleMarkChange(sub, 'maxMark', e.target.value)}
                            className="w-full px-3 py-2 text-center rounded-lg border border-transparent hover:border-gray-300 outline-none bg-transparent hover:bg-white focus:bg-white focus:border-gray-300 transition-colors text-gray-500 font-mono text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button 
                      onClick={handleSaveMarks}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg flex items-center transition-colors shadow-sm"
                    >
                      <Save className="w-5 h-5 mr-2" /> Save Marks
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h2 className="text-xl font-bold text-gray-900">Daily Attendance</h2>
              <input 
                type="date"
                value={attendanceDate}
                onChange={e => setAttendanceDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              />
            </div>

            {students.length === 0 ? (
               <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border"> Please add students first.</div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white border rounded-xl shadow-sm overflow-hidden divide-y">
                  {students.map(st => {
                    const status = attendanceRecords[st.id];
                    return (
                      <div key={st.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                        <div className="font-medium text-gray-800 mb-3 sm:mb-0">{st.name}</div>
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleMarkAttendance(st.id, 'present')}
                            className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2 rounded-lg border transition-all ${status === 'present' ? 'bg-emerald-100 border-emerald-500 text-emerald-800 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                          >
                            <UserCheck className="w-4 h-4 mr-2" /> Present
                          </button>
                          <button 
                            onClick={() => handleMarkAttendance(st.id, 'absent')}
                            className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2 rounded-lg border transition-all ${status === 'absent' ? 'bg-red-100 border-red-500 text-red-800 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                          >
                            <UserX className="w-4 h-4 mr-2" /> Absent
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
