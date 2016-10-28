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
        elements : {}
      }
    });
    let ref = firebase.database().ref(this.props.elementKey);
    this.bindAsObject(ref, "element");
  },
  componentDidMount: function () {
    //  add event listeners
    let self = this;
    this.refs.root.addEventListener('doubletap', function (event) {
      if (event.childKey) {
        let child = self.state.element.elements[event.childKey];
        let orderedChildren = Object.values(self.state.element.elements).sort(function (a, b) {
          return a.index - b.index;
        });
        let childIndex = orderedChildren.indexOf(child);

        if (event.childPosition.x > 0.5) {
          if (childIndex === orderedChildren.length-1){
            self.addElement(child.index + 1);
          }
          else {
            //  add element between current element and the one after it
            self.addElement((child.index + orderedChildren[childIndex+1].index)/2);
          }
        }
        else {
          if (childIndex === 0) {
            self.addElement(child.index - 1);
          }
          else {
            //  add element between current element and the one before it
            self.addElement((child.index + orderedChildren[childIndex-1].index)/2);
          }
        }
      }
      else {
        self.addElement(0);
      }
    });
  },
  addElement(index) {
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
    Object.keys(this.state.element.elements || {}).forEach((key)=>{
      self.state.element.elements[key].key = key;
    });

    let orderedChildren = Object.values(this.state.element.elements || {})
    .sort(function (a, b) {
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