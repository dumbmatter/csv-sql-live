import Papa from 'papaparse';
import React, { Component } from 'react';
import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import sql from 'sql.js';
import emitter from './emitter';

const parse = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: ({data}) => {
        resolve(data);
      },
      error: reject,
    });
  })
};

const createDB = (data) => {
  emitter.emit('updateState', {
    status: 'creating-db',
  });

  const db = new sql.Database();

  const cols = data.shift();

  const query = `CREATE TABLE csv (${cols.map((col) => `${col} TEXT`).join(',')});`;
  db.run(query);

  const insertStmt = db.prepare(`INSERT INTO csv VALUES (${cols.map((val) => '?').join(',')})`);
  for (const row of data) {
    if (row.length !== cols.length) {
      console.log('skipping row', row);
      continue;
    }
    
    insertStmt.run(row);
  }
  insertStmt.free();

  emitter.emit('updateState', {
    db,
    status: 'loaded',
  });

  return db;
};

const handleFile = async (e) => {
  try {
    emitter.emit('updateState', {
      status: 'parsing-data',
    });
    const file = e.target.files[0];

    if (!file) {
        return;
    }

    const data = await parse(file);
    const db = createDB(data);

  } catch (err) {
    console.error(err);
    emitter.emit('updateState', {
      errorMsg: err.message,
      status: 'error',
    });
  }
};

const LoadCSVButton = () => {
  return (
    <FormGroup>
      <ControlLabel className="btn btn-primary btn-lg">
        Select CSV File
        <FormControl
            type="file"
            onChange={handleFile}
            style={{display: 'none'}}
        />
      </ControlLabel>
    </FormGroup>
  );
};

class TextCSVForm extends Component {
  constructor(props) {
    super(props);
    this.state = {csvText: ''};
  }

  handleChange = (e) => {
    this.setState({csvText: e.target.value});
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    try {
      emitter.emit('updateState', {
        status: 'parsing-data',
      });

      const data = await parse(this.state.csvText);
      const db = createDB(data);

    } catch (err) {
      console.error(err);
      emitter.emit('updateState', {
        errorMsg: err.message,
        status: 'error',
      });
    }
  }

  render() {
    return <form onSubmit={this.handleSubmit}>
      <FormGroup controlId="csv-text">
        <ControlLabel>
          Paste a CSV file here
        </ControlLabel>
        <FormControl
          componentClass="textarea"
          onChange={this.handleChange}
          rows={10}
          value={this.state.csvText}
        />
      </FormGroup>
      <Button type="submit">Submit</Button>
    </form>;
  }
}

const LoadData = () => {
  return <div style={{fontSize: '18px'}}>
    <div style={{textAlign: 'center'}}>
      <LoadCSVButton />
      <p style={{margin: '2em 0'}}>or</p>
    </div>
    <TextCSVForm />
  </div>;
};

export default LoadData;
