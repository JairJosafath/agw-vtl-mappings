import { vtlSerializer } from "../lib/util/vtlSerializer";

test('vtl serializer removes the unneccesarry "" marks around the values of specified keys', () => {
  const serialized = vtlSerializer(
    {
      SS: "$input.path('$.colors')",
      S: "$input.path('$.colors2')",
    },
    ["SS"]
  );
  console.log(serialized);
  expect(serialized.includes("\"$input.path('$.colors')\"")).toBe(false);
});
