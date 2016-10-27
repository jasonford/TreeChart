import React from 'react';
import firebase from 'firebase';
import ReactFireMixin from 'reactfire';
import BreadCrumbs from './BreadCrumbs.js';
import TreeChartChild from './TreeChartChild.js';
import makeRows from './makeRows.js'
import './TreeChart.css';

let TreeChart = React.createClass({
  mixins : [ReactFireMixin],
  componentWillMount() {
    this.setState({
      path : this.props.path,
      element : { // start with empty element designed to show loading
        elements : []
      }
    });
    let ref = firebase.database().ref(this.props.elementKey);
    this.bindAsObject(ref, "element");
  },
  componentDidMount: function () {
    //  add event listeners
    let self = this;
    this.refs.root.addEventListener('doubletap', function (event) {
      //  TODO: get index of child at position and before and after to choose index for new child
      if (event.childPosition.x > 0.5) {
        console.log('add right');
        self.addElement(1);
      }
      else {
        console.log('add left');
        self.addElement(-1);
      }
    });
  },
  addElement(index) {
    index = index || 1;
    if (this.state.element.elements) {
      index = Object.keys(this.state.element.elements).length;
    }
    this.firebaseRefs.element.child('elements').push({
      title : "",
      index : index,
      importance : 1,
      elements : []
    });
  },
  removeChild(key) {
    firebase.database().ref(this.props.path + 'elements/' + key).remove();
  },
  render() {
    let self = this;

    //  ensure key is available
    Object.keys(this.state.element.elements).forEach((key)=>{
      self.state.element.elements[key].key = key;
    });

    let orderedChildren = Object.values(this.state.element.elements).sort(function (a, b) {
      return a.index - b.index;
    });

    let rows = makeRows(orderedChildren);

    let childElements = [];

    rows.forEach((row, index)=>{
      childElements.push(
        <div
          className="TreeChartRowDivider"
          key={'divider/'+index}></div>);

      row.columns.forEach((column)=>{
        function remove() {
          self.removeChild(column.key);
        }
        childElements.push(
          <TreeChartChild
            path={self.props.path + 'elements/' + column.key}
            key={column.key}
            height={row.height}
            remove={remove}/>);
      });
    });

    return <div ref="root" className="TreeChart">
      <div className="TreeChartHeader">
        {this.props.isChild ? null : <BreadCrumbs path={this.state.path}/>}
      </div>
      <div className="TreeChartChildren">
        {childElements}
      </div>
    </div>;
  }
});

export default TreeChart;