trait HasByteConvert {
  fn from_le_bytes(bytes: &[u8], offset: usize) -> Self;
  fn from_be_bytes(bytes: &[u8], offset: usize) -> Self;
}

impl HasByteConvert for u8 {
  fn from_le_bytes(bytes: &[u8], offset: usize) -> u8 {
    return bytes[offset];
  }
  fn from_be_bytes(bytes: &[u8], offset: usize) -> u8 {
    return bytes[offset];
  }
}

impl HasByteConvert for u16 {
  fn from_le_bytes(bytes: &[u8], offset: usize) -> u16 {
    return u16::from_le_bytes(bytes[offset..offset+2].try_into().expect("incorrect length"));
  }
  fn from_be_bytes(bytes: &[u8], offset: usize) -> u16 {
    return u16::from_be_bytes(bytes[offset..offset+2].try_into().expect("incorrect length"));
  }
}

impl HasByteConvert for u32 {
  fn from_le_bytes(bytes: &[u8], offset: usize) -> u32 {
    return u32::from_le_bytes(bytes[offset..offset+4].try_into().expect("incorrect length"));
  }
  fn from_be_bytes(bytes: &[u8], offset: usize) -> u32 {
    return u32::from_be_bytes(bytes[offset..offset+4].try_into().expect("incorrect length"));
  }
}

impl HasByteConvert for u64 {
  fn from_le_bytes(bytes: &[u8], offset: usize) -> u64 {
    return u64::from_le_bytes(bytes[offset..offset+8].try_into().expect("incorrect length"));
  }
  fn from_be_bytes(bytes: &[u8], offset: usize) -> u64 {
    return u64::from_be_bytes(bytes[offset..offset+8].try_into().expect("incorrect length"));
  }
}

impl HasByteConvert for i8 {
  fn from_le_bytes(bytes: &[u8], offset: usize) -> i8 {
    return i8::from_le_bytes(bytes[offset..offset+1].try_into().expect("incorrect length"));
  }
  fn from_be_bytes(bytes: &[u8], offset: usize) -> i8 {
    return i8::from_be_bytes(bytes[offset..offset+1].try_into().expect("incorrect length"));
  }
}

impl HasByteConvert for i16 {
  fn from_le_bytes(bytes: &[u8], offset: usize) -> i16 {
    return i16::from_le_bytes(bytes[offset..offset+2].try_into().expect("incorrect length"));
  }
  fn from_be_bytes(bytes: &[u8], offset: usize) -> i16 {
    return i16::from_be_bytes(bytes[offset..offset+2].try_into().expect("incorrect length"));
  }
}

impl HasByteConvert for i32 {
  fn from_le_bytes(bytes: &[u8], offset: usize) -> i32 {
    return i32::from_le_bytes(bytes[offset..offset+4].try_into().expect("incorrect length"));
  }
  fn from_be_bytes(bytes: &[u8], offset: usize) -> i32 {
    return i32::from_be_bytes(bytes[offset..offset+4].try_into().expect("incorrect length"));
  }
}

impl HasByteConvert for i64 {
  fn from_le_bytes(bytes: &[u8], offset: usize) -> i64 {
    return i64::from_le_bytes(bytes[offset..offset+8].try_into().expect("incorrect length"));
  }
  fn from_be_bytes(bytes: &[u8], offset: usize) -> i64 {
    return i64::from_be_bytes(bytes[offset..offset+8].try_into().expect("incorrect length"));
  }
}

impl HasByteConvert for f32 {
  fn from_le_bytes(bytes: &[u8], offset: usize) -> f32 {
    return f32::from_le_bytes(bytes[offset..offset+4].try_into().expect("incorrect length"));
  }
  fn from_be_bytes(bytes: &[u8], offset: usize) -> f32 {
    return f32::from_be_bytes(bytes[offset..offset+4].try_into().expect("incorrect length"));
  }
}

impl HasByteConvert for f64 {
  fn from_le_bytes(bytes: &[u8], offset: usize) -> f64 {
    return f64::from_le_bytes(bytes[offset..offset+8].try_into().expect("incorrect length"));
  }
  fn from_be_bytes(bytes: &[u8], offset: usize) -> f64 {
    return f64::from_be_bytes(bytes[offset..offset+8].try_into().expect("incorrect length"));
  }
}

pub struct Reader<'a> {
  data: &'a [u8],
  offset: usize,
  length: u64,
}

#[allow(dead_code)]
impl Reader<'_> {
  pub fn get_data(&self) -> &[u8] { return self.data; }
  pub fn get_offset(&self) -> usize { return self.offset; }
  pub fn get_length(&self) -> u64 { return self.length; }

  pub fn new(buf: &[u8]) -> Reader { return Reader { data: buf, offset: 0, length: buf.len() as u64 }; }

  pub fn seek(&mut self, offset: usize, position: u8) {
    if position == 0 {
      self.offset = offset;
    } else if position == 1 {
      self.offset += offset;
    } else {
      self.offset = (self.length as usize) - offset;
    }
  }
  
  pub fn remaining(&mut self) -> u64 { return self.length - (self.offset as u64); }

  fn read_i<T: HasByteConvert>(&mut self, endianness: bool) -> T {
    if endianness {
      return T::from_le_bytes(self.data, self.offset);
    } else {
      return T::from_be_bytes(self.data, self.offset);
    }
  }
  
  pub fn read_char(&mut self, endianness: bool) -> char {
    return self.read_uint8(endianness) as char;
  }
  
  pub fn read_uint8(&mut self, endianness: bool) -> u8 {
    let res = self.read_i::<u8>(endianness);
    self.offset += 1;
    return res;
  }
  pub fn read_uint16(&mut self, endianness: bool) -> u16 {
    let res = self.read_i::<u16>(endianness);
    self.offset += 2;
    return res;
  }
  pub fn read_uint32(&mut self, endianness: bool) -> u32 {
    let res = self.read_i::<u32>(endianness);
    self.offset += 4;
    return res;
  }
  pub fn read_uint64(&mut self, endianness: bool) -> u64 {
    let res = self.read_i::<u64>(endianness);
    self.offset += 8;
    return res;
  }
  
  pub fn read_int8(&mut self, endianness: bool) -> i8 {
    let res = self.read_i::<i8>(endianness);
    self.offset += 1;
    return res;
  }
  pub fn read_int16(&mut self, endianness: bool) -> i16 {
    let res = self.read_i::<i16>(endianness);
    self.offset += 2;
    return res;
  }
  pub fn read_int32(&mut self, endianness: bool) -> i32 {
    let res = self.read_i::<i32>(endianness);
    self.offset += 4;
    return res;
  }
  pub fn read_int64(&mut self, endianness: bool) -> i64 {
    let res = self.read_i::<i64>(endianness);
    self.offset += 8;
    return res;
  }
  
  pub fn read_float32(&mut self, endianness: bool) -> f32 {
    let res = self.read_i::<f32>(endianness);
    self.offset += 4;
    return res;
  }
  pub fn read_float64(&mut self, endianness: bool) -> f64 {
    let res = self.read_i::<f64>(endianness);
    self.offset += 8;
    return res;
  }

  pub fn read_string(&mut self, length: Option<u32>) -> String {
    let mut len: usize = 0;

    if length.is_some() {
      len = length.unwrap() as usize;
    } else {
      loop {
        if self.data[self.offset + len] == 0 {
          break;
        } else {
          len += 1;
        }
      }
    }

    let u8_vec = self.data[self.offset..self.offset+len].to_vec();
    let u16_vec: Vec<u16> = u8_vec.iter().map(| char_code | {
      return char_code.to_owned() as u16;
    }).collect();
    let char_codes = &u16_vec[..];

    let res = String::from_utf16(char_codes).unwrap();
    self.offset += len + 1;

    return res;
  }
}