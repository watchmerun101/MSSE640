# Week5 Airport Security Decision Table Lab - Version 2

This sample app illustrates Decision Table Testing and Pairwise Testing using the airport security scenario from Week3. Version 2 introduces a blank decision table and submit buttons for user-driven completion.

## What is included

- A blank editable decision table that users must fill in with appropriate rules.
- Submit buttons for checking decision table work and pairwise test case evaluation.
- A visible goal section explaining the task.
- Pairwise test case inputs that are user-editable and require submission.

## How to use the app

1. Open `index-v2.html` in a browser.
2. Read the goal section to understand the task.
3. Fill in the blank decision table with rule titles, conditions (T/F/-), and actions (CLEAR/HOLD).
4. Click `Submit Decision Table` to check your rules against a test case.
5. Fill in the pairwise test case inputs (weight, liquid, containers, prohibited, pass).
6. Click `Submit Pairwise Case` to evaluate your test scenario and compare to policy.

## Goal

Complete the decision table to match the airport security policy and submit a pairwise test case to verify correctness.

## Notes

The app uses the same airport security policy logic from Week3:
- Bag weight ≤ 7.0 kg
- Largest liquid container ≤ 100 ml
- Liquid container count ≤ 3
- No prohibited items
- Boarding pass must be valid

Version 2 starts with a blank table to encourage user completion and includes validation feedback.
