import React, { Component } from 'react';
import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import emitter from './emitter';

class QueryForm extends Component {
  constructor(props) {
    super(props);
    this.state = {queryText: 'SELECT * FROM csv'};
  }

  handleChange = (e) => {
    this.setState({queryText: e.target.value});
  }

  handleSubmit = (e) => {
    e.preventDefault();
    emitter.emit('runQuery', this.state.queryText);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} style={{marginBottom: '3em'}}>
        <FormGroup controlId="sql-query">
          <FormControl
            componentClass="textarea"
            onChange={this.handleChange}
            value={this.state.queryText}
          />
          <Button bsStyle="primary" style={{marginTop: '0.5em'}} className="pull-right" type="submit">Run Query</Button>
          <HelpBlock>Any <a href="https://sqlite.org/lang.html">valid SQLite query</a> is supported.</HelpBlock>
        </FormGroup>
      </form>
    );
  };
};

export default QueryForm;
