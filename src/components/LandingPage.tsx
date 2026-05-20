import { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpenCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Student } from "../types";
import { api } from "../lib/api";
import SchoolHeader from "./SchoolHeader";
import classroomImage from "../assets/images/classroom_illustration_1779287625265.png";

interface LandingPageProps {
  onTeacherLogin: () => void;
  onStudentLogin: (student: any) => void;
}

export default function LandingPage({
  onTeacherLogin,
  onStudentLogin,
}: LandingPageProps) {
  const [teacherCode, setTeacherCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentStandard, setStudentStandard] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [studentsList, setStudentsList] = useState<Student[]>([]);

  useEffect(() => {
    api.getStudents().then((data) => setStudentsList(data));
  }, []);

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.authTeacher();

      if (res.success) {
        onTeacherLogin();
      } else {
        setError(res.message || "Invalid Teacher Code");
      }
    } catch (err: any) {
      console.error(err);
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentStandard.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await api.authStudent(
        studentName.trim(),
        studentStandard.trim(),
      );

      if (res.success) {
        onStudentLogin(res.student);
      } else {
        setError(
          res.message ||
            "Student not found. Please check your name and standard as per records.",
        );
      }
    } catch (err: any) {
      console.error(err);
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-10 bg-[url('https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center bg-fixed min-h-screen relative overflow-y-auto">
      <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-sm z-0"></div>

      <div className="relative z-10 w-full max-w-5xl mx-auto space-y-8 flex flex-col items-center pt-8">
        {/* School Info Section with Infographic */}
        <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row items-stretch">
          <div className="w-full md:w-2/5 shrink-0 bg-blue-50/50 relative min-h-[300px] flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-100">
            <img
              src={classroomImage}
              alt="Classroom Illustration"
              className="max-h-full max-w-full object-contain filter drop-shadow-sm"
            />
          </div>
          <div className="flex-1">
            <SchoolHeader className="!shadow-none !border-0 !rounded-none h-full flex flex-col justify-center" />
          </div>
        </div>

        {/* Login Cards */}
        <div className="w-full grid md:grid-cols-2 gap-8 pb-12">
          {/* Student Login Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-amber-400 transform transition hover:-translate-y-1 duration-300">
            <div className="p-8">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <GraduationCap className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Student Portal
              </h2>
              <p className="text-gray-600 mb-8">
                Access your academic records, exam marks, and daily attendance.
              </p>

              <form onSubmit={handleStudentSubmit} className="space-y-4">
                {studentsList.length > 0 ? (
                  <div>
                    <label
                      htmlFor="studentSelect"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Select Student
                    </label>
                    <select
                      id="studentSelect"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors appearance-none bg-white"
                      value={
                        studentsList.some(
                          (s) =>
                            s.name === studentName &&
                            s.standard === studentStandard,
                        )
                          ? `${studentName}|${studentStandard}`
                          : ""
                      }
                      onChange={(e) => {
                        const [name, std] = e.target.value.split("|");
                        setStudentName(name || "");
                        setStudentStandard(std || "");
                      }}
                      disabled={loading}
                    >
                      <option value="" disabled>
                        Select your name
                      </option>
                      {studentsList.map((s) => (
                        <option key={s.id} value={`${s.name}|${s.standard}`}>
                          {s.name} (Std: {s.standard})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div>
                      <label
                        htmlFor="studentName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Name
                      </label>
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
                    <div>
                      <label
                        htmlFor="studentStandard"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Standard / Class
                      </label>
                      <input
                        id="studentStandard"
                        type="text"
                        placeholder="E.g. 10A"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors"
                        value={studentStandard}
                        onChange={(e) => setStudentStandard(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </>
                )}
                <button
                  type="submit"
                  disabled={
                    loading || !studentName.trim() || !studentStandard.trim()
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-lg flex items-center justify-center transition-colors"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Teacher Admin
              </h2>
              <p className="text-gray-600 mb-8">
                Manage student records, enter exam marks, and record attendance.
              </p>

              <form onSubmit={handleTeacherSubmit} className="space-y-4">
                <p className="text-sm text-gray-500 text-center">To access admin capabilities, please sign in securely with Google.</p>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium py-3 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3 hidden sm:block" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span>Sign in with Google</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg flex items-center z-50">
          <AlertCircle className="w-5 h-5 mr-3" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
