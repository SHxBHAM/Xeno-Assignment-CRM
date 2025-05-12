import fs from "fs";
import { faker } from "@faker-js/faker";
faker.locale = "en";

const NUM_USERS = 2000;
const TARGET_HIGH_SPENDER_COUNT = 300;
const HIGH_SPENDER_THRESHOLD = 10000;

// Fixed product catalog
const PRODUCTS = [
  { id: "p1", name: "Beef Taco", price: 100 },
  { id: "p2", name: "Chicken Burrito", price: 200 },
  { id: "p3", name: "Nachos Supreme", price: 300 },
  { id: "p4", name: "Crunchwrap Supreme", price: 400 },
  { id: "p5", name: "Quesadilla Box", price: 500 },
];

// Generate users
const users = Array.from({ length: NUM_USERS }, () => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  address: {
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode(),
    country: faker.location.country(),
  },
  createdAt: faker.date.past().toISOString(),
}));

// Generate orders per user
const orders = [];
users.forEach((user, index) => {
  let userTotal = 0;
  const userOrders = [];

  // Decide if this is a high spender
  const isHighSpender = index < TARGET_HIGH_SPENDER_COUNT;

  while (true) {
    // Create a shuffled copy of all products to select from
    const availableProducts = [...PRODUCTS].sort(() => Math.random() - 0.5);

    // Determine how many unique items for this order (max is the number of available products)
    const numItems = faker.number.int({
      min: 1,
      max: Math.min(4, availableProducts.length),
    });

    // Take only the first numItems from the shuffled array to ensure uniqueness
    const selectedProducts = availableProducts.slice(0, numItems);

    const items = selectedProducts.map((product) => {
      const quantity = faker.number.int({ min: 1, max: 5 });
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        total: product.price * quantity,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    const order = {
      id: faker.string.uuid(),
      customerId: user.id,
      items,
      totalAmount,
      currency: "USD",
      status: faker.helpers.arrayElement([
        "processing",
        "shipped",
        "delivered",
      ]),
      createdAt: faker.date.recent({ days: 30 }).toISOString(),
    };

    userOrders.push(order);
    userTotal += totalAmount;

    if (isHighSpender && userTotal >= HIGH_SPENDER_THRESHOLD) break;
    if (
      !isHighSpender &&
      userOrders.length >= faker.number.int({ min: 1, max: 4 })
    )
      break;
  }

  orders.push(...userOrders);
});

// Write to JSON files
fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
fs.writeFileSync("orders.json", JSON.stringify(orders, null, 2));
console.log(`✅ Generated ${users.length} users and ${orders.length} orders.`);
