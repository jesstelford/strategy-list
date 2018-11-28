export default ({ onNextDay, onNextWeek }) => {
  return (
    <footer className="footer">
      <button onClick={onNextDay}>Skip to Next Day</button>
      <button onClick={onNextWeek}>Skip to Next Week</button>
      <br />
      Created by{' '}
      <a href="https://jes.st/?utm_source=strategylist&utm_medium=footer">
        Jess Telford
      </a>
    </footer>
  );
};
