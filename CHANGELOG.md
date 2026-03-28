# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic
Versioning](https://semver.org/spec/v2.0.0.html).

The meaning of a major version (1.\*.\*) for the purpose of this changelog
is whenever either the list of output characters or the columns suffer a
modification, be it an addition, removal or reordering. A minor version
(\*.1.\*) represents other changes in the output data. A patch version (\*.\*.1)
represents other changes that don't involve the contents of the main output
data file.

## Unreleased

### Changed

- Improved changelog formatting to match keepachangelog.com, renaming file from
  `changes.md` to `CHANGELOG.md`.

### Removed

- Removed link to set of pronunciation sound files, as it is incomplete.

## [7.0.0][7.0.0] (2021-02-06)

[7.0.0]: https://github.com/agj/3000-traditional-hanzi/tree/v7.0.0

### Added

- Added “Zhuyin”, “Vocabulary Zhuyin” and “Heisig Index” columns.

### Changed

- Patched 鋼's cangjie code to 金月廿山.

### Fixed

- Updated character count in readme.

## [6.0.0][6.0.0] (2020-10-07)

[6.0.0]: https://github.com/agj/3000-traditional-hanzi/tree/v6.0.0

### Added

- Added “Cangjie” column, that includes the code to type the character using
  cangjie input.
- Wrote a bit about how to study simplified characters with this data in the
  readme.

### Changed

- “Study order” numbers are now contiguous, as they don't consider non-included
  components.
- Patched meaning for each of 吋雕菸陸, removing reference to other characters.

### Removed

- Conflated 秘 into 祕, and 裏 into 裡.
- Removed 么 (a uniquely simplified character).
- Patched away an uncommon codepoint among the simplications of 願.

## [5.2.1][5.2.1] (2018-04-24)

[5.2.1]: https://github.com/agj/3000-traditional-hanzi/tree/v5.2.1

### Changed

- Updated todo.

### Fixed

- Fixed readme referencing old `facts.tsv` filename.

## [5.2.0][5.2.0] (2018-03-20)

[5.2.0]: https://github.com/agj/3000-traditional-hanzi/tree/v5.2.0

### Changed

- Renamed output file from `facts.tsv` to `notes.tsv`.
- Wording improved for the cases where the “meaning” field gets patched, and
  also now patching instances of “same as...” that display an alternative to the
  main character.

### Fixed

- Fixed “ü” being rendered as “u:” in vocabulary words.

### Removed

- Pinyin column reduced to a single reading, the one that the Unihan
  documentation says is preferred for traditional writing. Sound column also
  reflects this change.

## [5.1.0][5.1.0] (2018-02-15)

[5.1.0]: https://github.com/agj/3000-traditional-hanzi/tree/v5.1.0

### Added

- Some characters with more than one simplified variant now list all of them
  instead of just one.

### Removed

- Removed redundant simplified variant information wherever it is the same as
  the traditional character.

## [5.0.0][5.0.0] (2018-02-11)

[5.0.0]: https://github.com/agj/3000-traditional-hanzi/tree/v5.0.0

### Added

- Added vocabulary hanzi and pinyin columns.

### Changed

- Improved character sequence by adopting Gavin Grover's CJK Decomposition Data.

## [4.0.0][4.0.0] (2018-01-17)

[4.0.0]: https://github.com/agj/3000-traditional-hanzi/tree/v4.0.0

### Added

- Added “Variants” field, to make note of conflated characters (see below).

### Changed

- As a result of the conflated characters (below), the character count was
  reduced by 3, and the sequence was altered.

### Removed

- Conflated characters:
  - 艷 (in Heisig & Richardson, frequency #3377) and 艶 (in TOCFL, not in freq.
    list) into 豔 (T, f#2553).
  - 啓 (H&R, no f.) into 啟 (T, f#962).

## [3.0.0][3.0.0] (2018-01-17)

[3.0.0]: https://github.com/agj/3000-traditional-hanzi/tree/v3.0.0

### Changed

- Due to the fix below, order changed again, thus major-revision update.
- Some code improvements.

### Fixed

- Output .tsv file had not been updated correctly! Oops.

## [2.0.0][2.0.0] (2018-01-16)

[2.0.0]: https://github.com/agj/3000-traditional-hanzi/tree/v2.0.0

### Changed

- Improved study order, by integrating data from `ids-analysis.txt`. Still not
  ideal in some cases, like as with the precedence of 肉 before 人.

### Fixed

- Fixed some wrong sound filenames.

## [1.0.0][1.0.0] (2018-01-15)

[1.0.0]: https://github.com/agj/3000-traditional-hanzi/tree/v1.0.0

First public release.
