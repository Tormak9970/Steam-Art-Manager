trait HasByteConvert {
  fn to_le_bytes(bytes: &mut [u8], data: Self, offset: usize) -> u8;
  fn to_be_bytes(bytes: &mut [u8], data: Self, offset: usize) -> u8;
}

impl HasByteConvert for u8 {
  fn to_le_bytes(bytes: &mut [u8], data: u8, offset: usize) -> u8 {
    bytes[offset] = data;
    return 1;
  }
  fn to_be_bytes(bytes: &mut [u8], data: u8, offset: usize) -> u8 {
    bytes[offset] = data;
    return 1;
  }
}

impl HasByteConvert for u16 {
  fn to_le_bytes(bytes: &mut [u8], data: u16, offset: usize) -> u8 {
    let u8_arr = data.to_le_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    return 2;
  }
  fn to_be_bytes(bytes: &mut [u8], data: u16, offset: usize) -> u8 {
    let u8_arr = data.to_be_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    return 2;
  }
}

impl HasByteConvert for u32 {
  fn to_le_bytes(bytes: &mut [u8], data: u32, offset: usize) -> u8 {
    let u8_arr = data.to_le_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    bytes[offset+2] = u8_arr[2];
    bytes[offset+3] = u8_arr[3];
    return 4;
  }
  fn to_be_bytes(bytes: &mut [u8], data: u32, offset: usize) -> u8 {
    let u8_arr = data.to_be_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    bytes[offset+2] = u8_arr[2];
    bytes[offset+3] = u8_arr[3];
    return 4;
  }
}

impl HasByteConvert for u64 {
  fn to_le_bytes(bytes: &mut [u8], data: u64, offset: usize) -> u8 {
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
  fn to_be_bytes(bytes: &mut [u8], data: u64, offset: usize) -> u8 {
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
  fn to_le_bytes(bytes: &mut [u8], data: i8, offset: usize) -> u8 {
    bytes[offset] = data.to_le_bytes()[0];
    return 1;
  }
  fn to_be_bytes(bytes: &mut [u8], data: i8, offset: usize) -> u8 {
    bytes[offset] = data.to_be_bytes()[0];
    return 1;
  }
}

impl HasByteConvert for i16 {
  fn to_le_bytes(bytes: &mut [u8], data: i16, offset: usize) -> u8 {
    let u8_arr = data.to_le_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    return 2;
  }
  fn to_be_bytes(bytes: &mut [u8], data: i16, offset: usize) -> u8 {
    let u8_arr = data.to_be_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    return 2;
  }
}

impl HasByteConvert for i32 {
  fn to_le_bytes(bytes: &mut [u8], data: i32, offset: usize) -> u8 {
    let u8_arr = data.to_le_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    bytes[offset+2] = u8_arr[2];
    bytes[offset+3] = u8_arr[3];
    return 4;
  }
  fn to_be_bytes(bytes: &mut [u8], data: i32, offset: usize) -> u8 {
    let u8_arr = data.to_be_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    bytes[offset+2] = u8_arr[2];
    bytes[offset+3] = u8_arr[3];
    return 4;
  }
}

impl HasByteConvert for i64 {
  fn to_le_bytes(bytes: &mut [u8], data: i64, offset: usize) -> u8 {
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
  fn to_be_bytes(bytes: &mut [u8], data: i64, offset: usize) -> u8 {
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
  fn to_le_bytes(bytes: &mut [u8], data: f32, offset: usize) -> u8 {
    let u8_arr = data.to_le_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    bytes[offset+2] = u8_arr[2];
    bytes[offset+3] = u8_arr[3];
    return 4;
  }
  fn to_be_bytes(bytes: &mut [u8], data: f32, offset: usize) -> u8 {
    let u8_arr = data.to_be_bytes();
    bytes[offset] = u8_arr[0];
    bytes[offset+1] = u8_arr[1];
    bytes[offset+2] = u8_arr[2];
    bytes[offset+3] = u8_arr[3];
    return 4;
  }
}

impl HasByteConvert for f64 {
  fn to_le_bytes(bytes: &mut [u8], data: f64, offset: usize) -> u8 {
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
  fn to_be_bytes(bytes: &mut [u8], data: f64, offset: usize) -> u8 {
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
  data: &'a mut [u8],
  offset: usize,
  length: usize,
}

#[allow(dead_code)]
impl Writer<'_> {
  pub fn get_data(&self) -> &[u8] { return self.data; }
  pub fn get_offset(&self) -> usize { return self.offset; }
  pub fn get_length(&self) -> usize { return self.length; }

  pub fn new(buf: &mut [u8]) -> Writer { return Writer { data: buf, offset: 0, length: buf.len() }; }

  fn expand_capacity(&mut self) {
    let mut new_data: Vec<u8> = vec![0; self.length.try_into().unwrap()];
    let mut u8_vec: Vec<u8> = self.data.to_vec();
    let mut_u8_vec: &mut Vec<u8> = u8_vec.as_mut();
    
    mut_u8_vec.append(new_data.as_mut());
    
    self.length = self.length * 2;

    self.data = mut_u8_vec[..].as_mut();
  }

  pub fn trim(&mut self) {
    let data = &self.data[0..self.offset];
    let owned_data = data.to_owned();

    self.length = self.offset;
    self.data = owned_data[..].as_mut();
  }

  pub fn seek(&mut self, offset: usize, position: u8) {
    if position == 0 {
      self.offset = offset;
    } else if position == 1 {
      self.offset += offset;
    } else {
      self.offset = (self.length as usize) - offset;
    }
  }
  
  pub fn remaining(&mut self) -> usize { return self.length - (self.offset + 1); }

  fn write_i<T: HasByteConvert>(&mut self, data: T, length: u8, endianness: bool) -> u8 {
    if self.remaining() <= length.into() {
      self.expand_capacity();
    }
    if endianness {
      return T::to_le_bytes(self.data, data, self.offset);
    } else {
      return T::to_be_bytes(self.data, data, self.offset);
    }
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
    
    let mut i: usize = 0;
    while i < str_bytes_len {
      self.data[self.offset + i] = str_bytes[i];
      i += 1;
    }

    self.offset += str_bytes_len;

    return length_to_return as u32;
  }
}