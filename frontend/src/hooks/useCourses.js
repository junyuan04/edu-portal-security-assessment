import { useState, useEffect, useCallback } from 'react';
import courseService from '../services/course.service';

// Fetches courses with loading or error state.
// Automatically re-fetches when categoryId or searchQuery changes.
const useCourses = ({ categoryId, searchQuery } = {}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = searchQuery?.trim()
        ? await courseService.searchCourses(searchQuery)
        : await courseService.getAllCourses(categoryId);
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [categoryId, searchQuery]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
};

export default useCourses;


