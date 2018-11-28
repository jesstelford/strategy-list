import classNames from 'classnames';
import utils from '../util/utils';

const ALL_TODOS = 'all';
const DAILY_TODOS = 'daily';
const WEEKLY_TODOS = 'weekly';

export default ({ nowShowing, onFilterChange }) => {
  return (
    <section className="filter">
      <ul className="filters">
        <li>
          <button
            className={classNames({ selected: nowShowing === ALL_TODOS })}
            onClick={() => onFilterChange(ALL_TODOS)}
          >
            All
          </button>
        </li>{' '}
        <li>
          <button
            className={classNames({ selected: nowShowing === DAILY_TODOS })}
            onClick={() => onFilterChange(DAILY_TODOS)}
          >
            Daily
          </button>
        </li>{' '}
        <li>
          <button
            className={classNames({ selected: nowShowing === WEEKLY_TODOS })}
            onClick={() => onFilterChange(WEEKLY_TODOS)}
          >
            Weekly
          </button>
        </li>
      </ul>
    </section>
  );
};
