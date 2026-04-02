module "cedict-lookup" {
  type Cedict = {
    getMatch(query: string): Match[];
  };

  type Match = {
    pinyin: string;
  };

  const loadTraditional: (filename: string) => Cedict;
}
