import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookCopy } from 'lucide-react';
import enrolmentService from '../../services/enrolment.service';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const StatusBadge = ({ status }) => {
  const styles = {
    active:    'bg-blue-100   text-blue-700',
    completed: 'bg-green-100  text-green-700',
    cancelled: 'bg-gray-100   text-gray-500',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || ''}`}>
      {status}
    </span>
  );
};

const ProgressBar = ({ pct }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 bg-gray-100 rounded-full h-2">
      <div
        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
    <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
  </div>
);

const EnrolmentCard = ({ enrolment, onCancel }) => {
  const { id, title, thumbnail_url, category, level, status, progress_pct, enrolled_at } = enrolment;
  const isCancellable = status === 'active';

  return (
    <div className="card flex flex-col sm:flex-row gap-4">

      {/* Thumbnail */}
      <Link to={`/courses/${enrolment.course_id}`} className="flex-shrink-0">
        <div className="w-full sm:w-32 h-24 bg-gray-100 rounded-lg overflow-hidden">
          {thumbnail_url
            ? <img src={thumbnail_url} alt={title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-3xl"><BookCopy /></div>
          }
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/courses/${enrolment.course_id}`}
            className="font-semibold text-gray-900 hover:text-primary-600 leading-snug"
          >
            {title}
          </Link>
          <StatusBadge status={status} />
        </div>

        <p className="text-xs text-gray-400">
          {category} · {level} · Enrolled {new Date(enrolled_at).toLocaleDateString('en-MY')}
        </p>

        {status !== 'cancelled' && <ProgressBar pct={progress_pct} />}

        {isCancellable && (
          <div className="mt-1">
            <button
              onClick={() => onCancel(id, title)}
              className="text-xs text-red-500 hover:text-red-700 hover:underline"
            >
              Cancel enrolment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main page

const EnrolmentPage = () => {
  const [enrolments, setEnrolments] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const [cancelTarget,  setCancelTarget]  = useState(null); // { id, title }
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    const fetchEnrolments = async () => {
      setLoading(true);
      try {
        const data = await enrolmentService.getMyEnrolments();
        setEnrolments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolments();
  }, []);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await enrolmentService.cancelEnrolment(cancelTarget.id);
      setEnrolments((prev) =>
        prev.map((e) =>
          e.id === cancelTarget.id ? { ...e, status: 'cancelled' } : e
        )
      );
      setCancelTarget(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  const active    = enrolments.filter((e) => e.status !== 'cancelled');
  const cancelled = enrolments.filter((e) => e.status === 'cancelled');

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card h-28 animate-pulse bg-gray-100" />
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Learning</h1>
          <p className="text-sm text-gray-500 mt-1">
            {active.length} active {active.length === 1 ? 'course' : 'courses'}
          </p>
        </div>
        <Link to="/courses" className="btn-secondary text-sm">Browse more</Link>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {active.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3"><BookCopy /></p>
          <p className="mb-4">You haven't enrolled in any courses yet.</p>
          <Link to="/courses" className="btn-primary text-sm">Browse courses</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {active.map((e) => (
            <EnrolmentCard
              key={e.id}
              enrolment={e}
              onCancel={(id, title) => setCancelTarget({ id, title })}
            />
          ))}
        </div>
      )}

      {cancelled.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Cancelled ({cancelled.length})
          </h2>
          <div className="flex flex-col gap-4 opacity-60">
            {cancelled.map((e) => (
              <EnrolmentCard key={e.id} enrolment={e} onCancel={() => {}} />
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel enrolment"
      >
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to cancel your enrolment in{' '}
          <strong>{cancelTarget?.title}</strong>? Your progress will be lost.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setCancelTarget(null)}>
            Keep learning
          </Button>
          <Button variant="danger" loading={cancelLoading} onClick={handleCancelConfirm}>
            Yes, cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default EnrolmentPage;


