import { useEffect, useState } from 'react';
import type { Language } from '@/types/database';
import { supabase } from '@/services/supabaseClient';

interface CoursesTabProps {
  language: Language;
  canEdit: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  visibility: string;
  creator_id: string;
  total_lessons?: number;
  total_enrolled?: number;
  created_at?: string;
}

const CoursesTab: React.FC<CoursesTabProps> = ({ language, canEdit }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from('courses')
          .select('*')
          .eq('language_id', language.id)
          .order('created_at', { ascending: false });

        if (err) throw err;
        setCourses(data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch courses';
        console.error('❌ Error fetching courses:', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [language.id]);

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            📚 <span className="font-semibold">{courses.length}</span> course
            {courses.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canEdit && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            + Create Course
          </button>
        )}
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading courses...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load courses: {error}</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            No courses for this language yet
          </p>
          {canEdit && (
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              + Create the first course
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg dark:hover:shadow-xl transition-shadow bg-white dark:bg-gray-800"
            >
              {/* Course Card Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold flex-1">{course.title}</h3>
                  <span className="px-2 py-1 bg-white/20 rounded text-xs font-semibold">
                    {course.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                  </span>
                </div>
                {course.description && (
                  <p className="text-sm text-blue-100 line-clamp-2">{course.description}</p>
                )}
              </div>

              {/* Course Card Body */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Lessons</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {course.total_lessons || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Enrolled</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {course.total_enrolled || 0}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                    View
                  </button>
                  {canEdit && (
                    <>
                      <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                        Edit
                      </button>
                      <button className="flex-1 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesTab;
