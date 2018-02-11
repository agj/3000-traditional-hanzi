
# Changelog

### 5.0.0

- Added vocabulary hanzi and pinyin columns.
- Improved character sequence by adopting Gavin Grover's CJK Decomposition Data.

### 4.0.0

- Conflated characters:
    - 艷 (in Heisig & Richardson, frequency #3377) and 艶 (in TOCFL, not in freq. list) into 豔 (T, f#2553).
    - 啓 (H&R, no f.) into 啟 (T, f#962).
- As a result of the above, the character count was reduced by 3, and the sequence was altered.
- Added 'Variants' field, to make note of conflated characters.

### 3.0.0

- Output .tsv file had not been updated correctly! Oops. Order changed again, thus major-revision update.
- Some code improvements.

### 2.0.0

- Improved study order, by integrating data from `ids-analysis.txt`. Still not ideal in some cases, like as with the precedence of 肉 before 人.
- Fixed some wrong sound filenames.

### 1.0.0

- First public release.
