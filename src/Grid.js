import React, { Component } from "react";
import ReactDataGrid from "react-data-grid";
import { Toolbar } from "react-data-grid-addons";

class Grid extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: {},
      originalRows: this.props.rows,
      sortColumn: undefined,
      sortDirection: undefined,
      rows: this.props.rows.slice(0)
    };
  }

  sortRows = (rows, sortColumn, sortDirection) => {
    const sortInd = this.props.cols.indexOf(sortColumn);
    const comparer = (a, b) => {
      if (sortDirection === "ASC") {
        return a[sortInd] > b[sortInd] ? 1 : -1;
      } else if (sortDirection === "DESC") {
        return a[sortInd] < b[sortInd] ? 1 : -1;
      }
    };

    const sortedRows =
      sortDirection === "NONE" ? rows.slice(0) : rows.sort(comparer);
    return sortedRows;
  };

  handleFilterChange = filter => {
    const newFilters = Object.assign({}, this.state.filters);
    if (filter.filterTerm) {
      newFilters[filter.column.key] = filter;
    } else {
      delete newFilters[filter.column.key];
    }
    console.log(newFilters, this.state.rows);

    let filteredRows = this.state.originalRows.slice();

    // Filter rows
    for (const col of Object.keys(newFilters)) {
      const i = this.props.cols.indexOf(col);
      if (i < 0) {
        continue;
      }

      const filterTerm = newFilters[col].filterTerm;
      console.log(col, filterTerm);
      filteredRows = filteredRows.filter(row => row[i].includes(filterTerm));
    }

    // Also sort
    if (
      this.state.sortColumn !== undefined &&
      this.state.sortDirection !== undefined
    ) {
      filteredRows = this.sortRows(
        filteredRows,
        this.state.sortColumn,
        this.state.sortDirection
      );
    }

    this.setState({ filters: newFilters, rows: filteredRows });
  };

  handleGridSort = (sortColumn, sortDirection) => {
    // When no sort direction, go back to the order in originalRows
    let rows =
      sortDirection === "NONE" ? this.state.originalRows : this.state.rows;

    rows = this.sortRows(rows, sortColumn, sortDirection);
    console.log("rows", rows);
    this.setState({ rows, sortColumn, sortDirection });
  };

  rowGetter = i => {
    return this.state.rows[i].reduce((row, value, j) => {
      row[this.props.cols[j]] = value;
      return row;
    }, {});
  };

  /*  componentDidMount(){
    // https://stackoverflow.com/a/45597682/786644
    this.gridRef.onToggleFilter();
  }*/

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
            filterable: true,
            sortable: true
          };
        })}
        onAddFilter={this.handleFilterChange}
        onGridSort={this.handleGridSort}
        toolbar={<Toolbar enableFilter={true} />}
        //        ref={gridRef => { this.gridRef = gridRef; }}
        rowGetter={this.rowGetter}
        rowsCount={this.state.rows.length}
        width={100}
      />
    );
  }
}

export default Grid;
