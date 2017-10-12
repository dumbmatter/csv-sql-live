import React, { Component } from 'react';
import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
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
      <form onSubmit={this.handleSubmit}>
        <FormGroup controlId="sql-query">
          <FormControl
            componentClass="textarea"
            onChange={this.handleChange}
            value={this.state.queryText}
          />
        </FormGroup>
        <Button bsStyle="primary" type="submit">Run Query</Button>
      </form>
    );
  };
};

export default QueryForm;
