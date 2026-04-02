# 🏗️ Architecture

## What I interpreted of the question

We want to create a dynamic module based questions system where questions are shown dynamically based on user input.
User should be able to go back to previous questions he answered and should be able to change response and that should re-calculate future questions dynamically.

I first thought of the whole scenario for a while and then decided to build something like a personality test thing. Because without a clear flow in mind it's hard to create a system on its own. I needed some clarity and vision, that's why this approach.

Questions says to handle deep link — if some user got link to some separate question which is not current for that user, that should be handled gracefully.

Below is my approach and technical discussion.

---

## Initial Setup

For the most basics of all, I added:

- User controllers
- JWT helper
- bcrypt for hashing

Once the basic things were set, I was thinking for a structure and schema to store user state and its previous record.

I discussed extensively with AI validating my thought process and defining a schema. All about that is written in `AI_USAGE.md`.

---

## Main Architecture

First of all, I know that questions will be same and won’t change over time, that is they are static.
So I initialize a map for the modules and questions in memory.

Now when the **start test API** hits:

- We check if user already has a saved state
- If yes → clear that and initialize a fresh state
- Also initialize the first question in the state

About this first question — I have kept the next question as the current question for user state soon after he answers a question.

---

## User State

The user state consists of:

- Previous answers
- Module score

These are updated every time user answers.

---

## Question Handling

There are two methods:

- One for getting next question
- Other for getting a specific question

So if user wants to jump to some previous question, he/she can do that.

---

## Validation Logic

On answering, the question is validated whether that’s a correct question or not.
Basically checking if it's:

- The current question
- Or some previous question

If the question is not part of the current flow for that user (i.e., invalid), we handle it gracefully by returning the latest valid question for the user instead of processing the answer.

If the answered question is a previous question:

- We reset the module weights
- Slice history

Because the next questions might change according to the response.

I could have added a universal history as well which tracks all jumps between questions.
Though I remembered it now while writing this file, I don’t think it will take a lot of time to implement, so we can skip that for now.

---

## Next Question Evaluation

For next question evaluation:

- I have kept the logic really simple for now
- Just find the module with the highest weight and give its question

One can even create a whole decision engine for this task, but for now that wouldn’t be necessary — that’s what I thought.

---

## Completion Logic

When questions for a module are finished:

- We know what kind of personality this is

So I returned a `"done"` message.

That actually is a patch because I forgot to add result part until the whole backend development was concluded.

Frontend on seeing this `"done"`:

- Navigates to result page
- Result request hits DB

After that, there is a function in `UserStateService` named `computePersonality`.

It calculates some personality of sort. Honestly, I have no idea in this field, so I left that work for AI.

---

## Final Flow (Summary)

1. User starts test → state initialized
2. User answers question → state updates
3. Module weights update
4. Next question decided dynamically
5. User can go back → system recalculates flow
6. When module completes → `"done"` returned
7. Result computed and shown

---

This is basically the whole flow.
