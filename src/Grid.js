import React from 'react';
import Table from 'react-bootstrap/lib/Table';

const Grid = ({cols, rows}) => {
  return (
    <Table responsive striped bordered condensed hover style={{width: 'auto'}}>
      <thead>
        <tr>
          {cols.map((col, i) => <th key={i}>{col}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => <tr key={i}>
          {row.map((val, j) => <td key={j}>{val}</td>)}
        </tr>)}
      </tbody>
    </Table>
  );
};

export default Grid;
