import React, { Component } from 'react';
import ReactDataGrid from 'react-data-grid';

class Grid extends Component {
  rowGetter = (i) => {
    return this.props.rows[i].reduce((row, value, j) => {
      row[this.props.cols[j]] = value;
      return row;
    }, {});
  }

  render() {
    if (this.props.cols.length === 0 && this.props.rows.length === 0) {
      return <p>No rows returned.</p>;
    }

    return (
      <ReactDataGrid
        width={100}
        columns={this.props.cols.map(col => {
          return {key: col, name: col};
        })}
        rowGetter={this.rowGetter}
        rowsCount={this.props.rows.length}
      />);
  }
}

export default Grid;
