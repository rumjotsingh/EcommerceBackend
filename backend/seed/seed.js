import mongoose from "mongoose";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import { faker } from "@faker-js/faker";
import slugify from "slugify";
import dotenv from "dotenv";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL);

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await categoryModel.deleteMany({});
    await productModel.deleteMany({});
    console.log("✓ Cleared existing data");

    // Create 20 categories
    const categories = [];
    const categoryNames = [
      "Electronics",
      "Clothing",
      "Shoes",
      "Books",
      "Home & Kitchen",
      "Sports",
      "Toys",
      "Beauty",
      "Jewelry",
      "Automotive",
      "Health",
      "Grocery",
      "Pet Supplies",
      "Garden",
      "Tools",
      "Music",
      "Movies",
      "Baby Products",
      "Office Supplies",
      "Furniture",
    ];

    for (let i = 0; i < 20; i++) {
      const categoryName = categoryNames[i];
      categories.push({
        name: categoryName,
        slug: slugify(categoryName, { lower: true }),
      });
    }

    const createdCategories = await categoryModel.insertMany(categories);
    console.log("✓ Created 20 categories");

    // Create 100 products
    const products = [];

    console.log("Creating products with images...");

    for (let i = 0; i < 100; i++) {
      const productName = faker.commerce.productName();
      const randomCategory =
        createdCategories[Math.floor(Math.random() * createdCategories.length)];

      // Generate a simple placeholder image buffer
      const imageUrl = `https://picsum.photos/seed/${i}/400/400`;

      // Fetch image and convert to buffer
      const imageBuffer = await new Promise((resolve) => {
        https
          .get(imageUrl, (response) => {
            const chunks = [];
            response.on("data", (chunk) => chunks.push(chunk));
            response.on("end", () => resolve(Buffer.concat(chunks)));
          })
          .on("error", () => {
            // Fallback to simple buffer if image fetch fails
            resolve(Buffer.from("fake-product-image"));
          });
      });

      products.push({
        name: productName,
        slug: slugify(productName, { lower: true }),
        description: faker.commerce.productDescription(),
        price: faker.number.int({ min: 99, max: 9999 }),
        category: randomCategory._id,
        quantity: faker.number.int({ min: 5, max: 100 }),
        shipping: faker.datatype.boolean(),
        photo: {
          data: imageBuffer,
          contentType: "image/jpeg",
        },
      });

      // Progress indicator
      if ((i + 1) % 20 === 0) {
        console.log(`  Created ${i + 1}/100 products...`);
      }
    }

    await productModel.insertMany(products);
    console.log("✓ Created 100 products with images");

    console.log("🎉 Database seeding completed successfully!");
    console.log(`   - 20 categories created`);
    console.log(`   - 100 products created`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
