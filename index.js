/* The maximum number of minutes in a period (a day) */

const MAX_IN_PERIOD = 1440;
const MIN_IN_PERIOD = 0;

/**
 * PART 1
 *
 * You have an appliance that uses energy, and you want to calculate how
 * much energy it uses over a period of time.
 *
 * As an input to your calculations, you have a series of events that contain
 * a timestamp and the new state (on or off). You are also given the initial
 * state of the appliance. From this information, you will need to calculate
 * the energy use of the appliance i.e. the amount of time it is switched on.
 *
 * The amount of energy it uses is measured in 1-minute intervals over the
 * period of a day. Given there is 1440 minutes in a day (24 * 60), if the
 * appliance was switched on the entire time, its energy usage would be 1440.
 * To simplify calculations, timestamps range from 0 (beginning of the day)
 * to 1439 (last minute of the day).
 *
 * HINT: there is an additional complication with the last two tests that
 * introduce spurious state change events (duplicates at different time periods).
 * Focus on getting these tests working after satisfying the first tests.
 *
 * The structure for `profile` looks like this (as an example):
 * ```
 * {
 *    initial: 'on',
 *    events: [
 *      { state: 'off', timestamp: 50 },
 *      { state: 'on', timestamp: 304 },
 *      { state: 'off', timestamp: 600 },
 *    ]
 * }
 * ```
 */

const ON_STATE = 'on';
const OFF_STATE = 'off';
const AUTO_OFF_STATE = 'auto-off';

const BASE_ON_OFF_ERROR = 'state is neither on nor off';
const BASE_ON_OFF_AUTO_ERROR = 'state should be one of on, off or auto-off';

const PROFILE_ERRORS = {
  MISSING_INITIAL_STATE_AND_EVENTS:
    'profile is missing initial state and events',
  MISSING_INITIAL_STATE: 'profile is missing initial state',
  MISSING_EVENTS: 'profile is missing events',
};

const EVENTS_ERRORS = {
  NOT_AN_INTEGER_TIMESTAMP: 'event timestamp is not an integer',
  NEGATIVE_TIMESTAMP: 'event timestamp cannot be less than 0',
  EXCEEDING_TIMESTAMP: 'event timestamp exceed the maximum timestamp 1439',
};

const checkEvents = (events, { validStates, errorMessage }) => {
  for (let i = 0; i < events.length; i++) {
    if (!validStates.includes(events[i].state)) {
      throw new Error('event ' + errorMessage);
    }
    if (!isInteger(events[i].timestamp)) {
      throw new Error(EVENTS_ERRORS.NOT_AN_INTEGER_TIMESTAMP);
    }
    if (events[i].timestamp < 0) {
      throw new Error(EVENTS_ERRORS.NEGATIVE_TIMESTAMP);
    }
    if (events[i].timestamp >= MAX_IN_PERIOD) {
      throw new Error(EVENTS_ERRORS.EXCEEDING_TIMESTAMP);
    }
  }
};

const checkProfile = (profile, { validStates, errorMessage }) => {
  const { initial, events } = profile;

  if (!initial && !events) {
    throw new Error(PROFILE_ERRORS.MISSING_INITIAL_STATE_AND_EVENTS);
  }

  if (!initial) {
    throw new Error(PROFILE_ERRORS.MISSING_INITIAL_STATE);
  }

  if (!events) {
    throw new Error(PROFILE_ERRORS.MISSING_EVENTS);
  }
  if (!validStates.includes(initial)) {
    throw new Error('initial ' + errorMessage);
  }
  checkEvents(events, { validStates, errorMessage });
};

const calculateEnergyUsageSimple = (profile) => {
  checkProfile(profile, {
    validStates: [ON_STATE, OFF_STATE],
    errorMessage: BASE_ON_OFF_ERROR,
  });

  const { initial, events } = profile;

  events.sort((a, b) => a.timestamp - b.timestamp);

  let currentEvent = { timestamp: MIN_IN_PERIOD, state: initial };
  let totalTimeOn = MIN_IN_PERIOD;

  for (let i = 0; i < events.length; i++) {
    // Handling the case where there are several duplicate state following each other
    // We just ignore the current event
    if (currentEvent.state === events[i].state) {
      continue;
    }
    if (currentEvent.state === ON_STATE) {
      totalTimeOn += events[i].timestamp - currentEvent.timestamp;
    }
    currentEvent = events[i];
  }
  // If the last event is on, we need to add it to the time on
  if (currentEvent.state === ON_STATE) {
    totalTimeOn += MAX_IN_PERIOD - currentEvent.timestamp;
  }

  return totalTimeOn;
};

/**
 * PART 2
 *
 * You purchase an energy-saving device for your appliance in order
 * to cut back on its energy usage. The device is smart enough to shut
 * off the appliance after it detects some period of disuse, but you
 * can still switch on or off the appliance as needed.
 *
 * You are keen to find out if your shiny new device was a worthwhile
 * purchase. Its success is measured by calculating the amount of
 * energy *saved* by device.
 *
 * To assist you, you now have a new event type that indicates
 * when the appliance was switched off by the device (as opposed to switched
 * off manually). Your new states are:
 * * 'on'
 * * 'off' (manual switch off)
 * * 'auto-off' (device automatic switch off)
 *
 * (The `profile` structure is the same, except for the new possible
 * value for `initial` and `state`.)
 *
 * Write a function that calculates the *energy savings* due to the
 * periods of time when the device switched off your appliance. You
 * should not include energy saved due to manual switch offs.
 *
 * You will need to account for redundant/non-sensical events e.g.
 * an off event after an auto-off event, which should still count as
 * an energy savings because the original trigger was the device
 * and not manual intervention.
 */

const calculateEnergySavings = (profile) => {
  checkProfile(profile, {
    validStates: [ON_STATE, OFF_STATE, AUTO_OFF_STATE],
    errorMessage: BASE_ON_OFF_AUTO_ERROR,
  });

  const { initial, events } = profile;

  events.sort((a, b) => a.timestamp - b.timestamp);

  let currentEvent = { timestamp: MIN_IN_PERIOD, state: initial };
  let totalTimeSaved = MIN_IN_PERIOD;

  for (let i = 0; i < events.length; i++) {
    if (
      currentEvent.state === events[i].state ||
      (currentEvent.state === AUTO_OFF_STATE &&
        events[i].state === OFF_STATE) ||
      (currentEvent.state === OFF_STATE && events[i].state === AUTO_OFF_STATE)
    ) {
      continue;
    }
    if (currentEvent.state === AUTO_OFF_STATE) {
      totalTimeSaved += events[i].timestamp - currentEvent.timestamp;
    }
    currentEvent = events[i];
  }
  if (currentEvent.state === AUTO_OFF_STATE) {
    totalTimeSaved += MAX_IN_PERIOD - currentEvent.timestamp;
  }
  return totalTimeSaved;
};

/**
 * PART 3
 *
 * The process of producing metrics usually requires handling multiple days of data. The
 * examples so far have produced a calculation assuming the day starts at '0' for a single day.
 *
 * In this exercise, the timestamp field contains the number of minutes since a
 * arbitrary point in time (the "Epoch"). To simplify calculations, assume:
 *  - the Epoch starts at the beginning of the month (i.e. midnight on day 1 is timestamp 0)
 *  - our calendar simply has uniform length 'days' - the first day is '1' and the last day is '365'
 *  - the usage profile data will not extend more than one month
 *
 * Your function should calculate the energy usage over a particular day, given that
 * day's number. It will have access to the usage profile over the month.
 *
 * It should also throw an error if the day value is invalid i.e. if it is out of range
 * or not an integer. Specific error messages are expected - see the tests for details.
 *
 * (The `profile` structure is the same as part 1, but remember that timestamps now extend
 * over multiple days)
 *
 * HINT: You are encouraged to re-use `calculateEnergyUsageSimple` from PART 1 by
 * constructing a usage profile for that day by slicing up and rewriting up the usage profile you have
 * been given for the month.
 */

const isInteger = (number) => Number.isInteger(number);

const calculateEnergyUsageForDay = (monthUsageProfile, day) => {};

module.exports = {
  calculateEnergyUsageSimple,
  calculateEnergySavings,
  calculateEnergyUsageForDay,
  MAX_IN_PERIOD,
};
