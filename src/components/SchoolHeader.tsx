import { MapPin, Phone, Mail, BookOpen } from 'lucide-react';

export default function SchoolHeader() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
          <BookOpen className="w-12 h-12" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">St. Mary's UP School, Anchelpetty</h1>
          <p className="text-gray-600 mb-4 max-w-2xl">
            A premier educational institution in Ernakulam, dedicated to providing quality education 
            and fostering holistic development in students from primary to upper primary levels.
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
              <MapPin className="w-4 h-4 text-gray-400" />
              Anchelpetty, Pampakuda, Ernakulam, Kerala
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
              <BookOpen className="w-4 h-4 text-gray-400" />
              Grades 1 to 7 (Co-educational)
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
              <Phone className="w-4 h-4 text-gray-400" />
              School Code: 32081200301
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
