// server.js

// 1. Import Dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// 2. Initialize Firebase
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const menuCollection = db.collection('menuItems');

// --- ข้อมูลเมนูใหม่ทั้งหมดจากไฟล์ CSV เท่านั้น ---
const newMenuData = [
  // เครื่องดื่ม
  { name_th: 'ນ້ຳຫົວເສືອກາງ', name_en: 'Tigerhead Water (M)', price: 8000, category: 'drink', image: 'https://placehold.co/100x100/a16207/ffffff?text=Water' },
  { name_th: 'ເປບຊີ', name_en: 'Pepsi', price: 15000, category: 'drink', image: 'https://placehold.co/100x100/22c55e/ffffff?text=Pepsi' },
  { name_th: 'ສະຕິງ', name_en: 'Sting', price: 15000, category: 'drink', image: 'https://placehold.co/100x100/f97316/ffffff?text=Sting' },
  { name_th: 'ນ້ຳກາໄຊ່ມຸກ', name_en: 'Bubble Tea Water', price: 5000, category: 'drink', image: 'https://placehold.co/100x100/a16207/ffffff?text=Bubble+Tea' },
  { name_th: 'ຫົວເສືອ ນ້ອຍ', name_en: 'Tigerhead Water (S)', price: 5000, category: 'drink', image: 'https://placehold.co/100x100/22c55e/ffffff?text=Water' },
  { name_th: 'Mirinda', name_en: 'Mirinda', price: 15000, category: 'drink', image: 'https://placehold.co/100x100/f97316/ffffff?text=Mirinda' },

  // เครื่องดื่ม Majedo
  { name_th: 'Green Tea', name_en: 'Green Tea', price: 30000, category: 'majedo_drink', image: 'https://placehold.co/100x100/22c55e/ffffff?text=Green+Tea' },
  { name_th: 'Mocha', name_en: 'Mocha', price: 35000, category: 'majedo_drink', image: 'https://placehold.co/100x100/6f4e37/ffffff?text=Mocha' },
  { name_th: 'Americano hot&ice', name_en: 'Americano hot&ice', price: 30000, category: 'majedo_drink', image: 'https://placehold.co/100x100/6f4e37/ffffff?text=Americano' },
  { name_th: 'Cappuccino hot&ice', name_en: 'Cappuccino hot&ice', price: 33000, category: 'majedo_drink', image: 'https://placehold.co/100x100/6f4e37/ffffff?text=Cappuccino' },
  { name_th: 'Espresso hot&ice', name_en: 'Espresso hot&ice', price: 33000, category: 'majedo_drink', image: 'https://placehold.co/100x100/6f4e37/ffffff?text=Espresso' },
  { name_th: 'latte hot&ice', name_en: 'Latte hot&ice', price: 33000, category: 'majedo_drink', image: 'https://placehold.co/100x100/6f4e37/ffffff?text=Latte' },
  { name_th: 'Macchiato hot&ice', name_en: 'Macchiato hot&ice', price: 35000, category: 'majedo_drink', image: 'https://placehold.co/100x100/6f4e37/ffffff?text=Macchiato' },
  { name_th: 'Black honey hot&ice', name_en: 'Black honey hot&ice', price: 33000, category: 'majedo_drink', image: 'https://placehold.co/100x100/000000/ffffff?text=Black+Honey' },
  { name_th: 'Black orange ice', name_en: 'Black orange ice', price: 35000, category: 'majedo_drink', image: 'https://placehold.co/100x100/f97316/ffffff?text=Orange' },
  { name_th: 'Black lemon', name_en: 'Black lemon', price: 35000, category: 'majedo_drink', image: 'https://placehold.co/100x100/eab308/ffffff?text=Lemon' },
  { name_th: 'Matcha latte hot&ice', name_en: 'Matcha latte hot&ice', price: 35000, category: 'majedo_drink', image: 'https://placehold.co/100x100/22c55e/ffffff?text=Matcha' },
  { name_th: 'Cocoa hot&ice', name_en: 'Cocoa hot&ice', price: 30000, category: 'majedo_drink', image: 'https://placehold.co/100x100/7b3f00/ffffff?text=Cocoa' },
  { name_th: 'Milk hot&ice', name_en: 'Milk hot&ice', price: 33000, category: 'majedo_drink', image: 'https://placehold.co/100x100/f0e68c/ffffff?text=Milk' },
  { name_th: 'Hojicha hot&ice', name_en: 'Hojicha hot&ice', price: 35000, category: 'majedo_drink', image: 'https://placehold.co/100x100/8B4513/ffffff?text=Hojicha' },
  { name_th: 'Thai tea hot&ice', name_en: 'Thai tea hot&ice', price: 30000, category: 'majedo_drink', image: 'https://placehold.co/100x100/f97316/ffffff?text=Thai+Tea' },
  { name_th: 'Cocoa mint ice', name_en: 'Cocoa mint ice', price: 35000, category: 'majedo_drink', image: 'https://placehold.co/100x100/7b3f00/ffffff?text=Cocoa+Mint' },
  { name_th: 'Lemon tea hot&ice', name_en: 'Lemon tea hot&ice', price: 30000, category: 'majedo_drink', image: 'https://placehold.co/100x100/eab308/ffffff?text=Lemon+Tea' },
  { name_th: 'Lemon soda', name_en: 'Lemon soda', price: 30000, category: 'majedo_drink', image: 'https://placehold.co/100x100/eab308/ffffff?text=Lemon+Soda' },
  { name_th: 'Lemon green tea ice', name_en: 'Lemon green tea ice', price: 33000, category: 'majedo_drink', image: 'https://placehold.co/100x100/32CD32/ffffff?text=Lemon+Green+Tea' },
  { name_th: 'Matcha coconut', name_en: 'Matcha coconut', price: 40000, category: 'majedo_drink', image: 'https://placehold.co/100x100/22c55e/ffffff?text=Matcha+Coconut' },
  { name_th: 'Thai tea coconut', name_en: 'Thai tea coconut', price: 40000, category: 'majedo_drink', image: 'https://placehold.co/100x100/f97316/ffffff?text=Thai+Tea+Coconut' },
  { name_th: 'Cocoa coconut', name_en: 'Cocoa coconut', price: 40000, category: 'majedo_drink', image: 'https://placehold.co/100x100/7b3f00/ffffff?text=Cocoa+Coconut' },
  { name_th: 'Blueberry coconut frappe', name_en: 'Blueberry coconut frappe', price: 35000, category: 'majedo_drink', image: 'https://placehold.co/100x100/4682B4/ffffff?text=Blueberry' },
  { name_th: 'Chocolate chip frappe', name_en: 'Chocolate chip frappe', price: 40000, category: 'majedo_drink', image: 'https://placehold.co/100x100/7b3f00/ffffff?text=Chip+Frappe' },
  { name_th: 'Cocoa thai tea ice', name_en: 'Cocoa thai tea ice', price: 35000, category: 'majedo_drink', image: 'https://placehold.co/100x100/f97316/ffffff?text=Cocoa+Thai+Tea' },
  { name_th: 'Cappuccino frappe', name_en: 'Cappuccino frappe', price: 35000, category: 'majedo_drink', image: 'https://placehold.co/100x100/6f4e37/ffffff?text=Cap+Frappe' },
  { name_th: 'Espresso frappe', name_en: 'Espresso frappe', price: 35000, category: 'majedo_drink', image: 'https://placehold.co/100x100/6f4e37/ffffff?text=Esp+Frappe' },
  { name_th: 'Latte frappe', name_en: 'Latte frappe', price: 35000, category: 'majedo_drink', image: 'https://placehold.co/100x100/6f4e37/ffffff?text=Latte+Frappe' },
  { name_th: 'Macchiato frappe', name_en: 'Macchiato frappe', price: 38000, category: 'majedo_drink', image: 'https://placehold.co/100x100/6f4e37/ffffff?text=Mac+Frappe' },
  { name_th: 'Mocha frappe', name_en: 'Mocha frappe', price: 38000, category: 'majedo_drink', image: 'https://placehold.co/100x100/6f4e37/ffffff?text=Mocha+Frappe' },
  { name_th: 'Matcha frappe', name_en: 'Matcha frappe', price: 40000, category: 'majedo_drink', image: 'https://placehold.co/100x100/22c55e/ffffff?text=Matcha+Frappe' },
  { name_th: 'Hojicha frappe', name_en: 'Hojicha frappe', price: 40000, category: 'majedo_drink', image: 'https://placehold.co/100x100/8B4513/ffffff?text=Hojicha+Frappe' },
  { name_th: 'Green tea frappe', name_en: 'Green tea frappe', price: 35000, category: 'majedo_drink', image: 'https://placehold.co/100x100/22c55e/ffffff?text=Green+Tea+Frappe' },
  { name_th: 'Thai tea frappe', name_en: 'Thai tea frappe', price: 35000, category: 'majedo_drink', image: 'https://placehold.co/100x100/f97316/ffffff?text=Thai+Tea+Frappe' },
  { name_th: 'Chocolate frappe', name_en: 'Chocolate frappe', price: 35000, category: 'majedo_drink', image: 'https://placehold.co/100x100/7b3f00/ffffff?text=Choco+Frappe' },
  { name_th: 'Milk frappe', name_en: 'Milk frappe', price: 35000, category: 'majedo_drink', image: 'https://placehold.co/100x100/f0e68c/ffffff?text=Milk+Frappe' },
  { name_th: 'Caramel milk hot&ice', name_en: 'Caramel milk hot&ice', price: 33000, category: 'majedo_drink', image: 'https://placehold.co/100x100/DAA520/ffffff?text=Caramel+Milk' },
  { name_th: 'Caramel milk frappe', name_en: 'Caramel milk frappe', price: 35000, category: 'majedo_drink', image: 'https://placehold.co/100x100/DAA520/ffffff?text=Caramel+Frappe' },
  { name_th: 'Strawberry frappe', name_en: 'Strawberry frappe', price: 38000, category: 'majedo_drink', image: 'https://placehold.co/100x100/FF6347/ffffff?text=Strawberry' },
  { name_th: 'cocoa', name_en: 'cocoa', price: 30000, category: 'majedo_drink', image: 'https://placehold.co/100x100/7b3f00/ffffff?text=Cocoa' },
  { name_th: 'Croissant', name_en: 'Croissant', price: 37000, category: 'majedo_drink', image: 'https://placehold.co/100x100/d2b48c/ffffff?text=Croissant' },

  // เส้น
  { name_th: 'ເຝີ ຊີ້ນສົດທຳມະດາ', name_en: 'Regular Fresh Beef Pho', price: 45000, category: 'noodle', image: 'https://placehold.co/100x100/a16207/ffffff?text=Pho' },
  { name_th: 'ເຝີ ຊີ້ນເປື່ອຍ', name_en: 'Braised Beef Pho', price: 45000, category: 'noodle', image: 'https://placehold.co/100x100/a16207/ffffff?text=Pho' },
  { name_th: 'ເຝີ ກາງ', name_en: 'Medium Pho', price: 50000, category: 'noodle', image: 'https://placehold.co/100x100/a16207/ffffff?text=Pho' },
  { name_th: 'ເຝີລວມ', name_en: 'Combination Pho', price: 55000, category: 'noodle', image: 'https://placehold.co/100x100/a16207/ffffff?text=Pho' },
  { name_th: 'ເຂົ້າປຽກ', name_en: 'Khao Piak', price: 45000, category: 'noodle', image: 'https://placehold.co/100x100/deb887/ffffff?text=Khao+Piak' },
  { name_th: 'ສຸກກີ້', name_en: 'Suki', price: 50000, category: 'noodle', image: 'https://placehold.co/100x100/ff4500/ffffff?text=Suki' },
  { name_th: 'ເກົາເຫຼົາ', name_en: 'Kao Lao', price: 45000, category: 'noodle', image: 'https://placehold.co/100x100/8b4513/ffffff?text=Kao+Lao' },
  { name_th: 'ກ້ວຍຈັບຢວນ', name_en: 'Kuay Jap Yuan', price: 45000, category: 'noodle', image: 'https://placehold.co/100x100/deb887/ffffff?text=Kuay+Jap' },
  { name_th: 'ເຝີ ພິເສດ ໃຫຍ່', name_en: 'Large Special Pho', price: 60000, category: 'noodle', image: 'https://placehold.co/100x100/a16207/ffffff?text=Pho' },
  { name_th: 'ເຝີ ທະເລ', name_en: 'Seafood Pho', price: 45000, category: 'noodle', image: 'https://placehold.co/100x100/00bfff/ffffff?text=Seafood+Pho' },
  { name_th: 'ໝີ່ໄວໄວ', name_en: 'Wai Wai Noodles', price: 45000, category: 'noodle', image: 'https://placehold.co/100x100/ff6347/ffffff?text=Wai+Wai' },
  { name_th: 'ເຝີ ຊີ້ນສົດ', name_en: 'Fresh Beef Pho', price: 55000, category: 'noodle', image: 'https://placehold.co/100x100/a16207/ffffff?text=Pho' },
  { name_th: 'ລ້ອນ ຊີ້ນສົດ', name_en: 'Fresh Beef Hot Pot', price: 45000, category: 'noodle', image: 'https://placehold.co/100x100/a16207/ffffff?text=Hot+Pot' },
  { name_th: 'ກ້ວຍຈັບຢວນ ພິເສດ', name_en: 'Special Kuay Jap Yuan', price: 60000, category: 'noodle', image: 'https://placehold.co/100x100/deb887/ffffff?text=Kuay+Jap' },
  { name_th: 'ເຝີ ລູກຊິ້ນ', name_en: 'Meatball Pho', price: 45000, category: 'noodle', image: 'https://placehold.co/100x100/a16207/ffffff?text=Pho' },
  { name_th: 'ໝີ່ໄວໆ ລູກຊິ້ນ', name_en: 'Wai Wai Noodles with Meatballs', price: 45000, category: 'noodle', image: 'https://placehold.co/100x100/ff6347/ffffff?text=Wai+Wai' },
  { name_th: 'ເພິ່ມເສັ້ນເຝີ', name_en: 'Extra Pho Noodles', price: 10000, category: 'noodle', image: 'https://placehold.co/100x100/deb887/ffffff?text=Noodles' },

  // ของหวาน
  { name_th: 'ຂະໜົມເຄັກ ບາວນີ້', name_en: 'Brownie Cake', price: 13000, category: 'dessert', image: 'https://placehold.co/100x100/8B4513/ffffff?text=Brownie' },

  // อาหารจานหลัก
  { name_th: 'ເຂົ້າຜັດທະເລ', name_en: 'Seafood Fried Rice', price: 45000, category: 'main', image: 'https://placehold.co/100x100/00bfff/ffffff?text=Fried+Rice' },
  { name_th: 'ໄກ່ກອບມ່າລ່າ', name_en: 'Mala Crispy Chicken', price: 45000, category: 'main', image: 'https://placehold.co/100x100/dc143c/ffffff?text=Mala+Chicken' },
  { name_th: 'ເຂົ້າຜັດໝູ', name_en: 'Pork Fried Rice', price: 45000, category: 'main', image: 'https://placehold.co/100x100/f59e0b/ffffff?text=Fried+Rice' },
  { name_th: 'ເຂົ້າກະເພົາໝູ', name_en: 'Krapow with Pork on Rice', price: 45000, category: 'main', image: 'https://placehold.co/100x100/ef4444/ffffff?text=Krapow' },
  { name_th: 'ເຂົ້າໄຂ່ຈຽວ', name_en: 'Omelette on Rice', price: 45000, category: 'main', image: 'https://placehold.co/100x100/eab308/ffffff?text=Omelette' },
  { name_th: 'ເຂົ້າໄຂ່ຈຽວໝູສັບ', name_en: 'Minced Pork Omelette on Rice', price: 40000, category: 'main', image: 'https://placehold.co/100x100/eab308/ffffff?text=Omelette' },
  { name_th: 'ເຂົ້າໄກ່ກອບເກົາຫຼີ', name_en: 'Korean Crispy Chicken on Rice', price: 45000, category: 'main', image: 'https://placehold.co/100x100/dc143c/ffffff?text=Korean+Chicken' },
  { name_th: 'ເຂົ້າຈ້າວເປົ່າ 1 ຈານ', name_en: '1 Plate of Steamed Rice', price: 10000, category: 'main', image: 'https://placehold.co/100x100/f5f5f5/000000?text=Rice' },
  { name_th: 'ໄຂ່ດາວ', name_en: 'Fried Egg', price: 5000, category: 'main', image: 'https://placehold.co/100x100/eab308/ffffff?text=Egg' },
  { name_th: 'ຜັດຂີ້ເມົາທະເລ', name_en: 'Spicy Seafood Stir-fry', price: 60000, category: 'main', image: 'https://placehold.co/100x100/00bfff/ffffff?text=Stir-fry' },
  { name_th: 'ຜັດຂີ້ເມົາໝູ', name_en: 'Spicy Pork Stir-fry', price: 50000, category: 'main', image: 'https://placehold.co/100x100/ef4444/ffffff?text=Stir-fry' },
  { name_th: 'ເຂົ້າກະເພົາທະເລ', name_en: 'Krapow with Seafood on Rice', price: 45000, category: 'main', image: 'https://placehold.co/100x100/00bfff/ffffff?text=Krapow' },
  { name_th: 'ຜັດຂິ້ເມົາ', name_en: 'Pad Kee Mao', price: 60000, category: 'main', image: 'https://placehold.co/100x100/deb887/ffffff?text=Pad+Kee+Mao' },
  { name_th: 'ຂົ້ວຜັກ ລາດເຂົ້າ', name_en: 'Stir-fried Vegetables on Rice', price: 45000, category: 'main', image: 'https://placehold.co/100x100/22c55e/ffffff?text=Veggies' },
  { name_th: 'ກະເພົາທະເລ+ງົວ', name_en: 'Krapow Seafood + Beef', price: 45000, category: 'main', image: 'https://placehold.co/100x100/00bfff/ffffff?text=Krapow' },
  { name_th: 'ເຂົ້າໄກ່ກອບ', name_en: 'Crispy Chicken on Rice', price: 45000, category: 'main', image: 'https://placehold.co/100x100/d2b48c/ffffff?text=Chicken' },
  { name_th: 'ເຂົ້າກະເພົາໝູ ພິເສດ', name_en: 'Special Krapow with Pork on Rice', price: 50000, category: 'main', image: 'https://placehold.co/100x100/ef4444/ffffff?text=Krapow' },

  // อาหารทานเล่น
  { name_th: 'ບາວນີ້ກອບ,ຄຸກກີ້', name_en: 'Crispy Brownie, Cookie', price: 25000, category: 'appetizer', image: 'https://placehold.co/100x100/8B4513/ffffff?text=Snack' },
  { name_th: 'ຂະໜົມໝາກເຜັດແຫ້ງ', name_en: 'Dried Chili Snack', price: 15000, category: 'appetizer', image: 'https://placehold.co/100x100/dc143c/ffffff?text=Snack' },
  { name_th: 'ໃນຕາເວັນ', name_en: 'Tawan Snack', price: 15000, category: 'appetizer', image: 'https://placehold.co/100x100/ffd700/000000?text=Tawan' },
  { name_th: 'ເຂົ້າໜົມອົມ Halls ແດງ', name_en: 'Red Halls Candy', price: 20000, category: 'appetizer', image: 'https://placehold.co/100x100/ff0000/ffffff?text=Halls' },
  { name_th: 'ເຂົ້າໜົມ ໂຮມມີ້ Homie', name_en: 'Homie Snack', price: 12000, category: 'appetizer', image: 'https://placehold.co/100x100/d2b48c/ffffff?text=Homie' },
  { name_th: 'ຂະໜົມເລ', name_en: 'Lay\'s Snack', price: 18000, category: 'appetizer', image: 'https://placehold.co/100x100/ffd700/000000?text=Lay' },
  { name_th: 'ຂະໜົມນ້ອຍ', name_en: 'Small Snack', price: 5000, category: 'appetizer', image: 'https://placehold.co/100x100/d2b48c/ffffff?text=Snack' },

  // อื่นๆ
  { name_th: 'ລູກຊີ້ນ 5ລູກ', name_en: '5 Meatballs', price: 18000, category: 'others', image: 'https://placehold.co/100x100/a16207/ffffff?text=Meatballs' },
  { name_th: 'ລູກຊີ້ນ 6 ລູກ', name_en: '6 Meatballs', price: 20000, category: 'others', image: 'https://placehold.co/100x100/a16207/ffffff?text=Meatballs' },
  { name_th: 'ລວກຂາລາຍ', name_en: 'Boiled Striped Shank', price: 50000, category: 'others', image: 'https://placehold.co/100x100/a16207/ffffff?text=Boiled' },
  { name_th: 'ລູກຊິ້ນ 10ລູກ', name_en: '10 Meatballs', price: 35000, category: 'others', image: 'https://placehold.co/100x100/a16207/ffffff?text=Meatballs' },
  { name_th: 'ລວກຂາລາຍ ປົນຫຍໍ່', name_en: 'Boiled Striped Shank with Pork Sausage', price: 50000, category: 'others', image: 'https://placehold.co/100x100/a16207/ffffff?text=Boiled' },
  { name_th: 'ລູກຊີ້ນ 14 ລູກ', name_en: '14 Meatballs', price: 49000, category: 'others', image: 'https://placehold.co/100x100/a16207/ffffff?text=Meatballs' },
  { name_th: 'ລູກຊິ້ນ 3 ລູກ', name_en: '3 Meatballs', price: 10000, category: 'others', image: 'https://placehold.co/100x100/a16207/ffffff?text=Meatballs' },
  { name_th: 'ລູກຊີ້ນ 20 ລູກ', name_en: '20 Meatballs', price: 70000, category: 'others', image: 'https://placehold.co/100x100/a16207/ffffff?text=Meatballs' },
];


// --- ฟังก์ชันสำหรับเพิ่มข้อมูลเริ่มต้น ---
async function seedDatabase() {
    const snapshot = await menuCollection.get();
    if (snapshot.empty) {
        console.log('No menu items found. Seeding database...');
        const promises = newMenuData.map(item => menuCollection.add(item));
        await Promise.all(promises);
        console.log('Database seeded successfully!');
    } else {
        console.log('Database already contains data. Skipping seeding.');
    }
}

// 3. Initialize Express App
const app = express();
const PORT = 3000;

// 4. Use Middlewares
app.use(cors());
app.use(bodyParser.json());

// --- API Routes (Endpoints) ที่เชื่อมต่อกับ Firestore ---
app.get('/api/menu', async (req, res) => {
    try {
        const snapshot = await menuCollection.get();
        const menuItems = [];
        snapshot.forEach(doc => {
            menuItems.push({ id: doc.id, ...doc.data() });
        });
        res.json(menuItems);
    } catch (error) {
        console.error("Error fetching menu items: ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

app.post('/api/menu', async (req, res) => {
    try {
        const newItemData = req.body;
        const docRef = await menuCollection.add(newItemData);
        res.status(201).json({ id: docRef.id, ...newItemData });
    } catch (error) {
        console.error("Error adding menu item: ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

app.put('/api/menu/:id', async (req, res) => {
    try {
        const itemId = req.params.id;
        const updatedData = req.body;
        const itemDoc = menuCollection.doc(itemId);
        await itemDoc.update(updatedData);
        res.json({ id: itemId, ...updatedData });
    } catch (error) {
        console.error("Error updating menu item: ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

app.delete('/api/menu/:id', async (req, res) => {
    try {
        const itemId = req.params.id;
        await menuCollection.doc(itemId).delete();
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting menu item: ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

// 5. Start the server
app.listen(PORT, () => {
    console.log(`API Server is running on http://localhost:${PORT}`);
    console.log('Connected to Firebase Firestore');
    // เรียกใช้ฟังก์ชัน seed เมื่อเซิร์ฟเวอร์เริ่มทำงาน
    seedDatabase().catch(console.error);
});
