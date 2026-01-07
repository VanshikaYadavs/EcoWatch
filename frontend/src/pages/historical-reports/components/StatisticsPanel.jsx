const StatisticsPanel = ({ statistics }) => {
  return (
    <div>
      <h2>Statistics</h2>
      <ul>
        {statistics.map((stat, index) => (
          <li key={index}>{stat}</li>
        ))}
      </ul>
    </div>
  );
};

export default StatisticsPanel;