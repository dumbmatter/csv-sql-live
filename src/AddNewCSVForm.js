import Papa from "papaparse";
import React, { Component } from "react";
import Button from "react-bootstrap/lib/Button";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Modal from "react-bootstrap/lib/Modal";
import sql from "sql.js";
import emitter from "./emitter";

const parse = file => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: ({ data }) => {
        resolve(data);
      },
      error: reject
    });
  });
};

const createTable = (db, data, tableName) => {
  emitter.emit("updateState", {
    status: "creating-db"
  });

  if (!db) {
    db = new sql.Database();
  }

  const cols = data.shift();
  const query = `CREATE TABLE "${tableName}" (${cols
    .map(col => `"${col}" TEXT`)
    .join(",")});`;
  db.run(query);

  try {
    const insertStmt = db.prepare(
      `INSERT INTO "${tableName}" VALUES (${cols.map(val => "?").join(",")})`
    );
    for (const row of data) {
      if (row.length !== cols.length) {
        console.log("skipping row", row);
        continue;
      }

      insertStmt.run(row);
    }
    insertStmt.free();
  } catch (err) {
    db.run(`DROP TABLE IF EXISTS "${tableName}"`);
    throw err;
  }

  return db;
};

const getTableName = fileName => {
  const parts = fileName.split(".");
  if (parts.length < 2) {
    return fileName;
  }

  return parts.slice(0, -1).join(".");
};

class AddNewCSVForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errorMsg: undefined,
      file: undefined,
      fileName: undefined,
      tableName: ""
    };
  }

  handleFile = e => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    // http://stackoverflow.com/q/4851595/786644
    const fileName = e.target.value.replace("C:\\fakepath\\", "");
    this.setState({
      file,
      fileName,
      tableName: getTableName(fileName)
    });
  };

  handleSubmit = async e => {
    const initialStatus = this.props.status;

    try {
      emitter.emit("updateState", {
        status: "parsing-data"
      });

      if (!this.state.file) {
        return;
      }

      const data = await parse(this.state.file);
      const db = createTable(this.props.db, data, this.state.tableName);

      emitter.emit("updateState", {
        db,
        status: "loaded"
      });
      emitter.emit("newTable", this.state.tableName);

      this.props.closeModal();
    } catch (err) {
      console.error(err);
      this.setState({
        errorMsg: err.message
      });
      emitter.emit("updateState", {
        status: initialStatus
      });
    }
  };

  handleTableNameChange = async e => {
    this.setState({ tableName: e.target.value });
  };

  render() {
    return (
      <div>
        <Modal.Header closeButton>
          <Modal.Title>Add New CSV</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-xs-12 col-md-6">
              <p>
                With CSV SQL Live you can{" "}
                <strong className="text-success">
                  run SQL queries on data from CSV files
                </strong>
                , right in your browser!
              </p>
            </div>
            <div className="col-xs-12 col-md-6">
              <p>
                <strong className="text-success">
                  Your data will not leave your computer.
                </strong>{" "}
                Processing is done in your browser. No servers involved.
              </p>
            </div>
          </div>

          <div style={{ marginTop: "3em" }}>
            <FormGroup>
              <ControlLabel className="btn btn-primary">
                Select CSV File
                <FormControl
                  type="file"
                  onChange={this.handleFile}
                  style={{ display: "none" }}
                />
              </ControlLabel>
              <span style={{ marginLeft: "1em" }}>{this.state.fileName}</span>
            </FormGroup>
          </div>

          <div style={{ marginTop: "3em" }}>
            <FormGroup>
              <ControlLabel>Table Name</ControlLabel>
              <FormControl
                type="input"
                onChange={this.handleTableNameChange}
                value={this.state.tableName}
              />
            </FormGroup>
          </div>

          {this.state.errorMsg !== undefined ? (
            <p className="alert alert-danger" style={{ margin: "3em 0 0 0" }}>
              <b>Error!</b> {this.state.errorMsg}
            </p>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.closeModal}>Close</Button>
          <Button
            bsStyle="primary"
            disabled={
              !this.state.fileName ||
              !this.state.tableName ||
              this.props.status === "parsing-data" ||
              this.props.status === "creating-db"
            }
            onClick={this.handleSubmit}
          >
            {this.props.status === "parsing-data" ||
            this.props.status === "creating-db"
              ? "Loading..."
              : "Add New CSV"}
          </Button>
        </Modal.Footer>
      </div>
    );
  }
}

export default AddNewCSVForm;
