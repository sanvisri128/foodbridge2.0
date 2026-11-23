// Demonstrating Temporal Dead Zone

console.log("Hoisting demonstration");

try {
  console.log(userName);
} catch (error) {
  console.log(error.message);
}

const userName = "FoodBridge User";

console.log(userName);