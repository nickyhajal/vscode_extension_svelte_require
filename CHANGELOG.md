# 0.4.0

- Search deep inside node modules (limited to those that are specified in dependencies). **Disabled** per default.
- Improve the info given about each file.
- FIX: if trying to require the current file, show a warning instead of creating a broken reference.

# 0.3.2

- FIX: an issue where it would put the import line below other code.

# 0.3.1

- Import vs require is now auto-detected using the first occurence in the file. When there are no occurences, it will ask.
- If there is no line-break between the dependencies and the following code, one will be inserted.

# 0.2.3

- Changed logo

# 0.2.2

- Display module prominently, and move path to description
- Change the order of deps, and sort package / core modules