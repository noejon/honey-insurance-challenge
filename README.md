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

### Part 3

In part 3, in the interest of time I did not implement any checks on the validity of the monthlyUsageProfile. This one is also a bit more involved than with days, as we'd need to consider the day when performing our check. The value `43199` (30 days) will be valid for all months but February. Although that should not stop us from calculating, it raises a concern further on. If we receive a monthlyUsageProfile that matches 31 days and a day in February, it does not add up and we'd need to log this error for visibility.

The logic for this function is a bit more involved so here are the steps I took:

- Check if day is an integer ✅
- Check if day is out of range ✅
- Given a day of the year, get the day of the month for that day ✅
- Sort the events ✅
- To calculate the slice ✅
  - Find the first event index of the day ✅
  - Find the first event index after the day ✅
- Find the last event index before the day to calculate the initial ✅
- Generate the days event by subtracting timestamps ✅
- Generate a single day profile object ✅
- Call calculateEnergyUsageSimple with the single day profile object  ✅

I also added a unit test to check a date in February.

## Notes

It took me a little bit more than 2 hours to complete the 3 parts.

There are a few things that could be improved:

- Currently everything is in the one index.js file. I would probably restructure things a little bit, with utils and constants files, as well as separating each function to its own file
- Some further checks could be done on the `calculateEnergyUsageForDay` monthlyProfile.
- This is out of scope as per the part 3 description, but it would be nice to handle leap years.

## Round 2 - System Design

The system design task was something about generating events in an event-bridge.

The known information was that there was 2 endpoints provided by a third party:

`/v1/claims`: retrieves all the claims that have seen some changes since a date given as param to the input.

`/v1/claims/{id}` that provides the information about a claim.

Some more information:

- There is only one API key
- The API key is used by many different services
- There is a rate limit of 100 requests per 10 seconds

Questions:

- We need to generate events on a regular time interval checking if there have been changes
- What is the content of the events
- How do we make sure that no events are lost?
- We need to create an event when the a claim has been modified, saving the difference in a DB
- Given some other services that we own can make a changes to claims, we could run into an infinite loop. How might that happen and how would you prevent it?

How do I feel about the interview:

- Having not done any real backend for more than 4 years I was quite rusty. It also seems that I misunderstood what AWS event bridge was. It is the evolution of Cloudwatch, rather than an equivalent to Apache Kafka (which is what I portrayed it to be).
- Should have made use of Queues instead and I did not, when mentioning that one lambda (getting all the claims) was decoupled from the other (gathering the diff)
- When asked about how to not loose events because of the rate-limiter, I mentioned that we could save a state somewhere in a DB. Just chose dynamoDB. Given the fact that there are many reads and many writes, reading from a DB is quite slow. Here I think we could leverage something like redis session state.

The last negative point was that I was too focused on the task rather than listening at the cues from both interviewers. Although I knew they put a junior person to interview me to check at my ability to explain well to them, I forgot all about it when actually being stressed out on the task.
Some cues such as the senior interviewer asking her if she understood should have prompted me to do the same.

A takeaway from this is that I need to work on myself to convert this "bad" stress into "good" stress. And be more aware of the cues that are given to me.
