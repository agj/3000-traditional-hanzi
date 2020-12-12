
3000+ traditional hanzi Anki deck
=================================

Making use of a number of databases of Chinese characters (hanzi) publicly available online, I (agj) created this code that compiles a number of traditional Chinese characters and their information, into a tab-separated values file for importing and use in the [Anki][anki] flashcard reviewing software (or similar).

_Version 6.0.0_


## How the characters are selected

The list combines characters from the following sources:

- All 3035 included in Heisig & Richardson's _Remembering Traditional Hanzi_ (excluding non-character primitives.)
- All 2555 contemplated in all levels of the _Test of Chinese as a Foreign Language._
- The 2000 most frequently used characters according to Chih-Tsao Hai's research.

For a grand total of **3183** characters.

Characters are ordered according to usage frequency, except whenever a character is a subcomponent of another, in which case the subcomponent will always be placed earlier. This strategy attemps to place focus on real-life use of each studied character, without compromising building-block sequence logic. The sequence may not be perfect, as it depends 100% on the thoroughness of the databases used, but it is a pretty good result overall.


## The first 100 characters

一勺口日白的止正是卜不二戈手我十人又月肉  
有大土才在了中至刀到八欠目次貝資弓兀女西  
要以丁可立言這古固個小你曾會子好爪火為上  
木來力五學乙京尤就入六父交也用匕能如士寸  
寺時文水兄允兌說沒它他看那門問三生提下過

Compare with the first few characters in the list of most frequently used:

的是不我一有大在人了中到資要以可這個你會  
好為上來學就交也用能如時文說沒他看那問生  
提下過


## Sample entry

```
Traditional        戶
Study order        114
Variants           
Simplified         户
Pinyin             hù
Heisig keyword     door
Meaning            door; family, household
Vocabulary hanzi   窗戶 戶外 開戶
Vocabulary pinyin  chuānghu hùwài kāihù
Japanese kun       と へ
Japanese on        コ
Sound file         [sound:agj-pinyin-hu4.mp3]
Frequency rank     1368
Cangjie            竹尸
Heisig index       0830
Zhuyin             ㄏㄨ`
Vocabulary zhuyin  ㄔㄨㄤ ㄏㄨ˙  ㄏㄨ`ㄨㄞ`  ㄎㄞ ㄏㄨ`
```

While the data is mostly general, with nothing [Anki][anki]-specific, the 'Sound file' column is an exception and formatted specifically for Anki use, and for use in conjunction with [this set of audio files,][pinyin-audio] or any other set of mandarin syllable sound files properly named.

The 'Variants' column is rarely used, but when it is it contains different writings of the same character, as found in different sources. For ease of study, I conflated them into a single writing but included the others in this field.


## Rationale

I found it hard to find good study resources for traditional Chinese writing that weren't an adaptation of a resource originally meant for simplified Chinese. This includes flashcard decks of characters. The reality is that the two scripts are not comparable one-for-one. For instance, certain simplified characters are mapped to multiple possible traditional characters, depending on context. This affects usage statistics, among other factors. Thus the need to compile my own deck of flashcards, based on traditional character data.

I am a non-native but proficient Japanese speaker who sought to learn Mandarin Chinese while focusing on traditional characters. While learning Japanese I understood the importance of the character study sequence. Most characters can be subdivided into components, which are (often) characters themselves. It makes the most sense to go bottom-up, studying the simplest characters first, that in combination give shape to other characters, and so on. That is why I devised the sequencing strategy employed here.


## My study method

I originally started using these by making each note into a three-way card: _pinyin recall,_ _character recall_ and _meaning recall._ For pinyin recall I would have the meaning and the character on the 'front' of the card, and the pinyin (with its sound) on the back.

When I originally studied Japanese kanji, I didn't study their readings this way, because they are multiple and too complicated, so I learned the readings of the characters organically in the process of learning new vocabulary. This time around, at first I thought I could learn the (pretty much) single pinyin reading per character, but after some time trying and failing, I realized that my first approach (not purposefully studying each character's reading) made more sense.

Anyway, I ended up with pretty much the same method I originally used for Japanese kanji. I use a single card per note, with only _character recall_. I studied _meaning recall_ too for a while until the added study load became too much, and it's not really very necessary. Reading content in Chinese makes up for this very well.

Here is a character recall example card for 戶 door, with everything under the line (`----`) hidden:

```
hù  [pinyin audio]
chuānghu hùwài kāihù
と へ
door
door; family, household
-----------------------
戶 (户)
窗戶 戶外 開戶
```

As you can see, I incorporate a few compound words using the character to take advantage of my growing vocabulary and strengthen such cognitive links.

For my particular case, including the Japanese _kun_ reading (と へ) helps me identify commonalities and differences between the Chinese and Japanese uses for the character, but this information can and most likely should be elided by non-Japanese speakers.

### Studying simplified

Using this same data, it's trivial (using Anki) to create cards to also study the simplified forms. What I would suggest is to study traditional to simplified. The way to do that is to create a new card type, and put in the contents something like the following:

```
{{#Simplified}}
    {{Simplified}} → {{Traditional}}
{{/Simplified}}
```

If you use this pattern to write the front of the card, notes that have no 'Simplified' field will appear empty, and thus Anki won't create them. Since characters that are different in the simplified standard are in the minority, this will create much fewer cards compared to notes, and you'll only study the characters that are do in fact change.

Since simplified characters sometimes map to multiple traditional characters, I also add the vocabulary data below, faded in color so I only reference it when in doubt of which this card refers to.


## Data format

The main output of the program contained in this repository is the `output/notes.tsv` file. The data in this file is formatted as a tab-separated value file. This is a plain-text file, formatted so that each line corresponds to one row, and each row has columns of text separated by tab characters, forming a table. The above samply entry shows the column order and exemplifies the values that fill each cell.


## How to use with Anki

Flashcard software [Anki][anki] has an option to import tab-separated value files as notes. See the [documentation on importing](https://apps.ankiweb.net/docs/manual.html#importing) on the Anki website for the details on this procedure. You, however, need to do some preparation before actually importing the file.

Consult [the documentation](https://apps.ankiweb.net/docs/manual.html) for all details on the following.

1. First create a new deck.
2. Add a new note type with the same fields as shown in the "sample entry" above, in the same order (the name of each field doesn't have to be the exact same).
3. Set the "Study order" field as the main sort field.
4. Instruct Anki to "check database", to prevent errors in the following step.
5. Import `notes.tsv`.
6. In the import dialog make sure you have the correct deck and note type selected, but the rest of the options should work as set by default.
7. Import the sound files manually into the media folder, named so that they match the contents of the "sound file" column of `notes.tsv`.
8. Create cards types suited to your use case.
9. Check the database again.

If you want to later update the notes to a newer version of `notes.tsv`, just make sure to match the number and order of fields in the note type of the new version, check database as needed, and import. Because Anki modifies the order cards are displayed when they were just updated, you'll need to go to the browser, select **all** cards in the deck simultaneously, and use the "Reposition" command in the Edit menu to make sure the cards show up according to the study order field again.

Once I consider this stable enough, I might convert it into a shared deck file and upload it to the Anki website, to save everyone the trouble of the above.


## Changelog

See `changes.md`.


## Credits

Databases used:

- Unicode's [Unihan database][unihan]
- Chih-Tsao Hai's [Frequency and Stroke Counts of Chinese Characters][charfreq]
- Taiwan Steering Committee for the Test of Proficiency's [8000 Chinese Words][top]
- Reviewing the Kanji Wiki [spreadsheet][heisig]
- CJKV Ideograph Database's [ideographic description sequence data][cjkvi]
- Gavin Grover's (with Aaron Madlon-Kay's contributions) [CJK Decomposition Data][grover]
- [CC-CEDICT][cedict]

Referenced:

- [Network and Meaningful Learning of Chinese Characters][learnm]

[unihan]: https://www.unicode.org/charts/unihan.html
[charfreq]: http://technology.chtsai.org/charfreq/
[top]: http://www.sc-top.org.tw/english/download.php
[heisig]: http://rtkwiki.koohii.com/wiki/Remembering_Simplified_Hanzi,_Traditional_Hanzi_and_Kanji_spreadsheet
[cjkvi]:https://github.com/cjkvi/cjkvi-ids
[learnm]: http://learnm.org/
[cedict]: https://www.mdbg.net/chinese/dictionary?page=cc-cedict
[grover]: https://github.com/amake/cjk-decomp

[anki]: https://ankisrs.net/
[pinyin-audio]: https://github.com/agj/mp3-chinese-pinyin-sound
