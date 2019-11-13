import React, { Component } from 'react';

import JSONEditor from './JsonEditor/js/JSONEditor';
import './JsonEditor/scss/autocomplete.scss';
import './JsonEditor/scss/contextmenu.scss';
import './JsonEditor/scss/jsoneditor.scss';
import './JsonEditor/scss/menu.scss';
import './JsonEditor/scss/navigationbar.scss';
import './JsonEditor/scss/searchbox.scss';
import './JsonEditor/scss/statusbar.scss';
import './JsonEditor/scss/treepath.scss';
import './JsonEditor/scss/reset.scss';

import './JSONEditorDemo.css';

export default class JSONEditorDemo extends Component {
  componentDidMount() {
    const options = {
      mode: 'tree',
      onChangeJSON: this.props.onChangeJSON
    };

    this.jsoneditor = new JSONEditor(this.container, options);
    this.jsoneditor.set(this.props.json);
  }

  componentWillUnmount() {
    if (this.jsoneditor) {
      this.jsoneditor.destroy();
    }
  }

  componentDidUpdate() {
    this.jsoneditor.update(this.props.json);
  }

  render() {
    return (
      <div className="jsoneditor-react-container" ref={elem => this.container = elem} />
    );
  }
}
