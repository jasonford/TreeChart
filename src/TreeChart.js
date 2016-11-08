import React from 'react';
import firebase from 'firebase';
import ReactFireMixin from 'reactfire';
import BreadCrumbs from './BreadCrumbs.js';
import TreeChartChild from './TreeChartChild.js';
import TreeChartChildEditor from './TreeChartChildEditor.js';
import makeRows from './makeRows.js';
import Keyboard from './Keyboard.js';
import './TreeChart.css';

let TreeChart = React.createClass({
  mixins : [ReactFireMixin],
  componentWillMount() {
    this.setState({
      path : this.props.path,
      focus : this.props.path,
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
    //  stop propagation between layers
    this.refs.root.addEventListener('dropped', function (event) {
      event.stopPropagation();
    });

    //  pressing first letter of 
    Keyboard.onPress('.', function (e) {
      let path;
      let focusedChild = self.props.focus ? self.props.focus() : self.focus();
      if (self.props.path === focusedChild) {
        if (e.pressed === 8) {
          path = self.props.path.split('/');
          path.pop();
          path.pop();
          path = path.join('/');
        }
        else {
          let elementTitleMatches = [];
          Object.keys(self.state.element.elements || {}).forEach((key)=>{
            let element = self.state.element.elements[key];
            if (element.title.toLowerCase().indexOf(e.pressed.toLowerCase()) === 0) {
              elementTitleMatches.push(key);
            }
          });
          if (elementTitleMatches.length === 1) {
            path = self.props.path + '/elements/' + elementTitleMatches[0];
          }
        }

        if (path) {
          if (self.props.focus) {
            self.props.focus(path);
          }
          else {
            self.focus(path);
          }
        }
        e.stopPropagation();
      }
    });
  },
  addElement(index) {
    this.firebaseRefs.element.child('elements').push({
      title : "New Element",
      index : index,
      importance : 1,
      elements : []
    });
  },
  moveChild(key, keyMoving, direction) {  //  move child at keyMoving before or after the child at key
    if (!this.state.element.elements[key]) {
      throw new Error('attemted to move a child to one that does not exist');
    }
    if (!this.state.element.elements[keyMoving]) {
      throw new Error('attemted to move a child that does not exist');
    }
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
    if (path) {
      if (path === '//') path = '/';
      this.setState({focus : path});
    }
    return this.state.focus;
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

    let focusedChild = self.props.focus ? self.props.focus() : self.focus();

    rows.forEach((row, rowIndex)=>{
      childElements.push(
        <div
          className="TreeChartRowDivider"
          key={'divider/'+rowIndex}></div>);

      row.columns.forEach((column, columnIndex)=>{
        function remove() {
          self.removeChild(column.key);
        }
        let path = self.props.path + '/elements/' + column.key;
        let visible = self.props.preview || focusedChild === self.props.path || focusedChild.indexOf(path) === 0; //  this one parent of focused child

        let height = row.height;
        if (focusedChild && focusedChild.indexOf(path) === 0) {
          height = '100%';
        }

        let location = {
          top :  rowIndex === 0,
          left : columnIndex === 0,
          right : columnIndex === row.columns.length-1,
          bottom : rowIndex === rows.length-1
        };

        childElements.push(
          <TreeChartChild
            path={path}
            key={column.key}
            visible={visible}
            location={location}
            preview={self.props.preview}
            height={height}
            focus={self.props.focus || self.focus} // pass back focus
            focused={focusedChild && focusedChild.indexOf(path) === 0}
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
      </div>
      <div ref="children" className="TreeChartChildren">
        {this.state.editing && !this.props.preview ? <TreeChartChildEditor path={this.state.editing} remove={stopEditing}/> : null}
        {childElements}
      </div>
    </div>;
  }
});

export default TreeChart;