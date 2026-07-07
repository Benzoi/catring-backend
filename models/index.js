const User = require('./UserModel');
const Dapur = require('./DapurModel');
const Menu = require('./MenuModel');
const Order = require('./OrderModel');
const OrderItem = require('./OrderItemModel');

// Relasi: User (Pembeli) bisa punya banyak Order
User.hasMany(Order, { foreignKey: 'pembeli_user_id' });
Order.belongsTo(User, { as: 'pembeli', foreignKey: 'pembeli_user_id' });

// Relasi: Dapur bisa punya banyak Order
// PERBAIKAN: Tambahkan alias 'dapur' di sini
Dapur.hasMany(Order, { foreignKey: 'dapur_id' });
Order.belongsTo(Dapur, { as: 'dapur', foreignKey: 'dapur_id' }); 

// Relasi: Order punya banyak OrderItem
Order.hasMany(OrderItem, { foreignKey: 'order_id', onDelete: 'CASCADE', as: 'OrderItems' }); // Tambahkan alias 'OrderItems'
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

// Relasi: OrderItem terhubung ke Menu
Menu.hasMany(OrderItem, { foreignKey: 'menu_id' });
OrderItem.belongsTo(Menu, { foreignKey: 'menu_id' });


// Relasi User-Dapur dan Dapur-Menu
User.hasOne(Dapur, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Dapur.belongsTo(User, { foreignKey: 'user_id' });

Dapur.hasMany(Menu, { foreignKey: 'dapur_id', onDelete: 'CASCADE' });
Menu.belongsTo(Dapur, { foreignKey: 'dapur_id' });

// Ekspor semua model yang sudah terhubung
module.exports = { User, Dapur, Menu, Order, OrderItem };
