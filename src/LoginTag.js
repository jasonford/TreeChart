import React from 'react';
import firebase from 'firebase';
import ReactFireMixin from 'reactfire';

let TreeChart = React.createClass({
  mixins : [ReactFireMixin],
  componentWillMount() {
    let self = this;
    self.setState({pendingUser : true});
    firebase.auth().onAuthStateChanged((user)=>{
      self.setState({
        user : user,
        pendingUser : false,
        signingIn : false
      });
    });
  },
  componentDidMount() {
    let self = this;
    function signInOrCreate() {
      let email = self.refs.email.value;
      let password = self.refs.password.value;
      self.setState({
        signInState : 'signingIn'
      });
      firebase.auth().signInWithEmailAndPassword(email, password)
      .then(()=>{
        self.setState({
          signInState : 'signedIn'
        });
      })
      .catch(function(error) {
        //  TODO: make errors visible
        if(error.code === 'auth/invalid-email') {
          self.setState({
            signInState : error.code
          });
        }
        else if (error.code === 'auth/user-not-found') {
          firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
            self.setState({
              signInState : error.code
            });
          }).then(()=>{
            self.setState({
              signInState : 'signedIn'
            });
          });
        }
        else {
          self.setState({
            signInState : error.code
          });
        }
      })
      // TODO: trigger signing in state
    }

    function submitEmailPassword(event) {
      if (event.charCode === 13) {
        signInOrCreate();
      }
    }
    this.refs.email.addEventListener('keypress', submitEmailPassword);
    this.refs.password.addEventListener('keypress', submitEmailPassword);
    this.refs.signIn.addEventListener('tap', signInOrCreate);
    this.refs.signOut.addEventListener('tap', ()=>{
      self.setState({
        user : null,
        pendingUser : false
      });
      firebase.auth().signOut();
    })
  },
  render() {
    let signingIn = this.state.signInState === 'signingIn';
    let loginFormStyle = {
      display : this.state.pendingUser || this.state.user || this.state.signinState === 'signingIn' ? 'none' : null,
      opacity : signingIn ? 0.5 : 1
    };
    let loginEmailStyle = {
      background : this.state.signInState === 'auth/invalid-email' ? 'tomato' : null,
    };
    let loginPasswordStyle = {
      background : this.state.signInState === 'auth/wrong-password' ? 'tomato' : null,
    };
    let userInfoStyle = {
      display : this.state.user ? null : 'none',
    };
    let username = 'Anonymous';
    if (this.state.user) {
      username = this.state.user.displayName || this.state.user.email;
    }
    return <div className="LoginTag">
      <div style={loginFormStyle}>
        <input style={loginEmailStyle} disabled={signingIn} type="text" placeholder="email" ref="email"/>
        <input style={loginPasswordStyle} disabled={signingIn} type="password" placeholder="password" ref="password" />
        <button ref="signIn" disabled={signingIn}>sign in/up</button>
      </div>
      <div style={userInfoStyle}>
        <span>{username}</span>
        <button className="LoginTagSignOut" ref="signOut">sign out</button>
      </div>
    </div>
  }
});

export default TreeChart;