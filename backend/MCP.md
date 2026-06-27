{
  "mcpServers": {
    "TestSprite": {
      "command": "npx",
      "args": ["@testsprite/testsprite-mcp@latest"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}

cmdc mcp add-json TestSprite '{"command":"npx","args":["-y","@testsprite/testsprite-mcp@latest"],"env":{"API_KEY":"<API_KEY>"},"transport":"stdio"}'


{
  "categoryId": "6a33aeac6cc6fea5f6d3318c",
  "name": "Welch’s Fruit Flavored Snacks, Variety Pack",
  "description": "Fun, fruity snacks with a liquid center burst.",
  "images": ["https://res.cloudinary.com/dp9vvlndo/image/upload/v1781773425/fruit-snacks_qiyqqb.jpg"],
  "originalPrice": 14.82,
  "discountPercent": 34,
  "discountLabel": "Save 34%",
  "unit": "42 ct",
  "stockCount": 5,
  "isActive": true
}

{
  "categoryId": "6a33aeac6cc6fea5f6d3318b",
  "name": "Chobani Extra Creamy Oatmilk",
  "description": "CHOBANI MILK OAT EXTRA CREAMY",
  "images": ["https://res.cloudinary.com/dp9vvlndo/image/upload/v1781518697/products/qkej1c5n0pubtd1m5yst.jpg"],
  "originalPrice": 6.99,
  "discountPercent": 0,
  "discountLabel": "",
  "unit": "52 fl oz",
  "stockCount": 9,
  "isActive": true
}