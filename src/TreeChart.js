import React from 'react';
import firebase from 'firebase';
import ReactFireMixin from 'reactfire';
import BreadCrumbs from './BreadCrumbs.js';
import TreeChartChild from './TreeChartChild.js';
import './TreeChart.css';

function makeRows(items) {
  //  get total importance so we have a metric for the average row importance
  let totalImportance = 0;
  items.forEach((item)=>{
    totalImportance += item.importance;
  });

  //  for a square viewport, ideally a the square of the total importance will be the average importance of a row
  let averageRowImportance = Math.pow(totalImportance, 1/2)

  let currentRow = {
    importance : 0,
    height : 0,
    columns : []
  };

  let rows = [currentRow];
  items.forEach((item, index) => {
    
    // add item to row and update row properties
    currentRow.columns.push(item);
    currentRow.importance += item.importance;
    currentRow.totalImportance = totalImportance;
    currentRow.height = currentRow.importance/totalImportance*100 + '%';

    //  decide to advance to next row or not
    //  biased toward accepting more on a row (screens usually wider than tall)
    if (currentRow.importance > averageRowImportance && index < items.length - 1) {
      currentRow = {
        importance : 0,
        columns : [],
        height : 0
      }
    }
  });
  return rows;
}

let TreeChart = React.createClass({
  mixins : [ReactFireMixin],
  componentWillMount() {
    this.setState({
      path : this.props.path
    });
    let ref = firebase.database().ref(this.props.elementKey).orderByChild("index");
    this.bindAsObject(ref, "element");
  },
  componentDidMount: function () {
    //  add event listeners
  },
  render() {
    if (!this.state.element) return <div>loading</div>;
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
          className="TreeChartDivider active"
          key={'divider/'+index}></div>);

      row.columns.forEach((column)=>{
        childElements.push(
          <TreeChartChild
            path={self.props.path + 'elements/' + column.key}
            key={column.key}
            height={row.height}/>);
      });
    });

    return <div className="TreeChart">
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