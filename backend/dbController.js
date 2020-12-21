const { Etcd3 } = require('etcd3');
const defaultItems = require('./default_shopping_items');

const io = require('./socket');

const host = process.env.DB_HOST;
console.log('db host: ', host);

let client;
if ( host ) {
    client = new Etcd3({hosts:host});
} else {
    client = new Etcd3();
}
console.log('Created an etcd client for host ', host);

const getAllItems = async (key) => {
  return getAllValues();
}

const getItem = async (key) => {
  return getKey(key);
}

const addItem = async (key, value) => {
  await setKey(key, value);

  //watch changes to the new item
  await watchKeyChanges(key);

  //send event to clients
  io.getIO().emit("change", { action: "add", key, value });
}

const updateItem = async (key, value) => {
  return setKey(key, value);
}

const deleteItem = async (key) => {
  return deleteKey(key);
}

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

const initWatchers = async () => {
  console.log('Init watchers....');

  const keys = await getAllKeys();

  try {
    for (key of keys) {
      watchKeyChanges(key);
    }
  } catch (err) { 
    console.error("An error occured while initialize etcd watchers: ", err);
  }

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
          // addItem(item.itemName, item.itemQty);
          await setKey(item.itemName, item.itemQty);
        }
        // watchKeyChanges(item.itemName);
      }
    } catch (err) { 
      console.error("An error occured while initialize etcd db: ", err);
    }

    await initWatchers();

    io.getIO().emit("change", { action: "init" });
}


const watchKeyChanges = (key) => {
    console.log('Watch changes for ', key);
    client
      .watch()
      .key(key)
      .create()
      .then((watcher) => {
        watcher
          .on("disconnected", () => 
            console.log("watcher disconnected...")
            )
          .on("connected", () =>
            console.log("successfully reconnected watcher!")
          )
          .on("put", (res) => {
            let value = res.value.toString();
            console.log('PUT EVENT - ', key, " got set to:", value);
            //emit event
            io.getIO().emit("change", { action: "update", key, value });
          })
          .on("delete", (res) => { 
              console.log('DELETE EVENT - ', key, " was deleted");
              //emit event
            io.getIO().emit("change", { action: "delete", key, value: null });
        });
      });
}

module.exports = {
    initDB,
    getAllItems,
    getItem,
    addItem,
    updateItem,
    deleteItem,
    // getAllKeys,
    // getAllValues,
    // getKey,
    // setKey,
    // deleteKey
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
