import React, { Component } from "react";
import Modal from "react-bootstrap/lib/Modal";

class LoadedTables extends Component {
  constructor(props) {
    super(props);

    this.state = {
      status: "closed", // closed, loading, loaded
      tables: undefined
    };
  }

  static getDerivedStateFromProps(props) {
    if (!props.show) {
      return {
        status: "closed",
        tables: undefined
      };
    }

    return null;
  }

  componentDidUpdate() {
    // If this update is to show the modal, update the tables list
    if (this.props.show && this.state.status === "closed") {
      this.setState({
        status: "loading",
        tables: undefined
      });

      if (this.props.db) {
        let tables = undefined;

        const res = this.props.db.exec(
          "SELECT name FROM sqlite_master WHERE type='table'"
        );
        const tableNames =
          res.length === 0
            ? []
            : res[res.length - 1].values.map(cols => cols[0]);

        if (tableNames.length > 0) {
          tables = {};

          for (const tableName of tableNames) {
            const res2 = this.props.db.exec(
              `PRAGMA table_info("${tableName}");`
            );
            const colNames =
              res2.length === 0
                ? []
                : res2[res2.length - 1].values.map(cols => cols[1]);

            tables[tableName] = colNames;
          }
        }

        this.setState({
          status: "loaded",
          tables
        });
      } else {
        this.setState({
          status: "loaded",
          tables: undefined
        });
      }
    }
  }

  render() {
    return (
      <div>
        <Modal.Header closeButton>
          <Modal.Title>Loaded Tables</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.state.tables === undefined ? (
            "No tables loaded."
          ) : (
            <div className="row" style={{ marginBottom: "-20px" }}>
              {Object.keys(this.state.tables)
                .sort()
                .map(tableName => (
                  <div className="col-md-4 col-sm-6 col-xs-12" key={tableName}>
                    <ul className="list-group">
                      <li className="list-group-item list-group-item-info">
                        <strong>{tableName}</strong>
                      </li>
                      {this.state.tables[tableName].map(colName => (
                        <li className="list-group-item" key={colName}>
                          {colName}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          )}
        </Modal.Body>
      </div>
    );
  }
}

export default LoadedTables;
