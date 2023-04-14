trait HasByteConvert {
  fn to_le_bytes(bytes: &mut Vec<u8>, data: Self, offset: usize) -> u8;
  fn to_be_bytes(bytes: &mut Vec<u8>, data: Self, offset: usize) -> u8;
}

impl HasByteConvert for u8 {
  fn to_le_bytes(bytes: &mut Vec<u8>, data: u8, offset: usize) -> u8 {
    bytes[offset] = data;
    return 1;
  }
  fn to_be_bytes(bytes: &mut Vec<u8>, data: u8, offset: usize) -> u8 {
    bytes[offset] = data;
    return 1;
  }
}

impl HasByteConvert for u16 {
  fn to_le_bytes(bytes: &mut Vec<u8>, data: u16, offset: usize) -> u8 {
    let u8_arr = data.to_le_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    return 2;
  }
  fn to_be_bytes(bytes: &mut Vec<u8>, data: u16, offset: usize) -> u8 {
    let u8_arr = data.to_be_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    return 2;
  }
}

impl HasByteConvert for u32 {
  fn to_le_bytes(bytes: &mut Vec<u8>, data: u32, offset: usize) -> u8 {
    let u8_arr = data.to_le_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    bytes[offset+2] = u8_arr[2];
    bytes[offset+3] = u8_arr[3];
    return 4;
  }
  fn to_be_bytes(bytes: &mut Vec<u8>, data: u32, offset: usize) -> u8 {
    let u8_arr = data.to_be_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    bytes[offset+2] = u8_arr[2];
    bytes[offset+3] = u8_arr[3];
    return 4;
  }
}

impl HasByteConvert for u64 {
  fn to_le_bytes(bytes: &mut Vec<u8>, data: u64, offset: usize) -> u8 {
    let u8_arr = data.to_le_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    bytes[offset+2] = u8_arr[2];
    bytes[offset+3] = u8_arr[3];
    bytes[offset+4] = u8_arr[4];
    bytes[offset+5] = u8_arr[5];
    bytes[offset+6] = u8_arr[6];
    bytes[offset+7] = u8_arr[7];
    return 8;
  }
  fn to_be_bytes(bytes: &mut Vec<u8>, data: u64, offset: usize) -> u8 {
    let u8_arr = data.to_be_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    bytes[offset+2] = u8_arr[2];
    bytes[offset+3] = u8_arr[3];
    bytes[offset+4] = u8_arr[4];
    bytes[offset+5] = u8_arr[5];
    bytes[offset+6] = u8_arr[6];
    bytes[offset+7] = u8_arr[7];
    return 8;
  }
}

impl HasByteConvert for i8 {
  fn to_le_bytes(bytes: &mut Vec<u8>, data: i8, offset: usize) -> u8 {
    bytes[offset] = data.to_le_bytes()[0];
    return 1;
  }
  fn to_be_bytes(bytes: &mut Vec<u8>, data: i8, offset: usize) -> u8 {
    bytes[offset] = data.to_be_bytes()[0];
    return 1;
  }
}

impl HasByteConvert for i16 {
  fn to_le_bytes(bytes: &mut Vec<u8>, data: i16, offset: usize) -> u8 {
    let u8_arr = data.to_le_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    return 2;
  }
  fn to_be_bytes(bytes: &mut Vec<u8>, data: i16, offset: usize) -> u8 {
    let u8_arr = data.to_be_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    return 2;
  }
}

impl HasByteConvert for i32 {
  fn to_le_bytes(bytes: &mut Vec<u8>, data: i32, offset: usize) -> u8 {
    let u8_arr = data.to_le_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    bytes[offset+2] = u8_arr[2];
    bytes[offset+3] = u8_arr[3];
    return 4;
  }
  fn to_be_bytes(bytes: &mut Vec<u8>, data: i32, offset: usize) -> u8 {
    let u8_arr = data.to_be_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    bytes[offset+2] = u8_arr[2];
    bytes[offset+3] = u8_arr[3];
    return 4;
  }
}

impl HasByteConvert for i64 {
  fn to_le_bytes(bytes: &mut Vec<u8>, data: i64, offset: usize) -> u8 {
    let u8_arr = data.to_le_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    bytes[offset+2] = u8_arr[2];
    bytes[offset+3] = u8_arr[3];
    bytes[offset+4] = u8_arr[4];
    bytes[offset+5] = u8_arr[5];
    bytes[offset+6] = u8_arr[6];
    bytes[offset+7] = u8_arr[7];
    return 8;
  }
  fn to_be_bytes(bytes: &mut Vec<u8>, data: i64, offset: usize) -> u8 {
    let u8_arr = data.to_be_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    bytes[offset+2] = u8_arr[2];
    bytes[offset+3] = u8_arr[3];
    bytes[offset+4] = u8_arr[4];
    bytes[offset+5] = u8_arr[5];
    bytes[offset+6] = u8_arr[6];
    bytes[offset+7] = u8_arr[7];
    return 8;
  }
}

impl HasByteConvert for f32 {
  fn to_le_bytes(bytes: &mut Vec<u8>, data: f32, offset: usize) -> u8 {
    let u8_arr = data.to_le_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    bytes[offset+2] = u8_arr[2];
    bytes[offset+3] = u8_arr[3];
    return 4;
  }
  fn to_be_bytes(bytes: &mut Vec<u8>, data: f32, offset: usize) -> u8 {
    let u8_arr = data.to_be_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    bytes[offset+2] = u8_arr[2];
    bytes[offset+3] = u8_arr[3];
    return 4;
  }
}

impl HasByteConvert for f64 {
  fn to_le_bytes(bytes: &mut Vec<u8>, data: f64, offset: usize) -> u8 {
    let u8_arr = data.to_le_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    bytes[offset+2] = u8_arr[2];
    bytes[offset+3] = u8_arr[3];
    bytes[offset+4] = u8_arr[4];
    bytes[offset+5] = u8_arr[5];
    bytes[offset+6] = u8_arr[6];
    bytes[offset+7] = u8_arr[7];
    return 8;
  }
  fn to_be_bytes(bytes: &mut Vec<u8>, data: f64, offset: usize) -> u8 {
    let u8_arr = data.to_be_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    bytes[offset+2] = u8_arr[2];
    bytes[offset+3] = u8_arr[3];
    bytes[offset+4] = u8_arr[4];
    bytes[offset+5] = u8_arr[5];
    bytes[offset+6] = u8_arr[6];
    bytes[offset+7] = u8_arr[7];
    return 8;
  }
}

pub struct Writer<'a> {
  data: &'a mut Vec<u8>,
  offset: usize,
}

#[allow(dead_code)]
impl Writer<'_> {
  pub fn get_data(&self) -> &[u8] { return &self.data[..]; }
  pub fn get_offset(&self) -> usize { return self.offset; }

  pub fn new(buf: &mut Vec<u8>) -> Writer { return Writer { data: buf, offset: 0 }; }

  pub fn seek(&mut self, offset: usize, position: u8) {
    if position == 0 {
      self.offset = offset;
    } else if position == 1 {
      self.offset += offset;
    } else {
      self.offset = (self.data.len() as usize) - offset;
    }
  }
  
  fn expand_capacity(&mut self) {
    self.data.resize(self.data.len() * 2, 0);
  }

  fn write_i<T: HasByteConvert>(&mut self, data: T, length: u8, endianness: bool) -> u8 {
    if self.remaining() <= length.into() {
      self.expand_capacity()
    }

    if endianness {
      return T::to_le_bytes(self.data, data, self.offset);
    } else {
      return T::to_be_bytes(self.data, data, self.offset);
    }
  }

  pub fn trim(&mut self) {
    self.data.truncate(self.offset);
  }

  pub fn remaining(&mut self) -> usize {
    return self.data.len() - (self.offset + 1);
  }
  
  pub fn write_uint8(&mut self, data: u8, endianness: bool) -> u8 {
    let res = self.write_i::<u8>(data, 1, endianness);
    self.offset += 1;
    return res;
  }
  pub fn write_uint16(&mut self, data: u16, endianness: bool) -> u8 {
    let res = self.write_i::<u16>(data, 2, endianness);
    self.offset += 2;
    return res;
  }
  pub fn write_uint32(&mut self, data: u32, endianness: bool) -> u8 {
    let res = self.write_i::<u32>(data, 4, endianness);
    self.offset += 4;
    return res;
  }
  pub fn write_uint64(&mut self, data: u64, endianness: bool) -> u8 {
    let res = self.write_i::<u64>(data, 8, endianness);
    self.offset += 8;
    return res;
  }
  
  pub fn write_int8(&mut self, data: i8, endianness: bool) -> u8 {
    let res = self.write_i::<i8>(data, 1, endianness);
    self.offset += 1;
    return res;
  }
  pub fn write_int16(&mut self, data: i16, endianness: bool) -> u8 {
    let res = self.write_i::<i16>(data, 2, endianness);
    self.offset += 2;
    return res;
  }
  pub fn write_int32(&mut self, data: i32, endianness: bool) -> u8 {
    let res = self.write_i::<i32>(data, 4, endianness);
    self.offset += 4;
    return res;
  }
  pub fn write_int64(&mut self, data: i64, endianness: bool) -> u8 {
    let res = self.write_i::<i64>(data, 8, endianness);
    self.offset += 8;
    return res;
  }
  
  pub fn write_float32(&mut self, data: f32, endianness: bool) -> u8 {
    let res = self.write_i::<f32>(data, 4, endianness);
    self.offset += 4;
    return res;
  }
  pub fn write_float64(&mut self, data: f64, endianness: bool) -> u8 {
    let res = self.write_i::<f64>(data, 8, endianness);
    self.offset += 8;
    return res;
  }

  pub fn write_string(&mut self, data: String, prefix_with_length: bool, endianness: bool) -> u32 {
    let str_bytes = data.into_bytes();
    let str_bytes_len = str_bytes.len();
    let mut length_to_return = str_bytes_len;

    if prefix_with_length {
      self.write_uint32(str_bytes_len as u32, endianness);
      length_to_return += 4;
    }
    
    if self.remaining() <= self.data.len() {
      self.expand_capacity()
    }
    
    let mut i: usize = 0;
    while i < str_bytes_len {
      self.data[self.offset + i] = str_bytes[i];
      i += 1;
    }

    self.data[self.offset + str_bytes_len] = 0x00;

    self.offset += str_bytes_len;

    return length_to_return as u32;
  }
}