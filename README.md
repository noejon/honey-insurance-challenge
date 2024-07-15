# Code challenge

## Welcome

This exercise is divided into three parts - we expect that you'd be able to get through Part 1,
and then either Part 2 or Part 3, or both. Note that you don't strictly need to do part 2 or 3 in order,
but they do build on the exercise in Part 1.

We're not interested in esoteric JavaScript or development tool knowledge, but rather to see how you
structure your code. Things like:

- Understandability and maintainability
- Good programming habits
- Code style
- Attention to detail

You are welcome to draw on any other resources you may need to get started with Node.js,
format your code or to check syntax.(The exercise is meant to be realistic in that you can
use documentation and tools as needed to complete your work to a professional standard).

## Getting Started

1. Install [node.js](https://nodejs.org/en/download/).
2. In the project directory, run `npm install` to install the dependencies e.g.:

```sh
npm install
```

3. Run the tests with `npm test` to validate your working. **The goal is to get
all the tests passing.**

You shouldn't not need to modify the tests, but feel free to add new tests to help you complete the
challenge or improve the validation - we might have missed a scenario!

You can also run the tests in 'watch' (continuous update mode) with:

```sh
npm run test:watch
```

## Submitting the challenge

1. Ensure you've formatted your code using `npm run format` before submission.
2. Raise a PR in this repository with your solution.
3. Send us an email, and we'll set up a time and go through your answers, either over a video-call or in-person.

## Decisions

### Part 1

#### Checks on the profile object

As we are using Vanilla JS, the profile object might be missing the `initial` or `events` properties. If initial is missing, an error should be thrown. We can't assume what the `initial` value was according to the first event, as there is a possibility to have consecutive duplicate "on" or "off" states.

Missing `events` could be handled two ways:

- We could consider that not receiving events is the same as receiving an empty array of `events`
- We could throw an error, as it does not match the API contract.

I decided to choose the latter. The appliance might have been turned on and off during the day but a sneaky bug was introduced in the appliance, and events are no longer sent. It is then better to handle the error and log it (along with a possible appliance ID, model or any relevant information).

After implementing the previous checks I realised that it might be a good thing to check for the absence of both of them. If both are missing we potentially have two bugs on our hands, and just one of them logged.

More potential edge cases to check:

- If the initial state is neither on or off
- An event state is neither on or off
- Timestamp is not an integer
- Timestamp is negative
- Timestamp is more than 1439

Events might not be ordered by their timestamps, so to make sure that the timestamps are ordered, they need to be sorted.

I did not use the imported constant MAX_IN_PERIOD in my tests. The reason being, at any time someone could change it to 1444 and the tests would still all pass while a bug has been introduced.

### Part 2

The error checks are pretty similar to part 1 except for the addition of auto-off. Rather than creating a new function to check the profile, the current function is refactored.
