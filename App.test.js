import React from 'react';
import { shallow, mount } from 'enzyme';
import App from './App';
import IntervalController from './components/IntervalController.js';
import Timer from './components/Timer.js';

//https://jestjs.io/docs/en/expect
//shallow: https://enzymejs.github.io/enzyme/docs/api/shallow.html
//mount: https://enzymejs.github.io/enzyme/docs/api/mount.html

const INITIAL_STATE =  {
  intervals: {
    break: 5,
    session: 25
  },
  isSession: true,
  isPaused: true,
  pausedTime: null,
  time: '25:00',
};
const INTERVAL_TYPES = Object.keys(INITIAL_STATE.intervals);
const BUTTON_ID_DIRECTIONS = ['decrement', 'increment'];

const audio = document.createElement('audio');
audio.id = 'beep';
const nonZeroTime = 500;
audio.currentTime = nonZeroTime;
audio.pause = jest.fn();
audio.play = jest.fn();
document.body.appendChild(audio);

it('App deeply renders as a smoke test', () => {
  mount(<App />);
});

it('renders App class child components, and initializes their props', () => {
  const app = shallow(<App />);
  
  const intervalController = app.find('IntervalController');
  expect(intervalController.exists()).toEqual(true);
  expect(intervalController).toHaveLength(INTERVAL_TYPES.length);
  intervalController.forEach((controller, i) => {
    expect(controller.prop('type')).toEqual(INTERVAL_TYPES[i]);
    expect(controller.prop('length')).toEqual(INITIAL_STATE.intervals[INTERVAL_TYPES[i]]);
    expect(controller.prop('handleChange')).toBeDefined();
  });
  
  const timer = app.find('Timer');
  expect(timer.exists()).toEqual(true);
  expect(timer.prop('interval')).toEqual(INTERVAL_TYPES[1]);
  expect(timer.prop('reset')).toBeDefined();
  expect(timer.prop('time')).toEqual(INITIAL_STATE.time);
  expect(timer.prop('start')).toBeDefined();
  expect(timer.prop('isPaused')).toEqual(INITIAL_STATE.isPaused);
  expect(timer.prop('pause')).toBeDefined();
  
  const footer = app.find('Footer');
  expect(footer.exists()).toEqual(true);
});

it('renders an IntervalController component with an h2 set to break, a p set to a valid break length, and buttons with ids indicating increment and decrement', () => {
  const breakIntervalType = INTERVAL_TYPES[0];
  const breakLength = INITIAL_STATE.intervals[breakIntervalType];
  const intervalController = shallow(<IntervalController type={breakIntervalType} length={breakLength} />);
  
  const h2 = intervalController.find('h2');
  expect(h2.prop('id')).toEqual(`${breakIntervalType}-label`);
  expect(h2.text()).toEqual(breakIntervalType);
  
  const buttons = intervalController.find('button');
  buttons.forEach((button, i) => {
    expect(button.prop('id')).toEqual(`${breakIntervalType}-${BUTTON_ID_DIRECTIONS[i]}`);
  });

  const p = intervalController.find('p');
  expect(p.prop('id')).toEqual(`${breakIntervalType}-length`);
  expect(p.text()).toEqual(`${breakLength}`);
});

it('renders an IntervalController component with an h2 set to session, a p set to a valid session length, and buttons with ids indicating increment and decrement', () => {
  const sessionIntervalType = INTERVAL_TYPES[1];
  const sessionLength = INITIAL_STATE.intervals[sessionIntervalType];
  const intervalController = shallow(<IntervalController type={sessionIntervalType} length={sessionLength} />);
  
  const h2 = intervalController.find('h2');
  expect(h2.prop('id')).toEqual(`${sessionIntervalType}-label`);
  expect(h2.text()).toEqual(sessionIntervalType);
  
  const buttons = intervalController.find('button');
  buttons.forEach((button, i) => {
    expect(button.prop('id')).toEqual(`${sessionIntervalType}-${BUTTON_ID_DIRECTIONS[i]}`);
  });

  const p = intervalController.find('p');
  expect(p.prop('id')).toEqual(`${sessionIntervalType}-length`);
  expect(p.text()).toEqual(`${sessionLength}`);
});

it('calls prop handleChange onClick with the IntervalController component decrement and increment buttons', () => {
  const handleChange = jest.fn();
  const intervalController = shallow(<IntervalController handleChange={handleChange} />);
  const buttons = intervalController.find('button');
  buttons.forEach(button => {
    button.simulate('click');
  });
  expect(handleChange.mock.calls.length).toEqual(buttons.length);
});

it('renders a Timer component with an h2 set to session and a p set to a valid session time', () => {
  const timer = shallow(<Timer interval={INTERVAL_TYPES[1]} time={INITIAL_STATE.time} />);
  
  const h2 = timer.find('h2');
  expect(h2.text()).toEqual(INTERVAL_TYPES[1]);
  
  const p = timer.find('p');
  expect(p.text()).toEqual(INITIAL_STATE.time);
});

it('renders a Timer component with isPaused is set to true and the start() prop method is called', () => {
  const start = jest.fn();
  const timer = shallow(<Timer isPaused={true} start={start}/>);

  const startStopButton = timer.find('#start_stop');
  startStopButton.simulate('click');
  expect(start).toHaveBeenCalled();

});

it('renders a Timer component with isPaused is set to false and the pause() prop method is called', () => {
  const pause = jest.fn();
  const timer = shallow(<Timer isPaused={false} pause={pause}/>);

  const startStopButton = timer.find('#start_stop');
  startStopButton.simulate('click');
  expect(pause).toHaveBeenCalled();
});

it('calls App class method handleChange() passing in an event with a target id of session-decrement and initial state values set', () => {
  const app = shallow(<App />);
  const EXPECTED_DECREMENTED_TIME = '24:00';
  const event = {
    target: {
      id: `${INTERVAL_TYPES[1]}-${BUTTON_ID_DIRECTIONS[0]}`
    }
  }
  app.instance().handleChange(event);

  const sessionIntervalController = app.find('IntervalController').at(1);
  expect(sessionIntervalController.prop('length')).toEqual(INITIAL_STATE.intervals.session - 1);

  const timer = app.find('Timer');
  expect(timer.prop('time')).toEqual(EXPECTED_DECREMENTED_TIME);
});

it('calls App class method handleChange() passing in an event with a target id of session-increment and initial state values set', () => {
  const app = shallow(<App />);
  const EXPECTED_INCREMENTED_TIME = '26:00';
  const event = {
    target: {
      id: `${INTERVAL_TYPES[1]}-${BUTTON_ID_DIRECTIONS[1]}`
    }
  }
  app.instance().handleChange(event);

  const sessionIntervalController = app.find('IntervalController').at(1);
  expect(sessionIntervalController.prop('length')).toEqual(INITIAL_STATE.intervals.session + 1);

  const timer = app.find('Timer');
  expect(timer.prop('time')).toEqual(EXPECTED_INCREMENTED_TIME);
});

it('calls App class method handleChange() passing in an event with a target id of session-increment with session state value set to a value < 9', () => {
  const app = shallow(<App />);
  const EXPECTED_INCREMENTED_TIME = '02:00';
  const EXPECTED_INCREMENTED_LENGTH = 2;
  app.setState({
    intervals: {
      session: 1
    },
    time: '01:00'
  });
  const event = {
    target: {
      id: `${INTERVAL_TYPES[1]}-${BUTTON_ID_DIRECTIONS[1]}`
    }
  }
  app.instance().handleChange(event);

  const sessionIntervalController = app.find('IntervalController').at(1);
  expect(sessionIntervalController.prop('length')).toEqual(EXPECTED_INCREMENTED_LENGTH);

  const timer = app.find('Timer');
  expect(timer.prop('time')).toEqual(EXPECTED_INCREMENTED_TIME);
});

it('calls App class method handleChange() passing in an event with a target id of session-decrement on a session value set to 1 which will not change the value', () => {
  const app = shallow(<App />);
  const EXPECTED_LENGTH = 1;
  const EXPECTED_TIME = '01:00';
  app.setState({
    intervals: {
      session: 1
    },
    time: '01:00'
  });
  const event = {
    target: {
      id: `${INTERVAL_TYPES[1]}-${BUTTON_ID_DIRECTIONS[0]}`
    }
  }
  app.instance().handleChange(event);

  const sessionIntervalController = app.find('IntervalController').at(1);
  expect(sessionIntervalController.prop('length')).toEqual(EXPECTED_LENGTH);

  const timer = app.find('Timer');
  expect(timer.prop('time')).toEqual(EXPECTED_TIME);
});

it('calls App class method handleChange() passing in an event with a target id of session-increment on a session value set to 60 which will not change the value', () => {
  const app = shallow(<App />);
  const EXPECTED_LENGTH = 60;
  const EXPECTED_TIME = '60:00';
  app.setState({
    intervals: {
      session: 60
    },
    time: '60:00'
  });
  const event = {
    target: {
      id: `${INTERVAL_TYPES[1]}-${BUTTON_ID_DIRECTIONS[1]}`
    }
  }
  app.instance().handleChange(event);

  const sessionIntervalController = app.find('IntervalController').at(1);
  expect(sessionIntervalController.prop('length')).toEqual(EXPECTED_LENGTH);

  const timer = app.find('Timer');
  expect(timer.prop('time')).toEqual(EXPECTED_TIME);
});

it('calls App class method handleChange() passing in an event with a target id of break-decrement and initial state values set ensuring Timer time prop does not change', () => {
  const app = shallow(<App />);
  const EXPECTED_DECREMENTED_TIME = '25:00';
  const event = {
    target: {
      id: `${INTERVAL_TYPES[0]}-${BUTTON_ID_DIRECTIONS[0]}`
    }
  }
  app.instance().handleChange(event);

  const breakIntervalController = app.find('IntervalController').at(0);
  expect(breakIntervalController.prop('length')).toEqual(INITIAL_STATE.intervals.break - 1);

  const timer = app.find('Timer');
  expect(timer.prop('time')).toEqual(EXPECTED_DECREMENTED_TIME);
});

it('calls App class method countDown() with initial state set advancing Timer prop time by 60000ms to 24:00', () => {
  jest.useFakeTimers();
  const app = shallow(<App />);
  app.instance().countDown();
  let timer = app.find('Timer');
  expect(timer.prop('time')).toEqual(INITIAL_STATE.time);

  jest.advanceTimersByTime(60000);
  const EXPECTED_TIME_AFTER_60000ms = '24:00';
  expect(setInterval).toHaveBeenCalledTimes(1);
  timer = app.find('Timer');
  expect(timer.prop('time')).toEqual(EXPECTED_TIME_AFTER_60000ms);
});

it('calls App class method countDown() with pausedTime set to 23:00 advancing Timer prop time by 60000ms to 22:00', () => {
  jest.useFakeTimers();
  const app = shallow(<App />);
  app.setState({
    time: '23:00',
    pausedTime: ['23', '00']
  });
  app.instance().countDown();
  let timer = app.find('Timer');
  expect(timer.prop('time')).toEqual('23:00');
  
  jest.advanceTimersByTime(60000);
  const EXPECTED_TIME_AFTER_60000ms = '22:00';
  expect(setInterval).toHaveBeenCalledTimes(1);
  timer = app.find('Timer');
  expect(timer.prop('time')).toEqual(EXPECTED_TIME_AFTER_60000ms);
});

it('calls App class method countDown() with Timer component prop set to 00:31 after 90000ms due to session to break switch off by one expectation', () => {
  jest.useFakeTimers();
  const app = shallow(<App />);
  app.setState({
    intervals: {
      break: 1,
      session: 1
    },
    time: '01:00'
  });
  app.instance().countDown();
  let timer = app.find('Timer');
  expect(timer.prop('time')).toEqual('01:00');
  
  jest.advanceTimersByTime(90000);
  const EXPECTED_TIME_AFTER_60000ms = '00:31';
  expect(setInterval).toHaveBeenCalledTimes(1);
  timer = app.find('Timer');
  expect(timer.prop('time')).toEqual(EXPECTED_TIME_AFTER_60000ms);

  expect(audio.play).toHaveBeenCalled();
});

it('calls App class method pause() with clearInterval() called, pausedTime set to initial value after call, and Timer prop isPaused set to true', () => {
  jest.useFakeTimers();
  const app = shallow(<App />);
  app.instance().pause();
  const timer = app.find('Timer');
  expect(clearInterval).toHaveBeenCalledTimes(1);
  expect(app.state().pausedTime).toEqual(['25', '00']);
  expect(timer.prop('isPaused')).toEqual(true);
});

it('calls App class method reset() with child component props set to their initial state values and audio methods pause() and reset() called', () => {
  const app = shallow(<App />);
  app.instance().reset();
  expect(audio.pause).toHaveBeenCalled();
  expect(audio.currentTime).toEqual(0);

  const intervalController = app.find('IntervalController');
  intervalController.forEach((controller, i) => {
    expect(controller.prop('length')).toEqual(INITIAL_STATE.intervals[INTERVAL_TYPES[i]]);
  });
  
  const timer = app.find('Timer');
  expect(timer.prop('time')).toEqual(INITIAL_STATE.time);
  expect(timer.prop('isPaused')).toEqual(INITIAL_STATE.isPaused);
});