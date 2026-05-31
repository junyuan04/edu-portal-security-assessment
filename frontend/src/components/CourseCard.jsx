import { Link } from 'react-router-dom';
import { BookCopy } from 'lucide-react';

const LEVEL_STYLES = {
  beginner:     'bg-green-100  text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced:     'bg-red-100    text-red-700',
};

const CourseCard = ({ course }) => {
  const {
    id, title, slug, description, price,
    level, duration_hrs, category, instructor, thumbnail_url,
  } = course;

  return (
    <Link
      to={`/courses/${id}`}
      className="card flex flex-col gap-3 hover:shadow-md transition-shadow duration-150"
    >
      <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
        {thumbnail_url ? (
          <img src={thumbnail_url} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            <BookCopy />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wide">{category}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_STYLES[level] || ''}`}>
          {level}
        </span>
      </div>

      <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2">{title}</h3>

      {description && (
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          {instructor} · {duration_hrs}h
        </div>
        <span className="text-primary-600 font-bold">
          {price === 0 ? 'Free' : `RM ${parseFloat(price).toFixed(2)}`}
        </span>
      </div>
    </Link>
  );
};

export default CourseCard;


