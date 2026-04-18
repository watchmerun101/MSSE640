# Week5 Airport Security Decision Table Lab

This sample app illustrates Decision Table Testing and Pairwise Testing using the airport security scenario from Week3.

## What is included

- A fully editable decision table builder with condition rows and action rows.
- Educator Mode for guided scenario creation and comparison of table output versus policy output.
- Pairwise test case generation for a compact set of scenarios covering all input value pairs.
- Sunny Day and Rainy Day scenario buttons for immediately loading a clear pass and a failed pass.

## How to use the app

1. Open `index.html` in a browser.
2. By default, the editable decision table is visible.
3. Toggle `Educator Mode` to show the guided input section.
4. Enter values for bag weight, liquid volume, container count, prohibited item presence, and boarding pass validity.
5. Click `Evaluate Scenario` to compare the decision table verdict to the policy verdict.
6. Click `Generate Pairwise Cases` to create a compact list of test cases covering all two-factor combinations.
7. Click any pairwise case to load it and evaluate it against the decision table.

## Sunny Day and Rainy Day examples

- `Sunny Day` loads an all-clear scenario that should evaluate to `CLEAR`.
- `Rainy Day` loads a failed scenario that should evaluate to `HOLD`.

## Notes

The current app uses the same airport security policy logic from Week3:
- Bag weight ≤ 7.0 kg
- Largest liquid container ≤ 100 ml
- Liquid container count ≤ 3
- No prohibited items
- Boarding pass must be valid

The decision table is editable so students can see how incorrect rule mappings create mismatches between the decision table output and the underlying policy.
