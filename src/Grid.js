import React, { Component } from 'react';
import ReactDataGrid from 'react-data-grid';

class Grid extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rows: this.props.rows.slice(0),
      originalRows: this.props.rows,
    };
  }

  handleGridSort = (sortColumn, sortDirection) => {
    const sortInd = this.props.cols.indexOf(sortColumn);
    const comparer = (a, b) => {
      if (sortDirection === 'ASC') {
        return (a[sortInd] > b[sortInd]) ? 1 : -1;
      } else if (sortDirection === 'DESC') {
        return (a[sortInd] < b[sortInd]) ? 1 : -1;
      }
    };

    const rows = sortDirection === 'NONE' ? this.state.originalRows.slice(0) : this.state.rows.sort(comparer);

    this.setState({ rows });
  }

  rowGetter = (i) => {
    return this.state.rows[i].reduce((row, value, j) => {
      row[this.props.cols[j]] = value;
      return row;
    }, {});
  }

  render() {
    if (this.props.cols.length === 0 && this.state.rows.length === 0) {
      return <p>No rows returned.</p>;
    }

    return (
      <ReactDataGrid
        columns={this.props.cols.map(col => {
          return {
            key: col,
            name: col,
            sortable: true,
          };
        })}
        onGridSort={this.handleGridSort}
        rowGetter={this.rowGetter}
        rowsCount={this.state.rows.length}
        width={100}
      />);
  }
}

export default Grid;
