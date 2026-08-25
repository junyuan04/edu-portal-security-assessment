import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BookCopy, Lock } from 'lucide-react';
import courseService  from '../../services/course.service';
import paymentService from '../../services/payment.service';
import Button     from '../../components/Button';
import InputField from '../../components/InputField';

const PAYMENT_METHODS = [
  { value: 'credit_card',     label: 'Credit / Debit Card' },
  { value: 'online_banking',  label: 'Online Banking (FPX)' },
  { value: 'e_wallet',        label: 'e-Wallet (Touch \'n Go / GrabPay)' },
];

const CourseSummary = ({ course }) => (
  <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
    <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
      {course.thumbnail_url
        ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center text-2xl"><BookCopy /></div>
      }
    </div>
    <div className="flex-1">
      <p className="font-semibold text-gray-900 text-sm leading-snug">{course.title}</p>
      <p className="text-xs text-gray-400 mt-1">{course.category} · {course.level}</p>
    </div>
    <div className="text-lg font-bold text-primary-600 flex-shrink-0">
      RM {parseFloat(course.price).toFixed(2)}
    </div>
  </div>
);

const PaymentMethodSelector = ({ selected, onChange }) => (
  <div className="flex flex-col gap-2">
    {PAYMENT_METHODS.map(({ value, label }) => (
      <label
        key={value}
        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
          selected === value
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <input
          type="radio"
          name="paymentMethod"
          value={value}
          checked={selected === value}
          onChange={() => onChange(value)}
          className="accent-primary-600"
        />
        <span className="text-sm">{label}</span>
      </label>
    ))}
  </div>
);

const OrderSummary = ({ price }) => (
  <div className="flex flex-col gap-2 text-sm">
    <div className="flex justify-between text-gray-600">
      <span>Course price</span>
      <span>RM {parseFloat(price).toFixed(2)}</span>
    </div>
    <div className="flex justify-between text-gray-600">
      <span>SST (0%)</span>
      <span>RM 0.00</span>
    </div>
    <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-gray-900">
      <span>Total</span>
      <span>RM {parseFloat(price).toFixed(2)}</span>
    </div>
  </div>
);

// Main page

const PaymentPage = () => {
  const { courseId } = useParams();
  const navigate     = useNavigate();

  const [course,        setCourse]        = useState(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [courseError,   setCourseError]   = useState(null);

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardLastFour,  setCardLastFour]  = useState('');
  const [fieldError,    setFieldError]    = useState('');
  const [submitting,    setSubmitting]    = useState(false);
  const [serverError,   setServerError]   = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setCourseLoading(true);
      try {
        const data = await courseService.getCourseById(courseId);
        if (parseFloat(data.price) === 0) {
          navigate(`/courses/${courseId}`);
          return;
        }
        setCourse(data);
      } catch (err) {
        setCourseError(err.message);
      } finally {
        setCourseLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, navigate]);

  const validate = () => {
    if (paymentMethod === 'credit_card') {
      if (!/^\d{4}$/.test(cardLastFour)) {
        setFieldError('Enter the last 4 digits of your card');
        return false;
      }
    }
    setFieldError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await paymentService.createPayment(
        Number(courseId),
        paymentMethod,
        paymentMethod === 'credit_card' ? cardLastFour : null
      );
      navigate('/my-enrolments', { state: { paymentSuccess: true } });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (courseLoading) return (
    <div className="max-w-lg mx-auto px-4 py-10 space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/2" />
      <div className="h-24 bg-gray-100 rounded" />
      <div className="h-40 bg-gray-100 rounded" />
    </div>
  );

  if (courseError) return (
    <div className="text-center py-20 text-red-500">{courseError}</div>
  );

  if (!course) return null;

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">

      <div className="mb-6">
        <Link to={`/courses/${courseId}`} className="text-sm text-gray-400 hover:text-gray-600">
          ← Back to course
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">Complete your purchase</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Course summary */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Order summary
          </h2>
          <CourseSummary course={course} />
          <div className="mt-4">
            <OrderSummary price={course.price} />
          </div>
        </div>

        {/* Payment method */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Payment method
          </h2>
          <PaymentMethodSelector
            selected={paymentMethod}
            onChange={(val) => { setPaymentMethod(val); setFieldError(''); }}
          />

          {/* Card last four (shown only for credit card) */}
          {paymentMethod === 'credit_card' && (
            <div className="mt-4">
              <InputField
                id="cardLastFour"
                label="Last 4 digits of card"
                value={cardLastFour}
                onChange={(e) => setCardLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="e.g. 4242"
                error={fieldError}
                required
              />
            </div>
          )}
        </div>

        {serverError && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {serverError}
          </div>
        )}

        <Button type="submit" fullWidth loading={submitting} className="text-base py-3">
          Pay RM {parseFloat(course.price).toFixed(2)}
        </Button>

        <p className="text-xs text-center text-gray-400">
         <Lock className="inline-block mr-2" />
          This is a mock payment — no real transaction is processed.
        </p>
      </form>
    </div>
  );
};

export default PaymentPage;


