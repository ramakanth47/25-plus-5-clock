import React from 'react';
import './App.css';
import IntervalController from './components/IntervalController.js';
import Timer from './components/Timer.js';
import Footer from './components/Footer.js';

class App extends React.Component {
  constructor(){
    super();
    this.state = {
      intervals: {
        break: 5,
        session: 25
      },
      isSession: true,
      isPaused: true,
      pausedTime: null,
      time: '25:00',
    }
    this.intervalTypes = Object.keys(this.state.intervals);
    this.handleChange = this.handleChange.bind(this);
    this.countDown = this.countDown.bind(this);
    this.pause = this.pause.bind(this);
    this.reset = this.reset.bind(this);
  }

  leftPad(value){
    if(value > 9){
      return value + '';
    } else {
      return '0' + value;
    }
  }

  handleChange(event){
    const buttonElementId = event.target.id;
    const [intervalType, intervalDirection] = buttonElementId.split('-');
    const intervals = {...this.state.intervals};
    
    if(intervalDirection === 'increment'){
      intervals[intervalType]++;
    } else {
      intervals[intervalType]--;
    }
    if(intervals[intervalType] >= 1 && intervals[intervalType] <= 60){
      this.setState({intervals});
      if(intervalType === 'session'){
        this.setState({time: `${this.leftPad(intervals[intervalType])}:00`})
      }
    }
  }

  getMinutes(){
    if(this.state.pausedTime !== null){
      return parseInt(this.state.pausedTime[0]);
    } else if(this.state.isSession){
      return this.state.intervals.session;
    } else {
      return this.state.intervals.break;
    }
  }

  getSeconds(){
    if(this.state.pausedTime !== null){
      return parseInt(this.state.pausedTime[1]);
    } else {
      return 0;
    }
  }

  controlAudio(action){
    const audio = document.getElementById('beep');
    if(action === 'rewind'){
      audio.currentTime = 0;
    } else {
      audio[action]();
    }
  }
  
  countDown(){
    this.setState({isPaused: false});
    let minutes = this.getMinutes();
    let seconds = this.getSeconds();
    
    this.interval = setInterval(() => {
      seconds--;
      if(seconds < 0){
        if(minutes > 0){
          seconds = 59;
          minutes--;
        } else {
          this.setState({isSession: !this.state.isSession})
          this.controlAudio('play');
          minutes = this.getMinutes();
          seconds = this.getSeconds();
        }
      }
      this.setState({time: `${this.leftPad(minutes)}:${this.leftPad(seconds)}`});
    }, 1000);
  }
  
  pause(){
    clearInterval(this.interval);
    this.setState({isPaused: true, pausedTime: this.state.time.split(':')})
  }

  reset(){
    clearInterval(this.interval);
    this.controlAudio('pause');
    this.controlAudio('rewind');
    this.setState({
      intervals: {
        break: 5,
        session: 25
      },
      isSession: true,
      isPaused: true,
      pausedTime: null,
      time: '25:00'
    });
  }
  
  render(){
    return <div>
      <h1>Tomato Timer</h1>
      {this.intervalTypes.map(type => <IntervalController key={type} type={type} length={this.state.intervals[type]} handleChange={this.handleChange}/>)}
      <Timer interval={this.state.isSession ? this.intervalTypes[1]: this.intervalTypes[0]} reset={this.reset} time={this.state.time} start={this.countDown} isPaused={this.state.isPaused} pause={this.pause}/>
      <Footer />
    </div>;
  }
}

export default App;