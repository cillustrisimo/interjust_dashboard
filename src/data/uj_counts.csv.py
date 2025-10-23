import pandas as pd
import sys

raw_uj_counts = pd.read_csv("src/static_data/raw_universal_jurisdiction_counts.csv", index_col=False)

# read in total counts
file_obj = None
with open('src/static_data/googlebooks-eng-all-totalcounts-20120701.txt', 'r') as f:
    file_obj = f.read()


# encapsulate in series for some regex stuff (getting relevant years)
year_totals = pd.Series(file_obj.split('\t'))

# Regex sequence to only match relevant years and pull out total word counts
relevant_year_regex = '|'.join(raw_uj_counts['year'].astype('str'))
relevant_years = year_totals[year_totals.str.match(relevant_year_regex)]

# extract out total_counts
counts_regex = r'\d+,(\d+),\d+,\d+'
relevant_counts = relevant_years.str.extract(counts_regex)
relevant_counts = relevant_counts.astype(int)
relevant_counts = relevant_counts.reset_index()

# use to normalize counts in raw_uj_counts
normalized_uj_counts = raw_uj_counts.copy()

# per million words frequencies (https://www.oed.com/information/understanding-entries/frequency/?tl=true)
normalized_uj_counts['count'] = (normalized_uj_counts['count']/relevant_counts[0]) * 1000000

# send per million word frequency to standard out
normalized_uj_counts.to_csv(sys.stdout)


