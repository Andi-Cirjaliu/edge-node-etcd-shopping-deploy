const db = require('./dbController');

const getShopppingList = async (req, res, next) => {
    console.log('Get shopping list...');
    const result = await db.getAllValues();
    // return res.json(result);
    return res.render('shopping/main', {
        items: result,
        pageTitle: 'Shopping list' 
      });
}

const addShopppingItem = async (req, res, next) => { 
    const item = req.body.item;
    const qty = req.body.qty;
    console.log('Add item ', item, ' quantity ', qty);

    //check if item already exists
    const val = await db.getKey(item);
    if ( val ) {
        //TODO handle this case
        console.log('Item ', item, ' already is in list.');
        return res.redirect('/');
    }

    await db.setKey(item, qty);  
    
    res.redirect('/');
    // await getShopppingList(req, res, next);
}

const decQtyShopppingItem = async (req, res, next) => {
    // console.log('Params ', req.params);
    const item = req.body.item;  //req.params.item;
    console.log('Decrement quantity item ', item);

    if ( ! item ) {
        return next(new Error('Invalid item'), req, res);
    }

    const val = await db.getKey(item);
    const qty = Number.parseInt(val); 

    if ( qty >= 2 ) {
        await db.setKey(item, qty-1);
    } else {
        //Qty is 1 so the item can be removed 
        await db.deleteKey(item);
    }
    
    res.redirect('/');
    // await getShopppingList(req, res, next);
}

const incQtyShopppingItem = async (req, res, next) => {
    // console.log('Params ', req.params);
    const item = req.body.item;   //req.params.item;
    console.log('Increment quantity item ', item);

    if ( ! item ) {
        return next(new Error('Invalid item'), req, res);
    }

    const val = await db.getKey(item);
    const qty = Number.parseInt(val);

    if ( qty < 100 ) {
        await db.setKey(item, qty+1);
    } else {
        //Qty is 100. throw an error
        throw new Error('Quantity cannot be bigger than 100');
    }
    
    res.redirect('/');
    // await getShopppingList(req, res, next);
}

const deleteShopppingItem = async (req, res, next) => {
    // console.log('Params ', req.params);
    const item = req.body.item;       //req.params.item;
    console.log('Delete item ', item);

    if ( ! item ) {
        return next(new Error('Invalid item'), req, res);
    }

    await db.deleteKey(item);

    res.redirect('/');
    // await getShopppingList(req, res, next);
}

module.exports = {
    getShopppingList,
    addShopppingItem,
    decQtyShopppingItem,
    incQtyShopppingItem,
    deleteShopppingItem
}