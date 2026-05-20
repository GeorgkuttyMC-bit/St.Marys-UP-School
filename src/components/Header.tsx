import { BookOpen, LogOut, User } from 'lucide-react';
import { ViewState } from '../App';
import { Student } from '../types';

interface HeaderProps {
  view: ViewState;
  onLogout: () => void;
  studentUser: Student | null;
}

export default function Header({ view, onLogout, studentUser }: HeaderProps) {
  return (
    <header className="bg-blue-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-400 p-2 rounded-full">
              <BookOpen className="w-6 h-6 text-blue-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">St. Mary's UP School</h1>
              <p className="text-xs text-blue-200">Anchelpeety</p>
            </div>
          </div>
          
          {view !== 'landing' && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm bg-blue-800 px-3 py-1.5 rounded-full">
                <User className="w-4 h-4 text-amber-400" />
                <span className="font-medium font-medium">
                  {view === 'teacher_dashboard' ? 'Renju Teacher' : studentUser?.name}
                </span>
                <span className="text-blue-300 text-xs uppercase tracking-wider ml-2 border-l border-blue-700 pl-2">
                  {view === 'teacher_dashboard' ? 'Admin' : 'Student'}
                </span>
              </div>
              <button 
                onClick={onLogout}
                className="flex items-center space-x-1 text-sm text-blue-200 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
