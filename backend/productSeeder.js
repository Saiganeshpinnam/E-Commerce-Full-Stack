require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  {
    name: "Dining Table",
    description: "Premium wooden dining table with 4 comfortable chairs.",
    price: 20000,
    imageUrl: "https://res.cloudinary.com/dohkwcnvb/image/upload/v1781010926/z7ezb2hz7jbdfhuynm4u.jpg",
    category: "Furniture",
    stock: 10,
    rating: 4.5,
    numReviews: 10,
  },
  {
    name: "Cricket Bat",
    description: "Professional cricket bat suitable for practice and matches.",
    price: 1400,
    imageUrl: "https://res.cloudinary.com/dohkwcnvb/image/upload/v1781010959/uawzzndafvi1r7qn5s9q.jpg",
    category: "Sports",
    stock: 25,
    rating: 3.5,
    numReviews: 8,
  },
  {
    name: "Masterpiece Book",
    description: "Classic English short novel collection for literature lovers.",
    price: 400,
    imageUrl: "https://res.cloudinary.com/dohkwcnvb/image/upload/v1781011006/y55vhay0m8vsc9ujnpwq.jpg",
    category: "Books",
    stock: 50,
    rating: 4.0,
    numReviews: 15,
  },
  {
    name: "Harry Potter Series Books",
    description: "Complete Harry Potter book collection set.",
    price: 1500,
    imageUrl: "https://res.cloudinary.com/dohkwcnvb/image/upload/v1781011032/vebsysy5gbbuzj34rbce.jpg",
    category: "Books",
    stock: 20,
    rating: 5.0,
    numReviews: 30,
  },
  {
    name: "Blue Jeans",
    description: "Comfortable and stylish blue jeans for everyday wear.",
    price: 1250,
    imageUrl: "https://res.cloudinary.com/dohkwcnvb/image/upload/v1781011058/dzv9wcb4o4f3u4qypjte.jpg",
    category: "Clothing",
    stock: 35,
    rating: 4.2,
    numReviews: 12,
  },
  {
    name: "Plain Shirt",
    description: "Formal plain shirt suitable for office and casual use.",
    price: 850,
    imageUrl: "https://res.cloudinary.com/dohkwcnvb/image/upload/v1781011084/f0elfj6b3jtvomgdwbvq.jpg",
    category: "Clothing",
    stock: 40,
    rating: 3.8,
    numReviews: 9,
  },
  {
    name: "Puma Shoes",
    description: "Comfortable sports shoes with modern design.",
    price: 4500,
    imageUrl: "https://res.cloudinary.com/dohkwcnvb/image/upload/v1781011143/shopping_vxmgcn.webp",
    category: "Footwear",
    stock: 18,
    rating: 5.0,
    numReviews: 22,
  },
  {
    name: "Electric Stove",
    description: "Energy-efficient electric stove for modern kitchens.",
    price: 6500,
    imageUrl: "https://res.cloudinary.com/dohkwcnvb/image/upload/v1781011173/xyppo16spn7jswhhrzz2.jpg",
    category: "Home & Kitchen",
    stock: 12,
    rating: 2.0,
    numReviews: 4,
  },
  {
    name: "iPhone 17 Pro Max",
    description: "Latest flagship smartphone with advanced features.",
    price: 50000,
    imageUrl: "https://res.cloudinary.com/dohkwcnvb/image/upload/v1781011206/aeczxqq6mhipggomnmsn.jpg",
    category: "Mobiles",
    stock: 8,
    rating: 3.5,
    numReviews: 18,
  },
  {
    name: "Wireless Headphones",
    description: "Premium wireless headphones with immersive sound quality.",
    price: 5000,
    imageUrl: "https://res.cloudinary.com/dohkwcnvb/image/upload/v1781011238/headphones-displayed-against-dark-background_kmn1kg_aorqzp.jpg",
    category: "Electronics",
    stock: 15,
    rating: 4.0,
    numReviews: 14,
  },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected...');

    // Remove existing products (optional)
    await Product.deleteMany();

    // Insert products
    await Product.insertMany(products);

    console.log('✅ Products seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeder failed:', error.message);
    process.exit(1);
  }
};

seedProducts();