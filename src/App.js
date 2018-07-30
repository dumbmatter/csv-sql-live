import React, { Component } from "react";
import Button from "react-bootstrap/lib/Button";
import Modal from "react-bootstrap/lib/Modal";
import AddNewCSVForm from "./AddNewCSVForm";
import Grid from "./Grid";
import LoadedTables from "./LoadedTables";
import QueryForm from "./QueryForm";
import emitter from "./emitter";
import "bootstrap/dist/css/bootstrap.css";

// This mutates rows!
const parseFloats = rows => {
  if (rows.length === 0) {
    return;
  }

  const allFloats = new Set();
  for (let i = 0; i < rows[0].length; i++) {
    allFloats.add(i);
  }

  for (const row of rows) {
    for (let i = 0; i < row.length; i++) {
      if (Number.isNaN(parseFloat(row[i]))) {
        allFloats.delete(i);
      }

      if (allFloats.size === 0) {
        return;
      }
    }
  }

  for (const row of rows) {
    for (const i of allFloats) {
      row[i] = parseFloat(row[i]);
    }
  }
};

const initialState = {
  db: undefined,
  errorMsg: undefined,
  query: "",
  result: undefined,
  showAddModal: true,
  showTablesModal: false,
  status: "init" // init, parsing-data, creating-db, loaded, running-query, query-error
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = initialState;
  }

  closeAddModal = () => {
    this.setState({
      showAddModal: false
    });
  };

  closeTablesModal = () => {
    this.setState({
      showTablesModal: false
    });
  };

  handleAddClick = () => {
    this.setState({
      showAddModal: true
    });
  };

  handleTablesClick = () => {
    this.setState({
      showTablesModal: true
    });
  };

  runQuery = query => {
    this.setState({
      status: "running-query"
    });

    try {
      const res = this.state.db.exec(query);
      const result =
        res.length === 0
          ? {
              cols: [],
              rows: []
            }
          : {
              cols: res[res.length - 1].columns,
              rows: res[res.length - 1].values
            };

      parseFloats(result.rows);

      this.setState({
        result,
        status: "loaded"
      });
    } catch (err) {
      this.setState({
        errorMsg: err.message,
        status: "query-error"
      });
    }
  };

  updateState = state => {
    this.setState(state);
  };

  componentDidMount() {
    emitter.addListener("runQuery", this.runQuery);
    emitter.addListener("updateState", this.updateState);
  }

  componentWillUnmount() {
    emitter.removeListener("runQuery", this.runQuery);
    emitter.removeListener("updateState", this.updateState);
  }

  render() {
    return (
      <div className="flex-wrapper">
        <nav className="navbar navbar-default">
          <div className="container">
            <span className="navbar-brand" style={{ color: "#000" }}>
              CSV SQL Live
            </span>
            <form className="pull-right" style={{ margin: "8px 0" }}>
              <Button
                style={{ marginRight: "0.5em" }}
                onClick={this.handleTablesClick}
                disabled={this.state.status === "init"}
              >
                <span className="hidden-xs">Loaded Tables</span>
                <span className="visible-xs">Tables</span>
              </Button>
              <Button bsStyle="danger" onClick={this.handleAddClick}>
                <span className="hidden-xs">Add New CSV</span>
                <span className="visible-xs">Add CSV</span>
              </Button>
            </form>
          </div>
        </nav>

        <div className="container above-footer full-width">
          <QueryForm status={this.state.status} />
          {this.state.status === "init" ? (
            <p
              style={{
                fontSize: "18px",
                marginTop: "6em",
                textAlign: "center"
              }}
            >
              To get started, first you need to{" "}
              <a onClick={this.handleAddClick}>load a CSV file</a>.
            </p>
          ) : null}
          {["query-error"].includes(this.state.status) ? (
            <p className="alert alert-danger">
              <b>Error!</b> {this.state.errorMsg}
            </p>
          ) : null}
          {this.state.result !== undefined ? (
            <Grid cols={this.state.result.cols} rows={this.state.result.rows} />
          ) : null}
        </div>

        <div className="container full-width">
          <hr />

          <footer>
            <p className="pull-right hidden-xs">
              <a
                href="https://github.com/dumbmatter/csv-sql-live"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
            </p>
            <p>
              Powered by{" "}
              <a
                href="http://papaparse.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Papa Parse
              </a>,{" "}
              <a
                href="https://github.com/kripken/sql.js/"
                target="_blank"
                rel="noopener noreferrer"
              >
                sql.js
              </a>, and{" "}
              <a
                href="https://www.sqlite.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                SQLite
              </a>.
            </p>
            <p className="visible-xs">
              <a
                href="https://github.com/dumbmatter/csv-sql-live"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
            </p>
          </footer>
        </div>

        <Modal show={this.state.showAddModal} onHide={this.closeAddModal}>
          <AddNewCSVForm
            closeModal={this.closeAddModal}
            db={this.state.db}
            status={this.state.status}
          />
        </Modal>

        <Modal
          bsSize="large"
          show={this.state.showTablesModal}
          onHide={this.closeTablesModal}
        >
          <LoadedTables db={this.state.db} show={this.state.showTablesModal} />
        </Modal>
      </div>
    );
  }
}

export default App;
