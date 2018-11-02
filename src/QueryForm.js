import React, { Component } from "react";
import Button from "react-bootstrap/lib/Button";
import FormControl from "react-bootstrap/lib/FormControl";
import FormGroup from "react-bootstrap/lib/FormGroup";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import emitter from "./emitter";

class QueryForm extends Component {
  constructor(props) {
    super(props);
    this.state = { queryText: "" };
  }

  handleChange = e => {
    this.setState({ queryText: e.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();
    emitter.emit("runQuery", this.state.queryText);
  };

  newTable = tableName => {
    if (this.state.queryText === "") {
      this.setState({
        queryText: `SELECT * FROM "${tableName}"`
      });
    }
  };

  componentDidMount() {
    emitter.addListener("newTable", this.newTable);
  }

  componentWillUnmount() {
    emitter.removeListener("newTable", this.newTable);
  }

  render() {
    if (this.props.status === "init") {
      return null;
    }

    return (
      <form onSubmit={this.handleSubmit} style={{ marginBottom: "3em" }}>
        <FormGroup controlId="sql-query">
          <FormControl
            componentClass="textarea"
            onChange={this.handleChange}
            value={this.state.queryText}
            disabled={
              this.props.status !== "loaded" &&
              this.props.status !== "query-error"
            }
          />
          <Button
            bsStyle="primary"
            style={{ marginTop: "0.5em" }}
            className="pull-right"
            type="submit"
            disabled={
              this.props.status !== "loaded" &&
              this.props.status !== "query-error"
            }
          >
            Run Query
          </Button>
          <HelpBlock>
            Any{" "}
            <a
              href="https://sqlite.org/lang.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              valid SQLite query
            </a>{" "}
            is supported.
          </HelpBlock>
        </FormGroup>
      </form>
    );
  }
}

export default QueryForm;
