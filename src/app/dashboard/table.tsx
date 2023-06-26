import React from 'react';
import styles from './page.module.css';

const ListExample: React.FC = () => {
  const data = [
    { id: 1, name: 'Item xxxxx', success: 20, failed: 20 },
    { id: 2, name: 'Item yyyyy', success: 230, failed: 210 },
    { id: 3, name: 'Item zzzzz', success: 120, failed: 0 },
  ];

  const renderListItems = () => {
    return data.map((item) => (
      <div key={item.id}>
        <li className={styles.for_li_ui}>
          <div>{item.success}</div>
          <div>{item.name}</div>
          <div>{item.failed}</div>
        </li>
        <div className={styles.gaugeBarContainer}>
          <div
            className={styles.successGaugeBar}
            style={{ width: `${(item.success / (item.success + item.failed)) * 100}%` }}
          ></div>
          <div
            className={styles.failedGaugeBar}
            style={{ width: `${(item.failed / (item.success + item.failed)) * 100}%` }}
          ></div>
        </div>
      </div>
    ));
  };

  return (
    <div>
      <h1>Process Instances by Name</h1>
      <ul>{renderListItems()}</ul>
    </div>
  );
};

export default ListExample;
