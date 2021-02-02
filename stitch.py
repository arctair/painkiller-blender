#!/usr/bin/env python
import os, re
from argparse import ArgumentParser

parser = ArgumentParser()
parser.add_argument("hillshade_tiles_dir")
parser.add_argument("destination")
args = parser.parse_args()

def fileToTile(file):
  matcher = re.search('0-(\d+)-(\d+).tif', file)
  return (matcher.group(1), matcher.group(2))

files = os.listdir(args.hillshade_tiles_dir)
tiles = map(fileToTile, files)

right = max(map(lambda tile: tile[0], tiles))
bottom = max(map(lambda tile: tile[1], tiles))

tileWidth = Image.open(files[0]).size[0]
result = Image.open(args.destination)

for x in range(0, right + 1):
  for y in range(0, bottom + 1):
    
