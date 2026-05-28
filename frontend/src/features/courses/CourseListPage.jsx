import { useState } from 'react';
import useCourses from '../../hooks/useCourses';
import CourseCard from '../../components/CourseCard';
import Button from '../../components/Button';

const CATEGORIES = [
  { id: null,  label: 'All' },
  { id: 1,     label: 'Programming' },
  { id: 2,     label: 'Data Science' },
  { id: 3,     label: 'Cybersecurity' },
  { id: 4,     label: 'Business' },
];

const CourseGrid = ({ courses, loading, error }) => {
  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card h-72 animate-pulse bg-gray-100" />
      ))}
    </div>
  );

  if (error) return (
    <div className="text-center py-16 text-red-500">{error}</div>
  );

  if (courses.length === 0) return (
    <div className="text-center py-16 text-gray-400">
      <p className="text-4xl mb-3">📭</p>
      <p>No courses found. Try a different search.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
};

const CourseListPage = () => {
  const [input,       setInput]      = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryId,  setCategoryId]  = useState(null);

  const { courses, loading, error } = useCourses({ categoryId, searchQuery });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(input.trim());
    setCategoryId(null);
  };

  const handleCategory = (id) => {
    setCategoryId(id);
    setSearchQuery('');
    setInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Explore Courses</h1>
        <p className="text-gray-500 mt-2">
          Learn from Malaysia's top instructors — anywhere, anytime.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-8">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search courses…"
          className="input-field flex-1"
        />
        <Button type="submit" loading={loading}>Search</Button>
      </form>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(({ id, label }) => (
          <button
            key={label}
            onClick={() => handleCategory(id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              categoryId === id && !searchQuery
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Results label */}
      {searchQuery && (
        <p className="text-sm text-gray-500 mb-4">
          Search results for <strong>"{searchQuery}"</strong>
          <button
            onClick={() => { setSearchQuery(''); setInput(''); }}
            className="ml-2 text-primary-600 hover:underline"
          >
            Clear
          </button>
        </p>
      )}

      {/* Course grid */}
      <CourseGrid courses={courses} loading={loading} error={error} />
    </div>
  );
};

export default CourseListPage;


