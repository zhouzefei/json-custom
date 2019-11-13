import React, { Component } from 'react';

import JSONEditorDemo from './JSONEditorDemo';
import './App.css';

class App extends Component {
  state = {
    json: {
      'array': [1, 2, 3],
      'boolean': true,
      'null': null,
      'number': 123,
      'object': { 'a': 'b', 'c': 'd' },
      'string': 'Hello World'
    }
  };

  render() {
    return (
      <div className="app">
        <div className="contents">
          <JSONEditorDemo
            json={this.state.json}
            onChangeJSON={this.onChangeJSON}
          />
        </div>
      </div>
    );
  }

  onChangeJSON = (json) => {
    this.setState({ json });
  };

  updateTime = () => {
    const time = new Date().toISOString();

    this.setState({
      json: Object.assign({}, this.state.json, { time })
    })
  };
}

export default App;
