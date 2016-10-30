import React from 'react';
import firebase from 'firebase';
import ReactFireMixin from 'reactfire';
import BreadCrumbs from './BreadCrumbs.js';
import TreeChartChild from './TreeChartChild.js';
import TreeChartChildEditor from './TreeChartChildEditor.js';
import makeRows from './makeRows.js'
import './TreeChart.css';

let TreeChart = React.createClass({
  mixins : [ReactFireMixin],
  componentWillMount() {
    this.setState({
      path : this.props.path,
      focus : false,
      element : { // start with empty element designed to show loading
        elements : {}
      }
    });
    let ref = firebase.database().ref(this.props.path);
    this.bindAsObject(ref, "element");
  },
  componentDidMount: function () {
    //  add event listeners
    let self = this;
    //  hold left right or center to edit
    this.refs.children.addEventListener('hold', function (event) {
      event.stopPropagation();
      if (event.childKey) {
        let child = self.state.element.elements[event.childKey];
        let orderedChildren = Object.values(self.state.element.elements).sort(function (a, b) {
          return a.index - b.index;
        });
        let childIndex = orderedChildren.indexOf(child);

        if (event.childPosition.x > 0.67) {
          if (childIndex === orderedChildren.length-1){
            self.addElement(child.index + 1);
          }
          else {
            //  add element between current element and the one after it
            self.addElement((child.index + orderedChildren[childIndex+1].index)/2);
          }
        }
        else if (event.childPosition.x < 0.33) {
          if (childIndex === 0) {
            self.addElement(child.index - 1);
          }
          else {
            //  add element between current element and the one before it
            self.addElement((child.index + orderedChildren[childIndex-1].index)/2);
          }
        }
        else {
          self.setState({
            editing : event.dataPath
          });
        }
      }
      else {
        self.addElement(0);
      }
    });
    this.refs.children.addEventListener('tap', function (event) {
      event.stopPropagation();
      if (event.dataPath) {
        self.setState({focus : event.dataPath});
      }
    });
    //  stop propagation between layers
    this.refs.root.addEventListener('dropped', function (event) {
      event.stopPropagation();
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
  moveChild(key, keyMoving, direction) {
    let self = this;
    let child = self.state.element.elements[key];
    let orderedChildren = Object.values(self.state.element.elements).sort(function (a, b) {
      return a.index - b.index;
    });
    let childIndex = orderedChildren.indexOf(child);
    let updatedIndex = null;

    if (direction > 0) {
      if (childIndex < orderedChildren.length-1) {
        updatedIndex = (child.index + orderedChildren[childIndex+1].index)/2;
      }
      else {
        updatedIndex = child.index + 1;
      }
    }
    else {
      if (childIndex === 0) {
        updatedIndex = child.index - 1;
      }
      else {
        updatedIndex = (child.index + orderedChildren[childIndex-1].index)/2;
      }
    }
    firebase.database().ref(this.props.path + '/elements/' + keyMoving).update({
      index : updatedIndex
    });

  },
  removeChild(key) {
    firebase.database().ref(this.props.path + '/elements/' + key).remove();
  },
  focus(path) {
    this.setState({focus : path});
  },
  render() {
    let self = this;

    //  ensure key is available
    Object.keys(this.state.element.elements || {}).forEach((key)=>{
      self.state.element.elements[key].key = key;
    });

    let orderedChildren = Object.values(this.state.element.elements || {}).sort(function (a, b) {
      return a.index - b.index;
    });

    let rows = makeRows(orderedChildren);

    let childElements = [];

    let focusedChild = self.state.focus;

    rows.forEach((row, index)=>{
      childElements.push(
        <div
          className="TreeChartRowDivider"
          key={'divider/'+index}></div>);

      row.columns.forEach((column)=>{
        function remove() {
          self.removeChild(column.key);
        }
        let path = self.props.path + '/elements/' + column.key;
        let visible = focusedChild === false
                   || focusedChild === path
                   || focusedChild === self.props.path; //  focusing on self
        let height = row.height;
        if (focusedChild === path) {
          height = '100%';
        }

        childElements.push(
          <TreeChartChild
            path={path}
            key={column.key}
            visible={visible}
            height={height}
            focused={focusedChild === path}
            move={self.moveChild}
            remove={remove}/>);
      });
    });

    function stopEditing() {
      self.setState({editing:false});
    }

    return <div ref="root" className="TreeChart">
      <div className="TreeChartHeader">
        {this.props.isChild ? null : <BreadCrumbs focus={this.focus} path={this.state.focus || this.state.path}/>}
        {this.state.editing ? <TreeChartChildEditor path={this.state.editing} remove={stopEditing}/> : null}
      </div>
      <div ref="children" className="TreeChartChildren">
        {childElements}
      </div>
    </div>;
  }
});

export default TreeChart;