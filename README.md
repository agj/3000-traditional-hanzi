
3000+ traditional hanzi Anki deck
=================================

Making use of a number of databases of Chinese characters (hanzi) publicly available online, I (agj) created this code that compiles a number of traditional Chinese characters and their information, into a tab-separated values file for importing and use in the [Anki][anki] flashcard reviewing software (or similar).

_Version 4.0.0_


## How the characters are selected

The list combines characters from the following sources:

- All 3035 included in Heisig & Richardson's _Remembering Traditional Hanzi_ (excluding non-character primitives.)
- All 2555 contemplated in all levels of the _Test of Chinese as a Foreign Language._
- The 2000 most frequently used characters according to Chih-Tsao Hai's research.

For a grand total of **3186** characters.

Characters are ordered according to usage frequency, except whenever a character is a subcomponent of another, in which case the subcomponent will always be placed earlier. This strategy attemps to place focus on real-life use of each studied character, without compromising building-block sequence logic. The sequence is not perfect, as it depends 100% on the thoroughness of the databases used, and it is not corrected by hand for common sense, but it is a pretty good result overall.


## The first 100 characters

白一勺的日止正是不戈我月又肉有人大十才土  
在了口中刀至到八目二貝欠次資女要以丁可立  
言這古固個小你曾會子好為上木來學乙尤京就  
父交也用能如寸士寺時文兄水允兌說沒匕它他  
手看那門問生提卜下過員圓青請們天戶斤所夕


## Sample entry

```
Traditional       戶
Study order       114
Variants          
Simplified        户
Pinyin            hù
Heisig keyword    door
Meaning           door; family, household
Japanese kun      と へ
Japanese on       コ
Sound file        [sound:agj-pinyin-hu4.mp3]
Frequency rank    1368
```

While the data is mostly general, with nothing Anki-specific, the 'Sound file' column is an exception and formatted specifically for Anki use, and for use in conjunction with [this set of audio files.][pinyin-audio]

The 'Variants' column is rarely used, but when it is it contains different writings of the same character, as found in different sources. For ease of study, I conflated them into a single writing but included the others in this field.


## Rationale

I found it hard to find good study resources for traditional Chinese writing that weren't an adaptation of a resource originally meant for simplified Chinese. This includes flashcard decks of characters. The reality is that the two scripts are not comparable one-for-one. For instance, certain simplified characters are mapped to multiple possible traditional characters, depending on context. This affects usage statistics, among other factors. Thus the need to compile my own deck of flashcards, based on traditional character data.

I am a non-native but proficient Japanese speaker who sought to learn Mandarin Chinese while focusing on traditional characters. While learning Japanese I understood the importance of the character study sequence. Most characters can be subdivided into components, which are (often) characters themselves. It makes the most sense to go bottom-up, studying the simplest characters first, that in combination give shape to other characters, and so on. That is why I devised the sequencing strategy employed here.


## My study method

I originally started using these by making each fact into a three-way card: _pinyin recall,_ _character recall_ and _meaning recall._ For pinyin recall I would have the meaning and the character on the 'front', and the pinyin (with its sound) on the back.

When I originally studied Japanese kanji, I didn't study their readings this way, because they are multiple and too complicated, so I learned the readings of the characters organically in the process of learning new vocabulary. This time around, at first I thought I could learn the (pretty much) single pinyin reading per character, but after some time trying and failing, I realized that my first approach (not purposefully studying each character's reading) made more sense.

So, I modified my approach and made it two-way: _character recall_ and _meaning recall_ only. (James Heisig would probably remove the latter.) Here is a character recall example card for 戶 door, with everything under the line (----) hidden:

```
hù  [pinyin audio]
と へ
*door*
door; family, household
-----------------------
戶 (户)
```

And here's the same fact, displayed as a meaning recall card:

```
戶 (户)
hù  [pinyin audio]
-----------------------
と へ
*door*
door; family, household
```

For my particular case, including the Japanese _kun_ reading (と へ) helps me identify commonalities and differences between the Chinese and Japanese uses for the character, but this information can and probably should be elided by non-Japanese speakers.


## Changelog

See `changes.md`.


## Credits

Databases used:

- Unicode's [Unihan database][unihan]
- Chih-Tsao Hai's [Frequency and Stroke Counts of Chinese Characters][charfreq]
- Taiwan Steering Committee for the Test of Proficiency's [8000 Chinese Words][top]
- Reviewing the Kanji Wiki [spreadsheet][heisig]
- CJKV Ideograph Database's [ideographic description sequence data][cjkvi]

Referenced:

- [Network and Meaningful Learning of Chinese Characters][learnm]

[unihan]: https://www.unicode.org/charts/unihan.html
[charfreq]: http://technology.chtsai.org/charfreq/
[learnm]: http://learnm.org/
[top]: http://www.sc-top.org.tw/english/download.php
[heisig]: http://rtkwiki.koohii.com/wiki/Remembering_Simplified_Hanzi,_Traditional_Hanzi_and_Kanji_spreadsheet

[anki]: https://ankisrs.net/
[pinyin-audio]: https://github.com/agj/mp3-chinese-pinyin-sound
