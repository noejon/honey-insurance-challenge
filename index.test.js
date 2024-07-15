const {
  calculateEnergyUsageSimple,
  calculateEnergySavings,
  calculateEnergyUsageForDay,
} = require('./index');

// Part 1
describe('calculateEnergyUsageSimple', () => {
  it('should throw an error if both the initial state and events are missing from the profile', () => {
    const emptyUsageProfile = {};
    expect(() => calculateEnergyUsageSimple(emptyUsageProfile)).toThrow(
      /profile is missing initial state and events/
    );
  });
  it('should throw an error if the initial state is missing from the profile', () => {
    const usageProfileNoInitial = {
      events: [
        { timestamp: 126, state: 'off' },
        { timestamp: 833, state: 'on' },
      ],
    };
    expect(() => calculateEnergyUsageSimple(usageProfileNoInitial)).toThrow(
      /profile is missing initial state/
    );
  });

  it('should throw an error if events is missing from the profile', () => {
    const usageProfileNoEvents = {
      initial: 'on',
    };
    expect(() => calculateEnergyUsageSimple(usageProfileNoEvents)).toThrow(
      /profile is missing events/
    );
  });

  it('should throw an error if the initial state is neither "on" nor "off"', () => {
    const usageProfileNotOnOffInitial = {
      initial: 'neitherOnNorOff',
      events: [
        { timestamp: 126, state: 'off' },
        { timestamp: 833, state: 'on' },
      ],
    };
    expect(() =>
      calculateEnergyUsageSimple(usageProfileNotOnOffInitial)
    ).toThrow(/initial state is neither on nor off/);
  });

  it(`should throw an error if one of the events' state is neither "on" nor "off"`, () => {
    const usageProfileEventNotOnOff = {
      initial: 'off',
      events: [
        { timestamp: 126, state: 'neitherOnNorOff' },
        { timestamp: 833, state: 'on' },
      ],
    };
    expect(() => calculateEnergyUsageSimple(usageProfileEventNotOnOff)).toThrow(
      /event state is neither on nor off/
    );
  });

  it("should throw an error if one of the events' timestamp is not an integer", () => {
    const usageProfileEventNotAnInteger = {
      initial: 'off',
      events: [
        { timestamp: '126', state: 'off' },
        { timestamp: 833, state: 'on' },
      ],
    };
    expect(() =>
      calculateEnergyUsageSimple(usageProfileEventNotAnInteger)
    ).toThrow(/event timestamp is not an integer/);
  });

  it("should throw an error if one of the events' timestamp is less than 0", () => {
    const usageProfileEventLessThanZero = {
      initial: 'off',
      events: [
        { timestamp: -1, state: 'off' },
        { timestamp: 833, state: 'on' },
      ],
    };
    expect(() =>
      calculateEnergyUsageSimple(usageProfileEventLessThanZero)
    ).toThrow(/event timestamp cannot be less than 0/);
  });

  it("should throw an error if one of the events' timestamp is bigger than 1439", () => {
    const usageProfileEventExceedsMaxValue = {
      initial: 'off',
      events: [
        { timestamp: 1440, state: 'off' },
        { timestamp: 833, state: 'on' },
      ],
    };
    expect(() =>
      calculateEnergyUsageSimple(usageProfileEventExceedsMaxValue)
    ).toThrow(/event timestamp exceed the maximum timestamp 1439/);
  });

  it('should calculate correctly for a simple usage profile with initial state = "on"', () => {
    const usageProfile1 = {
      initial: 'on',
      events: [
        { timestamp: 126, state: 'off' },
        { timestamp: 833, state: 'on' },
      ],
    };
    expect(calculateEnergyUsageSimple(usageProfile1)).toEqual(
      126 + (1440 - 833)
    );
  });

  it('should calculate correctly for a simple usage profile with initial state = "on" where the events are not ordered by timestamp', () => {
    const usageProfile1 = {
      initial: 'on',
      events: [
        { timestamp: 833, state: 'on' },
        { timestamp: 126, state: 'off' },
      ],
    };
    expect(calculateEnergyUsageSimple(usageProfile1)).toEqual(
      126 + (1440 - 833)
    );
  });

  it('should calculate correctly for a simple usage profile with initial state = "off"', () => {
    const usageProfile2 = {
      initial: 'off',
      events: [
        { timestamp: 30, state: 'on' },
        { timestamp: 80, state: 'off' },
        { timestamp: 150, state: 'on' },
        { timestamp: 656, state: 'off' },
      ],
    };
    expect(calculateEnergyUsageSimple(usageProfile2)).toEqual(
      80 - 30 + (656 - 150)
    );
  });

  it('should calculate correctly when the appliance is on the whole time', () => {
    const usageProfileOnAllDay = {
      initial: 'on',
      events: [],
    };
    expect(calculateEnergyUsageSimple(usageProfileOnAllDay)).toEqual(1440);
  });

  it('should calculate correctly when the appliance is off the whole time', () => {
    const usageProfileOffAllDay = {
      initial: 'off',
      events: [],
    };
    expect(calculateEnergyUsageSimple(usageProfileOffAllDay)).toEqual(0);
  });

  it('should handle duplicate on events', () => {
    const usageProfile = {
      initial: 'off',
      events: [
        { timestamp: 30, state: 'on' },
        { timestamp: 80, state: 'on' },
        { timestamp: 150, state: 'off' },
        { timestamp: 656, state: 'on' },
      ],
    };
    expect(calculateEnergyUsageSimple(usageProfile)).toEqual(
      150 - 30 + (1440 - 656)
    );
  });

  it('should handle duplicate off events', () => {
    const usageProfile = {
      initial: 'on',
      events: [
        { timestamp: 30, state: 'on' },
        { timestamp: 80, state: 'off' },
        { timestamp: 150, state: 'off' },
        { timestamp: 656, state: 'on' },
      ],
    };
    expect(calculateEnergyUsageSimple(usageProfile)).toEqual(
      80 - 0 + (1440 - 656)
    );
  });

  it('should handle duplicate on events where one of them is the initial on event', () => {
    const usageProfile = {
      initial: 'on',
      events: [
        { timestamp: 30, state: 'on' },
        { timestamp: 80, state: 'off' },
        { timestamp: 656, state: 'on' },
      ],
    };
    expect(calculateEnergyUsageSimple(usageProfile)).toEqual(
      80 - 0 + (1440 - 656)
    );
  });

  it('should handle duplicate off events where one of them is the initial off event', () => {
    const usageProfile = {
      initial: 'off',
      events: [
        { timestamp: 30, state: 'off' },
        { timestamp: 80, state: 'on' },
      ],
    };
    expect(calculateEnergyUsageSimple(usageProfile)).toEqual(1440 - 80);
  });
});

// Part 2

describe('calculateEnergySavings', () => {
  it('should throw an error if both the initial state and events are missing from the profile', () => {
    const emptyUsageProfile = {};
    expect(() => calculateEnergySavings(emptyUsageProfile)).toThrow(
      /profile is missing initial state and events/
    );
  });
  it('should throw an error if the initial state is missing from the profile', () => {
    const usageProfileNoInitial = {
      events: [
        { timestamp: 126, state: 'off' },
        { timestamp: 833, state: 'on' },
      ],
    };
    expect(() => calculateEnergySavings(usageProfileNoInitial)).toThrow(
      /profile is missing initial state/
    );
  });

  it('should throw an error if events is missing from the profile', () => {
    const usageProfileNoEvents = {
      initial: 'on',
    };
    expect(() => calculateEnergySavings(usageProfileNoEvents)).toThrow(
      /profile is missing events/
    );
  });

  it('should throw an error if the initial state is neither "on", "off" nor "auto-off', () => {
    const usageProfileInitialInvalid = {
      initial: 'invalid',
      events: [
        { timestamp: 126, state: 'off' },
        { timestamp: 833, state: 'on' },
      ],
    };
    expect(() => calculateEnergySavings(usageProfileInitialInvalid)).toThrow(
      /initial state should be one of on, off or auto-off/
    );
  });

  it(`should throw an error if one of the events' state is neither "on", "off", nor "auto-off"`, () => {
    const usageProfileEventInvalid = {
      initial: 'off',
      events: [
        { timestamp: 126, state: 'invalid' },
        { timestamp: 833, state: 'on' },
      ],
    };
    expect(() => calculateEnergySavings(usageProfileEventInvalid)).toThrow(
      /event state should be one of on, off or auto-off/
    );
  });

  it("should throw an error if one of the events' timestamp is not an integer", () => {
    const usageProfileEventNotAnInteger = {
      initial: 'off',
      events: [
        { timestamp: '126', state: 'off' },
        { timestamp: 833, state: 'on' },
      ],
    };
    expect(() => calculateEnergySavings(usageProfileEventNotAnInteger)).toThrow(
      /event timestamp is not an integer/
    );
  });

  it("should throw an error if one of the events' timestamp is less than 0", () => {
    const usageProfileEventLessThanZero = {
      initial: 'off',
      events: [
        { timestamp: -1, state: 'off' },
        { timestamp: 833, state: 'on' },
      ],
    };
    expect(() => calculateEnergySavings(usageProfileEventLessThanZero)).toThrow(
      /event timestamp cannot be less than 0/
    );
  });

  it("should throw an error if one of the events' timestamp is bigger than 1439", () => {
    const usageProfileEventExceedsMaxValue = {
      initial: 'off',
      events: [
        { timestamp: 1440, state: 'off' },
        { timestamp: 833, state: 'on' },
      ],
    };
    expect(() =>
      calculateEnergySavings(usageProfileEventExceedsMaxValue)
    ).toThrow(/event timestamp exceed the maximum timestamp 1439/);
  });
  it('should return zero for always on', () => {
    const usageProfile = {
      initial: 'on',
      events: [],
    };
    expect(calculateEnergySavings(usageProfile)).toEqual(0);
  });

  it('should calculate zero for always switch off manually', () => {
    const usageProfile = {
      initial: 'off',
      events: [],
    };
    expect(calculateEnergySavings(usageProfile)).toEqual(0);
  });

  it('should calculate max period for always switched off automatically', () => {
    const usageProfile = {
      initial: 'auto-off',
      events: [],
    };
    expect(calculateEnergySavings(usageProfile)).toEqual(1440);
  });

  it('should calculate energy savings correctly on sensible data', () => {
    const usageProfile = {
      initial: 'off',
      events: [
        { state: 'on', timestamp: 100 },
        { state: 'off', timestamp: 150 },
        { state: 'on', timestamp: 200 },
        { state: 'auto-off', timestamp: 500 },
        { state: 'on', timestamp: 933 },
        { state: 'off', timestamp: 1010 },
        { state: 'on', timestamp: 1250 },
        { state: 'auto-off', timestamp: 1320 },
      ],
    };
    expect(calculateEnergySavings(usageProfile)).toEqual(
      933 - 500 + (1440 - 1320)
    );
  });

  it('should calculate energy savings correctly on silly data (example 1)', () => {
    const usageProfile = {
      initial: 'off',
      events: [
        { state: 'on', timestamp: 100 },
        { state: 'off', timestamp: 150 },
        { state: 'on', timestamp: 200 },
        { state: 'auto-off', timestamp: 500 },
        { state: 'off', timestamp: 800 },
        { state: 'on', timestamp: 933 },
        { state: 'off', timestamp: 1010 },
        { state: 'on', timestamp: 1250 },
        { state: 'on', timestamp: 1299 },
        { state: 'auto-off', timestamp: 1320 },
      ],
    };
    expect(calculateEnergySavings(usageProfile)).toEqual(
      933 - 500 + (1440 - 1320)
    );
  });

  it('should calculate energy savings correctly on silly data (example 2)', () => {
    const usageProfile = {
      initial: 'off',
      events: [
        { state: 'on', timestamp: 250 },
        { state: 'on', timestamp: 299 },
        { state: 'auto-off', timestamp: 320 },
        { state: 'off', timestamp: 500 },
      ],
    };
    expect(calculateEnergySavings(usageProfile)).toEqual(1440 - 320);
  });

  it('should calculate energy savings correctly on silly data where the events are not ordered by timestamp', () => {
    const usageProfile = {
      initial: 'off',
      events: [
        { state: 'off', timestamp: 500 },
        { state: 'on', timestamp: 299 },
        { state: 'auto-off', timestamp: 320 },
        { state: 'on', timestamp: 250 },
      ],
    };
    expect(calculateEnergySavings(usageProfile)).toEqual(1440 - 320);
  });
});

// Part 3
describe('calculateEnergyUsageForDay', () => {
  const monthProfile = {
    initial: 'on',
    events: [
      { state: 'off', timestamp: 500 },
      { state: 'on', timestamp: 900 },
      { state: 'off', timestamp: 1400 },
      { state: 'on', timestamp: 1700 },
      { state: 'off', timestamp: 1900 },
      { state: 'on', timestamp: 2599 },
      { state: 'off', timestamp: 2900 },
      { state: 'on', timestamp: 3000 },
      { state: 'off', timestamp: 3500 },
      { state: 'on', timestamp: 4000 },
      { state: 'off', timestamp: 4420 },
      { state: 'on', timestamp: 4500 },
    ],
  };

  it('should calculate the energy usage for an empty set of events correctly', () => {
    expect(
      calculateEnergyUsageForDay({ initial: 'off', events: [] }, 10)
    ).toEqual(0);
    expect(
      calculateEnergyUsageForDay({ initial: 'on', events: [] }, 5)
    ).toEqual(1440);
  });

  it('should calculate day 1 correctly', () => {
    expect(calculateEnergyUsageForDay(monthProfile, 1)).toEqual(
      500 - 0 + (1400 - 900)
    );
  });

  it('should calculate day 2 correctly', () => {
    expect(calculateEnergyUsageForDay(monthProfile, 2)).toEqual(
      1900 - 1700 + (2880 - 2599)
    );
  });

  it('should calculate day 3 correctly', () => {
    expect(calculateEnergyUsageForDay(monthProfile, 3)).toEqual(
      2900 - 2880 + (3500 - 3000) + (4320 - 4000)
    );
  });

  it('should calculate day 4 correctly', () => {
    expect(calculateEnergyUsageForDay(monthProfile, 4)).toEqual(
      4420 - 4320 + (5760 - 4500)
    );
  });

  it('should calculate day 5 correctly', () => {
    expect(calculateEnergyUsageForDay(monthProfile, 5)).toEqual(1440);
  });

  describe('when the first and only event starts on day 4', () => {
    it('should calculate day 2 correctly', () => {
      const monthProfile1 = {
        initial: 'off',
        events: [{ timestamp: 4500, state: 'on' }],
      };
      expect(calculateEnergyUsageForDay(monthProfile1, 2)).toEqual(0);
    });
    it('should calculate day 4 correctly', () => {
      const monthProfile1 = {
        initial: 'off',
        events: [{ timestamp: 4500, state: 'on' }],
      };
      expect(calculateEnergyUsageForDay(monthProfile1, 4)).toEqual(1260);
    });
    it('should calculate day 5 correctly', () => {
      const monthProfile1 = {
        initial: 'off',
        events: [{ timestamp: 4500, state: 'on' }],
      };
      expect(calculateEnergyUsageForDay(monthProfile1, 15)).toEqual(1440);
    });
  });

  it('should calculate day 42 correctly', () => {
    const monthProfile2 = {
      initial: 'off',
      events: [{ timestamp: 14442, state: 'on' }],
    };
    expect(calculateEnergyUsageForDay(monthProfile2, 42)).toEqual(1440 - 42);
  });

  it('should throw an error on an out of range day number', () => {
    // The regular expression matches the message of the Error(), which is
    // the first parameter to the Error class constructor.
    expect(() => calculateEnergyUsageForDay(monthProfile, -5)).toThrow(
      /day out of range/
    );
    expect(() => calculateEnergyUsageForDay(monthProfile, 0)).toThrow(
      /day out of range/
    );
    expect(() => calculateEnergyUsageForDay(monthProfile, 366)).toThrow(
      /day out of range/
    );
  });

  it('should throw an error on a non-integer day number', () => {
    expect(() => calculateEnergyUsageForDay(3.76)).toThrow(
      /must be an integer/
    );
  });
});
