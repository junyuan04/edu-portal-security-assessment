import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookCopy, FolderClosed, Lock, MonitorPlay, FileText, BookCheck, Link as LinkIcon, Star, Pencil, Trash2 } from 'lucide-react';
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
  const icons = { video: <MonitorPlay />, document: <FileText />, quiz: <BookCheck />, link: <LinkIcon /> };

  return (
    <ul className="divide-y divide-gray-100">
      {materials.map((m) => (
        <li key={m.id} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <span className="text-lg">{icons[m.material_type] || <FolderClosed />}</span>
            <span className="text-sm text-gray-700">{m.title}</span>
          </div>
          <div className="flex items-center gap-2">
            {m.is_free && (
              <span className="text-xs text-accent-600 font-medium">Free</span>
            )}
            {!m.is_free && !m.content_url && (
              <span className="text-xs text-gray-400"> <Lock /> Enrolled only</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

const StarPicker = ({ value, onChange, disabled }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        disabled={disabled}
        onClick={() => onChange(n)}
        className="p-0.5 disabled:opacity-50"
        aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
      >
        <Star
          className={`w-6 h-6 ${n <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      </button>
    ))}
  </div>
);

const ReviewForm = ({ initial, onSubmit, onCancel, submitting, error }) => {
  const [rating,  setRating]  = useState(initial?.rating  || 5);
  const [comment, setComment] = useState(initial?.comment || '');
  const isEdit = !!initial;

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ rating, comment });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Your rating:</span>
        <StarPicker value={rating} onChange={setRating} disabled={submitting} />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Share your experience with this course…"
        className="input-field resize-none"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {isEdit ? 'Update review' : 'Post review'}
        </Button>
      </div>
    </form>
  );
};

const ReviewsList = ({ reviews, currentUserId, onEdit, onDelete }) => {
  if (!reviews.length) return <p className="text-sm text-gray-400">No reviews yet.</p>;
  return (
    <ul className="flex flex-col gap-4">
      {reviews.map((r) => {
        const isMine = currentUserId && r.user_id === currentUserId;
        return (
          <li key={r.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm flex-shrink-0">
              {r.full_name?.[0] || r.username?.[0] || '?'}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{r.full_name || r.username}</span>
                  <span className="text-yellow-400 text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  {isMine && <span className="text-[10px] uppercase text-gray-400 tracking-wide">You</span>}
                </div>
                {isMine && (
                  <div className="flex items-center gap-1">
                    <button onClick={onEdit} className="text-gray-400 hover:text-primary-600 p-1" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={onDelete} className="text-gray-400 hover:text-red-600 p-1" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{r.comment}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
};


const CourseDetailPage = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [course,     setCourse]     = useState(null);
  const [materials,  setMaterials]  = useState([]);
  const [reviews,    setReviews]    = useState([]);
  const [myReview,   setMyReview]   = useState(null);
  const [enrolment,  setEnrolment]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [enrolLoading, setEnrolLoading] = useState(false);
  const [error,      setError]      = useState(null);

  const [showForm,    setShowForm]    = useState(false);
  const [editingMine, setEditingMine] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  const refreshReviews = useCallback(async () => {
    const reviewsData = await courseService.getCourseReviews(id);
    setReviews(reviewsData);
    if (isAuthenticated) {
      const mine = await courseService.getMyReview(id).catch(() => null);
      setMyReview(mine);
    }
    const courseData = await courseService.getCourseById(id);
    setCourse(courseData);
  }, [id, isAuthenticated]);

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

        // Check enrolment + own review only if logged in
        if (isAuthenticated) {
          const [myEnrolments, mine] = await Promise.all([
            enrolmentService.getMyEnrolments(),
            courseService.getMyReview(id).catch(() => null),
          ]);
          const found = myEnrolments.find((e) => e.course_id === courseData.id);
          setEnrolment(found || null);
          setMyReview(mine);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, isAuthenticated]);

  const handleCreateReview = async ({ rating, comment }) => {
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      await courseService.addReview(id, rating, comment);
      setShowForm(false);
      await refreshReviews();
    } catch (err) {
      setReviewError(err.response?.data?.error || err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleUpdateReview = async ({ rating, comment }) => {
    if (!myReview) return;
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      await courseService.updateReview(id, myReview.id, { rating, comment });
      setEditingMine(false);
      await refreshReviews();
    } catch (err) {
      setReviewError(err.response?.data?.error || err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;
    if (!window.confirm('Delete your review?')) return;
    try {
      await courseService.deleteReview(id, myReview.id);
      setMyReview(null);
      await refreshReviews();
    } catch (err) {
      setReviewError(err.response?.data?.error || err.message);
    }
  };

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
  const isEnrolled = enrolment && enrolment.status !== 'cancelled';

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
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              {Number(course.review_count) > 0 ? (
                <span>
                  <strong>{Number(course.avg_rating).toFixed(1)}</strong>
                  <span className="text-gray-400 ml-1">({course.review_count} review{course.review_count == 1 ? '' : 's'})</span>
                </span>
              ) : (
                <span className="text-gray-400">No reviews yet</span>
              )}
            </div>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Reviews ({reviews.length})</h2>
              {isAuthenticated && isEnrolled && !myReview && !showForm && (
                <Button variant="secondary" onClick={() => { setShowForm(true); setReviewError(null); }}>
                  Write a review
                </Button>
              )}
            </div>

            {!isAuthenticated && (
              <p className="text-xs text-gray-400 mb-4">
                <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link> to write a review.
              </p>
            )}

            {isAuthenticated && !isEnrolled && (
              <p className="text-xs text-gray-400 mb-4">Enrol in this course to leave a review.</p>
            )}

            {isAuthenticated && isEnrolled && myReview && !editingMine && (
              <p className="text-xs text-gray-400 mb-4">
                You already reviewed this course. Use the edit / delete buttons on your review below.
              </p>
            )}

            {showForm && !myReview && (
              <div className="mb-4">
                <ReviewForm
                  onSubmit={handleCreateReview}
                  onCancel={() => { setShowForm(false); setReviewError(null); }}
                  submitting={reviewSubmitting}
                  error={reviewError}
                />
              </div>
            )}

            {editingMine && myReview && (
              <div className="mb-4">
                <ReviewForm
                  initial={myReview}
                  onSubmit={handleUpdateReview}
                  onCancel={() => { setEditingMine(false); setReviewError(null); }}
                  submitting={reviewSubmitting}
                  error={reviewError}
                />
              </div>
            )}

            <ReviewsList
              reviews={reviews}
              currentUserId={user?.id}
              onEdit={() => { setEditingMine(true); setReviewError(null); }}
              onDelete={handleDeleteReview}
            />
          </div>
        </div>

        {/* Right enrol card */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 flex flex-col gap-4">
            <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
              {course.thumbnail_url
                ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-5xl"><BookCopy /></div>
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


