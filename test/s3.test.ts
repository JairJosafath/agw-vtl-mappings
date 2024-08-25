import { cars } from "./cars";
import { config } from "dotenv";
import * as fs from "fs";

config();

// describe("POST /cars/thumbnail/{key}", () => {
//   const endpoint = process.env.ENDPOINT;

//   cars.forEach((car) => {
//     test(`should upload thumbnail for ${car.brand} ${car.model} successfully`, async () => {
//       try {
//         const key = `${car.brand}/${car.model}/${car.year}/thumb.png`;

//         // Read the image file
//         const imageBuffer = fs.readFileSync(car.PATH);

//         const response = await fetch(`${endpoint}/cars/thumb/${key}`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "image/png",
//           },
//           body: imageBuffer,
//         });

//         expect(response.status).toBe(200);
//       } catch (e) {
//         console.log(e);
//         // fail the test if there's an error
//         expect(e).toBeNull();
//       }
//     });
//   });
// });

describe("GET /cars/thumbnail/{key}", () => {
  const endpoint = process.env.ENDPOINT;

  cars.forEach((car) => {
    test(`should get thumbnail for ${car.brand} ${car.model} successfully`, async () => {
      try {
        const key = `${car.brand}/${car.model}/${car.year}/thumb.png`;
        const localpath = `${car.brand}_${car.model}_${car.year}_thumb.png`;

        const response = await fetch(`${endpoint}/cars/thumb/${key}`);

        // save the image to the disk in downloaded
        const data = await response.arrayBuffer();
        fs.writeFileSync(`test/downloaded/${localpath}`, Buffer.from(data));

        expect(response.status).toBe(200);
      } catch (e) {
        console.log(e);
        // fail the test if there's an error
        expect(e).toBeNull();
      }
    });
  });
});
