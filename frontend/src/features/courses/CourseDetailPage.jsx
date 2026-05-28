import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import courseService    from '../../services/course.service';
import enrolmentService from '../../services/enrolment.service';
import Button from '../../components/Button';

const LevelBadge = ({ level }) => {
  const styles = {
    beginner:     'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced:     'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[level] || ''}`}>
      {level}
    </span>
  );
};

const MaterialsList = ({ materials }) => {
  if (!materials.length) return <p className="text-sm text-gray-400">No materials yet.</p>;
  const icons = { video: '▶', document: '📄', quiz: '📝', link: '🔗' };

  return (
    <ul className="divide-y divide-gray-100">
      {materials.map((m) => (
        <li key={m.id} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <span className="text-lg">{icons[m.material_type] || '📁'}</span>
            <span className="text-sm text-gray-700">{m.title}</span>
          </div>
          <div className="flex items-center gap-2">
            {m.is_free && (
              <span className="text-xs text-accent-600 font-medium">Free</span>
            )}
            {!m.is_free && !m.content_url && (
              <span className="text-xs text-gray-400">🔒 Enrolled only</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

const ReviewsList = ({ reviews }) => {
  if (!reviews.length) return <p className="text-sm text-gray-400">No reviews yet.</p>;
  return (
    <ul className="flex flex-col gap-4">
      {reviews.map((r) => (
        <li key={r.id} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm flex-shrink-0">
            {r.full_name?.[0] || r.username?.[0] || '?'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{r.full_name || r.username}</span>
              <span className="text-yellow-400 text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            </div>
            <p className="text-sm text-gray-600 mt-0.5">{r.comment}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};


const CourseDetailPage = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { isAuthenticated } = useAuth();

  const [course,     setCourse]     = useState(null);
  const [materials,  setMaterials]  = useState([]);
  const [reviews,    setReviews]    = useState([]);
  const [enrolment,  setEnrolment]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [enrolLoading, setEnrolLoading] = useState(false);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [courseData, materialsData, reviewsData] = await Promise.all([
          courseService.getCourseById(id),
          courseService.getCourseMaterials(id),
          courseService.getCourseReviews(id),
        ]);
        setCourse(courseData);
        setMaterials(materialsData);
        setReviews(reviewsData);

        // Check enrolment only if logged in
        if (isAuthenticated) {
          const myEnrolments = await enrolmentService.getMyEnrolments();
          const found = myEnrolments.find((e) => e.course_id === courseData.id);
          setEnrolment(found || null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, isAuthenticated]);

  const handleEnrolFree = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setEnrolLoading(true);
    try {
      const result = await enrolmentService.enrol(course.id);
      setEnrolment(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnrolLoading(false);
    }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-100 rounded w-1/3" />
      <div className="h-48 bg-gray-100 rounded" />
    </div>
  );

  if (error)  return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!course) return null;

  const isFree    = parseFloat(course.price) === 0;
  const isEnrolled = !!enrolment;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link to="/courses" className="hover:text-gray-600">Courses</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{course.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left course info */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 uppercase">{course.category}</span>
              <LevelBadge level={course.level} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              By <strong>{course.instructor}</strong> · {course.duration_hrs}h
            </p>
          </div>

          {/* Description */}
          {course.description && (
            <div className="card">
              <h2 className="font-semibold mb-2">About this course</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>
            </div>
          )}

          {/* Materials */}
          <div className="card">
            <h2 className="font-semibold mb-4">Course content</h2>
            <MaterialsList materials={materials} />
          </div>

          {/* Reviews */}
          <div className="card">
            <h2 className="font-semibold mb-4">Reviews ({reviews.length})</h2>
            <ReviewsList reviews={reviews} />
          </div>
        </div>

        {/* Right enrol card */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 flex flex-col gap-4">
            <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
              {course.thumbnail_url
                ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-5xl">📚</div>
              }
            </div>

            {/* Price */}
            <div className="text-2xl font-bold text-gray-900">
              {isFree ? 'Free' : `RM ${parseFloat(course.price).toFixed(2)}`}
            </div>

            {/* CTA */}
            {isEnrolled ? (
              <div className="flex flex-col gap-2">
                <div className="text-sm text-accent-600 font-medium">✓ Enrolled</div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-accent-500 h-2 rounded-full"
                    style={{ width: `${enrolment.progress_pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">{enrolment.progress_pct}% complete</p>
              </div>
            ) : isFree ? (
              <Button fullWidth loading={enrolLoading} onClick={handleEnrolFree}>
                Enrol for free
              </Button>
            ) : (
              <Button fullWidth onClick={() => navigate(isAuthenticated ? `/payment/${course.id}` : '/login')}>
                {isAuthenticated ? 'Buy now' : 'Login to enrol'}
              </Button>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;


