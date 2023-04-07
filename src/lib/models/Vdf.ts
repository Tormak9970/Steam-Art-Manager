/**
 * Copyright (C) 2023 Travis Lane (Tormak)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>
 */
import type { Reader } from "../utils/Reader";

const neededKeys = [
  "common",
  "name",
  "type",
  "associations",
  "0"
];

export class Vdf {
  entries: any[];
  shouldCutBloat: boolean;

  constructor(reader: Reader, shouldCutBloat: boolean) {
    this.entries = [];
    this.shouldCutBloat = shouldCutBloat;
    this.read(reader);
  }

  read(reader: Reader) {
    reader.seek(1);
    if (reader.readUint8() != 0x44 || reader.readUint8() != 0x56) throw new Error('Invalid file signature');

    reader.seek(0);
    
    let skip = 0;
    const magic = reader.readUint32();
    if (magic == 0x07564428) {
      skip = 65;
    } else if (magic == 0x07564427) {
      skip = 45;
    } else {
      throw new Error("Magic header is unknown");
    }

    reader.seek(8, 0);
    this.readAppEntries(reader, skip);
  }
  
  readAppEntries(reader: Reader, skip: number) {
    // App entry collection is terminated by null dword (aka uint32)
    let id = reader.readUint32();
    while (id != 0x00000000) {
      let entry = this.readAppEntry(reader, id, skip);
  
      if ((entry.entries as any).common?.type == "game" || (entry.entries as any).common?.type == "Game" || !this.shouldCutBloat) this.entries.push(entry);

      id = reader.readUint32();
    }
  }
  
  readAppEntry(reader: Reader, id: number, skip: number) {
    reader.seek(skip, 1); // Skip a bunch of fields we don't care about
  
    const name = reader.readString();
    const entries = this.readEntries(reader);

    if (this.shouldCutBloat) {
      for (const key of Object.keys(entries)) {
        if (key != "appid" && key != "common") delete entries[key];
      }
    }
  
    return {
      id: id,
      name: name,
      entries: entries
    };
  }
  
  readEntries(reader: Reader, shouldReadLast = true) {
    const entries = {};
  
    // Entry collection is terminated by 0x08 byte
    let type = reader.readUint8();
    while (type != 0x08) {
      let [key, val] = this.readEntry(reader, type);
  
      if (neededKeys.includes(key) || !this.shouldCutBloat) entries[key] = val
      
      type = reader.readUint8();
    }

    if (shouldReadLast) reader.seek(1, 1);
  
    return entries;
  }
  
  readEntry(reader: Reader, type: number): [string, any] {
    let key = reader.readString();
  
    switch (type) {
      case 0x00: // Nested entries
        return [key, this.readEntries(reader, false)];
      case 0x01: // String
        return [key, reader.readString()];
      case 0x02: // Int
        return [key, reader.readUint32()];
      default:
        throw new Error(`Unhandled entry type: ${type}`)
    }
  }
}