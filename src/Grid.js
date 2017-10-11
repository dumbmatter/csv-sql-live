import React, { Component } from 'react';

const Grid = ({cols, rows}) => {
  return (
    <table>
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
    </table>
  );
};

export default Grid;
