

export class LevelDBReader {
  constructor(userSteamID: number) {

  }
}

// ? NPM steam-collections reference
// var levelup = require('levelup');
// var leveldown = require('leveldown');
// var encode = require('encoding-down');
// var iconv = require('iconv-lite');

// module.exports = class SteamCategories {
//   constructor(dbPath, steamid) {
//     this.db = null;
//     this.dbPath = dbPath;
//     this.steam3Id = steamid;
//     this.namespaceKeys = [];
//     this.collections = {};
//     this.collectionsFiltered = {};
//     this.keyPrefix = `_https://steamloopback.host\u0000\u0001U${this.steam3Id}-cloud-storage-namespace`;
//   }

//   async read() {
//     return new Promise((resolve, reject) => {
//       this.db = levelup(encode(leveldown(this.dbPath), { valueEncoding: 'hex' }),(err)=>{
//         if (err) return reject(err)
//       });

//       this.db.get(`${this.keyPrefix}s`, {valueEncoding: 'utf-8'}, (err, value) => {
//         if (err) return reject(err);
//         this.namespaceKeys = JSON.parse(value.slice(1)).map((x) => `${this.keyPrefix}-${x[0]}`);
//         const collections = {};
//         this.db.createReadStream({
//           keys: true,
//           values: true,
//           gte: `${this.keyPrefix}-`,
//           lte: `${this.keyPrefix}-~`
//         }).on('data', (data) => {
//           if (this.namespaceKeys.includes(data.key)) {

//             const id = data.key.replace(`${this.keyPrefix}-`, '');
//             if(['00','01'].indexOf(data.value.substr(0,2))<0){
//               reject('Illegal BOM')
//             }
//             try {
//               const unserialized = this.unserializeCollections(data.value);
//               collections[id] = unserialized;
//             } catch(err) {
//               reject(err)
//             }
//           }
//         }).on('end', () => {
//           this.collections = collections;
//           resolve(collections);
//         });
//       });
//     });
//   }

//   list() {
//     const names = [];
//     for (const [, collection] of Object.entries(this.collections)) {
//       for (const key of Object.entries(collection)) {
//         names.push(key[0].replace('user-collections.', ''));
//       }
//     }
//     return names;
//   }

//   remove(collectionId) {
//     for (const id in this.collections) {
//       if ((`user-collections.${collectionId}` in this.collections[id])) {
//         delete this.collections[id][`user-collections.${collectionId}`];
//         return true;
//       }
//     }
//     return false;
//   }

//   // Expose some leveldb methods
//   close() {
//     return this.db.close();
//   }

//   isClosed() {
//     return this.db.isClosed();
//   }

//   isOpen() {
//     return this.db.isOpen();
//   }

//   get(id) {
//     id = `user-collections.${id}`;
//     for (const [, x] of Object.entries(this.collections)) {
//       if (x[id]) {
//         return x[id];
//       }
//     }
//     return false;
//   }

//   add(id, values) {
//     const data = {
//       key: `user-collections.${id}`,
//       timestamp: Math.ceil(Date.now()/1000),
//       value: Object.assign({}, { id: `${id}` }, values),
//       conflictResolutionMethod: 'custom',
//       strMethodId: 'union-collections'
//     };

//     // add to last
//     this.collections[Object.keys(this.collections).slice(-1)[0]][`user-collections.${id}`] = data;
//     return data;
//   }

//   async save() {
//     return new Promise((resolve) => {
//       const promises = [];
//       for (const [key, collections] of Object.entries(this.collections)) {
//         const putPromise = new Promise((resolve, reject) => {
//           this.db.put(`${this.keyPrefix}-${key}`, this.serializeCollections(collections), (err) => {
//             if (err) reject(err);
//             resolve();
//           });
//         });
//         promises.push(putPromise);
//       }
//       Promise.all(promises).then(() => resolve());
//     });
//   }

//   serializeCollections(collections) {
//     const output = [];
//     Object.entries(collections).forEach((collection) => {
//       if (collection[1].value) {
//         collection[1].value = JSON.stringify(collection[1].value);
//       }
//       output.push(collection);
//     });
//     return `00${iconv.encode(JSON.stringify(output),'utf16le').toString('hex')}`;
//   }

//   unserializeCollections(input) {
//     let transformed = input.substr(0,2)==='01'?input.slice(2).match(/.{1,2}/g).join('00').concat('00'): input.slice(2);
//     let iBuf = Buffer.from(transformed,'hex');
//     let decoded = iconv.decode(iBuf,'utf16le');
//     const collections = JSON.parse(decoded);
//     const output = {};
//     collections.forEach((x) => {
//       if (x[1].value) {
//         x[1].value = JSON.parse(x[1].value);
//       }
//       output[x[0]] = x[1];
//     });
//     return output;
//   }
// };