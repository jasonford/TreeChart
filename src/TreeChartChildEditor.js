import React from 'react';
import firebase from 'firebase';
import ReactFireMixin from 'reactfire';

let types = ['none', 'TreeChart', 'Progress', 'Link', 'HTML'];

let TreeChartChildEditor = React.createClass({
  mixins : [ReactFireMixin],
  componentWillMount() {
    this.setState({
      path : this.props.path,
      element : {
        importance : 0
      }
    });
    let ref = firebase.database().ref(this.props.path).orderByChild("index");
    this.bindAsObject(ref, "element");
  },
  componentDidMount: function () {
    let self = this;
    this.refs.root.addEventListener('tap', (event)=>{
      if (event.target === self.refs.root) {
        self.props.remove();
      }
    })
  },
  update(field, validate) {
    let that = this;
    return function (e) {
      let update = {};
      update[field] = e.target.value;
      if (validate) {
        update[field] = validate(e.target.value);
      }
      firebase.database().ref(that.props.path).update(update);
    }
  },
  render() {
    return <div ref="root" className="TreeChartChildEditor">
      <input type="text" className="TreeChartChildEditorTitle" value={this.state.element.title} onChange={this.update('title')}/>
      <select className="TreeChartChildEditorImportance" default={this.state.element.importance} value={this.state.element.importance} onChange={this.update('importance', parseInt)}>
        {[1,2,3,4,5].map((importance)=>{return <option key={importance} value={importance}>{importance}</option>})}
      </select>
      <select className="TreeChartChildEditorType" default={this.state.element.type} value={this.state.element.type} onChange={this.update('type')}>
        {types.map((type)=>{return <option key={type} value={type}>{type}</option>})}
      </select>
    </div>;
  }
});

export default TreeChartChildEditor;