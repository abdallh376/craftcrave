const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Item = require('./models/Item'); // تأكد إن مسار الموديل عندك مظبوط

dotenv.config();
const sampleItems = [
  // 🍔 Burgers (17 منتج)
  { name: 'Classic Beef Burger', price: 8.99, category: 'Burgers', description: 'Juicy beef patty with fresh lettuce, tomatoes, and special sauce.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
  { name: 'Double Cheeseburger', price: 11.99, category: 'Burgers', description: 'Double beef patties with extra melted cheddar cheese and pickles.', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500' },
  { name: 'Crispy Chicken Burger', price: 9.49, category: 'Burgers', description: 'Golden fried chicken breast with creamy mayo and crisp lettuce.', image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500' },
  { name: 'Bacon BBQ Burger', price: 12.49, category: 'Burgers', description: 'Smoked bacon, crispy onion rings, and smoky BBQ sauce.', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500' },
  { name: 'Mushroom Swiss Burger', price: 10.99, category: 'Burgers', description: 'Sautéed mushrooms and rich Swiss cheese on a grilled patty.', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500' },
  { name: 'Spicy Jalapeno Burger', price: 10.49, category: 'Burgers', description: 'Loaded with fresh jalapeños, pepper jack cheese, and spicy mayo.', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500' },
  { name: 'Avocado Chicken Burger', price: 11.29, category: 'Burgers', description: 'Grilled chicken breast topped with fresh sliced avocado.', image: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=500' },
  { name: 'Truffle Burger', price: 14.99, category: 'Burgers', description: 'Premium beef patty infused with truffle oil and gourmet cheese.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
  { name: 'Smash Burger', price: 9.99, category: 'Burgers', description: 'Crispy-edged smashed beef patties with American cheese and onions.', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500' },
  { name: 'Blue Cheese Burger', price: 11.79, category: 'Burgers', description: 'Tangy blue cheese crumbles and caramelized onions.', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500' },
  { name: 'Big Tower Burger', price: 15.99, category: 'Burgers', description: 'Triple patties, onion rings, bacon, and cheddar sauce.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
  { name: 'Garlic Butter Burger', price: 10.29, category: 'Burgers', description: 'Drenched in rich garlic herb butter with swiss cheese.', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500' },
  { name: 'Zinger Supreme Burger', price: 10.99, category: 'Burgers', description: 'Extra crispy spicy chicken fillet with coleslaw salad.', image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500' },
  { name: 'Egg & Beef Burger', price: 10.79, category: 'Burgers', description: 'Classic beef patty topped with a sunny-side-up fried egg.', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500' },
  { name: 'Slider Trio', price: 13.99, category: 'Burgers', description: 'Three mini burgers: Classic, Cheese, and BBQ.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
  { name: 'Smokehouse Burger', price: 12.99, category: 'Burgers', description: 'Smoked Gouda, bacon jam, and chipotle mayo.', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500' },
  { name: 'Simple Kid Burger', price: 6.99, category: 'Burgers', description: 'Plain beef patty with mild cheese and ketchup.', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500' },

  // 🍕 Pizza (17 منتج)
  { name: 'Pepperoni Supreme Pizza', price: 13.99, category: 'Pizza', description: 'Loaded with double spicy pepperoni and mozzarella cheese.', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500' },
  { name: 'Margherita Pizza', price: 9.99, category: 'Pizza', description: 'Classic Italian pizza with fresh basil, mozzarella, and tomatoes.', image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500' },
  { name: 'BBQ Chicken Pizza', price: 12.99, category: 'Pizza', description: 'Grilled chicken, red onions, cilantro, and tangy BBQ sauce.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
  { name: 'Four Cheese Pizza', price: 11.99, category: 'Pizza', description: 'Blend of mozzarella, parmesan, gorgonzola, and provolone.', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500' },
  { name: 'Vegetarian Garden Pizza', price: 10.99, category: 'Pizza', description: 'Bell peppers, mushrooms, olives, onions, and sweet corn.', image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500' },
  { name: 'Meat Lovers Pizza', price: 14.49, category: 'Pizza', description: 'Pepperoni, sausage, ground beef, bacon, and ham.', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500' },
  { name: 'Hawaiian Luau Pizza', price: 11.49, category: 'Pizza', description: 'Sweet pineapple chunks, smoked ham, and extra cheese.', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500' },
  { name: 'Spicy Buffalo Pizza', price: 12.49, category: 'Pizza', description: 'Buffalo chicken strips, blue cheese drizzle, and green onions.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
  { name: 'Mushroom Truffle Pizza', price: 15.49, category: 'Pizza', description: 'Wild mushrooms, truffle cream base, and arugula.', image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500' },
  { name: 'Seafood Special Pizza', price: 16.99, category: 'Pizza', description: 'Shrimp, calamari, garlic oil, and fresh herbs.', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500' },
  { name: 'Mexican Fiesta Pizza', price: 13.49, category: 'Pizza', description: 'Spicy beef, jalapeños, nacho chips, and salsa sauce.', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500' },
  { name: 'Super Supreme Pizza', price: 14.99, category: 'Pizza', description: 'Everything loaded: meats, veggies, and extra mozzarella.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
  { name: 'White Garlic Pizza', price: 10.49, category: 'Pizza', description: 'Garlic ricotta sauce, spinach, and crispy bacon.', image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500' },
  { name: 'Hot Honey Pepperoni', price: 13.29, category: 'Pizza', description: 'Pepperoni drizzled with organic sweet hot honey.', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500' },
  { name: 'Calzone Folded Pizza', price: 12.19, category: 'Pizza', description: 'Folded pizza stuffed with ricotta, ham, and melted cheese.', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500' },
  { name: 'Ranch Chicken Pizza', price: 12.79, category: 'Pizza', description: 'Creamy ranch base, grilled chicken, and bacon bits.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
  { name: 'Classic Cheese Pizza', price: 8.99, category: 'Pizza', description: 'Pure rich tomato sauce and double mozzarella layer.', image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500' },

  // 🍝 Pasta (16 منتج)
  { name: 'Creamy Alfredo Pasta', price: 11.49, category: 'Pasta', description: 'Fettuccine pasta tossed in rich parmesan and garlic cream sauce.', image: 'https://images.unsplash.com/photo-1645112411341-6c4fd0237146?w=500' },
  { name: 'Spaghetti Bolognese', price: 11.99, category: 'Pasta', description: 'Traditional Italian spaghetti with slow-cooked rich beef sauce.', image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281297?w=500' },
  { name: 'Penne Arrabiata', price: 9.99, category: 'Pasta', description: 'Penne pasta in a fiery spicy garlic tomato sauce with basil.', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500' },
  { name: 'Seafood Marinara Pasta', price: 15.99, category: 'Pasta', description: 'Shrimp, mussels, and calamari tossed in rich tomato marinara.', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500' },
  { name: 'Pesto Chicken Pasta', price: 12.49, category: 'Pasta', description: 'Fresh basil pesto sauce with grilled chicken breast and pine nuts.', image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281297?w=500' },
  { name: 'Baked Lasagna', price: 13.99, category: 'Pasta', description: 'Layered pasta sheets with ground beef, béchamel, and mozzarella.', image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500' },
  { name: 'Carbonara Royale', price: 12.99, category: 'Pasta', description: 'Spaghetti with crispy pancetta, egg yolk, and pecorino cheese.', image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500' },
  { name: 'Mushroom Stroganoff Pasta', price: 11.79, category: 'Pasta', description: 'Rich mushroom creamy sauce served over fettuccine noodles.', image: 'https://images.unsplash.com/photo-1645112411341-6c4fd0237146?w=500' },
  { name: 'Four Cheese Mac & Cheese', price: 10.49, category: 'Pasta', description: 'Baked macaroni pasta drenched in 4 types of melted cheese.', image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=500' },
  { name: 'Pink Sauce Pasta', price: 11.29, category: 'Pasta', description: 'Perfect blend of creamy alfredo and rich tomato marinara.', image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281297?w=500' },
  { name: 'Cajun Chicken Pasta', price: 12.79, category: 'Pasta', description: 'Spicy cajun seasoned chicken with bell peppers and cream.', image: 'https://images.unsplash.com/photo-1645112411341-6c4fd0237146?w=500' },
  { name: 'Truffle Mushroom Pasta', price: 14.99, category: 'Pasta', description: 'Wild mushrooms infused with luxurious truffle cream sauce.', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500' },
  { name: 'Shrimp Scampi Pasta', price: 14.49, category: 'Pasta', description: 'Garlic butter white wine sauce tossed with juicy jumbo shrimp.', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500' },
  { name: 'Vegetable Primavera Pasta', price: 10.19, category: 'Pasta', description: 'Seasonal fresh veggies tossed in garlic olive oil sauce.', image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281297?w=500' },
  { name: 'Meatball Feast Pasta', price: 12.99, category: 'Pasta', description: 'Spaghetti served with giant homemade Italian beef meatballs.', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500' },
  { name: 'Cheesy Ravioli', price: 13.49, category: 'Pasta', description: 'Cheese-stuffed ravioli pockets in rich tomato basil sauce.', image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500' }
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Item.deleteMany(); // مسح القديم لو حابب تبدأ من نظيف
    await Item.insertMany(sampleItems);
    console.log('Data Imported Successfully! 🚀');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();