import React from 'react';
import firebase from 'firebase';
import ReactFireMixin from 'reactfire';
import TreeChart from './TreeChart.js';

let TreeChartChild = React.createClass({
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
    let key = self.state.element['.key'];
    //  add event listeners
    this.refs.root.addEventListener("hold", (event)=>{
      //  send info about self to parent
      event.dataPath = self.props.path;
      event.childKey = key;
      let br = self.refs.root.getBoundingClientRect();
      event.childPosition = { //  normalized
        x : (event.x - br.left) / br.width,
        y : (event.y - br.top ) / br.height
      };
    });
    this.refs.root.addEventListener("dragone", (event)=>{
      event.stopPropagation();
      if (self.props.focused) return;
      self.refs.root.style.transform = 'translate(' + event.tx + 'px,'+ event.ty + 'px)';
      self.refs.root.style.zIndex = 1;
    });
    this.refs.root.addEventListener("tap", (event)=>{
      event.stopPropagation();
      self.props.focus(self.props.path);
    });
    this.refs.root.addEventListener("drop", (event)=>{
      event.stopPropagation();
      self.refs.root.style.transform = 'translate(0px,0px)';
      self.refs.root.style.zIndex = 0;
      //  TODO: high velocity off edge should trigger remove too
      if (event.x > window.innerWidth
      ||  event.y > window.innerHeight
      ||  event.x < 0
      ||  event.y < 0) {
        self.props.remove();
      }
      event.targetData.droppedData = self.props.path;
      event.targetData.droppedKey = key;
    });
    this.refs.root.addEventListener("dropped", (event)=>{
      event.stopPropagation();
      if (event.targetData.droppedKey) {
        let br = self.refs.root.getBoundingClientRect();
        if ((event.x - br.left) / br.width > 0.5) {
          self.props.move(key, event.targetData.droppedKey, 1);
        }
        else {
          self.props.move(key, event.targetData.droppedKey, -1);
        }
      }
    });
  },
  render() {
    let style = {
      flexGrow : 0,
      height : 0
    };

    if (this.props.visible) {
      style = {
        flexGrow : this.state.element.importance,
        height : this.props.height
      };
    }

    let titleClasses = "TreeChartChildTitle";
    if (this.props.location.top   ) titleClasses += " Top";
    if (this.props.location.left  ) titleClasses += " Left";
    if (this.props.location.right ) titleClasses += " Right";
    if (this.props.location.bottom) titleClasses += " Bottom";

    let content;
    if (this.props.focused) {
      content = <div className={titleClasses}>
        <TreeChart path={this.props.path} isChild={true} focus={this.props.focus} />
      </div>
    }
    else {
      content = <div className={titleClasses}>
        <TreeChart path={this.props.path} preview={true} isChild={true} focus={this.props.focus} />
      </div>
    }

    return <div ref="root" className="TreeChartChild" style={style}>
      <div className="TreeChartChildInner">
        {content}
        {this.props.focused || this.props.preview ? null : <div className="TreeChartChildTitle">{this.state.element.title || this.props.childIndex+1}</div>}
      </div>
    </div>
  }
});

export default TreeChartChild;