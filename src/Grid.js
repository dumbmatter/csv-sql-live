import React, { Component } from "react";
import ReactDataGrid from "react-data-grid";
import { Toolbar } from "react-data-grid-addons";

class Grid extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: {},
      sortColumn: undefined,
      sortDirection: undefined,
      originalRows: [],
      filteredRows: [],
      rows: []
    };

    this.gridRef = React.createRef();
  }

  static getDerivedStateFromProps(props, state) {
    if (props.rows !== state.originalRows) {
      return {
        filters: {},
        sortColumn: undefined,
        sortDirection: undefined,

        // originalRows - straight from props, so retains all rows in original order
        // filteredRows - filtered version of originalRows, so in original order
        // rows - after filtering and sorting is applied
        originalRows: props.rows,
        filteredRows: props.rows.slice(),
        rows: props.rows.slice()
      };
    }

    return null;
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
      sortDirection === "NONE" ? rows.slice() : rows.sort(comparer);
    return sortedRows;
  };

  handleFilterChange = filter => {
    const newFilters = Object.assign({}, this.state.filters);
    if (filter.filterTerm) {
      newFilters[filter.column.key] = filter;
    } else {
      delete newFilters[filter.column.key];
    }

    let filteredRows = this.state.originalRows.slice();

    // Filter rows
    for (const col of Object.keys(newFilters)) {
      const i = this.props.cols.indexOf(col);
      if (i < 0) {
        continue;
      }

      const filterTerm = newFilters[col].filterTerm;
      filteredRows = filteredRows.filter(row =>
        String(row[i]).includes(filterTerm)
      );
    }

    // Also sort
    let rows;
    if (
      this.state.sortColumn !== undefined &&
      this.state.sortDirection !== undefined
    ) {
      rows = this.sortRows(
        filteredRows,
        this.state.sortColumn,
        this.state.sortDirection
      );
    } else {
      rows = filteredRows.slice();
    }

    this.setState({ filters: newFilters, filteredRows, rows });
  };

  handleGridSort = (sortColumn, sortDirection) => {
    const rows = this.sortRows(
      this.state.filteredRows.slice(),
      sortColumn,
      sortDirection
    );
    this.setState({ rows, sortColumn, sortDirection });
  };

  rowGetter = i => {
    return this.state.rows[i].reduce((row, value, j) => {
      row[this.props.cols[j]] = value;
      return row;
    }, {});
  };

  componentDidMount() {
    // https://stackoverflow.com/a/45597682/786644
    if (
      this.gridRef &&
      this.gridRef.current &&
      this.gridRef.current.onToggleFilter
    ) {
      this.gridRef.current.onToggleFilter();
    }
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
            filterable: true,
            sortable: true
          };
        })}
        minHeight={window.innerHeight - 200}
        onAddFilter={this.handleFilterChange}
        onGridSort={this.handleGridSort}
        toolbar={<Toolbar enableFilter={true} />}
        ref={this.gridRef}
        rowGetter={this.rowGetter}
        rowsCount={this.state.rows.length}
        width={100}
      />
    );
  }
}

export default Grid;
