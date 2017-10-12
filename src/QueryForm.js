import React, { Component } from 'react';
import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Form from 'react-bootstrap/lib/Form';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import emitter from './emitter';

class QueryForm extends Component {
  constructor(props) {
    super(props);
    this.state = {value: 'SELECT * FROM csv'};
  }

  handleChange = (e) => {
    this.setState({value: e.target.value});
  }

  handleSubmit = (e) => {
    e.preventDefault();
    emitter.emit('runQuery', this.state.value);
  }

  render() {
    return (
      <Form inline onSubmit={this.handleSubmit}>
        <FormGroup>
          <ControlLabel>SQL Query</ControlLabel>
          {' '}
          <FormControl value={this.state.value} onChange={this.handleChange} />
        </FormGroup>
        {' '}
        <Button type="submit">Submit</Button>
      </Form>
    );
  };
};

export default QueryForm;
