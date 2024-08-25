import { cars } from "./cars";
import { config } from "dotenv";
config();

const endpoint = process.env.ENDPOINT;

/*
describe("POST /cars", () => {
  cars.forEach((car) => {
    test(`should add ${car.brand} ${car.model} successfully`, async () => {
      try {
        const response = await fetch(`${endpoint}/cars`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(car),
        });
        const data = await response.json();
        console.log(data);
        expect(response.status).toBe(200);
      } catch (e) {
        console.log(e);
        // fail the test if there's an error
        expect(e).toBeNull();
      }
    });
  });
});
*/
describe("GET /cars", () => {
  test("should get cars by brand", async () => {
    try {
      const response = await fetch(`${endpoint}/cars?brand=Toyota`);
      const data = await response.json();
      console.log({ carsByBrand: JSON.stringify(data) });
      expect(response.status).toBe(200);
    } catch (e) {
      console.log(e);
      // fail the test if there's an error
      expect(e).toBeNull();
    }
  });
  test("should get cars by year", async () => {
    try {
      const response = await fetch(
        `${endpoint}/cars?indexName=CarsByYear&key=Year&value=2020`
      );
      const data = await response.json();
      console.log({ carsByYear: JSON.stringify(data) });

      expect(response.status).toBe(200);
    } catch (e) {
      console.log(e);
      // fail the test if there's an error
      expect(e).toBeNull();
    }
  });
});
