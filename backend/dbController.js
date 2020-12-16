const { Etcd3 } = require('etcd3');
const defaultItems = require('./default_shopping_items');

const host = process.env.DB_HOST;
console.log('db host: ', host);

let client;
if ( host ) {
    client = new Etcd3({hosts:host});
} else {
    client = new Etcd3();
}
console.log('Created an etcd client for host ', host);

const getAllKeys = async () => {
    console.log('get all keys...');
    const allFKeys = await client.getAll().keys();
    console.log('all keys:', allFKeys);
    return allFKeys;
}

const getAllValues = async () => {
    console.log('get all keys-values...');
    const allValues = await client.getAll().strings();
    console.log('all keys-values:', allValues);
    return allValues;
}

const getKey = async (key) => {
    console.log('get key ', key);
    const val = await client.get(key).string();
    console.log(key, ' is ', val);
    return val;
}

const setKey = async (key, value) => {
    console.log('set ', key, ' to ', value);    
    const res = await client.put(key).value(value);
    return res;
}

const deleteKey = async (key) => {
    console.log('delete ', key);    
    const res = await client.delete().key(key).exec();
    // console.log('delete ', key, ' => ', res);
    return res;
}

const initDB = async () => {
    console.log('Init DB....');

    if ( ! defaultItems || defaultItems.length === 0  ) {
        return;
    }

    let val;
    try {
      for (item of defaultItems) {
        val = await getKey(item.itemName);
        if (!val) {
          await setKey(item.itemName, item.itemQty);
        }
      }
    } catch (err) {
      console.error("An error occured while initialize etcd db: ", err);
    }

}
 
// (async () => {
//   await client.put('foo').value('bar');

//   await client.put('msg2').value('test msg2');
 
//   const fooValue = await client.get('foo').string();
//   console.log('foo was:', fooValue);
 
//   const allFValues = await client.getAll().prefix('f').keys();
//   console.log('all our keys starting with "f":', allFValues);

//   const allFValues2 = await client.getAll().keys();
//   console.log('all our keys:', allFValues2);

//   const allFValues2Str = await client.getAll().strings();
//   console.log('all our keys as text:', allFValues2Str);

//   const allFValues2Json = await client.getAll().json;
//   console.log('all our keys as JSON:', allFValues2Json);
 
// //   await client.delete().all();
// })();

// getKey('aaaa');
// initDB(); 

module.exports = {
    initDB,
    getAllKeys,
    getAllValues,
    getKey,
    setKey,
    deleteKey
}